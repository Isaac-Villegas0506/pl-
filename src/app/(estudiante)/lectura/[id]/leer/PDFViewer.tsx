'use client'

import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
  pdfUrl: string
  paginaActual: number
  width: number
  onLoadSuccess: (numPages: number) => void
}

export default function PDFViewer({ pdfUrl, paginaActual, width, onLoadSuccess }: PDFViewerProps) {
  return (
    <Document
      file={pdfUrl}
      onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
      loading={
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      }
      error={
        <div className="flex items-center justify-center h-[60vh] text-[#94A3B8] text-sm">
          Error al cargar el PDF
        </div>
      }
    >
      <Page
        pageNumber={paginaActual}
        width={width}
        renderAnnotationLayer={false}
        renderTextLayer={false}
      />
    </Document>
  )
}
