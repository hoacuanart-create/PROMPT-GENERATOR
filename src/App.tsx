import React, { useState, useEffect } from "react";
import { 
  Sparkles, Layers, Image as ImageIcon, Clipboard, Download, 
  Trash2, Play, ChevronRight, HelpCircle, Check, AlertCircle, RefreshCw,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Header from "./components/Header";
import ImageUploader from "./components/ImageUploader";
import OptionsConfigurator from "./components/OptionsConfigurator";
import { TRANSLATIONS } from "./translations";
import { 
  ReferenceImage, 
  PromptOptions, 
  GeneratedPromptResult, 
  SavedPromptItem,
  BACKGROUND_COLORS
} from "./types";

// Dynamic simulation messages for a highly responsive, high-end feel
const GENERATION_STEPS = [
  "Analyzing visual weight and reference silhouette...",
  "Scanning human anatomy landmarks & joint postures...",
  "Calibrating clay Matcap lighting specularity...",
  "Stripping unwanted clothing boundaries...",
  "Synthesizing elite prompt descriptives for 3D modelers...",
  "Structuring tags and volumetric analysis outputs..."
];

export default function App() {
  // Language Selector
  const [language, setLanguage] = useState<"en" | "vi">(() => (localStorage.getItem("preferred_lang") as "en" | "vi") || "en");
  const t = TRANSLATIONS[language];

  const handleLanguageChange = (lang: "en" | "vi") => {
    setLanguage(lang);
    localStorage.setItem("preferred_lang", lang);
  };

  // 1. Initial configuration states
  const [images, setImages] = useState<ReferenceImage[]>([]);
  const [activeTab, setActiveTab ] = useState<"reference" | "material" | "banana" | "threedmodel" | null>("reference");
  const [options, setOptions] = useState<PromptOptions>({
    materials: ["ZBRUSH MATERIAL"],
    color: "GREY SCALE COLOR",
    lighting: "STUDIO LIGHTING",
    view: "FRONT VIEW",
    anatomy: ["HEAD", "HANDS"],
    removeAccessoriesClothing: true,
    backgroundColor: "NEUTRAL",
    forcePose: "NONE",
    customInstruction: ""
  });

  // 2. Generation & System states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<GeneratedPromptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Nano Banana Gen State Specs
  const [selectedReferenceIdx, setSelectedReferenceIdx] = useState<number>(0);
  const [bananaPrompt, setBananaPrompt] = useState<string>("Transform this reference character into an exquisite high-poly orange clay miniature sculpture, with clean physical tooling marks, sitting on a plain grey studio backdrop, highly detailed ecorche clay render.");
  const [bananaAspectRatio, setBananaAspectRatio] = useState<"1:1" | "4:3" | "16:9" | "9:16">("1:1");
  const [isGeneratingBanana, setIsGeneratingBanana] = useState<boolean>(false);
  const [bananaResult, setBananaResult] = useState<{ imageUrl: string; text: string } | null>(null);
  const [bananaError, setBananaError] = useState<string | null>(null);

  // 3. User experience helpers (history, alerts)
  const [savedPrompts, setSavedPrompts] = useState<SavedPromptItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("orange_clay_saved_prompts");
      if (stored) {
        setSavedPrompts(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to retrieve model prompt history", e);
    }
  }, []);

  // Save history helper
  const updateSavedPrompts = (newItems: SavedPromptItem[]) => {
    setSavedPrompts(newItems);
    try {
      localStorage.setItem("orange_clay_saved_prompts", JSON.stringify(newItems));
    } catch (e) {
      console.error(e);
    }
  };

  // Toast feedback helper
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Loader state stepper loop
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % GENERATION_STEPS.length);
      }, 2300);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Main generator trigger
  const handleGeneratePrompt = async () => {
    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      // Clean transfer prep
      const payload = {
        images: images.map((img) => ({
          data: img.data,
          mimeType: img.type
        })),
        options: {
          materials: options.materials,
          color: options.color,
          lighting: options.lighting,
          view: options.view,
          anatomy: options.anatomy,
          removeAccessoriesClothing: options.removeAccessoriesClothing,
          backgroundColor: options.backgroundColor,
          forcePose: options.forcePose,
          customInstruction: options.customInstruction
        }
      };

      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status code ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      showToast("Sculpt session prompt synthesized successfully !");

      // Save to prompt list history
      const savedItem: SavedPromptItem = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        images: images.slice(0, 2).map((img) => img.data), // Keep up to 2 icons to conserve space
        options: { ...options },
        result: data
      };
      updateSavedPrompts([savedItem, ...savedPrompts]);

    } catch (err: any) {
      console.error("Endpoint generation failure:", err);
      setError(err.message || "An unexpected system pipeline error occurred.");
      showToast("Prompt optimization failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic Composite Sculpt Directives Prompt for free-tier users to run on Google flow suites
  const getCompositeSculptPrompt = () => {
    const colorSpec = options.color ? options.color.replace("_", " ") : "ORANGE";
    const viewSpec = options.view ? options.view.replace("_", " ") : "FRONT VIEW";
    const lightingSpec = options.lighting ? options.lighting.replace("_", " ") : "STUDIO LIGHTING";
    const materialSpec = options.materials && options.materials[0] ? options.materials[0].replace("_", " ") : "ORANGE CLAY";
    const aspectValue = bananaAspectRatio === "1:1" ? "square (1:1)" : `${bananaAspectRatio} landscape`;

    let builder = `${bananaPrompt.trim()}`;
    builder += ` [Specs: Beautiful solid ${materialSpec.toLowerCase()} Matcap gloss finish, vibrant ${colorSpec.toLowerCase()} clay tone, ${viewSpec.toLowerCase()}, dynamic ${lightingSpec.toLowerCase()}, flat plain dark neutral studio backdrop, high-poly 3D modeling, physically handcrafted mockup with subtle finger imprint tool marks, aspect ratio ${aspectValue}]`;
    return builder;
  };

  // Banana Generation Handler Method - Copy prompt to clipboard
  const handleGenerateBanana = () => {
    const fullPrompt = getCompositeSculptPrompt();
    navigator.clipboard.writeText(fullPrompt);
    showToast("Sculpt Prompt Copied! Ready to paste.");
  };

  // Utility resets
  const handleReset = () => {
    setImages([]);
    setOptions({
      materials: ["ZBRUSH MATERIAL"],
      color: "GREY SCALE COLOR",
      lighting: "STUDIO LIGHTING",
      view: "FRONT VIEW",
      anatomy: ["HEAD"],
      removeAccessoriesClothing: true,
      backgroundColor: "NEUTRAL",
      customInstruction: ""
    });
    setResult(null);
    setError(null);
    showToast("Workspace parameters clean slate configured.");
  };

  // Clipboard copies
  const copyPromptText = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedPrompt(true);
    showToast("Copied optimized prompt text to clipboard!");
    setTimeout(() => {
      setCopiedPrompt(false);
    }, 1500);
  };

  // Download raw prompt text file
  const downloadTXTFilename = (text: string, referenceText: string) => {
    try {
      const fileContent = `ORANGE_CLAY_PROMPT_OPTIMIZED:\n------------------------------\n${text}\n\nVOLUMETRIC ANALYSIS:\n--------------------\n${referenceText}\n\nTAGS:\n-----\n${options.materials.join(", ")}, ${options.color}, ${options.view}`;
      const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ORANGE_CLAY_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Prompt archive document downloaded.");
    } catch (e) {
      showToast("Failed to initiate text download.", "error");
    }
  };

  const removeHistoryItem = (id: string) => {
    updateSavedPrompts(savedPrompts.filter((s) => s.id !== id));
    showToast("History clean card removed.");
  };

  return (
    <div className="w-full h-screen bg-stone-950 bg-gradient-to-br from-stone-950 via-stone-900 to-zinc-950 text-white flex flex-col overflow-hidden font-sans select-none antialiased">
      
      {/* Dynamic Alert Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-5 py-2.5 rounded-full backdrop-blur-md flex items-center gap-2 text-xs font-bold shadow-2xl border ${
              toast.type === "success" 
                ? "bg-stone-900/90 text-white border-white/20" 
                : "bg-red-900/90 text-white border-red-500/30"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Header 
        onReset={handleReset} 
        isLoading={isLoading} 
        hasInput={images.length > 0 || options.customInstruction.length > 0} 
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR: REFERENCE AND MATERIALS CONTROLS */}
        <aside className="w-76 sm:w-85 lg:w-96 bg-stone-950/40 backdrop-blur-xl border-r border-white/10 p-5 flex flex-col gap-5 overflow-y-auto shrink-0 select-none scrollbar-thin">
          
          {/* Functional tab selectors */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
            <button 
              onClick={() => setActiveTab(activeTab === "reference" ? null : "reference")}
              className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                activeTab === "reference" 
                  ? "bg-[#FF5D00] text-white shadow" 
                  : "hover:bg-white/5 text-white/70"
              }`}
            >
              {t.refTab}
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab(activeTab === "material" ? null : "material")}
              className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center opacity-90 ${
                activeTab === "material" 
                  ? "bg-[#FF5D00] text-white shadow" 
                  : "hover:bg-white/5 text-white/70"
              }`}
            >
              {t.specsTab}
            </button>
          </div>

          <div className="flex-1">
            {activeTab === "reference" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    {t.referencePort}
                  </h3>
                  <p className="text-[11px] text-white/60 leading-tight mt-1">
                    {t.referenceSub}
                  </p>
                </div>

                <ImageUploader 
                  images={images} 
                  onImagesChange={setImages} 
                  isLoading={isLoading} 
                />
              </div>
            ) : activeTab === "material" ? (
              <OptionsConfigurator 
                options={options} 
                onOptionsChange={setOptions} 
                isLoading={isLoading} 
                language={language}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                <Sparkles className="w-8 h-8 text-white/20 mb-2 animate-pulse" />
                <p className="text-xs text-white/50 leading-relaxed font-sans">
                  {language === "en" ? "Section collapsed. Click an active tab button above to expand settings." : "Hình thức cài đặt đã thu gọn. Hãy nhấn vào nút Tab phía trên để mở lại."}
                </p>
              </div>
            )}
          </div>

          {/* Quick interactive parameters summarize */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleGeneratePrompt}
              disabled={isLoading || images.length === 0}
              className={`w-full py-3 rounded-2xl font-black uppercase tracking-widest text-white bg-[#FF5D00] hover:bg-[#FF731A] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === "en" ? "Analyzing..." : "Đang phân tích..."}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t.optimizePrompt}</span>
                </>
              )}
            </button>
            {images.length === 0 && (
              <p className="text-[10px] text-center text-white/60 mt-2 font-medium">
                {t.pleaseImportFirst}
              </p>
            )}

            {/* DIRECT EXTERNAL LINK PORTALS */}
            <div className="pt-3.5 mt-3 border-t border-white/5 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-white/40 block text-center select-none animate-pulse">
                {language === "en" ? "Direct External Portals" : "Cổng Liên kết Trực tiếp"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href="https://labs.google/fx/tools/flow" 
                  target="_blank" 
                  rel="noreferrer"
                  className="py-2.5 bg-white/5 hover:bg-white/10 hover:text-white border border-white/15 hover:border-[#FF5D00]/50 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-[10px] uppercase font-black tracking-wider text-white/80 shrink-0 text-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5D00]" />
                  <span>{t.bananaTab}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
                <a 
                  href="https://3d.hunyuanglobal.com/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="py-2.5 bg-white/5 hover:bg-white/10 hover:text-white border border-white/15 hover:border-[#FF5D00]/50 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-[10px] uppercase font-black tracking-wider text-white/80 shrink-0 text-center"
                >
                  <Layers className="w-3.5 h-3.5 text-[#FF5D00]" />
                  <span>{t.threeDTab}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA: ACTIVE PORT AND OUTPUT */}
        <main className="flex-1 flex flex-col p-6 gap-6 bg-white/5 overflow-y-auto select-none">
          
          {/* TOP GRAPHICS BAR: DYNAMIC PERSPECTIVE PREVIEW */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
              {/* Image overview cards */}
              {images.map((img, i) => (
                <div 
                  key={img.id}
                  className="bg-white/10 rounded-2xl p-1 relative overflow-hidden shadow-2xl group flex flex-col aspect-video md:aspect-auto md:h-36"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 z-10 select-none">
                    <p className="text-xs font-extrabold tracking-wide uppercase truncate">{img.name}</p>
                    <p className="text-[9px] text-white/60 font-mono">Reference Study Point #{i + 1}</p>
                  </div>
                  <img 
                    src={img.data} 
                    alt="" 
                    className="w-full h-full object-cover rounded-xl filter brightness-95"
                  />
                </div>
              ))}
              
              {/* Model stats monitor */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between h-36">
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{t.specsConfig}</h5>
                  <div className="grid grid-cols-2 gap-y-1 mt-2 text-[10px]">
                    <div>
                      <span className="text-white/40 font-mono font-bold">{t.colorLabel}:</span>
                      <p className="font-extrabold truncate text-white">
                        {language === "vi" && options.color === "GREY SCALE COLOR" ? "XÁM KHỐI" : language === "vi" && options.color === "ORANGE COLOR" ? "ĐẤT SÉT CAM" : options.color.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-white/40 font-mono font-bold">{t.angleLabel}:</span>
                      <p className="font-extrabold truncate text-white">
                        {language === "vi" && options.view === "FRONT VIEW" ? "NHÌN CHÍNH DIỆN" : language === "vi" && options.view === "SIDE PROFILE VIEW" ? "NHÌN NGANG" : language === "vi" && options.view === "BACK VIEW" ? "NHÌN SAU LƯNG" : options.view.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-white/40 font-mono font-bold">{t.poseLabel}:</span>
                      <p className="font-extrabold truncate text-white">
                        {options.forcePose === "NONE" ? t.originalPose : options.forcePose.replace("_", "-")}
                      </p>
                    </div>
                    <div>
                      <span className="text-white/40 font-mono font-bold">{t.ecoLabel}:</span>
                      <p className="font-extrabold text-white">{options.removeAccessoriesClothing ? "ECORCHE" : "DEFAULT"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-white/40 font-mono font-bold">{t.focusLabel}:</span>
                      <p className="font-extrabold truncate text-white">
                        {options.anatomy.map(a => {
                          if (language === "vi") {
                            if (a === "HEAD") return "NỬA ĐẦU";
                            if (a === "TORSO") return "THÂN TRÊN";
                            if (a === "FULL_BODY") return "TOÀN THÂN";
                            if (a === "HANDS") return "BÀN TAY";
                          }
                          return a;
                        }).join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN PROMPT OUTPUT SCREEN (FROSTED PANEL) */}
          <section className="flex-1 flex flex-col">
            {isLoading ? (
                // STUNNING PROGRESS SEQUENCE LOADER
                <div className="flex-1 min-h-80 bg-white/10 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] border border-white/20 p-8 flex flex-col items-center justify-center text-center gap-4 shadow-2xl">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
                    <Layers className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white animate-bounce" />
                  </div>
                  <div className="space-y-1 max-w-sm mt-3">
                    <h4 className="text-xs font-black uppercase tracking-[0.25em] text-white animate-pulse">
                      {language === "en" ? "Synthesizing Master Prompt" : "Đang Tổng Hợp Nhắc Lệnh Tối Ưu"}
                    </h4>
                    <p className="text-sm font-semibold text-orange-50 italic">
                      "{GENERATION_STEPS[loadingStep]}"
                    </p>
                    <p className="text-[10px] text-white/50 font-mono pt-3">
                      {language === "en" ? "Leveraging Google Gemini 1.5 Flash vision parser" : "Tận dụng bộ xử lý thị giác Google Gemini 1.5 Flash"}
                    </p>
                  </div>
                </div>

              ) : error ? (
                // ERROR CONTAINER
                <div className="flex-1 min-h-80 bg-stone-900/40 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] border border-red-500/30 p-8 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-3 bg-red-500/20 text-red-300 rounded-full">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-red-200">
                    Model Pipeline Timeout
                  </h4>
                  <p className="text-xs text-white/70 max-w-lg">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={handleGeneratePrompt}
                    className="px-5 py-2.5 bg-white text-[#FF6B00] hover:bg-orange-50 rounded-full font-bold text-xs uppercase tracking-wider mt-2 shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {language === "en" ? "Try again" : "Thử lại"}
                  </button>
                </div>

              ) : result ? (
                // MAIN RICH OUTPUT CANVAS
                <div className="bg-white/10 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] border border-white/20 p-6 sm:p-8 flex flex-col gap-5 shadow-2xl relative overflow-hidden select-text text-white">
                   
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest py-1 px-3 bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                      {language === "en" ? "Prompt Optimized" : "Nhắc lệnh Đã Tối ưu"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                      {language === "en" ? "1. AI Generated descriptive prompt" : "1. Nhắc lệnh mô tả tạo sinh bởi AI"}
                    </h4>
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 font-sans relative group">
                      <p className="text-base sm:text-lg font-medium leading-relaxed italic text-orange-50 select-all p-1">
                        "{result.prompt}"
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => copyPromptText(result.prompt)}
                        className="absolute bottom-2 right-2 p-1.5 bg-white/10 hover:bg-white text-white hover:text-[#FF6B00] rounded-lg transition-all cursor-pointer opacity-80"
                        title={language === "en" ? "Copy Prompt" : "Sao chép Nhắc lệnh"}
                      >
                        <Clipboard className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sub features: breakdown details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                        {language === "en" ? "2. Volumetric Anatomy Breakdown" : "2. Phân tích Khối Giải phẫu"}
                      </h5>
                      <p className="text-xs text-white/80 leading-relaxed font-sans bg-white/5 p-3.5 rounded-xl border border-white/5 h-36 overflow-y-auto">
                        {result.analysis}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                        {language === "en" ? "3. Smart Keyword Tags" : "3. Thẻ Từ khóa Thông minh"}
                      </h5>
                      <div className="flex flex-wrap gap-1.5 bg-white/5 p-3.5 rounded-xl border border-white/5 h-36 overflow-y-auto content-start">
                        {result.tags.map((tag, i) => (
                          <span 
                            key={i}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[10px] text-orange-100 rounded-full border border-white/10 font-mono tracking-wide cursor-pointer transition-colors"
                          >
                            #{tag.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card controls */}
                  <div className="border-t border-white/10 pt-4 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => copyPromptText(result.prompt)}
                        className="text-xs font-bold tracking-widest uppercase opacity-75 hover:opacity-100 transition-opacity flex items-center gap-1.5 cursor-pointer"
                      >
                        <Clipboard className="w-4.5 h-4.5" />
                        {language === "en" ? "Copy text" : "Sao chép văn bản"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => downloadTXTFilename(result.prompt, result.analysis)}
                        className="text-xs font-bold tracking-widest uppercase opacity-75 hover:opacity-100 transition-opacity flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-4.5 h-4.5" />
                        {language === "en" ? "Save to disk (.TXT)" : "Lưu file (.TXT)"}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGeneratePrompt}
                        className="px-4 py-1.5 bg-[#FF5D00] hover:bg-[#FF731A] text-white font-black rounded-full text-[10px] uppercase tracking-widest cursor-pointer shadow-sm transition-all flex items-center gap-1.5 border border-white/10"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {language === "en" ? "Regenerate" : "Tạo Lại"}
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                // DEFAULT GREETING SCREEN
                <div className="flex-1 min-h-80 bg-white/10 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] border border-white/20 p-8 flex flex-col items-center justify-center text-center gap-4 shadow-inner">
                  <div className="p-4 bg-white/10 rounded-full">
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-black uppercase tracking-[0.25em] text-white">
                      {language === "en" ? "Ready to Generate Prompt" : "Sẵn Sàng Tạo Prompt"}
                    </h4>
                    <p className="text-xs text-orange-50/80 max-w-sm mx-auto">
                      {language === "en" ? "Configure your high-poly character models, sculpt parameters, and prompt rules, then select optimize prompt to start." : "Thiết lập cấu trúc nhân vật chi tiết cao, tùy chọn điêu khắc cùng điều khoản tương hỗ, sau đó nhấn Tối ưu Nhắc lệnh để bắt đầu."}
                    </p>
                  </div>
                </div>
              )
            }
          </section>

        </main>
      </div>

      {/* FOOTER STATUS LINE: ARCHITECTURAL HONESTY SPEC */}
      <footer className="h-10 bg-white/5 backdrop-blur-xl border-t border-white/10 flex items-center px-6 sm:px-8 justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 shrink-0 select-none">
        <div className="flex gap-4 sm:gap-8 justify-start">
          <span className="text-white/70">OrangClay Synth engine v3.0</span>
          <span className="hidden sm:inline text-white/50">•</span>
          <span className="text-white/70">Engine: Gemini-3.5-flash</span>
        </div>
        <div className="flex gap-8 justify-end">
          <span className="text-white/70">Status: Operational</span>
        </div>
      </footer>

    </div>
  );
}
