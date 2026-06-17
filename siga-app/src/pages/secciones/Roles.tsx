import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Rol = {
  id: number
  codigo: string | null
  nombre: string | null
  area: string | null
}

export default function Roles() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargar() {
      const { data, error: err } = await supabase
        .from('roles')
        .select('id, codigo, nombre, area')
        .order('codigo', { ascending: true })
      if (err) { setError(err.message); setCargando(false); return }
      setRoles(data || [])
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando roles...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  // Agrupar roles por área
  const porArea: Record<string, Rol[]> = {}
  roles.forEach((r) => {
    const area = r.area || 'Sin área'
    if (!porArea[area]) porArea[area] = []
    porArea[area].push(r)
  })

  return (
    <div>
      <div style={{ fontSize: '12px', color: '#5d6b80', marginBottom: '16px' }}>
        {roles.length} roles definidos en el sistema, agrupados por área.
      </div>

      {roles.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>🛡️</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e' }}>Sin roles definidos</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(porArea).map(([area, rolesArea]) => (
            <div key={area}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0C447C', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{area}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {rolesArea.map((r) => (
                  <div key={r.id} className="flex items-center" style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '12px 14px', gap: '12px' }}>
                    <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '9px', background: '#E6F1FB', color: '#0C447C', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', flexShrink: 0 }}>
                      {r.codigo || '—'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#042C53' }}>{r.nombre || r.codigo}</div>
                      <div style={{ fontSize: '10.5px', color: '#5d6b80' }}>{r.codigo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}