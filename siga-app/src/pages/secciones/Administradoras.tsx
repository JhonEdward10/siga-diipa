import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Administradora = {
  id: number
  folio: string
  nombre: string
  estatus: string | null
  contacto_nombre: string | null
  contacto_telefono: string | null
  contacto_email: string | null
}

export default function Administradoras() {
  const [admins, setAdmins] = useState<Administradora[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from('administradoras')
        .select('id, folio, nombre, estatus, contacto_nombre, contacto_telefono, contacto_email')
        .order('folio', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setAdmins(data || [])
      }
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando administradoras...</div>
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>
  }

  const total = admins.length
  const activas = admins.filter((a) => a.estatus === 'activa').length
  const inactivas = admins.filter((a) => a.estatus === 'inactiva').length

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { num: total, label: 'Total', bg: '#E6F1FB', color: '#0C447C', ico: '🏦' },
          { num: activas, label: 'Activas', bg: '#E1F5EE', color: '#0F6E56', ico: '✓' },
          { num: inactivas, label: 'Inactivas', bg: '#F1F5F9', color: '#64748B', ico: '⏸' },
          { num: total, label: 'Registradas', bg: '#FEF9C3', color: '#854D0E', ico: '📋' },
        ].map((k) => (
          <div key={k.label} className="flex items-center"
               style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '14px 16px', gap: '12px' }}>
            <div className="flex items-center justify-center"
                 style={{ width: '38px', height: '38px', borderRadius: '8px', background: k.bg, color: k.color, fontSize: '18px' }}>{k.ico}</div>
            <div>
              <div style={{ fontSize: '21px', fontWeight: 600, fontFamily: 'monospace', lineHeight: 1.1 }}>{k.num}</div>
              <div style={{ fontSize: '10.5px', color: '#5d6b80', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* TARJETAS DE ADMINISTRADORAS */}
      {admins.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>🏦</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>Sin administradoras</h3>
          <p style={{ fontSize: '12px' }}>Aún no hay administradoras registradas.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '14px' }}>
          {admins.map((a) => (
            <div key={a.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="flex items-start" style={{ gap: '10px' }}>
                <div className="flex items-center justify-center"
                     style={{ width: '38px', height: '38px', borderRadius: '9px', background: '#E6F1FB', color: '#0C447C', fontSize: '17px', flexShrink: 0 }}>🏦</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{a.folio}</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#042C53', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.nombre}</div>
                </div>
                <span style={{
                  fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase',
                  background: a.estatus === 'activa' ? '#E1F5EE' : '#F1F5F9',
                  color: a.estatus === 'activa' ? '#04342C' : '#64748B',
                }}>{a.estatus || 'N/D'}</span>
              </div>
              <div style={{ background: '#eef1f5', borderRadius: '7px', padding: '9px 11px', fontSize: '11px', color: '#4a5a6e', display: 'flex', flexDirection: 'column', gap: '3px', minHeight: '44px' }}>
                {a.contacto_nombre ? (
                  <>
                    <div>👤 {a.contacto_nombre}</div>
                    {a.contacto_telefono && <div>📞 {a.contacto_telefono}</div>}
                    {a.contacto_email && <div>✉️ {a.contacto_email}</div>}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#92400e' }}>Sin contacto registrado</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}