import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Stats = {
  totalProspectos: number
  prospectos: number
  clientes: number
  enCatalogo: number
  valorCatalogo: number
  porProceso: Record<string, number>
}

const PROCESOS: Record<string, string> = {
  svta: 'SVTA', 'pv-lv': 'Promesa CV — Le Ville', 'pv-esp': 'Promesa CV — España',
  pv: 'Promesa de Compraventa', renta: 'Renta', comodato: 'Comodato', otro: 'Otro',
}

export default function ReportesComerciales() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        const [prospectos, garantias] = await Promise.all([
          supabase.from('prospectos').select('id, estatus, tipo_proceso'),
          supabase.from('garantias').select('id, precio_piso, publicado_catalogo').eq('eliminada', false),
        ])

        const pData = prospectos.data || []
        const gData = garantias.data || []
        const publicadas = gData.filter((g) => g.publicado_catalogo)

        const porProceso: Record<string, number> = {}
        pData.forEach((p) => {
          if (p.tipo_proceso) {
            porProceso[p.tipo_proceso] = (porProceso[p.tipo_proceso] || 0) + 1
          }
        })

        setStats({
          totalProspectos: pData.length,
          prospectos: pData.filter((p) => p.estatus === 'prospecto').length,
          clientes: pData.filter((p) => p.estatus === 'cliente').length,
          enCatalogo: publicadas.length,
          valorCatalogo: publicadas.reduce((sum, g) => sum + (Number(g.precio_piso) || 0), 0),
          porProceso,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar')
      }
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando reportes...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>
  if (!stats) return null

  // Tasa de conversión prospecto → cliente
  const tasaConversion = stats.totalProspectos > 0
    ? Math.round((stats.clientes / stats.totalProspectos) * 100)
    : 0

  const fmt = (n: number) => '$' + n.toLocaleString('es-MX')
  const procesos = Object.entries(stats.porProceso).sort((a, b) => b[1] - a[1])

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total registros', valor: stats.totalProspectos, ico: '👥', bg: '#E6F1FB', color: '#0C447C' },
          { label: 'Prospectos', valor: stats.prospectos, ico: '👁️', bg: '#FEF9C3', color: '#854D0E' },
          { label: 'Clientes', valor: stats.clientes, ico: '✅', bg: '#E1F5EE', color: '#0F6E56' },
          { label: 'En catálogo', valor: stats.enCatalogo, ico: '🏘️', bg: '#E6F1FB', color: '#185FA5' },
        ].map((k) => (
          <div key={k.label} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '12px', padding: '18px' }}>
            <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '9px', background: k.bg, color: k.color, fontSize: '20px', marginBottom: '10px' }}>{k.ico}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'monospace', color: '#042C53', lineHeight: 1 }}>{k.valor}</div>
            <div style={{ fontSize: '10.5px', color: '#5d6b80', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '6px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tasa de conversión + valor catálogo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5d6b80', marginBottom: '10px' }}>📈 Tasa de conversión</div>
          <div className="flex items-end" style={{ gap: '8px' }}>
            <div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'monospace', color: '#0F6E56', lineHeight: 1 }}>{tasaConversion}%</div>
            <div style={{ fontSize: '12px', color: '#5d6b80', marginBottom: '4px' }}>prospecto → cliente</div>
          </div>
          {/* Barra de progreso */}
          <div style={{ background: '#eef1f5', borderRadius: '20px', height: '10px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(90deg, #1D9E75, #0F6E56)', height: '100%', width: `${tasaConversion}%`, borderRadius: '20px' }} />
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #185FA5, #0C447C)', color: 'white', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#B5D4F4', marginBottom: '10px' }}>💰 Valor en catálogo (precio piso)</div>
          <div style={{ fontSize: '30px', fontWeight: 700, fontFamily: 'monospace' }}>{fmt(stats.valorCatalogo)}</div>
          <div style={{ fontSize: '11px', color: '#B5D4F4', marginTop: '6px' }}>{stats.enCatalogo} propiedad(es) publicada(s)</div>
        </div>
      </div>

      {/* Distribución por tipo de proceso */}
      <div style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#042C53', marginBottom: '14px' }}>📋 Prospectos por tipo de proceso</div>
        {procesos.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#5d6b80', textAlign: 'center', padding: '1rem' }}>Aún no hay prospectos con tipo de proceso asignado.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {procesos.map(([proc, cantidad]) => {
              const pct = stats.totalProspectos > 0 ? Math.round((cantidad / stats.totalProspectos) * 100) : 0
              return (
                <div key={proc}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#042C53', fontWeight: 500 }}>{PROCESOS[proc] || proc}</span>
                    <span style={{ fontSize: '11px', color: '#5d6b80', fontFamily: 'monospace' }}>{cantidad} ({pct}%)</span>
                  </div>
                  <div style={{ background: '#eef1f5', borderRadius: '20px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg, #185FA5, #0C447C)', height: '100%', width: `${pct}%`, borderRadius: '20px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}