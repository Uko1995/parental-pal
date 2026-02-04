declare module "*.css";

// Facebook Pixel
interface Window {
  fbq: (
    action: string,
    eventName: string,
    params?: Record<string, any>,
  ) => void;
  _fbq: any;
}
