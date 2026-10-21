import { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { aiApi } from '../../api/ai.api';

export default function AIGenerator() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!topic) {
      toast.error('Тақырыпты енгізіңіз');
      return;
    }
    setLoading(true);
    try {
      const { questions: result } = await aiApi.generateTest({ topic, level, count });
      setQuestions(result);
      toast.success(`✅ ${result.length} сұрақ жасалды!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'AI қатесі');
    } finally {
      setLoading(false);
    }
  }

  function copyJSON() {
    navigator.clipboard.writeText(JSON.stringify(questions, null, 2));
    setCopied(true);
    toast.success('JSON көшірілді!');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">🤖 AI Тест Генератор</h1>
        <p className="text-slate-500 mt-1">Groq AI арқылы тест сұрақтарын жасаңыз</p>
      </div>

      <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Тақырып *</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input"
              placeholder="мысалы: Activity lifecycle, Kotlin негіздері..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Деңгей</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="input"
            >
              <option value="beginner">Бастауыш</option>
              <option value="intermediate">Орташа</option>
              <option value="advanced">Күрделі</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium">Сұрақ саны:</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 3)}
            min={1}
            max={20}
            className="input w-24"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          {loading ? '🤖 AI ойланып жатыр...' : 'Тест жасау'}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Жасалған сұрақтар ({questions.length})</h2>
            <button onClick={copyJSON} className="btn-secondary text-sm">
              {copied ? <Check className="w-4 h-4 inline mr-1" /> : <Copy className="w-4 h-4 inline mr-1" />}
              {copied ? 'Көшірілді' : 'JSON көшіру'}
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-900 mb-3">
                  {i + 1}. {q.title}
                </p>
                <div className="space-y-1 mb-3">
                  {q.options?.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`text-sm px-3 py-1 rounded ${
                        opt.id === q.correctAnswer
                          ? 'bg-green-100 text-green-800 font-medium'
                          : 'text-slate-700'
                      }`}
                    >
                      <span className="font-bold">{opt.id})</span> {opt.text}
                      {opt.id === q.correctAnswer && ' ✅'}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 italic">💡 {q.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}