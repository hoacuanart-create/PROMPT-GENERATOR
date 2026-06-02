/**
 * Types and Option lists for the Prompt Generator from Reference Image
 */

export interface ReferenceImage {
  id: string;
  name: string;
  size: string;
  type: string;
  data: string; // Base64 string
}

export interface PromptOptions {
  materials: string[]; // checkboxes
  color: string; // radio/select
  lighting: string; // radio/select
  view: string; // radio/select
  anatomy: string[]; // checkboxes
  removeAccessoriesClothing: boolean; // toggle
  backgroundColor: string; // radio/select
  forcePose: "NONE" | "A_POSE" | "T_POSE"; // forced pose option
  customInstruction: string;
}

export interface GeneratedPromptResult {
  prompt: string;
  analysis: string;
  tags: string[];
}

export interface SavedPromptItem {
  id: string;
  timestamp: string;
  images: string[]; // Small preview data URLs
  options: PromptOptions;
  result: GeneratedPromptResult;
}

export const MATERIAL_OPTIONS = [
  { id: "ZBRUSH_MATERIAL", label: "ZBRUSH MATERIAL", description: "Standard high-poly digital sculpt shader" },
  { id: "MATCAP_MATERIAL", label: "MATCAP MATERIAL", description: "Matte or metallic surface simulation cap" },
  { id: "3D_SCULPT_CLAY_MATERIAL", label: "3D SCULPT CLAY MATERIAL", description: "Real-world physical modeling clay style with tool marks" },
];

export const COLOR_OPTIONS = [
  { id: "GREY_SCALE_COLOR", label: "GREY SCALE COLOR", description: "Emphasis on form, depth, shadows" },
  { id: "FULL_COLOR", label: "FULL COLOR", description: "Fully detailed render spectrum with vibrant colors" },
  { id: "MONO_COLOR", label: "MONO COLOR", description: "Single-tone styling, e.g. terracotta or plaster" },
];

export const LIGHTING_OPTIONS = [
  { id: "SOFT_LIGHTING", label: "SOFT LIGHTING", description: "Even brightness with diffuse shadows" },
  { id: "STUDIO_LIGHTING", label: "STUDIO LIGHTING", description: "High contrast rim light, spotlight key setups" },
  { id: "NATURAL_REVEAL_LIGHTING", label: "NATURAL SUN LIGHTING", description: "Pure warm directional shafts of daylight" },
];

export const VIEW_OPTIONS = [
  { id: "FRONT", label: "FRONT VIEW", description: "Orthographic or perspective main view" },
  { id: "LEFT_SIDE_VIEW", label: "LEFT SIDE VIEW", description: "Side perspective from the left" },
  { id: "RIGHT_SIDE_VIEW", label: "RIGHT SIDE VIEW", description: "Side perspective from the right" },
  { id: "BACK_VIEW", label: "BACK VIEW", description: "Rear presentation of details" },
  { id: "TOP_VIEW", label: "TOP VIEW", description: "Plan/Bird's-eye anatomical structure" },
  { id: "BOTTOM_VIEW", label: "BOTTOM VIEW", description: "Low angle undercrest observation" },
  { id: "FULL_CHARACTER_SHEET", label: "FULL CHARACTER SHEET", description: "Turnaround or model-sheet with multiple perspectives" },
];

export const ANATOMY_OPTIONS = [
  { id: "FULL_BODY", label: "FULL BODY", description: "Check posture, proportions, overall pose" },
  { id: "ARM", label: "ARM", description: "Focus on musculature, bicep-tricep connection" },
  { id: "HANDS", label: "HANDS", description: "Detailed look at fingers, joints, and palm" },
  { id: "HEAD", label: "HEAD", description: "Focus on facial features, bone structure, expression" },
  { id: "HAIR", label: "HAIR", description: "Accentuate secondary form details, strands, and volume" },
  { id: "LEG", label: "LEG", description: "Observe quadriceps, knees, calve definition" },
  { id: "FEET", label: "FEET", description: "Flesh, soles, metatarsals, and weight-to-ground stance" },
];

export const BACKGROUND_COLORS = [
  { id: "WHITE", label: "WHITE", cssClass: "bg-white border-stone-200" },
  { id: "BLACK", label: "BLACK", cssClass: "bg-stone-900 border-stone-750" },
  { id: "NEUTRAL", label: "NEUTRAL", cssClass: "bg-[#7c7c7c] border-[#7c7c7c]" },
];

export const POSE_OPTIONS = [
  { id: "NONE", label: "ORIGINAL POSE", description: "Keep source pose" },
  { id: "A_POSE", label: "FORCE A-POSE", description: "Arms angled down at 45° with open fingers" },
  { id: "T_POSE", label: "FORCE T-POSE", description: "Arms parallel to ground in dynamic T-shape" },
];
