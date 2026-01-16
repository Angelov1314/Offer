'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { useState } from 'react';
import { UpgradeCostCalculator } from '@/lib/engine';
import { EconomySystem } from '@/lib/economy';

export default function ChildDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { children, updateChild, coins, spendCoins } = useGameStore();
  const child = children.find((c) => c.id === params.id);

  const [selectedAttribute, setSelectedAttribute] = useState<
    'iq' | 'eq' | 'looks' | null
  >(null);

  if (!child) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">孩子不存在</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const handleUpgrade = (attribute: 'iq' | 'eq' | 'looks') => {
    const currentValue = child.innate[attribute];
    const baseCost = 100;
    let cost: number;
    let failureProbability = 0;

    if (attribute === 'iq' || attribute === 'eq') {
      const result = UpgradeCostCalculator.calculateEliteAttributeCost(
        currentValue,
        baseCost
      );
      cost = result.cost;
      failureProbability = result.failureProbability;
    } else {
      cost = UpgradeCostCalculator.calculateCost(currentValue, baseCost);
    }

    if (coins < cost) {
      alert('金币不足！');
      return;
    }

    // 模拟升级（简化版，实际应该调用 Engine）
    const success = Math.random() > failureProbability;
    if (success) {
      const newValue = Math.min(
        currentValue + 1,
        attribute === 'iq' || attribute === 'eq' ? 200 : 100
      );
      updateChild(child.id, {
        innate: {
          ...child.innate,
          [attribute]: newValue,
        },
      });
      spendCoins(cost);
      alert(`${attribute} 提升了 1 点！`);
    } else {
      spendCoins(cost);
      alert('升级失败，金币已消耗');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block"
          >
            ← 返回首页
          </button>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            {child.name}
          </h1>
          <p className="text-gray-400">阶段: {child.stage}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 先天属性 */}
          <div className="glass-card rounded-xl p-6 cyber-border">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">🎯 先天属性</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>颜值 (Looks)</span>
                  <span className="font-bold">{child.innate.looks}/100</span>
                </div>
                <button
                  onClick={() => handleUpgrade('looks')}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white py-2 rounded-lg transition-all"
                >
                  提升颜值
                </button>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>身高 (Height)</span>
                  <span className="font-bold">{child.innate.height_cm} cm</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>智商 (IQ)</span>
                  <span className="font-bold">{child.innate.iq}/200</span>
                </div>
                <button
                  onClick={() => handleUpgrade('iq')}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white py-2 rounded-lg transition-all"
                >
                  提升智商
                </button>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>情商 (EQ)</span>
                  <span className="font-bold">{child.innate.eq}/200</span>
                </div>
                <button
                  onClick={() => handleUpgrade('eq')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-2 rounded-lg transition-all"
                >
                  提升情商
                </button>
              </div>

              <div>
                <span className="font-semibold">MBTI:</span> {child.innate.mbti}
              </div>
              <div>
                <span className="font-semibold">国籍:</span> {child.innate.nationality}
              </div>
              <div>
                <span className="font-semibold">种族:</span> {child.innate.race}
              </div>
            </div>
          </div>

          {/* Big Five 个性 */}
          <div className="glass-card rounded-xl p-6 cyber-border">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">🧠 Big Five 个性</h2>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span>开放性 (Openness)</span>
                  <span>{child.innate.personality_big5.openness}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${child.innate.personality_big5.openness}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>责任心 (Conscientiousness)</span>
                  <span>{child.innate.personality_big5.conscientiousness}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${child.innate.personality_big5.conscientiousness}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>外向性 (Extraversion)</span>
                  <span>{child.innate.personality_big5.extraversion}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${child.innate.personality_big5.extraversion}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>宜人性 (Agreeableness)</span>
                  <span>{child.innate.personality_big5.agreeableness}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${child.innate.personality_big5.agreeableness}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>神经质 (Neuroticism)</span>
                  <span>{child.innate.personality_big5.neuroticism}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${child.innate.personality_big5.neuroticism}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <span className="font-semibold">个性标签:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {child.innate.personality_tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 px-2 py-1 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 申请状态 */}
        {child.stage === 'middle_school' && (
          <div className="mt-6 glass-card rounded-xl p-6 cyber-border">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">📚 大学申请准备</h2>
            <p className="text-gray-300 mb-4">
              {child.college_app
                ? '申请材料已准备'
                : '还未开始准备大学申请材料'}
            </p>
            <Link
              href={`/apply/college/${child.id}`}
              className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              开始申请大学
            </Link>
          </div>
        )}

        {/* 求职状态 */}
        {child.stage === 'undergrad' && (
          <div className="mt-6 glass-card rounded-xl p-6 cyber-border">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">💼 求职准备</h2>
            <p className="text-gray-300 mb-4">
              {child.career
                ? '求职材料已准备'
                : '还未开始准备求职材料'}
            </p>
            <Link
              href={`/apply/job/${child.id}`}
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              开始申请工作
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
