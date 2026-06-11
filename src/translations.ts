export interface TranslationKeys {
  appName: string;
  appSubName: string;
  activeLanguage: string;
  geminiActive: string;
  resetWorkspace: string;
  resetShort: string;
  refTab: string;
  specsTab: string;
  bananaTab: string;
  threeDTab: string;
  toastSuccess: string;
  toastReset: string;
  toastCopied: string;
  toastDownloaded: string;
  toastRemoveHistory: string;
  toastCopiedBanana: string;
  toastFailed: string;
  referencePort: string;
  referenceSub: string;
  specsHeader: string;
  bananaHeader: string;
  bananaSub: string;
  aspectRatio: string;
  stepRefSource: string;
  noRefImages: string;
  noRefImagesLink: string;
  stepAspect: string;
  stepDirectives: string;
  textareaPlaceholder: string;
  optimizePrompt: string;
  pleaseImportFirst: string;
  sculptCopiedText: string;
  noRefActive: string;
  noRefActiveSub: string;
  specsConfig: string;
  colorLabel: string;
  angleLabel: string;
  poseLabel: string;
  ecoLabel: string;
  focusLabel: string;
  originalPose: string;
  resultingPromptBlueprints: string;
  promptDescriptionRefined: string;
  activeOutputs: string;
  importRefFirst: string;
  uploadRefText: string;
  copyOptimizedPrompt: string;
  downloadSpecArchive: string;
  volumetricStudyGuide: string;
  clayMockBadge: string;
  noReferenceSelected: string;
  threeDMarketDirectory: string;
  exploreThreeDPlatforms: string;
  zeroSetupCosts: string;
  zeroSetupCostsSub: string;
  visitWebsite: string;
  proHint: string;
  freeMarketDirectory: string;
  recentSessions: string;
  historyDescription: string;
  anatomyFocalStudy: string;
  noHistoricalSessions: string;
  excludeAccessoriesText: string;
}

