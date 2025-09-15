"use client";

import { useMemo, useState, useRef, useEffect } from "react";

type ProviderKey =
  | "chatgpt"
  | "gemini"
  | "claude"
  | "copilot"
  | "perplexity"
  | "grok"
  | "deepseek"
  | "leo"
  | "komo"
  | "andi";

type Provider = {
  key: ProviderKey;
  label: string;
  color: string;
  shortName: string;
};

const ALL_PROVIDERS: Provider[] = [
  { key: "chatgpt", label: "ChatGPT", color: "from-emerald-500 to-emerald-700", shortName: "ChatGPT" },
  { key: "copilot", label: "Microsoft Copilot", color: "from-blue-500 to-blue-700", shortName: "Copilot" },
  { key: "gemini", label: "Google Gemini", color: "from-sky-500 to-sky-700", shortName: "Gemini" },
  { key: "perplexity", label: "Perplexity", color: "from-indigo-500 to-indigo-700", shortName: "Perplexity" },
  { key: "claude", label: "Claude", color: "from-amber-500 to-amber-700", shortName: "Claude" },
  { key: "grok", label: "Grok", color: "from-pink-500 to-pink-700", shortName: "Grok" },
  { key: "deepseek", label: "DeepSeek", color: "from-fuchsia-500 to-fuchsia-700", shortName: "DeepSeek" },
  { key: "leo", label: "Brave Leo", color: "from-orange-500 to-orange-700", shortName: "Leo" },
  { key: "komo", label: "Komo", color: "from-teal-500 to-teal-700", shortName: "Komo" },
  { key: "andi", label: "Andi", color: "from-rose-500 to-rose-700", shortName: "Andi" },
];

type ProviderResult = {
  provider: ProviderKey;
  text?: string;
  sources?: { title: string; url: string }[];
  error?: string;
  latencyMs?: number;
  status?: 'loading' | 'success' | 'error';
};

