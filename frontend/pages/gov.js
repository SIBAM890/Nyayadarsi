import { useState, useCallback } from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import { uploadTender, checkIntegrity } from '../lib/api';

// ── Criterion Card ──
function CriterionCard({ criterion, index }) {
  const typeColors = {
    financial: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    technical: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    compliance: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
  };
  const colors = typeColors[criterion.type] || typeColors.compliance;

  return (
    <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase bg-gradient-to-r ${colors} border`}>
            {criterion.type}
          </span>
          {criterion.mandatory ? (
            <span className="badge-red text-[10px]">MANDATORY</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-nyaya-600/20 text-nyaya-300 border border-nyaya-500/20">
              DISCRETIONARY
            </span>
          )}
          {criterion.blocker && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-600/20 text-red-400 border border-red-500/20">
              BLOCKER
            </span>
          )}
        </div>
        <span className="text-xs text-nyaya-400/40 font-mono">{criterion.criterion_id}</span>
      </div>

      <p className="text-sm text-nyaya-100/80 leading-relaxed mb-3">{criterion.description}</p>

      {criterion.threshold && (
        <div className="flex items-center gap-4 text-xs text-nyaya-300/50">
          <span>Threshold: <span className="text-white font-semibold">
            {criterion.threshold_unit === 'INR' ? `₹${(criterion.threshold / 10000000).toFixed(1)} Cr` : criterion.threshold}
          </span> {criterion.threshold_unit !== 'INR' ? criterion.threshold_unit : ''}</span>
          {criterion.language_signal && (
            <span>Signal: <span className="font-mono text-saffron-400">{criterion.language_signal}</span></span>
          )}
        </div>
      )}

      {criterion.specificity_alert && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-saffron-500/10 border border-saffron-500/20 text-xs text-saffron-400">
          ⚠️ AI flagged this criterion as potentially restrictive
        </div>
      )}
    </div>
  );
}

// ── Integrity Alert ──
function IntegrityAlert({ alert, onRevise, onOverride }) {
  const [showOverride, setShowOverride] = useState(false);
  const [justification, setJustification] = useState('');

  return (
    <div className="border border-red-500/30 bg-red-500/5 rounded-2xl p-5 animate-slide-up">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
          🚨
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-400 mb-1">Nyayadarsi Integrity Alert</h4>
          <p className="text-xs text-red-300/70 leading-relaxed">{alert.reason}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-red-300/50 mb-4">
        <span>Estimated qualifying vendors: </span>
        <span className="font-bold text-red-400">{alert.estimated_qualifying_vendors}</span>
      </div>

      {!showOverride ? (
        <div className="flex gap-3">
          <button onClick={onRevise} className="px-4 py-2 bg-nyaya-600/20 hover:bg-nyaya-600/30 text-nyaya-300 rounded-lg text-xs font-medium transition-colors">
            Revise Criterion
          </button>
          <button onClick={() => setShowOverride(true)} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-xs font-medium transition-colors">
            Override with Justification
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Provide mandatory justification for overriding this alert..."
            className="input-field text-xs h-20 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => { if (justification.length >= 10) onOverride(justification); }}
              disabled={justification.length < 10}
              className="px-4 py-2 bg-red-600/30 hover:bg-red-600/40 text-red-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-30"
            >
              Confirm Override
            </button>
            <button onClick={() => setShowOverride(false)} className="btn-ghost text-xs">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Upload Zone ──
function UploadZone({ onUpload, isLoading }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.name.endsWith('.pdf')) onUpload(file);
  }, [onUpload]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`relative glass-card p-10 text-center transition-all duration-300 cursor-pointer group ${
        dragActive ? 'border-nyaya-400/50 bg-nyaya-500/10' : 'hover:border-nyaya-500/30'
      } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      onClick={() => {
        if (!isLoading) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.pdf';
          input.onchange = (e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); };
          input.click();
        }
      }}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-nyaya-500/20 flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-nyaya-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
          <p className="text-sm text-nyaya-300/70">Processing with Gemini AI...</p>
          <p className="text-xs text-nyaya-400/40">Extracting eligibility criteria from tender document</p>
          <div className="w-48 mx-auto h-1 bg-nyaya-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-nyaya-500 to-saffron-500 rounded-full animate-shimmer" style={{ width: '60%' }}></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-nyaya-600/20 flex items-center justify-center group-hover:bg-nyaya-500/20 transition-colors">
            <span className="text-3xl">📄</span>
          </div>
          <div>
            <p className="text-sm font-medium text-nyaya-200/80">Drop tender PDF here or click to upload</p>
            <p className="text-xs text-nyaya-400/40 mt-1">Gemini AI will extract all eligibility criteria automatically</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──
