import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

type AuthState = {
  session: Session | null
  tieneAcceso: boolean
  cargando: boolean
  entrarConGoogle: () => Promise<void>
  salir: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [tieneAcceso, setTieneAcceso] = useState(false)
  const [cargando, setCargando] = useState(true)

  // Revisa si el correo está en la tabla usuarios y activo = true
  async function verificarAcceso(email: string | undefined) {
    if (!email) return false
    const { data, error } = await supabase
      .from('usuarios')
      .select('email, activo')
      .eq('email', email)
      .eq('activo', true)
      .maybeSingle()
    if (error) {
      console.error('Error verificando acceso:', error)
      return false
    }
    return !!data
  }

  useEffect(() => {
    // Al cargar, revisa si ya hay sesión
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session) {
        const ok = await verificarAcceso(data.session.user.email)
        setTieneAcceso(ok)
        if (!ok) await supabase.auth.signOut()
      }
      setCargando(false)
    })

    // Escucha cambios (cuando entra o sale)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_evento, nuevaSesion) => {
      setSession(nuevaSesion)
      if (nuevaSesion) {
        const ok = await verificarAcceso(nuevaSesion.user.email)
        setTieneAcceso(ok)
        if (!ok) await supabase.auth.signOut()
      } else {
        setTieneAcceso(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function entrarConGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  async function salir() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, tieneAcceso, cargando, entrarConGoogle, salir }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}