import { Link, Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="auth-theme min-h-dvh bg-gradient-to-br from-auth-background-from to-auth-background-to lg:bg-none wide:flex wide:h-dvh wide:items-stretch wide:justify-center wide:bg-muted wide:p-12">
      <div className="grid min-h-dvh lg:grid-cols-2 wide:min-h-0 wide:w-full wide:max-w-8xl wide:overflow-hidden wide:rounded-3xl wide:shadow-2xl">
        <div className="hidden bg-gradient-to-br from-auth-background-from to-auth-background-to p-10 lg:block">
          <Link to="/">
            <img src="/stepupmark-logo.png" alt="stepupmark" className="h-8 w-auto" />
          </Link>
        </div>

        <div className="flex flex-col px-4 py-8 sm:px-8 lg:bg-background">
          <Link to="/" className="lg:hidden">
            <img src="/stepupmark-logo.png" alt="stepupmark" className="h-8 w-auto" />
          </Link>

          <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-sm">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
