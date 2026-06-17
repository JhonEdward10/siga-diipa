import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Stats = {
  administradoras: number
  carteras: number
  garantias: number
  garantiasPublicadas: number
  negociaciones: number
  prospectos: number
  clientes: number
  valorNegociado: number
  valorGarantias: number
}

export default function DashboardGlobal() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        // Cargamos todo en paralelo
        const [admins, carteras, garantias, negos, prospectos] = await Promise.all([
          supabase.from('administradoras').select('id'),
          supabase.from('carteras').select('id').eq('archivada', false).eq('eliminada', false),
          supabase.from('garantias').select('id, valor_estimado, publicado_catalogo').eq('eliminada', false),
          supabase.from('admin_negociaciones').select('id, valor').eq('archivada', false),
          supabase.from('prospectos').select('id, estatus'),
        ])

        const garantiasData = garantias.data || []
        const negosData = negos.data || []
        const prospectosData = prospectos.data || []

        setStats({
          administradoras: (admins.data || []).length,
          carteras: (carteras.data || []).length,
          garantias: garantiasData.length,
          garantiasPublicadas: garantiasData.filter((g) => g.publicado_catalogo).length,
          negociaciones: negosData.length,
          prospectos: prospectosData.filter((p) => p.estatus === 'prospecto').length,
          clientes: prospectosData.filter((p) => p.estatus === 'cliente').length,
          valorNegociado: negosData.reduce((sum, n) => sum + (Number(n.valor) || 0), 0),
          valorGarantias: garantiasData.reduce((sum, g) => sum + (Number(g.valor_estimado) || 0), 0),
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar')
      }
      setCargando(false)
    }
    cargar()
  }, [])

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando indicadores...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>
  if (!stats) return null

  const fmt = (n: number) => '$' + n.toLocaleString('es-MX')

  // KPIs grandes
  const kpisPrincipales = [
    { label: 'Administradoras', valor: stats.administradoras, ico: '🏦', color: '#0C447C', bg: '#E6F1FB' },
    { label: 'Carteras activas', valor: stats.carteras, ico: '📂', color: '#0F6E56', bg: '#E1F5EE' },
    { label: 'Garantías', valor: stats.garantias, ico: '🏷️', color: '#185FA5', bg: '#E6F1FB' },
    { label: 'Negociaciones', valor: stats.negociaciones, ico: '🤝', color: '#854D0E', bg: '#FEF9C3' },
  ]

  return (
    <div>
      {/* KPIs principales grandes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {kpisPrincipales.map((k) => (
          <div key={k.label} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(4,44,83,.06)' }}>
            <div className="flex items-center justify-center" style={{ width: '44px', height: '44px', borderRadius: '10px', background: k.bg, color: k.color, fontSize: '22px', marginBottom: '12px' }}>{k.ico}</div>
            <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'monospace', color: '#042C53', lineHeight: 1 }}>{k.valor}</div>
            <div style={{ fontSize: '11px', color: '#5d6b80', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '6px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Valores en dinero */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0C447C, #042C53)', color: 'white', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#B5D4F4', marginBottom: '8px' }}>💰 Valor total en garantías</div>
          <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'monospace' }}>{fmt(stats.valorGarantias)}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #0F6E56, #04342C)', color: 'white', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5DCAA5', marginBottom: '8px' }}>🤝 Valor en negociaciones</div>
          <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'monospace' }}>{fmt(stats.valorNegociado)}</div>
        </div>
      </div>

      {/* Secundarios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[
          { label: 'Publicadas en catálogo', valor: stats.garantiasPublicadas, ico: '🏘️' },
          { label: 'Prospectos', valor: stats.prospectos, ico: '👁️' },
          { label: 'Clientes activos', valor: stats.clientes, ico: '✅' },
        ].map((k) => (
          <div key={k.label} className="flex items-center" style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '16px', gap: '12px' }}>
            <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '9px', background: '#eef1f5', fontSize: '20px' }}>{k.ico}</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'monospace', color: '#042C53', lineHeight: 1 }}>{k.valor}</div>
              <div style={{ fontSize: '10.5px', color: '#5d6b80', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '4px' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}