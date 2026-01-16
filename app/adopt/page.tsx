'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { GameEngine } from '@/lib/engine';
import type { Child, MBTIType, RaceType } from '@/types';
import mbtiData from '@/data/mbti.json';
import racesData from '@/data/races.json';
import nationalitiesData from '@/data/nationalities.json';
import personalityTagsData from '@/data/personality_tags.json';

export default function AdoptPage() {
  const router = useRouter();
  const { addChild, spendCoins } = useGameStore();
  const engine = new GameEngine();

  const generateChild = (): Child => {
    const rng = engine.getRNG();
    const mbti = mbtiData[rng.randomInt(0, mbtiData.length - 1)] as MBTIType;
    const race = racesData[rng.randomInt(0, racesData.length - 1)] as RaceType;
    const nationality = nationalitiesData[rng.randomInt(0, nationalitiesData.length - 1)];

    // 随机选择 3-5 个个性标签
    const selectedTags = [];
    const shuffled = [...personalityTagsData].sort(() => rng.next() - 0.5);
    for (let i = 0; i < rng.randomInt(3, 5); i++) {
      selectedTags.push(shuffled[i]);
    }

    const child: Child = {
      id: `child_${Date.now()}_${Math.random()}`,
      name: `孩子${Math.floor(Math.random() * 1000)}`,
      age: 14,
      stage: 'middle_school',
      innate: {
        looks: rng.randomInt(40, 80),
        height_cm: rng.randomInt(150, 170),
        iq: rng.randomInt(80, 140),
        eq: rng.randomInt(80, 140),
        mbti,
        nationality: nationality.code_alpha2,
        race,
        personality_big5: {
          openness: rng.randomInt(30, 90),
          conscientiousness: rng.randomInt(30, 90),
          extraversion: rng.randomInt(30, 90),
          agreeableness: rng.randomInt(30, 90),
          neuroticism: rng.randomInt(10, 70),
        },
        personality_tags: selectedTags as any,
      },
      created_at: Date.now(),
    };

    return child;
  };

  const handleAdopt = () => {
    const cost = 1000;
    const { coins } = useGameStore.getState();
    if (coins < cost) {
      alert('金币不足！');
      return;
    }

    const child = generateChild();
    spendCoins(cost);
    addChild(child);
    router.push(`/child/${child.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            🎁 领养中心
          </h1>
          <p className="text-gray-400">领养一个新孩子，开始你的培养之旅</p>
        </header>

        <div className="glass-card rounded-xl p-8 text-center cyber-border">
          <div className="mb-6">
            <div className="text-7xl mb-6 animate-pulse">👶</div>
            <p className="text-xl text-gray-300 mb-4">
              领养费用: <span className="font-bold text-yellow-400 text-2xl">1,000 金币</span>
            </p>
            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
              每个孩子都有独特的先天属性，包括颜值、身高、智商、情商、MBTI、国籍、种族和个性标签
            </p>
          </div>

          <button
            onClick={handleAdopt}
            className="px-12 py-4 rounded-xl font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white transition-all pulse-glow"
          >
            领养孩子
          </button>
        </div>
      </div>
    </div>
  );
}
