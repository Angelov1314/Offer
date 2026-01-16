// 求职系统：简历筛选、面试回合、发 offer

import type { Child, Company, Offer, CareerAttributes } from '@/types';
import { SeededRNG } from './engine';

export class CareerSystem {
  private rng: SeededRNG;

  constructor(seed?: number) {
    this.rng = new SeededRNG(seed || Date.now());
  }

  // 简历筛选
  resumeScreening(child: Child, company: Company): {
    passed: boolean;
    score: number;
    feedback: string;
  } {
    if (!child.career) {
      return {
        passed: false,
        score: 0,
        feedback: '孩子还没有准备求职材料',
      };
    }

    const resumeScore = child.career.resume_score;
    const passed = resumeScore >= company.resume_bar;

    let feedback = '';
    if (passed) {
      feedback = '简历通过筛选，进入下一轮';
    } else {
      feedback = `简历分数 ${resumeScore} 未达到 ${company.name} 的要求（${company.resume_bar}）`;
    }

    return { passed, score: resumeScore, feedback };
  }

  // 在线测评（OA）
  onlineAssessment(child: Child, company: Company): {
    passed: boolean;
    score: number;
    feedback: string;
  } {
    if (!child.career) {
      return {
        passed: false,
        score: 0,
        feedback: '孩子还没有准备求职材料',
      };
    }

    const oaScore = child.career.oa_score;
    const passed = oaScore >= company.oa_bar;

    let feedback = '';
    if (passed) {
      feedback = '在线测评通过';
    } else {
      feedback = `在线测评分数 ${oaScore} 未达到要求（${company.oa_bar}）`;
    }

    return { passed, score: oaScore, feedback };
  }

  // 面试环节
  interview(child: Child, company: Company, round: 'behaviour' | 'case' | 'tech'): {
    passed: boolean;
    score: number;
    feedback: string;
  } {
    if (!child.career) {
      return {
        passed: false,
        score: 0,
        feedback: '孩子还没有准备求职材料',
      };
    }

    let score = 0;
    let feedback = '';

    // 根据面试类型和公司风格计算得分
    if (round === 'behaviour') {
      score = child.career.interviews.behaviour;
      // 高情商有助于行为面试
      const eqBonus = (child.innate.eq / 200) * 10;
      score = Math.min(100, score + eqBonus);
    } else if (round === 'case') {
      score = child.career.interviews.case || 0;
      // 逻辑思维有助于案例面试
      const iqBonus = (child.innate.iq / 200) * 5;
      score = Math.min(100, score + iqBonus);
    } else if (round === 'tech') {
      score = child.career.interviews.tech;
      // 高智商有助于技术面试
      const iqBonus = (child.innate.iq / 200) * 10;
      score = Math.min(100, score + iqBonus);
    }

    // 根据公司面试风格调整
    let styleMultiplier = 1.0;
    if (company.interview_style === 'tech-heavy' && round === 'tech') {
      styleMultiplier = 1.1;
    } else if (company.interview_style === 'behaviour-heavy' && round === 'behaviour') {
      styleMultiplier = 1.1;
    } else if (company.interview_style === 'case-heavy' && round === 'case') {
      styleMultiplier = 1.1;
    }

    score = Math.min(100, score * styleMultiplier);

    // 添加随机波动
    const randomFactor = this.rng.next() * 10 - 5;
    score = Math.max(0, Math.min(100, score + randomFactor));

    const passed = score >= 70; // 面试通过线

    if (passed) {
      feedback = `${round} 面试通过，得分 ${score.toFixed(1)}`;
    } else {
      feedback = `${round} 面试未通过，得分 ${score.toFixed(1)}`;
    }

    return { passed, score, feedback };
  }

  // 完整求职流程
  fullApplicationProcess(child: Child, company: Company): {
    success: boolean;
    offer?: Offer;
    feedback: string[];
  } {
    const feedback: string[] = [];

    // 1. 简历筛选
    const resumeResult = this.resumeScreening(child, company);
    feedback.push(resumeResult.feedback);
    if (!resumeResult.passed) {
      return { success: false, feedback };
    }

    // 2. 在线测评
    const oaResult = this.onlineAssessment(child, company);
    feedback.push(oaResult.feedback);
    if (!oaResult.passed) {
      return { success: false, feedback };
    }

    // 3. 面试（根据公司风格决定面试轮次）
    const interviewRounds: ('behaviour' | 'case' | 'tech')[] = [];
    if (company.interview_style === 'tech-heavy') {
      interviewRounds.push('behaviour', 'tech');
    } else if (company.interview_style === 'behaviour-heavy') {
      interviewRounds.push('behaviour', 'case');
    } else if (company.interview_style === 'case-heavy') {
      interviewRounds.push('behaviour', 'case');
    } else {
      interviewRounds.push('behaviour', 'tech');
    }

    for (const round of interviewRounds) {
      const interviewResult = this.interview(child, company, round);
      feedback.push(interviewResult.feedback);
      if (!interviewResult.passed) {
        return { success: false, feedback };
      }
    }

    // 4. 发 offer
    const compensation = this.calculateCompensation(child, company);
    const level = this.determineLevel(child, company);

    const offer: Offer = {
      id: `offer_${Date.now()}_${Math.random()}`,
      child_id: child.id,
      type: 'job',
      target_id: company.id,
      target_name: company.name,
      compensation,
      level,
      received_at: Date.now(),
      accepted: false,
    };

    feedback.push(`恭喜！收到 ${company.name} 的 offer，总包 ${compensation.toLocaleString()}，级别 ${level}`);

    return { success: true, offer, feedback };
  }

  // 计算薪酬（基于孩子属性和公司品牌）
  private calculateCompensation(child: Child, company: Company): number {
    let base = 100000; // 基础年薪

    // 学校光环加成
    if (child.current_school) {
      base *= 1.2;
    }

    // 公司品牌加成
    base *= company.brand_multiplier;

    // 属性加成
    const iqBonus = (child.innate.iq / 200) * 0.3;
    const eqBonus = (child.innate.eq / 200) * 0.2;
    base *= 1 + iqBonus + eqBonus;

    // 随机波动
    const randomFactor = 0.8 + this.rng.next() * 0.4; // 0.8-1.2倍
    base *= randomFactor;

    return Math.round(base);
  }

  // 确定级别
  private determineLevel(child: Child, company: Company): string {
    const totalScore = (child.innate.iq + child.innate.eq) / 2;
    if (totalScore > 160) return 'L5/Senior';
    if (totalScore > 140) return 'L4/Mid-Senior';
    if (totalScore > 120) return 'L3/Mid';
    return 'L2/Junior';
  }
}
