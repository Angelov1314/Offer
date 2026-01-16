// 核心数据类型定义

// MBTI 类型
export type MBTIType = 
  | 'ENTJ' | 'ENFJ' | 'ESFJ' | 'ESTJ'
  | 'ENTP' | 'ENFP' | 'ESFP' | 'ESTP'
  | 'INTJ' | 'INFJ' | 'ISFJ' | 'ISTJ'
  | 'INTP' | 'INFP' | 'ISFP' | 'ISTP';

// Big Five 个性维度
export interface BigFiveTraits {
  openness: number; // 0-100
  conscientiousness: number; // 0-100
  extraversion: number; // 0-100
  agreeableness: number; // 0-100
  neuroticism: number; // 0-100
}

// 个性标签
export type PersonalityTag =
  | 'ambitious' | 'curious' | 'risk_averse' | 'stubborn' | 'empathetic'
  | 'competitive' | 'perfectionist' | 'procrastinator' | 'resilient' | 'anxious'
  | 'charismatic' | 'introverted' | 'rebellious' | 'disciplined' | 'artistic'
  | 'logical' | 'humorous' | 'cooperative' | 'leader' | 'team_player'
  | 'pragmatic' | 'idealistic' | 'meticulous' | 'adventurous' | 'conservative'
  | 'patient' | 'impulsive' | 'strategic' | 'warm' | 'blunt';

// 国籍
export interface Nationality {
  code_alpha2: string;
  code_alpha3: string;
  name_en: string;
  name_zh?: string;
}

// 种族（游戏内分类）
export type RaceType =
  | 'White'
  | 'Black_or_African_American'
  | 'American_Indian_or_Alaska_Native'
  | 'Asian'
  | 'Native_Hawaiian_or_Other_Pacific_Islander'
  | 'Mixed'
  | 'Other'
  | string; // 允许自定义

// 先天属性
export interface InnateAttributes {
  looks: number; // 0-100
  height_cm: number; // 120-220
  iq: number; // 0-200
  eq: number; // 0-200
  mbti: MBTIType;
  nationality: string; // ISO 3166-1 alpha2 code
  race: RaceType;
  personality_big5: BigFiveTraits;
  personality_tags: PersonalityTag[];
}

// 申请属性（阶段 A：中学 → 大学）
export interface CollegeApplicationAttributes {
  gpa: number; // 0-100 (内部统一)
  standardized_tests: {
    sat?: number; // 400-1600
    act?: number; // 1-36
    toefl?: number; // 0-120
    ielts?: number; // 0-9
    ap?: { subject: string; score: number }[]; // 1-5
    ib?: number; // 0-45
    a_level?: { subject: string; grade: string }[];
  };
  extracurriculars: {
    clubs: string[];
    competitions: { name: string; award: string }[];
    research: { project: string; duration: number }[];
    entrepreneurship: { venture: string; success: number }[];
    sports: { sport: string; level: string }[];
    arts: { art: string; achievement: string }[];
  };
  volunteering: {
    hours: number;
    projects: { name: string; impact: number }[];
  };
  internships: { company: string; duration: number }[];
  essays: {
    quality: number; // 0-100
    narrative_consistency: number; // 0-100
    highlight_strength: number; // 0-100
    writing_level: number; // 0-100
  };
  recommendation_letters: {
    strength: number; // 0-100
    count: number;
  };
  interviews: {
    performance: number; // 0-100
  };
  fit_score: number; // 0-100 (隐藏属性)
}

// 研究生申请属性（阶段 B）
export interface GraduateApplicationAttributes {
  undergrad_gpa: number; // 0-100
  research_output: {
    papers: { title: string; tier: 'top' | 'good' | 'decent'; coauthor: boolean }[];
    posters: number;
    research_hours: number;
    advisor_strength: number; // 0-100
  };
  grad_tests: {
    gre?: { verbal: number; quant: number; writing: number };
    gmat?: number;
    lsat?: number;
    mcat?: number;
  };
  publications: {
    count: number;
    quality_tier: 'top' | 'good' | 'decent';
  };
  reference_strength: number; // 0-100
  statement_of_purpose: number; // 0-100
  lab_fit?: number; // 0-100 (博士关键)
  advisor_fit?: number; // 0-100 (博士关键)
}

