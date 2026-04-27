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
  loading: React.ReactNode
  error: React.ReactNode
}

export default function PDFViewer({ 
  pdfUrl, paginaActual, width, onLoadSuccess, loading, error 
}: PDFViewerProps) {
  return (
    <Document
      file={pdfUrl}
      onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
      loading={loading}
      error={error}
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
