import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Nota = {
  id: number
  tipo: string | null
  titulo: string
  comentario: string | null
  siguiente_accion: string | null
  estatus: string | null
  fecha_evento: string | null
}

const TIPOS: Record<string, string> = {
  correo: '✉️ Correo', llamada: '☎️ Llamada', whatsapp: '💬 WhatsApp',
  reunion: '🤝 Reunión', nota: '📝 Nota interna',
}

type Props = {
  negociacionId: number
  adminId: number | null
  tituloNego: string
  onCerrar: () => void
}

export default function Bitacora({ negociacionId, adminId, tituloNego, onCerrar }: Props) {
  const [notas, setNotas] = useState<Nota[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    tipo: 'llamada', titulo: '', comentario: '', siguiente_accion: '',
    estatus: 'terminada', fecha_evento: '',
  })

  async function cargar() {
    const { data } = await supabase
      .from('admin_bitacora')
      .select('id, tipo, titulo, comentario, siguiente_accion, estatus, fecha_evento')
      .eq('negociacion_id', negociacionId)
      .order('fecha_evento', { ascending: false })
    setNotas(data || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  async function guardar() {
    if (!form.titulo.trim()) { alert('El asunto/título es obligatorio'); return }
    setGuardando(true)

    const { error } = await supabase.from('admin_bitacora').insert({
      negociacion_id: negociacionId,
      admin_id: adminId,
      tipo: form.tipo,
      titulo: form.titulo.trim(),
      comentario: form.comentario.trim() || null,
      siguiente_accion: form.siguiente_accion.trim() || null,
      estatus: form.estatus,
      fecha_evento: form.fecha_evento || new Date().toISOString(),
    })

    setGuardando(false)
    if (error) { alert('Error al guardar: ' + error.message); return }

    setForm({ tipo: 'llamada', titulo: '', comentario: '', siguiente_accion: '', estatus: 'terminada', fecha_evento: '' })
    await cargar()
  }

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5', fontFamily: 'Sora, sans-serif' }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase' as const, marginBottom: '5px' }

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onCerrar() }}
         style={{ position: 'fixed', inset: 0, background: 'rgba(4,44,83,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '14px 20px', borderRadius: '14px 14px 0 0' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>Bitácora</div>
            <div style={{ fontSize: '11px', color: '#B5D4F4', marginTop: '2px' }}>{tituloNego}</div>
          </div>
          <button onClick={onCerrar} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '7px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Formulario de nueva nota */}
          <div style={{ background: '#eef1f5', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#042C53', marginBottom: '10px' }}>➕ Agregar nota</div>
            <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} style={inputStyle}>
                  <option value="correo">✉️ Correo</option>
                  <option value="llamada">☎️ Llamada</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="reunion">🤝 Reunión</option>
                  <option value="nota">📝 Nota interna</option>
                </select>
              </div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Estatus</label>
                <select value={form.estatus} onChange={(e) => setForm({ ...form, estatus: e.target.value })} style={inputStyle}>
                  <option value="terminada">Terminada</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="hecha">Hecha</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Asunto / Título *</label><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={inputStyle} /></div>
            <div style={{ marginBottom: '10px' }}><label style={labelStyle}>Comentario</label><textarea value={form.comentario} rows={2} onChange={(e) => setForm({ ...form, comentario: e.target.value })} style={inputStyle} /></div>
            <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}><label style={labelStyle}>Siguiente acción</label><input value={form.siguiente_accion} onChange={(e) => setForm({ ...form, siguiente_accion: e.target.value })} style={inputStyle} /></div>
              <div style={{ flex: 1 }}><label style={labelStyle}>Fecha y hora</label><input type="datetime-local" value={form.fecha_evento} onChange={(e) => setForm({ ...form, fecha_evento: e.target.value })} style={inputStyle} /></div>
            </div>
            <div className="flex justify-end">
              <button onClick={guardar} disabled={guardando} style={{ background: '#0C447C', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '7px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.6 : 1 }}>
                {guardando ? 'Guardando...' : 'Guardar nota'}
              </button>
            </div>
          </div>

          {/* Lista de notas */}
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#5d6b80', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Historial</div>
          {cargando ? (
            <div style={{ textAlign: 'center', color: '#5d6b80', padding: '1rem' }}>Cargando...</div>
          ) : notas.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#5d6b80', padding: '2rem', fontSize: '12px' }}>Aún no hay notas en esta negociación.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notas.map((n) => (
                <div key={n.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '12px 14px' }}>
                  <div className="flex items-start justify-between" style={{ gap: '8px', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#042C53' }}>{n.titulo}</div>
                    <span style={{ fontSize: '9.5px', background: '#E6F1FB', color: '#0C447C', padding: '2px 7px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap' }}>{TIPOS[n.tipo || ''] || n.tipo}</span>
                  </div>
                  {n.fecha_evento && <div style={{ fontSize: '10.5px', color: '#5d6b80', fontFamily: 'monospace', marginBottom: '6px' }}>{new Date(n.fecha_evento).toLocaleString('es-MX')}</div>}
                  {n.comentario && <div style={{ fontSize: '12px', color: '#4a5a6e', marginBottom: '6px', lineHeight: 1.5 }}>{n.comentario}</div>}
                  {n.siguiente_accion && <div style={{ background: '#FEF9C3', color: '#854D0E', fontSize: '11.5px', padding: '6px 10px', borderRadius: '6px' }}>➡️ {n.siguiente_accion}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}