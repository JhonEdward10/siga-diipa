import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Usuario = {
  id: number
  email: string
  nombre: string | null
  activo: boolean | null
  plaza: string | null
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data, error: err } = await supabase
        .from('usuarios')
        .select('id, email, nombre, activo, plaza')
        .order('email', { ascending: true })
      if (err) { setError(err.message); setCargando(false); return }
      setUsuarios(data || [])
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando usuarios...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  const activos = usuarios.filter((u) => u.activo).length
  const filtrados = usuarios.filter((u) =>
    !filtro ||
    u.email.toLowerCase().includes(filtro.toLowerCase()) ||
    (u.nombre || '').toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { num: usuarios.length, label: 'Total usuarios', bg: '#E6F1FB', color: '#0C447C', ico: '👤' },
          { num: activos, label: 'Activos', bg: '#E1F5EE', color: '#0F6E56', ico: '✓' },
        ].map((k) => (
          <div key={k.label} className="flex items-center" style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '14px 16px', gap: '12px' }}>
            <div className="flex items-center justify-center" style={{ width: '38px', height: '38px', borderRadius: '8px', background: k.bg, color: k.color, fontSize: '18px' }}>{k.ico}</div>
            <div>
              <div style={{ fontSize: '21px', fontWeight: 600, fontFamily: 'monospace', lineHeight: 1.1 }}>{k.num}</div>
              <div style={{ fontSize: '10.5px', color: '#5d6b80', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '14px' }}>
        <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="🔍 Buscar usuario por nombre o correo..."
               style={{ width: '100%', padding: '9px 14px', border: '1px solid #c8d0db', borderRadius: '8px', fontSize: '12.5px', background: '#fff', fontFamily: 'Sora, sans-serif' }} />
      </div>

      {filtrados.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>👤</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e' }}>{filtro ? 'Sin resultados' : 'Sin usuarios'}</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtrados.map((u) => (
            <div key={u.id} className="flex items-center" style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '12px 14px', gap: '12px' }}>
              <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E6F1FB', color: '#0C447C', fontSize: '16px', flexShrink: 0 }}>
                {(u.nombre || u.email).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#042C53' }}>{u.nombre || u.email.split('@')[0]}</div>
                <div style={{ fontSize: '11px', color: '#5d6b80' }}>{u.email}{u.plaza ? ` · ${u.plaza}` : ''}</div>
              </div>
              <span style={{
                fontSize: '9.5px', fontWeight: 600, padding: '3px 9px', borderRadius: '5px', textTransform: 'uppercase',
                background: u.activo ? '#E1F5EE' : '#F1F5F9',
                color: u.activo ? '#04342C' : '#64748B',
              }}>{u.activo ? 'Activo' : 'Inactivo'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}