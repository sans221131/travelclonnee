// lib/lottie-loader.ts
import lottie from "lottie-web";

export interface LottieConfig {
  container: HTMLElement;
  path: string;
  renderer?: "svg" | "canvas" | "html";
  loop?: boolean;
  autoplay?: boolean;
  rendererSettings?: {
    preserveAspectRatio?: string;
    clearCanvas?: boolean;
    progressiveLoad?: boolean;
  };
}

// ADD: tiny utility for iOS detection that works on iOS 13+ iPads too
function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const platform = (navigator as any).platform || "";
  const iOS = /iPad|iPhone|iPod/.test(platform) || /iPad|iPhone|iPod/.test(ua);
  const macTouch =
    /Mac/.test(platform) && (navigator as any).maxTouchPoints > 2;
  return iOS || macTouch;
}

export function loadLottieAnimation(config: LottieConfig) {
  const useCanvas = isIOS(); // canvas is much more stable for big image sequences on iOS

  return lottie.loadAnimation({
    renderer: useCanvas ? "canvas" : "svg",
    loop: false,
    autoplay: false,
    ...config,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
      clearCanvas: true,
      progressiveLoad: true, // avoid big decode spikes
      ...config.rendererSettings,
    },
  });
}