import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

/* ════════════════════════════════════════════════════════════════════
   MODAL ETAPA 3 → 4 · Pre-cliente · KYC / AML / PLD / Carta
   Migrado de prosModalAvanzarEtapa4 + prosEt4AbrirKYC + prosEt4AbrirPLD
   (legacy SIGA-DIIPA)

   COMPLETO HASTA AQUÍ:
     - PASO 1 · Iniciar Proceso de Compra → crea/actualiza el apartado
     - PASO 2 · KYC  (Conoce a tu Cliente)        → tabla apartado_kyc
     - PASO 3 · AML/PLD (Prevención Lavado Dinero) → tabla apartado_aml

   PRÓXIMA ITERACIÓN (4c):
     - PASO 4 · Descargar paquete (KYC + AML/PLD para firma)
     - PASO 5 · Subir firmados
     - PASO 6 · Solicitar Carta a Jurídico → avanzar a etapa 4

   Nota de arquitectura: KYC y AML/PLD se manejan como VISTAS dentro de
   este mismo modal (no sub-modales montados encima), vía el estado `vista`.
   ════════════════════════════════════════════════════════════════════ */

type GarantiaDisp = {
  id: number
  folio: string
  direccion: string | null
  precio_piso: number | null
  valor_estimado: number | null
}

type Props = {
  prospectoId: number
  prospectoFolio: string
  prospectoNombre: string
  abierto: boolean
  onCerrar: () => void
  onGuardado: () => void
}

type Vista = 'roadmap' | 'kyc' | 'aml'

const PASOS = [
  { n: 1, icon: '📋', label: 'Iniciar Proceso de Compra (datos, garantía, términos)' },
  { n: 2, icon: '🪪', label: 'Llenar KYC (Conoce a tu Cliente)' },
  { n: 3, icon: '🛡️', label: 'Llenar AML/PLD (Prevención de Lavado de Dinero)' },
  { n: 4, icon: '📄', label: 'Descargar paquete (KYC + AML/PLD para firma)' },
  { n: 5, icon: '📤', label: 'Subir KYC + AML/PLD firmados' },
  { n: 6, icon: '📨', label: 'Solicitar Carta de Apartado a Jurídico' },
]

const ESTADO_CIVIL = ['', 'Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión libre']
const ID_TIPOS = ['INE', 'Pasaporte', 'Cédula profesional', 'Otro']
const FUENTES = ['Sueldo', 'Actividad empresarial', 'Servicios profesionales', 'Venta de bienes', 'Ahorros', 'Herencia', 'Otro']
const FORMAS_PAGO = ['Transferencia bancaria', 'Depósito', 'SPEI', 'Otro']
const PROPOSITOS = ['Prestación de servicios jurídicos', 'Compra de propiedad', 'Pagos de honorarios notariales', 'Otro']
const RIESGOS = ['', 'Riesgo Bajo', 'Riesgo Medio', 'Riesgo Alto']

const KYC_VACIO = {
  nombre: '', fecha_nacimiento: '', curp: '', rfc: '', nacionalidad: 'Mexicana',
  estado_civil: '', ocupacion: '', telefono: '', correo: '',
  calle: '', colonia: '', municipio: '', estado: '', cp: '',
  id_tipo: 'INE', id_numero: '', id_vigencia: '',
}
const AML_VACIO = {
  ingreso_mensual: '', fuente_ingresos: 'Sueldo', monto_inversion: '', recursos_licitos: false,
  forma_pago: 'Transferencia bancaria', banco_origen: '', titular_cuenta: '',
  proposito: 'Prestación de servicios jurídicos', actua_cuenta_propia: false,
  riesgo: '', riesgo_nota: '',
  decl_licitos: false, decl_no_lavado: false, decl_veraz: false, decl_reporte: false,
}

