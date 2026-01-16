'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { AdmissionsSystem } from '@/lib/admissions';
import universitiesData from '@/data/universities.json';
import type { University, Offer } from '@/types';

export default function CollegeApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { children, updateChild, addCoins } = useGameStore();
  const child = children.find((c) => c.id === params.id);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [results, setResults] = useState<Map<string, { accepted: boolean; offer?: Offer; feedback: string[] }>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const universities = universitiesData as University[];
  const admissionsSystem = new AdmissionsSystem();

  if (!child) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">孩子不存在</h1>
        <Link href="/" className="text-cyan-400 hover:text-cyan-300">
          返回首页
        </Link>
      </div>
    );
  }

  // 初始化申请属性（如果还没有）
  if (!child.college_app) {
    const newChild = {
      ...child,
      college_app: {
        gpa: Math.min(95, child.innate.iq * 0.6 + 30),
        standardized_tests: {
          sat: child.innate.nationality === 'US' ? 1400 + Math.floor(Math.random() * 200) : undefined,
          toefl: child.innate.nationality !== 'US' ? 100 + Math.floor(Math.random() * 20) : undefined,
        },
        extracurriculars: {
          clubs: [],
          competitions: [],
          research: [],
          entrepreneurship: [],
          sports: [],
          arts: [],
        },
        volunteering: {
          hours: 0,
          projects: [],
        },
        internships: [],
        essays: {
          quality: 70,
          narrative_consistency: 70,
          highlight_strength: 70,
          writing_level: 70,
        },
        recommendation_letters: {
          strength: 70,
          count: 2,
        },
        interviews: {
          performance: 70,
        },
        fit_score: 50,
      },
    };
    updateChild(child.id, newChild);
  }

  const toggleUniversity = (univId: string) => {
    setSelectedUniversities((prev) =>
      prev.includes(univId) ? prev.filter((id) => id !== univId) : [...prev, univId]
    );
  };

  const handleSubmit = () => {
    if (selectedUniversities.length === 0) {
      alert('请至少选择一所大学！');
      return;
    }

    setIsSubmitting(true);
    const newResults = new Map();

    setTimeout(() => {
      selectedUniversities.forEach((univId) => {
        const university = universities.find((u) => u.id === univId);
        if (university && child.college_app) {
          const result = admissionsSystem.decideOffer(child, university);
          newResults.set(univId, result);
          
          if (result.accepted && result.offer) {
            addCoins(1000); // 获得 offer 奖励
          }
        }
      });

      setResults(newResults);
      setIsSubmitting(false);
    }, 2000);
  };

  const getUniversityGroup = (university: University) => {
    if (university.group_tags.includes('HYPSM')) return 'HYPSM';
    if (university.group_tags.includes('牛剑')) return '牛剑';
    if (university.group_tags.includes('清北')) return '清北';
    return 'QS30';
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'HYPSM':
        return 'border-yellow-500 bg-yellow-500/10';
      case '牛剑':
        return 'border-blue-500 bg-blue-500/10';
      case '清北':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link href={`/child/${child.id}`} className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">
            ← 返回孩子详情
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            🎓 大学申请中心
          </h1>
          <p className="text-gray-400">为 {child.name} 申请大学</p>
        </header>

        {/* 申请材料概览 */}
        {child.college_app && (
          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">申请材料概览</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">GPA</div>
                <div className="text-2xl font-bold text-white">{child.college_app.gpa.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">SAT</div>
                <div className="text-2xl font-bold text-white">
                  {child.college_app.standardized_tests.sat || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">文书质量</div>
                <div className="text-2xl font-bold text-white">{child.college_app.essays.quality}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">推荐信</div>
                <div className="text-2xl font-bold text-white">
                  {child.college_app.recommendation_letters.strength}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 大学选择 */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-cyan-400">选择申请的大学</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {universities.map((university) => {
              const group = getUniversityGroup(university);
              const isSelected = selectedUniversities.includes(university.id);
              const result = results.get(university.id);

              return (
                <div
                  key={university.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-400/20'
                      : result?.accepted
                      ? 'border-green-500 bg-green-500/10'
                      : result
                      ? 'border-red-500 bg-red-500/10'
                      : getGroupColor(group)
                  }`}
                  onClick={() => !result && toggleUniversity(university.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{university.name_zh || university.name}</h3>
                      <div className="text-xs text-gray-400 mt-1">
                        QS排名: #{university.qs_ranking} | 难度: {university.selectivity}/100
                      </div>
                    </div>
                    {isSelected && <span className="text-cyan-400">✓</span>}
                    {result?.accepted && <span className="text-green-400 text-2xl">🎉</span>}
                    {result && !result.accepted && <span className="text-red-400">✗</span>}
                  </div>
                  {result && (
                    <div className="mt-2 text-sm">
                      {result.accepted ? (
                        <div className="text-green-400">
                          ✅ 获得 Offer！
                          {result.offer?.scholarship && (
                            <div className="text-yellow-400 mt-1">
                              奖学金: ${result.offer.scholarship.toLocaleString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-red-400">
                          ❌ 未通过
                          <div className="text-xs text-gray-400 mt-1">
                            {result.feedback.join('; ')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedUniversities.length === 0}
            className={`px-12 py-4 rounded-xl font-bold text-lg transition-all ${
              isSubmitting || selectedUniversities.length === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white pulse-glow'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚡</span> 提交中...
              </span>
            ) : (
              `提交申请 (${selectedUniversities.length} 所)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
