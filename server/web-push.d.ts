declare module "web-push" {
  export interface PushSubscription {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }

  export interface RequestOptions {
    urgency?: "very-low" | "low" | "normal" | "high";
    TTL?: number;
  }

  export function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  export function generateVAPIDKeys(): { publicKey: string; privateKey: string };
  export function sendNotification(
    subscription: PushSubscription,
    payload: string | Buffer | null,
    options?: RequestOptions
  ): Promise<void>;
}
