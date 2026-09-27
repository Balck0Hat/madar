// شجرة خريطة التقنية: المركز «التقنية»، ثمانية فروع، وفي كل فرع مجموعات من الموضوعات.
// محتوى كل موضوع في topics/<branch>.js بالمعرّف نفسه. المستويات: basics (المستخدم العادي)،
// intermediate (كيف يعمل من الداخل)، advanced (للمهتم أو المحترف).
export const BRANCHES = [
  { id: "hardware", title: "العتاد", en: "Hardware", hue: "blue", groups: [
    { id: "computer-parts", title: "مكوّنات الحاسوب", en: "Computer parts", topics: ["cpu", "ram", "storage-ssd-hdd", "motherboard", "gpu", "psu-cooling"] },
    { id: "devices", title: "الأجهزة", en: "Devices", topics: ["laptops-vs-desktops", "smartphones", "peripherals", "displays"] },
    { id: "electronics", title: "الإلكترونيات", en: "Electronics", topics: ["microcontrollers", "sensors-iot-hardware", "batteries-charging", "3d-printing"] },
  ] },
  { id: "os", title: "أنظمة التشغيل", en: "Operating systems", hue: "violet", groups: [
    { id: "os-basics", title: "أساسيات", en: "Basics", topics: ["what-is-os", "files-folders", "users-permissions", "updates-drivers"] },
    { id: "os-families", title: "عائلات الأنظمة", en: "Families", topics: ["windows", "linux", "macos", "android-ios"] },
    { id: "os-advanced", title: "تحت الغطاء", en: "Under the hood", topics: ["command-line", "processes-memory", "virtual-machines-containers", "boot-bios-uefi"] },
  ] },
  { id: "networks", title: "الشبكات والإنترنت", en: "Networks & internet", hue: "teal", groups: [
    { id: "how-internet-works", title: "كيف يعمل الإنترنت", en: "How the internet works", topics: ["ip-addresses", "dns", "http-https", "isp-and-backbone"] },
    { id: "home-network", title: "الشبكة المنزلية", en: "Home network", topics: ["router-modem", "wifi", "ethernet-cables", "bandwidth-latency"] },
    { id: "net-advanced", title: "متقدم", en: "Advanced", topics: ["tcp-udp-ports", "vpn", "cloud-computing", "cdn-and-servers"] },
  ] },
  { id: "programming", title: "البرمجة", en: "Programming", hue: "lime", groups: [
    { id: "concepts", title: "المفاهيم الأساسية", en: "Core concepts", topics: ["what-is-programming", "variables-types", "conditions-loops", "functions", "debugging"] },
    { id: "languages", title: "اللغات والمجالات", en: "Languages & fields", topics: ["python", "javascript-web", "mobile-apps", "sql-databases"] },
    { id: "prog-practice", title: "عمل المبرمج", en: "Developer practice", topics: ["git-version-control", "apis", "algorithms-data-structures", "testing-deployment"] },
  ] },
  { id: "security", title: "الأمن السيبراني", en: "Cybersecurity", hue: "pink", groups: [
    { id: "personal-security", title: "حمايتك الشخصية", en: "Personal security", topics: ["passwords-managers", "two-factor", "phishing", "privacy-settings", "backups"] },
    { id: "threats", title: "التهديدات", en: "Threats", topics: ["malware-types", "ransomware", "social-engineering", "public-wifi-risks"] },
    { id: "sec-concepts", title: "مفاهيم", en: "Concepts", topics: ["encryption", "firewalls", "ethical-hacking", "zero-day-and-updates"] },
  ] },
  { id: "ai", title: "الذكاء الاصطناعي والبيانات", en: "AI & data", hue: "orange", groups: [
    { id: "ai-basics", title: "أساسيات", en: "Basics", topics: ["what-is-ai", "machine-learning", "neural-networks", "llms-chatgpt"] },
    { id: "ai-fields", title: "مجالات", en: "Fields", topics: ["computer-vision", "speech-and-translation", "recommendation-systems", "generative-images"] },
    { id: "data", title: "البيانات", en: "Data", topics: ["data-science", "big-data", "prompting", "ai-ethics-limits"] },
  ] },
  { id: "software", title: "البرمجيات والأدوات", en: "Software & tools", hue: "yellow", groups: [
    { id: "software-types", title: "أنواع البرمجيات", en: "Types", topics: ["system-vs-application", "open-source", "saas-and-subscriptions", "app-stores"] },
    { id: "everyday-tools", title: "أدوات يومية", en: "Everyday tools", topics: ["browsers", "office-suites", "cloud-storage-sync", "email-and-messaging"] },
    { id: "creative-tools", title: "الإبداع والإنتاجية", en: "Creative & productivity", topics: ["image-editing", "video-audio", "note-taking-pkm", "automation-tools"] },
  ] },
  { id: "concepts", title: "مفاهيم رقمية", en: "Digital concepts", hue: "slate", groups: [
    { id: "how-computers-think", title: "كيف يفكر الحاسوب", en: "How computers think", topics: ["binary-bits-bytes", "how-cpu-executes", "file-formats-compression", "units-and-specs"] },
    { id: "emerging", title: "تقنيات ناشئة", en: "Emerging tech", topics: ["blockchain-crypto", "internet-of-things", "vr-ar", "quantum-computing"] },
    { id: "literacy", title: "ثقافة رقمية", en: "Digital literacy", topics: ["tech-history", "digital-footprint", "reading-tech-news", "careers-in-tech"] },
  ] },
];

export const TOPIC_IDS = BRANCHES.flatMap((b) => b.groups.flatMap((g) => g.topics));
export const LEVELS = ["basics", "intermediate", "advanced"];
export const LEVEL_LABELS = { basics: "أساسي", intermediate: "متوسط", advanced: "متقدم" };
