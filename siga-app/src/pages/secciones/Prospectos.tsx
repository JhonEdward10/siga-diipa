import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { SUCURSALES } from '../../lib/sucursales'
import ModalAvanzarEtapa2 from './ModalAvanzarEtapa2'
import ModalAvanzarEtapa3 from './ModalAvanzarEtapa3'
import ModalAvanzarEtapa4 from './ModalAvanzarEtapa4'
import LineaVida from './LineaVida'

type Prospecto = {
  id: number
  folio: string | null
  estatus: string | null
  etapa: number | null
  nombre: string
  correo: string | null
  telefono: string | null
  ciudad: string | null
  estado: string | null
  tipo_proceso: string | null
}

// El pipeline de 5 etapas (sacado del sistema viejo de Paola)
const ETAPAS = [
  { num: 1, label: 'Primer contacto', icon: '📞', color: '#15803d', bg: '#dcfce7' },
  { num: 2, label: 'Cita agendada', icon: '📅', color: '#9a3412', bg: '#fed7aa' },
  { num: 3, label: 'Visitado', icon: '🚶', color: '#5b21b6', bg: '#ede9fe' },
  { num: 4, label: 'Pre-cliente', icon: '📝', color: '#0c4a6e', bg: '#dbeafe' },
  { num: 5, label: 'Cliente DIIPA', icon: '🏆', color: '#1e3a8a', bg: '#dbeafe' },
]

function etapaDef(num: number | null) {
  return ETAPAS[(num || 1) - 1] || ETAPAS[0]
}

/* ════════════════════════════════════════════════════════════════════
   SEMÁFORO COMERCIAL DIIPA · Fase 1 (por etapa)
   ────────────────────────────────────────────────────────────────────
   Los colores que dependen SOLO de la etapa ya funcionan:
     🔵 Azul     → Prospecto nuevo (etapa 1)
     🟠 Naranja  → Cita asistida / visitado (etapas 2 y 3)
     🟡 Amarillo → Apartado / pre-cliente (etapa 4)
     🟢 Verde    → Cliente DIIPA (etapa 5)

   PENDIENTE (Fase 2, requiere registrar contactos/pagos):
     🟣 Morado → en seguimiento (< 14 días desde último contacto)
     🔴 Rojo   → en riesgo (15+ días sin contacto)
     El verde real será "pagó 35%" cuando se registren pagos.
   ════════════════════════════════════════════════════════════════════ */
function semaforo(etapa: number | null): { color: string; label: string } {
  const e = etapa || 1
  if (e === 1) return { color: '#2563eb', label: 'Prospecto nuevo' }      // Azul
  if (e === 2 || e === 3) return { color: '#ea580c', label: 'Cita / interés' } // Naranja
  if (e === 4) return { color: '#eab308', label: 'Apartado' }             // Amarillo
  return { color: '#16a34a', label: 'Cliente' }                          // Verde (etapa 5)
}

const LEYENDA_SEMAFORO = [
  { color: '#2563eb', label: 'Prospecto nuevo' },
  { color: '#ea580c', label: 'Cita / interés' },
  { color: '#eab308', label: 'Apartado' },
  { color: '#16a34a', label: 'Cliente' },
]

const PROCESOS: Record<string, string> = {
  svta: 'SVTA', 'pv-lv': 'Promesa CV — Le Ville', 'pv-esp': 'Promesa CV — España',
  pv: 'Promesa de Compraventa', renta: 'Renta', comodato: 'Comodato', otro: 'Otro',
}

// Origen del prospecto — por dónde llegó el cliente (definido con la Lic. Elizabeth)
const ORIGENES = [
  { value: 'marketplace', label: '🛒 Marketplace' },
  { value: 'facebook',    label: '📘 Facebook' },
  { value: 'instagram',   label: '📷 Instagram' },
  { value: 'linkedin',    label: '💼 LinkedIn' },
  { value: 'chatbot',     label: '🤖 Chatbot / WhatsApp' },
  { value: 'campana',     label: '📢 Campaña de la empresa' },
  { value: 'referido',    label: '🤝 Referido (un amigo/conocido)' },
  { value: 'sucursal',    label: '🏢 Directo en sucursal' },
  { value: 'otro',        label: '❓ Otro' },
]


