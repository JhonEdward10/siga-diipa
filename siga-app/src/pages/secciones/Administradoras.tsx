import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Administradora = {
  id: number
  folio: string
  nombre: string
  estatus: string | null
  contacto_nombre: string | null
  contacto_cargo: string | null
  contacto_telefono: string | null
  contacto_whatsapp: string | null
  contacto_email: string | null
  domicilio: string | null
  rfc: string | null
  notas_internas: string | null
}

export default function Administradoras() {
  const [admins, setAdmins] = useState<Administradora[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [folioNuevo, setFolioNuevo] = useState('')
  const [form, setForm] = useState({
    nombre: '', estatus: 'activa', contacto_nombre: '', contacto_cargo: '',
    contacto_telefono: '', contacto_whatsapp: '', contacto_email: '',
    domicilio: '', rfc: '', notas_internas: '',
  })

  async function cargar() {
    const { data, error: err } = await supabase
      .from('administradoras')
      .select('id, folio, nombre, estatus, contacto_nombre, contacto_cargo, contacto_telefono, contacto_whatsapp, contacto_email, domicilio, rfc, notas_internas')
      .order('folio', { ascending: true })
    if (err) { setError(err.message); setCargando(false); return }
    setAdmins(data || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  async function generarFolio(): Promise<string> {
    const { data } = await supabase.from('administradoras').select('folio').like('folio', 'ADM-%')
    let max = 0
    ;(data || []).forEach((row) => {
      const num = parseInt((row.folio || '').replace(/\D/g, ''), 10)
      if (!isNaN(num) && num > max) max = num
    })
    return 'ADM-' + String(max + 1).padStart(3, '0')
  }

  async function abrirCrear() {
    const folio = await generarFolio()
    setEditandoId(null)
    setFolioNuevo(folio)
    setForm({ nombre: '', estatus: 'activa', contacto_nombre: '', contacto_cargo: '', contacto_telefono: '', contacto_whatsapp: '', contacto_email: '', domicilio: '', rfc: '', notas_internas: '' })
    setModalAbierto(true)
  }

  function abrirEditar(a: Administradora) {
    setEditandoId(a.id)
    setFolioNuevo(a.folio)
    setForm({
      nombre: a.nombre || '', estatus: a.estatus || 'activa',
      contacto_nombre: a.contacto_nombre || '', contacto_cargo: a.contacto_cargo || '',
      contacto_telefono: a.contacto_telefono || '', contacto_whatsapp: a.contacto_whatsapp || '',
      contacto_email: a.contacto_email || '', domicilio: a.domicilio || '',
      rfc: a.rfc || '', notas_internas: a.notas_internas || '',
    })
    setModalAbierto(true)
  }

  async function guardar() {
    if (!form.nombre.trim()) { alert('El nombre / razón social es obligatorio'); return }
    setGuardando(true)

    const datos = {
      nombre: form.nombre.trim(), estatus: form.estatus,
      contacto_nombre: form.contacto_nombre.trim() || null,
      contacto_cargo: form.contacto_cargo.trim() || null,
      contacto_telefono: form.contacto_telefono.trim() || null,
      contacto_whatsapp: form.contacto_whatsapp.trim() || null,
      contacto_email: form.contacto_email.trim() || null,
      domicilio: form.domicilio.trim() || null,
      rfc: form.rfc.trim() || null,
      notas_internas: form.notas_internas.trim() || null,
    }

    let errGuardar
    if (editandoId === null) {
      const { error: e } = await supabase.from('administradoras').insert({ folio: folioNuevo, ...datos })
      errGuardar = e
    } else {
      const { error: e } = await supabase.from('administradoras').update(datos).eq('id', editandoId)
      errGuardar = e
    }

    setGuardando(false)
    if (errGuardar) { alert('Error al guardar: ' + errGuardar.message); return }
    setModalAbierto(false)
    await cargar()
  }

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando administradoras...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  const total = admins.length
  const activas = admins.filter((a) => a.estatus === 'activa').length
  const inactivas = admins.filter((a) => a.estatus === 'inactiva').length

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5', fontFamily: 'Sora, sans-serif' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase' as const, marginBottom: '5px' }

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { num: total, label: 'Total', bg: '#E6F1FB', color: '#0C447C', ico: '🏦' },
          { num: activas, label: 'Activas', bg: '#E1F5EE', color: '#0F6E56', ico: '✓' },
          { num: inactivas, label: 'Inactivas', bg: '#F1F5F9', color: '#64748B', ico: '⏸' },
          { num: total, label: 'Registradas', bg: '#FEF9C3', color: '#854D0E', ico: '📋' },
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

      <div className="flex items-center" style={{ gap: '12px', marginBottom: '14px' }}>
        <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="🔍 Buscar por nombre, folio o contacto..."
               style={{ flex: 1, padding: '9px 14px', border: '1px solid #c8d0db', borderRadius: '8px', fontSize: '12.5px', background: '#fff', fontFamily: 'Sora, sans-serif' }} />
        <button onClick={abrirCrear} style={{ background: '#0C447C', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          + Nueva Administradora
        </button>
      </div>

      {admins.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>🏦</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>Sin administradoras</h3>
          <p style={{ fontSize: '12px' }}>Crea la primera con el botón de arriba.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '14px' }}>
          {admins.filter((a) =>
            !filtro ||
            a.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
            (a.folio || '').toLowerCase().includes(filtro.toLowerCase()) ||
            (a.contacto_nombre || '').toLowerCase().includes(filtro.toLowerCase())
          ).map((a) => (
            <div key={a.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="flex items-start" style={{ gap: '10px' }}>
                <div className="flex items-center justify-center" style={{ width: '38px', height: '38px', borderRadius: '9px', background: '#E6F1FB', color: '#0C447C', fontSize: '17px', flexShrink: 0 }}>🏦</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{a.folio}</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#042C53', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.nombre}</div>
                </div>
                <span style={{ fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', background: a.estatus === 'activa' ? '#E1F5EE' : '#F1F5F9', color: a.estatus === 'activa' ? '#04342C' : '#64748B' }}>{a.estatus || 'N/D'}</span>
              </div>
              <div style={{ background: '#eef1f5', borderRadius: '7px', padding: '9px 11px', fontSize: '11px', color: '#4a5a6e', display: 'flex', flexDirection: 'column', gap: '3px', minHeight: '44px' }}>
                {a.contacto_nombre ? (
                  <>
                    <div>👤 {a.contacto_nombre}</div>
                    {a.contacto_telefono && <div>📞 {a.contacto_telefono}</div>}
                    {a.contacto_email && <div>✉️ {a.contacto_email}</div>}
                  </>
                ) : (<div style={{ textAlign: 'center', color: '#92400e' }}>Sin contacto registrado</div>)}
              </div>
              <button onClick={() => abrirEditar(a)} style={{ background: '#fff', color: '#0C447C', border: '1px solid #c8d0db', padding: '7px', borderRadius: '7px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
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
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{editandoId === null ? 'Nueva Administradora' : 'Editar Administradora'}</div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '7px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Folio</label><input value={folioNuevo} readOnly style={{ ...inputStyle, background: '#F1F5F9', color: '#5d6b80', fontFamily: 'monospace', fontWeight: 600 }} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Estatus</label>
                  <select value={form.estatus} onChange={(e) => setForm({ ...form, estatus: e.target.value })} style={inputStyle}>
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Nombre / Razón social *</label><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} /></div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Persona de contacto</label><input value={form.contacto_nombre} onChange={(e) => setForm({ ...form, contacto_nombre: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Cargo</label><input value={form.contacto_cargo} onChange={(e) => setForm({ ...form, contacto_cargo: e.target.value })} style={inputStyle} /></div>
              </div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Teléfono</label><input value={form.contacto_telefono} onChange={(e) => setForm({ ...form, contacto_telefono: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>WhatsApp</label><input value={form.contacto_whatsapp} onChange={(e) => setForm({ ...form, contacto_whatsapp: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Email</label><input value={form.contacto_email} onChange={(e) => setForm({ ...form, contacto_email: e.target.value })} style={inputStyle} /></div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Domicilio</label><input value={form.domicilio} onChange={(e) => setForm({ ...form, domicilio: e.target.value })} style={inputStyle} /></div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>RFC</label><input value={form.rfc} maxLength={13} onChange={(e) => setForm({ ...form, rfc: e.target.value })} style={inputStyle} /></div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Notas internas</label><textarea value={form.notas_internas} rows={3} onChange={(e) => setForm({ ...form, notas_internas: e.target.value })} style={inputStyle} /></div>

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