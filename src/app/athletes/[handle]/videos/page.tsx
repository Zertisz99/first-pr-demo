import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAthleteVideos } from "@/lib/videos";
import { auth } from "@/auth";
import SportTheme from "@/components/SportTheme";
import UploadVideoForm from "@/components/athlete/UploadVideoForm";
import VideoDashboardGrid from "@/components/athlete/VideoDashboardGrid";

export default async function AthleteVideosPage(
  props: PageProps<"/athletes/[handle]/videos">
) {
  const { handle } = await props.params;
  const [athlete, session] = await Promise.all([
    prisma.athlete.findUnique({ where: { handle }, select: { id: true, userId: true, sport: true } }),
    auth(),
  ]);

  if (!athlete) notFound();
  if (!session?.user || session.user.id !== athlete.userId) {
    redirect(`/athletes/${handle}`);
  }

  const videos = await getAthleteVideos(athlete.id);

  return (
    <SportTheme sport={athlete.sport}>
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-fg">
          My videos
        </h1>
        <p className="mt-1 mb-8 font-body text-sm text-fg-muted">
          Upload training or match footage, mark your best clips as highlights, and
          control who can see each one.
        </p>

        <div className="mb-10">
          <UploadVideoForm handle={handle} />
        </div>

        <VideoDashboardGrid handle={handle} videos={videos} />
      </div>
    </SportTheme>
  );
}
