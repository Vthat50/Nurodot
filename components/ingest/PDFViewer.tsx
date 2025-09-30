"use client"

import { useState, useEffect } from 'react'

interface PDFViewerProps {
  pdfFile: File
  highlightedText?: Array<{ text: string; type: 'inclusion' | 'exclusion' }>
}

export function PDFViewer({ pdfFile, highlightedText = [] }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('')

  useEffect(() => {
    const url = URL.createObjectURL(pdfFile)
    setPdfUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pdfFile])

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 w-full h-[700px] border rounded-lg bg-slate-50">
        <p className="text-slate-600">Loading PDF...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full border rounded-lg bg-white shadow-sm overflow-hidden">
        <iframe
          src={pdfUrl}
          className="w-full h-[700px]"
          title="PDF Viewer"
        />
      </div>

      {/* Legend showing what's highlighted */}
      {highlightedText.length > 0 && (
        <div className="w-full p-4 bg-slate-50 rounded-lg border">
          <p className="text-sm font-semibold text-slate-700 mb-2">
            📋 Extracted Criteria from this PDF:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded"></span>
                Inclusion Criteria ({highlightedText.filter(h => h.type === 'inclusion').length})
              </p>
              <ul className="text-xs text-slate-600 space-y-1">
                {highlightedText.filter(h => h.type === 'inclusion').slice(0, 3).map((h, i) => (
                  <li key={i} className="truncate">• {h.text}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                <span className="w-3 h-3 bg-red-500 rounded"></span>
                Exclusion Criteria ({highlightedText.filter(h => h.type === 'exclusion').length})
              </p>
              <ul className="text-xs text-slate-600 space-y-1">
                {highlightedText.filter(h => h.type === 'exclusion').slice(0, 3).map((h, i) => (
                  <li key={i} className="truncate">• {h.text}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}