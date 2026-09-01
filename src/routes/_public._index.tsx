import { Link } from "react-router";

import { motion } from "motion/react";

import { Button } from "~/components/ui/button";

export function meta() {
  return [
    { title: "stepupmark" },
    { name: "description", content: "A production React foundation." },
  ];
}

export default function HomeRoute() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="max-w-2xl space-y-6"
    >
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        A foundation that stays maintainable
      </h1>
      <p className="text-lg text-pretty text-muted-foreground">
        Server-rendered routing, cached server state, validated boundaries and a design system that
        other engineers can extend without guessing.
      </p>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link to="/register">Get started</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/sign-in">Sign in</Link>
        </Button>
      </div>
    </motion.div>
  );
}
