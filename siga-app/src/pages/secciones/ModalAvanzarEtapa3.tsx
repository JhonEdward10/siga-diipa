import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

/* ════════════════════════════════════════════════════════════════════
   MODAL ETAPA 2 → 3 · Registrar visita + flujo PDF de confidencialidad
   Migrado de prosModalAvanzarEtapa3 (legacy SIGA-DIIPA)

   Flujo secuencial obligatorio (igual que el legacy):
     1) Datos completos (fecha + garantías vistas) → desbloquea Descargar
     2) Descargar el PDF de confidencialidad     → desbloquea Subir
     3) Subir el PDF firmado                      → desbloquea Registrar
     4) Registrar → guarda visita y avanza a etapa 3

   NOTA (versión 3a): el PDF de confidencialidad es una versión simple con
   los datos reales del prospecto. El contrato oficial de 7 cláusulas +
   firmantes con PIN se integra en la versión 3b.
   ════════════════════════════════════════════════════════════════════ */

type GarantiaVinc = {
  id: number
  folio: string
  direccion: string | null
}

type Props = {
  prospectoId: number
  prospectoFolio: string
  prospectoNombre: string
  abierto: boolean
  onCerrar: () => void
  onGuardado: () => void
}

const RESULTADOS = [
  { value: 'muy-interesado', label: '🔥 Muy interesado · Listo para apartar' },
  { value: 'interesado', label: '👍 Interesado · Está evaluando' },
  { value: 'dudoso', label: '🤔 Dudoso · Necesita más info' },
  { value: 'poco-interes', label: '😐 Poco interés · No le convence' },
  { value: 'no-interesado', label: '👎 No interesado · Cierra prospecto' },
]

function resultadoLabel(v: string): string {
  const r = RESULTADOS.find((x) => x.value === v)
  return r ? r.label.split(' · ')[0] : v
}

