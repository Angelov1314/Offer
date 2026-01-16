'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { EconomySystem } from '@/lib/economy';
import type { Item } from '@/types';
import itemsData from '@/data/items.json';

export default function ShopPage() {
  const { coins, gems, spendCoins, spendGems, children, updateChild } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchasedItem, setPurchasedItem] = useState<string | null>(null);

  const items = itemsData as Item[];

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'looks', name: '颜值' },
    { id: 'iq', name: '智商' },
    { id: 'eq', name: '情商' },
    { id: 'essay', name: '文书' },
    { id: 'recommendation', name: '推荐信' },
  ];

  const filteredItems =
    selectedCategory === 'all'
      ? items
      : items.filter((item) => item.type === selectedCategory);

  const handlePurchase = (item: Item) => {
    const result = EconomySystem.purchaseItem(useGameStore.getState(), item);
    
    if (!result.success) {
      alert(result.message);
      return;
    }

    // 更新状态
    if (item.cost.coins) {
      spendCoins(item.cost.coins);
    }
    if (item.cost.gems) {
      spendGems(item.cost.gems);
    }

    setPurchasedItem(item.id);
    setTimeout(() => setPurchasedItem(null), 2000);
  };

  const handleUseItem = (item: Item) => {
    if (children.length === 0) {
      alert('请先领养一个孩子！');
      return;
    }

    const child = children[0];
    const result = EconomySystem.useItem(child, item);
    
    if (result.success) {
      updateChild(child.id, result.newChild);
      alert(result.message);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-purple-500 bg-purple-500/10';
      case 'epic':
        return 'border-blue-500 bg-blue-500/10';
      case 'rare':
        return 'border-green-500 bg-green-500/10';
      default:
        return 'border-gray-600 bg-gray-600/10';
    }
  };

  const getRarityBadge = (rarity: string) => {
    const colors = {
      legendary: 'bg-gradient-to-r from-purple-600 to-pink-600',
      epic: 'bg-gradient-to-r from-blue-600 to-cyan-600',
      rare: 'bg-gradient-to-r from-green-600 to-emerald-600',
      common: 'bg-gray-600',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            🛒 商店
          </h1>
          <p className="text-gray-400">购买道具和课程来提升孩子的属性</p>
        </header>

        {/* 资源显示 */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex gap-6 justify-center">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">金币</div>
              <div className="text-2xl font-bold text-yellow-400">{coins.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">宝石</div>
              <div className="text-2xl font-bold text-purple-400">{gems.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="mb-6 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedCategory === cat.id
                  ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 道具列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`glass-card rounded-xl p-6 border-2 ${getRarityColor(
                item.rarity
              )} transition-all hover:scale-105 ${
                purchasedItem === item.id ? 'animate-pulse' : ''
              }`}
            >
              {/* 稀有度标签 */}
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getRarityBadge(
                    item.rarity
                  )}`}
                >
                  {item.rarity.toUpperCase()}
                </div>
                <div className="text-2xl">
                  {item.type === 'looks' && '✨'}
                  {item.type === 'iq' && '🧠'}
                  {item.type === 'eq' && '💝'}
                  {item.type === 'essay' && '📝'}
                  {item.type === 'recommendation' && '📄'}
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">{item.name_zh}</h3>
              <p className="text-sm text-gray-400 mb-4">
                提升 {item.effect.attribute} +{item.effect.value}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  {item.cost.coins && (
                    <span className="text-yellow-400 font-semibold">
                      💰 {item.cost.coins.toLocaleString()}
                    </span>
                  )}
                  {item.cost.gems && (
                    <span className="text-purple-400 font-semibold">
                      💎 {item.cost.gems}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={
                    (item.cost.coins && coins < item.cost.coins) ||
                    (item.cost.gems && gems < item.cost.gems)
                  }
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    (item.cost.coins && coins < item.cost.coins) ||
                    (item.cost.gems && gems < item.cost.gems)
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
                  }`}
                >
                  购买
                </button>
                {children.length > 0 && (
                  <button
                    onClick={() => handleUseItem(item)}
                    className="px-4 py-2 rounded-lg border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all"
                  >
                    使用
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            该分类下暂无道具
          </div>
        )}
      </div>
    </div>
  );
}
