import { useCallback, useEffect, useRef } from "react";
import { DEFAULT_NOTIFICATION_SOUND_URL } from "@shared/notificationSound";

const SW_MESSAGE_TYPE = "PLAY_NOTIFICATION_SOUND";

let activeAudio: HTMLAudioElement | null = null;

export function playNotificationSound(url: string): void {
  try {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio = null;
    }
    const audio = new Audio(url);
    audio.volume = 1;
    activeAudio = audio;
    void audio.play().catch(() => undefined);
    audio.onended = () => {
      if (activeAudio === audio) activeAudio = null;
    };
  } catch {
    /* ignore playback errors */
  }
}

export function useNotificationSoundListener() {
  const enabledRef = useRef(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      if (!enabledRef.current) return;
      const data = event.data as { type?: string; url?: string } | null;
      if (data?.type !== SW_MESSAGE_TYPE || !data.url) return;
      playNotificationSound(data.url);
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  const preview = useCallback((url?: string) => {
    playNotificationSound(url || DEFAULT_NOTIFICATION_SOUND_URL);
  }, []);

  return { preview };
}
