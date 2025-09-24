// components/sections/SectionHeader.tsx
"use client";

import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  id?: string;
}

export function SectionHeader({
  title,
  subtitle,
  align = "center",
  tone = "light",
  className,
  id,
}: SectionHeaderProps) {
  const isCenter = align === "center";
  const titleColor = tone === "light" ? "text-white" : "text-zinc-900";
  const subColor = tone === "light" ? "text-white/70" : "text-zinc-600";

  return (
    <header
      className={[isCenter ? "text-center" : "text-left", className || ""].join(
        " "
      )}
    >
      <h2
        id={id}
        className={[
          "font-semibold tracking-tight",
          // Responsive, consistent scale
          "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
          titleColor,
        ].join(" ")}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={[
            "mt-2",
            // Consistent subtitle sizes
            "text-base sm:text-xl lg:text-2xl",
            subColor,
            isCenter ? "mx-auto" : "",
            "max-w-2xl",
          ].join(" ")}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}

export default SectionHeader;
