import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

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
}

export default function Catalogo() {
  const [garantias, setGarantias] = useState<GarantiaCatalogo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')

  async function cargar() {
    // Solo garantías publicadas en el catálogo
    const { data, error: err } = await supabase
      .from('garantias')
      .select('id, folio, tipo_caso, direccion, estado_mx, municipio, valor_estimado, precio_piso, m2_terreno, m2_construccion, publicado_catalogo')
      .eq('publicado_catalogo', true)
      .eq('eliminada', false)
      .order('folio', { ascending: true })
    if (err) { setError(err.message); setCargando(false); return }
    setGarantias(data || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

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
          {filtrados.map((g) => (
            <div key={g.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Cabecera tipo "foto" */}
              <div className="flex items-center justify-center" style={{ height: '120px', background: 'linear-gradient(135deg, #E6F1FB, #DAEEFF)', fontSize: '48px' }}>🏠</div>
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex items-start justify-between" style={{ gap: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace' }}>{g.folio}</div>
                  {g.tipo_caso && <span style={{ fontSize: '9.5px', background: '#E6F1FB', color: '#0C447C', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>{g.tipo_caso}</span>}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#042C53', lineHeight: 1.3 }}>{g.direccion || 'Sin dirección'}</div>
                {(g.municipio || g.estado_mx) && <div style={{ fontSize: '11px', color: '#5d6b80' }}>📍 {[g.municipio, g.estado_mx].filter(Boolean).join(', ')}</div>}

                {/* Precio destacado */}
                {g.precio_piso != null && (
                  <div style={{ background: '#E1F5EE', borderRadius: '7px', padding: '8px 10px', marginTop: '4px' }}>
                    <div style={{ fontSize: '9.5px', color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Precio</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#04342C', fontFamily: 'monospace' }}>${g.precio_piso.toLocaleString('es-MX')}</div>
                  </div>
                )}

                {/* Metros */}
                {(g.m2_terreno || g.m2_construccion) && (
                  <div className="flex" style={{ gap: '8px', fontSize: '11px', color: '#4a5a6e' }}>
                    {g.m2_terreno != null && <span>📐 {g.m2_terreno} m² terreno</span>}
                    {g.m2_construccion != null && <span>🏠 {g.m2_construccion} m² const.</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}