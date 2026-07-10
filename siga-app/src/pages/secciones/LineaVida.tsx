import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

/* ════════════════════════════════════════════════════════════════════
   LÍNEA DE VIDA · Historia completa de un prospecto
   ────────────────────────────────────────────────────────────────────
   Lee prospecto_historial y la muestra como línea de tiempo vertical.
   Reutilizable: se le pasa el prospectoId y se encarga de todo.
   ════════════════════════════════════════════════════════════════════ */

type Evento = {
  id: number
  etapa_desde: number | null
  etapa_hasta: number | null
  descripcion: string | null
  creado_en: string
  creado_por: string | null
}

type Props = {
  prospectoId: number
}

// Ícono + color según la etapa a la que llegó el evento (mismo criterio del semáforo)
function estiloEtapa(etapaHasta: number | null): { icon: string; color: string } {
  const e = etapaHasta || 1
  if (e === 1) return { icon: '📞', color: '#2563eb' } // Azul · contacto
  if (e === 2) return { icon: '📅', color: '#ea580c' } // Naranja · cita
  if (e === 3) return { icon: '🚶', color: '#ea580c' } // Naranja · visita
  if (e === 4) return { icon: '📝', color: '#eab308' } // Amarillo · apartado
  if (e >= 5) return { icon: '🏆', color: '#16a34a' } // Verde · cliente
  return { icon: '•', color: '#94a3b8' }
}

function fechaLegible(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export default function LineaVida({ prospectoId }: Props) {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    async function cargar() {
      setCargando(true)
      const { data } = await supabase
        .from('prospecto_historial')
        .select('id, etapa_desde, etapa_hasta, descripcion, creado_en, creado_por')
        .eq('prospecto_id', prospectoId)
        .order('creado_en', { ascending: true })
      if (activo) {
        setEventos((data as Evento[]) || [])
        setCargando(false)
      }
    }
    cargar()
    return () => { activo = false }
  }, [prospectoId])

  if (cargando) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '11.5px' }}>Cargando línea de vida...</div>
  }

  if (eventos.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '11.5px', fontStyle: 'italic' }}>
        Aún no hay eventos registrados en la historia de este prospecto.
      </div>
    )
  }

  return (
    <div style={{ padding: '6px 4px' }}>
      {eventos.map((ev, i) => {
        const est = estiloEtapa(ev.etapa_hasta)
        const esUltimo = i === eventos.length - 1
        return (
          <div key={ev.id} style={{ display: 'flex', gap: '12px' }}>
            {/* Columna del ícono + línea vertical */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#fff', border: `2px solid ${est.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, zIndex: 1 }}>
                {est.icon}
              </div>
              {!esUltimo && <div style={{ width: '2px', flex: 1, minHeight: '16px', background: '#e2e8f0' }} />}
            </div>

            {/* Contenido del evento */}
            <div style={{ paddingBottom: esUltimo ? 0 : '16px', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>
                {fechaLegible(ev.creado_en)}
              </div>
              <div style={{ fontSize: '11.5px', color: '#334155', lineHeight: 1.45, background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: `3px solid ${est.color}`, borderRadius: '6px', padding: '7px 10px' }}>
                {ev.descripcion || 'Sin descripción'}
                {ev.creado_por && (
                  <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>
                    Por: {ev.creado_por}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}