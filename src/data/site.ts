// ============================================================
// 站点个人信息配置 —— 改这里即可全站生效
// ============================================================

export const SITE = {
  name: "Wenhua Huo",
  nameZh: "霍文华",
  logo: "Wenhua", // 左上角 logo 文字
  role: "Ph.D. Candidate",
  roleZh: "博士研究生",
  taglineLabel: "船舶与海洋工程 × AI / DEEP LEARNING",
  taglines: [
    "攻读博士学位期间，围绕船舶与海洋工程领域的智能化方法开展研究，",
    "关注 AI4CAD、AI4CFD 与深度学习机制的工程落地，",
    "在这里持续记录开源项目与科研进展。",
  ],
  // 档案卡（About 页左下角）
  profile: {
    id: "PROFILE.001",
    name: "WENHUA-HUO",
    role: "PHD CANDIDATE / RESEARCHER",
    status: "RESEARCH & BUILDING",
    edu: "SHIP & OCEAN ENGINEERING",
    category: ["AI4CAD", "AI4CFD", "DEEP LEARNING"],
    focus: ["AI AGENT", "DEEP LEARNING", "OPEN SOURCE"],
    methodology: ["VIBE CODING", "REAL PROJECT"],
    lang: "ZH / EN",
    ver: "V 1.0.0",
    est: "EST. 2025",
  },
  contact: {
    email: "wenhua_huo@hrbeu.edu.cn",
    github: "https://github.com/wenhuahuo",
    githubUser: "@wenhuahuo",
    scholar: "", // 如有 Google Scholar 主页可填，留空则不显示
    location: "China",
  },
  // 联系页顶部滚动关键词
  marquee: [
    "AI4CAD",
    "AI4CFD",
    "Deep Learning",
    "AI Agent",
    "Open Source",
    "Vibe Coding",
    "Ship CFD",
    "Unstructured Mesh",
  ],
};

// ============================================================
// 技术栈（About 页右侧，INDEX 索引卡形式）
// ============================================================
export const STACK = [
  { name: "Python / PyTorch", note: "deep learning · research code" },
  { name: "TypeScript", note: "web tools · agent apps" },
  { name: "Pi Agent", note: "agent workflow · automation" },
  { name: "FreeCAD", note: "parametric CAD · ship geometry" },
  { name: "OpenFOAM", note: "CFD · unstructured mesh" },
  { name: "Slurm / HPC Cluster", note: "high performance computing" },
];

// ============================================================
// 项目数据 —— category: 'open' 开源项目 / 'research' 科研项目
// repo: 'user/repo'，构建时自动抓取 GitHub Star 数（失败不影响构建）
// link: 项目链接（GitHub 仓库 / 论文 / Demo 页）
// ============================================================
export type Project = {
  num: string;
  category: "open" | "research";
  title: string;
  desc: string;
  year: string;
  lang: string;
  tags: string[];
  starLabel: string;
  repo?: string;
  link?: string;
};

export const PROJECTS: Project[] = [
  {
    num: "01",
    category: "open",
    title: "BABY — Build Agent Benchmarks for Yourself",
    desc: "自己动手构建 Agent 基准：为 AI Agent 工作流设计可复现的评测任务与基准框架，用真实任务衡量 Agent 的真实能力。",
    year: "2025",
    lang: "TypeScript",
    tags: ["Agent", "Benchmark", "AI Workflow"],
    starLabel: "AGENT / BENCH",
    repo: "wenhuahuo/BABY",
    link: "https://github.com/wenhuahuo/BABY",
  },
  {
    num: "02",
    category: "research",
    title: "APPSolver — 非结构网格船舶流场逐点预测",
    desc: "基于自适应 Patch 划分（APP）的船舶流动逐点预测：在原始非结构 CFD 网格上直接进行 next-step 流场预测，将非均匀点云转换为 patch token，并与 LLM 编码的 condition token 融合。",
    year: "2025",
    lang: "Python",
    tags: ["船舶CFD", "非结构网格", "LLM"],
    starLabel: "R / SHIP-CFD",
    repo: "wenhuahuo/APPSolver",
    link: "https://github.com/wenhuahuo/APPSolver",
  },
  {
    num: "03",
    category: "open",
    title: "heu-vpn-clash — 优雅使用 Clash 连接哈工程 HEU VPN",
    desc: "校园网 VPN 接入工具：让 Clash 优雅地连接哈工程 HEU VPN，简化校内资源的网络配置流程。",
    year: "2025",
    lang: "Python",
    tags: ["Clash", "校园网", "网络配置"],
    starLabel: "TOOL / HEU-VPN",
    repo: "wenhuahuo/heu-vpn-clash",
    link: "https://github.com/wenhuahuo/heu-vpn-clash",
  },
];

// 工具：从文章 frontmatter 之外复用
export const NAV = [
  { href: "/about", label: "关于" },
  { href: "/writing", label: "文章" },
  { href: "/work", label: "项目" },
  { href: "/contact", label: "联系" },
];
