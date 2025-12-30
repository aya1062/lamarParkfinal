/// <reference types="vite/client" />

declare global {
  interface Window {
    gtag_report_conversion?: (url?: string) => boolean;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export {};
