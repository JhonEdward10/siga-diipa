import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Prospecto = {
  id: number
  folio: string | null
  nombre: string
  estatus: string | null
  telefono: string | null
  creado_en: string | null
}

type Evento = {
  id: number
  tipo: string | null
  titulo: string
  fecha: string
  hora: string | null
}

const TIPOS_EVENTO: Record<string, string> = {
  reunion: '🤝', llamada: '☎️', vencimiento: '⏰', tarea: '✓', otro: '📌',
}

export default function SeguimientoGeneral() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        const hoy = new Date().toISOString().slice(0, 10)
        const [pros, evs] = await Promise.all([
          // Últimos 8 prospectos registrados
          supabase.from('prospectos')
            .select('id, folio, nombre, estatus, telefono, creado_en')
            .order('id', { ascending: false })
            .limit(8),
          // Próximos eventos (de hoy en adelante)
          supabase.from('eventos_calendario')
            .select('id, tipo, titulo, fecha, hora')
            .gte('fecha', hoy)
            .order('fecha', { ascending: true })
            .order('hora', { ascending: true })
            .limit(8),
        ])
        if (pros.error) throw pros.error
        setProspectos(pros.data || [])
        setEventos(evs.data || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar')
      }
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando seguimiento...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

      {/* Columna: últimos prospectos */}
      <div style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '12px', padding: '18px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#042C53', marginBottom: '14px' }}>👥 Últimos prospectos registrados</div>
        {prospectos.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#5d6b80', textAlign: 'center', padding: '1.5rem' }}>Aún no hay prospectos registrados.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {prospectos.map((p) => (
              <div key={p.id} className="flex items-center justify-between" style={{ background: '#eef1f5', borderRadius: '8px', padding: '10px 12px', gap: '8px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#042C53', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                  <div style={{ fontSize: '10.5px', color: '#5d6b80', fontFamily: 'monospace' }}>{p.folio}{p.telefono ? ` · ${p.telefono}` : ''}</div>
                </div>
                <span style={{
                  fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', whiteSpace: 'nowrap',
                  background: p.estatus === 'cliente' ? '#E1F5EE' : '#FEF9C3',
                  color: p.estatus === 'cliente' ? '#04342C' : '#854D0E',
                }}>{p.estatus === 'cliente' ? 'Cliente' : 'Prospecto'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Columna: próximos eventos */}
      <div style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '12px', padding: '18px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#042C53', marginBottom: '14px' }}>📅 Próximos eventos en agenda</div>
        {eventos.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#5d6b80', textAlign: 'center', padding: '1.5rem' }}>No hay eventos próximos. Agéndalos desde el módulo de Agenda.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {eventos.map((e) => (
              <div key={e.id} className="flex items-center" style={{ background: '#eef1f5', borderRadius: '8px', padding: '10px 12px', gap: '10px' }}>
                <div className="flex items-center justify-center" style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fff', fontSize: '16px', flexShrink: 0 }}>{TIPOS_EVENTO[e.tipo || ''] || '📌'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#042C53', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.titulo}</div>
                  <div style={{ fontSize: '10.5px', color: '#5d6b80', fontFamily: 'monospace' }}>
                    {new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}{e.hora ? ` · ${e.hora.slice(0, 5)}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}