export default function GovDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [manualCriterion, setManualCriterion] = useState('');
  const [manualAlert, setManualAlert] = useState(null);
  const [checkingManual, setCheckingManual] = useState(false);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const { data, error: err } = await uploadTender(file);
    setIsLoading(false);

    if (err) {
      setError(typeof err === 'string' ? err : JSON.stringify(err));
    } else {
      setResult(data);
    }
  };

  const handleManualCheck = async () => {
    if (!manualCriterion.trim()) return;
    setCheckingManual(true);
    setManualAlert(null);
    const { data } = await checkIntegrity(manualCriterion);
    setCheckingManual(false);
    if (data) setManualAlert(data);
  };

  return (
    <>
      <Head>
        <title>Government Dashboard — Nyayadarsi</title>
      </Head>
      <Layout title="Government Officer — Create Tender">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Upload Section */}
          <section>
            <div className="mb-6">
              <h3 className="section-title">📋 Upload Tender Document</h3>
              <p className="section-subtitle">Upload an existing tender PDF — Gemini AI extracts all eligibility criteria</p>
            </div>
            <UploadZone onUpload={handleUpload} isLoading={isLoading} />
          </section>

          {/* Error */}
          {error && (
            <div className="px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-slide-up">
              ❌ {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Total Criteria', value: result.total_criteria, icon: '📊' },
                  { label: 'Mandatory', value: result.mandatory_count, icon: '🔒' },
                  { label: 'Discretionary', value: result.discretionary_count, icon: '📎' },
                  { label: 'Alerts', value: result.alerts?.length || 0, icon: '🚨' },
                  { label: 'Pages', value: result.pdf_info?.pages || 0, icon: '📄' },
                ].map((stat) => (
                  <div key={stat.label} className="glass-card p-4 text-center">
                    <p className="text-2xl mb-1">{stat.icon}</p>
                    <p className="stat-value text-2xl">{stat.value}</p>
                    <p className="text-xs text-nyaya-400/50 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Doc Hash */}
              <div className="glass-card p-4 flex items-center gap-3">
                <span className="text-lg">🔐</span>
                <div>
                  <p className="text-xs text-nyaya-400/50">Document SHA-256</p>
                  <p className="text-xs font-mono text-nyaya-300/70 break-all">{result.doc_hash}</p>
                </div>
              </div>

              {/* Integrity Alerts */}
              {result.alerts?.length > 0 && (
                <section>
                  <h3 className="section-title mb-4">🚨 Integrity Alerts ({result.alerts.length})</h3>
                  <div className="space-y-4">
                    {result.alerts.map((alert, i) => (
                      <IntegrityAlert
                        key={i}
                        alert={alert}
                        onRevise={() => {}}
                        onOverride={(justification) => console.log('Override:', justification)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Extracted Criteria */}
              <section>
                <h3 className="section-title mb-4">📋 Extracted Criteria ({result.criteria?.length})</h3>
                <div className="grid gap-4">
                  {result.criteria?.map((c, i) => (
                    <CriterionCard key={c.criterion_id || i} criterion={c} index={i} />
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Manual Criterion Check */}
          <section className="glass-card p-6">
            <h3 className="section-title mb-1">✍️ Manual Criterion Check</h3>
            <p className="section-subtitle mb-4">Type a criterion to check for integrity alerts in real time</p>
            <div className="flex gap-3">
              <input
                value={manualCriterion}
                onChange={(e) => setManualCriterion(e.target.value)}
                placeholder="e.g., Minimum annual turnover of Rs 50 Crore in last 2 years"
                className="input-field flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleManualCheck()}
              />
              <button onClick={handleManualCheck} disabled={checkingManual} className="btn-primary whitespace-nowrap">
                {checkingManual ? 'Checking...' : 'Check'}
              </button>
            </div>
            {manualAlert && (
              <div className={`mt-4 p-4 rounded-xl text-sm animate-slide-up ${
                manualAlert.alert
                  ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                  : 'bg-verdict-green/10 border border-verdict-green/20 text-verdict-green'
              }`}>
                {manualAlert.alert ? '🚨' : '✅'} {manualAlert.reason}
                <span className="block text-xs mt-1 opacity-60">
                  Estimated qualifying vendors: {manualAlert.estimated_qualifying_vendors}
                </span>
              </div>
            )}
          </section>
        </div>
      </Layout>
    </>
  );
}
