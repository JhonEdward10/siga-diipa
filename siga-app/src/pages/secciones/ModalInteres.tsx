import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type ProspectoLite = {
  id: number
  folio: string | null
  nombre: string
  correo: string | null
  telefono: string | null
  etapa: number | null
  estatus: string | null
}

type Props = {
  garantia: { id: number; folio: string; direccion: string }
  onCerrar: () => void
  onVinculado?: () => void
}

export default function ModalInteres({ garantia, onCerrar, onVinculado }: Props) {
  const [prospectos, setProspectos] = useState<ProspectoLite[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')
  const [seleccionado, setSeleccionado] = useState<ProspectoLite | null>(null)
  const [vinculando, setVinculando] = useState(false)
  const [yaVinculados, setYaVinculados] = useState<number[]>([]) // prospecto_ids ya ligados a esta garantía
  const [exito, setExito] = useState<string | null>(null)

  // Cargar prospectos + los que ya están vinculados a esta garantía
  useEffect(() => {
    async function cargar() {
      const { data: pros, error: e1 } = await supabase
        .from('prospectos')
        .select('id, folio, nombre, correo, telefono, etapa, estatus')
        .order('id', { ascending: false })
      if (e1) { setError(e1.message); setCargando(false); return }
      setProspectos(pros || [])

      const { data: vinc } = await supabase
        .from('prospecto_garantias')
        .select('prospecto_id')
        .eq('garantia_id', garantia.id)
      setYaVinculados((vinc || []).map((v) => v.prospecto_id))

      setCargando(false)
    }
    cargar()
  }, [garantia.id])

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCerrar])

  const filtrados = prospectos.filter((p) =>
    !filtro ||
    p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.folio || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (p.correo || '').toLowerCase().includes(filtro.toLowerCase())
  )

  async function vincular() {
    if (!seleccionado) return
    if (yaVinculados.includes(seleccionado.id)) {
      setError('Este prospecto ya está vinculado a esta propiedad.')
      return
    }
    setVinculando(true)
    setError(null)

    // Usuario actual (para vinculada_por)
    const { data: userData } = await supabase.auth.getUser()
    const email = userData?.user?.email || null

    const { error: e } = await supabase.from('prospecto_garantias').insert({
      prospecto_id: seleccionado.id,
      garantia_id: garantia.id,
      vinculada_en: new Date().toISOString(),
      vinculada_por: email,
    })
    setVinculando(false)
    if (e) { setError('Error al vincular: ' + e.message); return }

    setYaVinculados([...yaVinculados, seleccionado.id])
    setExito(`✅ ${seleccionado.nombre} marcó interés en ${garantia.folio}`)
    setSeleccionado(null)
    onVinculado?.()
  }

  const inputStyle = { width: '100%', padding: '9px 14px', border: '1px solid #c8d0db', borderRadius: '8px', fontSize: '13px', background: '#fff', fontFamily: 'Sora, sans-serif' }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onCerrar() }}
         style={{ position: 'fixed', inset: 0, background: 'rgba(4,44,83,0.42)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 60, padding: '30px 20px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '540px', overflow: 'hidden', fontFamily: 'Sora, sans-serif' }}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '16px 20px' }}>
          <div>
            <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', opacity: .85 }}>💬 REGISTRAR INTERÉS</div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '3px' }}>{garantia.direccion || 'Propiedad'}</div>
            <div style={{ fontSize: '11px', opacity: .85, fontFamily: 'monospace' }}>{garantia.folio}</div>
          </div>
          <button onClick={onCerrar} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '18px 20px' }}>
          {exito && (
            <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', borderRadius: '8px', padding: '10px 12px', fontSize: '12.5px', marginBottom: '14px' }}>
              {exito}
            </div>
          )}

          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a5a6e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            Buscar prospecto
          </label>
          <input
            autoFocus
            value={filtro}
            onChange={(e) => { setFiltro(e.target.value); setError(null) }}
            placeholder="🔍 Nombre, folio o correo..."
            style={inputStyle}
          />

          {error && <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '8px' }}>⚠ {error}</div>}

          {/* Lista de resultados */}
          <div style={{ marginTop: '12px', maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {cargando ? (
              <div style={{ textAlign: 'center', color: '#5d6b80', fontSize: '12px', padding: '20px' }}>Cargando prospectos...</div>
            ) : filtrados.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#5d6b80', fontSize: '12px', padding: '20px' }}>
                {filtro ? 'Sin resultados para esa búsqueda.' : 'No hay prospectos registrados.'}
              </div>
            ) : (
              filtrados.map((p) => {
                const activo = seleccionado?.id === p.id
                const ligado = yaVinculados.includes(p.id)
                return (
                  <div key={p.id}
                       onClick={() => { if (!ligado) { setSeleccionado(p); setError(null) } }}
                       style={{
                         border: `1px solid ${activo ? '#0C447C' : '#dde3ea'}`,
                         background: activo ? '#E6F1FB' : ligado ? '#f1f5f9' : '#fff',
                         borderRadius: '8px', padding: '9px 12px',
                         cursor: ligado ? 'not-allowed' : 'pointer',
                         opacity: ligado ? 0.7 : 1,
                         display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                       }}>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#042C53' }}>{p.nombre}</div>
                      <div style={{ fontSize: '10.5px', color: '#5d6b80', fontFamily: 'monospace' }}>
                        {p.folio}{p.correo ? ` · ${p.correo}` : ''}
                      </div>
                    </div>
                    {ligado
                      ? <span style={{ fontSize: '9.5px', color: '#0F6E56', fontWeight: 700, whiteSpace: 'nowrap' }}>✓ Ya vinculado</span>
                      : activo && <span style={{ fontSize: '14px', color: '#0C447C' }}>●</span>}
                  </div>
                )
              })
            )}
          </div>

          {/* Acciones */}
          <div className="flex justify-end" style={{ gap: '8px', marginTop: '18px', paddingTop: '14px', borderTop: '0.5px solid #dde3ea' }}>
            <button onClick={onCerrar} style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: 'pointer', background: '#eef1f5', color: '#4a5a6e', border: '1px solid #c8d0db' }}>
              Cerrar
            </button>
            <button onClick={vincular} disabled={!seleccionado || vinculando}
                    style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: (!seleccionado || vinculando) ? 'not-allowed' : 'pointer', background: (!seleccionado || vinculando) ? '#94a3b8' : '#0C447C', color: 'white', border: 'none' }}>
              {vinculando ? 'Vinculando...' : '💬 Marcar interés'}
            </button>
          </div>

          {/* Nota: crear nuevo prospecto (2b) queda para el siguiente paso */}
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#5d6b80', textAlign: 'center' }}>
            ¿No está en la lista? Créalo primero en el módulo <strong>Prospectos</strong>.
          </div>
        </div>
      </div>
    </div>
  )
}