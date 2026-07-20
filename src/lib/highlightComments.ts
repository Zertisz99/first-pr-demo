import { prisma } from "@/lib/db";

export type HighlightCommentEntry = {
  id: string;
  comment: string;
  createdAt: string;
  userName: string;
};

export async function getHighlightComments(
  highlightIds: string[]
): Promise<Record<string, HighlightCommentEntry[]>> {
  const result: Record<string, HighlightCommentEntry[]> = {};
  for (const id of highlightIds) result[id] = [];
  if (highlightIds.length === 0) return result;

  const rows = await prisma.highlightComment.findMany({
    where: { highlightVideoId: { in: highlightIds } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  for (const row of rows) {
    result[row.highlightVideoId].push({
      id: row.id,
      comment: row.comment,
      createdAt: row.createdAt.toISOString().slice(0, 10),
      userName: row.user.name,
    });
  }

  return result;
}
