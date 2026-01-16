// 经济系统：货币、材料、商店定价

import type { GameState, Item, Child } from '@/types';

export class EconomySystem {
  // 购买道具
  static purchaseItem(state: GameState, item: Item): {
    success: boolean;
    newState: GameState;
    message: string;
  } {
    const newState = { ...state };

    // 检查货币是否足够
    if (item.cost.coins && newState.coins < item.cost.coins) {
      return {
        success: false,
        newState,
        message: '金币不足',
      };
    }

    if (item.cost.gems && newState.gems < item.cost.gems) {
      return {
        success: false,
        newState,
        message: '宝石不足',
      };
    }

    // 扣除货币
    if (item.cost.coins) {
      newState.coins -= item.cost.coins;
    }
    if (item.cost.gems) {
      newState.gems -= item.cost.gems;
    }

    return {
      success: true,
      newState,
      message: `成功购买 ${item.name}`,
    };
  }

  // 使用道具
  static useItem(child: Child, item: Item): {
    success: boolean;
    newChild: Child;
    message: string;
  } {
    const newChild = { ...child };

    // 根据道具类型应用效果
    if (item.type === 'looks') {
      newChild.innate.looks = Math.min(100, newChild.innate.looks + item.effect.value);
    } else if (item.type === 'height') {
      newChild.innate.height_cm = Math.min(220, newChild.innate.height_cm + item.effect.value);
    } else if (item.type === 'iq') {
      newChild.innate.iq = Math.min(200, newChild.innate.iq + item.effect.value);
    } else if (item.type === 'eq') {
      newChild.innate.eq = Math.min(200, newChild.innate.eq + item.effect.value);
    } else if (item.type === 'essay' && newChild.college_app) {
      newChild.college_app.essays.quality = Math.min(
        100,
        newChild.college_app.essays.quality + item.effect.value
      );
    } else if (item.type === 'recommendation' && newChild.college_app) {
      newChild.college_app.recommendation_letters.strength = Math.min(
        100,
        newChild.college_app.recommendation_letters.strength + item.effect.value
      );
    }

    return {
      success: true,
      newChild,
      message: `使用了 ${item.name}，${item.effect.attribute} 提升了 ${item.effect.value} 点`,
    };
  }

  // 完成任务获得奖励
  static completeTask(
    state: GameState,
    reward: { coins?: number; gems?: number; materials?: Partial<GameState['materials']> }
  ): GameState {
    const newState = { ...state };

    if (reward.coins) {
      newState.coins += reward.coins;
    }
    if (reward.gems) {
      newState.gems += reward.gems;
    }
    if (reward.materials) {
      Object.assign(newState.materials, reward.materials);
    }

    return newState;
  }

  // 兼职赚钱
  static partTimeJob(state: GameState, hours: number): {
    newState: GameState;
    earnings: number;
  } {
    const hourlyRate = 20; // 每小时20金币
    const earnings = hours * hourlyRate;

    const newState = {
      ...state,
      coins: state.coins + earnings,
      materials: {
        ...state.materials,
        time: Math.max(0, state.materials.time - hours),
        energy: Math.max(0, state.materials.energy - hours * 0.5),
      },
    };

    return { newState, earnings };
  }

  // 比赛获奖
  static competitionWin(
    state: GameState,
    level: 'local' | 'regional' | 'national' | 'international'
  ): GameState {
    const rewards = {
      local: { coins: 500, gems: 0 },
      regional: { coins: 2000, gems: 10 },
      national: { coins: 5000, gems: 25 },
      international: { coins: 10000, gems: 50 },
    };

    return this.completeTask(state, rewards[level]);
  }

  // 计算升级成本（调用 Engine 的成本计算器）
  static calculateUpgradeCost(
    currentValue: number,
    baseCost: number,
    attribute: 'iq' | 'eq' | 'looks' | 'height'
  ): number {
    // 导入 UpgradeCostCalculator（这里简化处理）
    if (attribute === 'iq' || attribute === 'eq') {
      // 使用精英属性成本计算
      const { cost } = require('./engine').UpgradeCostCalculator.calculateEliteAttributeCost(
        currentValue,
        baseCost
      );
      return cost;
    } else {
      // 使用普通成本计算
      return require('./engine').UpgradeCostCalculator.calculateCost(currentValue, baseCost);
    }
  }
}
