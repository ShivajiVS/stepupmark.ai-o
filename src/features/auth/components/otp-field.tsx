import { useEffect, useState } from "react";

import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { Button } from "~/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/components/ui/input-otp";

const RESEND_COOLDOWN_SECONDS = 30;

const OTP_SLOT_INDEXES = [0, 1, 2, 3, 4, 5] as const;

// Individually boxed with a gap and a filled ground, rather than shadcn's default
// joined-pill look (adjacent slots sharing hairline borders on a plain white
// background, easy to lose against a light card). Overriding via className here
// rather than editing input-otp.tsx keeps that file diffable against upstream.
const OTP_SLOT_CLASSNAME =
  "h-11 w-11 rounded-lg border-2 border-input bg-muted/70 text-lg font-semibold shadow-sm first:rounded-lg last:rounded-lg data-[active=true]:border-auth-ring data-[active=true]:bg-background data-[active=true]:shadow-md data-[active=true]:ring-auth-ring/30";

type OtpFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  onResend: () => void;
  resendPending?: boolean;
};

export function OtpField<TFieldValues extends FieldValues>({
  control,
  name,
  onResend,
  resendPending,
}: OtpFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Verification code</FormLabel>
          <FormControl>
            <InputOTP maxLength={6} containerClassName="justify-center" {...field}>
              <InputOTPGroup className="gap-2">
                {OTP_SLOT_INDEXES.map((index) => (
                  <InputOTPSlot key={index} index={index} className={OTP_SLOT_CLASSNAME} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </FormControl>
          <FormMessage />
          <OtpFieldFooter onResend={onResend} resendPending={resendPending ?? false} />
        </FormItem>
      )}
    />
  );
}

type OtpFieldFooterProps = {
  onResend: () => void;
  resendPending?: boolean;
};

function OtpFieldFooter({ onResend, resendPending }: OtpFieldFooterProps) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  // Tracks wall-clock time, an external system, so a ticking interval is the
  // correct tool here rather than a value derived at render.
  useEffect(() => {
    const id = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, []);

  const handleResend = () => {
    onResend();
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const resendReady = cooldown === 0 && resendPending !== true;

  return (
    <p className="text-center text-sm text-muted-foreground">
      Didn&apos;t get a code?{" "}
      <Button
        type="button"
        variant="link"
        className="h-auto p-0 align-baseline"
        disabled={!resendReady}
        onClick={handleResend}
      >
        {resendPending === true
          ? "Resending…"
          : cooldown > 0
            ? `Resend in ${String(cooldown)}s`
            : "Resend code"}
      </Button>
    </p>
  );
}
