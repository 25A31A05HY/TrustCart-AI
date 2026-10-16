/**
 * TrustCart AI — Administration & Data Ingestion Pipeline
 * Editorial retail design: Manages real catalogue and policy ingestion,
 * schema validation, index health diagnostics, and provenance audit history.
 */
import React, { useState } from 'react';
import {
  Database,
  Upload,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  History
} from 'lucide-react';
import { indexStore, IngestionLog, parseTextToRecords } from '../engine/indexStore';

interface AdminIngestionProps {
  onDataChanged: () => void;
}

export const AdminIngestion: React.FC<AdminIngestionProps> = ({ onDataChanged }) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const [importType, setImportType] = useState<'catalogue' | 'policy'>('catalogue');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [lastResult, setLastResult] = useState<IngestionLog | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const status = indexStore.getStatus();
  const history = indexStore.getIngestionHistory();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      const res = parseTextToRecords(content);
      setDetectedFormat(res.format.toUpperCase());
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setJsonText(text);
    if (text.trim().length > 10) {
      const res = parseTextToRecords(text);
      setDetectedFormat(res.format.toUpperCase());
    } else {
      setDetectedFormat(null);
    }
  };

  const handleImport = () => {
    setParseError(null);
    setLastResult(null);

    if (!jsonText.trim()) {
      setParseError('Please provide JSON, CSV, or JSONL payload to import.');
      return;
    }

    try {
      const parsed = parseTextToRecords(jsonText);
      if (parsed.error || parsed.records.length === 0) {
        setParseError(parsed.error || 'No valid records could be parsed.');
        return;
      }

      setDetectedFormat(parsed.format.toUpperCase());
      const items = parsed.records;

      let log: IngestionLog;
      if (importType === 'catalogue') {
        log = indexStore.importProducts(items, importMode);
      } else {
        log = indexStore.importPolicies(items, importMode);
      }

      setLastResult(log);
      setJsonText('');
      onDataChanged();
    } catch (err: any) {
      setParseError(`Ingestion parsing error: ${err.message}`);
    }
  };

  const handleResetToBaseline = () => {
    indexStore.initializeDefaultData();
    setLastResult(null);
    setParseError(null);
    onDataChanged();
  };

  const sampleProductJson = `[
  {
    "id": "prod-sample-99",
    "sku": "SAM-PROD-99",
    "title": "Anker 737 Power Bank (PowerCore 24K, 140W)",
    "brand": "Anker",
    "category": "Accessories",
    "subcategory": "Power Banks",
    "price": 149.99,
    "currency": "USD",
    "rating": 4.9,
    "reviewCount": 1280,
    "inStock": true,
    "stockCount": 25,
    "leadTimeDays": 2,
    "specs": {
      "capacityMah": 24000,
      "maxOutputWatts": 140,
      "ports": "2x USB-C, 1x USB-A",
      "digitalDisplay": true
    },
    "keyFeatures": [
      "Ultra-powerful 140W fast charging powers high-end laptops and phones simultaneously",
      "Smart digital display shows real-time output and remaining battery recharge time"
    ],
    "warrantyMonths": 24,
    "returnWindowDays": 30,
    "tags": ["power bank", "charger", "anker", "140w", "usb-c"]
  }
]`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Index Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#E6E4DC] gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#7A7870] font-semibold block mb-1">
            Data Engineering & Provenance
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A18] tracking-tight">
            Catalogue & Policy Ingestion Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#686660] mt-1 max-w-xl">
            Import authoritative product inventories and store policy clauses. Automatically reconstructs inverted lexical indexes and dense vector embeddings upon ingestion.
          </p>
        </div>

        <button
          onClick={handleResetToBaseline}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF1EF] border border-[#DDD9CF] text-xs text-[#8F3E2B] hover:text-[#6E2A1B] font-medium transition-colors shadow-2xs self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Canonical Baseline</span>
        </button>
      </div>

      {/* Index Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E6E4DC] shadow-xs">
          <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block mb-1">Products Indexed</span>
          <span className="text-2xl font-bold text-[#1A1A18] font-mono tabular-nums">{status.productCount}</span>
          <span className="text-xs text-[#2E4032] block mt-1">Verified Inventory Units</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6E4DC] shadow-xs">
          <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block mb-1">Policy Documents</span>
          <span className="text-2xl font-bold text-[#1A1A18] font-mono tabular-nums">{status.policyCount}</span>
          <span className="text-xs text-[#2E4032] block mt-1">{status.clauseCount} Verified Clauses</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6E4DC] shadow-xs">
          <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block mb-1">Atomic Chunks</span>
          <span className="text-2xl font-bold text-[#1A1A18] font-mono tabular-nums">{status.chunkCount}</span>
          <span className="text-xs text-[#5A5850] block mt-1">Vector & Inverted Chunks</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6E4DC] shadow-xs">
          <span className="text-[11px] font-semibold text-[#7A7870] uppercase tracking-wider block mb-1">Lexical Terms</span>
          <span className="text-2xl font-bold text-[#1A1A18] font-mono tabular-nums">{status.vocabularySize}</span>
          <span className="text-xs text-[#5A5850] block mt-1">Normalized BM25 Terms</span>
        </div>
      </div>

      {/* Ingestion Form & Editor */}
      <div className="bg-white border border-[#E6E4DC] rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE8E0]">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-[#2E4032]" />
            <h3 className="font-serif font-bold text-base text-[#1A1A18]">Dynamic Dataset Ingestion</h3>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {/* Import Target Switcher */}
            <div className="flex items-center bg-[#EFECE5] p-0.5 rounded-lg border border-[#E0DED5]">
              <button
                onClick={() => setImportType('catalogue')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  importType === 'catalogue' ? 'bg-white text-[#2E4032] shadow-2xs font-semibold' : 'text-[#706E66] hover:text-[#1A1A18]'
                }`}
              >
                Catalogue Records
              </button>
              <button
                onClick={() => setImportType('policy')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  importType === 'policy' ? 'bg-white text-[#2E4032] shadow-2xs font-semibold' : 'text-[#706E66] hover:text-[#1A1A18]'
                }`}
              >
                Policy Document
              </button>
            </div>

            {/* Ingestion Mode */}
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as any)}
              className="bg-[#FAF9F6] border border-[#DDD9CF] rounded-lg px-3 py-1.5 text-xs text-[#1A1A18] focus:outline-none focus:border-[#2E4032]"
            >
              <option value="append">Append / Update</option>
              <option value="replace">Replace Store Database</option>
            </select>
          </div>
        </div>

        {/* Input Area Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs text-[#7A7870] gap-2">
            <div className="flex items-center space-x-2">
              <span>Paste JSON, CSV, or JSONL payload, or upload file:</span>
              {detectedFormat && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F0F4F1] text-[#2E4032] border border-[#D5E0D7]">
                  Format: {detectedFormat}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-[#2E4032] hover:text-[#1A1A18] underline underline-offset-2 font-medium cursor-pointer flex items-center space-x-1">
                <span>Upload File (.json, .csv, .jsonl)</span>
                <input
                  type="file"
                  accept=".json,.csv,.jsonl,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  setJsonText(sampleProductJson);
                  setDetectedFormat('JSON');
                }}
                className="text-[#7A7870] hover:text-[#1A1A18] underline underline-offset-2 font-medium"
              >
                Load Sample JSON
              </button>
            </div>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={8}
            placeholder="Paste JSON array, JSONL objects, or CSV table (e.g. id, sku, title, brand, price, stock)..."
            className="w-full bg-[#FAF9F6] border border-[#D5D3C9] focus:border-[#2E4032] rounded-xl p-3.5 font-mono text-xs text-[#1A1A18] placeholder-[#94928A] focus:outline-none shadow-2xs"
          />
        </div>

        {parseError && (
          <div className="p-3 rounded-xl bg-[#FAF1EF] border border-[#E8D5D0] text-xs text-[#8F3E2B] flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#8F3E2B] shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        <button
          onClick={handleImport}
          className="px-5 py-2.5 rounded-xl bg-[#2E4032] hover:bg-[#233226] text-white font-medium text-xs transition-all shadow-xs active:scale-[0.99] flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Ingest & Reconstruct Search Index</span>
        </button>

        {/* Ingestion Result Feedback */}
        {lastResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${
            lastResult.recordsFailed === 0
              ? 'bg-[#F0F4F1] border-[#D5E0D7] text-[#2E4032]'
              : 'bg-[#FAF6EC] border-[#EBDCB8] text-[#8A6820]'
          }`}>
            <div className="flex items-center space-x-2 font-semibold">
              {lastResult.recordsFailed === 0 ? (
                <CheckCircle className="w-4 h-4 text-[#2E4032]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#8A6820]" />
              )}
              <span>
                Ingestion Completed: {lastResult.recordsValid} valid records indexed, {lastResult.recordsFailed} failed.
              </span>
            </div>

            {lastResult.errors.length > 0 && (
              <div className="mt-2 space-y-1">
                <span className="font-semibold text-[#8F3E2B] block">Schema Validation Errors:</span>
                <ul className="list-disc list-inside text-[#8F3E2B] text-[11px] font-mono">
                  {lastResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ingestion History Audit Trail */}
      <div className="bg-white border border-[#E6E4DC] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#EAE8E0]">
          <History className="w-5 h-5 text-[#2E4032]" />
          <h3 className="font-serif font-bold text-base text-[#1A1A18]">Dataset Provenance & Ingestion Audit Log</h3>
        </div>

        <div className="divide-y divide-[#F0EFEA] text-xs font-mono">
          {history.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[#8A8880]">[{log.timestamp}]</span>{' '}
                <strong className="text-[#1A1A18] uppercase">{log.type}</strong> ({log.action})
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-[#2E4032]">Valid: {log.recordsValid}</span>
                <span className={log.recordsFailed > 0 ? 'text-[#8F3E2B]' : 'text-[#8A8880]'}>
                  Failed: {log.recordsFailed}
                </span>
                <span className="text-[#5A5850]">Total: {log.recordsProcessed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
