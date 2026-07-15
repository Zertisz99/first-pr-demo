"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

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
