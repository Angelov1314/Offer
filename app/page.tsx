'use client';

import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';

export default function Home() {
  const { children, coins, gems, resetGame } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🐔 鸡娃
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            领养和培养孩子，从中学到名校 offer，再到顶尖公司 offer
          </p>
          <div className="inline-block mt-4 text-sm text-yellow-300 bg-yellow-900/30 border border-yellow-500/30 px-4 py-2 rounded-lg backdrop-blur-sm">
            ⚠️ 本游戏仅为娱乐模拟，不代表真实录取/招聘结果
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 资源面板 */}
          <div className="glass-card rounded-xl p-6 cyber-border">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 flex items-center gap-2">
              💰 资源
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">金币</span>
                <span className="font-bold text-2xl text-yellow-400">{coins.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-300">宝石</span>
                <span className="font-bold text-2xl text-purple-400">{gems.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 孩子列表 */}
          <div className="glass-card rounded-xl p-6 cyber-border">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 flex items-center gap-2">
              👶 我的孩子
            </h2>
            {children.length === 0 ? (
              <p className="text-gray-400 text-center py-8">还没有领养孩子</p>
            ) : (
              <div className="space-y-3">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/child/${child.id}`}
                    className="block p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-400 hover:bg-gray-800/70 transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                          {child.name}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">{child.stage}</div>
                      </div>
                      <div className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 导航按钮 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/adopt"
            className="glass-card rounded-xl p-6 text-center border-2 border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-400/10 transition-all group"
          >
            <div className="text-4xl mb-2">🎁</div>
            <div className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
              领养中心
            </div>
          </Link>
          <Link
            href="/shop"
            className="glass-card rounded-xl p-6 text-center border-2 border-blue-500/50 hover:border-blue-400 hover:bg-blue-400/10 transition-all group"
          >
            <div className="text-4xl mb-2">🛒</div>
            <div className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
              商店
            </div>
          </Link>
          <Link
            href="/gacha"
            className="glass-card rounded-xl p-6 text-center border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-400/10 transition-all group"
          >
            <div className="text-4xl mb-2">🎰</div>
            <div className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">
              抽奖
            </div>
          </Link>
        </div>

        {/* 重置按钮 */}
        {children.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => {
                if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
                  resetGame();
                }
              }}
              className="px-6 py-3 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 transition-all"
            >
              重置游戏
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
