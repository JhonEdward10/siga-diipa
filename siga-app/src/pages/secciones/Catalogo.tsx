import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ModalInteres from './ModalInteres'

type GarantiaCatalogo = {
  id: number
  folio: string
  tipo_caso: string | null
  direccion: string | null
  estado_mx: string | null
  municipio: string | null
  valor_estimado: number | null
  precio_piso: number | null
  m2_terreno: number | null
  m2_construccion: number | null
  publicado_catalogo: boolean | null
  imagen_url: string | null
  estatus: string | null
}

// Badge de estado para el catálogo según garantias.estatus
function badgeEstatus(estatus: string | null) {
  switch (estatus) {
    case 'publicada':   return { label: '🟢 Disponible', bg: '#16A34A' }
    case 'en_apartado': return { label: '🔒 Apartada',   bg: '#D97706' }
    case 'vendida':     return { label: '✅ Vendida',     bg: '#475569' }
    default:            return null
  }
}

export default function Catalogo() {
  const [garantias, setGarantias] = useState<GarantiaCatalogo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')

  // Lightbox: imagen abierta en grande (null = cerrado)
  const [zoom, setZoom] = useState<{ url: string; folio: string; direccion: string } | null>(null)

  // Modal de interés (null = cerrado)
  const [interes, setInteres] = useState<{ id: number; folio: string; direccion: string } | null>(null)

  async function cargar() {
    const { data, error: err } = await supabase
      .from('garantias')
      .select('id, folio, tipo_caso, direccion, estado_mx, municipio, valor_estimado, precio_piso, m2_terreno, m2_construccion, publicado_catalogo, imagen_url, estatus')
      .eq('publicado_catalogo', true)
      .eq('eliminada', false)
      .order('folio', { ascending: true })
    if (err) { setError(err.message); setCargando(false); return }
    setGarantias(data || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  // Cerrar lightbox con tecla Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setZoom(null)
    }
    if (zoom) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom])

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando catálogo...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  const filtrados = garantias.filter((g) =>
    !filtro ||
    (g.direccion || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (g.folio || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (g.municipio || '').toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div>
      {/* CSS del efecto zoom al pasar el cursor */}
      <style>{`
        .cat-foto-wrap { overflow: hidden; }
        .cat-foto { transition: transform .35s ease; }
        .cat-foto-wrap:hover .cat-foto { transform: scale(1.12); }
        .cat-foto-clickable { cursor: zoom-in; }
      `}</style>

      <div className="flex items-center" style={{ gap: '12px', marginBottom: '14px' }}>
        <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="🔍 Buscar por dirección, folio o municipio..."
               style={{ flex: 1, padding: '9px 14px', border: '1px solid #c8d0db', borderRadius: '8px', fontSize: '12.5px', background: '#fff', fontFamily: 'Sora, sans-serif' }} />
        <span style={{ fontSize: '12px', color: '#5d6b80', whiteSpace: 'nowrap' }}>{filtrados.length} propiedad(es)</span>
      </div>

      {filtrados.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>🏘️</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>{filtro ? 'Sin resultados' : 'Catálogo vacío'}</h3>
          <p style={{ fontSize: '12px' }}>{filtro ? 'Prueba con otra búsqueda.' : 'Las garantías publicadas para venta aparecerán aquí.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {filtrados.map((g) => {
            const badge = badgeEstatus(g.estatus)
            return (
            <div key={g.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Foto con zoom al pasar el cursor + clic para ampliar */}
              <div className="cat-foto-wrap" style={{ position: 'relative', height: '160px', background: 'linear-gradient(135deg, #E6F1FB, #DAEEFF)' }}>
                {badge && (
                  <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2, background: badge.bg, color: '#fff', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', boxShadow: '0 2px 6px rgba(0,0,0,.28)', pointerEvents: 'none' }}>
                    {badge.label}
                  </div>
                )}
                {g.imagen_url ? (
                  <img
                    src={g.imagen_url}
                    alt={g.direccion || g.folio}
                    className="cat-foto cat-foto-clickable"
                    onClick={() => setZoom({ url: g.imagen_url!, folio: g.folio, direccion: g.direccion || '' })}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div className="flex items-center justify-center" style={{ width: '100%', height: '100%', fontSize: '48px' }}>🏠</div>
                )}
              </div>
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex items-start justify-between" style={{ gap: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace' }}>{g.folio}</div>
                  {g.tipo_caso && <span style={{ fontSize: '9.5px', background: '#E6F1FB', color: '#0C447C', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>{g.tipo_caso}</span>}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#042C53', lineHeight: 1.3 }}>{g.direccion || 'Sin dirección'}</div>
                {(g.municipio || g.estado_mx) && <div style={{ fontSize: '11px', color: '#5d6b80' }}>📍 {[g.municipio, g.estado_mx].filter(Boolean).join(', ')}</div>}

                {g.precio_piso != null && (
                  <div style={{ background: '#E1F5EE', borderRadius: '7px', padding: '8px 10px', marginTop: '4px' }}>
                    <div style={{ fontSize: '9.5px', color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Precio</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#04342C', fontFamily: 'monospace' }}>${g.precio_piso.toLocaleString('es-MX')}</div>
                  </div>
                )}

                {(g.m2_terreno || g.m2_construccion) && (
                  <div className="flex" style={{ gap: '8px', fontSize: '11px', color: '#4a5a6e' }}>
                    {g.m2_terreno != null && <span>📐 {g.m2_terreno} m² terreno</span>}
                    {g.m2_construccion != null && <span>🏠 {g.m2_construccion} m² const.</span>}
                  </div>
                )}

                {/* Acciones — botón Interés (paso 2a) */}
                <div className="flex" style={{ gap: '6px', marginTop: '6px', paddingTop: '10px', borderTop: '0.5px solid #eef1f5' }}>
                  <button
                    onClick={() => setInteres({ id: g.id, folio: g.folio, direccion: g.direccion || '' })}
                    style={{ flex: 1, background: '#0C447C', color: 'white', border: 'none', padding: '8px', borderRadius: '7px', fontSize: '11.5px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                    💬 Interés
                  </button>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* LIGHTBOX · imagen en grande */}
      {zoom && (
        <div
          onClick={() => setZoom(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(4,20,40,.88)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', cursor: 'zoom-out' }}
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setZoom(null)}
            style={{ position: 'absolute', top: '20px', right: '24px', width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '20px', cursor: 'pointer' }}
          >✕</button>

          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <img src={zoom.url} alt={zoom.direccion} style={{ maxWidth: '90vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: '10px', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }} />
            <div style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', opacity: .8 }}>{zoom.folio}</div>
              {zoom.direccion && <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{zoom.direccion}</div>}
            </div>
          </div>
        </div>
      )}

      {/* MODAL INTERÉS · vincular prospecto existente a la garantía */}
      {interes && (
        <ModalInteres
          garantia={interes}
          onCerrar={() => setInteres(null)}
          onVinculado={cargar}
        />
      )}
    </div>
  )
}