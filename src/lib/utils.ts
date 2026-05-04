// Colección completa de funciones utilitarias

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── FECHAS ──────────────────────────────────────────────
export function formatFecha(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha
  return d.toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

export function formatFechaCorta(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export function formatTiempoRelativo(fecha: string): string {
  const diff = (Date.now() - new Date(fecha).getTime()) / 1000
  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  if (diff < 172800) return 'Ayer'
  return formatFechaCorta(fecha)
}

export function diasRestantes(fechaLimite: string | null): number {
  if (!fechaLimite) return 999
  const diff = new Date(fechaLimite).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function fechaLimiteLabel(fechaLimite: string | null): string {
  if (!fechaLimite) return 'Sin fecha límite'
  const dias = diasRestantes(fechaLimite)
  if (dias === 0) return '¡Vence hoy!'
  if (dias === 1) return 'Vence mañana'
  if (dias <= 7) return `Vence en ${dias} días`
  return `Límite: ${formatFechaCorta(fechaLimite)}`
}

// ── NOTAS ────────────────────────────────────────────────
export function notaColor(nota: number): string {
  if (nota >= 18) return '#10B981'
  if (nota >= 14) return '#4F46E5'
  if (nota >= 11) return '#0EA5E9'
  if (nota > 0)   return '#F43F5E'
  return '#9CA3AF'
}

export function notaGradiente(nota: number | null): string {
  if (!nota || nota === 0) return 'linear-gradient(135deg, #9CA3AF, #6B7280)'
  if (nota >= 18) return 'linear-gradient(135deg, #10B981, #059669)'
  if (nota >= 14) return 'linear-gradient(135deg, #4F46E5, #6D28D9)'
  if (nota >= 11) return 'linear-gradient(135deg, #0EA5E9, #0284C7)'
  return 'linear-gradient(135deg, #F43F5E, #E11D48)'
}

// ── ARCHIVOS ─────────────────────────────────────────────
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── PORTADAS ─────────────────────────────────────────────
const GRADIENTES_PORTADA = [
  'linear-gradient(135deg, #4F46E5, #6D28D9)',
  'linear-gradient(135deg, #0EA5E9, #0284C7)',
  'linear-gradient(135deg, #10B981, #059669)',
  'linear-gradient(135deg, #F59E0B, #D97706)',
  'linear-gradient(135deg, #EC4899, #DB2777)',
  'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'linear-gradient(135deg, #EF4444, #DC2626)',
  'linear-gradient(135deg, #14B8A6, #0D9488)',
]

export function obtenerGradientePortada(lecturaId: string): string {
  // Usar los primeros caracteres del UUID para elegir gradiente
  const num = parseInt(lecturaId.replace(/-/g, '').slice(0, 8), 16)
  return GRADIENTES_PORTADA[num % GRADIENTES_PORTADA.length]
}

// ── TEXTO ────────────────────────────────────────────────
export function truncarTexto(texto: string, maxLength: number): string {
  if (texto.length <= maxLength) return texto
  return texto.slice(0, maxLength).trimEnd() + '…'
}

export function iniciales(nombre: string, apellido: string): string {
  return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase()
}

export const getIniciales = iniciales
export const tiempoRelativo = formatTiempoRelativo
export const truncar = truncarTexto

export function formatNota(nota: number | null): string {
  if (nota === null) return '-'
  return nota.toFixed(1)
}
