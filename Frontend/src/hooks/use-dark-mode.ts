import { useEffect, useState } from "react";

export default function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const initialMode = localStorage.getItem("theme");
    const dark = initialMode === "dark";

    setIsDark(dark);
    root.classList.toggle("dark", dark);
  }, []);

  const toggleDarkMode = () => {
    const root = window.document.documentElement;
    const isDarkNow = !isDark;

    root.classList.toggle("dark", isDarkNow);
    localStorage.setItem("theme", isDarkNow ? "dark" : "light");
    setIsDark(isDarkNow);
  };

  return { isDark, toggleDarkMode };
}

