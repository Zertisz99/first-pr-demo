import { notFound, redirect } from "next/navigation";
import { getAthlete } from "@/lib/athletes";
import { auth } from "@/auth";
import EditAthleteForm from "@/components/athlete/EditAthleteForm";

export default async function EditAthleteProfilePage(
  props: PageProps<"/athletes/[handle]/edit">
) {
  const { handle } = await props.params;
  const [athlete, session] = await Promise.all([getAthlete(handle), auth()]);

  if (!athlete) notFound();
  if (!session?.user || session.user.id !== athlete.userId) {
    redirect(`/athletes/${handle}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
        Edit your profile
      </h1>
      <p className="mt-2 mb-8 font-body text-sm text-fg-muted">
        This is what clubs and scouts see on your public profile.
      </p>
      <EditAthleteForm athlete={athlete} />
    </div>
  );
}
