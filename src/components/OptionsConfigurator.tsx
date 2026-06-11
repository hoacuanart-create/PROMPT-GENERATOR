import React from "react";
import { 
  Sparkles, Layers, CircleDot, Sun, Eye, Scissors, Square, EyeOff, Accessibility, ChevronDown 
} from "lucide-react";
import { TRANSLATIONS } from "../translations";
import { 
  PromptOptions, 
  MATERIAL_OPTIONS, 
  COLOR_OPTIONS, 
  LIGHTING_OPTIONS, 
  VIEW_OPTIONS, 
  ANATOMY_OPTIONS, 
  BACKGROUND_COLORS,
  POSE_OPTIONS
} from "../types";

interface OptionsConfiguratorProps {
  options: PromptOptions;
  onOptionsChange: (options: PromptOptions) => void;
  isLoading: boolean;
  language: "en" | "vi";
}

export default function OptionsConfigurator({ options, onOptionsChange, isLoading, language }: OptionsConfiguratorProps) {
  const t = TRANSLATIONS[language];

  // Accordion state to toggle sections. All collapsed by default.
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    materials: false,
    colorLighting: false,
    perspectives: false,
    postures: false,
    anatomy: false,
    strip: false,
    backdrop: false,
    notes: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  const toggleMaterial = (matLabel: string) => {
    let newMats = [...options.materials];
    if (newMats.includes(matLabel)) {
      newMats = newMats.filter((m) => m !== matLabel);
    } else {
      newMats.push(matLabel);
    }
    onOptionsChange({ ...options, materials: newMats });
  };

  const toggleAnatomy = (anatLabel: string) => {
    let newAnat = [...options.anatomy];
    if (newAnat.includes(anatLabel)) {
      newAnat = newAnat.filter((a) => a !== anatLabel);
    } else {
      newAnat.push(anatLabel);
    }
    onOptionsChange({ ...options, anatomy: newAnat });
  };

  const setSetting = (key: keyof PromptOptions, value: any) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="space-y-4 text-white select-none">
      
      {/* 1. REFERENCE MATERIALS SECTION */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("materials")}
          className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#FF5D00]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
              {language === "en" ? "Surface Materials" : "Chất liệu bề mặt"}
            </h3>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
              expandedSections.materials ? "rotate-180 text-[#FF5D00]" : ""
            }`} 
          />
        </button>
        
        {expandedSections.materials && (
          <div className="grid grid-cols-1 gap-2 pt-1 transition-all">
            {MATERIAL_OPTIONS.map((mat) => {
              const isChecked = options.materials.includes(mat.label);
              return (
                <label
                  key={mat.id}
                  className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? "bg-white/10 border-[#FF5D00]/50 shadow-[0_0_10px_rgba(255,93,0,0.1)]"
                      : "bg-white/5 hover:bg-white/8 border-white/5"
                  } ${isLoading ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold font-sans">
                      {mat.label}
                    </span>
                    <span className="text-[9px] text-white/55 font-mono mt-0.5 leading-tight">
                      {language === "en" ? mat.description : (mat.id === "ZBRUSH" ? "Đất sét điêu khắc Zbrush kỹ thuật số truyền thống" : mat.id === "ORANGE_CLAY" ? "Đất sét cam đặc trưng vân tay tuyệt đẹp" : "Nhựa monomer xám mịn in 3D SLA")}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleMaterial(mat.label)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded-sm border-white/20 checked:bg-[#FF5D00] checked:border-[#FF5D00] focus:ring-0 cursor-pointer text-[#FF5D00]"
                  />
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. COLOR & LIGHTING */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("colorLighting")}
          className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <CircleDot className="w-4 h-4 text-[#FF5D00]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
              {language === "en" ? "Color & Lighting" : "Màu sắc & Ánh sáng"}
            </h3>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
              expandedSections.colorLighting ? "rotate-180 text-[#FF5D00]" : ""
            }`} 
          />
        </button>
        
        {expandedSections.colorLighting && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 transition-all">
            {/* Color list */}
            <div className="space-y-1.5 bg-neutral-900/30 p-2 rounded-xl border border-white/5">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1 pl-1">
                {language === "en" ? "Color Palette" : "Bảng màu"}
              </p>
              {COLOR_OPTIONS.map((col) => {
                const isSelected = options.color === col.label;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSetting("color", isSelected ? "" : col.label)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-all text-xs font-sans ${
                      isSelected
                        ? "bg-[#FF5D00] text-white border-[#FF5D00] font-bold"
                        : "bg-white/5 hover:bg-white/10 border-transparent text-white/70"
                    } ${isLoading ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
                  >
                    <span>
                      {language === "en" ? col.label : (col.id === "GREY" ? "Thang độ xám" : "Đất sét cam")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Lighting list */}
            <div className="space-y-1.5 bg-neutral-900/30 p-2 rounded-xl border border-white/5">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1 pl-1">
                {language === "en" ? "Lighting Setup" : "Thiết lập Ánh sáng"}
              </p>
              {LIGHTING_OPTIONS.map((light) => {
                const isSelected = options.lighting === light.label;
                return (
                  <button
                    key={light.id}
                    type="button"
                    onClick={() => setSetting("lighting", isSelected ? "" : light.label)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-all text-xs font-sans ${
                      isSelected
                        ? "bg-[#FF5D00] text-white border-[#FF5D00] font-bold"
                        : "bg-white/5 hover:bg-white/10 border-transparent text-white/70"
                    } ${isLoading ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
                  >
                    <span>
                      {language === "en" ? light.label : (light.id === "STUDIO" ? "Ánh sáng Studio" : "Ánh sáng Rim Light")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. CAM PERSPECTIVES */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("perspectives")}
          className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-[#FF5D00]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
              {language === "en" ? "Anatomical Perspectives" : "Góc quay camera phối cảnh"}
            </h3>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
              expandedSections.perspectives ? "rotate-180 text-[#FF5D00]" : ""
            }`} 
          />
        </button>
        
        {expandedSections.perspectives && (
          <div className="flex flex-wrap gap-1.5 bg-neutral-900/30 p-2.5 rounded-xl border border-white/5 pt-1 transition-all">
            {VIEW_OPTIONS.map((vw) => {
              const isSelected = options.view === vw.label;
              let displayLabel = vw.label;
              if (language === "vi") {
                if (vw.id === "FRONT") displayLabel = "MẶT TRƯỚC";
                else if (vw.id === "LEFT_SIDE_VIEW") displayLabel = "BÊN TRÁI";
                else if (vw.id === "RIGHT_SIDE_VIEW") displayLabel = "BÊN PHẢI";
                else if (vw.id === "BACK") displayLabel = "PHÍA SAU";
                else if (vw.id === "TOP_VIEW") displayLabel = "MẶT TRÊN";
                else if (vw.id === "BOTTOM_VIEW") displayLabel = "MẶT DƯỚI";
                else if (vw.id === "FULL_CHARACTER_SHEET") displayLabel = "TOÀN THÂN 3 GÓC";
              }
              return (
                <button
                  key={vw.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setSetting("view", isSelected ? "" : vw.label)}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                    isSelected
                      ? "bg-[#FF5D00] text-white border-[#FF5D00] shadow"
                      : "bg-white/5 hover:bg-white/10 border-transparent text-white/70"
                  } ${isLoading ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3.5. FORCED 3D POSTURES */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("postures")}
          className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Accessibility className="w-4 h-4 text-[#FF5D00]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
              {language === "en" ? "Forced 3D Posture Model Stance" : "Tư thế ép buộc mô hình (3D rigging)"}
            </h3>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
              expandedSections.postures ? "rotate-180 text-[#FF5D00]" : ""
            }`} 
          />
        </button>
        
        {expandedSections.postures && (
          <div className="grid grid-cols-1 gap-2 pt-1 transition-all">
            {POSE_OPTIONS.map((pose) => {
              const isSelected = options.forcePose === pose.id;
              let label = pose.label;
              let desc = pose.description;
              if (language === "vi") {
                if (pose.id === "NONE") {
                  label = "TƯ THẾ GỐC THAM CHIẾU";
                  desc = "Giữ nguyên tư thế như hình ảnh đưa lên";
                } else if (pose.id === "A_POSE") {
                  label = "CƯỠNG ÉP TƯ THẾ A-POSE";
                  desc = "Hai tay xéo góc 45 độ hướng xuống, ngón tay hướng ra tự nhiên";
                } else if (pose.id === "T_POSE") {
                  label = "CƯỠNG ÉP TƯ THẾ T-POSE";
                  desc = "Hai tay giang song song mặt đất tiêu chuẩn thiết kế nhân vật game";
                }
              }
              return (
                <button
                  key={pose.id}
                  type="button"
                  onClick={() => setSetting("forcePose", isSelected ? "NONE" : pose.id)}
                  disabled={isLoading}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-[#FF5D00]/25 border-[#FF5D00] text-white shadow-lg shadow-orange-500/5 font-bold"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  } ${isLoading ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold font-sans">
                      {label}
                    </span>
                    {isSelected && (
                      <span className="text-[8px] bg-[#FF5D00] text-white px-2 py-0.5 rounded font-black font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-white/55 font-mono mt-0.5 leading-tight">
                    {desc}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. ANATOMY FOCAL DETAIL */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("anatomy")}
          className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#FF5D00]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
              {language === "en" ? "Anatomy Focus Selection" : "Vùng Giải phẫu Tiêu biểu"}
            </h3>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
              expandedSections.anatomy ? "rotate-180 text-[#FF5D00]" : ""
            }`} 
          />
        </button>
        
        {expandedSections.anatomy && (
          <div className="flex flex-wrap gap-2 pt-1 transition-all">
            {ANATOMY_OPTIONS.map((anat) => {
              const isChecked = options.anatomy.includes(anat.label);
              let labelText = anat.label;
              if (language === "vi") {
                if (anat.id === "HEAD") labelText = "NỬA ĐẦU";
                if (anat.id === "TORSO") labelText = "THÂN TRÊN";
                if (anat.id === "FULL_BODY") labelText = "TOÀN THÂN";
                if (anat.id === "HANDS") labelText = "BÀN TAY / QUAY";
              }
              return (
                <button
                  key={anat.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => toggleAnatomy(anat.label)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    isChecked
                      ? "bg-[#FF5D00] text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  } ${isLoading ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
                >
                  {labelText}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. STRIP ACCESSORIES & CLOTHES */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("strip")}
          className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Scissors className="w-4 h-4 text-[#FF5D00]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
              {language === "en" ? "Strip Clothes & Accessories" : "Bốc tách Áo quần / Phụ kiện"}
            </h3>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
              expandedSections.strip ? "rotate-180 text-[#FF5D00]" : ""
            }`} 
          />
        </button>
        
        {expandedSections.strip && (
          <div className="pt-1 transition-all">
            <label className="flex items-center gap-3 p-3.5 bg-neutral-900/30 border border-white/5 rounded-2xl cursor-pointer select-none hover:bg-neutral-900/50 transition-all">
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={options.removeAccessoriesClothing}
                  onChange={(e) => setSetting("removeAccessoriesClothing", e.target.checked)}
                  disabled={isLoading}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/20 rounded-full peer peer-checked:bg-white relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white peer-checked:after:bg-[#FF6B00] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wide font-sans">
                  {language === "en" ? "Strip Clothes & Accessories" : "Bốc tách Áo quần / Phụ kiện"}
                </span>
                <p className="text-[9px] text-white/50 leading-tight">
                  {language === "en" ? "Removes secondary gear/props to render base anatomy" : "Loại bỏ khiên giáp, váy áo để phô bày rõ khối giải phẫu ecorche thuần túy"}
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* 6. BACKGROUND SELECTIONS */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("backdrop")}
          className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Square className="w-4 h-4 text-[#FF5D00]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
              {language === "en" ? "Studio Backdrop Colors" : "Phông nền môi trường"}
            </h3>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
              expandedSections.backdrop ? "rotate-180 text-[#FF5D00]" : ""
            }`} 
          />
        </button>
        
        {expandedSections.backdrop && (
          <div className="grid grid-cols-3 gap-2 pt-1 transition-all">
            {BACKGROUND_COLORS.map((bg) => {
              const isSelected = options.backgroundColor === bg.id;
              let labelVal = bg.label;
              if (language === "vi") {
                if (bg.id === "WHITE") labelVal = "TRẮNG";
                if (bg.id === "BLACK") labelVal = "ĐEN";
                if (bg.id === "NEUTRAL") labelVal = "TRUNG TÍNH";
              }
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setSetting("backgroundColor", isSelected ? "" : bg.id)}
                  disabled={isLoading}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 h-14 ${
                    isSelected
                      ? "bg-white/15 border-white"
                      : "bg-white/5 border-transparent hover:bg-white/10"
                  } ${isLoading ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
                >
                  <div className={`w-4 h-4 rounded-full shadow-inner border border-white/20 ${bg.cssClass}`} />
                  <span className="text-[9px] font-bold tracking-wider">
                    {labelVal}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. OVERRIDE NOTES */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
        <button
          type="button"
          onClick={() => toggleSection("notes")}
          className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#FF5D00]" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
              {language === "en" ? "Custom Directives Notes" : "Ghi chú điều khoản bổ sung"}
            </h3>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
              expandedSections.notes ? "rotate-180 text-[#FF5D00]" : ""
            }`} 
          />
        </button>
        
        {expandedSections.notes && (
          <div className="pt-1 transition-all">
            <textarea
              value={options.customInstruction}
              onChange={(e) => setSetting("customInstruction", e.target.value)}
              disabled={isLoading}
              rows={2}
              placeholder={language === "en" ? "E.g., highlight deep musculature ridges, terracotta clay feel..." : "Ví dụ: làm nổi rõ cơ hông, thể hiện vân móng tay..."}
              className="w-full text-xs p-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-white focus:outline-none transition-all resize-none font-sans"
            />
          </div>
        )}
      </div>

    </div>
  );
}
