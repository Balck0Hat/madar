import {
  Smartphone, Laptop, Router, Radio, Building2, Cloud, Server, Database, Lock, Globe, Monitor, Shield, MapPin, Waves, Cable,
  Cpu, MemoryStick, HardDrive, CircuitBoard, Power, Terminal, AppWindow, User, KeyRound, Mail, FileText, Brain, Package, Layers,
  UserX, ShieldCheck, Code2, FlaskConical, Rocket, GitBranch, Image, Blocks, Bot, MessageSquare, Zap, Cog, Binary, Boxes, Users, Table2, Sparkles, Eye, Timer, Inbox, Hash, Send,
} from "lucide-react";

// أنواع العقد في الرسوم المتحركة: أيقونة واسم احتياطي. تُستعمل في كل الأقسام لا الشبكات فقط.
export const KIND = {
  // شبكات
  phone: [Smartphone, "هاتف"], laptop: [Laptop, "حاسوب"], pc: [Monitor, "جهاز"], router: [Router, "راوتر"], modem: [Radio, "مودم"], isp: [Building2, "مزوّد الإنترنت"],
  cloud: [Cloud, "الإنترنت"], server: [Server, "خادم"], dns: [Database, "خادم DNS"], lock: [Lock, "TLS"], site: [Globe, "الموقع"], vpn: [Shield, "خادم VPN"], cdn: [MapPin, "نسخة قريبة"], sea: [Waves, "كابل بحري"], cable: [Cable, "كابل"],
  // عتاد ونظام
  cpu: [Cpu, "المعالج"], ram: [MemoryStick, "الذاكرة"], disk: [HardDrive, "التخزين"], board: [CircuitBoard, "اللوحة"], power: [Power, "الطاقة"], firmware: [Cog, "البرنامج الثابت"], kernel: [Layers, "النواة"],
  layers: [Layers, "طبقة"], cog: [Cog, "وحدة"], app: [AppWindow, "تطبيق"], terminal: [Terminal, "سطر أوامر"], box: [Package, "حاوية"], boxes: [Boxes, "حاويات"], binary: [Binary, "بتّات"], timer: [Timer, "المجدول"], gpu: [Zap, "بطاقة الرسوم"],
  // برمجة
  code: [Code2, "الكود"], git: [GitBranch, "المستودع"], test: [FlaskConical, "اختبارات"], rocket: [Rocket, "نشر"], db: [Database, "قاعدة بيانات"], table: [Table2, "جدول"], json: [FileText, "بيانات"],
  // أمن
  user: [User, "أنت"], users: [Users, "مستخدمون"], attacker: [UserX, "مهاجم"], key: [KeyRound, "مفتاح"], shield: [ShieldCheck, "حماية"], mail: [Mail, "بريد"], doc: [FileText, "ملف"], eye: [Eye, "متلصّص"], hash: [Hash, "بصمة"],
  // ذكاء اصطناعي وبرمجيات
  brain: [Brain, "نموذج"], bot: [Bot, "مساعد"], image: [Image, "صور"], blocks: [Blocks, "كتل"], chat: [MessageSquare, "محادثة"], sparkles: [Sparkles, "توقّع"], inbox: [Inbox, "صندوق الوارد"], send: [Send, "إرسال"],
};
