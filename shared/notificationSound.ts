export const DEFAULT_NOTIFICATION_SOUND_URL = "/admin/sounds/notification-default.wav";

export const NOTIFICATION_SOUND_MAX_BYTES = 512 * 1024;

export const NOTIFICATION_SOUND_EXTENSIONS = ["wav", "mp3", "ogg", "webm", "m4a"] as const;

export type NotificationSoundExtension = (typeof NOTIFICATION_SOUND_EXTENSIONS)[number];

const MIME_TO_EXT: Record<string, NotificationSoundExtension> = {
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
};

export function extensionFromMime(mimeType: string): NotificationSoundExtension | null {
  const normalized = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  return MIME_TO_EXT[normalized] ?? null;
}

export function extensionFromFileName(fileName: string): NotificationSoundExtension | null {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return (NOTIFICATION_SOUND_EXTENSIONS as readonly string[]).includes(ext)
    ? (ext as NotificationSoundExtension)
    : null;
}

export function isAllowedNotificationSoundExt(ext: string): ext is NotificationSoundExtension {
  return (NOTIFICATION_SOUND_EXTENSIONS as readonly string[]).includes(ext);
}

export function customNotificationSoundUrl(
  token: string,
  ext: NotificationSoundExtension
): string {
  return `/admin/notification-sound/${token}.${ext}`;
}

export function resolveNotificationSoundUrl(input: {
  notificationSoundToken?: string | null;
  notificationSoundExt?: string | null;
}): string {
  const token = input.notificationSoundToken?.trim();
  const ext = input.notificationSoundExt?.trim().toLowerCase();
  if (token && ext && isAllowedNotificationSoundExt(ext)) {
    return customNotificationSoundUrl(token, ext);
  }
  return DEFAULT_NOTIFICATION_SOUND_URL;
}
