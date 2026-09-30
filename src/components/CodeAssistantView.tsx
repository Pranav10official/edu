import React, { useState } from 'react';
import {
  Code2,
  Sparkles,
  Bug,
  HelpCircle,
  Play,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  Terminal,
  FileCode,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { runProgrammingAssistant } from '../services/api';
import { CodeAnalysis } from '../types';

export const CodeAssistantView: React.FC = () => {
  const { addXP, unlockBadge } = useApp();

  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [action, setAction] = useState<'explain' | 'debug' | 'line_by_line' | 'practice'>('explain');
  const [userQuery, setUserQuery] = useState('');
  const [codeSnippet, setCodeSnippet] = useState(`def fibonacci(n):
    # Buggy recursive implementation
    if n == 0:
        return 0
    if n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)

# Calling with large n causes exponential runtime
print(fibonacci(10))`);
  const [errorTrace, setErrorTrace] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CodeAnalysis | null>(null);
  const [copied, setCopied] = useState(false);

  const languages = [
    { label: 'Python', val: 'python' },
    { label: 'JavaScript', val: 'javascript' },
    { label: 'TypeScript', val: 'typescript' },
    { label: 'C++', val: 'cpp' },
    { label: 'Java', val: 'java' },
    { label: 'Rust', val: 'rust' },
    { label: 'SQL', val: 'sql' },
  ];

  const presets = [
    {
      title: 'Fix Recursive Fibonacci',
      lang: 'python',
      act: 'debug',
      query: 'Optimize this recursive function using memoization/DP to avoid exponential O(2^n) time.',
      code: `def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)
print(fib(35))`,
    },
    {
      title: 'Two Sum in TypeScript',
      lang: 'typescript',
      act: 'explain',
      query: 'Explain how the hash map achieves O(n) time complexity compared to brute force O(n^2).',
      code: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    },
    {
      title: 'SQL JOIN vs GROUP BY',
      lang: 'sql',
      act: 'explain',
      query: 'Explain how this aggregation query calculates the total spent per customer.',
      code: `SELECT 
    c.customer_id, 
    c.customer_name, 
    SUM(o.total_amount) AS total_spent
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= '2026-01-01'
GROUP BY c.customer_id, c.customer_name
HAVING SUM(o.total_amount) > 500
ORDER BY total_spent DESC;`,
    },
  ];

  const handleRun = async () => {
    if ((!codeSnippet.trim() && !userQuery.trim()) || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      const data = await runProgrammingAssistant({
        action,
        language: selectedLanguage,
        code: codeSnippet,
        errorTrace: errorTrace || undefined,
        userQuery: userQuery || undefined,
      });

      setResult(data);
      addXP(35, `Programming Assistant: ${action.toUpperCase()}`);
      unlockBadge('code_whisperer');
    } catch (err: any) {
      console.error(err);
      alert(`Could not process code: ${err.message || 'Please check connection.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/20 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Programming Assistant</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Debug syntax & logic errors, explain algorithms line-by-line, and tackle practice challenges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span>Interactive Computer Science Tutor</span>
        </div>
      </div>

      {/* Editor & Configuration */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Language & Action selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-300">Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {languages.map((l) => (
                <option key={l.val} value={l.val}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            {(
              [
                { id: 'explain', label: 'Explain Code', icon: HelpCircle },
                { id: 'debug', label: 'Debug & Fix', icon: Bug },
                { id: 'line_by_line', label: 'Line-by-Line', icon: FileCode },
                { id: 'practice', label: 'Practice Challenge', icon: Zap },
              ] as const
            ).map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={() => setAction(act.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    action === act.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{act.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Query / Task */}
        <div>
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask a question or describe the desired behavior... (e.g. 'Why is this throwing an IndexError?' or 'How does binary search work?')"
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500"
          />
        </div>

        {/* Code Editor */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-mono">source_code.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'typescript' ? 'ts' : selectedLanguage === 'sql' ? 'sql' : 'cpp'}</span>
            <span>Type or paste snippet</span>
          </div>
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            rows={8}
            placeholder="// Paste your code here..."
            className="w-full font-mono text-xs sm:text-sm bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3.5 text-slate-100 focus:outline-none transition leading-relaxed"
          />
        </div>

        {/* Optional Error Trace */}
        {action === 'debug' && (
          <div>
            <label className="text-xs font-semibold text-rose-300 block mb-1">
              Optional: Error Output / Traceback
            </label>
            <textarea
              value={errorTrace}
              onChange={(e) => setErrorTrace(e.target.value)}
              rows={2}
              placeholder="e.g. RecursionError: maximum recursion depth exceeded, or TypeError: undefined is not a function"
              className="w-full font-mono text-xs bg-slate-950 border border-rose-950/60 focus:border-rose-500 rounded-xl p-2.5 text-rose-200 placeholder-slate-600 focus:outline-none"
            />
          </div>
        )}

        {/* Action Button & Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedLanguage(p.lang);
                  setAction(p.act as any);
                  setUserQuery(p.query);
                  setCodeSnippet(p.code);
                }}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded-lg border border-slate-700 transition"
              >
                {p.title}
              </button>
            ))}
          </div>

          <button
            onClick={handleRun}
            disabled={(!codeSnippet.trim() && !userQuery.trim()) || isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-40 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Processing Code...' : 'Analyze with AI Assistant'}</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 animate-spin">
            <Terminal className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Analyzing Syntax, Logic & Performance</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            EduGenie is evaluating time/space complexity, spotting edge cases, and generating optimal patterns...
          </p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            {/* Summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 mr-2">
                  {result.action.toUpperCase()}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedLanguage}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1.5">
                  {result.summary}
                </h3>
              </div>

              {result.fixedCode && (
                <button
                  onClick={() => handleCopyCode(result.fixedCode!)}
                  className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              )}
            </div>

            {/* In-depth Analysis */}
            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {result.analysis}
            </div>

            {/* Complexity Badges */}
            {(result.timeComplexity || result.spaceComplexity) && (
              <div className="flex flex-wrap gap-3">
                {result.timeComplexity && (
                  <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs">
                    <span className="text-slate-400 mr-1.5">Time Complexity:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {result.timeComplexity}
                    </span>
                  </div>
                )}
                {result.spaceComplexity && (
                  <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs">
                    <span className="text-slate-400 mr-1.5">Space Complexity:</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {result.spaceComplexity}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Line-by-Line Breakdown if available */}
            {result.lineByLine && result.lineByLine.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Line-by-Line Code Breakdown
                </h4>
                <div className="space-y-2">
                  {result.lineByLine.map((line, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex gap-3 text-xs"
                    >
                      <span className="font-mono text-blue-400 font-bold shrink-0">
                        Line {line.line}:
                      </span>
                      <span className="text-slate-200">{line.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Corrected / Refactored Code */}
            {result.fixedCode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <span>Corrected & Optimal Implementation</span>
                  <span className="font-mono text-slate-400 text-[11px]">{selectedLanguage}</span>
                </div>
                <pre className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 font-mono text-xs sm:text-sm text-emerald-200 overflow-x-auto leading-relaxed">
                  <code>{result.fixedCode}</code>
                </pre>
              </div>
            )}

            {/* Best Practices */}
            {result.bestPractices && result.bestPractices.length > 0 && (
              <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-4">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                  Software Engineering Best Practices
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {result.bestPractices.map((bp, i) => (
                    <li key={i}>{bp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Practice Challenge */}
            {result.practiceChallenge && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>Related Coding Challenge: {result.practiceChallenge.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {result.practiceChallenge.description}
                </p>
                {result.practiceChallenge.starterSnippet && (
                  <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                    <code>{result.practiceChallenge.starterSnippet}</code>
                  </pre>
                )}
                {result.practiceChallenge.hint && (
                  <div className="text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20">
                    <strong>Hint:</strong> {result.practiceChallenge.hint}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
