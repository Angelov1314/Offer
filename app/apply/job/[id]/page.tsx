'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/store/gameStore';
import { CareerSystem } from '@/lib/career';
import companiesData from '@/data/companies.json';
import type { Company, Offer } from '@/types';

export default function JobApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { children, updateChild, addCoins } = useGameStore();
  const child = children.find((c) => c.id === params.id);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [applicationStage, setApplicationStage] = useState<'resume' | 'oa' | 'interview' | 'result'>('resume');
  const [result, setResult] = useState<{ success: boolean; offer?: Offer; feedback: string[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const companies = companiesData as Company[];
  const careerSystem = new CareerSystem();

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

  // 初始化求职属性（如果还没有）
  if (!child.career) {
    const newChild = {
      ...child,
      career: {
        resume_score: Math.min(90, (child.innate.iq + child.innate.eq) / 2 + 20),
        oa_score: Math.min(90, child.innate.iq * 0.5 + 40),
        interviews: {
          behaviour: Math.min(90, child.innate.eq * 0.5 + 40),
          tech: Math.min(90, child.innate.iq * 0.5 + 40),
          case: Math.min(90, (child.innate.iq + child.innate.eq) / 2 * 0.5 + 30),
        },
      },
    };
    updateChild(child.id, newChild);
  }

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompany(companyId);
    setApplicationStage('resume');
    setResult(null);
  };

  const handleResumeScreening = () => {
    if (!selectedCompany || !child.career) return;
    
    setIsProcessing(true);
    const company = companies.find((c) => c.id === selectedCompany);
    if (!company) return;

    setTimeout(() => {
      const screening = careerSystem.resumeScreening(child, company);
      setIsProcessing(false);
      
      if (screening.passed) {
        setApplicationStage('oa');
      } else {
        setResult({
          success: false,
          feedback: [screening.feedback],
        });
        setApplicationStage('result');
      }
    }, 1000);
  };

  const handleOA = () => {
    if (!selectedCompany || !child.career) return;
    
    setIsProcessing(true);
    const company = companies.find((c) => c.id === selectedCompany);
    if (!company) return;

    setTimeout(() => {
      const oa = careerSystem.onlineAssessment(child, company);
      setIsProcessing(false);
      
      if (oa.passed) {
        setApplicationStage('interview');
      } else {
        setResult({
          success: false,
          feedback: [oa.feedback],
        });
        setApplicationStage('result');
      }
    }, 1000);
  };

  const handleInterview = (round: 'behaviour' | 'case' | 'tech') => {
    if (!selectedCompany || !child.career) return;
    
    setIsProcessing(true);
    const company = companies.find((c) => c.id === selectedCompany);
    if (!company) return;

    setTimeout(() => {
      const interview = careerSystem.interview(child, company, round);
      setIsProcessing(false);
      
      if (!interview.passed) {
        setResult({
          success: false,
          feedback: [interview.feedback],
        });
        setApplicationStage('result');
        return;
      }

      // 如果所有面试都通过，进行完整流程
      if (round === 'tech' || (round === 'case' && company.interview_style !== 'tech-heavy')) {
        const fullResult = careerSystem.fullApplicationProcess(child, company);
        setResult(fullResult);
        setApplicationStage('result');
        
        if (fullResult.success && fullResult.offer) {
          addCoins(5000); // 获得 offer 奖励
        }
      }
    }, 1500);
  };

  const handleFullProcess = () => {
    if (!selectedCompany || !child.career) return;
    
    setIsProcessing(true);
    const company = companies.find((c) => c.id === selectedCompany);
    if (!company) return;

    setTimeout(() => {
      const fullResult = careerSystem.fullApplicationProcess(child, company);
      setResult(fullResult);
      setApplicationStage('result');
      setIsProcessing(false);
      
      if (fullResult.success && fullResult.offer) {
        addCoins(5000);
      }
    }, 2000);
  };

  const getInterviewStyleIcon = (style: string) => {
    switch (style) {
      case 'tech-heavy':
        return '💻';
      case 'behaviour-heavy':
        return '👥';
      case 'case-heavy':
        return '📊';
      default:
        return '⚖️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link href={`/child/${child.id}`} className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">
            ← 返回孩子详情
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            💼 求职中心
          </h1>
          <p className="text-gray-400">为 {child.name} 申请工作</p>
        </header>

        {/* 求职材料概览 */}
        {child.career && (
          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">求职材料概览</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">简历分数</div>
                <div className="text-2xl font-bold text-white">{child.career.resume_score}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">OA分数</div>
                <div className="text-2xl font-bold text-white">{child.career.oa_score}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">行为面试</div>
                <div className="text-2xl font-bold text-white">{child.career.interviews.behaviour}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">技术面试</div>
                <div className="text-2xl font-bold text-white">{child.career.interviews.tech}</div>
              </div>
            </div>
          </div>
        )}

        {/* 公司选择 */}
        {!selectedCompany && (
          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">选择申请的公司</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => handleSelectCompany(company.id)}
                  className="p-4 rounded-lg border-2 border-gray-700 hover:border-cyan-400 cursor-pointer transition-all glass-card"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{company.name_zh || company.name}</h3>
                    <span className="text-2xl">{getInterviewStyleIcon(company.interview_style)}</span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>简历门槛: {company.resume_bar}</div>
                    <div>OA门槛: {company.oa_bar}</div>
                    <div>面试风格: {company.interview_style}</div>
                    <div className="text-cyan-400">品牌加成: {company.brand_multiplier}x</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 申请流程 */}
        {selectedCompany && applicationStage !== 'result' && (
          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-cyan-400">
              申请流程 - {companies.find((c) => c.id === selectedCompany)?.name_zh}
            </h2>

            {/* 流程步骤 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 ${applicationStage === 'resume' ? 'text-cyan-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    applicationStage === 'resume' ? 'bg-cyan-400 text-black' : 'bg-gray-700'
                  }`}>
                    1
                  </div>
                  <span>简历筛选</span>
                </div>
                <div className={`flex items-center gap-2 ${applicationStage === 'oa' ? 'text-cyan-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    applicationStage === 'oa' ? 'bg-cyan-400 text-black' : 'bg-gray-700'
                  }`}>
                    2
                  </div>
                  <span>在线测评</span>
                </div>
                <div className={`flex items-center gap-2 ${applicationStage === 'interview' ? 'text-cyan-400' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    applicationStage === 'interview' ? 'bg-cyan-400 text-black' : 'bg-gray-700'
                  }`}>
                    3
                  </div>
                  <span>面试</span>
                </div>
              </div>
            </div>

            {/* 当前步骤操作 */}
            <div className="text-center">
              {applicationStage === 'resume' && (
                <button
                  onClick={handleResumeScreening}
                  disabled={isProcessing}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    isProcessing
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
                  }`}
                >
                  {isProcessing ? '处理中...' : '提交简历'}
                </button>
              )}

              {applicationStage === 'oa' && (
                <button
                  onClick={handleOA}
                  disabled={isProcessing}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    isProcessing
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white'
                  }`}
                >
                  {isProcessing ? '答题中...' : '开始在线测评'}
                </button>
              )}

              {applicationStage === 'interview' && (
                <div className="space-y-3">
                  {companies.find((c) => c.id === selectedCompany)?.interview_style === 'tech-heavy' && (
                    <>
                      <button
                        onClick={() => handleInterview('behaviour')}
                        disabled={isProcessing}
                        className="w-full px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white transition-all"
                      >
                        行为面试
                      </button>
                      <button
                        onClick={() => handleInterview('tech')}
                        disabled={isProcessing}
                        className="w-full px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white transition-all"
                      >
                        技术面试
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleFullProcess}
                    disabled={isProcessing}
                    className="w-full px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white transition-all"
                  >
                    {isProcessing ? '处理中...' : '快速完成全部流程'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 结果显示 */}
        {result && (
          <div className={`glass-card rounded-xl p-6 ${
            result.success ? 'border-green-500' : 'border-red-500'
          }`}>
            <div className="text-center">
              {result.success ? (
                <>
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-green-400 mb-2">恭喜获得 Offer！</h2>
                  {result.offer && (
                    <div className="space-y-2 text-white">
                      <div className="text-xl">{result.offer.target_name}</div>
                      <div className="text-yellow-400 text-2xl font-bold">
                        ${result.offer.compensation?.toLocaleString()}
                      </div>
                      <div className="text-gray-400">级别: {result.offer.level}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">😔</div>
                  <h2 className="text-3xl font-bold text-red-400 mb-2">未通过</h2>
                </>
              )}
              <div className="mt-4 text-gray-400 text-sm">
                {result.feedback.map((msg, idx) => (
                  <div key={idx}>{msg}</div>
                ))}
              </div>
              <button
                onClick={() => {
                  setSelectedCompany(null);
                  setApplicationStage('resume');
                  setResult(null);
                }}
                className="mt-6 px-6 py-2 rounded-lg border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all"
              >
                重新申请
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
