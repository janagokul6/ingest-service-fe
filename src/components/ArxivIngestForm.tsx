import { useState } from 'react';
import { Search, Loader2, CheckCircle, AlertCircle, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_BASE;

const PRESET_CATEGORIES = [
    { id: 'cs.CL', label: 'Computational Linguistics' },
    { id: 'cs.LG', label: 'Machine Learning' },
    { id: 'cs.AI', label: 'Artificial Intelligence' },
    { id: 'cs.CV', label: 'Computer Vision' },
    { id: 'cs.NE', label: 'Neural & Evolutionary' },
    { id: 'cs.IR', label: 'Information Retrieval' },
    { id: 'math.AP', label: 'Analysis of PDEs' },
    { id: 'physics.class-ph', label: 'Classical Physics' },
    { id: 'stat.ML', label: 'Statistics — ML' },
    { id: 'q-bio.BM', label: 'Biomolecules' },
] as const;

interface IngestResult {
    enqueued: number;
    found: number;
    source: string;
    message: string;
}

export function ArxivIngestForm() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['cs.CL', 'cs.LG']);
    const [customCategory, setCustomCategory] = useState('');
    const [query, setQuery] = useState('');
    const [maxResults, setMaxResults] = useState(50);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<IngestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toggleCategory = (catId: string) => {
        setSelectedCategories((prev) =>
            prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
        );
    };

    const addCustomCategory = () => {
        const trimmed = customCategory.trim();
        if (trimmed && !selectedCategories.includes(trimmed)) {
            setSelectedCategories((prev) => [...prev, trimmed]);
            setCustomCategory('');
        }
    };

    const removeCategory = (catId: string) => {
        setSelectedCategories((prev) => prev.filter((c) => c !== catId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        if (selectedCategories.length === 0) {
            setError('Select at least one arXiv category.');
            return;
        }

        setIsLoading(true);

        try {
            const body = {
                categories: selectedCategories,
                query: query.trim() || undefined,
                max_results: maxResults,
            };

            const response = await fetch(`${API_BASE}/api/v1/arxiv`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || 'arXiv ingest failed');
                return;
            }

            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Network error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="w-full max-w-3xl mx-auto">
                <form
                    onSubmit={handleSubmit}
                    className={cn(
                        'rounded-3xl border-2 border-gray-200 bg-white overflow-hidden',
                        'shadow-sm transition-all duration-300'
                    )}
                >
                    <div className="p-8 space-y-6">
                        {/* ── Category Chips ── */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                arXiv Categories
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {PRESET_CATEGORIES.map((cat) => {
                                    const active = selectedCategories.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => toggleCategory(cat.id)}
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200',
                                                active
                                                    ? 'bg-brand-green-100 text-brand-green-800 ring-1 ring-brand-green-300'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            )}
                                        >
                                            <span className="font-mono text-xs opacity-70">{cat.id}</span>
                                            <span className="hidden sm:inline">·</span>
                                            <span className="hidden sm:inline">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Selected custom categories (not in presets) */}
                            {selectedCategories.filter((c) => !PRESET_CATEGORIES.some((p) => p.id === c)).length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {selectedCategories
                                        .filter((c) => !PRESET_CATEGORIES.some((p) => p.id === c))
                                        .map((cat) => (
                                            <span
                                                key={cat}
                                                className="inline-flex items-center gap-1 rounded-full bg-brand-blue-100 text-brand-blue-800 ring-1 ring-brand-blue-300 px-3 py-1 text-sm font-medium"
                                            >
                                                <span className="font-mono text-xs">{cat}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCategory(cat)}
                                                    className="ml-0.5 rounded-full p-0.5 hover:bg-brand-blue-200 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                </div>
                            )}

                            {/* Add custom */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addCustomCategory();
                                        }
                                    }}
                                    placeholder="Add custom, e.g. cs.RO"
                                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 placeholder:text-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={addCustomCategory}
                                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* ── Free-text query ── */}
                        <div>
                            <label htmlFor="arxiv-query" className="block text-sm font-medium text-gray-700 mb-2">
                                Search query <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                id="arxiv-query"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g. transformer, attention mechanism"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 placeholder:text-gray-400"
                            />
                        </div>

                        {/* ── Max results ── */}
                        <div>
                            <label htmlFor="max-results" className="block text-sm font-medium text-gray-700 mb-2">
                                Max papers <span className="text-gray-400 font-normal">(1–200)</span>
                            </label>
                            <input
                                id="max-results"
                                type="number"
                                min={1}
                                max={200}
                                value={maxResults}
                                onChange={(e) => setMaxResults(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
                            />
                        </div>
                    </div>

                    {/* ── Submit ── */}
                    <div className="px-8 pb-8 flex flex-col sm:flex-row gap-4 items-start">
                        <Button type="submit" disabled={isLoading} className="rounded-full px-8">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Searching arXiv…
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-4 w-4" />
                                    Search & Ingest Papers
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* ── Error ── */}
                {error && (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* ── Success ── */}
                {result && (
                    <div className="mt-6 flex items-center gap-4 rounded-3xl border border-brand-green-200 bg-brand-green-50/50 p-6 text-sm text-brand-green-900 shadow-sm border-dashed">
                        <div className="bg-brand-green-100 p-3 rounded-2xl">
                            <CheckCircle className="h-6 w-6 shrink-0 text-brand-green-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-base">{result.message}</p>
                            <div className="flex flex-wrap gap-4 text-brand-green-700/80">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green-400"></span>
                                    Papers Found: <strong className="text-brand-green-900">{result.found}</strong>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green-400"></span>
                                    Enqueued: <strong className="text-brand-green-900">{result.enqueued}</strong>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green-400"></span>
                                    Source: <strong className="text-brand-green-900 uppercase">{result.source}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
