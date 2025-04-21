declare global {
  interface Window {
    google: any;
    __GOOGLE_MAPS_INITIALIZED__?: boolean;
    initMap?: () => void;
  }
}

export {};