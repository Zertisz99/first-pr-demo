import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getClubByAdminId } from "@/lib/clubs";
import EditClubForm from "@/components/club/EditClubForm";

export default async function EditClubProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "club") {
    redirect("/discover");
  }

  const club = await getClubByAdminId(session.user.id);
  if (!club) redirect("/discover");

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
        Edit club profile
      </h1>
      <p className="mt-2 mb-8 font-body text-sm text-fg-muted">
        This is what coaches and scouts see about your club.
      </p>
      <EditClubForm club={club} />
    </div>
  );
}