// 求职属性（阶段 C）
export interface CareerAttributes {
  resume_score: number; // 0-100
  oa_score: number; // 0-100 (在线测评)
  interviews: {
    behaviour: number; // 0-100
    case?: number; // 0-100 (咨询/商业分析)
    tech: number; // 0-100
  };
  compensation?: number; // 总包
  level?: string;
  team_brand?: string;
}

// 孩子完整数据模型
export interface Child {
  id: string;
  name: string;
  age: number;
  stage: 'middle_school' | 'undergrad' | 'graduate' | 'working';
  innate: InnateAttributes;
  college_app?: CollegeApplicationAttributes;
  grad_app?: GraduateApplicationAttributes;
  career?: CareerAttributes;
  current_school?: string;
  current_major?: string;
  current_company?: string;
  created_at: number; // timestamp
}

// 学校数据模型
export interface University {
  id: string;
  name: string;
  name_zh?: string;
  group_tags: ('HYPSM' | '牛剑' | '清北' | 'QS30')[];
  ranking_year: number;
  qs_ranking?: number;
  selectivity: number; // 0-100 (越高越难)
  weights: {
    gpa_weight: number;
    tests_weight: number;
    extracurricular_weight: number;
    essays_weight: number;
    rec_weight: number;
    interview_weight: number;
    fit_weight: number;
  };
  special_rules?: {
    research_bonus?: number; // +20% 等
    international_tests_bonus?: number;
    [key: string]: any;
  };
}

// 公司数据模型
export interface Company {
  id: string;
  name: string;
  name_zh?: string;
  resume_bar: number; // 0-100
  oa_bar: number; // 0-100
  interview_style: 'tech-heavy' | 'behaviour-heavy' | 'case-heavy' | 'balanced';
  brand_multiplier: number; // 对下一跳求职加成
}

// 专业
export type Major =
  | 'Computer Science'
  | 'Data Science'
  | 'Statistics / Mathematics'
  | 'Electrical & Computer Engineering'
  | 'Mechanical Engineering'
  | 'Civil / Environmental Engineering'
  | 'Economics'
  | 'Finance'
  | 'Business / Management'
  | 'Medicine (Pre-med / MBBS track)'
  | 'Biology / Biomedicine'
  | 'Chemistry'
  | 'Physics'
  | 'Psychology'
  | 'Law';

// 道具
export interface Item {
  id: string;
  name: string;
  name_zh?: string;
  type: 'looks' | 'height' | 'iq' | 'eq' | 'essay' | 'recommendation' | 'other';
  effect: {
    attribute: string;
    value: number;
  };
  cost: {
    coins?: number;
    gems?: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'ssr';
}

// 抽奖池类型
export type GachaPoolType = 'GENETICS_POOL' | 'BOOST_POOL' | 'COSMETIC_POOL';

// 抽奖池
export interface GachaPool {
  id: string;
  type: GachaPoolType;
  name: string;
  items: {
    item_id: string;
    probability: number; // 0-1
    rarity: Item['rarity'];
  }[];
  pity_count: number; // 保底次数
  pity_guarantee_rarity: Item['rarity'];
}

// 游戏状态
export interface GameState {
  coins: number;
  gems: number;
  materials: {
    books: number;
    time: number;
    energy: number;
    relationships: number;
  };
  children: Child[];
  current_round: number;
  time_budget: number;
  stress: number; // 0-100
  family_support: number; // 0-100
}

// 回合资源
export interface RoundResources {
  time_budget: number;
  energy: number;
  stress: number;
  family_support: number;
}

// Offer 结果
export interface Offer {
  id: string;
  child_id: string;
  type: 'college' | 'graduate' | 'job';
  target_id: string; // university_id or company_id
  target_name: string;
  scholarship?: number;
  compensation?: number;
  level?: string;
  received_at: number;
  accepted: boolean;
}
