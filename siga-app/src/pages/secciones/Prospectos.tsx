import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Prospecto = {
  id: number
  folio: string | null
  estatus: string | null
  nombre: string
  correo: string | null
  telefono: string | null
  ciudad: string | null
  estado: string | null
  curp: string | null
  rfc: string | null
  ocupacion: string | null
  estado_civil: string | null
  domicilio: string | null
  vendedor: string | null
  tipo_proceso: string | null
}

const PROCESOS: Record<string, string> = {
  svta: 'SVTA — Prestación de Servicios', 'pv-lv': 'Promesa CV — Le Ville',
  'pv-esp': 'Promesa CV — España', pv: 'Promesa de Compraventa',
  renta: 'Renta', comodato: 'Comodato', otro: 'Otro',
}

export default function Prospectos() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [folioNuevo, setFolioNuevo] = useState('')
  const [form, setForm] = useState({
    estatus: 'prospecto', vendedor: '', sucursal: '', unidad_responsable: '',
    tipo_proceso: '', nombre: '', correo: '', telefono: '', ciudad: '', estado: '',
    curp: '', rfc: '', fecha_nacimiento: '', ocupacion: '', estado_civil: '', domicilio: '', notas: '',
  })

  async function cargar() {
    const { data, error: err } = await supabase
      .from('prospectos')
      .select('id, folio, estatus, nombre, correo, telefono, ciudad, estado, curp, rfc, ocupacion, estado_civil, domicilio, vendedor, tipo_proceso')
      .order('id', { ascending: false })
    if (err) { setError(err.message); setCargando(false); return }
    setProspectos(data || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  async function generarFolio(): Promise<string> {
    const { data } = await supabase.from('prospectos').select('folio').like('folio', 'PRO-%')
    let max = 0
    ;(data || []).forEach((row) => {
      const num = parseInt((row.folio || '').replace(/\D/g, ''), 10)
      if (!isNaN(num) && num > max) max = num
    })
    return 'PRO-' + String(max + 1).padStart(4, '0')
  }

  async function abrirCrear() {
    const folio = await generarFolio()
    setEditandoId(null)
    setFolioNuevo(folio)
    setForm({ estatus: 'prospecto', vendedor: '', sucursal: '', unidad_responsable: '', tipo_proceso: '', nombre: '', correo: '', telefono: '', ciudad: '', estado: '', curp: '', rfc: '', fecha_nacimiento: '', ocupacion: '', estado_civil: '', domicilio: '', notas: '' })
    setModalAbierto(true)
  }

  async function abrirEditar(p: Prospecto) {
    // Traer el registro completo
    const { data } = await supabase.from('prospectos').select('*').eq('id', p.id).single()
    if (!data) return
    setEditandoId(p.id)
    setFolioNuevo(data.folio || '')
    setForm({
      estatus: data.estatus || 'prospecto', vendedor: data.vendedor || '', sucursal: data.sucursal || '',
      unidad_responsable: data.unidad_responsable || '', tipo_proceso: data.tipo_proceso || '',
      nombre: data.nombre || '', correo: data.correo || '', telefono: data.telefono || '',
      ciudad: data.ciudad || '', estado: data.estado || '', curp: data.curp || '', rfc: data.rfc || '',
      fecha_nacimiento: data.fecha_nacimiento || '', ocupacion: data.ocupacion || '',
      estado_civil: data.estado_civil || '', domicilio: data.domicilio || '', notas: data.notas || '',
    })
    setModalAbierto(true)
  }

  async function guardar() {
    if (!form.nombre.trim()) { alert('El nombre es obligatorio'); return }
    setGuardando(true)

    const datos = {
      estatus: form.estatus, vendedor: form.vendedor.trim() || null, sucursal: form.sucursal.trim() || null,
      unidad_responsable: form.unidad_responsable.trim() || null, tipo_proceso: form.tipo_proceso || null,
      nombre: form.nombre.trim(), correo: form.correo.trim() || null, telefono: form.telefono.trim() || null,
      ciudad: form.ciudad.trim() || null, estado: form.estado.trim() || null, curp: form.curp.trim() || null,
      rfc: form.rfc.trim() || null, fecha_nacimiento: form.fecha_nacimiento || null,
      ocupacion: form.ocupacion.trim() || null, estado_civil: form.estado_civil || null,
      domicilio: form.domicilio.trim() || null, notas: form.notas.trim() || null,
    }

    let errGuardar
    if (editandoId === null) {
      const { error: e } = await supabase.from('prospectos').insert({ folio: folioNuevo, ...datos })
      errGuardar = e
    } else {
      const { error: e } = await supabase.from('prospectos').update(datos).eq('id', editandoId)
      errGuardar = e
    }

    setGuardando(false)
    if (errGuardar) { alert('Error al guardar: ' + errGuardar.message); return }
    setModalAbierto(false)
    await cargar()
  }

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando prospectos...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  const filtrados = prospectos.filter((p) =>
    !filtro || p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    (p.folio || '').toLowerCase().includes(filtro.toLowerCase()) ||
    (p.correo || '').toLowerCase().includes(filtro.toLowerCase())
  )

  const totalProspectos = prospectos.filter((p) => p.estatus === 'prospecto').length
  const totalClientes = prospectos.filter((p) => p.estatus === 'cliente').length

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5', fontFamily: 'Sora, sans-serif' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase' as const, marginBottom: '5px' }

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { num: prospectos.length, label: 'Total', bg: '#E6F1FB', color: '#0C447C', ico: '👥' },
          { num: totalProspectos, label: 'Prospectos', bg: '#FEF9C3', color: '#854D0E', ico: '👁️' },
          { num: totalClientes, label: 'Clientes', bg: '#E1F5EE', color: '#0F6E56', ico: '✅' },
        ].map((k) => (
          <div key={k.label} className="flex items-center" style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '14px 16px', gap: '12px' }}>
            <div className="flex items-center justify-center" style={{ width: '38px', height: '38px', borderRadius: '8px', background: k.bg, color: k.color, fontSize: '18px' }}>{k.ico}</div>
            <div>
              <div style={{ fontSize: '21px', fontWeight: 600, fontFamily: 'monospace', lineHeight: 1.1 }}>{k.num}</div>
              <div style={{ fontSize: '10.5px', color: '#5d6b80', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center" style={{ gap: '12px', marginBottom: '14px' }}>
        <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="🔍 Buscar por nombre, folio o correo..."
               style={{ flex: 1, padding: '9px 14px', border: '1px solid #c8d0db', borderRadius: '8px', fontSize: '12.5px', background: '#fff', fontFamily: 'Sora, sans-serif' }} />
        <button onClick={abrirCrear} style={{ background: '#0C447C', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          + Nuevo Prospecto
        </button>
      </div>

      {filtrados.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>👥</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>{filtro ? 'Sin resultados' : 'Sin prospectos'}</h3>
          <p style={{ fontSize: '12px' }}>{filtro ? 'Prueba con otra búsqueda.' : 'Crea el primero con el botón de arriba.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
          {filtrados.map((p) => (
            <div key={p.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="flex items-start justify-between" style={{ gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{p.folio}</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#042C53' }}>{p.nombre}</div>
                </div>
                <span style={{
                  fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase',
                  background: p.estatus === 'cliente' ? '#E1F5EE' : '#FEF9C3',
                  color: p.estatus === 'cliente' ? '#04342C' : '#854D0E',
                }}>{p.estatus === 'cliente' ? 'Cliente' : 'Prospecto'}</span>
              </div>
              <div style={{ background: '#eef1f5', borderRadius: '6px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#4a5a6e' }}>
                {p.telefono && <div>📞 {p.telefono}</div>}
                {p.correo && <div>✉️ {p.correo}</div>}
                {(p.ciudad || p.estado) && <div>📍 {[p.ciudad, p.estado].filter(Boolean).join(', ')}</div>}
                {p.tipo_proceso && <div>📋 {PROCESOS[p.tipo_proceso] || p.tipo_proceso}</div>}
              </div>
              <button onClick={() => abrirEditar(p)} style={{ background: '#fff', color: '#0C447C', border: '1px solid #c8d0db', padding: '7px', borderRadius: '7px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                ✏️ Ver / Editar
              </button>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModalAbierto(false) }}
             style={{ position: 'fixed', inset: 0, background: 'rgba(4,44,83,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '14px 20px', borderRadius: '14px 14px 0 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{editandoId === null ? 'Nuevo Prospecto' : 'Editar Prospecto'} · {folioNuevo}</div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '7px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0C447C', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>🪪 Identificación</div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Estatus</label>
                  <select value={form.estatus} onChange={(e) => setForm({ ...form, estatus: e.target.value })} style={inputStyle}>
                    <option value="prospecto">Prospecto</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Vendedor / ASC</label><input value={form.vendedor} onChange={(e) => setForm({ ...form, vendedor: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Sucursal</label><input value={form.sucursal} onChange={(e) => setForm({ ...form, sucursal: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Unidad responsable</label><input value={form.unidad_responsable} onChange={(e) => setForm({ ...form, unidad_responsable: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Tipo de proceso</label>
                <select value={form.tipo_proceso} onChange={(e) => setForm({ ...form, tipo_proceso: e.target.value })} style={inputStyle}>
                  <option value="">— Seleccionar —</option>
                  <option value="svta">SVTA — Prestación de Servicios</option>
                  <option value="pv-lv">Promesa CV — Le Ville</option>
                  <option value="pv-esp">Promesa CV — España</option>
                  <option value="pv">Promesa de Compraventa</option>
                  <option value="renta">Renta</option>
                  <option value="comodato">Comodato</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0C447C', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '16px 0 10px' }}>👤 Datos del cliente</div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Nombre completo *</label><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} /></div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Correo</label><input value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Teléfono</label><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Ciudad</label><input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Estado</label><input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>CURP</label><input value={form.curp} onChange={(e) => setForm({ ...form, curp: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>RFC</label><input value={form.rfc} onChange={(e) => setForm({ ...form, rfc: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Fecha nacimiento</label><input type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Ocupación</label><input value={form.ocupacion} onChange={(e) => setForm({ ...form, ocupacion: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Estado civil</label>
                  <select value={form.estado_civil} onChange={(e) => setForm({ ...form, estado_civil: e.target.value })} style={inputStyle}>
                    <option value="">— Seleccionar —</option>
                    <option value="soltero">Soltero/a</option>
                    <option value="casado">Casado/a</option>
                    <option value="divorciado">Divorciado/a</option>
                    <option value="viudo">Viudo/a</option>
                    <option value="union">Unión libre</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Domicilio</label><input value={form.domicilio} onChange={(e) => setForm({ ...form, domicilio: e.target.value })} style={inputStyle} /></div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Notas</label><textarea value={form.notas} rows={2} onChange={(e) => setForm({ ...form, notas: e.target.value })} style={inputStyle} /></div>

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