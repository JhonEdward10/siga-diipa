import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Cartera = { id: number; folio: string; nombre: string }
type Garantia = {
  id: number
  folio: string
  cartera_id: number | null
  tipo_caso: string | null
  num_credito: string | null
  direccion: string | null
  estado_mx: string | null
  municipio: string | null
  valor_estimado: number | null
  precio_piso: number | null
  m2_terreno: number | null
  m2_construccion: number | null
  estatus: string | null
}

const TIPOS_CASO = [
  'Hipotecario', 'Mercantil Ejecutivo', 'Civil Ordinario', 'Penal',
  'Sucesorio/Familiar', 'Intestamentario', 'Recuperaciones',
]

export default function Garantias() {
  const [garantias, setGarantias] = useState<Garantia[]>([])
  const [carteras, setCarteras] = useState<Cartera[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [folioNuevo, setFolioNuevo] = useState('')
  const [form, setForm] = useState({
    cartera_id: '', tipo_caso: '', num_credito: '', direccion: '',
    estado_mx: '', municipio: '', valor_estimado: '', precio_piso: '',
    m2_terreno: '', m2_construccion: '',
  })

  async function cargar() {
    const { data: gar, error: errGar } = await supabase
      .from('garantias')
      .select('id, folio, cartera_id, tipo_caso, num_credito, direccion, estado_mx, municipio, valor_estimado, precio_piso, m2_terreno, m2_construccion, estatus')
      .eq('archivada', false).eq('eliminada', false)
      .order('folio', { ascending: true })

    if (errGar) { setError(errGar.message); setCargando(false); return }

    const { data: cart } = await supabase
      .from('carteras').select('id, folio, nombre')
      .eq('archivada', false).eq('eliminada', false)

    setCarteras(cart || [])
    setGarantias(gar || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  function mapaCarteras(): Record<number, string> {
    const m: Record<number, string> = {}
    carteras.forEach((c) => { m[c.id] = `${c.folio} · ${c.nombre}` })
    return m
  }

  async function generarFolio(): Promise<string> {
    const { data } = await supabase.from('garantias').select('folio').like('folio', 'GAR-%')
    let max = 0
    ;(data || []).forEach((row) => {
      const num = parseInt((row.folio || '').replace(/\D/g, ''), 10)
      if (!isNaN(num) && num > max) max = num
    })
    return 'GAR-' + String(max + 1).padStart(4, '0')
  }

  function normalizar(dir: string): string {
    return dir.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,]/g, '')
  }

  async function abrirCrear() {
    if (carteras.length === 0) { alert('Primero crea al menos una cartera.'); return }
    const folio = await generarFolio()
    setEditandoId(null)
    setFolioNuevo(folio)
    setForm({ cartera_id: '', tipo_caso: '', num_credito: '', direccion: '', estado_mx: '', municipio: '', valor_estimado: '', precio_piso: '', m2_terreno: '', m2_construccion: '' })
    setModalAbierto(true)
  }

  function abrirEditar(g: Garantia) {
    setEditandoId(g.id)
    setFolioNuevo(g.folio)
    setForm({
      cartera_id: g.cartera_id ? String(g.cartera_id) : '',
      tipo_caso: g.tipo_caso || '',
      num_credito: g.num_credito || '',
      direccion: g.direccion || '',
      estado_mx: g.estado_mx || '',
      municipio: g.municipio || '',
      valor_estimado: g.valor_estimado != null ? String(g.valor_estimado) : '',
      precio_piso: g.precio_piso != null ? String(g.precio_piso) : '',
      m2_terreno: g.m2_terreno != null ? String(g.m2_terreno) : '',
      m2_construccion: g.m2_construccion != null ? String(g.m2_construccion) : '',
    })
    setModalAbierto(true)
  }

  async function guardar() {
    if (!form.cartera_id) { alert('Selecciona una cartera'); return }
    if (!form.tipo_caso) { alert('Selecciona el tipo de caso'); return }
    if (!form.direccion.trim()) { alert('La dirección es obligatoria'); return }

    setGuardando(true)
    const dirNorm = normalizar(form.direccion)

    // Validar duplicado solo al crear (o si cambió la dirección al editar)
    const { data: dup } = await supabase
      .from('garantias').select('id').eq('direccion_norm', dirNorm).eq('eliminada', false)
    const hayDuplicado = (dup || []).some((d) => d.id !== editandoId)
    if (hayDuplicado) {
      setGuardando(false)
      alert('Ya existe otra garantía con esa dirección.')
      return
    }

    const datos = {
      cartera_id: Number(form.cartera_id),
      tipo_caso: form.tipo_caso,
      num_credito: form.num_credito.trim() || null,
      direccion: form.direccion.trim(),
      direccion_norm: dirNorm,
      estado_mx: form.estado_mx.trim() || null,
      municipio: form.municipio.trim() || null,
      valor_estimado: form.valor_estimado ? Number(form.valor_estimado) : null,
      precio_piso: form.precio_piso ? Number(form.precio_piso) : null,
      m2_terreno: form.m2_terreno ? Number(form.m2_terreno) : null,
      m2_construccion: form.m2_construccion ? Number(form.m2_construccion) : null,
    }

    let errGuardar
    if (editandoId === null) {
      const { error: e } = await supabase.from('garantias').insert({ folio: folioNuevo, estatus: 'activa', ...datos })
      errGuardar = e
    } else {
      const { error: e } = await supabase.from('garantias').update(datos).eq('id', editandoId)
      errGuardar = e
    }

    setGuardando(false)
    if (errGuardar) { alert('Error al guardar: ' + errGuardar.message); return }
    setModalAbierto(false)
    await cargar()
  }

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando garantías...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  const mc = mapaCarteras()
  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5', fontFamily: 'Sora, sans-serif' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase' as const, marginBottom: '5px' }

  return (
    <div>
      <div className="flex justify-end" style={{ marginBottom: '14px' }}>
        <button onClick={abrirCrear} style={{ background: '#0C447C', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
          + Nueva Garantía
        </button>
      </div>

      {garantias.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>🏷️</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>Sin garantías</h3>
          <p style={{ fontSize: '12px' }}>Crea la primera con el botón de arriba.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {garantias.map((g) => (
            <div key={g.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="flex items-start justify-between" style={{ gap: '8px' }}>
                <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{g.folio}</div>
                {g.tipo_caso && <span style={{ fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: '#E6F1FB', color: '#0C447C' }}>{g.tipo_caso}</span>}
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#042C53' }}>{g.direccion || 'Sin dirección'}</div>
              <div style={{ background: '#eef1f5', borderRadius: '6px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#4a5a6e' }}>
                <div>📂 {g.cartera_id && mc[g.cartera_id] ? mc[g.cartera_id] : 'Sin cartera'}</div>
                {g.valor_estimado != null && <div>💰 Valor: ${g.valor_estimado.toLocaleString('es-MX')}</div>}
              </div>
              <button onClick={() => abrirEditar(g)} style={{ background: '#fff', color: '#0C447C', border: '1px solid #c8d0db', padding: '7px', borderRadius: '7px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                ✏️ Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModalAbierto(false) }}
             style={{ position: 'fixed', inset: 0, background: 'rgba(4,44,83,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '14px 20px', borderRadius: '14px 14px 0 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{editandoId === null ? 'Nueva Garantía' : 'Editar Garantía'} · {folioNuevo}</div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '7px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Cartera *</label>
                <select value={form.cartera_id} onChange={(e) => setForm({ ...form, cartera_id: e.target.value })} style={inputStyle}>
                  <option value="">— Selecciona cartera —</option>
                  {carteras.map((c) => <option key={c.id} value={c.id}>{c.folio} · {c.nombre}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Tipo de caso *</label>
                <select value={form.tipo_caso} onChange={(e) => setForm({ ...form, tipo_caso: e.target.value })} style={inputStyle}>
                  <option value="">— Selecciona tipo —</option>
                  {TIPOS_CASO.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>No. de Crédito (opcional)</label><input value={form.num_credito} onChange={(e) => setForm({ ...form, num_credito: e.target.value })} style={inputStyle} /></div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Dirección / Ubicación *</label><input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Calle, Colonia, Ciudad, Estado" style={inputStyle} /></div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Estado</label><input value={form.estado_mx} onChange={(e) => setForm({ ...form, estado_mx: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Municipio</label><input value={form.municipio} onChange={(e) => setForm({ ...form, municipio: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Valor estimado ($)</label><input type="number" value={form.valor_estimado} onChange={(e) => setForm({ ...form, valor_estimado: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Precio piso ($)</label><input type="number" value={form.precio_piso} onChange={(e) => setForm({ ...form, precio_piso: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>M² Terreno</label><input type="number" value={form.m2_terreno} onChange={(e) => setForm({ ...form, m2_terreno: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>M² Construcción</label><input type="number" value={form.m2_construccion} onChange={(e) => setForm({ ...form, m2_construccion: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex justify-end" style={{ gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '0.5px solid #dde3ea' }}>
                <button onClick={() => setModalAbierto(false)} style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: 'pointer', background: '#eef1f5', color: '#4a5a6e', border: '1px solid #c8d0db' }}>Cancelar</button>
                <button onClick={guardar} disabled={guardando} style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: guardando ? 'not-allowed' : 'pointer', background: '#0C447C', color: 'white', border: 'none', opacity: guardando ? 0.6 : 1 }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}