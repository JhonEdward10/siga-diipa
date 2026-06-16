import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

type Evento = {
  id: number
  tipo: string | null
  titulo: string
  descripcion: string | null
  fecha: string
  hora: string | null
  area: string | null
  color: string | null
}

const TIPOS: Record<string, { label: string; color: string }> = {
  reunion: { label: '🤝 Reunión', color: '#185FA5' },
  llamada: { label: '☎️ Llamada', color: '#0F6E56' },
  vencimiento: { label: '⏰ Vencimiento', color: '#b91c1c' },
  tarea: { label: '✓ Tarea', color: '#854D0E' },
  otro: { label: '📌 Otro', color: '#5d6b80' },
}

export default function Agenda() {
  const { session, salir } = useAuth()
  const navigate = useNavigate()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [form, setForm] = useState({
    tipo: 'reunion', titulo: '', descripcion: '',
    fecha: new Date().toISOString().slice(0, 10), hora: '', area: '',
  })

  const email = session?.user.email || 'usuario'
  const nombre = email.split('@')[0].replace(/\./g, ' ').replace(/_/g, ' ')
    .split(' ').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')

  async function cargar() {
    const { data, error: err } = await supabase
      .from('eventos_calendario')
      .select('id, tipo, titulo, descripcion, fecha, hora, area, color')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true })
    if (err) { setError(err.message); setCargando(false); return }
    setEventos(data || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  function abrirCrear() {
    setEditandoId(null)
    setForm({ tipo: 'reunion', titulo: '', descripcion: '', fecha: new Date().toISOString().slice(0, 10), hora: '', area: '' })
    setModalAbierto(true)
  }

  function abrirEditar(e: Evento) {
    setEditandoId(e.id)
    setForm({
      tipo: e.tipo || 'reunion', titulo: e.titulo || '', descripcion: e.descripcion || '',
      fecha: e.fecha, hora: e.hora || '', area: e.area || '',
    })
    setModalAbierto(true)
  }

  async function guardar() {
    if (!form.titulo.trim()) { alert('El título es obligatorio'); return }
    if (!form.fecha) { alert('La fecha es obligatoria'); return }
    setGuardando(true)

    const datos = {
      tipo: form.tipo,
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || null,
      fecha: form.fecha,
      hora: form.hora || null,
      area: form.area.trim() || null,
      color: TIPOS[form.tipo]?.color || '#5d6b80',
      usuario_email: email,
    }

    let errGuardar
    if (editandoId === null) {
      const { error: e } = await supabase.from('eventos_calendario').insert(datos)
      errGuardar = e
    } else {
      const { error: e } = await supabase.from('eventos_calendario').update(datos).eq('id', editandoId)
      errGuardar = e
    }

    setGuardando(false)
    if (errGuardar) { alert('Error al guardar: ' + errGuardar.message); return }
    setModalAbierto(false)
    await cargar()
  }

  async function eliminar(id: number) {
    if (!confirm('¿Eliminar este evento?')) return
    const { error: e } = await supabase.from('eventos_calendario').delete().eq('id', id)
    if (e) { alert('Error: ' + e.message); return }
    await cargar()
  }

  async function manejarSalir() {
    if (confirm('¿Cerrar sesión?')) await salir()
  }

  // Agrupar eventos por fecha
  function agrupar(): Record<string, Evento[]> {
    const g: Record<string, Evento[]> = {}
    eventos.forEach((e) => {
      if (!g[e.fecha]) g[e.fecha] = []
      g[e.fecha].push(e)
    })
    return g
  }

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5', fontFamily: 'Sora, sans-serif' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase' as const, marginBottom: '5px' }

  const grupos = agrupar()
  const fechasOrdenadas = Object.keys(grupos).sort()

  return (
    <div style={{ fontFamily: 'Sora, sans-serif', background: '#f4f6f9', minHeight: '100vh', color: '#042C53' }}>
      {/* HEADER */}
      <header className="flex items-center justify-between sticky top-0 z-10"
              style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '14px 24px' }}>
        <div className="flex items-center" style={{ gap: '14px' }}>
          <div onClick={() => navigate('/')} className="flex items-center cursor-pointer" style={{ gap: '12px', padding: '4px 8px 4px 4px', borderRadius: '9px' }}>
            <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', background: '#5DCAA5', borderRadius: '9px', fontWeight: 500, fontSize: '15px', color: '#04342C' }}>D</div>
            <div style={{ fontSize: '10px', color: '#B5D4F4', letterSpacing: '0.6px', textTransform: 'uppercase' }}>← Menú</div>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 500 }}>Agenda y Calendario</h1>
            <div style={{ fontSize: '10.5px', color: '#B5D4F4', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '1px' }}>DIIPA S.A. de C.V.</div>
          </div>
        </div>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 500 }}>{nombre}</div>
            <div style={{ fontSize: '10px', color: '#B5D4F4' }}>{email}</div>
          </div>
          <button onClick={manejarSalir} style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '6px 12px', borderRadius: '7px', fontSize: '11.5px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1.75rem' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 500 }}>Próximos eventos</h2>
          <button onClick={abrirCrear} style={{ background: '#0C447C', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
            + Nuevo Evento
          </button>
        </div>

        {cargando ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando agenda...</div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>
        ) : eventos.length === 0 ? (
          <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
            <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>📅</div>
            <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>Sin eventos</h3>
            <p style={{ fontSize: '12px' }}>Crea el primero con el botón de arriba.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {fechasOrdenadas.map((fecha) => (
              <div key={fecha}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0C447C', marginBottom: '8px', textTransform: 'capitalize' }}>
                  {new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {grupos[fecha].map((e) => {
                    const t = TIPOS[e.tipo || ''] || TIPOS.otro
                    return (
                      <div key={e.id} className="flex items-start" style={{ background: '#fff', border: '0.5px solid #c8d0db', borderLeft: `3px solid ${e.color || t.color}`, borderRadius: '10px', padding: '12px 14px', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div className="flex items-center" style={{ gap: '8px', marginBottom: '3px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#042C53' }}>{e.titulo}</span>
                            <span style={{ fontSize: '9.5px', background: '#eef1f5', color: t.color, padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>{t.label}</span>
                          </div>
                          {e.hora && <div style={{ fontSize: '11px', color: '#5d6b80', fontFamily: 'monospace' }}>🕐 {e.hora.slice(0, 5)}</div>}
                          {e.descripcion && <div style={{ fontSize: '12px', color: '#4a5a6e', marginTop: '4px' }}>{e.descripcion}</div>}
                          {e.area && <div style={{ fontSize: '10.5px', color: '#5d6b80', marginTop: '4px' }}>📍 {e.area}</div>}
                        </div>
                        <div className="flex" style={{ gap: '6px' }}>
                          <button onClick={() => abrirEditar(e)} style={{ background: '#fff', color: '#0C447C', border: '1px solid #c8d0db', padding: '5px 10px', borderRadius: '6px', fontSize: '10.5px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>✏️</button>
                          <button onClick={() => eliminar(e.id)} style={{ background: '#fff', color: '#b91c1c', border: '1px solid #c8d0db', padding: '5px 10px', borderRadius: '6px', fontSize: '10.5px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>🗑️</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalAbierto && (
        <div onClick={(ev) => { if (ev.target === ev.currentTarget) setModalAbierto(false) }}
             style={{ position: 'fixed', inset: 0, background: 'rgba(4,44,83,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '14px 20px', borderRadius: '14px 14px 0 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{editandoId === null ? 'Nuevo Evento' : 'Editar Evento'}</div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '7px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} style={inputStyle}>
                  <option value="reunion">🤝 Reunión</option>
                  <option value="llamada">☎️ Llamada</option>
                  <option value="vencimiento">⏰ Vencimiento</option>
                  <option value="tarea">✓ Tarea</option>
                  <option value="otro">📌 Otro</option>
                </select>
              </div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Título *</label><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={inputStyle} /></div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Descripción</label><textarea value={form.descripcion} rows={2} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={inputStyle} /></div>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Fecha *</label><input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Hora</label><input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Área (opcional)</label><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Ej. Jurídico, Comercial..." style={inputStyle} /></div>

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