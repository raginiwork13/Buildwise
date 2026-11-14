import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Trophy, 
  ArrowLeft, 
  Printer, 
  Sparkles, 
  X, 
  Loader2,
  Info,
  ShieldCheck,
  CreditCard,
  Building2,
  Zap
} from 'lucide-react';

interface ContractorScore {
  Rank: number;
  Contractor: string;
  'Price Score': number;
  'Scope Score': number;
  'Material Score': number;
  'Completeness (%)': number;
  'Timeline Score': number;
  'Warranty Score': number;
  'Payment Score': number;
  'Overall Score': number;
  total_price?: number;
  completion_period?: string;
  warranty?: string;
  payment_terms?: string;
  technical_spec_score?: number;
  brand_id_score?: number;
  highlights?: string[];
  risk_flags?: string[];
}

interface ComparisonData {
  status: string;
  project_title: string;
  total_contractors: number;
  winner: string;
  leaderboard: ContractorScore[];
  criteria_weights: Record<string, number>;
}

export const QuotationComparisonPage: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('Initializing analysis...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonData | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'cards'>('matrix');

  const resultsRef = useRef<HTMLDivElement>(null);

  // Animated loading stage updates
  useEffect(() => {
    if (!isLoading) return;
    const stages = [
      'Extracting contractor details & line-item BOQs...',
      'Auditing material specifications & brand traceability...',
      'Normalizing items & evaluating scope coverage...',
      'Applying 7-criteria MCDA weights & finalizing rankings...'
    ];
    let idx = 0;
    setLoadingStage(stages[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % stages.length;
      setLoadingStage(stages[idx]);
    }, 900);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-scroll to results as soon as they are ready
  useEffect(() => {
    if (comparisonResult && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [comparisonResult]);

  // Handle PDF file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter(
        f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf'
      );
      setSelectedFiles(prev => [...prev, ...filesArray]);
      setErrorMessage(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Load benchmark dataset from notebook
  const handleLoadBenchmark = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('http://localhost:8000/api/v1/quotations/benchmark');
      if (!res.ok) throw new Error('Failed to fetch benchmark comparison.');
      const data: ComparisonData = await res.json();
      setComparisonResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Unable to connect to the quotation comparison service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload multiple PDFs and compare
  const handleUploadAndCompare = async () => {
    if (selectedFiles.length < 2) {
      setErrorMessage('Please select at least 2 PDF quotation files to perform a side-by-side comparison.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await fetch('http://localhost:8000/api/v1/quotations/upload-pdfs', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || `Upload failed with status ${res.status}`);
      }

      const data: ComparisonData = await res.json();
      setComparisonResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing quotation PDFs. Ensure they contain readable text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Top Header & Breadcrumbs */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-purple-400 transition-colors flex items-center gap-1">
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-purple-400 font-medium">AI Quotation Comparison</span>
          </div>

          <div className="flex items-center gap-2.5">
            {comparisonResult && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print / Save PDF</span>
              </button>
            )}
            <Link
              to="/"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Title Banner */}
        <div className="mt-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            <span>7-Criteria Multi-Criteria Decision Analysis (MCDA)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
            AI Contractor Quotation Comparison
          </h1>
          <p className="text-slate-400 mt-3 text-sm sm:text-base leading-relaxed">
            Upload multiple contractor quotation PDFs. Our AI extracts line-item BOQs, audits material brands, normalizes costs, and calculates an unbiased multi-criteria ranking in seconds.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Upload & Setup Section */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Upload Contractor Quotation PDFs</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadBenchmark}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Load Notebook Benchmark (Gomes Dias, Vaz Patil, Konkan Crest)</span>
              </button>
            </div>
          </div>

          {/* Drag & Drop Multi-file Input */}
          <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl p-8 text-center transition-all bg-slate-900/40">
            <input
              type="file"
              id="pdf-upload-input"
              multiple
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="pdf-upload-input" className="cursor-pointer block space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
                <FileText className="w-7 h-7" />
              </div>
              <div className="text-sm font-semibold text-slate-200">
                Click to browse or drop contractor quotation PDFs here
              </div>
              <div className="text-xs text-slate-500">
                Upload 2 or more PDF files (e.g. Contractor A, Contractor B, Contractor C)
              </div>
            </label>
          </div>

          {/* Selected Files Badge List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selected Quotations ({selectedFiles.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="font-medium text-slate-200 truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-red-400 transition-colors p-1"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button & Loading Bar */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-400" />
                <span>MCDA Weights: Price 25% · Scope 25% · Material 15% · Completeness 10% · Timeline 10% · Warranty 10% · Payment 5%</span>
              </div>

              <button
                type="button"
                onClick={handleUploadAndCompare}
                disabled={isLoading || selectedFiles.length < 2}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Quotations...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Compare {selectedFiles.length > 0 ? `${selectedFiles.length} Uploaded Quotations` : 'Quotations with AI'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Progress Stage Feedback */}
            {isLoading && (
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-purple-300">AI Quotation Audit in Progress</div>
                  <div className="text-xs text-slate-300 mt-0.5">{loadingStage}</div>
                </div>
                <div className="text-[11px] font-mono text-purple-400 bg-purple-900/50 px-2 py-1 rounded">Fast Engine</div>
              </div>
            )}
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* COMPARISON RESULTS SECTION */}
        <div ref={resultsRef}>
          {comparisonResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              
              {/* Winner Spotlight Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-slate-800 to-slate-850 border border-purple-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                      <span>Rank 1 Recommended Bidder</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mt-0.5">
                      {comparisonResult.winner}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Achieved the highest overall multi-criteria rating (<strong>{comparisonResult.leaderboard[0]['Overall Score'].toFixed(2)} / 100</strong>) due to balanced pricing, comprehensive warranty coverage, and verified technical specifications.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-700">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Evaluated Bids</div>
                    <div className="text-lg font-black text-purple-400">{comparisonResult.total_contractors} Contractors</div>
                  </div>
                </div>
              </div>

              {/* TAB SELECTOR: Table Matrix (Notebook style) vs Detailed Cards */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('matrix')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'matrix'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Notebook Matrix Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('cards')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'cards'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Contractor Breakdown Cards
                  </button>
                </div>

                <span className="text-xs text-slate-500 font-mono">
                  {comparisonResult.total_contractors} Proposals Ranked
                </span>
              </div>

              {/* VIEW 1: NOTEBOOK DATAFRAME MATRIX TABLE */}
              {activeTab === 'matrix' && (
                <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-700 font-bold uppercase tracking-wider text-[11px]">
                          <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                          <th className="py-3.5 px-4 min-w-[200px]">Contractor</th>
                          <th className="py-3.5 px-4 text-right">Price Score (25%)</th>
                          <th className="py-3.5 px-4 text-right">Scope Score (25%)</th>
                          <th className="py-3.5 px-4 text-right">Material Score (15%)</th>
                          <th className="py-3.5 px-4 text-right">Completeness (%) (10%)</th>
                          <th className="py-3.5 px-4 text-right">Timeline Score (10%)</th>
                          <th className="py-3.5 px-4 text-right">Warranty Score (10%)</th>
                          <th className="py-3.5 px-4 text-right">Payment Score (5%)</th>
                          <th className="py-3.5 px-5 text-right font-black text-purple-300">Overall Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/60 font-mono text-[13px]">
                        {comparisonResult.leaderboard.map((row) => (
                          <tr 
                            key={row.Rank} 
                            className={`transition-colors hover:bg-slate-750/50 ${
                              row.Rank === 1 ? 'bg-purple-950/20 font-semibold' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4 text-center">
                              {row.Rank === 1 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-slate-900 font-black text-xs">
                                  1
                                </span>
                              ) : row.Rank === 2 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold text-xs">
                                  2
                                </span>
                              ) : row.Rank === 3 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs">
                                  3
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium">{row.Rank}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-sans font-bold text-slate-100 flex items-center gap-2">
                              <span>{row.Contractor}</span>
                              {row.Rank === 1 && (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Winner
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-300">{row['Price Score'].toFixed(2)}</td>
                            <td className="py-3.5 px-4 text-right text-slate-300">{row['Scope Score'].toFixed(2)}</td>
                            <td className="py-3.5 px-4 text-right text-slate-300">{row['Material Score'].toFixed(2)}</td>
                            <td className="py-3.5 px-4 text-right text-slate-300">{row['Completeness (%)'].toFixed(2)}</td>
                            <td className="py-3.5 px-4 text-right text-slate-300">{row['Timeline Score'].toFixed(2)}</td>
                            <td className="py-3.5 px-4 text-right text-slate-300">{row['Warranty Score'].toFixed(2)}</td>
                            <td className="py-3.5 px-4 text-right text-slate-300">{row['Payment Score'].toFixed(2)}</td>
                            <td className="py-3.5 px-5 text-right font-black text-sm text-purple-400">
                              {row['Overall Score'].toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: DETAILED CONTRACTOR CARDS */}
              {activeTab === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {comparisonResult.leaderboard.map((row) => (
                    <div 
                      key={row.Rank}
                      className={`rounded-2xl p-6 border shadow-xl flex flex-col justify-between transition-all ${
                        row.Rank === 1 
                          ? 'bg-slate-800/90 border-purple-500/50 shadow-purple-900/20' 
                          : 'bg-slate-800/60 border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-1">
                              <Building2 className="w-3.5 h-3.5" />
                              <span>Rank #{row.Rank}</span>
                            </div>
                            <h4 className="text-lg font-black text-white leading-snug">
                              {row.Contractor}
                            </h4>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Overall</div>
                            <div className="text-xl font-black text-purple-400 font-mono">
                              {row['Overall Score'].toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Quoted Price & Timeline Metrics */}
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 mb-4 text-xs font-mono">
                          <div>
                            <div className="text-[10px] text-slate-400 font-sans">Quoted Bid</div>
                            <div className="font-bold text-slate-200">
                              Rs. {row.total_price ? row.total_price.toLocaleString('en-IN') : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 font-sans">Timeline</div>
                            <div className="font-bold text-slate-200">
                              {row.completion_period || '10 Months'}
                            </div>
                          </div>
                        </div>

                        {/* Score breakdown bars */}
                        <div className="space-y-2.5 mb-5 text-xs">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                              <span>Price Score (25%)</span>
                              <span className="font-mono text-slate-200">{row['Price Score'].toFixed(2)}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, row['Price Score'])}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                              <span>Scope Score (25%)</span>
                              <span className="font-mono text-slate-200">{row['Scope Score'].toFixed(2)}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, row['Scope Score'])}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                              <span>Material Spec Score (15%)</span>
                              <span className="font-mono text-slate-200">{row['Material Score'].toFixed(2)}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, row['Material Score'])}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                              <span>Warranty Score (10%)</span>
                              <span className="font-mono text-slate-200">{row['Warranty Score'].toFixed(2)}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, row['Warranty Score'])}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Contractual Terms */}
                        <div className="space-y-2 text-xs text-slate-300 border-t border-slate-700/60 pt-3 mb-4">
                          <div className="flex items-start gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span className="truncate"><strong>Warranty:</strong> {row.warranty || '12 months'}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <span className="truncate"><strong>Payment:</strong> {row.payment_terms || 'Staged'}</span>
                          </div>
                        </div>

                        {/* Highlights & Risk Flags */}
                        <div className="space-y-1.5">
                          {row.highlights?.map((h, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>{h}</span>
                            </div>
                          ))}
                          {row.risk_flags?.map((r, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
