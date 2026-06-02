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
  const [activeTab, setActiveTab] = useState<"reference" | "material" | "banana" | "threedmodel">("reference");
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
          <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
            <button 
              onClick={() => setActiveTab("reference")}
              className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                activeTab === "reference" 
                  ? "bg-[#FF5D00] text-white shadow" 
                  : "hover:bg-white/5 text-white/70"
              }`}
            >
              {t.refTab}
            </button>
            <button 
              onClick={() => setActiveTab("material")}
              className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center opacity-90 ${
                activeTab === "material" 
                  ? "bg-[#FF5D00] text-white shadow" 
                  : "hover:bg-white/5 text-white/70"
              }`}
            >
              {t.specsTab}
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("banana")}
              className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                activeTab === "banana" 
                  ? "bg-[#FF5D00] text-white shadow" 
                  : "hover:bg-white/5 text-white/70"
              }`}
            >
              {t.bananaTab}
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("threedmodel")}
              className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center whitespace-nowrap px-0.5 ${
                activeTab === "threedmodel" 
                  ? "bg-[#FF5D00] text-white shadow" 
                  : "hover:bg-white/5 text-white/70"
              }`}
            >
              {t.threeDTab}
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
            ) : activeTab === "threedmodel" ? (
              // 3D MODEL SIDEBAR
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#FF5D00]" />
                    {t.threeDMarketDirectory}
                  </h3>
                  <p className="text-[11px] text-white/60 leading-tight mt-1">
                    {t.exploreThreeDPlatforms}
                  </p>
                </div>

                <div className="bg-[#FF5D00]/10 border border-[#FF5D00]/25 rounded-2xl p-3.5 space-y-2 select-none">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-200 block">
                    {t.zeroSetupCosts}
                  </span>
                  <p className="text-[10px] text-white/70 leading-normal font-sans">
                    {t.zeroSetupCostsSub}
                  </p>
                </div>
              </div>
            ) : (
              // BANANA GENERATION ACTIVE OPTIONS SIDEBAR
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#FF5D00]" />
                    {t.bananaHeader}
                  </h3>
                  <p className="text-[11px] text-white/60 leading-tight mt-1">
                    {t.bananaSub}
                  </p>
                </div>

                {/* Reference list selector */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/40">
                    {t.stepRefSource}
                  </span>
                  {images.length === 0 ? (
                    <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-xl text-center">
                      <p className="text-xs text-white/50 leading-relaxed font-sans">
                        {t.noRefImages} <span className="text-[#FF5D00] font-bold cursor-pointer underline hover:text-[#FF731A]" onClick={() => setActiveTab("reference")}>{t.refTab}</span> {language === "en" ? "tab to upload." : "để tải ảnh."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin mt-1">
                      {images.map((img, idx) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setSelectedReferenceIdx(idx)}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                            selectedReferenceIdx === idx
                              ? "bg-[#FF5D00]/25 border-[#FF5D00] text-white font-medium"
                              : "bg-white/5 border-transparent hover:bg-white/10 text-white/70"
                          }`}
                        >
                          <img src={img.data} alt="" className="w-8 h-8 rounded object-cover shadow-md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white uppercase font-bold tracking-wide truncate">{img.name}</p>
                            <p className="text-[9px] text-white/40 font-mono">{language === "en" ? `Reference Study #${idx + 1}` : `Mẫu nghiên cứu #${idx + 1}`}</p>
                          </div>
                          {selectedReferenceIdx === idx && (
                            <Check className="w-3.5 h-3.5 text-[#FF5D00]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Aspect ratio control */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/40">
                    {t.stepAspect}
                  </span>
                  <div className="flex gap-1.5 mt-1">
                    {(["1:1", "4:3", "16:9", "9:16"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setBananaAspectRatio(ratio)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          bananaAspectRatio === ratio
                            ? "bg-[#FF5D00] text-white"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Design modifier prompt area */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/40">
                    {t.stepDirectives}
                  </span>
                  <textarea
                    value={bananaPrompt}
                    onChange={(e) => setBananaPrompt(e.target.value)}
                    placeholder={t.textareaPlaceholder}
                    className="w-full h-18 bg-white/5 border border-white/15 focus:border-[#FF5D00] focus:ring-1 focus:ring-[#FF5D00] rounded-xl p-2 text-xs font-sans text-white placeholder-white/30 resize-none outline-none leading-normal transition-all"
                  />
                  
                  {/* Presets */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[
                      { l: "Mech", p: "Recreate as a futuristic high-tech cyberpunk mech robot sculpted entirely out of elegant matte orange clay, displaying panel splits, wires, on a grey studio backdrop." },
                      { l: "Chibi", p: "Morph this reference character into an adorable, rounded chibi toy clay figurine with glossy orange clay glaze specs, charming physical hand-molded finish." },
                      { l: "Ecorche", p: "Render this as a precise anatomical ecorche sculpture study made of orange colored clay, emphasizing muscle fibers, bone structures, matte model texture." },
                      { l: "Banana", p: "Sculpt a custom cybernetic nano-sculpted banana integrated with wires, circuits, glowing tech grids, entirely stylized in high-poly matte clay." }
                    ].map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setBananaPrompt(preset.p)}
                        className="px-2 py-0.5 bg-white/5 hover:bg-[#FF5D00]/15 text-[9px] font-semibold text-white/80 rounded transition-all cursor-pointer border border-white/5 hover:border-[#FF5D00]/30"
                      >
                        {preset.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick interactive parameters summarize */}
          <div className="mt-auto pt-4 border-t border-white/10">
            {activeTab === "banana" ? (
              <button
                type="button"
                onClick={handleGenerateBanana}
                disabled={isGeneratingBanana}
                className={`w-full py-3 rounded-2xl font-black uppercase tracking-widest text-[#FF5D00] bg-orange-500/10 border border-[#FF5D00]/25 hover:bg-[#FF5D00] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed text-xs`}
              >
                {isGeneratingBanana ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === "en" ? "Copying..." : "Đang sao chép..."}</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-4 h-4" />
                    <span>{t.sculptCopiedText}</span>
                  </>
                )}
              </button>
            ) : activeTab === "threedmodel" ? (
              <a
                href="https://labs.google"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl font-black uppercase tracking-widest text-white bg-[#FF5D00] hover:bg-[#FF731A] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg text-center font-bold text-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === "en" ? "Launch Google Labs" : "Khởi chạy Google Labs"}</span>
              </a>
            ) : (
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
            )}
            {images.length === 0 && activeTab !== "threedmodel" && (
              <p className="text-[10px] text-center text-white/60 mt-2 font-medium">
                {t.pleaseImportFirst}
              </p>
            )}
          </div>
        </aside>

        {/* WORKSPACE AREA: ACTIVE PORT AND OUTPUT */}
        <main className="flex-1 flex flex-col p-6 gap-6 bg-white/5 overflow-y-auto select-none">
          
          {/* TOP GRAPHICS BAR: DYNAMIC PERSPECTIVE PREVIEW */}
          {activeTab !== "threedmodel" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
              {images.length === 0 ? (
                <div className="md:col-span-3 min-h-36 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="p-3 bg-white/10 rounded-full">
                    <ImageIcon className="w-6 h-6 text-white/80" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">No Reference Active</h4>
                    <p className="text-[11px] text-white/60 max-w-sm mt-1">
                      Please upload front views, anatomy details, or sculpt samples in the left Ref tab panel to boot the synth engine.
                    </p>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}

          {/* MAIN PROMPT OUTPUT SCREEN (FROSTED PANEL) */}
          <section className="flex-1 flex flex-col">
            
            {activeTab === "threedmodel" ? (
              // TOP 3D AI generator services with direct links and free-tier badges
              <div className="bg-white/10 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] border border-white/20 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden text-white animate-fade-in">
                
                {/* Curator Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-5 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest py-0.5 px-2.5 bg-[#FF5D00] text-white rounded-md">
                        {language === "en" ? "3D SUITES" : "BỘ AI 3D"}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest py-0.5 px-2.5 bg-white/10 text-white/80 rounded-md">
                        {language === "en" ? "Free Category Directory" : "Danh mục Thử nghiệm Miễn phí"}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-white tracking-tight">
                      {language === "en" ? "Curated 3D AI Platforms" : "Các nền tảng 3D AI Tuyển lựa"}
                    </h4>
                    <p className="text-[11px] text-white/60 leading-normal max-w-2xl">
                      {language === "en" ? "Select one of the leading web-based 3D generator engines below to craft assets directly with your clay mockups or textual blueprints." : "Lựa chọn một trong các mô hình AI sinh phác họa 3D hàng đầu dưới đây để trích xuất trực tiếp mô hình từ bản phác thảo đất sét cam của bạn."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 animate-pulse">
                    <a 
                      href="https://labs.google" 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#FF5D00] hover:bg-[#FF731A] text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-lg shadow-orange-500/10"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Google Labs
                    </a>
                  </div>
                </div>

                {/* Direct Grid Layout with gorgeous cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      name: "Meshy AI",
                      url: "https://www.meshy.ai",
                      badge: "🔥 Highly Recommended",
                      tier: "200 FREE CREDITS / MO",
                      desc: "State-of-the-art text/image-to-3D speed generator with fully automated high-quality PBR textures.",
                      features: ["Advanced physics-based materials", "Direct mesh & polycount edits", "Generous monthly credit refill"]
                    },
                    {
                      name: "Tripo 3D",
                      url: "https://www.tripo3d.ai",
                      badge: "⚡ Instant Reconstruction",
                      tier: "10 FREE DRAWS / DAILY",
                      desc: "Incredible speed draft modeler producing clean, animatable quad meshes and prompt adjustments.",
                      features: ["Interactive geometry sandbox", "Rapid draft exports in 8s", "Supports image, text & mesh texturing"]
                    },
                    {
                      name: "Luma Genie",
                      url: "https://lumalabs.ai/genie",
                      badge: "✨ Open Beta Free",
                      tier: "FREE DURING TEST PHASE",
                      desc: "The flagship spatial designer from Luma Labs, offering high-fidelity, creative text-to-3D structures.",
                      features: ["Advanced object depth & shapes", "Ultra pristine rendering detail", "Full camera rotation viewer"]
                    },
                    {
                      name: "Sloyd AI",
                      url: "https://www.sloyd.ai",
                      badge: "🛠️ Procedural Modeler",
                      tier: "FREE PLAN + MODIFIERS",
                      desc: "A bespoke procedural asset editor backed by AI modifiers to make fully game-ready custom variations instantly.",
                      features: ["Clean low-poly geometries", "Real-time slider controls", "Excellent for building, weapon props"]
                    },
                    {
                      name: "Deemos Rodin",
                      url: "https://hyperhuman.deemos.com/rodin",
                      badge: "💎 Extreme Fidelity",
                      tier: "COMPLIMENTARY DAILY CREDITS",
                      desc: "A top-tier hyper-realistic single-image 3D avatar and intricate prop reconstruction system.",
                      features: ["Industry-grade UV mapping", "Stunning physical clay specularity", "Optimized mesh structures"]
                    },
                    {
                      name: "Hunyuan 3D-2",
                      url: "https://3d.hunyuanglobal.com/",
                      badge: "🤖 Flagship Original",
                      tier: "100% FREE INTUATIVE SUITE",
                      desc: "The official web platform of Tencent's flagship open-source reconstruction model with an aesthetic interactive preview workspace.",
                      features: ["High-resolution voxel densities", "Official web interface access", "Instant GLB/OBJ download models"]
                    }
                  ].map((service, idx) => (
                    <div 
                      key={idx} 
                      className="bg-stone-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-[#FF5D00]/50 hover:bg-stone-900/80 transition-all group duration-300 relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap justify-between items-start gap-1">
                          <span className="text-[9px] font-black tracking-wider text-orange-400 font-bold uppercase block">
                            {service.badge}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-white/5 border border-white/10 text-white/50 rounded">
                            {service.tier}
                          </span>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-black text-white group-hover:text-[#FF5D00] transition-colors flex items-center gap-1.5 mt-1">
                            {service.name}
                          </h5>
                          <p className="text-[10px] text-white/60 mt-1 leading-normal font-sans">
                            {service.desc}
                          </p>
                        </div>

                        {/* Bullet checklist */}
                        <ul className="space-y-1 pt-2 border-t border-white/5">
                          {service.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-1.5 text-[9px] text-white/50">
                              <span className="text-[#FF5D00] text-xs leading-none select-none">•</span>
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4">
                        <a 
                          href={service.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full py-2 bg-white/5 group-hover:bg-[#FF5D00] group-hover:text-white border border-white/5 group-hover:border-transparent text-white/80 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>{t.visitWebsite}</span>
                          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-white/50">
                  <p className="font-sans">
                    💡 <strong>{language === "en" ? "Pro Hint:" : "Mẹo chuyên nghiệp:"}</strong> {t.proHint}
                  </p>
                  <span className="font-mono text-[9px] opacity-40">{t.freeMarketDirectory}</span>
                </div>

              </div>
            ) : activeTab === "banana" ? (
              // GOOGLE LABS COPILOT / IMAGEN SCULPTING HUB
              <div className="bg-white/10 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] border border-white/20 p-6 sm:p-8 flex flex-col xl:flex-row gap-6 shadow-2xl relative overflow-hidden select-text text-white animate-fade-in">
                
                {/* Visual clay Matcap Shader Simulator Preview */}
                <div className="flex-1 max-w-full xl:max-w-md mx-auto xl:mx-0 flex flex-col gap-3 justify-center bg-black/30 rounded-3xl border border-white/10 p-4 min-h-[340px]">
                  <div className="relative flex-1 w-full flex items-center justify-center bg-stone-950/40 rounded-2xl border border-white/5 overflow-hidden group select-none">
                    {images[selectedReferenceIdx] || images[0] ? (
                      <div className="relative w-full h-full flex items-center justify-center min-h-[200px]">
                        {/* Dynamic custom orange clay mock overlay filter effect */}
                        <img 
                          src={(images[selectedReferenceIdx] || images[0]).data} 
                          alt="Sculpt target preview" 
                          className="max-h-72 w-auto object-contain transition-all duration-300 rounded-xl filter sepia saturate-150 hue-rotate-[320deg] brightness-105"
                        />
                        <div className="absolute inset-0 bg-orange-600/10 mix-blend-color hover:bg-transparent transition-all duration-300"></div>
                        <div className="absolute top-2 left-2 bg-[#FF5D00] text-white px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider border border-white/10 shadow-md">
                          {language === "en" ? "CLAY MOCK" : "MÔ HÌNH ĐẤT SÉT"}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 space-y-2">
                        <ImageIcon className="w-12 h-12 mx-auto text-white/20 animate-pulse" />
                        <p className="text-xs text-white/40 font-medium">
                          {language === "en" ? "No Reference Image Selected" : "Chưa chọn ảnh mẫu tham khảo"}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Real-time configured directives overview */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/25 p-3 rounded-xl border border-white/5 font-mono select-none">
                    <div>
                      <span className="text-white/40 block">
                        {language === "en" ? "TARGET TONE/COLOR:" : "TÔNG MÀU MỤC TIÊU:"}
                      </span>
                      <span className="text-amber-400 font-bold uppercase">{options.color ? (language === "vi" && options.color === "ORANGE COLOR" ? "ĐẤT SÉT CAM" : language === "vi" && options.color === "GREY SCALE COLOR" ? "XÁM KHỐI" : options.color.replace("_", " ")) : "ORANGE"}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">
                        {language === "en" ? "MATERIAL SHADER:" : "CHẤT LIỆU SHADER:"}
                      </span>
                      <span className="text-amber-400 font-bold uppercase">{options.materials && options.materials[0] ? options.materials[0].replace("_", " ") : "ORANGE CLAY"}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">
                        {language === "en" ? "STUDIO PERSPECTIVE:" : "GÓC NHÌN PHÒNG QUAY:"}
                      </span>
                      <span className="text-amber-400 font-bold uppercase">{options.view ? (language === "vi" && options.view === "FRONT VIEW" ? "NHÌN CHÍNH DIỆN" : options.view.replace("_", " ")) : "FRONT VIEW"}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">
                        {language === "en" ? "ASPECT PREFERENCE:" : "TỶ LỆ KHUNG HÌNH:"}
                      </span>
                      <span className="text-amber-400 font-bold uppercase">{bananaAspectRatio}</span>
                    </div>
                  </div>
                </div>

                {/* Co-pilot instruction actions terminal */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest py-1 px-3 bg-[#FF5D00]/20 text-[#FFF] rounded-full border border-[#FF5D00]/30">
                        {language === "en" ? "Sculpt Co-pilot Playground" : "Sân chơi Trợ lý Điêu khắc"}
                      </span>
                      <h4 className="text-lg font-extrabold text-white tracking-tight mt-2.5">
                        {language === "en" ? "Synthesize Orange Clay Masterpieces For Free" : "Tạo mẫu điêu khắc Đất sét Cam Miễn phí"}
                      </h4>
                      <p className="text-xs text-white/70 leading-relaxed font-sans mt-1">
                        {language === "en" ? "High-poly 3D clay Matcap models require Gemini's absolute top-tier premium hardware. Since premium API plans require paid pricing tiers, you can copy your ultra-optimized Prompt Blueprint below and render it 100% free-of-charge inside Google's flagship creative suites!" : "Mẫu điêu khắc Matcap 3D độ chi tiết cao yêu cầu tài nguyên cao cấp của Gemini. Để sử dụng tối ưu chi phí, bạn có thể sao chép Bản thiết kế Nhắc lệnh cực kỳ tối ưu của mình ở dưới đây và tạo sinh 100% miễn phí trong các bộ công cụ sáng tạo cao cấp của Google!"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center select-none">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                          {language === "en" ? "Your Formatted Clay Prompt" : "Nhắc lệnh Điêu khắc Đất Sét Định hình"}
                        </h5>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(getCompositeSculptPrompt());
                            showToast(language === "en" ? "Copied sculpt blueprint prompt!" : "Đã sao chép prompt điêu khắc!");
                          }}
                          className="text-[10px] text-[#FF731A] hover:text-[#FF5D00] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Clipboard className="w-3 h-3" />
                          {language === "en" ? "Copy Text" : "Sao chép"}
                        </button>
                      </div>
                      
                      <div className="relative group bg-stone-950/50 p-4 rounded-xl border border-white/5 max-h-40 overflow-y-auto scrollbar-thin">
                        <p className="text-xs sm:text-sm font-medium leading-relaxed italic text-orange-200 select-all font-sans">
                          "{getCompositeSculptPrompt()}"
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#FF5D00]/10 border border-[#FF5D00]/25 rounded-2xl p-4 space-y-3">
                      <h6 className="text-[11px] font-black uppercase tracking-wider text-orange-200 flex items-center gap-1.5 select-none">
                        <Sparkles className="w-3.5 h-3.5" />
                        {language === "en" ? "Recommended Direct Launch Portal:" : "Cổng Khởi chạy Trực tiếp Khuyên dùng:"}
                      </h6>
                      
                      <a 
                        href="https://labs.google/fx/tools/flow" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-black/35 hover:bg-black/50 border border-white/5 hover:border-[#FF5D00]/40 rounded-xl transition-all group gap-4"
                      >
                        <div>
                          <span className="text-[11px] font-black tracking-wider text-[#FF5D00] uppercase block">Google Labs Flow</span>
                          <p className="text-[10px] text-white/60 leading-normal font-sans mt-0.5">
                            {language === "en" ? "Google's flagship creative playground to access the Banana sculpting model for high-poly 3D details." : "Sân chơi sáng tạo đỉnh cao của Google để tiếp cận mô hình điêu khắc chuối / đất sét cam chi tiết cao."}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 self-start md:self-auto group-hover:text-amber-400 transition-colors whitespace-nowrap">
                          {language === "en" ? "Launch Google Flow" : "Cổng Google Flow"}
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </a>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 flex flex-wrap gap-3">
                    <button 
                      type="button"
                      onClick={handleGenerateBanana}
                      className="px-6 py-3 bg-[#FF5D00] hover:bg-[#FF731A] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg flex items-center gap-2 border border-white/10"
                    >
                      <Clipboard className="w-4 h-4" />
                      {language === "en" ? "Copy Sculptor Prompt" : "Sao chép Nhắc lệnh Điêu khắc"}
                    </button>
                    
                    <a 
                      href="https://labs.google/fx/tools/flow" 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-white/5"
                    >
                      <span>{language === "en" ? "Open Google Labs Flow" : "Mở Google Labs Flow"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                </div>
              </div>
            ) : (
              // STANDARD OPTIMIZED DISCOVERY PROMPT GENERATOR CANVAS
              isLoading ? (
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
            )}
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
