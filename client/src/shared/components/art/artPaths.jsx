// رسوم خطية للبطاقات: ذهبي على كحلي، viewBox 200×120
export const ART = {
  brain: <g><path d="M68 44c-16 0-26 13-22 27 2 12 13 20 26 18h56c13 2 24-6 26-18 4-14-6-27-22-27-4-10-17-15-32-11-15-4-28 1-32 11z" /><path d="M100 32v58M84 47c7 4 11 9 11 15M116 47c-7 4-11 9-11 15" /><path d="M20 70q6-14 12 0t12 0t12 0" /><path d="M150 95q5-10 10 0t10 0t10 0" /></g>,
  eye: <g><path d="M22 60q34-28 68 0" /><path d="M40 68l-5 8M56 72l-2 9M72 68l5 8" /><path d="M110 60q34-28 68 0q-34 28-68 0z" /><circle cx="144" cy="60" r="9" /><path d="M130 30l6 6M158 30l-6 6M144 22v8" /></g>,
  cycle: <g><path d="M14 92h14v-18h14v-26h14v26h14v18h14v-18h14v-26h14v26h14v18h14v-18h14v-26h14" /><path d="M14 100h172" strokeDasharray="3 5" /><path d="M14 40h6M14 66h6" /></g>,
  wash: <g><path d="M74 78c-20 0-28-24-10-34 6-14 30-14 40 0 18-10 28 14 8 24" /><path d="M56 30c-4 8 0 12 4 12s8-4 4-12l-4-8z" /><path d="M150 40c-4 8 0 12 4 12s8-4 4-12l-4-8z" /><path d="M118 96c-4 8 0 12 4 12s8-4 4-12l-4-8z" /><path d="M30 100q10-8 20 0t20 0t20 0t20 0t20 0t20 0" /></g>,
  transfer: <g><rect x="18" y="44" width="40" height="32" rx="6" /><path d="M28 60h20M38 52v16" /><path d="M66 60h48M106 52l10 8-10 8" /><rect x="122" y="30" width="60" height="60" rx="8" /><path d="M134 46h36M134 60h36M134 74h24" /></g>,
  shield: <g><path d="M100 18l42 14v30c0 26-19 42-42 50-23-8-42-24-42-50V32z" /><path d="M84 62l11 11 24-26" /><path d="M20 40q8 4 16 0M20 84q8 4 16 0M164 40q8 4 16 0M164 84q8 4 16 0" /></g>,
  bed: <g><path d="M22 88V58h120v30M22 74h120M36 58v-10h30v10" /><circle cx="164" cy="44" r="18" /><path d="M164 32v12l8 6" /><path d="M56 30q6-8 12 0M76 24q6-8 12 0" /></g>,
  drop: <g><path d="M18 26c30 6 46 46 80 62 20 10 40 12 84 10" /><path d="M18 100h164M18 100V20" /><rect x="132" y="28" width="30" height="34" rx="5" /><path d="M162 38h8a8 8 0 0 1 0 16h-8M140 22q3-6 0-12M150 22q3-6 0-12" /></g>,
  sunmoon: <g><circle cx="46" cy="52" r="16" /><path d="M46 22v8M46 74v8M16 52h8M68 52h8M25 31l6 6M61 67l6 6M25 73l6-6M61 37l6-6" /><path d="M152 34a22 22 0 1 0 16 36a18 18 0 0 1-16-36z" /><path d="M74 96q26-40 52 0t52 0" strokeDasharray="4 5" /></g>,
  list: <g>{[30, 46, 62, 78, 94].map((y, i) => <g key={y}><circle cx="30" cy={y} r="7" /><path d={`M26 ${y}l3 3 5-6`} /><path d={`M50 ${y}h${i % 2 ? 90 : 120}`} /></g>)}</g>,
  curve: <g><path d="M20 100V20M20 100h164" /><path d="M20 24c30 30 60 50 100 62 20 6 40 8 60 10" /><path d="M60 48c10-4 14-8 16-14M100 70c10-4 14-8 16-14M140 84c10-4 14-8 16-14" strokeDasharray="3 3" /><circle cx="60" cy="48" r="3" /><circle cx="100" cy="70" r="3" /><circle cx="140" cy="84" r="3" /></g>,
  bars: <g><path d="M20 100h164" /><rect x="44" y="60" width="36" height="40" rx="4" /><rect x="120" y="26" width="36" height="74" rx="4" /><path d="M52 44h20M128 12h20M62 36v-10M138 4v-2" strokeDasharray="2 3" /></g>,
  network: <g>{[[40, 40], [100, 24], [160, 44], [60, 92], [130, 86], [100, 58]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" />)}<path d="M47 44l46 12M106 30l48 12M100 65l24 16M93 60l-28 26M107 55l46-8M46 46l10 40" /></g>,
  wheel: <g><circle cx="100" cy="60" r="52" /><circle cx="100" cy="60" r="36" /><circle cx="100" cy="60" r="20" /><circle cx="100" cy="60" r="6" /><path d="M100 8v104M48 60h104M63 23l74 74M137 23l-74 74" strokeOpacity=".6" /></g>,
};
