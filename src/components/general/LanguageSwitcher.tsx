"use client";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (locale: string) => {
    const segments = pathname.split("/");
    segments[1] = locale;
    const newPathname = segments.join("/");
    router.push(newPathname);
  };

  return (
    <div>
      <button onClick={() => switchLanguage("en")}>en</button>
      <button onClick={() => switchLanguage("ru")}>ру</button>
      <button onClick={() => switchLanguage("kz")}>кк</button>
    </div>
  );
}
