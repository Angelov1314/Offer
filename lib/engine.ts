// 游戏引擎：回合推进、事件触发、升级成本计算

import type { Child, RoundResources, GameState } from '@/types';

// 可复现的随机数生成器（seed-based）
export class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  random(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  randomInt(min: number, max: number): number {
    return Math.floor(this.random(min, max + 1));
  }
}

// 边际成本计算（Marginal Cost Scaling）
export class UpgradeCostCalculator {
  // 基础升级成本函数：cost(x -> x+1) = base * (1 + a*x + b*x^2)
  static calculateCost(
    currentValue: number,
    baseCost: number,
    a: number = 0.1,
    b: number = 0.01
  ): number {
    return baseCost * (1 + a * currentValue + b * currentValue * currentValue);
  }

  // 指数成本函数：cost = base * exp(k * x_norm)
  static calculateExponentialCost(
    currentValue: number,
    baseCost: number,
    maxValue: number,
    k: number = 2.0
  ): number {
    const normalized = currentValue / maxValue;
    return baseCost * Math.exp(k * normalized);
  }

  // 智商/科研天赋等顶级属性的特殊成本（天花板效应）
  static calculateEliteAttributeCost(
    currentValue: number,
    baseCost: number,
    threshold: number = 140
  ): { cost: number; failureProbability: number } {
    if (currentValue < threshold) {
      return {
        cost: UpgradeCostCalculator.calculateCost(currentValue, baseCost),
        failureProbability: 0,
      };
    }

    // 超过阈值后，成本显著上升，并增加失败概率
    const excess = currentValue - threshold;
    const costMultiplier = 1 + excess * 0.5; // 每超过1点，成本增加50%
    const failureProbability = Math.min(0.3, excess * 0.05); // 最多30%失败率

    return {
      cost: UpgradeCostCalculator.calculateCost(currentValue, baseCost) * costMultiplier,
      failureProbability,
    };
  }
}

// 回合推进引擎
export class GameEngine {
  private rng: SeededRNG;

  constructor(seed?: number) {
    this.rng = new SeededRNG(seed || Date.now());
  }

  // 推进一个回合
  advanceRound(
    state: GameState,
    resources: RoundResources
  ): { newState: GameState; events: string[] } {
    const events: string[] = [];
    const newState = { ...state };

    // 更新回合数
    newState.current_round += 1;

    // 更新资源
    newState.time_budget = resources.time_budget;
    newState.materials.energy = resources.energy;
    newState.stress = resources.stress;
    newState.family_support = resources.family_support;

    // 压力过高触发负面事件
    if (newState.stress > 80) {
      const stressEvent = this.triggerStressEvent(newState);
      events.push(stressEvent);
    }

    // 随机事件触发
    if (this.rng.next() < 0.3) {
      const randomEvent = this.triggerRandomEvent();
      events.push(randomEvent);
    }

    return { newState, events };
  }

  // 压力事件
  private triggerStressEvent(state: GameState): string {
    const events = [
      '孩子因为压力过大生病了，需要休息一周',
      '孩子出现焦虑症状，学习效率下降',
      '人际关系出现问题，推荐信质量受影响',
    ];
    return events[this.rng.randomInt(0, events.length - 1)];
  }

  // 随机事件
  private triggerRandomEvent(): string {
    const events = [
      '孩子参加竞赛获得奖项',
      '遇到良师，推荐信质量提升',
      '发现新的学习资源',
      '参加学术会议，拓展视野',
    ];
    return events[this.rng.randomInt(0, events.length - 1)];
  }

  // 属性升级（带失败概率）
  upgradeAttribute(
    child: Child,
    attribute: keyof Child['innate'],
    cost: number,
    failureProbability: number = 0
  ): { success: boolean; newChild: Child; message: string } {
    if (this.rng.next() < failureProbability) {
      return {
        success: false,
        newChild: child,
        message: '升级失败，属性没有提升',
      };
    }

    const newChild = { ...child };
    const currentValue = newChild.innate[attribute] as number;

    if (typeof currentValue === 'number') {
      (newChild.innate[attribute] as number) = Math.min(
        currentValue + 1,
        attribute === 'iq' || attribute === 'eq' ? 200 : 100
      );
    }

    return {
      success: true,
      newChild,
      message: `${attribute} 提升了 1 点`,
    };
  }

  // 获取随机数生成器（用于其他模块）
  getRNG(): SeededRNG {
    return this.rng;
  }
}