function Overlay({ children, maxW = 620, onBackdrop }: { children: React.ReactNode; maxW?: number; onBackdrop: () => void }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onBackdrop() }}
      style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(7,26,53,.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '30px 20px', overflowY: 'auto' }}
    >
      <div style={{ width: '100%', maxWidth: maxW + 'px', background: '#fff', borderRadius: '14px', boxShadow: '0 30px 70px -10px rgba(0,0,0,.5)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

export default function ModalAvanzarEtapa4({
  prospectoId,
  prospectoFolio,
  prospectoNombre,
  abierto,
  onCerrar,
  onGuardado,
}: Props) {
  const hoy = new Date().toISOString().slice(0, 10)

  const [vista, setVista] = useState<Vista>('roadmap')
  const [cargando, setCargando] = useState(false)
  const [bloqueo, setBloqueo] = useState<string | null>(null)

  const [garantias, setGarantias] = useState<GarantiaDisp[]>([])
  const [garantiaSel, setGarantiaSel] = useState<number | ''>('')
  const [favoritaId, setFavoritaId] = useState<number | null>(null)

  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(hoy)

  const [apartadoId, setApartadoId] = useState<number | null>(null)
  const [folioApartado, setFolioApartado] = useState('')
  const [creando, setCreando] = useState(false)

  const [kycHecho, setKycHecho] = useState(false)
  const [amlHecho, setAmlHecho] = useState(false)

  const [kyc, setKyc] = useState({ ...KYC_VACIO })
  const [aml, setAml] = useState({ ...AML_VACIO })
  const [guardandoForm, setGuardandoForm] = useState(false)

  useEffect(() => {
    if (!abierto) return
    setVista('roadmap')
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, prospectoId])

  async function cargar() {
    setCargando(true)
    setBloqueo(null)
    setApartadoId(null)
    setFolioApartado('')
    setKycHecho(false)
    setAmlHecho(false)
    setKyc({ ...KYC_VACIO })
    setAml({ ...AML_VACIO })

    const { data: vis } = await supabase
      .from('visitas')
      .select('id, garantia_favorita_id')
      .eq('prospecto_id', prospectoId)
      .order('id', { ascending: false })
      .limit(1)

    if (!vis || vis.length === 0) {
      setBloqueo('El prospecto no tiene visita registrada.\n\nPrimero registra la visita en Etapa 3.')
      setCargando(false)
      return
    }
    const visita = vis[0]
    setFavoritaId(visita.garantia_favorita_id as number | null)

    const { data: vg } = await supabase
      .from('visita_garantias')
      .select('garantia_id')
      .eq('visita_id', visita.id)

    const ids = (vg || []).map((r) => r.garantia_id as number)
    if (ids.length === 0) {
      setBloqueo('La visita no tiene garantías registradas.\n\nRegresa a Etapa 3 para registrarlas.')
      setCargando(false)
      return
    }

    const { data: gar } = await supabase
      .from('garantias')
      .select('id, folio, direccion, precio_piso, valor_estimado')
      .in('id', ids)
      .eq('publicado_catalogo', true)
      .eq('eliminada', false)
      .order('folio', { ascending: true })

    const lista = (gar as GarantiaDisp[]) || []
    if (lista.length === 0) {
      setBloqueo('Las garantías que vio el prospecto ya no están disponibles en el catálogo.\n\nVerifica el Catálogo o regresa a Etapa 2 para vincular nuevas.')
      setCargando(false)
      return
    }
    setGarantias(lista)

    const fav = lista.find((g) => g.id === visita.garantia_favorita_id)
    const elegida = fav || lista[0]
    setGarantiaSel(elegida.id)
    setMonto(elegida.precio_piso != null ? String(elegida.precio_piso) : elegida.valor_estimado != null ? String(elegida.valor_estimado) : '')

    const { data: apt } = await supabase
      .from('apartados')
      .select('id, folio, garantia_id, monto_apartado')
      .eq('prospecto_id', prospectoId)
      .order('id', { ascending: false })
      .limit(1)

    if (apt && apt.length > 0) {
      const a = apt[0]
      setApartadoId(a.id)
      setFolioApartado(a.folio || '')
      if (a.garantia_id) setGarantiaSel(a.garantia_id as number)
      if (a.monto_apartado != null) setMonto(String(a.monto_apartado))
      await cargarFormularios(a.id)
    }

    setCargando(false)
  }

  async function cargarFormularios(aptId: number) {
    const { data: k } = await supabase.from('apartado_kyc').select('*').eq('apartado_id', aptId).maybeSingle()
    if (k) {
      setKyc({
        nombre: k.nombre || '', fecha_nacimiento: k.fecha_nacimiento || '', curp: k.curp || '',
        rfc: k.rfc || '', nacionalidad: k.nacionalidad || 'Mexicana', estado_civil: k.estado_civil || '',
        ocupacion: k.ocupacion || '', telefono: k.telefono || '', correo: k.correo || '',
        calle: k.calle || '', colonia: k.colonia || '', municipio: k.municipio || '',
        estado: k.estado || '', cp: k.cp || '', id_tipo: k.id_tipo || 'INE',
        id_numero: k.id_numero || '', id_vigencia: k.id_vigencia || '',
      })
      setKycHecho(true)
    }
    const { data: a } = await supabase.from('apartado_aml').select('*').eq('apartado_id', aptId).maybeSingle()
    if (a) {
      setAml({
        ingreso_mensual: a.ingreso_mensual != null ? String(a.ingreso_mensual) : '',
        fuente_ingresos: a.fuente_ingresos || 'Sueldo',
        monto_inversion: a.monto_inversion != null ? String(a.monto_inversion) : '',
        recursos_licitos: !!a.recursos_licitos, forma_pago: a.forma_pago || 'Transferencia bancaria',
        banco_origen: a.banco_origen || '', titular_cuenta: a.titular_cuenta || '',
        proposito: a.proposito || 'Prestación de servicios jurídicos', actua_cuenta_propia: !!a.actua_cuenta_propia,
        riesgo: a.riesgo || '', riesgo_nota: a.riesgo_nota || '',
        decl_licitos: !!a.decl_licitos, decl_no_lavado: !!a.decl_no_lavado,
        decl_veraz: !!a.decl_veraz, decl_reporte: !!a.decl_reporte,
      })
      setAmlHecho(true)
    }
  }

  async function generarFolioApartado(): Promise<string> {
    const { data } = await supabase.from('apartados').select('folio').like('folio', 'APT-%')
    let max = 0
    ;(data || []).forEach((row) => {
      const num = parseInt((row.folio || '').replace(/\D/g, ''), 10)
      if (!isNaN(num) && num > max) max = num
    })
    return 'APT-' + String(max + 1).padStart(4, '0')
  }

  async function iniciarProceso() {
    if (!garantiaSel) { alert('⚠ Selecciona la garantía que el cliente quiere apartar.'); return }
    setCreando(true)
    const { data: auth } = await supabase.auth.getUser()
    const usuario = auth.user?.email || 'Sistema'
    const ahora = new Date().toISOString()

    if (apartadoId) {
      const { error } = await supabase
        .from('apartados')
        .update({ garantia_id: garantiaSel, monto_apartado: monto ? Number(monto) : null, actualizado_en: ahora })
        .eq('id', apartadoId)
      setCreando(false)
      if (error) { alert('Error al actualizar el apartado: ' + error.message); return }
    } else {
      const folio = await generarFolioApartado()
      const { data, error } = await supabase
        .from('apartados')
        .insert({
          folio, prospecto_id: prospectoId, garantia_id: garantiaSel,
          monto_apartado: monto ? Number(monto) : null, fecha_apartado: fecha,
          estatus: 'solicitado', creado_por: usuario,
        })
        .select('id, folio')
        .single()
      setCreando(false)
      if (error || !data) { alert('Error al crear el apartado: ' + (error?.message || 'desconocido')); return }
      setApartadoId(data.id)
      setFolioApartado(data.folio || folio)
    }
    onGuardado()
  }

  async function guardarKyc() {
    if (!apartadoId) { alert('Primero inicia el proceso de compra (paso 1).'); return }
    const nombre = kyc.nombre.trim()
    const curp = kyc.curp.trim().toUpperCase()
    const rfc = kyc.rfc.trim().toUpperCase()
    if (!nombre || !curp || !rfc) { alert('⚠ Nombre, CURP y RFC son obligatorios.'); return }

    setGuardandoForm(true)
    const ahora = new Date().toISOString()
    const fila = {
      apartado_id: apartadoId,
      nombre, curp, rfc,
      fecha_nacimiento: kyc.fecha_nacimiento || null,
      nacionalidad: kyc.nacionalidad.trim() || null,
      estado_civil: kyc.estado_civil || null,
      ocupacion: kyc.ocupacion.trim() || null,
      telefono: kyc.telefono.trim() || null,
      correo: kyc.correo.trim() || null,
      calle: kyc.calle.trim() || null,
      colonia: kyc.colonia.trim() || null,
      municipio: kyc.municipio.trim() || null,
      estado: kyc.estado.trim() || null,
      cp: kyc.cp.trim() || null,
      id_tipo: kyc.id_tipo || null,
      id_numero: kyc.id_numero.trim() || null,
      id_vigencia: kyc.id_vigencia || null,
      actualizado_en: ahora,
    }
    const { error } = await supabase.from('apartado_kyc').upsert(fila, { onConflict: 'apartado_id' })
    if (!error) await supabase.from('apartados').update({ kyc_completado: true, actualizado_en: ahora }).eq('id', apartadoId)
    setGuardandoForm(false)
    if (error) { alert('Error al guardar KYC: ' + error.message); return }
    setKyc({ ...kyc, curp, rfc, nombre })
    setKycHecho(true)
    setVista('roadmap')
  }

  async function guardarAml() {
    if (!apartadoId) { alert('Primero inicia el proceso de compra (paso 1).'); return }
    if (!aml.decl_licitos || !aml.decl_no_lavado || !aml.decl_veraz || !aml.decl_reporte) {
      alert('⚠ El cliente debe aceptar las 4 declaraciones AML/PLD.')
      return
    }
    setGuardandoForm(true)
    const ahora = new Date().toISOString()
    const fila = {
      apartado_id: apartadoId,
      ingreso_mensual: aml.ingreso_mensual ? Number(aml.ingreso_mensual) : null,
      fuente_ingresos: aml.fuente_ingresos || null,
      monto_inversion: aml.monto_inversion ? Number(aml.monto_inversion) : null,
      recursos_licitos: aml.recursos_licitos,
      forma_pago: aml.forma_pago || null,
      banco_origen: aml.banco_origen.trim() || null,
      titular_cuenta: aml.titular_cuenta.trim() || null,
      proposito: aml.proposito || null,
      actua_cuenta_propia: aml.actua_cuenta_propia,
      riesgo: aml.riesgo || null,
      riesgo_nota: aml.riesgo_nota.trim() || null,
      decl_licitos: aml.decl_licitos, decl_no_lavado: aml.decl_no_lavado,
      decl_veraz: aml.decl_veraz, decl_reporte: aml.decl_reporte,
      actualizado_en: ahora,
    }
    const { error } = await supabase.from('apartado_aml').upsert(fila, { onConflict: 'apartado_id' })
    if (!error) await supabase.from('apartados').update({ pld_completado: true, actualizado_en: ahora }).eq('id', apartadoId)
    setGuardandoForm(false)
    if (error) { alert('Error al guardar AML/PLD: ' + error.message); return }
    setAmlHecho(true)
    setVista('roadmap')
  }

  if (!abierto) return null

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '7px 9px', border: '1.5px solid #cbd5e1',
    borderRadius: '6px', fontSize: '11px', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box',
  }
  const labelMini: React.CSSProperties = {
    display: 'block', fontSize: '9.5px', color: '#64748b', fontWeight: 600, marginBottom: '3px',
  }
  const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }


  // ═════════ VISTA KYC ═════════
  if (vista === 'kyc') {
    return (
      <Overlay maxW={680} onBackdrop={() => { if (!guardandoForm) onCerrar() }}>
        <div style={{ padding: '18px 22px', background: 'linear-gradient(135deg,#0c4a6e,#1e40af)', color: '#fff' }}>
          <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', opacity: .85, marginBottom: '3px' }}>2️⃣ FORMATO KYC · Know Your Customer</div>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>{prospectoNombre} · {prospectoFolio}</div>
        </div>
        <div style={{ padding: '20px', fontFamily: 'Sora, sans-serif', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ background: '#eef7ff', border: '1px solid #B5D4F4', borderRadius: '9px', padding: '11px 13px', marginBottom: '10px' }}>
            <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#185FA5', textTransform: 'uppercase', marginBottom: '8px' }}>1. Datos generales del cliente</div>
            <div style={grid3}>
              <div><label style={labelMini}>Nombre completo *</label><input value={kyc.nombre} onChange={(e) => setKyc({ ...kyc, nombre: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Fecha nacimiento</label><input type="date" value={kyc.fecha_nacimiento} onChange={(e) => setKyc({ ...kyc, fecha_nacimiento: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>CURP *</label><input value={kyc.curp} maxLength={18} onChange={(e) => setKyc({ ...kyc, curp: e.target.value })} style={{ ...inputBase, fontFamily: 'monospace', textTransform: 'uppercase' }} /></div>
            </div>
            <div style={grid3}>
              <div><label style={labelMini}>RFC *</label><input value={kyc.rfc} maxLength={13} onChange={(e) => setKyc({ ...kyc, rfc: e.target.value })} style={{ ...inputBase, fontFamily: 'monospace', textTransform: 'uppercase' }} /></div>
              <div><label style={labelMini}>Nacionalidad</label><input value={kyc.nacionalidad} onChange={(e) => setKyc({ ...kyc, nacionalidad: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Estado civil</label><select value={kyc.estado_civil} onChange={(e) => setKyc({ ...kyc, estado_civil: e.target.value })} style={{ ...inputBase, background: '#fff' }}>{ESTADO_CIVIL.map((o) => <option key={o} value={o}>{o || '—'}</option>)}</select></div>
            </div>
            <div style={{ ...grid3, marginBottom: 0 }}>
              <div><label style={labelMini}>Ocupación</label><input value={kyc.ocupacion} placeholder="Empleado, comerciante" onChange={(e) => setKyc({ ...kyc, ocupacion: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Teléfono</label><input value={kyc.telefono} onChange={(e) => setKyc({ ...kyc, telefono: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Correo</label><input type="email" value={kyc.correo} onChange={(e) => setKyc({ ...kyc, correo: e.target.value })} style={inputBase} /></div>
            </div>
          </div>
          <div style={{ background: '#F4F6FB', border: '1px solid #C8D0E0', borderRadius: '9px', padding: '11px 13px', marginBottom: '10px' }}>
            <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#4A5272', textTransform: 'uppercase', marginBottom: '8px' }}>2. Domicilio del cliente</div>
            <div style={grid3}>
              <div><label style={labelMini}>Calle y número</label><input value={kyc.calle} placeholder="Av. Insurgentes 123" onChange={(e) => setKyc({ ...kyc, calle: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Colonia</label><input value={kyc.colonia} onChange={(e) => setKyc({ ...kyc, colonia: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Municipio</label><input value={kyc.municipio} onChange={(e) => setKyc({ ...kyc, municipio: e.target.value })} style={inputBase} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><label style={labelMini}>Estado</label><input value={kyc.estado} onChange={(e) => setKyc({ ...kyc, estado: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>CP</label><input value={kyc.cp} maxLength={5} onChange={(e) => setKyc({ ...kyc, cp: e.target.value })} style={inputBase} /></div>
            </div>
          </div>
          <div style={{ background: '#F4F6FB', border: '1px solid #C8D0E0', borderRadius: '9px', padding: '11px 13px', marginBottom: '14px' }}>
            <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#4A5272', textTransform: 'uppercase', marginBottom: '8px' }}>3. Identificación oficial</div>
            <div style={{ ...grid3, marginBottom: 0 }}>
              <div><label style={labelMini}>Tipo de identificación</label><select value={kyc.id_tipo} onChange={(e) => setKyc({ ...kyc, id_tipo: e.target.value })} style={{ ...inputBase, background: '#fff' }}>{ID_TIPOS.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
              <div><label style={labelMini}>Número</label><input value={kyc.id_numero} placeholder="Folio/serie" onChange={(e) => setKyc({ ...kyc, id_numero: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Vigencia</label><input type="date" value={kyc.id_vigencia} onChange={(e) => setKyc({ ...kyc, id_vigencia: e.target.value })} style={inputBase} /></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
            <button onClick={() => setVista('roadmap')} disabled={guardandoForm} style={{ fontSize: '11px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>Cancelar</button>
            <button onClick={guardarKyc} disabled={guardandoForm} style={{ fontSize: '11px', fontWeight: 700, padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#0c4a6e,#1e40af)', color: '#fff', cursor: guardandoForm ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', opacity: guardandoForm ? 0.6 : 1 }}>{guardandoForm ? 'Guardando…' : '💾 Guardar KYC'}</button>
          </div>
        </div>
      </Overlay>
    )
  }

  // ═════════ VISTA AML/PLD ═════════
  if (vista === 'aml') {
    const chk = (campo: keyof typeof aml, texto: string) => (
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', cursor: 'pointer' }}>
        <input type="checkbox" checked={aml[campo] as boolean} onChange={(e) => setAml({ ...aml, [campo]: e.target.checked })} style={{ marginTop: '2px', width: '14px', height: '14px', cursor: 'pointer' }} />
        <span>✓ {texto}</span>
      </label>
    )
    return (
      <Overlay maxW={680} onBackdrop={() => { if (!guardandoForm) onCerrar() }}>
        <div style={{ padding: '18px 22px', background: 'linear-gradient(135deg,#8B1A1A,#b91c1c)', color: '#fff' }}>
          <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', opacity: .85, marginBottom: '3px' }}>3️⃣ FORMATO AML/PLD · Prevención de Lavado de Dinero</div>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>{prospectoNombre} · {prospectoFolio}</div>
        </div>
        <div style={{ padding: '20px', fontFamily: 'Sora, sans-serif', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '9px', padding: '11px 13px', marginBottom: '10px' }}>
            <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', marginBottom: '8px' }}>3. Perfil transaccional</div>
            <div style={{ ...grid3, marginBottom: 0 }}>
              <div><label style={labelMini}>Ingreso mensual aprox.</label><input type="number" value={aml.ingreso_mensual} placeholder="$0.00" onChange={(e) => setAml({ ...aml, ingreso_mensual: e.target.value })} style={{ ...inputBase, fontFamily: 'monospace' }} /></div>
              <div><label style={labelMini}>Fuente principal</label><select value={aml.fuente_ingresos} onChange={(e) => setAml({ ...aml, fuente_ingresos: e.target.value })} style={{ ...inputBase, background: '#fff' }}>{FUENTES.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
              <div><label style={labelMini}>Monto de la inversión</label><input type="number" value={aml.monto_inversion} placeholder="$0.00" onChange={(e) => setAml({ ...aml, monto_inversion: e.target.value })} style={{ ...inputBase, fontFamily: 'monospace' }} /></div>
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', marginTop: '8px', cursor: 'pointer', fontSize: '10.5px', color: '#475569', fontWeight: 600 }}>
              <input type="checkbox" checked={aml.recursos_licitos} onChange={(e) => setAml({ ...aml, recursos_licitos: e.target.checked })} style={{ marginTop: '2px', width: '14px', height: '14px', cursor: 'pointer' }} />
              <span>✓ El cliente declara que los recursos provienen de actividades lícitas</span>
            </label>
          </div>
          <div style={{ background: '#F4F6FB', border: '1px solid #C8D0E0', borderRadius: '9px', padding: '11px 13px', marginBottom: '10px' }}>
            <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#4A5272', textTransform: 'uppercase', marginBottom: '8px' }}>4. Información sobre la operación</div>
            <div style={grid3}>
              <div><label style={labelMini}>Forma de pago</label><select value={aml.forma_pago} onChange={(e) => setAml({ ...aml, forma_pago: e.target.value })} style={{ ...inputBase, background: '#fff' }}>{FORMAS_PAGO.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
              <div><label style={labelMini}>Banco de origen</label><input value={aml.banco_origen} onChange={(e) => setAml({ ...aml, banco_origen: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Titular de la cuenta</label><input value={aml.titular_cuenta} onChange={(e) => setAml({ ...aml, titular_cuenta: e.target.value })} style={inputBase} /></div>
            </div>
            <div><label style={labelMini}>Propósito de la operación</label><select value={aml.proposito} onChange={(e) => setAml({ ...aml, proposito: e.target.value })} style={{ ...inputBase, background: '#fff' }}>{PROPOSITOS.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', marginTop: '8px', cursor: 'pointer', fontSize: '10.5px', color: '#475569', fontWeight: 600 }}>
              <input type="checkbox" checked={aml.actua_cuenta_propia} onChange={(e) => setAml({ ...aml, actua_cuenta_propia: e.target.checked })} style={{ marginTop: '2px', width: '14px', height: '14px', cursor: 'pointer' }} />
              <span>✓ El cliente actúa por cuenta propia</span>
            </label>
          </div>
          <div style={{ background: '#FDDEDE', border: '1px solid #F09595', borderRadius: '9px', padding: '11px 13px', marginBottom: '10px' }}>
            <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#8B1A1A', textTransform: 'uppercase', marginBottom: '8px' }}>5. Evaluación de riesgo (uso interno)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
              <div><label style={labelMini}>Clasificación</label><select value={aml.riesgo} onChange={(e) => setAml({ ...aml, riesgo: e.target.value })} style={{ ...inputBase, background: '#fff' }}>{RIESGOS.map((o) => <option key={o} value={o}>{o || '— Seleccionar —'}</option>)}</select></div>
              <div><label style={labelMini}>Motivos / notas</label><input value={aml.riesgo_nota} placeholder="Observaciones internas" onChange={(e) => setAml({ ...aml, riesgo_nota: e.target.value })} style={inputBase} /></div>
            </div>
          </div>
          <div style={{ background: '#F4F6FB', border: '1px solid #C8D0E0', borderRadius: '9px', padding: '11px 13px', marginBottom: '14px' }}>
            <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#4A5272', textTransform: 'uppercase', marginBottom: '8px' }}>6. Declaraciones del cliente · AML/PLD (obligatorias)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10.5px', color: '#475569', fontWeight: 600 }}>
              {chk('decl_licitos', 'Recursos de actividades lícitas — declarado bajo protesta')}
              {chk('decl_no_lavado', 'No participa en lavado de dinero ni financiamiento al terrorismo')}
              {chk('decl_veraz', 'Información veraz, completa y comprobable')}
              {chk('decl_reporte', 'Acepta que la empresa reporte operaciones cuando la ley lo exija')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
            <button onClick={() => setVista('roadmap')} disabled={guardandoForm} style={{ fontSize: '11px', fontWeight: 600, padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>Cancelar</button>
            <button onClick={guardarAml} disabled={guardandoForm} style={{ fontSize: '11px', fontWeight: 700, padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#8B1A1A,#b91c1c)', color: '#fff', cursor: guardandoForm ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', opacity: guardandoForm ? 0.6 : 1 }}>{guardandoForm ? 'Guardando…' : '💾 Guardar PLD'}</button>
          </div>
        </div>
      </Overlay>
    )
  }

  // ═════════ VISTA ROADMAP (principal) ═════════
  const inputBig: React.CSSProperties = {
    width: '100%', padding: '9px 11px', border: '1.5px solid #cbd5e1',
    borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box',
  }
  const labelBig: React.CSSProperties = {
    display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 600,
    marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.4px',
  }
  const paso1Hecho = apartadoId !== null

  return (
    <Overlay maxW={620} onBackdrop={() => { if (!creando) onCerrar() }}>
      <div style={{ padding: '18px 22px', background: 'linear-gradient(135deg,#0c4a6e,#1e40af)', color: '#fff' }}>
        <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', opacity: .85, marginBottom: '3px' }}>📝 ETAPA 4 · PRE-CLIENTE · KYC / AML / PLD / CARTA</div>
        <div style={{ fontSize: '14px', fontWeight: 700 }}>{prospectoNombre} · {prospectoFolio}</div>
        <div style={{ fontSize: '11px', opacity: .85, marginTop: '2px' }}>Inicia el proceso de compra y prepara la documentación de cumplimiento</div>
      </div>

      <div style={{ padding: '22px', fontFamily: 'Sora, sans-serif' }}>
        {cargando ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Cargando...</div>
        ) : bloqueo ? (
          <div>
            <div style={{ padding: '16px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', color: '#78350f', fontSize: '12px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>⚠️ {bloqueo}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button onClick={onCerrar} style={{ fontSize: '11px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>Entendido</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0C2D58', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '.4px' }}>📋 Paso 1 · Iniciar Proceso de Compra</div>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelBig}>🏠 Garantía a apartar *</label>
                <select value={garantiaSel} onChange={(e) => setGarantiaSel(e.target.value ? Number(e.target.value) : '')} disabled={paso1Hecho} style={{ ...inputBig, background: paso1Hecho ? '#f1f5f9' : '#fff' }}>
                  {garantias.map((g) => <option key={g.id} value={g.id}>{g.folio}{g.id === favoritaId ? ' ⭐' : ''}{g.direccion ? ' · ' + g.direccion.substring(0, 55) : ''}</option>)}
                </select>
                {favoritaId && <div style={{ fontSize: '9.5px', color: '#94a3b8', fontStyle: 'italic', marginTop: '3px' }}>⭐ = garantía favorita marcada en la visita</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={labelBig}>💰 Monto del apartado</label><input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} disabled={paso1Hecho} placeholder="$0.00" style={{ ...inputBig, fontFamily: 'monospace', background: paso1Hecho ? '#f1f5f9' : '#fff' }} /></div>
                <div><label style={labelBig}>📅 Fecha</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={paso1Hecho} style={{ ...inputBig, background: paso1Hecho ? '#f1f5f9' : '#fff' }} /></div>
              </div>
              {!paso1Hecho ? (
                <button onClick={iniciarProceso} disabled={creando} style={{ marginTop: '12px', width: '100%', fontSize: '11.5px', fontWeight: 700, padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#0c4a6e,#1e40af)', color: '#fff', cursor: creando ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', opacity: creando ? 0.6 : 1 }}>{creando ? 'Creando apartado...' : '📋 Iniciar Proceso de Compra'}</button>
              ) : (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', fontSize: '11.5px', color: '#15803d', fontWeight: 600 }}>✅ Apartado creado: <span style={{ fontFamily: 'monospace' }}>{folioApartado}</span></div>
              )}
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0C2D58', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '.4px' }}>🔒 Pasos del proceso de cumplimiento</div>
              {PASOS.map((p) => {
                let hecho = false
                let activo = false
                let accion: (() => void) | null = null
                if (p.n === 1) hecho = paso1Hecho
                if (p.n === 2) { hecho = kycHecho; activo = paso1Hecho; if (paso1Hecho) accion = () => setVista('kyc') }
                if (p.n === 3) { hecho = amlHecho; activo = kycHecho; if (kycHecho) accion = () => setVista('aml') }
                const desbloqueado = p.n <= 3
                return (
                  <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 11px', background: hecho ? '#dcfce7' : '#fff', border: `1.5px solid ${hecho ? '#86efac' : '#cbd5e1'}`, borderRadius: '8px', marginBottom: '7px', opacity: activo || hecho ? 1 : 0.5 }}>
                    <span style={{ fontSize: '14px' }}>{hecho ? '✅' : p.icon}</span>
                    <div style={{ flex: 1, fontSize: '11px', color: '#475569' }}><strong>Paso {p.n}.</strong> {p.label}</div>
                    {accion ? (
                      <button onClick={accion} style={{ fontSize: '10px', fontWeight: 700, padding: '6px 12px', borderRadius: '7px', border: 'none', background: hecho ? '#16a34a' : (p.n === 2 ? 'linear-gradient(135deg,#0c4a6e,#1e40af)' : 'linear-gradient(135deg,#8B1A1A,#b91c1c)'), color: '#fff', cursor: 'pointer', fontFamily: 'Sora, sans-serif', whiteSpace: 'nowrap' }}>{hecho ? '✏️ Editar' : 'Llenar'}</button>
                    ) : !desbloqueado ? (
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', background: '#eef1f5', padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>PRÓXIMAMENTE</span>
                    ) : (
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>🔒</span>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button onClick={onCerrar} disabled={creando} style={{ fontSize: '11px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>Cerrar</button>
            </div>
          </>
        )}
      </div>
    </Overlay>
  )
}