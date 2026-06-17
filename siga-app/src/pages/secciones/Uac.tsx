import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Cliente = {
  id: number
  folio: string | null
  nombre: string
  correo: string | null
  telefono: string | null
  ciudad: string | null
  estado: string | null
  tipo_proceso: string | null
  fecha_inicio_proceso: string | null
}

const PROCESOS: Record<string, string> = {
  svta: 'SVTA', 'pv-lv': 'Promesa CV — Le Ville', 'pv-esp': 'Promesa CV — España',
  pv: 'Promesa de Compraventa', renta: 'Renta', comodato: 'Comodato', otro: 'Otro',
}

export default function Uac() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data, error: err } = await supabase
        .from('prospectos')
        .select('id, folio, nombre, correo, telefono, ciudad, estado, tipo_proceso, fecha_inicio_proceso')
        .eq('estatus', 'cliente')
        .order('id', { ascending: false })
      if (err) { setError(err.message); setCargando(false); return }
      setClientes(data || [])
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando clientes...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  const filtrados = clientes.filter((c) =>
    !filtro ||
    c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (c.folio || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (c.correo || '').toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div>
      {/* KPI */}
      <div className="flex items-center" style={{ background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', color: 'white', borderRadius: '12px', padding: '18px 20px', marginBottom: '16px', gap: '14px' }}>
        <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '11px', background: 'rgba(255,255,255,0.2)', fontSize: '24px' }}>🏆</div>
        <div>
          <div style={{ fontSize: '30px', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>{clientes.length}</div>
          <div style={{ fontSize: '11px', color: '#E1F5EE', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>Clientes activos DIIPA</div>
        </div>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: '14px' }}>
        <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="🔍 Buscar cliente por nombre, folio o correo..."
               style={{ width: '100%', padding: '9px 14px', border: '1px solid #c8d0db', borderRadius: '8px', fontSize: '12.5px', background: '#fff', fontFamily: 'Sora, sans-serif' }} />
      </div>

      {filtrados.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>🎧</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>{filtro ? 'Sin resultados' : 'Sin clientes activos'}</h3>
          <p style={{ fontSize: '12px' }}>{filtro ? 'Prueba otra búsqueda.' : 'Los prospectos que inicien proceso aparecerán aquí como clientes.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
          {filtrados.map((c) => (
            <div key={c.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="flex items-start" style={{ gap: '10px' }}>
                <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E1F5EE', color: '#0F6E56', fontSize: '18px', flexShrink: 0 }}>👤</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace' }}>{c.folio}</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#042C53' }}>{c.nombre}</div>
                </div>
                <span style={{ fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: '#E1F5EE', color: '#04342C', textTransform: 'uppercase' }}>Cliente</span>
              </div>
              <div style={{ background: '#eef1f5', borderRadius: '6px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#4a5a6e' }}>
                {c.telefono && <div>📞 {c.telefono}</div>}
                {c.correo && <div>✉️ {c.correo}</div>}
                {(c.ciudad || c.estado) && <div>📍 {[c.ciudad, c.estado].filter(Boolean).join(', ')}</div>}
                {c.tipo_proceso && <div>📋 {PROCESOS[c.tipo_proceso] || c.tipo_proceso}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}