export default function Prospectos() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')
  const [filtroEtapa, setFiltroEtapa] = useState<number | null>(null)
  const [modalEt2, setModalEt2] = useState<{ id: number; nombre: string; etapa: number } | null>(null)
  const [modalEt3, setModalEt3] = useState<{ id: number; folio: string; nombre: string } | null>(null)
  const [modalEt4, setModalEt4] = useState<{ id: number; folio: string; nombre: string } | null>(null)
  const [expediente, setExpediente] = useState<{ id: number; nombre: string; folio: string } | null>(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [folioNuevo, setFolioNuevo] = useState('')
  const [form, setForm] = useState({
    estatus: 'prospecto', vendedor: '', sucursal: '', unidad_responsable: '',
    tipo_proceso: '', nombre: '', correo: '', telefono: '', ciudad: '', estado: '',
    curp: '', rfc: '', fecha_nacimiento: '', ocupacion: '', estado_civil: '', domicilio: '', notas: '',
    origen: '', referido_por: '',
  })

  async function cargar() {
    const { data, error: err } = await supabase
      .from('prospectos')
      .select('id, folio, estatus, etapa, nombre, correo, telefono, ciudad, estado, tipo_proceso')
      .order('id', { ascending: false })
    if (err) { setError(err.message); setCargando(false); return }
    setProspectos(data || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  // Avanzar el prospecto a la siguiente etapa
  async function avanzarEtapa(p: Prospecto) {
    const etapaActual = p.etapa || 1
    if (etapaActual >= 5) return // ya está en la última

    const nuevaEtapa = etapaActual + 1
    const nuevoEstatus = nuevaEtapa === 5 ? 'cliente' : p.estatus

    const { error: err } = await supabase
      .from('prospectos')
      .update({ etapa: nuevaEtapa, estatus: nuevoEstatus })
      .eq('id', p.id)

    if (err) { alert('Error al avanzar etapa: ' + err.message); return }
    await cargar()
  }

  // Retroceder una etapa (por si se equivocaron)
  async function retrocederEtapa(p: Prospecto) {
    const etapaActual = p.etapa || 1
    if (etapaActual <= 1) return
    const nuevaEtapa = etapaActual - 1
    const nuevoEstatus = nuevaEtapa < 5 ? 'prospecto' : p.estatus
    const { error: err } = await supabase
      .from('prospectos')
      .update({ etapa: nuevaEtapa, estatus: nuevoEstatus })
      .eq('id', p.id)
    if (err) { alert('Error: ' + err.message); return }
    await cargar()
  }

 function clicAvanzar(p: Prospecto) {
    const etapaActual = p.etapa || 1
    if (etapaActual === 1) {
      setModalEt2({ id: p.id, nombre: p.nombre, etapa: etapaActual })
    } else if (etapaActual === 2) {
      setModalEt3({ id: p.id, folio: p.folio || '', nombre: p.nombre })
    } else if (etapaActual === 3) {
      setModalEt4({ id: p.id, folio: p.folio || '', nombre: p.nombre })
    } else {
      avanzarEtapa(p)
    }
  }

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
    setForm({ estatus: 'prospecto', vendedor: '', sucursal: '', unidad_responsable: '', tipo_proceso: '', nombre: '', correo: '', telefono: '', ciudad: '', estado: '', curp: '', rfc: '', fecha_nacimiento: '', ocupacion: '', estado_civil: '', domicilio: '', notas: '', origen: '', referido_por: '' })
    setModalAbierto(true)
  }

  async function abrirEditar(p: Prospecto) {
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
      origen: data.origen || '', referido_por: data.referido_por || '',
    })
    setModalAbierto(true)
  }

  async function guardar() {
    // ── Validación de obligatorios (reunión comercial + Lic. Elizabeth) ──
    if (!form.nombre.trim()) { alert('⚠ El nombre es obligatorio.'); return }
    if (!form.correo.trim()) { alert('⚠ El correo es obligatorio.'); return }
    if (!form.telefono.trim()) { alert('⚠ El teléfono es obligatorio.'); return }
    if (!form.ciudad.trim()) { alert('⚠ La ciudad es obligatoria.'); return }
    if (!form.estado.trim()) { alert('⚠ El estado es obligatorio.'); return }
    if (!form.ocupacion.trim()) { alert('⚠ La ocupación es obligatoria.'); return }
    if (!form.sucursal) { alert('⚠ Selecciona la sucursal.'); return }
    if (!form.origen) { alert('⚠ Indica por dónde llegó el prospecto (origen).'); return }
    if (form.origen === 'referido' && !form.referido_por.trim()) {
      alert('⚠ Indica quién refirió al prospecto.')
      return
    }

    setGuardando(true)
    const datos = {
      estatus: form.estatus, vendedor: form.vendedor.trim() || null, sucursal: form.sucursal || null,
      unidad_responsable: form.unidad_responsable.trim() || null, tipo_proceso: form.tipo_proceso || null,
      nombre: form.nombre.trim(), correo: form.correo.trim() || null, telefono: form.telefono.trim() || null,
      ciudad: form.ciudad.trim() || null, estado: form.estado.trim() || null, curp: form.curp.trim() || null,
      rfc: form.rfc.trim() || null, fecha_nacimiento: form.fecha_nacimiento || null,
      ocupacion: form.ocupacion.trim() || null, estado_civil: form.estado_civil || null,
      domicilio: form.domicilio.trim() || null, notas: form.notas.trim() || null,
      origen: form.origen || null,
      referido_por: form.origen === 'referido' ? (form.referido_por.trim() || null) : null,
    }
    let errGuardar
    if (editandoId === null) {
      // Prospecto nuevo SIEMPRE nace como prospecto en etapa 1
      const { error: e } = await supabase.from('prospectos').insert({ folio: folioNuevo, etapa: 1, ...datos, estatus: 'prospecto' })
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

  const filtrados = prospectos.filter((p) => {
    const coincideTexto = !filtro ||
      p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      (p.folio || '').toLowerCase().includes(filtro.toLowerCase()) ||
      (p.correo || '').toLowerCase().includes(filtro.toLowerCase())
    const coincideEtapa = filtroEtapa === null || (p.etapa || 1) === filtroEtapa
    return coincideTexto && coincideEtapa
  })

  const conteoEtapas = ETAPAS.map((et) => prospectos.filter((p) => (p.etapa || 1) === et.num).length)

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5', fontFamily: 'Sora, sans-serif' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase' as const, marginBottom: '5px' }

  return (
    <div>
      {/* PIPELINE — las 5 etapas con conteo (clickeable para filtrar) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {ETAPAS.map((et, i) => {
          const activo = filtroEtapa === et.num
          return (
            <div key={et.num} onClick={() => setFiltroEtapa(activo ? null : et.num)}
                 style={{ background: activo ? et.color : '#fff', border: `1px solid ${activo ? et.color : '#c8d0db'}`, borderRadius: '10px', padding: '12px 8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{et.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'monospace', color: activo ? '#fff' : et.color, lineHeight: 1 }}>{conteoEtapas[i]}</div>
              <div style={{ fontSize: '9.5px', fontWeight: 600, color: activo ? '#fff' : '#5d6b80', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{et.label}</div>
            </div>
          )
        })}
      </div>

      {/* Leyenda del semáforo comercial */}
      <div className="flex items-center" style={{ gap: '14px', flexWrap: 'wrap', marginBottom: '16px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#5d6b80', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Semáforo:</span>
        {LEYENDA_SEMAFORO.map((s) => (
          <span key={s.label} className="flex items-center" style={{ gap: '5px', fontSize: '10.5px', color: '#4a5a6e' }}>
            <span style={{ width: '11px', height: '11px', borderRadius: '3px', background: s.color, display: 'inline-block' }} />
            {s.label}
          </span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center" style={{ gap: '12px', marginBottom: '14px' }}>
        <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="🔍 Buscar por nombre, folio o correo..."
               style={{ flex: 1, padding: '9px 14px', border: '1px solid #c8d0db', borderRadius: '8px', fontSize: '12.5px', background: '#fff', fontFamily: 'Sora, sans-serif' }} />
        {filtroEtapa !== null && (
          <button onClick={() => setFiltroEtapa(null)} style={{ background: '#eef1f5', color: '#4a5a6e', border: '1px solid #c8d0db', padding: '9px 14px', borderRadius: '8px', fontSize: '11.5px', fontFamily: 'Sora, sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            ✕ Quitar filtro
          </button>
        )}
        <button onClick={abrirCrear} style={{ background: '#0C447C', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          + Nuevo Prospecto
        </button>
      </div>

      {filtrados.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>👥</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>{filtro || filtroEtapa ? 'Sin resultados' : 'Sin prospectos'}</h3>
          <p style={{ fontSize: '12px' }}>{filtro || filtroEtapa ? 'Prueba con otro filtro.' : 'Crea el primero con el botón de arriba.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '12px' }}>
          {filtrados.map((p) => {
            const et = etapaDef(p.etapa)
            const etapaActual = p.etapa || 1
            const sem = semaforo(p.etapa)
            return (
              <div key={p.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderLeft: `4px solid ${sem.color}`, borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="flex items-start justify-between" style={{ gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{p.folio}</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#042C53' }}>{p.nombre}</div>
                  </div>
                  <span style={{ fontSize: '9.5px', fontWeight: 600, padding: '3px 8px', borderRadius: '5px', background: et.bg, color: et.color, whiteSpace: 'nowrap' }}>{et.icon} {et.label}</span>
                </div>

                {/* Barra de progreso del pipeline — pintada con el color del semáforo */}
                <div className="flex" style={{ gap: '3px' }}>
                  {ETAPAS.map((e) => (
                    <div key={e.num} style={{ flex: 1, height: '5px', borderRadius: '3px', background: e.num <= etapaActual ? sem.color : '#eef1f5' }} />
                  ))}
                </div>

                <div style={{ background: '#eef1f5', borderRadius: '6px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#4a5a6e' }}>
                  {p.telefono && <div>📞 {p.telefono}</div>}
                  {p.correo && <div>✉️ {p.correo}</div>}
                  {(p.ciudad || p.estado) && <div>📍 {[p.ciudad, p.estado].filter(Boolean).join(', ')}</div>}
                  {p.tipo_proceso && <div>📋 {PROCESOS[p.tipo_proceso] || p.tipo_proceso}</div>}
                </div>

                {/* Botones de acción del proceso */}
                <div className="flex" style={{ gap: '6px' }}>
                  {etapaActual > 1 && (
                    <button onClick={() => retrocederEtapa(p)} title="Retroceder etapa"
                            style={{ background: '#fff', color: '#5d6b80', border: '1px solid #c8d0db', padding: '7px 10px', borderRadius: '7px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                      ←
                    </button>
                  )}
                  <button onClick={() => setExpediente({ id: p.id, nombre: p.nombre, folio: p.folio || '' })} title="Ver expediente / línea de vida"
                          style={{ background: '#fff', color: '#5b21b6', border: '1px solid #d8b4fe', padding: '7px 10px', borderRadius: '7px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                    📋
                  </button>
                  <button onClick={() => abrirEditar(p)}
                          style={{ flex: 1, background: '#fff', color: '#0C447C', border: '1px solid #c8d0db', padding: '7px', borderRadius: '7px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                    ✏️ Editar
                  </button>
                  {etapaActual < 5 ? (
                    <button onClick={() => clicAvanzar(p)}
                            style={{ flex: 1, background: et.color, color: 'white', border: 'none', padding: '7px', borderRadius: '7px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                      Avanzar →
                    </button>
                  ) : (
                    <span style={{ flex: 1, textAlign: 'center', padding: '7px', fontSize: '11px', color: '#1e3a8a', fontWeight: 600 }}>🏆 Cliente</span>
                  )}
                </div>
              </div>
            )
          })}
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
                  {editandoId === null ? (
                    <input value="Prospecto (nuevo)" disabled style={{ ...inputStyle, background: '#e2e8f0', color: '#64748b' }} />
                  ) : (
                    <select value={form.estatus} onChange={(e) => setForm({ ...form, estatus: e.target.value })} style={inputStyle}>
                      <option value="prospecto">Prospecto</option>
                      <option value="cliente">Cliente</option>
                    </select>
                  )}
                </div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Vendedor / ASC</label><input value={form.vendedor} onChange={(e) => setForm({ ...form, vendedor: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Sucursal *</label>
                  <select value={form.sucursal} onChange={(e) => setForm({ ...form, sucursal: e.target.value })} style={inputStyle}>
                    <option value="">— Selecciona sucursal —</option>
                    {SUCURSALES.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Unidad responsable</label><input value={form.unidad_responsable} onChange={(e) => setForm({ ...form, unidad_responsable: e.target.value })} style={inputStyle} /></div>
              </div>

              {/* Origen del prospecto */}
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>📍 ¿Por dónde llegó? *</label>
                  <select value={form.origen} onChange={(e) => setForm({ ...form, origen: e.target.value })} style={inputStyle}>
                    <option value="">— Selecciona origen —</option>
                    {ORIGENES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                {form.origen === 'referido' && (
                  <div style={{ flex: 1 }}><label style={labelStyle}>¿Quién lo refirió? *</label><input value={form.referido_por} onChange={(e) => setForm({ ...form, referido_por: e.target.value })} placeholder="Nombre de quien recomendó" style={inputStyle} /></div>
                )}
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
                <div style={{ flex: 1 }}><label style={labelStyle}>Correo *</label><input value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Teléfono *</label><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Ciudad *</label><input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Estado *</label><input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>CURP</label><input value={form.curp} onChange={(e) => setForm({ ...form, curp: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>RFC</label><input value={form.rfc} onChange={(e) => setForm({ ...form, rfc: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Fecha nac.</label><input type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Ocupación *</label><input value={form.ocupacion} onChange={(e) => setForm({ ...form, ocupacion: e.target.value })} style={inputStyle} /></div>
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

      {/* Modal Etapa 1 → 2: agendar cita + vincular garantías */}
      {modalEt2 && (
        <ModalAvanzarEtapa2
          prospectoId={modalEt2.id}
          prospectoNombre={modalEt2.nombre}
          etapaActual={modalEt2.etapa}
          abierto={true}
          onCerrar={() => setModalEt2(null)}
          onGuardado={cargar}
        />
      )}

      {modalEt3 && (
        <ModalAvanzarEtapa3
          prospectoId={modalEt3.id}
          prospectoFolio={modalEt3.folio}
          prospectoNombre={modalEt3.nombre}
          abierto={true}
          onCerrar={() => setModalEt3(null)}
          onGuardado={cargar}
        />
      )}

      {modalEt4 && (
        <ModalAvanzarEtapa4
          prospectoId={modalEt4.id}
          prospectoFolio={modalEt4.folio}
          prospectoNombre={modalEt4.nombre}
          abierto={true}
          onCerrar={() => setModalEt4(null)}
          onGuardado={cargar}
        />
      )}

      {/* Expediente · Línea de Vida */}
      {expediente && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setExpediente(null) }}
             style={{ position: 'fixed', inset: 0, background: 'rgba(4,44,83,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 60, padding: '30px 20px', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '560px', overflow: 'hidden' }}>
            <div className="flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', color: 'white', padding: '16px 20px' }}>
              <div>
                <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', opacity: .85 }}>📋 EXPEDIENTE · LÍNEA DE VIDA</div>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{expediente.nombre}</div>
                <div style={{ fontSize: '11px', opacity: .85, fontFamily: 'monospace' }}>{expediente.folio}</div>
              </div>
              <button onClick={() => setExpediente(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '30px', height: '30px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '18px 20px', maxHeight: '70vh', overflowY: 'auto', fontFamily: 'Sora, sans-serif' }}>
              <LineaVida prospectoId={expediente.id} />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}