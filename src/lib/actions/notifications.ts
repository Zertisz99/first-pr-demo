"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notifyUsers } from "@/lib/notifications";

export type ActionState = { error?: string } | undefined;

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const notificationId = String(formData.get("notificationId") ?? "");
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification || notification.userId !== session.user.id) return;

  await prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/notifications");
}

export async function replyToNotificationAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You need to be logged in to do that." };

  const notificationId = String(formData.get("notificationId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { error: "Write a reply." };

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification || notification.userId !== session.user.id) {
    return { error: "Notification not found." };
  }
  if (!notification.senderId) {
    return { error: "This notification can't be replied to." };
  }

  await notifyUsers(
    [notification.senderId],
    "reply",
    `${session.user.name} replied: ${message}`,
    { link: "/notifications", senderId: session.user.id }
  );

  revalidatePath("/notifications");
}
