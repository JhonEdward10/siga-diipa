import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
 
/* ════════════════════════════════════════════════════════════════════
   MODAL ETAPA 1 → 2 · Agendar cita + vincular garantías
   Migrado de prosModalAvanzarEtapa2 (legacy SIGA-DIIPA)
   Doble función: AVANZAR (etapa 1) o EDITAR vínculos (etapa >= 2)
   ════════════════════════════════════════════════════════════════════ */
 
type GarantiaDisponible = {
  id: number
  folio: string
  tipo_caso: string | null
  direccion: string | null
  m2_terreno: number | null
  m2_construccion: number | null
  precio_piso: number | null
  valor_estimado: number | null
}
 
type Props = {
  prospectoId: number
  prospectoNombre: string
  etapaActual: number
  abierto: boolean
  onCerrar: () => void
  onGuardado: () => void
}
 
export default function ModalAvanzarEtapa2({
  prospectoId,
  prospectoNombre,
  etapaActual,
  abierto,
  onCerrar,
  onGuardado,
}: Props) {
  const esEdicion = etapaActual >= 2
 
  const [disponibles, setDisponibles] = useState<GarantiaDisponible[]>([])
  const [seleccionadas, setSeleccionadas] = useState<number[]>([])
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
 
  // Fecha mínima = hoy · default = mañana (igual que el legacy)
  const hoy = new Date()
  const manana = new Date()
  manana.setDate(hoy.getDate() + 1)
  const minDate = hoy.toISOString().slice(0, 10)
  const defaultDate = manana.toISOString().slice(0, 10)
 
  const [fecha, setFecha] = useState(defaultDate)
  const [hora, setHora] = useState('10:00')
  const [lugar, setLugar] = useState('')
 
  useEffect(() => {
    if (!abierto) return
    cargarDatos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, prospectoId])
 
  async function cargarDatos() {
    setCargando(true)
 
    // 1. Garantías disponibles = publicadas en catálogo y no eliminadas
    //    (equivalente al _getGarantiasDisponibles() del legacy)
    const { data: gar } = await supabase
      .from('garantias')
      .select('id, folio, tipo_caso, direccion, m2_terreno, m2_construccion, precio_piso, valor_estimado')
      .eq('publicado_catalogo', true)
      .eq('eliminada', false)
      .order('folio', { ascending: true })
 
    // 2. Garantías ya vinculadas a este prospecto (para pre-marcarlas)
    const { data: vinc } = await supabase
      .from('prospecto_garantias')
      .select('garantia_id')
      .eq('prospecto_id', prospectoId)
 
    setDisponibles((gar as GarantiaDisponible[]) || [])
    setSeleccionadas((vinc || []).map((v) => v.garantia_id as number))
    setCargando(false)
  }
 
  function toggle(gid: number) {
    setSeleccionadas((prev) =>
      prev.includes(gid) ? prev.filter((x) => x !== gid) : [...prev, gid],
    )
  }
 
  async function guardar() {
    if (!fecha) { alert('⚠ La fecha de la cita es obligatoria.'); return }
    if (!hora) { alert('⚠ La hora de la cita es obligatoria.'); return }
 
    setGuardando(true)
 
    // Usuario actual para campos de auditoría
    const { data: auth } = await supabase.auth.getUser()
    const usuario = auth.user?.email || 'Sistema'
    const ahora = new Date().toISOString()
 
    // 1. Guardar la cita en el prospecto (+ avanzar etapa solo si NO es edición)
    const updateProspecto: Record<string, unknown> = {
      cita_fecha: fecha,
      cita_hora: hora,
      cita_lugar: lugar.trim() || null,
      cita_registrada_en: ahora,
      cita_registrada_por: usuario,
      actualizado_en: ahora,
    }
    if (!esEdicion) updateProspecto.etapa = 2
 
    const { error: errP } = await supabase
      .from('prospectos')
      .update(updateProspecto)
      .eq('id', prospectoId)
 
    if (errP) {
      setGuardando(false)
      alert('Error al guardar la cita: ' + errP.message)
      return
    }
 
    // 2. Sincronizar garantías vinculadas (reemplazo completo, como p.garantias = ids)
    await supabase.from('prospecto_garantias').delete().eq('prospecto_id', prospectoId)
    if (seleccionadas.length > 0) {
      const filas = seleccionadas.map((gid) => ({
        prospecto_id: prospectoId,
        garantia_id: gid,
        vinculada_por: usuario,
      }))
      const { error: errG } = await supabase.from('prospecto_garantias').insert(filas)
      if (errG) {
        setGuardando(false)
        alert('Error al vincular garantías: ' + errG.message)
        return
      }
    }
 
    // 3. Registrar en historial (timestamp + usuario, automático por la tabla)
    const foliosSel = disponibles
      .filter((g) => seleccionadas.includes(g.id))
      .map((g) => g.folio)
    let descripcion = 'Cita: ' + fecha + ' ' + hora + (lugar.trim() ? ' · ' + lugar.trim() : '')
    if (foliosSel.length > 0) descripcion += ' · Garantías: ' + foliosSel.join(', ')
 
    await supabase.from('prospecto_historial').insert({
      prospecto_id: prospectoId,
      etapa_desde: esEdicion ? etapaActual : 1,
      etapa_hasta: esEdicion ? etapaActual : 2,
      descripcion: (esEdicion ? '[Editó vínculos] ' : '[Avanzó a Cita agendada] ') + descripcion,
      creado_por: usuario,
    })
 
    setGuardando(false)
    onGuardado()
    onCerrar()
  }
 
  if (!abierto) return null
 
  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '9px 11px',
    border: '1.5px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '12px',
    fontFamily: 'Sora, sans-serif',
    boxSizing: 'border-box',
  }
  const labelBase: React.CSSProperties = {
    display: 'block',
    fontSize: '10px',
    color: '#64748b',
    fontWeight: 600,
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '.4px',
  }
 
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(7,26,53,.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '30px 20px', overflowY: 'auto',
      }}
    >
      <div style={{ width: '100%', maxWidth: '600px', background: '#fff', borderRadius: '14px', boxShadow: '0 30px 70px -10px rgba(0,0,0,.5)', overflow: 'hidden' }}>
        {/* Cabecera */}
        <div style={{ padding: '18px 22px', background: 'linear-gradient(135deg,#7c2d12,#c2410c)', color: '#fff' }}>
          <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', opacity: .85, marginBottom: '3px' }}>
            📅 ETAPA 2 · CITA AGENDADA{esEdicion ? ' · EDITAR' : ''}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700 }}>{prospectoNombre}</div>
          <div style={{ fontSize: '11px', opacity: .85, marginTop: '2px' }}>
            {esEdicion ? 'Edita la cita y las garantías vinculadas' : 'Agenda la cita y vincula las garantías de interés'}
          </div>
        </div>
 
        <div style={{ padding: '22px', fontFamily: 'Sora, sans-serif' }}>
          {/* Datos de la cita */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0C2D58', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.4px' }}>
              📅 Datos de la cita
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelBase}>📅 Fecha *</label>
                <input type="date" min={minDate} value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputBase} />
              </div>
              <div>
                <label style={labelBase}>🕐 Hora *</label>
                <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} style={{ ...inputBase, fontFamily: 'monospace' }} />
              </div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <label style={labelBase}>📍 Ubicación / Lugar de la cita</label>
              <input
                type="text"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                placeholder="Ej. Oficina principal · Visita al inmueble · Videollamada"
                style={{ ...inputBase, fontSize: '11.5px' }}
              />
            </div>
          </div>
 
          {/* Garantías de interés */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0C2D58', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.4px' }}>
              🏘️ Garantías de interés ({disponibles.length} disponibles)
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' }}>
              💡 Selecciona una o más garantías que le interesan al prospecto. Solo aparecen las publicadas en el Catálogo.
            </div>
 
            <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '4px' }}>
              {cargando ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '11.5px' }}>Cargando garantías...</div>
              ) : disponibles.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', color: '#78350f', fontSize: '11.5px', lineHeight: 1.5 }}>
                  ⚠️ <strong>No hay garantías disponibles en el catálogo.</strong><br />
                  Para vincular garantías, primero deben estar publicadas en el Catálogo.<br />
                  <span style={{ fontSize: '10px', fontStyle: 'italic', display: 'block', marginTop: '5px' }}>
                    Puedes continuar sin garantías y vincularlas después.
                  </span>
                </div>
              ) : (
                disponibles.map((g) => {
                  const marcada = seleccionadas.includes(g.id)
                  const precio = g.precio_piso ?? g.valor_estimado ?? 0
                  return (
                    <label
                      key={g.id}
                      style={{
                        display: 'block', padding: '10px 12px',
                        border: `1.5px solid ${marcada ? '#7c3aed' : '#e2e8f0'}`,
                        borderRadius: '8px', marginBottom: '6px', cursor: 'pointer',
                        background: marcada ? '#f5f3ff' : '#fff', transition: 'all .15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={marcada}
                          onChange={() => toggle(g.id)}
                          style={{ marginTop: '3px', width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed', fontSize: '11px' }}>{g.folio}</span>
                            {g.tipo_caso && (
                              <span style={{ fontSize: '9.5px', background: '#dbeafe', color: '#1e40af', padding: '1px 7px', borderRadius: '8px', fontWeight: 700 }}>
                                {g.tipo_caso}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#475569', marginBottom: '3px' }}>
                            📍 {g.direccion || 'Sin dirección'}
                          </div>
                          <div style={{ fontSize: '10px', color: '#0f172a', fontWeight: 600, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <span>🏗️ {g.m2_terreno || 0} m² T</span>
                            <span>🏠 {g.m2_construccion || 0} m² C</span>
                            <span style={{ color: '#15803d' }}>💰 ${Math.round(precio).toLocaleString('es-MX')}</span>
                          </div>
                        </div>
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          </div>
 
          {/* Botones */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
            <button
              onClick={onCerrar}
              disabled={guardando}
              style={{ fontSize: '11px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={guardando}
              style={{ fontSize: '11px', fontWeight: 700, padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#7c2d12,#c2410c)', color: '#fff', cursor: guardando ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', opacity: guardando ? 0.6 : 1 }}
            >
              {guardando ? 'Guardando...' : esEdicion ? '💾 Guardar cambios' : '📅 Agendar y avanzar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}