export default function ModalAvanzarEtapa3({
  prospectoId,
  prospectoFolio,
  prospectoNombre,
  abierto,
  onCerrar,
  onGuardado,
}: Props) {
  const hoy = new Date().toISOString().slice(0, 10)
  const folio = 'CONF-' + prospectoFolio.replace('PRO-', '') + '-' + hoy.replace(/-/g, '')

  const [garantias, setGarantias] = useState<GarantiaVinc[]>([])
  const [vistas, setVistas] = useState<number[]>([])
  const [cargando, setCargando] = useState(false)

  const [fecha, setFecha] = useState(hoy)
  const [resultado, setResultado] = useState('interesado')
  const [notas, setNotas] = useState('')
  const [favorita, setFavorita] = useState<number | ''>('')

  // Estado del flujo secuencial
  const [descargado, setDescargado] = useState(false)
  const [archivo, setArchivo] = useState<{ path: string; nombre: string } | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!abierto) return
    cargarGarantias()
    // reset del flujo al abrir
    setDescargado(false)
    setArchivo(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, prospectoId])

  async function cargarGarantias() {
    setCargando(true)
    // Garantías vinculadas en etapa 2 (desde la tabla puente)
    const { data: pg } = await supabase
      .from('prospecto_garantias')
      .select('garantia_id')
      .eq('prospecto_id', prospectoId)

    const ids = (pg || []).map((r) => r.garantia_id as number)
    if (ids.length > 0) {
      const { data: gar } = await supabase
        .from('garantias')
        .select('id, folio, direccion')
        .in('id', ids)
        .order('folio', { ascending: true })
      const lista = (gar as GarantiaVinc[]) || []
      setGarantias(lista)
      setVistas(lista.map((g) => g.id)) // por defecto todas marcadas (como el legacy)
    } else {
      setGarantias([])
      setVistas([])
    }
    setCargando(false)
  }

  function toggleVista(gid: number) {
    setVistas((prev) =>
      prev.includes(gid) ? prev.filter((x) => x !== gid) : [...prev, gid],
    )
  }

  const datosOk = !!fecha && vistas.length > 0

  // PASO 1 · Generar y descargar el PDF (versión simple, vía impresión del navegador)
  function descargar() {
    if (!datosOk) {
      alert('⚠ Completa la fecha y marca al menos una garantía que el prospecto vio.')
      return
    }
    const garVistas = garantias.filter((g) => vistas.includes(g.id))
    const filasGar = garVistas
      .map((g) => `<tr><td style="padding:6px 10px;border:1px solid #cbd5e1;font-family:monospace">${g.folio}</td><td style="padding:6px 10px;border:1px solid #cbd5e1">${g.direccion || 'Sin dirección'}</td></tr>`)
      .join('')

    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>${folio}</title>
<style>
  body{font-family:Georgia,serif;color:#0f172a;max-width:760px;margin:40px auto;padding:0 30px;line-height:1.6}
  h1{font-size:18px;text-align:center;color:#042C53;margin-bottom:4px}
  .sub{text-align:center;font-size:12px;color:#64748b;margin-bottom:24px}
  .folio{font-family:monospace;font-weight:bold}
  table{border-collapse:collapse;width:100%;margin:14px 0;font-size:13px}
  .firmas{display:flex;justify-content:space-between;margin-top:60px}
  .firma{width:45%;text-align:center;border-top:1px solid #0f172a;padding-top:6px;font-size:12px}
  @media print{body{margin:0}}
</style></head><body>
  <h1>CONTRATO DE CONFIDENCIALIDAD DE DATOS</h1>
  <div class="sub">Desarrollo Inmobiliario e Inversiones · DIIPA<br>Folio: <span class="folio">${folio}</span> · Fecha: ${fecha}</div>
  <p>Por medio del presente, <strong>${prospectoNombre}</strong> (EL INTERESADO), identificado con el prospecto <strong>${prospectoFolio}</strong>, y DIIPA (LA PRESTADORA), acuerdan mantener bajo estricta confidencialidad toda la información compartida durante el proceso de evaluación de los inmuebles que a continuación se relacionan.</p>
  <p>Las partes se obligan a no divulgar a terceros la información sensible intercambiada, incluyendo datos de las garantías, condiciones comerciales y datos personales, salvo autorización expresa por escrito.</p>
  <p><strong>Inmuebles mostrados al INTERESADO:</strong></p>
  <table><thead><tr><th style="padding:6px 10px;border:1px solid #cbd5e1;background:#eef1f5">Folio</th><th style="padding:6px 10px;border:1px solid #cbd5e1;background:#eef1f5">Dirección</th></tr></thead><tbody>${filasGar}</tbody></table>
  <p style="font-size:12px;color:#64748b;margin-top:20px"><em>Documento preliminar generado automáticamente por SIGA-DIIPA. Imprímelo o guárdalo como PDF, fírmalo con el cliente y vuelve a subirlo firmado.</em></p>
  <div class="firmas">
    <div class="firma">EL INTERESADO<br>${prospectoNombre}</div>
    <div class="firma">LA PRESTADORA<br>DIIPA</div>
  </div>
  <script>window.onload=function(){window.print()}</script>
</body></html>`

    const win = window.open('', '_blank')
    if (!win) {
      alert('⚠ El navegador bloqueó la ventana. Permite las ventanas emergentes para descargar el PDF.')
      return
    }
    win.document.write(html)
    win.document.close()
    setDescargado(true)
  }

  // PASO 2 · Subir el PDF firmado al Storage privado
  async function subir(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    setSubiendo(true)
    const ext = (file.name.split('.').pop() || 'pdf').toLowerCase()
    const path = `${prospectoId}/confidencialidad/${folio}.${ext}`
    const { error } = await supabase.storage
      .from('documentos-prospectos')
      .upload(path, file, { upsert: true })
    if (error) {
      setSubiendo(false)
      alert('❌ No se pudo subir: ' + error.message)
      e.target.value = ''
      return
    }
    setArchivo({ path, nombre: file.name })
    setSubiendo(false)
  }

  // PASO 3 · Registrar la visita y avanzar a etapa 3
  async function registrar() {
    if (!descargado || !archivo) {
      alert('🚫 Faltan pasos.\n\nDebes: 1) Descargar el contrato · 2) Subirlo firmado.')
      return
    }
    setGuardando(true)
    const { data: auth } = await supabase.auth.getUser()
    const usuario = auth.user?.email || 'Sistema'
    const ahora = new Date().toISOString()

    // 1. Insertar la visita
    const { data: vis, error: errV } = await supabase
      .from('visitas')
      .insert({
        prospecto_id: prospectoId,
        fecha,
        resultado,
        notas: notas.trim() || null,
        garantia_favorita_id: favorita || null,
        folio_confidencialidad: folio,
        contrato_path: archivo.path,
        contrato_nombre: archivo.nombre,
        contrato_subido_en: ahora,
        contrato_subido_por: usuario,
        registrada_por: usuario,
      })
      .select('id')
      .single()

    if (errV || !vis) {
      setGuardando(false)
      alert('Error al guardar la visita: ' + (errV?.message || 'desconocido'))
      return
    }

    // 2. Garantías que vio
    if (vistas.length > 0) {
      await supabase.from('visita_garantias').insert(
        vistas.map((gid) => ({ visita_id: vis.id, garantia_id: gid })),
      )
    }

    // 3. Avanzar etapa
    await supabase.from('prospectos').update({ etapa: 3, actualizado_en: ahora }).eq('id', prospectoId)

    // 4. Historial
    const favFolio = favorita ? garantias.find((g) => g.id === favorita)?.folio : null
    await supabase.from('prospecto_historial').insert({
      prospecto_id: prospectoId,
      etapa_desde: 2,
      etapa_hasta: 3,
      descripcion:
        `[Visita registrada] ${fecha} · ${resultadoLabel(resultado)}` +
        (favFolio ? ` · Favorita: ${favFolio}` : '') +
        ` · Folio: ${folio}`,
      creado_por: usuario,
    })

    setGuardando(false)
    onGuardado()
    onCerrar()
  }

  if (!abierto) return null

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '9px 11px', border: '1.5px solid #cbd5e1',
    borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box',
  }
  const labelBase: React.CSSProperties = {
    display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 600,
    marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.4px',
  }
  const tituloSec: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, color: '#0C2D58', marginBottom: '8px',
    textTransform: 'uppercase', letterSpacing: '.4px',
  }

  // Estilos de fila de paso según estado
  function filaPaso(activo: boolean, hecho: boolean): React.CSSProperties {
    return {
      display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 11px',
      background: hecho ? '#dcfce7' : '#fff',
      border: `1.5px solid ${hecho ? '#86efac' : '#cbd5e1'}`,
      borderRadius: '8px', marginBottom: '7px',
      opacity: activo || hecho ? 1 : 0.55,
    }
  }
  function botonPaso(habilitado: boolean): React.CSSProperties {
    return {
      fontSize: '10.5px', fontWeight: 700, padding: '7px 13px', borderRadius: '7px', border: 'none',
      background: habilitado ? 'linear-gradient(135deg,#1e40af,#3b82f6)' : '#cbd5e1',
      color: habilitado ? '#fff' : '#64748b',
      cursor: habilitado ? 'pointer' : 'not-allowed', fontFamily: 'Sora, sans-serif',
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && !guardando) onCerrar() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(7,26,53,.65)',
        backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', padding: '30px 20px', overflowY: 'auto',
      }}
    >
      <div style={{ width: '100%', maxWidth: '600px', background: '#fff', borderRadius: '14px', boxShadow: '0 30px 70px -10px rgba(0,0,0,.5)', overflow: 'hidden' }}>
        {/* Cabecera */}
        <div style={{ padding: '18px 22px', background: 'linear-gradient(135deg,#5b21b6,#7c3aed)', color: '#fff' }}>
          <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', opacity: .85, marginBottom: '3px' }}>
            🚶 ETAPA 3 · VISITA REGISTRADA
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700 }}>{prospectoNombre} · {prospectoFolio}</div>
          <div style={{ fontSize: '11px', opacity: .85, marginTop: '2px' }}>
            Registra qué pasó en la visita y descarga el formulario de confidencialidad
          </div>
        </div>

        <div style={{ padding: '22px', fontFamily: 'Sora, sans-serif' }}>
          {/* Datos de la visita */}
          <div style={{ marginBottom: '16px' }}>
            <div style={tituloSec}>📅 Datos de la visita</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={labelBase}>📅 Fecha visita real *</label>
                <input type="date" max={hoy} value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputBase} />
              </div>
              <div>
                <label style={labelBase}>📊 Resultado *</label>
                <select value={resultado} onChange={(e) => setResultado(e.target.value)} style={{ ...inputBase, background: '#fff' }}>
                  {RESULTADOS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelBase}>📝 Notas de la visita</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Le gustó mucho la GAR-0005 por la ubicación. Va a hablar con su esposa y nos dará respuesta el viernes..."
                style={{ ...inputBase, fontSize: '11.5px', minHeight: '70px', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Garantías que vio */}
          <div style={{ marginBottom: '16px' }}>
            <div style={tituloSec}>🏘️ Garantías que efectivamente vio ({garantias.length} vinculadas)</div>
            {cargando ? (
              <div style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '11.5px' }}>Cargando...</div>
            ) : garantias.length === 0 ? (
              <div style={{ padding: '14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', color: '#78350f', fontSize: '11px', fontStyle: 'italic' }}>
                ⚠️ No hay garantías vinculadas. Considera regresar a Etapa 2 para vincular antes de registrar la visita.
              </div>
            ) : (
              garantias.map((g) => {
                const marcada = vistas.includes(g.id)
                return (
                  <label key={g.id} style={{ display: 'block', padding: '9px 11px', border: `1.5px solid ${marcada ? '#7c3aed' : '#e2e8f0'}`, borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', background: marcada ? '#f5f3ff' : '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <input type="checkbox" checked={marcada} onChange={() => toggleVista(g.id)} style={{ marginTop: '3px', width: '15px', height: '15px', cursor: 'pointer', accentColor: '#5b21b6' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed', fontSize: '11px' }}>{g.folio}</div>
                        <div style={{ fontSize: '10.5px', color: '#475569' }}>📍 {g.direccion || 'Sin dirección'}</div>
                      </div>
                    </div>
                  </label>
                )
              })
            )}
          </div>

          {/* Garantía favorita */}
          {garantias.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...labelBase, color: '#0C2D58', fontSize: '11px' }}>⭐ Garantía favorita (opcional)</label>
              <select value={favorita} onChange={(e) => setFavorita(e.target.value ? Number(e.target.value) : '')} style={{ ...inputBase, fontSize: '11.5px', background: '#fff' }}>
                <option value="">— Sin favorita aún —</option>
                {garantias.map((g) => <option key={g.id} value={g.id}>{g.folio}{g.direccion ? ' · ' + g.direccion.substring(0, 50) : ''}</option>)}
              </select>
              <div style={{ fontSize: '9.5px', color: '#94a3b8', fontStyle: 'italic', marginTop: '3px' }}>
                La que más le interesó al prospecto. Útil para preparar el apartado.
              </div>
            </div>
          )}

          {/* Aviso PDF */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '3px solid #1e40af', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '11px', color: '#1e3a8a', lineHeight: 1.5 }}>
            <strong>📄 PDF de Confidencialidad</strong><br />
            Al descargar se genera el formulario con los datos del prospecto y las garantías mostradas. Descárgalo, fírmalo con el cliente y vuelve a subirlo firmado.
          </div>

          {/* Flujo secuencial de 3 pasos */}
          <div style={{ marginTop: '8px', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0C2D58', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '.4px' }}>
              🔒 Contrato de Confidencialidad · pasos obligatorios
            </div>

            {/* Paso 1 */}
            <div style={filaPaso(datosOk, descargado)}>
              <span style={{ fontSize: '14px' }}>{descargado ? '✅' : '1️⃣'}</span>
              <div style={{ flex: 1, fontSize: '11px', color: '#475569' }}><strong>Descargar</strong> Contrato de Confidencialidad</div>
              <button type="button" disabled={!datosOk} onClick={descargar} style={botonPaso(datosOk)}>📄 Descargar</button>
            </div>

            {/* Paso 2 */}
            <div style={filaPaso(descargado, !!archivo)}>
              <span style={{ fontSize: '14px' }}>{archivo ? '✅' : '2️⃣'}</span>
              <div style={{ flex: 1, fontSize: '11px', color: '#475569' }}>
                <strong>Subir</strong> contrato firmado por el cliente
                {archivo && <div style={{ fontSize: '10px', color: '#15803d', marginTop: '2px' }}>{archivo.nombre.substring(0, 32)}</div>}
              </div>
              <label style={{ fontSize: '10.5px', fontWeight: 700, padding: '7px 13px', borderRadius: '7px', fontFamily: 'Sora, sans-serif', background: descargado && !archivo ? 'linear-gradient(135deg,#7c2d12,#c2410c)' : archivo ? '#16a34a' : '#cbd5e1', color: descargado ? '#fff' : '#64748b', cursor: descargado && !subiendo ? 'pointer' : 'not-allowed', pointerEvents: descargado && !subiendo ? 'auto' : 'none' }}>
                <span>{subiendo ? '⏳ Subiendo…' : archivo ? '✅ Subido' : '📤 Subir'}</span>
                <input type="file" accept=".pdf,image/*" onChange={subir} disabled={!descargado || subiendo} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Paso 3 */}
            <div style={filaPaso(!!archivo, false)}>
              <span style={{ fontSize: '14px' }}>3️⃣</span>
              <div style={{ flex: 1, fontSize: '11px', color: '#475569' }}><strong>Registrar visita</strong> y avanzar a Etapa 3</div>
              <button
                type="button"
                disabled={!archivo || guardando}
                onClick={registrar}
                style={{ fontSize: '10.5px', fontWeight: 700, padding: '7px 13px', borderRadius: '7px', border: 'none', background: archivo ? 'linear-gradient(135deg,#15803d,#22c55e)' : '#cbd5e1', color: archivo ? '#fff' : '#64748b', cursor: archivo && !guardando ? 'pointer' : 'not-allowed', fontFamily: 'Sora, sans-serif' }}
              >
                {guardando ? 'Guardando…' : '✅ Registrar'}
              </button>
            </div>
          </div>

          {/* Cancelar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button onClick={onCerrar} disabled={guardando} style={{ fontSize: '11px', fontWeight: 600, padding: '8px 14px', borderRadius: '7px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}