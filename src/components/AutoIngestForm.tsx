import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_BASE;

const SOURCES = [
  { id: 'openstax', label: 'OpenStax' },
  { id: 'libretexts', label: 'LibreTexts' },
  { id: 'oer_commons', label: 'OER Commons' },
  { id: 'all', label: 'All sources' },
] as const;

const LEVELS = ['Introductory', 'Advanced', 'General', 'College', 'Community College'];

const DOC_TYPES: { id: string; label: string }[] = [
  { id: '', label: 'Any' },
  { id: 'pdf', label: 'PDF' },
  { id: 'docx', label: 'DOCX' },
  { id: 'epub', label: 'EPUB' },
  { id: 'pptx', label: 'PPTX' },
  { id: 'xlsx', label: 'XLSX' },
  { id: 'csv', label: 'CSV' },
  { id: 'md', label: 'Markdown' },
  { id: 'txt', label: 'TXT' },
];

interface CrawlResult {
  enqueued: number;
  found: number;
  source: string;
  message: string;
}

export function AutoIngestForm() {
  // ... existing state ...
  const [source, setSource] = useState<string>('oer_commons');
  const [subjectInput, setSubjectInput] = useState('science, mathematics, humanities');
  const [level, setLevel] = useState('');
  const [docType, setDocType] = useState('');
  const [maxPages, setMaxPages] = useState<number>(5);
  const [maxDocs, setMaxDocs] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supportedDocTypes, setSupportedDocTypes] = useState<string[]>(['pdf', 'docx']);

  // ... (rest of the component logic until return) ...
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/supported-doc-types`)
      .then((res) => res.ok ? res.json() : null)
      .then((data: { supported?: string[] } | null) => {
        if (data?.supported) {
          setSupportedDocTypes(data.supported);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (docType && supportedDocTypes.length > 0 && !supportedDocTypes.includes(docType)) {
      setDocType('');
    }
  }, [supportedDocTypes, docType]);

  const docTypeForSubmit = docType && supportedDocTypes.includes(docType) ? docType : '';
  const showSubjectField = source === 'oer_commons' || source === 'all';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const body: Record<string, unknown> = {
        source,
        max_pages: showSubjectField ? maxPages : undefined,
        max_docs: maxDocs === '' ? undefined : Number(maxDocs),
        level: level || undefined,
        doc_types: docTypeForSubmit ? [docTypeForSubmit] : undefined,
      };
      if (showSubjectField) {
        const subjects = subjectInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        if (subjects.length > 0) body.subjects = subjects;
      }

      const response = await fetch(`${API_BASE}/api/v1/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Crawl failed');
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
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
              >
                {SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {showSubjectField && (
              <div>
                <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject(s) <span className="text-gray-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  id="subjects"
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="e.g. science, mathematics, humanities"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 placeholder:text-gray-400"
                />
              </div>
            )}

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                Level <span className="text-gray-400 font-normal">(optional filter)</span>
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
              >
                <option value="">Any</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="doc_type" className="block text-sm font-medium text-gray-700 mb-2">
                Document type <span className="text-gray-400 font-normal">(optional filter)</span>
              </label>
              <select
                id="doc_type"
                value={docTypeForSubmit}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
              >
                {DOC_TYPES.map((opt) => {
                  const isSupported = !opt.id || supportedDocTypes.includes(opt.id);
                  const label = opt.id && !isSupported ? `${opt.label} (Coming soon)` : opt.label;
                  return (
                    <option
                      key={opt.id || 'any'}
                      value={opt.id}
                      disabled={!isSupported}
                      className={!isSupported ? 'text-gray-500' : ''}
                    >
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {showSubjectField && (
                <div>
                  <label htmlFor="max_pages" className="block text-sm font-medium text-gray-700 mb-2">
                    Max pages per subject
                  </label>
                  <input
                    id="max_pages"
                    type="number"
                    min={1}
                    max={50}
                    value={maxPages}
                    onChange={(e) => setMaxPages(Number(e.target.value) || 1)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500"
                  />
                </div>
              )}
              <div>
                <label htmlFor="max_docs" className="block text-sm font-medium text-gray-700 mb-2">
                  Max documents <span className="text-gray-400 font-normal">(cap)</span>
                </label>
                <input
                  id="max_docs"
                  type="number"
                  min={1}
                  value={maxDocs}
                  onChange={(e) => setMaxDocs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="No limit"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:border-brand-green-500 focus:ring-1 focus:ring-brand-green-500 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 flex flex-col sm:flex-row gap-4 items-start">
            <Button type="submit" disabled={isLoading} className="rounded-full px-8">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching & enqueuing…
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search & Ingest
                </>
              )}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

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
                  Total Found: <strong className="text-brand-green-900">{result.found}</strong>
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
