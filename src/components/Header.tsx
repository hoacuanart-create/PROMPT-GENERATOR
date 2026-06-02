import React from "react";
import { Sparkles, RefreshCw, Layers } from "lucide-react";
import { motion } from "motion/react";
import { TRANSLATIONS } from "../translations";

interface HeaderProps {
  onReset: () => void;
  isLoading: boolean;
  hasInput: boolean;
  language: "en" | "vi";
  onLanguageChange: (lang: "en" | "vi") => void;
}

export default function Header({ onReset, isLoading, hasInput, language, onLanguageChange }: HeaderProps) {
  const t = TRANSLATIONS[language];
  return (
    <header className="h-16 flex items-center justify-between px-6 sm:px-8 bg-stone-950/80 backdrop-blur-md border-b border-white/10 text-white z-50 shrink-0 select-none">
      <div className="flex items-center gap-3">
        <motion.div 
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md shadow-black/5"
        >
          <Layers className="w-5 h-5 text-[#FF5D00]" />
        </motion.div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-1">
            {t.appName}<span className="font-light opacity-80"> {t.appSubName}</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Language switcher */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-0.5 rounded-full select-none">
          <button
            type="button"
            onClick={() => onLanguageChange("en")}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              language === "en"
                ? "bg-[#FF5D00] text-white shadow"
                : "text-white/50 hover:text-white"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange("vi")}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              language === "vi"
                ? "bg-[#FF5D00] text-white shadow"
                : "text-white/50 hover:text-white"
            }`}
          >
            VI
          </button>
        </div>

        <div className="hidden xs:flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-95 text-white/90">
            {language === "en" ? "Gemini Active" : "Trợ lý Gemini"}
          </span>
        </div>

        {hasInput && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReset}
            disabled={isLoading}
            className="px-4 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === "en" ? "Reset Workspace" : "Đặt lại tất cả"}</span>
            <span className="sm:hidden">{language === "en" ? "Reset" : "Đặt lại"}</span>
          </motion.button>
        )}
      </div>
    </header>
  );
}
