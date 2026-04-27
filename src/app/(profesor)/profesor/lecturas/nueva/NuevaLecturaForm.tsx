'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, X, Image as ImageIcon } from 'lucide-react'
import ProfesorTopBar from '@/components/layout/ProfesorTopBar'
import { crearLecturaAction } from '../../actions'

interface Props {
  profesorId: string
  materias: { id: string; nombre: string }[]
  categorias: { id: string; nombre: string }[]
  grados: { id: string; nombre: string }[]
  niveles: { id: string; nombre: string }[]
}

export default function NuevaLecturaForm({ profesorId, materias, categorias, grados, niveles }: Props) {
  const router = useRouter()
  const pdfRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  const [titulo, setTitulo] = useState('')
  const [autor, setAutor] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [materiaId, setMateriaId] = useState<string | null>(null)
  const [categoriaId, setCategoriaId] = useState<string | null>(null)
  const [gradoId, setGradoId] = useState<string | null>(null)
  const [nivelId, setNivelId] = useState<string | null>(null)
  const [anio, setAnio] = useState('')
  const [paginas, setPaginas] = useState('')
  const [esGlobal, setEsGlobal] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [imgPreview, setImgPreview] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const MAX_PDF = 50 * 1024 * 1024
  const MAX_IMG = 5 * 1024 * 1024

  function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_PDF) { setPdfError('El archivo supera los 50MB.'); return }
    setPdfError(''); setPdfFile(file)
  }

  function handleImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_IMG) return
    setImgFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImgPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(estado: 'borrador' | 'publicado') {
    if (!titulo.trim() || !autor.trim()) return
    setIsSubmitting(true)
    setUploadProgress(10)

    const result = await crearLecturaAction({
      titulo, autor,
      descripcion: descripcion || undefined,
      materia_id: materiaId ?? undefined,
      categoria_id: categoriaId ?? undefined,
      grado_id: gradoId ?? undefined,
      nivel_dificultad_id: nivelId ?? undefined,
      anio_publicacion: anio ? parseInt(anio) : undefined,
      paginas_total: paginas ? parseInt(paginas) : undefined,
      es_global: esGlobal,
      estado,
      profesorId,
    })

    setUploadProgress(80)
    if (result.success) {
      setUploadProgress(100)
      setTimeout(() => router.push('/profesor/lecturas'), 500)
    } else {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  const chipStyle = (active: boolean) => ({
    height: '34px', padding: '0 14px',
    border: active ? '2px solid #4F46E5' : '1.5px solid #E5E7EB',
    borderRadius: '99px', background: active ? '#EEF2FF' : 'white',
    fontSize: '13px', fontWeight: active ? 700 : 500,
    color: active ? '#4F46E5' : '#6B7280',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s',
  } as React.CSSProperties)

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '48px',
    border: '1.5px solid #E5E7EB', borderRadius: '12px',
    padding: '0 14px', fontSize: '14px', color: '#111827',
    background: 'white', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>
      <ProfesorTopBar title="Nueva Lectura" showBack />

      <div style={{ padding: '16px 16px 140px', maxWidth: '480px', margin: '0 auto' }}>
        {/* Título */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Título *</p>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título de la lectura" style={inputStyle} />

        {/* Autor */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: '14px', marginBottom: '6px' }}>Autor *</p>
        <input value={autor} onChange={e => setAutor(e.target.value)} placeholder="Nombre del autor" style={inputStyle} />

        {/* Descripción */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: '14px', marginBottom: '6px' }}>Descripción</p>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción o sinopsis..." style={{ ...inputStyle, height: 'auto', minHeight: '100px', padding: '12px 14px', resize: 'vertical' }} />

        {/* Materia */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: '14px', marginBottom: '8px' }}>Materia</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {materias.map(m => (
            <button key={m.id} onClick={() => setMateriaId(materiaId === m.id ? null : m.id)} style={chipStyle(materiaId === m.id)}>
              {m.nombre}
            </button>
          ))}
        </div>

        {/* Categoría */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: '14px', marginBottom: '8px' }}>Categoría</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categorias.map(c => (
            <button key={c.id} onClick={() => setCategoriaId(categoriaId === c.id ? null : c.id)} style={chipStyle(categoriaId === c.id)}>
              {c.nombre}
            </button>
          ))}
        </div>

        {/* Grado */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: '14px', marginBottom: '8px' }}>Grado</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {grados.map(g => (
            <button key={g.id} onClick={() => setGradoId(gradoId === g.id ? null : g.id)} style={chipStyle(gradoId === g.id)}>
              {g.nombre}
            </button>
          ))}
        </div>

        {/* Nivel */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: '14px', marginBottom: '8px' }}>Nivel de dificultad</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {niveles.map(n => (
            <button key={n.id} onClick={() => setNivelId(nivelId === n.id ? null : n.id)} style={chipStyle(nivelId === n.id)}>
              {n.nombre}
            </button>
          ))}
        </div>

        {/* Año + Páginas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Año</p>
            <input value={anio} onChange={e => setAnio(e.target.value)} type="number" placeholder="2020" style={inputStyle} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Páginas</p>
            <input value={paginas} onChange={e => setPaginas(e.target.value)} type="number" placeholder="180" style={inputStyle} />
          </div>
        </div>

        {/* Toggle global */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', background: 'white', borderRadius: '14px', padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Lectura global</p>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Disponible para todos los profesores</p>
          </div>
          <button
            onClick={() => setEsGlobal(!esGlobal)}
            style={{
              width: '44px', height: '24px', border: 'none',
              borderRadius: '99px', cursor: 'pointer',
              background: esGlobal ? '#4F46E5' : '#E5E7EB',
              position: 'relative', transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: '2px',
              left: esGlobal ? '22px' : '2px',
              width: '20px', height: '20px',
              background: 'white', borderRadius: '50%',
              transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* PDF */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: '20px', marginBottom: '8px' }}>PDF del libro</p>
        {pdfFile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F0FDF4', borderRadius: '12px', padding: '14px', border: '1.5px solid #86EFAC' }}>
            <FileText size={20} color="#10B981" />
            <span style={{ flex: 1, fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfFile.name}</span>
            <button onClick={() => setPdfFile(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={16} /></button>
          </div>
        ) : (
          <div
            onClick={() => pdfRef.current?.click()}
            style={{ border: '2px dashed #C7D2FE', borderRadius: '16px', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <Upload size={32} color="#4F46E5" />
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Arrastra el PDF aquí</p>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>o haz click para seleccionar</p>
            <p style={{ fontSize: '11px', color: '#9CA3AF' }}>Máximo 50MB · Solo PDF</p>
          </div>
        )}
        <input ref={pdfRef} type="file" accept="application/pdf" onChange={handlePdfChange} style={{ display: 'none' }} />
        {pdfError && <p style={{ fontSize: '12px', color: '#F43F5E', marginTop: '6px' }}>{pdfError}</p>}

        {/* Portada */}
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginTop: '20px', marginBottom: '8px' }}>Portada (opcional)</p>
        {imgPreview ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={imgPreview} alt="preview" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '10px' }} />
            <button onClick={() => { setImgFile(null); setImgPreview(null) }} style={{ border: 'none', background: '#FFF1F2', borderRadius: '8px', padding: '6px 10px', color: '#F43F5E', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Quitar</button>
          </div>
        ) : (
          <div onClick={() => imgRef.current?.click()} style={{ border: '2px dashed #E5E7EB', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <ImageIcon size={24} color="#9CA3AF" />
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Seleccionar imagen</p>
            <p style={{ fontSize: '11px', color: '#D1D5DB' }}>JPG, PNG, WebP · Max 5MB</p>
          </div>
        )}
        <input ref={imgRef} type="file" accept="image/*" onChange={handleImgChange} style={{ display: 'none' }} />

        {/* Barra de progreso */}
        {isSubmitting && (
          <div style={{ marginTop: '20px', background: '#F3F4F6', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #4F46E5, #6D28D9)', width: `${uploadProgress}%`, transition: 'width 0.4s ease', borderRadius: '99px' }} />
          </div>
        )}
      </div>

      {/* BOTONES FIJOS */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid #F1F5F9',
        padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', gap: '10px' }}>
          <button onClick={() => router.back()} style={{ flex: 1, height: '50px', border: '1.5px solid #E5E7EB', borderRadius: '14px', background: 'white', fontSize: '14px', fontWeight: 700, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button onClick={() => handleSubmit('borrador')} disabled={isSubmitting || !titulo || !autor} style={{ flex: 1, height: '50px', border: '1.5px solid #4F46E5', borderRadius: '14px', background: 'white', fontSize: '14px', fontWeight: 700, color: '#4F46E5', cursor: 'pointer', fontFamily: 'inherit', opacity: (!titulo || !autor) ? 0.4 : 1 }}>
            Borrador
          </button>
          <button onClick={() => handleSubmit('publicado')} disabled={isSubmitting || !titulo || !autor} style={{ flex: 1, height: '50px', border: 'none', borderRadius: '14px', background: 'linear-gradient(135deg, #4F46E5, #6D28D9)', fontSize: '14px', fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: 'inherit', opacity: (!titulo || !autor) ? 0.4 : 1, boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
            Publicar
          </button>
        </div>
      </div>
    </div>
  )
}
