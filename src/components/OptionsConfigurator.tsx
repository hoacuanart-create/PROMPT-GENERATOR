import React from "react";
import { 
  Sparkles, Layers, CircleDot, Sun, Eye, Scissors, Square, EyeOff, Accessibility 
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
    <div className="space-y-6 text-white select-none">
      
      {/* 1. REFERENCE MATERIALS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <Layers className="w-4 h-4 text-white/75" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
            {language === "en" ? "Surface Materials" : "Chất liệu bề mặt"}
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {MATERIAL_OPTIONS.map((mat) => {
            const isChecked = options.materials.includes(mat.label);
            return (
              <label
                key={mat.id}
                className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? "bg-white/20 border-white/40"
                    : "bg-white/5 hover:bg-white/10 border-white/10"
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
      </div>

      {/* 2. COLOR & LIGHTING */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <CircleDot className="w-4 h-4 text-white/75" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
            {language === "en" ? "Color & Lighting" : "Màu sắc & Ánh sáng"}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Color list */}
          <div className="space-y-1.5 bg-white/5 p-2 rounded-xl border border-white/10">
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1 pl-1">
              {language === "en" ? "Color Palette" : "Bảng màu"}
            </p>
            {COLOR_OPTIONS.map((col) => {
              const isSelected = options.color === col.label;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setSetting("color", col.label)}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "bg-[#FF5D00] text-white border-[#FF5D00] font-bold"
                      : "bg-transparent hover:bg-white/5 border-transparent text-white/70"
                  } ${isLoading ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
                >
                  <span className="text-xs font-sans">
                    {language === "en" ? col.label : (col.id === "GREY" ? "Thang độ xám" : "Đất sét cam")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lighting list */}
          <div className="space-y-1.5 bg-white/5 p-2 rounded-xl border border-white/10">
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1 pl-1">
              {language === "en" ? "Lighting Setup" : "Thiếu lập Ánh sáng"}
            </p>
            {LIGHTING_OPTIONS.map((light) => {
              const isSelected = options.lighting === light.label;
              return (
                <button
                  key={light.id}
                  type="button"
                  onClick={() => setSetting("lighting", light.label)}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "bg-[#FF5D00] text-white border-[#FF5D00] font-bold"
                      : "bg-transparent hover:bg-white/5 border-transparent text-white/70"
                  } ${isLoading ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
                >
                  <span className="text-xs font-sans">
                    {language === "en" ? light.label : (light.id === "STUDIO" ? "Ánh sáng Studio" : "Ánh sáng Rim Light")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. CAM PERSPECTIVES */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <Eye className="w-4 h-4 text-white/75" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
            {language === "en" ? "Anatomical Perspectives" : "Góc quay camera phối cảnh"}
          </h3>
        </div>
        <select
          value={options.view}
          onChange={(e) => setSetting("view", e.target.value)}
          disabled={isLoading}
          className="w-full bg-stone-900/40 border border-white/15 rounded-xl p-3 text-xs focus:outline-none text-white focus:bg-stone-950 cursor-pointer"
        >
          {VIEW_OPTIONS.map((vw) => (
            <option key={vw.id} value={vw.label} className="text-neutral-900 bg-white font-sans font-medium">
              {vw.label === "FRONT VIEW" && language === "vi" ? "GÓC NHÌN CHÍNH DIỆN — Symmetrical standard study" : vw.label === "SIDE PROFILE VIEW" && language === "vi" ? "GÓC CHÂN DUNG THEO BÊN NGANG — Side silhouette blueprint" : vw.label === "BACK VIEW" && language === "vi" ? "GÓC NHÌN TỪ PHÍA SAU — Posterior study details" : `${vw.label} — ${vw.description}`}
            </option>
          ))}
        </select>
      </div>

      {/* 3.5. FORCED 3D POSTURES */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <Accessibility className="w-4 h-4 text-white/75 animate-pulse" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
            {language === "en" ? "Forced 3D Posture Model Stance" : "Tư thế ép buộc mô hình (3D rigging)"}
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
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
                onClick={() => setSetting("forcePose", pose.id)}
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
      </div>

      {/* 4. ANATOMY FOCAL DETAIL */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <Layers className="w-4 h-4 text-white/75" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
            {language === "en" ? "Anatomy Focus Selection" : "Vùng Giải phẫu Tiêu biểu"}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* 5. STRIP ACCESSORIES & CLOTHES */}
      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl cursor-pointer select-none hover:bg-white/10 transition-all">
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

      {/* 6. BACKGROUND SELECTIONS */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <Square className="w-4 h-4 text-white/75" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
            {language === "en" ? "Studio Backdrop Colors" : "Phông nền môi trường"}
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
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
                onClick={() => setSetting("backgroundColor", bg.id)}
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
      </div>

      {/* 7. OVERRIDE notes */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 pl-1 block">
          {language === "en" ? "Custom Directives Notes" : "Ghi chú điều khoản bổ sung"}
        </label>
        <textarea
          value={options.customInstruction}
          onChange={(e) => setSetting("customInstruction", e.target.value)}
          disabled={isLoading}
          rows={2}
          placeholder={language === "en" ? "E.g., highlight deep musculature ridges, terracotta clay feel..." : "Ví dụ: làm nổi rõ cơ hông, thể hiện vân móng tay..."}
          className="w-full text-xs p-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:border-white focus:outline-none transition-all resize-none font-sans"
        />
      </div>

    </div>
  );
}
