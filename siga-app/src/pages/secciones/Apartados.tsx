import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Apartado = {
  id: number
  folio: string | null
  prospecto_id: number | null
  garantia_id: number | null
  monto_apartado: number | null
  fecha_apartado: string | null
  estatus: string | null
  kyc_completado: boolean | null
  pld_completado: boolean | null
  comprobante_subido: boolean | null
}

type Cliente = { id: number; nombre: string; folio: string | null }
type Garantia = { id: number; folio: string; direccion: string | null }

const ESTATUS: Record<string, { label: string; bg: string; color: string }> = {
  solicitado: { label: 'Solicitado', bg: '#FEF9C3', color: '#854D0E' },
  pagado: { label: 'Pagado', bg: '#DBEAFE', color: '#1E40AF' },
  confirmado: { label: 'Confirmado', bg: '#E1F5EE', color: '#04342C' },
  cancelado: { label: 'Cancelado', bg: '#F1F5F9', color: '#64748B' },
}

export default function Apartados() {
  const [apartados, setApartados] = useState<Apartado[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [garantias, setGarantias] = useState<Garantia[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [folioNuevo, setFolioNuevo] = useState('')
  const [form, setForm] = useState({
    prospecto_id: '', garantia_id: '', monto_apartado: '',
    fecha_apartado: new Date().toISOString().slice(0, 10), estatus: 'solicitado',
    kyc_completado: false, pld_completado: false, comprobante_subido: false, notas: '',
  })

  async function cargar() {
    const { data: apt, error: errApt } = await supabase
      .from('apartados')
      .select('id, folio, prospecto_id, garantia_id, monto_apartado, fecha_apartado, estatus, kyc_completado, pld_completado, comprobante_subido')
      .order('id', { ascending: false })
    if (errApt) { setError(errApt.message); setCargando(false); return }

    // Solo clientes DIIPA (prospectos en estatus cliente)
    const { data: cli } = await supabase.from('prospectos').select('id, nombre, folio').eq('estatus', 'cliente')
    const { data: gar } = await supabase.from('garantias').select('id, folio, direccion').eq('eliminada', false)

    setClientes(cli || [])
    setGarantias(gar || [])
    setApartados(apt || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  function mapaClientes(): Record<number, string> {
    const m: Record<number, string> = {}
    clientes.forEach((c) => { m[c.id] = c.nombre })
    return m
  }
  function mapaGarantias(): Record<number, string> {
    const m: Record<number, string> = {}
    garantias.forEach((g) => { m[g.id] = `${g.folio} · ${g.direccion || ''}` })
    return m
  }

  async function generarFolio(): Promise<string> {
    const { data } = await supabase.from('apartados').select('folio').like('folio', 'APT-%')
    let max = 0
    ;(data || []).forEach((row) => {
      const num = parseInt((row.folio || '').replace(/\D/g, ''), 10)
      if (!isNaN(num) && num > max) max = num
    })
    return 'APT-' + String(max + 1).padStart(4, '0')
  }

  async function abrirCrear() {
    if (clientes.length === 0) { alert('Primero necesitas al menos un Cliente DIIPA (un prospecto en etapa 5).'); return }
    const folio = await generarFolio()
    setEditandoId(null)
    setFolioNuevo(folio)
    setForm({ prospecto_id: '', garantia_id: '', monto_apartado: '', fecha_apartado: new Date().toISOString().slice(0, 10), estatus: 'solicitado', kyc_completado: false, pld_completado: false, comprobante_subido: false, notas: '' })
    setModalAbierto(true)
  }

  async function abrirEditar(a: Apartado) {
    const { data } = await supabase.from('apartados').select('*').eq('id', a.id).single()
    if (!data) return
    setEditandoId(a.id)
    setFolioNuevo(data.folio || '')
    setForm({
      prospecto_id: data.prospecto_id ? String(data.prospecto_id) : '',
      garantia_id: data.garantia_id ? String(data.garantia_id) : '',
      monto_apartado: data.monto_apartado != null ? String(data.monto_apartado) : '',
      fecha_apartado: data.fecha_apartado || new Date().toISOString().slice(0, 10),
      estatus: data.estatus || 'solicitado',
      kyc_completado: data.kyc_completado || false,
      pld_completado: data.pld_completado || false,
      comprobante_subido: data.comprobante_subido || false,
      notas: data.notas || '',
    })
    setModalAbierto(true)
  }

  async function guardar() {
    if (!form.prospecto_id) { alert('Selecciona el cliente'); return }
    if (!form.garantia_id) { alert('Selecciona la garantía a apartar'); return }
    setGuardando(true)

    const datos = {
      prospecto_id: Number(form.prospecto_id),
      garantia_id: Number(form.garantia_id),
      monto_apartado: form.monto_apartado ? Number(form.monto_apartado) : 0,
      fecha_apartado: form.fecha_apartado || null,
      estatus: form.estatus,
      kyc_completado: form.kyc_completado,
      pld_completado: form.pld_completado,
      comprobante_subido: form.comprobante_subido,
      notas: form.notas.trim() || null,
    }

    let errGuardar
    if (editandoId === null) {
      const { error: e } = await supabase.from('apartados').insert({ folio: folioNuevo, ...datos })
      errGuardar = e
    } else {
      const { error: e } = await supabase.from('apartados').update(datos).eq('id', editandoId)
      errGuardar = e
    }

    setGuardando(false)
    if (errGuardar) { alert('Error al guardar: ' + errGuardar.message); return }
    setModalAbierto(false)
    await cargar()
  }

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando apartados...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  const mc = mapaClientes()
  const mg = mapaGarantias()
  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5', fontFamily: 'Sora, sans-serif' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase' as const, marginBottom: '5px' }

  // Progreso de requisitos
  function progresoReq(a: Apartado): number {
    let n = 0
    if (a.kyc_completado) n++
    if (a.pld_completado) n++
    if (a.comprobante_subido) n++
    return Math.round((n / 3) * 100)
  }

  return (
    <div>
      <div className="flex justify-end" style={{ marginBottom: '14px' }}>
        <button onClick={abrirCrear} style={{ background: '#0C447C', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
          + Nuevo Apartado
        </button>
      </div>

      {apartados.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>🔑</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>Sin apartados</h3>
          <p style={{ fontSize: '12px' }}>Cuando un Cliente DIIPA aparte una propiedad, aparecerá aquí.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {apartados.map((a) => {
            const est = ESTATUS[a.estatus || ''] || { label: a.estatus || 'N/D', bg: '#F1F5F9', color: '#64748B' }
            const prog = progresoReq(a)
            return (
              <div key={a.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '14px 16px' }}>
                <div className="flex items-start justify-between" style={{ gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{a.folio}</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#042C53' }}>{a.prospecto_id && mc[a.prospecto_id] ? mc[a.prospecto_id] : 'Cliente N/D'}</div>
                  </div>
                  <span style={{ fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: est.bg, color: est.color, whiteSpace: 'nowrap' }}>{est.label}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', background: '#eef1f5', borderRadius: '7px', padding: '8px 10px', marginBottom: '10px' }}>
                  <div><div style={{ fontSize: '9.5px', color: '#5d6b80', textTransform: 'uppercase' }}>Propiedad</div><div style={{ fontSize: '11.5px', fontWeight: 600, color: '#042C53', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.garantia_id && mg[a.garantia_id] ? mg[a.garantia_id] : 'N/D'}</div></div>
                  <div><div style={{ fontSize: '9.5px', color: '#5d6b80', textTransform: 'uppercase' }}>Monto apartado</div><div style={{ fontSize: '12.5px', fontWeight: 600, color: '#042C53', marginTop: '2px' }}>{a.monto_apartado != null ? '$' + a.monto_apartado.toLocaleString('es-MX') : 'N/D'}</div></div>
                </div>
                {/* Requisitos */}
                <div style={{ marginBottom: '10px' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '10.5px', color: '#5d6b80', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Requisitos (KYC · PLD · Comprobante)</span>
                    <span style={{ fontSize: '11px', color: '#5d6b80', fontFamily: 'monospace' }}>{prog}%</span>
                  </div>
                  <div style={{ background: '#eef1f5', borderRadius: '20px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ background: prog === 100 ? '#1D9E75' : '#185FA5', height: '100%', width: `${prog}%`, borderRadius: '20px' }} />
                  </div>
                </div>
                <button onClick={() => abrirEditar(a)} style={{ background: '#fff', color: '#0C447C', border: '1px solid #c8d0db', padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                  ✏️ Gestionar apartado
                </button>
              </div>
            )
          })}
        </div>
      )}

      {modalAbierto && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModalAbierto(false) }}
             style={{ position: 'fixed', inset: 0, background: 'rgba(4,44,83,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '14px 20px', borderRadius: '14px 14px 0 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{editandoId === null ? 'Nuevo Apartado' : 'Gestionar Apartado'} · {folioNuevo}</div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '7px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Cliente DIIPA *</label>
                <select value={form.prospecto_id} onChange={(e) => setForm({ ...form, prospecto_id: e.target.value })} style={inputStyle}>
                  <option value="">— Selecciona cliente —</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.folio} · {c.nombre}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Propiedad a apartar *</label>
                <select value={form.garantia_id} onChange={(e) => setForm({ ...form, garantia_id: e.target.value })} style={inputStyle}>
                  <option value="">— Selecciona garantía —</option>
                  {garantias.map((g) => <option key={g.id} value={g.id}>{g.folio} · {g.direccion || ''}</option>)}
                </select>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Monto apartado ($)</label><input type="number" value={form.monto_apartado} onChange={(e) => setForm({ ...form, monto_apartado: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Fecha</label><input type="date" value={form.fecha_apartado} onChange={(e) => setForm({ ...form, fecha_apartado: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Estatus</label>
                <select value={form.estatus} onChange={(e) => setForm({ ...form, estatus: e.target.value })} style={inputStyle}>
                  <option value="solicitado">Solicitado</option>
                  <option value="pagado">Pagado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {/* Checklist de requisitos */}
              <div style={{ background: '#eef1f5', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#4a5a6e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Requisitos del apartado</div>
                {[
                  { key: 'kyc_completado', label: '🪪 Formato KYC completado' },
                  { key: 'pld_completado', label: '🛡️ Formato AML/PLD completado' },
                  { key: 'comprobante_subido', label: '📄 Comprobante de pago subido' },
                ].map((req) => (
                  <label key={req.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#4a5a6e', padding: '4px 0' }}>
                    <input type="checkbox" checked={form[req.key as keyof typeof form] as boolean}
                           onChange={(e) => setForm({ ...form, [req.key]: e.target.checked })}
                           style={{ width: '16px', height: '16px' }} />
                    {req.label}
                  </label>
                ))}
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