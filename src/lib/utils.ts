import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatFecha(fecha: string | Date): string {
  return format(new Date(fecha), "d MMM yyyy", { locale: es })
}

export function tiempoRelativo(fecha: string | Date): string {
  return formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es })
}

export function calcularPorcentaje(actual: number, total: number): number {
  if (total === 0) return 0
  return Math.round((actual / total) * 100)
}

export function getIniciales(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
}

export function truncar(texto: string, longitud: number): string {
  if (texto.length <= longitud) return texto
  return texto.slice(0, longitud) + '...'
}

export function colorMateria(nombre: string): string {
  const colores: Record<string, string> = {
    'Matemática': 'bg-blue-100 text-blue-700',
    'Literatura': 'bg-purple-100 text-purple-700',
    'Química': 'bg-green-100 text-green-700',
    'Historia': 'bg-orange-100 text-orange-700',
    'Biología': 'bg-teal-100 text-teal-700',
    'Física': 'bg-red-100 text-red-700',
    'Ciencias': 'bg-emerald-100 text-emerald-700',
  }
  return colores[nombre] ?? 'bg-gray-100 text-gray-700'
}

export function formatNota(nota: number): string {
  return nota.toFixed(2)
}

export function notaColor(nota: number): string {
  if (nota >= 16) return 'text-green-600'
  if (nota >= 11) return 'text-blue-600'
  return 'text-red-600'
}
