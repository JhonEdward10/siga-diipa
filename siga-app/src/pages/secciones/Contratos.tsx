import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Contrato = {
  id: number
  folio: string | null
  prospecto_id: number | null
  apartado_id: number | null
  garantia_id: number | null
  tipo_contrato: string | null
  precio: number | null
  plazo_semanas: number | null
  monto_apartado: number | null
  ciudad_firma: string | null
  fecha_firma: string | null
  firma_notaria: string | null
  firma_contrato: string | null
  firma_pago: string | null
  estatus: string | null
}

type Cliente = { id: number; nombre: string; folio: string | null }
type Apartado = { id: number; folio: string | null; prospecto_id: number | null; garantia_id: number | null; monto_apartado: number | null }
type Garantia = { id: number; folio: string; direccion: string | null }

const TIPOS: Record<string, string> = {
  svta: 'SVTA — Prestación de Servicios', 'pv-lv': 'Promesa CV — Le Ville',
  'pv-esp': 'Promesa CV — España', pv: 'Promesa de Compraventa',
  renta: 'Renta', comodato: 'Comodato', otro: 'Otro',
}

const ESTATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  borrador: { label: 'Borrador', bg: '#FEF9C3', color: '#854D0E' },
  firmado: { label: 'Firmado', bg: '#DBEAFE', color: '#1E40AF' },
  vigente: { label: 'Vigente', bg: '#E1F5EE', color: '#04342C' },
  cancelado: { label: 'Cancelado', bg: '#F1F5F9', color: '#64748B' },
}

const FIRMA_ICON: Record<string, string> = { pendiente: '⏳', si: '✅', no: '❌' }

