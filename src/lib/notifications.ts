import { prisma } from "@/lib/db";
import type { NotificationType } from "@/generated/prisma/client";

export type NotificationEntry = {
  id: string;
  type: NotificationType;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
  senderId: string | null;
  senderName: string | null;
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getNotifications(
  userId: string,
  limit = 20
): Promise<NotificationEntry[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { sender: { select: { id: true, name: true } } },
  });

  return rows.map((n) => ({
    id: n.id,
    type: n.type,
    message: n.message,
    link: n.link,
    read: n.read,
    createdAt: toDateKey(n.createdAt),
    senderId: n.sender?.id ?? null,
    senderName: n.sender?.name ?? null,
  }));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function notifyUsers(
  userIds: string[],
  type: NotificationType,
  message: string,
  options?: { link?: string; senderId?: string }
): Promise<void> {
  const uniqueIds = Array.from(new Set(userIds));
  if (uniqueIds.length === 0) return;

  await prisma.notification.createMany({
    data: uniqueIds.map((userId) => ({
      userId,
      type,
      message,
      link: options?.link ?? null,
      senderId: options?.senderId ?? null,
    })),
  });
}