export const TRANSLATIONS: Record<"en" | "vi", TranslationKeys> = {
  en: {
    appName: "CHARACTER",
    appSubName: "CREATION",
    activeLanguage: "English",
    geminiActive: "Gemini Active",
    resetWorkspace: "Reset Workspace",
    resetShort: "Reset",
    refTab: "Ref",
    specsTab: "Specs",
    bananaTab: "Banana",
    threeDTab: "3D Model",
    toastSuccess: "Sculpt session prompt synthesized successfully!",
    toastReset: "Workspace parameters clean slate configured.",
    toastCopied: "Copied optimized prompt text to clipboard!",
    toastDownloaded: "Prompt archive document downloaded.",
    toastRemoveHistory: "History clean card removed.",
    toastCopiedBanana: "Sculpt Prompt Copied! Ready to paste.",
    toastFailed: "Prompt optimization failed.",
    referencePort: "Reference Port",
    referenceSub: "Feed raw concepts or reference images inside the Gemini model workspace to generate customized structural guidelines.",
    specsHeader: "Specifications Style",
    bananaHeader: "Banana Sculpting",
    bananaSub: "Design pristine high-poly clay models. Select your target specs, and generate/copy sculpt prompt blueprints optimized directly for Google Labs Flow.",
    aspectRatio: "Aspect Ratio",
    stepRefSource: "Step 1: Select Reference Source",
    noRefImages: "No reference images. Switch to the ",
    noRefImagesLink: "Ref tab to upload.",
    stepAspect: "Step 2: Aspect Ratio",
    stepDirectives: "Step 3: Sculpt Directives",
    textareaPlaceholder: "Describe how security, features, anatomy, or styles should morph into Orange Clay...",
    optimizePrompt: "Optimize Prompt",
    pleaseImportFirst: "* Please import reference images first under Ref",
    sculptCopiedText: "Copy Sculpt Prompt",
    noRefActive: "No Reference Active",
    noRefActiveSub: "Please upload front views, anatomy details, or sculpt samples in the left Ref tab panel to boot the synth engine.",
    specsConfig: "Specs Configuration",
    colorLabel: "COLOR",
    angleLabel: "ANGLE",
    poseLabel: "POSE",
    ecoLabel: "ECO",
    focusLabel: "FOCUS",
    originalPose: "ORIGINAL",
    resultingPromptBlueprints: "Resulting 3D prompt blueprints",
    promptDescriptionRefined: "These optimized descriptors have been refined by Gemini from your references. Copy them directly into 3D AI generators for elite results.",
    activeOutputs: "Active Workspace Outputs",
    importRefFirst: "Import Reference Layout first",
    uploadRefText: "Upload reference study designs to craft optimized parameters instantly.",
    copyOptimizedPrompt: "COPY OPTIMIZED PROMPT",
    downloadSpecArchive: "DOWNLOAD SPEC ARCHIVE (.TXT)",
    volumetricStudyGuide: "Volumetric study & clay guide",
    clayMockBadge: "CLAY MOCK",
    noReferenceSelected: "No Reference Image Selected",
    threeDMarketDirectory: "AI 3D Market Directory",
    exploreThreeDPlatforms: "Explore the top-tier 3D AI generator platforms of the industry offering generous free tiers or trial credits.",
    zeroSetupCosts: "Zero Setup Costs",
    zeroSetupCostsSub: "With direct external link pathways, you can generate fully-reconstructed 3D meshes for free on Google Labs or community spaces and import them in your workflows.",
    visitWebsite: "Visit Website",
    proHint: "Generate the styled images through Google Labs ImageFX first with our custom prompt blueprint, then drag them into one of these modelers to finalize your high-poly asset sets.",
    freeMarketDirectory: "FREE MARKET CONSTRUCTOR DIRECTORY",
    recentSessions: "Recent study sessions",
    historyDescription: "Browse previously optimized directives and prompts preserved locally in active memory.",
    anatomyFocalStudy: "Anatomy focal study",
    noHistoricalSessions: "No historical study sessions recorded yet.",
    excludeAccessoriesText: "Exclude clothes & items for pure anatomical sculpting ecorche"
  },
  vi: {
    appName: "CÔNG CỤ TẠO",
    appSubName: "NHÂN VẬT",
    activeLanguage: "Tiếng Việt",
    geminiActive: "Trợ lý Gemini hoạt động",
    resetWorkspace: "Đặt lại Thiết bị",
    resetShort: "Đặt lại",
    refTab: "Mẫu",
    specsTab: "Thông số",
    bananaTab: "Từ Banana",
    threeDTab: "Chợ AI 3D",
    toastSuccess: "Đã biên soạn hoàn chỉnh thông số từ khóa điêu khắc đất sét!",
    toastReset: "Đã đặt lại tất cả thông số bàn làm việc!",
    toastCopied: "Đã sao chép từ khóa tối ưu vào khay nhớ tạm!",
    toastDownloaded: "Đã tải xuống tài liệu lưu trữ từ khóa!",
    toastRemoveHistory: "Đã xóa bản ghi lịch sử thành công!",
    toastCopiedBanana: "Đã sao chép từ khóa điêu khắc mới! Sẵn sàng dán.",
    toastFailed: "Gặp sự cố tối ưu hóa từ khóa.",
    referencePort: "Hình ảnh Mẫu",
    referenceSub: "Tải lên các bản vẽ phác thảo hoặc hình ảnh tham chiếu để mô hình Gemini phân tích và sản xuất từ khóa cấu trúc chuyên môn.",
    specsHeader: "Danh mục Thông số",
    bananaHeader: "Kiến tạo cùng Banana",
    bananaSub: "Thiết kế các mô hình đất sét high-poly tinh khiết. Chọn cấu hình mục tiêu của bạn và tạo/sao chép trực tiếp từ khóa tối ưu cho Google Labs Flow.",
    aspectRatio: "Tỷ lệ ảnh",
    stepRefSource: "Bước 1: Chọn Nguồn Hình Ảnh",
    noRefImages: "Không có ảnh mẫu dưới máy. Vui lòng chuyển sang ",
    noRefImagesLink: "tab Mẫu để tải lên.",
    stepAspect: "Bước 2: Chọn Tỷ lệ Khung hình",
    stepDirectives: "Bước 3: Ghi nhận Chỉ thị Điêu khắc",
    textareaPlaceholder: "Mô tả cách bạn muốn chuyển thể các đặc tính, giải phẫu, hoặc phong cách sang đất sét màu cam...",
    optimizePrompt: "Tối ưu hóa Từ khóa",
    pleaseImportFirst: "* Vui lòng tải tài liệu ảnh lên trước ở tab Mẫu",
    sculptCopiedText: "Sao chép Từ khóa",
    noRefActive: "Chưa kích hoạt Ảnh mẫu",
    noRefActiveSub: "Vui lòng tải lên các phối cảnh (góc nhìn trước, chi tiết giải phẫu...) ở mục Mẫu bên trái để kích hoạt công cụ phân tích.",
    specsConfig: "Bộ Thông số Hiện hành",
    colorLabel: "MÀU SẮC",
    angleLabel: "PHỐI CẢNH",
    poseLabel: "TƯ THẾ",
    ecoLabel: "GIẢI PHẪU",
    focusLabel: "ĐIỂM TẬP TRUNG",
    originalPose: "GỐC",
    resultingPromptBlueprints: "Từ khóa 3D tối ưu hóa",
    promptDescriptionRefined: "Các mô tả thông số này đã được tinh chỉnh bởi Gemini từ phác thảo của bạn. Sao chép trực tiếp vào các mô hình 3D để đạt kết quả điêu khắc tốt nhất.",
    activeOutputs: "Bảng hiển thị Wordspace",
    importRefFirst: "Vui lòng nhập ảnh mẫu tham chiếu trước",
    uploadRefText: "Tải tài liệu mẫu dạng thiết kế hoặc ảnh chụp để kiến tạo từ khóa ngay.",
    copyOptimizedPrompt: "SAO CHÉP TỪ KHÓA TỐI ƯU",
    downloadSpecArchive: "TẢI TÀI LIỆU CHI TIẾT (.TXT)",
    volumetricStudyGuide: "Nghiên cứu thể tích & Đất sét mô phỏng",
    clayMockBadge: "ĐẤT SÉT CLAY MOCK",
    noReferenceSelected: "Chưa chọn hình ảnh mẫu nào",
    threeDMarketDirectory: "Danh mục Chợ AI 3D",
    exploreThreeDPlatforms: "Khám phá các nền tảng AI sinh mô hình 3D hàng dầy thị trường có phiên bản chạy thử miễn phí hoặc điểm khôi phục mỗi ngày.",
    zeroSetupCosts: "Tiêu chuẩn khôi phục",
    zeroSetupCostsSub: "Với đường dẫn trực tiếp, bạn có thể tạo mô hình 3D từ ảnh phác thảo hoàn toàn miễn phí trên Google Labs hoặc không gian Hugging Face.",
    visitWebsite: "Ghé thăm Trang chủ",
    proHint: "Tạo ảnh điêu khắc qua Google Labs ImageFX trước dựa trên từ khóa tối ưu, sau đó kéo ảnh vào các công cụ 3D này để trích xuất vật thể lồi lõm cực kỳ hiệu quả.",
    freeMarketDirectory: "DANH MỤC THỬ NGHIỆM MIỄN PHÍ TRÊN THỊ TRƯỜNG",
    recentSessions: "Phiên làm việc gần đây",
    historyDescription: "Duyệt nhanh và tham khảo lại các thông số bản vẽ 3D được lưu trữ trong bộ nhớ đệm cục bộ.",
    anatomyFocalStudy: "Khu vực giải phẫu",
    noHistoricalSessions: "Hiện chưa có ghi chép lịch sử phiên học tập nào.",
    excludeAccessoriesText: "Tách quần áo & trang bị để bộc lộ rõ giải phẫu Ecorche"
  }
};