export default function Contratos() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [apartados, setApartados] = useState<Apartado[]>([])
  const [garantias, setGarantias] = useState<Garantia[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [folioNuevo, setFolioNuevo] = useState('')
  const [form, setForm] = useState({
    prospecto_id: '', apartado_id: '', garantia_id: '', tipo_contrato: '',
    razon_social: 'DIIPA Desarrollo Inmobiliario e Inversiones', nombre_comercial: 'DIIPA',
    apoderado: '', escritura_num: '', rfc_prestador: '',
    notario: '', precio: '', plazo_semanas: '', monto_apartado: '',
    ciudad_firma: '', fecha_firma: '', jurisdiccion: '',
    firma_notaria: 'pendiente', firma_contrato: 'pendiente', firma_pago: 'pendiente',
    estatus: 'borrador', notas: '',
  })

  async function cargar() {
    const [ct, cli, apt, gar] = await Promise.all([
      supabase.from('contratos').select('id, folio, prospecto_id, apartado_id, garantia_id, tipo_contrato, precio, plazo_semanas, monto_apartado, ciudad_firma, fecha_firma, firma_notaria, firma_contrato, firma_pago, estatus').order('id', { ascending: false }),
      supabase.from('prospectos').select('id, nombre, folio').eq('estatus', 'cliente'),
      supabase.from('apartados').select('id, folio, prospecto_id, garantia_id, monto_apartado'),
      supabase.from('garantias').select('id, folio, direccion').eq('eliminada', false),
    ])
    if (ct.error) { setError(ct.error.message); setCargando(false); return }
    setContratos(ct.data || [])
    setClientes(cli.data || [])
    setApartados(apt.data || [])
    setGarantias(gar.data || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const mc: Record<number, string> = {}
  clientes.forEach((c) => { mc[c.id] = c.nombre })
  const mg: Record<number, string> = {}
  garantias.forEach((g) => { mg[g.id] = `${g.folio} · ${g.direccion || ''}` })
  const ma: Record<number, string> = {}
  apartados.forEach((a) => { ma[a.id] = a.folio || `APT-${a.id}` })

  async function generarFolio(): Promise<string> {
    const { data } = await supabase.from('contratos').select('folio').like('folio', 'CTR-%')
    let max = 0
    ;(data || []).forEach((row) => {
      const num = parseInt((row.folio || '').replace(/\D/g, ''), 10)
      if (!isNaN(num) && num > max) max = num
    })
    return 'CTR-' + String(max + 1).padStart(4, '0')
  }

  async function abrirCrear() {
    if (clientes.length === 0) { alert('Necesitas al menos un Cliente DIIPA para crear un contrato.'); return }
    const folio = await generarFolio()
    setEditandoId(null)
    setFolioNuevo(folio)
    setForm({
      prospecto_id: '', apartado_id: '', garantia_id: '', tipo_contrato: '',
      razon_social: 'DIIPA Desarrollo Inmobiliario e Inversiones', nombre_comercial: 'DIIPA',
      apoderado: '', escritura_num: '', rfc_prestador: '', notario: '',
      precio: '', plazo_semanas: '', monto_apartado: '',
      ciudad_firma: '', fecha_firma: '', jurisdiccion: '',
      firma_notaria: 'pendiente', firma_contrato: 'pendiente', firma_pago: 'pendiente',
      estatus: 'borrador', notas: '',
    })
    setModalAbierto(true)
  }

  async function abrirEditar(c: Contrato) {
    const { data } = await supabase.from('contratos').select('*').eq('id', c.id).single()
    if (!data) return
    setEditandoId(c.id)
    setFolioNuevo(data.folio || '')
    setForm({
      prospecto_id: data.prospecto_id ? String(data.prospecto_id) : '',
      apartado_id: data.apartado_id ? String(data.apartado_id) : '',
      garantia_id: data.garantia_id ? String(data.garantia_id) : '',
      tipo_contrato: data.tipo_contrato || '',
      razon_social: data.razon_social || '', nombre_comercial: data.nombre_comercial || '',
      apoderado: data.apoderado || '', escritura_num: data.escritura_num || '',
      rfc_prestador: data.rfc_prestador || '', notario: data.notario || '',
      precio: data.precio != null ? String(data.precio) : '',
      plazo_semanas: data.plazo_semanas != null ? String(data.plazo_semanas) : '',
      monto_apartado: data.monto_apartado != null ? String(data.monto_apartado) : '',
      ciudad_firma: data.ciudad_firma || '', fecha_firma: data.fecha_firma || '',
      jurisdiccion: data.jurisdiccion || '',
      firma_notaria: data.firma_notaria || 'pendiente',
      firma_contrato: data.firma_contrato || 'pendiente',
      firma_pago: data.firma_pago || 'pendiente',
      estatus: data.estatus || 'borrador', notas: data.notas || '',
    })
    setModalAbierto(true)
  }

  // Cuando se selecciona un apartado, auto-rellenar cliente y garantía
  function seleccionarApartado(aptId: string) {
    const apt = apartados.find((a) => a.id === Number(aptId))
    if (apt) {
      setForm({
        ...form,
        apartado_id: aptId,
        prospecto_id: apt.prospecto_id ? String(apt.prospecto_id) : form.prospecto_id,
        garantia_id: apt.garantia_id ? String(apt.garantia_id) : form.garantia_id,
        monto_apartado: apt.monto_apartado != null ? String(apt.monto_apartado) : form.monto_apartado,
      })
    } else {
      setForm({ ...form, apartado_id: aptId })
    }
  }

  async function guardar() {
    if (!form.prospecto_id) { alert('Selecciona el cliente'); return }
    setGuardando(true)
    const datos = {
      prospecto_id: Number(form.prospecto_id),
      apartado_id: form.apartado_id ? Number(form.apartado_id) : null,
      garantia_id: form.garantia_id ? Number(form.garantia_id) : null,
      tipo_contrato: form.tipo_contrato || null,
      razon_social: form.razon_social.trim() || null,
      nombre_comercial: form.nombre_comercial.trim() || null,
      apoderado: form.apoderado.trim() || null,
      escritura_num: form.escritura_num.trim() || null,
      rfc_prestador: form.rfc_prestador.trim() || null,
      notario: form.notario.trim() || null,
      precio: form.precio ? Number(form.precio) : 0,
      plazo_semanas: form.plazo_semanas ? Number(form.plazo_semanas) : null,
      monto_apartado: form.monto_apartado ? Number(form.monto_apartado) : 0,
      ciudad_firma: form.ciudad_firma.trim() || null,
      fecha_firma: form.fecha_firma || null,
      jurisdiccion: form.jurisdiccion.trim() || null,
      firma_notaria: form.firma_notaria, firma_contrato: form.firma_contrato, firma_pago: form.firma_pago,
      estatus: form.estatus, notas: form.notas.trim() || null,
    }
    let errG
    if (editandoId === null) {
      const { error: e } = await supabase.from('contratos').insert({ folio: folioNuevo, ...datos })
      errG = e
    } else {
      const { error: e } = await supabase.from('contratos').update(datos).eq('id', editandoId)
      errG = e
    }
    setGuardando(false)
    if (errG) { alert('Error: ' + errG.message); return }
    setModalAbierto(false)
    await cargar()
  }

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando contratos...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  const fmt = (n: number | null) => n != null ? '$' + n.toLocaleString('es-MX') : 'N/D'
  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5', fontFamily: 'Sora, sans-serif' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase' as const, marginBottom: '5px' }

  return (
    <div>
      <div className="flex justify-end" style={{ marginBottom: '14px' }}>
        <button onClick={abrirCrear} style={{ background: '#0C447C', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
          + Nuevo Contrato
        </button>
      </div>

      {contratos.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>📜</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>Sin contratos</h3>
          <p style={{ fontSize: '12px' }}>Cuando se genere un contrato desde un apartado confirmado, aparecerá aquí.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {contratos.map((c) => {
            const est = ESTATUS_MAP[c.estatus || ''] || { label: c.estatus || 'N/D', bg: '#F1F5F9', color: '#64748B' }
            return (
              <div key={c.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '14px 16px' }}>
                <div className="flex items-start justify-between" style={{ gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace' }}>{c.folio}</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#042C53' }}>{c.prospecto_id && mc[c.prospecto_id] ? mc[c.prospecto_id] : 'Cliente N/D'}</div>
                  </div>
                  <div className="flex" style={{ gap: '6px' }}>
                    <span style={{ fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: est.bg, color: est.color }}>{est.label}</span>
                    {c.tipo_contrato && <span style={{ fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: '#E6F1FB', color: '#0C447C' }}>{TIPOS[c.tipo_contrato] || c.tipo_contrato}</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#eef1f5', borderRadius: '7px', padding: '10px', marginBottom: '10px' }}>
                  <div><div style={{ fontSize: '9.5px', color: '#5d6b80', textTransform: 'uppercase' }}>Precio</div><div style={{ fontSize: '14px', fontWeight: 700, color: '#042C53', fontFamily: 'monospace', marginTop: '2px' }}>{fmt(c.precio)}</div></div>
                  <div><div style={{ fontSize: '9.5px', color: '#5d6b80', textTransform: 'uppercase' }}>Apartado</div><div style={{ fontSize: '14px', fontWeight: 700, color: '#042C53', fontFamily: 'monospace', marginTop: '2px' }}>{fmt(c.monto_apartado)}</div></div>
                  <div><div style={{ fontSize: '9.5px', color: '#5d6b80', textTransform: 'uppercase' }}>Plazo</div><div style={{ fontSize: '14px', fontWeight: 700, color: '#042C53', fontFamily: 'monospace', marginTop: '2px' }}>{c.plazo_semanas ? `${c.plazo_semanas} sem` : 'N/D'}</div></div>
                </div>

                {/* Estado de firma */}
                <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                  {[
                    { key: c.firma_notaria, label: 'Notaría' },
                    { key: c.firma_contrato, label: 'Firma' },
                    { key: c.firma_pago, label: 'Pago' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center" style={{ gap: '4px', fontSize: '11px', color: '#4a5a6e' }}>
                      <span>{FIRMA_ICON[f.key || 'pendiente'] || '⏳'}</span>
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>

                {c.garantia_id && mg[c.garantia_id] && <div style={{ fontSize: '11px', color: '#5d6b80', marginBottom: '10px' }}>🏠 {mg[c.garantia_id]}</div>}

                <button onClick={() => abrirEditar(c)} style={{ background: '#fff', color: '#0C447C', border: '1px solid #c8d0db', padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                  ✏️ Gestionar contrato
                </button>
              </div>
            )
          })}
        </div>
      )}

      {modalAbierto && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModalAbierto(false) }}
             style={{ position: 'fixed', inset: 0, background: 'rgba(4,44,83,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '14px 20px', borderRadius: '14px 14px 0 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{editandoId === null ? 'Nuevo Contrato' : 'Gestionar Contrato'} · {folioNuevo}</div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '7px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>

              {/* Vinculación */}
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0C447C', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>🔗 Vinculación</div>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Apartado (auto-rellena cliente y garantía)</label>
                <select value={form.apartado_id} onChange={(e) => seleccionarApartado(e.target.value)} style={inputStyle}>
                  <option value="">— Sin apartado / seleccionar —</option>
                  {apartados.map((a) => <option key={a.id} value={a.id}>{a.folio} · {a.prospecto_id && mc[a.prospecto_id] ? mc[a.prospecto_id] : ''}</option>)}
                </select>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Cliente DIIPA *</label>
                  <select value={form.prospecto_id} onChange={(e) => setForm({ ...form, prospecto_id: e.target.value })} style={inputStyle}>
                    <option value="">— Seleccionar —</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.folio} · {c.nombre}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Garantía</label>
                  <select value={form.garantia_id} onChange={(e) => setForm({ ...form, garantia_id: e.target.value })} style={inputStyle}>
                    <option value="">— Seleccionar —</option>
                    {garantias.map((g) => <option key={g.id} value={g.id}>{g.folio} · {g.direccion || ''}</option>)}
                  </select>
                </div>
              </div>

              {/* Tipo y operación */}
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0C447C', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '16px 0 10px' }}>📋 Datos del contrato</div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Tipo de contrato</label>
                  <select value={form.tipo_contrato} onChange={(e) => setForm({ ...form, tipo_contrato: e.target.value })} style={inputStyle}>
                    <option value="">— Seleccionar —</option>
                    {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Estatus</label>
                  <select value={form.estatus} onChange={(e) => setForm({ ...form, estatus: e.target.value })} style={inputStyle}>
                    <option value="borrador">Borrador</option>
                    <option value="firmado">Firmado</option>
                    <option value="vigente">Vigente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Precio ($)</label><input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Monto apartado ($)</label><input type="number" value={form.monto_apartado} onChange={(e) => setForm({ ...form, monto_apartado: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Plazo (semanas)</label><input type="number" value={form.plazo_semanas} onChange={(e) => setForm({ ...form, plazo_semanas: e.target.value })} style={inputStyle} /></div>
              </div>

              {/* Prestador */}
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0C447C', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '16px 0 10px' }}>🏢 Datos del prestador</div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Razón social</label><input value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Nombre comercial</label><input value={form.nombre_comercial} onChange={(e) => setForm({ ...form, nombre_comercial: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Apoderado</label><input value={form.apoderado} onChange={(e) => setForm({ ...form, apoderado: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>RFC prestador</label><input value={form.rfc_prestador} onChange={(e) => setForm({ ...form, rfc_prestador: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Notario</label><input value={form.notario} onChange={(e) => setForm({ ...form, notario: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>No. escritura</label><input value={form.escritura_num} onChange={(e) => setForm({ ...form, escritura_num: e.target.value })} style={inputStyle} /></div>
              </div>

              {/* Firma */}
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#0C447C', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '16px 0 10px' }}>✍️ Firma del contrato</div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Ciudad de firma</label><input value={form.ciudad_firma} onChange={(e) => setForm({ ...form, ciudad_firma: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Fecha de firma</label><input type="date" value={form.fecha_firma} onChange={(e) => setForm({ ...form, fecha_firma: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Jurisdicción</label><input value={form.jurisdiccion} onChange={(e) => setForm({ ...form, jurisdiccion: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ background: '#eef1f5', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#4a5a6e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Estado de la firma</div>
                <div className="flex" style={{ gap: '12px' }}>
                  {[
                    { key: 'firma_notaria', label: '🏛️ Notaría' },
                    { key: 'firma_contrato', label: '✍️ Firma' },
                    { key: 'firma_pago', label: '💰 Pago' },
                  ].map((f) => (
                    <div key={f.key} style={{ flex: 1 }}>
                      <label style={{ ...labelStyle, fontSize: '10px' }}>{f.label}</label>
                      <select value={form[f.key as keyof typeof form] as string} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} style={inputStyle}>
                        <option value="pendiente">⏳ Pendiente</option>
                        <option value="si">✅ Sí</option>
                        <option value="no">❌ No</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

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