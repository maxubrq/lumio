"use client";

import { useChangeLocale, useCurrentLocale } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LocaleSwitcher() {
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-5 w-5 text-gray-600" />
      <div className="flex border-2 border-black rounded-md overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 py-1 font-bold ${
            currentLocale === "en"
              ? "bg-blue-300 text-black"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => changeLocale("en")}
        >
          EN
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`px-3 py-1 font-bold ${
            currentLocale === "vi"
              ? "bg-blue-300 text-black"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => changeLocale("vi")}
        >
          VI
        </Button>
      </div>
    </div>
  );
} 