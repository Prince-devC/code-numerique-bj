"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
  }, [theme, mounted]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <HeroUIProvider>
        <ThemeSync>{children}</ThemeSync>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
