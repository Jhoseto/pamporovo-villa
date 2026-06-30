import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import {
  extensionFromFileName,
  extensionFromMime,
  isAllowedNotificationSoundExt,
  NOTIFICATION_SOUND_MAX_BYTES,
  type NotificationSoundExtension,
} from "@shared/notificationSound";
import { dataDirPath } from "./_core/paths";

export function notificationSoundsDir(): string {
  return dataDirPath("notification-sounds");
}

export function customSoundFilePath(token: string, ext: NotificationSoundExtension): string {
  return path.join(notificationSoundsDir(), `${token}.${ext}`);
}

export async function ensureNotificationSoundsDir(): Promise<void> {
  await fs.mkdir(notificationSoundsDir(), { recursive: true });
}

export function parseUploadInput(input: {
  fileName: string;
  mimeType: string;
  dataBase64: string;
}): { buffer: Buffer; ext: NotificationSoundExtension } {
  const ext = extensionFromFileName(input.fileName) ?? extensionFromMime(input.mimeType);
  if (!ext) {
    throw new Error("Неподдържан формат. Използвайте WAV, MP3, OGG, WEBM или M4A");
  }

  const base64 = input.dataBase64.includes(",") ? input.dataBase64.split(",").pop()! : input.dataBase64;
  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length) {
    throw new Error("Празен аудио файл");
  }
  if (buffer.length > NOTIFICATION_SOUND_MAX_BYTES) {
    throw new Error("Файлът е твърде голям (макс. 512 KB)");
  }

  return { buffer, ext };
}

export async function saveCustomNotificationSound(
  token: string,
  ext: NotificationSoundExtension,
  buffer: Buffer
): Promise<void> {
  await ensureNotificationSoundsDir();
  await fs.writeFile(customSoundFilePath(token, ext), buffer);
}

export async function deleteCustomNotificationSound(
  token: string | null | undefined,
  ext: string | null | undefined
): Promise<void> {
  if (!token || !ext || !isAllowedNotificationSoundExt(ext)) return;
  try {
    await fs.unlink(customSoundFilePath(token, ext));
  } catch {
    /* ignore missing file */
  }
}

export function createNotificationSoundToken(): string {
  return nanoid(32);
}
