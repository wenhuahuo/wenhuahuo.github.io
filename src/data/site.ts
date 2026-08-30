// ============================================================
// 站点个人信息配置 —— 改这里即可全站生效
// ============================================================

export const SITE = {
  name: 'Wenhua Huo',
  nameZh: '霍文华',
  logo: 'Wenhua', // 左上角 logo 文字
  role: 'Ph.D. Candidate',
  roleZh: '博士研究生',
  taglineLabel: '船舶与海洋工程 × AI / DEEP LEARNING',
  taglines: [
    '攻读博士学位期间，围绕船舶与海洋工程领域的智能化方法开展研究，',
    '关注大模型安全、深度学习机制与工程软件的智能交互。',
    '在这里持续记录开源项目与科研进展。',
  ],
  // 档案卡（About 页左下角）
  profile: {
    id: 'PROFILE.001',
    name: 'WENHUA-HUO',
    role: 'PHD CANDIDATE / RESEARCHER',
    status: 'RESEARCH & BUILDING',
    edu: 'SHIP & OCEAN ENGINEERING',
    focus: ['LLM SAFETY', 'DEEP LEARNING', 'COMPUTER GRAPHICS'],
    lang: 'ZH / EN',
    ver: 'V 1.0.0',
    est: 'EST. 2025',
  },
  contact: {
    email: 'your-email@example.com', // TODO: 改成你的邮箱
    github: 'https://github.com/wenhuahuo',
    githubUser: '@wenhuahuo',
    scholar: '', // TODO: Google Scholar 主页链接，留空则不显示该卡片
    wechat: 'your-wechat-id', // TODO: 改成你的微信号
    location: 'China',
  },
  // 联系页顶部滚动关键词
  marquee: [
    'LLM Safety',
    'Deep Learning',
    'Mixture of Experts',
    'Computer Graphics',
    'NURBS / Geometry',
    'CFD',
    'Open Source',
    'Ph.D. Life',
  ],
};

// ============================================================
// 技能栈（About 页右侧 "信号台"）
// level: 1-10，柱状图高度；status: CORE / ACTIVE / APPLIED；years: 显示时长
// ============================================================
export const SKILLS = [
  { name: 'Python / PyTorch', level: 9, status: 'CORE', years: '3 YRS', note: 'deep learning' },
  { name: 'LLM / RAG / Agent', level: 8, status: 'ACTIVE', years: '2 YRS', note: 'applied research' },
  { name: 'LLM Safety / Guardrails', level: 7, status: 'ACTIVE', years: '1 YR', note: 'alignment' },
  { name: 'Mixture of Experts', level: 7, status: 'RESEARCH', years: '1 YR', note: 'mechanism study' },
  { name: 'Star-CCM+ / CFD', level: 7, status: 'APPLIED', years: '2 YRS', note: 'simulation' },
  { name: 'Computer Graphics', level: 6, status: 'APPLIED', years: '1 YR', note: 'geometry' },
  { name: 'LaTeX / Academic Writing', level: 8, status: 'CORE', years: '3 YRS', note: 'writing' },
  { name: 'Linux / HPC Cluster', level: 7, status: 'CORE', years: '3 YRS', note: 'slurm' },
];

// ============================================================
// 项目数据 —— category: 'open' 开源项目 / 'research' 科研项目
// repo: 'user/repo' 将在构建时自动抓取 GitHub Star 数（抓取失败不影响构建）
// link: 项目链接（GitHub 仓库 / 论文 / Demo 页）
// ============================================================
export type Project = {
  num: string;
  category: 'open' | 'research';
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
  // TODO: 以下均为占位项目，请替换成你的真实项目
  {
    num: '01',
    category: 'open',
    title: 'Curve Playground — 贝塞尔 / B-spline / NURBS 交互演示',
    desc: '用三个最小 Canvas 交互 demo 直观理解二维参数曲线：贝塞尔的整体控制、B-spline 的局部控制、NURBS 的权重调节。配套推导笔记。',
    year: '2026',
    lang: 'TypeScript',
    tags: ['Canvas', '计算几何', '图形学'],
    starLabel: 'CURVE / DEMO',
    link: '/writing/bezier-bspline-2d-interactive-demo',
  },
  {
    num: '02',
    category: 'open',
    title: 'MOE-Loss-Lab — Mixture of Experts 损失机制实验',
    desc: '复现 Adaptive Mixtures of Local Experts 中的合作 / 竞争损失，在旋转 MNIST 角度回归任务上观察 gating 行为与专家分工差异。',
    year: '2026',
    lang: 'Python',
    tags: ['PyTorch', 'MoE', '实验'],
    starLabel: 'MOE / LAB',
    link: '/writing/moe-loss-rotated-mnist-experiment',
  },
  {
    num: '03',
    category: 'open',
    title: 'LLM-Guardrails-Notes — 大模型安全输出实践',
    desc: '提示词限制与 AI 护栏两条技术路线的对照实验：敏感请求拒绝、领域外约束、合规检查应对，含基线测试集与评估记录。',
    year: '2026',
    lang: 'Python',
    tags: ['LLM安全', '提示词工程'],
    starLabel: 'SAFE / LLM',
    link: '/writing/limiting-llm-safe-output-prompt-and-ai-guardrails',
  },
  {
    num: '04',
    category: 'research',
    title: '船舶设计大模型的安全护栏体系',
    desc: '面向船舶与海洋工程领域大模型的输出安全约束研究：领域边界约束、敏感内容过滤、AI 护栏服务接入与合规评测。',
    year: '2026',
    lang: 'Research',
    tags: ['LLM安全', '船舶工程', '合规'],
    starLabel: 'R / SAFETY',
  },
  {
    num: '05',
    category: 'research',
    title: 'MOE 专家协作与竞争机制的可解释性研究',
    desc: '以旋转 MNIST 角度预测为最小实验平台，系统比较三类 MOE 损失函数对专家分工、gating 分布与收敛行为的影响。',
    year: '2026',
    lang: 'Research',
    tags: ['深度学习', 'MoE', '可解释性'],
    starLabel: 'R / MoE',
  },
  {
    num: '06',
    category: 'research',
    title: '参数化曲线在船舶几何设计中的应用探索',
    desc: '贝塞尔 / B-spline / NURBS 曲线在船体型线表达中的性质对比与交互式建模工具探索。',
    year: '2025',
    lang: 'Research',
    tags: ['几何建模', '图形学', '型线设计'],
    starLabel: 'R / GEOM',
  },
];

// 工具：从文章 frontmatter 之外复用
export const NAV = [
  { href: '/about', label: '关于' },
  { href: '/writing', label: '文章' },
  { href: '/work', label: '项目' },
  { href: '/contact', label: '联系' },
];
