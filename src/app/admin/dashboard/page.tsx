'use client'

import { logoutAction } from '@/app/(auth)/login/actions'
import { LogOut } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#0F172A]">Panel del Administrador</h1>
        <p className="text-sm text-[#475569] mt-2">Esta pantalla se construirá próximamente.</p>
        <form action={logoutAction} className="mt-6">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-[12px] text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
