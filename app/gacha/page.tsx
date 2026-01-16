'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { GachaSystem } from '@/lib/gacha';
import type { GachaPool } from '@/types';
import gachaPoolsData from '@/data/gacha_pools.json';

export default function GachaPage() {
  const { gems, spendGems, addGems, addCoins, children, updateChild } = useGameStore();
  const [selectedPool, setSelectedPool] = useState<string>('boost_pool');
  const [gachaSystem, setGachaSystem] = useState<GachaSystem | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [pityProgress, setPityProgress] = useState<{ current: number; total: number }>({ current: 0, total: 30 });

  useEffect(() => {
    const pools = gachaPoolsData as GachaPool[];
    const system = new GachaSystem(pools);
    setGachaSystem(system);
    updatePityProgress(system);
  }, []);

  const updatePityProgress = (system: GachaSystem) => {
    const progress = system.getPityProgress(selectedPool);
    setPityProgress(progress);
  };

  const handleRoll = () => {
    if (!gachaSystem || isRolling) return;
    
    const cost = selectedPool === 'genetics_pool' ? 200 : 100;
    if (gems < cost) {
      alert('宝石不足！');
      return;
    }

    setIsRolling(true);
    spendGems(cost);

    setTimeout(() => {
      const result = gachaSystem.roll(selectedPool);
      if (result) {
        setLastResult(result);
        handleReward(result);
        updatePityProgress(gachaSystem);
      }
      setIsRolling(false);
    }, 1500);
  };

  const handleReward = (result: any) => {
    // 根据奖励类型处理
    if (result.item_id === 'coins_5000') {
      addCoins(5000);
    } else if (result.item_id === 'gems_50') {
      addGems(50);
    } else if (result.item_id.startsWith('iq_boost_')) {
      const boost = parseInt(result.item_id.split('_')[2]);
      // 给第一个孩子提升智商
      if (children.length > 0) {
        const child = children[0];
        updateChild(child.id, {
          innate: {
            ...child.innate,
            iq: Math.min(200, child.innate.iq + boost),
          },
        });
      }
    } else if (result.item_id.startsWith('eq_boost_')) {
      const boost = parseInt(result.item_id.split('_')[2]);
      if (children.length > 0) {
        const child = children[0];
        updateChild(child.id, {
          innate: {
            ...child.innate,
            eq: Math.min(200, child.innate.eq + boost),
          },
        });
      }
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'ssr':
        return 'from-red-500 to-pink-600';
      case 'legendary':
        return 'from-purple-500 to-indigo-600';
      case 'epic':
        return 'from-blue-500 to-cyan-600';
      case 'rare':
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const selectedPoolData = gachaPoolsData.find((p: any) => p.id === selectedPool);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            🎰 抽奖中心
          </h1>
          <p className="text-gray-400">通过抽奖获得稀有道具和重置先天属性</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 抽奖池选择 */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">选择抽奖池</h2>
              <div className="space-y-3">
                {gachaPoolsData.map((pool: any) => (
                  <button
                    key={pool.id}
                    onClick={() => {
                      setSelectedPool(pool.id);
                      if (gachaSystem) {
                        updatePityProgress(gachaSystem);
                      }
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedPool === pool.id
                        ? 'border-cyan-400 bg-cyan-400/10 glow-effect'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-white">{pool.name_zh}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        单抽: {pool.id === 'genetics_pool' ? '200' : '100'} 宝石
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 保底进度 */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-cyan-400">保底进度</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">当前进度</span>
                  <span className="text-white font-semibold">
                    {pityProgress.current} / {pityProgress.total}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${(pityProgress.current / pityProgress.total) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  再抽 {pityProgress.total - pityProgress.current} 次必出{' '}
                  {selectedPoolData?.pity_guarantee_rarity?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* 抽奖区域 */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl p-8 text-center">
              <div className="mb-8">
                <div className="text-6xl mb-4">🎁</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedPoolData?.name_zh}
                </h2>
                <p className="text-gray-400 text-sm">
                  当前宝石: <span className="text-purple-400 font-semibold">{gems}</span>
                </p>
              </div>

              {/* 抽奖按钮 */}
              <button
                onClick={handleRoll}
                disabled={isRolling || gems < (selectedPool === 'genetics_pool' ? 200 : 100)}
                className={`relative px-12 py-4 rounded-xl font-bold text-lg transition-all ${
                  isRolling || gems < (selectedPool === 'genetics_pool' ? 200 : 100)
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white pulse-glow'
                }`}
              >
                {isRolling ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚡</span> 抽奖中...
                  </span>
                ) : (
                  `单抽 (${selectedPool === 'genetics_pool' ? '200' : '100'} 宝石)`
                )}
              </button>

              {/* 十连抽按钮 */}
              <button
                onClick={() => {
                  for (let i = 0; i < 10; i++) {
                    setTimeout(() => handleRoll(), i * 200);
                  }
                }}
                disabled={isRolling || gems < (selectedPool === 'genetics_pool' ? 2000 : 1000)}
                className={`mt-4 px-12 py-4 rounded-xl font-bold text-lg transition-all ${
                  isRolling || gems < (selectedPool === 'genetics_pool' ? 2000 : 1000)
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                }`}
              >
                十连抽 ({selectedPool === 'genetics_pool' ? '2000' : '1000'} 宝石)
              </button>

              {/* 结果显示 */}
              {lastResult && (
                <div className="mt-8 animate-fade-in">
                  <div className="text-sm text-gray-400 mb-2">获得奖励</div>
                  <div
                    className={`inline-block px-6 py-3 rounded-lg bg-gradient-to-r ${getRarityColor(
                      lastResult.rarity
                    )} text-white font-semibold`}
                  >
                    {lastResult.item_id} ({lastResult.rarity.toUpperCase()})
                    {lastResult.isPity && ' [保底]'}
                  </div>
                </div>
              )}
            </div>

            {/* 概率展示 */}
            <div className="glass-card rounded-xl p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">概率展示</h3>
              <div className="space-y-2 text-sm">
                {selectedPoolData?.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-300">{item.item_id}</span>
                    <span className="text-cyan-400">{(item.probability * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
