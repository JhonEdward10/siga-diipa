import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Bitacora from './Bitacora'

type Admin = { id: number; nombre: string }
type Negociacion = {
  id: number
  folio: string
  admin_id: number | null
  titulo: string
  descripcion: string | null
  estatus: string | null
  valor: number | null
  es_masa: boolean | null
  fecha_inicio: string | null
  fecha_cierre_estimada: string | null
}

const ESTATUS: Record<string, { label: string; bg: string; color: string }> = {
  pendiente: { label: 'Pendiente', bg: '#FEF3C7', color: '#92400e' },
  en_proceso: { label: 'En proceso', bg: '#DBEAFE', color: '#1E40AF' },
  cerrada: { label: 'Cerrada', bg: '#E1F5EE', color: '#04342C' },
  cancelada: { label: 'Cancelada', bg: '#F1F5F9', color: '#64748B' },
}

export default function Negociaciones() {
  const [negos, setNegos] = useState<Negociacion[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [bitacoraDe, setBitacoraDe] = useState<Negociacion | null>(null)
  const [folioNuevo, setFolioNuevo] = useState('')
  const [form, setForm] = useState({
    admin_id: '', titulo: '', descripcion: '', estatus: 'pendiente',
    valor: '', es_masa: false, fecha_inicio: '', fecha_cierre_estimada: '', terminos: '',
  })

  async function cargar() {
    const { data: neg, error: errNeg } = await supabase
      .from('admin_negociaciones')
      .select('id, folio, admin_id, titulo, descripcion, estatus, valor, es_masa, fecha_inicio, fecha_cierre_estimada')
      .eq('archivada', false)
      .order('folio', { ascending: true })

    if (errNeg) { setError(errNeg.message); setCargando(false); return }

    const { data: adm } = await supabase.from('administradoras').select('id, nombre')
    setAdmins(adm || [])
    setNegos(neg || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  function mapaAdmins(): Record<number, string> {
    const m: Record<number, string> = {}
    admins.forEach((a) => { m[a.id] = a.nombre })
    return m
  }

  async function generarFolio(): Promise<string> {
    const { data } = await supabase.from('admin_negociaciones').select('folio').like('folio', 'NEG-%')
    let max = 0
    ;(data || []).forEach((row) => {
      const num = parseInt((row.folio || '').replace(/\D/g, ''), 10)
      if (!isNaN(num) && num > max) max = num
    })
    return 'NEG-' + String(max + 1).padStart(4, '0')
  }

  async function abrirCrear() {
    const folio = await generarFolio()
    setEditandoId(null)
    setFolioNuevo(folio)
    setForm({ admin_id: '', titulo: '', descripcion: '', estatus: 'pendiente', valor: '', es_masa: false, fecha_inicio: '', fecha_cierre_estimada: '', terminos: '' })
    setModalAbierto(true)
  }

  function abrirEditar(n: Negociacion) {
    setEditandoId(n.id)
    setFolioNuevo(n.folio)
    setForm({
      admin_id: n.admin_id ? String(n.admin_id) : '',
      titulo: n.titulo || '',
      descripcion: n.descripcion || '',
      estatus: n.estatus || 'pendiente',
      valor: n.valor != null ? String(n.valor) : '',
      es_masa: n.es_masa || false,
      fecha_inicio: n.fecha_inicio || '',
      fecha_cierre_estimada: n.fecha_cierre_estimada || '',
      terminos: '',
    })
    setModalAbierto(true)
  }

  async function guardar() {
    if (!form.titulo.trim()) { alert('El título es obligatorio'); return }
    setGuardando(true)

    const datos = {
      admin_id: form.admin_id ? Number(form.admin_id) : null,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || null,
      estatus: form.estatus,
      valor: form.valor ? Number(form.valor) : null,
      es_masa: form.es_masa,
      fecha_inicio: form.fecha_inicio || null,
      fecha_cierre_estimada: form.fecha_cierre_estimada || null,
      terminos: form.terminos.trim() || null,
    }

    let errGuardar
    if (editandoId === null) {
      const { error: e } = await supabase.from('admin_negociaciones').insert({ folio: folioNuevo, ...datos })
      errGuardar = e
    } else {
      const { error: e } = await supabase.from('admin_negociaciones').update(datos).eq('id', editandoId)
      errGuardar = e
    }

    setGuardando(false)
    if (errGuardar) { alert('Error al guardar: ' + errGuardar.message); return }
    setModalAbierto(false)
    await cargar()
  }

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando negociaciones...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  const am = mapaAdmins()
  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5', fontFamily: 'Sora, sans-serif' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase' as const, marginBottom: '5px' }

  return (
    <div>
      <div className="flex justify-end" style={{ marginBottom: '14px' }}>
        <button onClick={abrirCrear} style={{ background: '#0C447C', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
          + Nueva Negociación
        </button>
      </div>

      {negos.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>🤝</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>Sin negociaciones</h3>
          <p style={{ fontSize: '12px' }}>Crea la primera con el botón de arriba.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {negos.map((n) => {
            const est = ESTATUS[n.estatus || ''] || { label: n.estatus || 'N/D', bg: '#F1F5F9', color: '#64748B' }
            return (
              <div key={n.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '14px 16px' }}>
                <div className="flex items-start justify-between" style={{ gap: '12px', marginBottom: '6px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{n.folio}</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#042C53' }}>{n.titulo}</div>
                  </div>
                  <span style={{ fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: est.bg, color: est.color, whiteSpace: 'nowrap' }}>{est.label}</span>
                </div>
                {n.descripcion && <div style={{ fontSize: '12px', color: '#4a5a6e', marginBottom: '10px', lineHeight: 1.5 }}>{n.descripcion}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#eef1f5', borderRadius: '7px', padding: '8px 10px', marginBottom: '10px' }}>
                  <div><div style={{ fontSize: '9.5px', color: '#5d6b80', textTransform: 'uppercase' }}>Administradora</div><div style={{ fontSize: '12px', fontWeight: 600, color: '#042C53', marginTop: '2px' }}>{n.admin_id && am[n.admin_id] ? am[n.admin_id] : 'N/D'}</div></div>
                  <div><div style={{ fontSize: '9.5px', color: '#5d6b80', textTransform: 'uppercase' }}>Valor</div><div style={{ fontSize: '12px', fontWeight: 600, color: '#042C53', marginTop: '2px' }}>{n.valor != null ? '$' + n.valor.toLocaleString('es-MX') : 'N/D'}</div></div>
                  <div><div style={{ fontSize: '9.5px', color: '#5d6b80', textTransform: 'uppercase' }}>Tipo</div><div style={{ fontSize: '12px', fontWeight: 600, color: '#042C53', marginTop: '2px' }}>{n.es_masa ? 'Masiva' : 'Individual'}</div></div>
                </div>
                <div className="flex" style={{ gap: '6px' }}>
                  <button onClick={() => abrirEditar(n)} style={{ background: '#fff', color: '#0C447C', border: '1px solid #c8d0db', padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => setBitacoraDe(n)} style={{ background: '#fff', color: '#0F6E56', border: '1px solid #c8d0db', padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
                    📋 Bitácora
                  </button>
                </div>
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
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{editandoId === null ? 'Nueva Negociación' : 'Editar Negociación'} · {folioNuevo}</div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '7px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Administradora</label>
                <select value={form.admin_id} onChange={(e) => setForm({ ...form, admin_id: e.target.value })} style={inputStyle}>
                  <option value="">— Selecciona —</option>
                  {admins.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Título *</label><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={inputStyle} /></div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Descripción</label><textarea value={form.descripcion} rows={3} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={inputStyle} /></div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Estatus</label>
                  <select value={form.estatus} onChange={(e) => setForm({ ...form, estatus: e.target.value })} style={inputStyle}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="cerrada">Cerrada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Valor (MXN)</label><input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#4a5a6e' }}>
                  <input type="checkbox" checked={form.es_masa} onChange={(e) => setForm({ ...form, es_masa: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                  Operación masiva
                </label>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Fecha inicio</label><input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Cierre estimado</label><input type="date" value={form.fecha_cierre_estimada} onChange={(e) => setForm({ ...form, fecha_cierre_estimada: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Términos</label><textarea value={form.terminos} rows={3} onChange={(e) => setForm({ ...form, terminos: e.target.value })} style={inputStyle} /></div>

              <div className="flex justify-end" style={{ gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '0.5px solid #dde3ea' }}>
                <button onClick={() => setModalAbierto(false)} style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: 'pointer', background: '#eef1f5', color: '#4a5a6e', border: '1px solid #c8d0db' }}>Cancelar</button>
                <button onClick={guardar} disabled={guardando} style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: guardando ? 'not-allowed' : 'pointer', background: '#0C447C', color: 'white', border: 'none', opacity: guardando ? 0.6 : 1 }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {bitacoraDe && (
        <Bitacora
          negociacionId={bitacoraDe.id}
          adminId={bitacoraDe.admin_id}
          tituloNego={bitacoraDe.folio + ' · ' + bitacoraDe.titulo}
          onCerrar={() => setBitacoraDe(null)}
        />
      )}
    </div>
  )
}