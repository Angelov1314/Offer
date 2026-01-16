// 申请系统：申请计算、发 offer

import type {
  Child,
  University,
  CollegeApplicationAttributes,
  GraduateApplicationAttributes,
  Offer,
} from '@/types';
import { SeededRNG } from './engine';

export class AdmissionsSystem {
  private rng: SeededRNG;

  constructor(seed?: number) {
    this.rng = new SeededRNG(seed || Date.now());
  }

  // 计算大学申请分数
  calculateCollegeApplicationScore(
    child: Child,
    university: University
  ): {
    totalScore: number;
    breakdown: Record<string, number>;
    feedback: string[];
  } {
    if (!child.college_app) {
      return {
        totalScore: 0,
        breakdown: {},
        feedback: ['孩子还没有准备大学申请材料'],
      };
    }

    const app = child.college_app;
    const weights = university.weights;
    const feedback: string[] = [];

    // 计算各项得分
    const gpaScore = (app.gpa / 100) * weights.gpa_weight * 100;
    const testsScore = this.calculateTestsScore(app.standardized_tests) * weights.tests_weight * 100;
    const extracurricularScore =
      this.calculateExtracurricularScore(app.extracurriculars) * weights.extracurricular_weight * 100;
    const essaysScore =
      (app.essays.quality * 0.4 +
        app.essays.narrative_consistency * 0.2 +
        app.essays.highlight_strength * 0.2 +
        app.essays.writing_level * 0.2) /
      100 *
      weights.essays_weight *
      100;
    const recScore = (app.recommendation_letters.strength / 100) * weights.rec_weight * 100;
    const interviewScore = (app.interviews.performance / 100) * weights.interview_weight * 100;
    const fitScore = (app.fit_score / 100) * weights.fit_weight * 100;

    // 特殊规则加成
    let bonus = 0;
    if (university.special_rules?.research_bonus && app.extracurriculars.research.length > 0) {
      bonus += extracurricularScore * (university.special_rules.research_bonus / 100);
      feedback.push('科研项目获得额外加权');
    }

    if (
      university.special_rules?.international_tests_bonus &&
      child.innate.nationality !== 'US'
    ) {
      bonus += testsScore * (university.special_rules.international_tests_bonus / 100);
      feedback.push('国际生标化成绩获得额外加权');
    }

    const totalScore = Math.min(
      100,
      gpaScore +
        testsScore +
        extracurricularScore +
        essaysScore +
        recScore +
        interviewScore +
        fitScore +
        bonus
    );

    const breakdown = {
      gpa: gpaScore,
      tests: testsScore,
      extracurricular: extracurricularScore,
      essays: essaysScore,
      recommendations: recScore,
      interview: interviewScore,
      fit: fitScore,
      bonus,
    };

    // 生成反馈
    const weakest = Object.entries(breakdown)
      .filter(([k]) => k !== 'bonus')
      .sort(([, a], [, b]) => a - b)[0];
    if (weakest) {
      feedback.push(`${weakest[0]} 是相对较弱的环节`);
    }

    return { totalScore, breakdown, feedback };
  }

  // 计算标化成绩得分
  private calculateTestsScore(tests: CollegeApplicationAttributes['standardized_tests']): number {
    let score = 0;
    let count = 0;

    if (tests.sat) {
      score += tests.sat / 1600;
      count++;
    }
    if (tests.act) {
      score += tests.act / 36;
      count++;
    }
    if (tests.toefl) {
      score += tests.toefl / 120;
      count++;
    }
    if (tests.ielts) {
      score += tests.ielts / 9;
      count++;
    }

    return count > 0 ? score / count : 0;
  }

  // 计算课外活动得分
  private calculateExtracurricularScore(
    extracurriculars: CollegeApplicationAttributes['extracurriculars']
  ): number {
    let score = 0;
    let weight = 1;

    // 竞赛
    score += extracurriculars.competitions.length * 10 * weight;
    // 科研
    score += extracurriculars.research.length * 15 * weight;
    // 创业
    score += extracurriculars.entrepreneurship.length * 12 * weight;
    // 体育/艺术
    score += (extracurriculars.sports.length + extracurriculars.arts.length) * 8 * weight;

    return Math.min(100, score);
  }

  // 决定是否发 offer
  decideOffer(
    child: Child,
    university: University
  ): { accepted: boolean; offer?: Offer; feedback: string[] } {
    const { totalScore, feedback } = this.calculateCollegeApplicationScore(child, university);

    // 考虑选择性（selectivity）和随机性
    const threshold = 100 - university.selectivity;
    const randomFactor = this.rng.next() * 10 - 5; // -5 到 +5 的随机波动
    const finalScore = totalScore + randomFactor;

    const accepted = finalScore >= threshold;

    if (accepted) {
      const scholarship = finalScore > threshold + 10 ? this.rng.random(5000, 50000) : 0;

      const offer: Offer = {
        id: `offer_${Date.now()}_${Math.random()}`,
        child_id: child.id,
        type: 'college',
        target_id: university.id,
        target_name: university.name,
        scholarship,
        received_at: Date.now(),
        accepted: false,
      };

      return { accepted: true, offer, feedback };
    }

    feedback.push(`总分 ${totalScore.toFixed(1)} 未达到 ${university.name} 的录取门槛`);
    return { accepted: false, feedback };
  }

  // 研究生申请（简化版）
  calculateGraduateApplicationScore(
    child: Child,
    university: University
  ): {
    totalScore: number;
    breakdown: Record<string, number>;
    feedback: string[];
  } {
    if (!child.grad_app) {
      return {
        totalScore: 0,
        breakdown: {},
        feedback: ['孩子还没有准备研究生申请材料'],
      };
    }

    const app = child.grad_app;
    const feedback: string[] = [];

    // 简化版研究生申请评分
    const gpaScore = (app.undergrad_gpa / 100) * 0.3 * 100;
    const researchScore = Math.min(100, app.research_output.papers.length * 20) * 0.3 * 100;
    const testScore = app.grad_tests.gre
      ? ((app.grad_tests.gre.verbal + app.grad_tests.gre.quant) / 340) * 0.2 * 100
      : 0;
    const sopScore = (app.statement_of_purpose / 100) * 0.1 * 100;
    const refScore = (app.reference_strength / 100) * 0.1 * 100;

    const totalScore = Math.min(100, gpaScore + researchScore + testScore + sopScore + refScore);

    const breakdown = {
      gpa: gpaScore,
      research: researchScore,
      tests: testScore,
      sop: sopScore,
      references: refScore,
    };

    return { totalScore, breakdown, feedback };
  }
}
