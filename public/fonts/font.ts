import localFont from "next/font/local";

export const dunbarText = localFont({
  // Using local files in this folder
  src: [
    { path: "./dunbar-text-regular.woff2", weight: "400", style: "normal" },
    { path: "./dunbar-text-regular.woff", weight: "400", style: "normal" },
  ],
  display: "swap",
  variable: "--font-dunbar-text",
  fallback: [
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Arial",
    "sans-serif",
  ],
});
