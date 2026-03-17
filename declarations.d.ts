declare module "*.css";

// Facebook Pixel
interface Window {
  fbq: (
    action: string,
    eventName: string,
    params?: Record<string, unknown>,
  ) => void;
  _fbq: unknown;
}
