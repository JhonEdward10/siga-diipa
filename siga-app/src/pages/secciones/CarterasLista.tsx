import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Cartera = {
  id: number
  folio: string
  nombre: string
  tipo_origen: string | null
  estatus: string | null
  fecha_ingreso: string | null
  admin_id: number | null
}

type Admin = { id: number; nombre: string; estatus: string | null }

const TIPO_ORIGEN: Record<string, string> = { ADM: 'Administradora', PRO: 'Propia', EXT: 'Externa' }

export default function CarterasLista() {
  const [carteras, setCarteras] = useState<Cartera[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estado del formulario (modal)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [folioNuevo, setFolioNuevo] = useState('')
  const [form, setForm] = useState({
    nombre: '', admin_id: '', tipo_origen: 'ADM', estatus: 'activa',
    fecha_ingreso: new Date().toISOString().slice(0, 10), notas: '',
  })

  async function cargar() {
    const { data: cart, error: errCart } = await supabase
      .from('carteras')
      .select('id, folio, nombre, tipo_origen, estatus, fecha_ingreso, admin_id')
      .eq('archivada', false).eq('eliminada', false)
      .order('folio', { ascending: true })

    if (errCart) { setError(errCart.message); setCargando(false); return }

    const { data: adm } = await supabase.from('administradoras').select('id, nombre, estatus')
    setAdmins(adm || [])
    setCarteras(cart || [])
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  function mapaAdmins(): Record<number, string> {
    const m: Record<number, string> = {}
    admins.forEach((a) => { m[a.id] = a.nombre })
    return m
  }

  // Genera el siguiente folio CAR-XXXX
  async function generarFolio(): Promise<string> {
    const { data } = await supabase
      .from('carteras')
      .select('folio')
      .like('folio', 'CAR-%')

    let max = 0
    ;(data || []).forEach((row) => {
      // Saca solo los números del folio, sin importar cuántos dígitos tenga
      const num = parseInt((row.folio || '').replace(/\D/g, ''), 10)
      if (!isNaN(num) && num > max) max = num
    })

    return 'CAR-' + String(max + 1).padStart(4, '0')
  }
  
  async function abrirModal() {
    const folio = await generarFolio()
    setFolioNuevo(folio)
    setForm({ nombre: '', admin_id: '', tipo_origen: 'ADM', estatus: 'activa', fecha_ingreso: new Date().toISOString().slice(0, 10), notas: '' })
    setModalAbierto(true)
  }

  async function guardar() {
    if (!form.nombre.trim()) { alert('El nombre de la cartera es obligatorio'); return }
    setGuardando(true)

    const { error: errIns } = await supabase.from('carteras').insert({
      folio: folioNuevo,
      nombre: form.nombre.trim(),
      admin_id: form.admin_id ? Number(form.admin_id) : null,
      tipo_origen: form.tipo_origen,
      estatus: form.estatus,
      fecha_ingreso: form.fecha_ingreso || null,
      notas: form.notas.trim() || null,
    })

    setGuardando(false)
    if (errIns) { alert('Error al guardar: ' + errIns.message); return }

    setModalAbierto(false)
    await cargar() // recarga la lista
  }

  if (cargando) return <div style={{ padding: '2rem', textAlign: 'center', color: '#5d6b80' }}>Cargando carteras...</div>
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c' }}>Error: {error}</div>

  const am = mapaAdmins()

  return (
    <div>
      {/* Botón nueva cartera */}
      <div className="flex justify-end" style={{ marginBottom: '14px' }}>
        <button onClick={abrirModal}
                style={{ background: '#0C447C', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer' }}>
          + Nueva Cartera
        </button>
      </div>

      {/* Lista de carteras */}
      {carteras.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px', opacity: 0.5 }}>📂</div>
          <h3 style={{ fontSize: '15px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>Sin carteras</h3>
          <p style={{ fontSize: '12px' }}>Crea la primera con el botón de arriba.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {carteras.map((c) => (
            <div key={c.id} style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="flex items-start justify-between" style={{ gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#5d6b80', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{c.folio}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#042C53' }}>{c.nombre}</div>
                </div>
                <span style={{
                  fontSize: '9.5px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase',
                  background: c.estatus === 'activa' ? '#E1F5EE' : '#F1F5F9',
                  color: c.estatus === 'activa' ? '#04342C' : '#64748B',
                }}>{c.estatus || 'N/D'}</span>
              </div>
              <div style={{ background: '#eef1f5', borderRadius: '6px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#4a5a6e' }}>
                <div>🏦 {c.admin_id && am[c.admin_id] ? am[c.admin_id] : 'Sin administradora'}</div>
                <div>📋 Origen: {TIPO_ORIGEN[c.tipo_origen || ''] || c.tipo_origen || 'N/D'}</div>
                {c.fecha_ingreso && <div>📅 Ingreso: {new Date(c.fecha_ingreso).toLocaleDateString('es-MX')}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORMULARIO */}
      {modalAbierto && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModalAbierto(false) }}
             style={{ position: 'fixed', inset: 0, background: 'rgba(4,44,83,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between"
                 style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '14px 20px', borderRadius: '14px 14px 0 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>Nueva Cartera</div>
              <button onClick={() => setModalAbierto(false)}
                      style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '7px', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase', marginBottom: '5px' }}>Folio</label>
                  <input value={folioNuevo} readOnly
                         style={{ width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#F1F5F9', color: '#5d6b80', fontFamily: 'monospace', fontWeight: 600 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase', marginBottom: '5px' }}>Estatus</label>
                  <select value={form.estatus} onChange={(e) => setForm({ ...form, estatus: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5' }}>
                    <option value="activa">Activa</option>
                    <option value="cerrada">Cerrada</option>
                    <option value="archivada">Archivada</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase', marginBottom: '5px' }}>Nombre de la cartera *</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Lote PENDULUM Q1 2026"
                       style={{ width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5' }} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase', marginBottom: '5px' }}>Administradora origen</label>
                <select value={form.admin_id} onChange={(e) => setForm({ ...form, admin_id: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5' }}>
                  <option value="">— Sin administradora —</option>
                  {admins.filter((a) => a.estatus === 'activa').map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex" style={{ gap: '12px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase', marginBottom: '5px' }}>Tipo de origen</label>
                  <select value={form.tipo_origen} onChange={(e) => setForm({ ...form, tipo_origen: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5' }}>
                    <option value="ADM">Administradora</option>
                    <option value="PRO">Propia</option>
                    <option value="EXT">Externa</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase', marginBottom: '5px' }}>Fecha de ingreso</label>
                  <input type="date" value={form.fecha_ingreso} onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })}
                         style={{ width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5' }} />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#4a5a6e', textTransform: 'uppercase', marginBottom: '5px' }}>Notas</label>
                <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} rows={3}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #c8d0db', borderRadius: '7px', fontSize: '13px', background: '#eef1f5', fontFamily: 'Sora, sans-serif' }} />
              </div>

              <div className="flex justify-end" style={{ gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '0.5px solid #dde3ea' }}>
                <button onClick={() => setModalAbierto(false)}
                        style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: 'pointer', background: '#eef1f5', color: '#4a5a6e', border: '1px solid #c8d0db' }}>
                  Cancelar
                </button>
                <button onClick={guardar} disabled={guardando}
                        style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: guardando ? 'not-allowed' : 'pointer', background: '#0C447C', color: 'white', border: 'none', opacity: guardando ? 0.6 : 1 }}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}