import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LogInForm from "@/components/auth/LogInForm";

export default async function LogInPage() {
  const session = await auth();
  if (session?.user) redirect("/discover");

  return (
    <div className="mx-auto max-w-md px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
        Log in
      </h1>
      <p className="mt-2 mb-8 font-body text-sm text-fg-muted">
        New to Athleticore?{" "}
        <Link
          href="/signup"
          className="font-semibold text-fg underline underline-offset-2"
        >
          Create an account
        </Link>
      </p>
      <LogInForm />
    </div>
  );
}
