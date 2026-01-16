// 抽奖系统：概率池、保底、稀有度

import type { GachaPool, Item, GachaPoolType, Child, InnateAttributes } from '@/types';
import { SeededRNG } from './engine';

export interface GachaResult {
  item_id: string;
  rarity: Item['rarity'];
  isPity: boolean;
}

export class GachaSystem {
  private pools: Map<string, GachaPool>;
  private pityCounters: Map<string, number>; // pool_id -> count
  private rng: SeededRNG;

  constructor(pools: GachaPool[], seed?: number) {
    this.pools = new Map();
    this.pityCounters = new Map();
    this.rng = new SeededRNG(seed || Date.now());

    pools.forEach((pool) => {
      this.pools.set(pool.id, pool);
      this.pityCounters.set(pool.id, 0);
    });
  }

  // 单次抽奖
  roll(poolId: string): GachaResult | null {
    const pool = this.pools.get(poolId);
    if (!pool) return null;

    const pityCount = this.pityCounters.get(poolId) || 0;
    const isPity = pityCount >= pool.pity_count - 1;

    // 保底触发
    if (isPity) {
      const pityItems = pool.items.filter(
        (item) => item.rarity === pool.pity_guarantee_rarity
      );
      if (pityItems.length > 0) {
        const selected = pityItems[Math.floor(this.rng.next() * pityItems.length)];
        this.pityCounters.set(poolId, 0);
        return {
          item_id: selected.item_id,
          rarity: selected.rarity,
          isPity: true,
        };
      }
    }

    // 正常概率抽取
    const roll = this.rng.next();
    let cumulative = 0;

    for (const item of pool.items) {
      cumulative += item.probability;
      if (roll <= cumulative) {
        const newPityCount = (this.pityCounters.get(poolId) || 0) + 1;
        this.pityCounters.set(poolId, newPityCount);
        return {
          item_id: item.item_id,
          rarity: item.rarity,
          isPity: false,
        };
      }
    }

    // 兜底（理论上不应该到这里）
    const lastItem = pool.items[pool.items.length - 1];
    return {
      item_id: lastItem.item_id,
      rarity: lastItem.rarity,
      isPity: false,
    };
  }

  // 十连抽
  roll10(poolId: string): GachaResult[] {
    const results: GachaResult[] = [];
    for (let i = 0; i < 10; i++) {
      const result = this.roll(poolId);
      if (result) results.push(result);
    }
    return results;
  }

  // 获取保底进度
  getPityProgress(poolId: string): { current: number; total: number } {
    const pool = this.pools.get(poolId);
    if (!pool) return { current: 0, total: 0 };

    return {
      current: this.pityCounters.get(poolId) || 0,
      total: pool.pity_count,
    };
  }

  // 重置先天属性（GENETICS_POOL 特殊功能）
  resetGenetics(
    child: Child,
    attribute: 'nationality' | 'race' | 'mbti',
    newValue: string
  ): Child {
    const newChild = { ...child };
    if (attribute === 'mbti') {
      newChild.innate.mbti = newValue as any;
    } else if (attribute === 'nationality') {
      newChild.innate.nationality = newValue;
    } else if (attribute === 'race') {
      newChild.innate.race = newValue;
    }
    return newChild;
  }
}