export default function AllAiSearch() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<ProviderKey, boolean>>(() =>
    ALL_PROVIDERS.reduce((acc, p) => ({ ...acc, [p.key]: true }), {} as Record<ProviderKey, boolean>)
  );
  const [results, setResults] = useState<ProviderResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedProviders = useMemo(
    () => ALL_PROVIDERS.filter(p => selected[p.key]),
    [selected]
  );

  const toggle = (key: ProviderKey) =>
    setSelected(s => ({ ...s, [key]: !s[key] }));

  const selectAll = () => {
    const allSelected = selectedProviders.length === ALL_PROVIDERS.length;
    setSelected(ALL_PROVIDERS.reduce((acc, p) => ({ ...acc, [p.key]: !allSelected }), {} as Record<ProviderKey, boolean>));
  };

  const handleSearch = async () => {
    if (!query.trim() || selectedProviders.length === 0) return;
    
    setLoading(true);
    setResults(null);

    // Initialize results with loading state
    const initialResults: ProviderResult[] = selectedProviders.map(provider => ({
      provider: provider.key,
      status: 'loading' as const
    }));
    setResults(initialResults);

    try {
      console.log('Sending request to backend...');
      const res = await fetch("http://localhost:8080/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, providers: selectedProviders.map(p => p.key) }),
      });

      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`Backend responded with status ${res.status}`);
      }
      
      const data = (await res.json()) as { results: ProviderResult[] };
      console.log('Received data:', data);
      
      setResults(data.results.map(r => ({ ...r, status: 'success' as const })));
    } catch (e) {
      console.error("Error connecting to backend:", e);
      
      // Show error message to user
      const errorResults: ProviderResult[] = selectedProviders.map(provider => ({
        provider: provider.key,
        error: "Cannot connect to backend. Make sure Spring Boot is running on port 8080.",
        status: 'error' as const
      }));
      setResults(errorResults);
    } finally {
      setLoading(false);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (results && results.length > 0) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          scrollLeft();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          scrollRight();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results]);

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/90 backdrop-blur-xl z-20 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-bold">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">ALL-AI</h1>
                <p className="text-xs text-white/60">Side-by-side AI comparison</p>
              </div>
            </div>
            
            {results && (
              <div className="text-sm text-white/80">
                {results.length} providers responding
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex gap-3 mb-4">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Compare responses from multiple AIs..."
              className="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 outline-none placeholder-white/50 focus:bg-white/15 focus:border-white/30 transition-all"
            />
            <button
              onClick={handleSearch}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2.5 font-semibold text-white disabled:opacity-40 hover:from-blue-600 hover:to-purple-700 transition-all whitespace-nowrap"
              disabled={loading || !query.trim() || selectedProviders.length === 0}
            >
              {loading ? "Searching..." : "Search All"}
            </button>
          </div>

          {/* Provider Selection - Horizontal */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={selectAll}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap mr-2"
            >
              {selectedProviders.length === ALL_PROVIDERS.length ? 'Deselect All' : 'Select All'}
            </button>
            {ALL_PROVIDERS.map((p) => (
              <button
                key={p.key}
                onClick={() => toggle(p.key)}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs transition-all whitespace-nowrap flex-shrink-0",
                  selected[p.key]
                    ? "bg-white/15 text-white border border-white/30"
                    : "bg-white/5 opacity-60 hover:opacity-90 border border-white/10",
                ].join(" ")}
              >
                {p.shortName}
              </button>
            ))}
            <div className="text-xs text-white/60 whitespace-nowrap ml-2 flex-shrink-0">
              {selectedProviders.length}/{ALL_PROVIDERS.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {!results && !loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-lg">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ready for Side-by-Side Comparison</h2>
              <p className="text-white/60">
                Enter your question above to see responses from multiple AI providers displayed in columns. 
                Scroll horizontally to compare different perspectives on the same topic.
              </p>
              <div className="mt-4 text-sm text-white/50">
                💡 Use ← → arrow keys or mouse scroll to navigate through responses
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative">
            {/* Scrollable Columns Container */}
            <div
              ref={scrollContainerRef}
              className="h-full overflow-x-auto overflow-y-hidden flex gap-4 p-4"
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.3) transparent'
              }}
            >
              {results?.map((result) => {
                const provider = ALL_PROVIDERS.find(p => p.key === result.provider)!;
                return (
                  <div
                    key={result.provider}
                    className="flex-shrink-0 w-80 lg:w-96 xl:w-[420px] h-full"
                  >
                    <div className="h-full bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col overflow-hidden hover:bg-white/[0.07] transition-all">
                      {/* Column Header */}
                      <div className={`bg-gradient-to-r ${provider.color} p-4 flex-shrink-0`}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg">{provider.label}</h3>
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            {result.status === 'loading' && (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {result.latencyMs && (
                              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                                {result.latencyMs}ms
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Column Content */}
                      <div className="flex-1 p-4 overflow-y-auto">
                        {result.status === 'loading' ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 text-white/60">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span className="text-sm">Loading...</span>
                            </div>
                            <div className="space-y-3 animate-pulse">
                              {[...Array(8)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`h-3 bg-white/10 rounded ${
                                    i % 4 === 0 ? 'w-full' : 
                                    i % 4 === 1 ? 'w-4/5' : 
                                    i % 4 === 2 ? 'w-3/4' : 'w-5/6'
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                        ) : result.error ? (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <h4 className="text-red-400 font-semibold mb-2 text-sm">Connection Error</h4>
                            <p className="text-red-300 text-sm">{result.error}</p>
                            <div className="mt-3 text-xs text-red-400">
                              Make sure the Spring Boot backend is running on port 8080
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="prose prose-sm prose-invert max-w-none">
                              <div className="whitespace-pre-wrap leading-relaxed text-white/90 text-sm">
                                {result.text}
                              </div>
                            </div>

                            {result.sources && result.sources.length > 0 && (
                              <div className="bg-white/5 rounded-lg p-3 border border-white/10 mt-4">
                                <h4 className="font-semibold mb-2 text-white/80 text-sm">
                                  Sources ({result.sources.length})
                                </h4>
                                <div className="space-y-1.5">
                                  {result.sources.map((source, i) => (
                                    <a
                                      key={i}
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 transition-colors text-xs underline decoration-dotted block"
                                    >
                                      {source.title}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows - Only show if content overflows */}
            {results && results.length > 0 && (
              <>
                <button
                  onClick={scrollLeft}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-black/90 transition-all z-10 opacity-80 hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={scrollRight}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-black/90 transition-all z-10 opacity-80 hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      {results && results.length > 0 && (
        <div className="border-t border-white/10 bg-black/90 px-6 py-2 flex items-center justify-center text-xs text-white/60 flex-shrink-0">
          <div className="flex items-center gap-4">
            <span>{results.length} AI providers</span>
            <span>•</span>
            <span>Scroll horizontally to compare responses</span>
            <span>•</span>
            <span>Use ← → keys to navigate</span>
          </div>
        </div>
      )}
    </div>
  );
}