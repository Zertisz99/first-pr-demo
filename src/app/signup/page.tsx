import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignUpForm from "@/components/auth/SignUpForm";

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) redirect("/discover");

  return (
    <div className="mx-auto max-w-md px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
        Create your account
      </h1>
      <p className="mt-2 mb-8 font-body text-sm text-fg-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-fg underline underline-offset-2"
        >
          Log in
        </Link>
      </p>
      <SignUpForm />
    </div>
  );
}
