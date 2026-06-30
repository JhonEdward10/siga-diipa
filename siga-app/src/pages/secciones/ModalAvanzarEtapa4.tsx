import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

/* ════════════════════════════════════════════════════════════════════
   MODAL ETAPA 3 → 4 · Pre-cliente · KYC / AML / PLD / Carta
   ETAPA 4 COMPLETA (pasos 1 a 6).

     - PASO 1 · Iniciar Proceso de Compra → apartados
     - PASO 2 · KYC oficial DIIPA (7 secciones) → apartado_kyc
     - PASO 3 · AML/PLD → apartado_aml
     - PASO 4 · Descargar paquete PDF (KYC 7 secc + AML/PLD)
     - PASO 5 · Subir paquete firmado → Storage privado
     - PASO 6 · Solicitar Carta a Jurídico → avanza el prospecto a etapa 5
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
const ORIGEN_RECURSOS = ['', 'Sueldo', 'Ahorros', 'Actividad empresarial', 'Venta de bienes', 'Herencia', 'Otro']
const OBJETIVOS = ['', 'Adquirir vivienda a bajo costo', 'Patrimonio', 'Recuperación de garantía', 'Otro']
const FUENTES = ['Sueldo', 'Actividad empresarial', 'Servicios profesionales', 'Venta de bienes', 'Ahorros', 'Herencia', 'Otro']
const FORMAS_PAGO = ['Transferencia bancaria', 'Depósito', 'SPEI', 'Otro']
const PROPOSITOS = ['Prestación de servicios jurídicos', 'Compra de propiedad', 'Pagos de honorarios notariales', 'Otro']
const RIESGOS = ['', 'Riesgo Bajo', 'Riesgo Medio', 'Riesgo Alto']

const DOCS = [
  { campo: 'doc_acta_nacimiento', label: 'Acta de nacimiento' },
  { campo: 'doc_ine', label: 'INE' },
  { campo: 'doc_comprobante_domicilio', label: 'Comprobante de domicilio' },
  { campo: 'doc_constancia_fiscal', label: 'Constancia de situación fiscal' },
  { campo: 'doc_curp', label: 'CURP' },
  { campo: 'doc_rfc', label: 'RFC' },
  { campo: 'doc_formato_pld', label: 'Formato PLD/AML' },
  { campo: 'doc_formato_kyc', label: 'Formato KYC' },
  { campo: 'doc_formato_confidencialidad', label: 'Formato de confidencialidad' },
] as const

const KYC_VACIO = {
  nombre: '', fecha_nacimiento: '', curp: '', rfc: '', nacionalidad: 'Mexicana',
  estado_civil: '', ocupacion: '', telefono: '', correo: '',
  calle: '', colonia: '', municipio: '', estado: '', cp: '',
  id_tipo: 'INE', id_numero: '', id_vigencia: '',
  origen_recursos: '', monto_operacion: '', comprende_respaldo_contrato: '', comprende_devolucion: '',
  objetivo_operacion: '', entiende_diligencia_sin_fecha: '', entiende_garantia_contingente: '',
  doc_acta_nacimiento: false, doc_ine: false, doc_comprobante_domicilio: false,
  doc_constancia_fiscal: false, doc_curp: false, doc_rfc: false,
  doc_formato_pld: false, doc_formato_kyc: false, doc_formato_confidencialidad: false, doc_otros: '',
  declaraciones_aceptadas: false,
}
const AML_VACIO = {
  ingreso_mensual: '', fuente_ingresos: 'Sueldo', monto_inversion: '', recursos_licitos: false,
  forma_pago: 'Transferencia bancaria', banco_origen: '', titular_cuenta: '',
  proposito: 'Prestación de servicios jurídicos', actua_cuenta_propia: false,
  riesgo: '', riesgo_nota: '',
  decl_licitos: false, decl_no_lavado: false, decl_veraz: false, decl_reporte: false,
}

const DECLARACIONES_KYC = [
  'La información proporcionada es veraz y comprobable.',
  'Comprende que el objeto del servicio es la gestión y recuperación de una garantía contingente para acceder a una vivienda a bajo costo.',
  'Reconoce que su capital está respaldado por contrato, con derecho a solicitar devolución conforme a los acuerdos.',
  'Entiende que la empresa realiza gestiones diligentes; los tiempos dependen de los juzgados y autoridades, y NO se garantiza un plazo fijo.',
  'Entiende que la operación tiene un componente de riesgo procesal inherente a la naturaleza contingente de la garantía.',
  'Acepta los términos de confidencialidad y uso de información establecidos por la empresa.',
]

type KycState = typeof KYC_VACIO
type AmlState = typeof AML_VACIO

// ───────── helpers ─────────
function esc(v: unknown): string {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function money(v: unknown): string {
  const n = Number(v)
  if (!v || isNaN(n)) return ''
  return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function siNo(v: string): string {
  if (v === 'si') return 'Sí'
  if (v === 'no') return 'No'
  return '—'
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

// ───────── Generador del PDF del paquete (KYC 7 secciones + AML/PLD) ─────────
function generarPaquetePDF(opts: {
  prospectoFolio: string
  folioApartado: string
  kyc: KycState
  aml: AmlState
}): boolean {
  const { prospectoFolio, folioApartado, kyc, aml } = opts
  const fechaDoc = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  const folioKYC = 'KYC-' + folioApartado.replace('APT-', '')
  const folioPLD = 'PLD-' + folioApartado.replace('APT-', '')

  const fila = (lbl: string, val: string) =>
    `<tr><td class="lbl">${lbl}</td><td class="val${val ? '' : ' empty'}">${esc(val) || '—'}</td></tr>`
  const check = (b: boolean, txt: string) =>
    `<div class="item"><span class="mark">${b ? '☑' : '☐'}</span><span>${txt}</span></div>`

  const membrete = `
    <div class="membrete">
      <div class="empresa">DIIPA · Inmuebles Accesibles</div>
      <div class="razon">Desarrollos Inteligentes de Inmuebles y Propiedades Accesibles, S.A. de C.V.</div>
    </div>`
  const titulo = (t: string, sub: string, folio: string) => `
    <div class="titulo">
      <div class="t">${t}</div>
      <div class="sub">${sub}</div>
      <div class="folio">Folio: ${folio}</div>
    </div>`
  const firmas = (rolDer: string) => `
    <div class="firmas">
      <div class="firma"><div class="linea">${esc(kyc.nombre) || '_____________________'}</div><div class="rol">Firma del cliente</div></div>
      <div class="firma"><div class="linea">${rolDer}</div><div class="rol">DIIPA · Inmuebles Accesibles</div></div>
    </div>`

  // ── PÁGINA 1 · KYC (7 secciones) ──
  const paginaKyc = `
    ${membrete}
    ${titulo('Formato KYC', 'Conoce a tu Cliente · Identificación y debida diligencia', folioKYC)}
    <div class="exp">Expediente del prospecto: <strong>${esc(prospectoFolio)}</strong> · Apartado: <strong>${esc(folioApartado)}</strong></div>

    <div class="seccion"><h2>1 · Datos generales del cliente</h2><table>
      ${fila('Nombre completo', kyc.nombre)}
      ${fila('Fecha de nacimiento', kyc.fecha_nacimiento)}
      ${fila('CURP', kyc.curp)}
      ${fila('RFC', kyc.rfc)}
      ${fila('Nacionalidad', kyc.nacionalidad)}
      ${fila('Estado civil', kyc.estado_civil)}
      ${fila('Ocupación / Actividad', kyc.ocupacion)}
      ${fila('Teléfono', kyc.telefono)}
      ${fila('Correo electrónico', kyc.correo)}
    </table></div>

    <div class="seccion"><h2>2 · Domicilio del cliente</h2><table>
      ${fila('Calle y número', kyc.calle)}
      ${fila('Colonia', kyc.colonia)}
      ${fila('Municipio / Ciudad', kyc.municipio)}
      ${fila('Estado', kyc.estado)}
      ${fila('Código postal', kyc.cp)}
    </table></div>

    <div class="seccion"><h2>3 · Identificación oficial</h2><table>
      ${fila('Tipo de identificación', kyc.id_tipo)}
      ${fila('Número / folio', kyc.id_numero)}
      ${fila('Vigencia', kyc.id_vigencia)}
    </table></div>

    <div class="seccion"><h2>4 · Información financiera y origen de recursos</h2><table>
      ${fila('Origen de los recursos', kyc.origen_recursos)}
      ${fila('Monto destinado a la operación', money(kyc.monto_operacion))}
      ${fila('Comprende respaldo por contrato', siNo(kyc.comprende_respaldo_contrato))}
      ${fila('Comprende derecho a devolución', siNo(kyc.comprende_devolucion))}
    </table></div>

    <div class="seccion"><h2>5 · Perfil y objetivo de la operación</h2><table>
      ${fila('Objetivo principal del cliente', kyc.objetivo_operacion)}
      ${fila('Entiende diligencia sin fecha fija', siNo(kyc.entiende_diligencia_sin_fecha))}
      ${fila('Entiende garantía contingente / pagos por etapas', siNo(kyc.entiende_garantia_contingente))}
    </table></div>

    <div class="seccion"><h2>6 · Documentación entregada</h2><div class="checks">
      ${DOCS.map((d) => check(kyc[d.campo] as boolean, d.label)).join('')}
      ${kyc.doc_otros ? `<div class="item"><span class="mark">☑</span><span>Otros: ${esc(kyc.doc_otros)}</span></div>` : ''}
    </div></div>

    <div class="seccion"><h2>7 · Declaraciones del cliente</h2><div class="checks">
      ${DECLARACIONES_KYC.map((d) => check(kyc.declaraciones_aceptadas, d)).join('')}
    </div></div>

    <div class="protesta"><strong>Declaración bajo protesta de decir verdad.</strong> El cliente manifiesta que los datos asentados en el presente formato son ciertos, completos y comprobables, conforme a la <strong>Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (LFPIORPI)</strong> y a las políticas internas de DIIPA · Inmuebles Accesibles.</div>
    ${firmas('Asesor DIIPA')}
    <div class="watermark">KYC</div>`

  // ── PÁGINA 2 · AML/PLD ──
  const paginaAml = `
    ${membrete}
    ${titulo('Formato AML / PLD', 'Prevención de lavado de dinero · LFPIORPI', folioPLD)}
    <div class="exp">Expediente del prospecto: <strong>${esc(prospectoFolio)}</strong> · Apartado: <strong>${esc(folioApartado)}</strong></div>

    <div class="seccion"><h2>1 · Identificación del cliente</h2><table>
      ${fila('Nombre completo', kyc.nombre)}
      ${fila('CURP', kyc.curp)}
      ${fila('RFC', kyc.rfc)}
      ${fila('Teléfono', kyc.telefono)}
    </table></div>

    <div class="seccion"><h2>2 · Perfil transaccional</h2><table>
      ${fila('Ingreso mensual aproximado', money(aml.ingreso_mensual))}
      ${fila('Fuente principal de ingresos', aml.fuente_ingresos)}
      ${fila('Monto de la inversión', money(aml.monto_inversion))}
    </table></div>

    <div class="seccion"><h2>3 · Información sobre la operación</h2><table>
      ${fila('Forma de pago', aml.forma_pago)}
      ${fila('Banco de origen', aml.banco_origen)}
      ${fila('Titular de la cuenta', aml.titular_cuenta)}
      ${fila('Propósito de la operación', aml.proposito)}
    </table></div>

    <div class="seccion"><h2>4 · Evaluación de riesgo (uso interno)</h2><table>
      ${fila('Clasificación del cliente', aml.riesgo || 'No clasificado')}
      ${fila('Motivos / notas', aml.riesgo_nota)}
    </table></div>

    <div class="seccion"><h2>5 · Declaraciones del cliente · AML/PLD</h2><div class="checks">
      ${check(aml.recursos_licitos, 'Los recursos provienen de actividades lícitas.')}
      ${check(aml.actua_cuenta_propia, 'El cliente actúa por cuenta propia.')}
      ${check(aml.decl_licitos, 'Recursos lícitos — declarado bajo protesta de decir verdad.')}
      ${check(aml.decl_no_lavado, 'No participa en lavado de dinero ni en financiamiento al terrorismo.')}
      ${check(aml.decl_veraz, 'Información veraz, completa y comprobable.')}
      ${check(aml.decl_reporte, 'Acepta que la empresa reporte operaciones cuando la ley lo exija.')}
    </div></div>

    <div class="protesta"><strong>Manifestación de cumplimiento normativo.</strong> El cliente declara, bajo protesta de decir verdad, que los recursos destinados a la presente operación provienen de actividades lícitas, y acepta las obligaciones de identificación, registro y reporte previstas en la <strong>LFPIORPI</strong>, su Reglamento y las Reglas de Carácter General de la S.H.C.P.</div>
    ${firmas('Oficial de Cumplimiento')}
    <div class="watermark">PLD</div>`

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Paquete Apartado · ${esc(folioApartado)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;margin:0;padding:36px 44px;font-size:10.5pt;line-height:1.5}
  .membrete{border-bottom:2px solid #0c4a6e;padding-bottom:8px;margin-bottom:14px}
  .membrete .empresa{font-size:15pt;font-weight:800;color:#0c4a6e;letter-spacing:.5px}
  .membrete .razon{font-size:8.5pt;color:#5b6577}
  .titulo{margin-bottom:8px}
  .titulo .t{font-size:14pt;font-weight:800;color:#042c53}
  .titulo .sub{font-size:9pt;color:#5b6577}
  .titulo .folio{font-size:9pt;font-family:monospace;font-weight:700;color:#0c4a6e;margin-top:2px}
  .exp{font-size:9pt;color:#5b6577;text-align:right;margin-bottom:10px}
  .seccion{margin-bottom:12px}
  .seccion h2{font-size:10pt;font-weight:700;color:#0c4a6e;background:#eef7ff;padding:5px 9px;border-radius:5px;margin:0 0 6px}
  table{width:100%;border-collapse:collapse}
  td.lbl{width:42%;padding:5px 9px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;color:#475569;font-size:9.5pt}
  td.val{padding:5px 9px;border:1px solid #e2e8f0;font-size:9.5pt}
  td.val.empty{color:#cbd5e1}
  .checks{display:flex;flex-direction:column;gap:4px}
  .item{display:flex;gap:7px;align-items:flex-start;font-size:9.5pt}
  .mark{font-size:11pt;line-height:1}
  .protesta{font-size:8.5pt;color:#475569;background:#f8fafc;border-left:3px solid #0c4a6e;padding:9px 12px;border-radius:4px;margin:14px 0;text-align:justify}
  .firmas{display:flex;justify-content:space-between;margin-top:42px;gap:40px}
  .firma{flex:1;text-align:center}
  .firma .linea{border-top:1px solid #0f172a;padding-top:5px;font-weight:600;font-size:9.5pt}
  .firma .rol{font-size:8pt;color:#5b6577;margin-top:2px}
  .watermark{position:fixed;bottom:30px;right:40px;font-size:40pt;font-weight:800;color:rgba(12,74,110,.05);letter-spacing:4px}
  .page-break{break-before:page;page-break-before:always}
  .pagina{break-inside:avoid-page}
  .pie{margin-top:20px;border-top:1px solid #e2e8f0;padding-top:8px;font-size:8pt;color:#94a3b8;text-align:center}
  @media print{body{padding:0}.watermark{position:fixed}}
</style></head><body>
  <div class="pagina">${paginaKyc}</div>
  <div class="pagina page-break">${paginaAml}</div>
  <div class="pie">Documento generado por SIGA-DIIPA · ${fechaDoc} · Paquete Apartado ${esc(folioApartado)} · KYC ${folioKYC} · PLD ${folioPLD} · Uso interno confidencial</div>
  <script>window.onload=function(){window.print()}</script>
</body></html>`

  const win = window.open('', '_blank')
  if (!win) return false
  win.document.write(html)
  win.document.close()
  return true
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

  // Pasos 4-6
  const [descargado, setDescargado] = useState(false)
  const [archivoFirmado, setArchivoFirmado] = useState<{ path: string; nombre: string } | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [enviando, setEnviando] = useState(false)

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
    setDescargado(false)
    setArchivoFirmado(null)
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
      .select('id, folio, garantia_id, monto_apartado, comprobante_subido')
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
        origen_recursos: k.origen_recursos || '', monto_operacion: k.monto_operacion != null ? String(k.monto_operacion) : '',
        comprende_respaldo_contrato: k.comprende_respaldo_contrato || '', comprende_devolucion: k.comprende_devolucion || '',
        objetivo_operacion: k.objetivo_operacion || '', entiende_diligencia_sin_fecha: k.entiende_diligencia_sin_fecha || '',
        entiende_garantia_contingente: k.entiende_garantia_contingente || '',
        doc_acta_nacimiento: !!k.doc_acta_nacimiento, doc_ine: !!k.doc_ine,
        doc_comprobante_domicilio: !!k.doc_comprobante_domicilio, doc_constancia_fiscal: !!k.doc_constancia_fiscal,
        doc_curp: !!k.doc_curp, doc_rfc: !!k.doc_rfc, doc_formato_pld: !!k.doc_formato_pld,
        doc_formato_kyc: !!k.doc_formato_kyc, doc_formato_confidencialidad: !!k.doc_formato_confidencialidad,
        doc_otros: k.doc_otros || '', declaraciones_aceptadas: !!k.declaraciones_aceptadas,
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
    if (!kyc.declaraciones_aceptadas) { alert('⚠ El cliente debe aceptar las declaraciones de la sección 7.'); return }

    setGuardandoForm(true)
    const ahora = new Date().toISOString()
    const fila = {
      apartado_id: apartadoId, nombre, curp, rfc,
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
      origen_recursos: kyc.origen_recursos || null,
      monto_operacion: kyc.monto_operacion ? Number(kyc.monto_operacion) : null,
      comprende_respaldo_contrato: kyc.comprende_respaldo_contrato || null,
      comprende_devolucion: kyc.comprende_devolucion || null,
      objetivo_operacion: kyc.objetivo_operacion || null,
      entiende_diligencia_sin_fecha: kyc.entiende_diligencia_sin_fecha || null,
      entiende_garantia_contingente: kyc.entiende_garantia_contingente || null,
      doc_acta_nacimiento: kyc.doc_acta_nacimiento, doc_ine: kyc.doc_ine,
      doc_comprobante_domicilio: kyc.doc_comprobante_domicilio, doc_constancia_fiscal: kyc.doc_constancia_fiscal,
      doc_curp: kyc.doc_curp, doc_rfc: kyc.doc_rfc, doc_formato_pld: kyc.doc_formato_pld,
      doc_formato_kyc: kyc.doc_formato_kyc, doc_formato_confidencialidad: kyc.doc_formato_confidencialidad,
      doc_otros: kyc.doc_otros.trim() || null,
      declaraciones_aceptadas: kyc.declaraciones_aceptadas,
      actualizado_en: ahora,
    }
    const { error } = await supabase.from('apartado_kyc').upsert(fila, { onConflict: 'apartado_id' })
    if (!error) await supabase.from('apartados').update({ kyc_completado: true, actualizado_en: ahora }).eq('id', apartadoId)
    setGuardandoForm(false)
    if (error) { alert('Error al guardar KYC: ' + error.message); return }
    setKyc({ ...kyc, curp, rfc, nombre })
    setKycHecho(true)
    setDescargado(false) // si edita, debe volver a descargar
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
    setDescargado(false)
    setVista('roadmap')
  }

  // PASO 4 · Descargar paquete
  function descargarPaquete() {
    if (!kycHecho || !amlHecho) { alert('⚠ Completa primero KYC y AML/PLD.'); return }
    const ok = generarPaquetePDF({ prospectoFolio, folioApartado, kyc, aml })
    if (!ok) { alert('⚠ El navegador bloqueó la ventana. Permite las ventanas emergentes para descargar el paquete.'); return }
    setDescargado(true)
  }

  // PASO 5 · Subir paquete firmado
  async function subirFirmado(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0]
    if (!file || !apartadoId) return
    setSubiendo(true)
    const ext = (file.name.split('.').pop() || 'pdf').toLowerCase()
    const path = `${prospectoId}/apartado/${folioApartado}-paquete.${ext}`
    const { error } = await supabase.storage.from('documentos-prospectos').upload(path, file, { upsert: true })
    if (error) {
      setSubiendo(false)
      alert('❌ No se pudo subir: ' + error.message)
      e.target.value = ''
      return
    }
    await supabase.from('apartados').update({ comprobante_subido: true, actualizado_en: new Date().toISOString() }).eq('id', apartadoId)
    setArchivoFirmado({ path, nombre: file.name })
    setSubiendo(false)
  }

  // PASO 6 · Solicitar carta a Jurídico → avanza a etapa 5
  async function solicitarCarta() {
    if (!apartadoId || !descargado || !archivoFirmado) {
      alert('🚫 Faltan pasos. Descarga el paquete y sube el firmado antes de solicitar la carta.')
      return
    }
    if (!confirm('📨 Solicitar Carta de Apartado\n\nSe enviará la solicitud al Departamento Jurídico con todos los datos (KYC + AML/PLD + paquete firmado) y el prospecto se convertirá en Cliente DIIPA (etapa 5).\n\n¿Confirmas?')) return

    setEnviando(true)
    const { data: auth } = await supabase.auth.getUser()
    const usuario = auth.user?.email || 'Sistema'
    const ahora = new Date().toISOString()

    // Marca el apartado como enviado a Jurídico
    const { error: errA } = await supabase
      .from('apartados')
      .update({ estatus: 'confirmado', actualizado_en: ahora })
      .eq('id', apartadoId)
    if (errA) { setEnviando(false); alert('Error al actualizar el apartado: ' + errA.message); return }

    // Avanza el prospecto a etapa 5 + estatus cliente
    const { error: errP } = await supabase
      .from('prospectos')
      .update({ etapa: 5, estatus: 'cliente', actualizado_en: ahora })
      .eq('id', prospectoId)
    if (errP) { setEnviando(false); alert('Error al avanzar el prospecto: ' + errP.message); return }

    // Historial
    await supabase.from('prospecto_historial').insert({
      prospecto_id: prospectoId,
      etapa_desde: 4,
      etapa_hasta: 5,
      descripcion: `[Carta solicitada a Jurídico] Apartado ${folioApartado} · KYC + AML/PLD + paquete firmado enviados · Convertido a Cliente DIIPA`,
      creado_por: usuario,
    })

    setEnviando(false)
    onGuardado()
    alert('✅ Solicitud enviada al Departamento Jurídico.\n\nEl prospecto ahora es Cliente DIIPA (etapa 5).')
    onCerrar()
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
  const secStyle = (bg: string, border: string): React.CSSProperties => ({
    background: bg, border: `1px solid ${border}`, borderRadius: '9px', padding: '11px 13px', marginBottom: '10px',
  })
  const secTitulo = (color: string): React.CSSProperties => ({
    fontSize: '9.5px', fontWeight: 700, color, textTransform: 'uppercase', marginBottom: '8px',
  })

  function SiNo({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
    const pill = (activo: boolean, color: string): React.CSSProperties => ({
      flex: 1, fontSize: '10.5px', fontWeight: 700, padding: '7px 0', borderRadius: '6px',
      border: `1.5px solid ${activo ? color : '#cbd5e1'}`,
      background: activo ? color : '#fff', color: activo ? '#fff' : '#64748b',
      cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    })
    return (
      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
        <button type="button" onClick={() => onChange('si')} style={pill(valor === 'si', '#15803d')}>Sí</button>
        <button type="button" onClick={() => onChange('no')} style={pill(valor === 'no', '#b91c1c')}>No</button>
      </div>
    )
  }

  // ═════════ VISTA KYC ═════════
  if (vista === 'kyc') {
    return (
      <Overlay maxW={700} onBackdrop={() => { if (!guardandoForm) onCerrar() }}>
        <div style={{ padding: '18px 22px', background: 'linear-gradient(135deg,#0c4a6e,#1e40af)', color: '#fff' }}>
          <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1px', opacity: .85, marginBottom: '3px' }}>2️⃣ FORMATO KYC · Conoce a tu Cliente · DIIPA</div>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>{prospectoNombre} · {prospectoFolio}</div>
        </div>
        <div style={{ padding: '20px', fontFamily: 'Sora, sans-serif', maxHeight: '72vh', overflowY: 'auto' }}>
          <div style={secStyle('#eef7ff', '#B5D4F4')}>
            <div style={secTitulo('#185FA5')}>1. Datos generales del cliente</div>
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
              <div><label style={labelMini}>Ocupación / Actividad</label><input value={kyc.ocupacion} placeholder="Empleado, comerciante" onChange={(e) => setKyc({ ...kyc, ocupacion: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Teléfono</label><input value={kyc.telefono} onChange={(e) => setKyc({ ...kyc, telefono: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Correo</label><input type="email" value={kyc.correo} onChange={(e) => setKyc({ ...kyc, correo: e.target.value })} style={inputBase} /></div>
            </div>
          </div>

          <div style={secStyle('#F4F6FB', '#C8D0E0')}>
            <div style={secTitulo('#4A5272')}>2. Domicilio del cliente</div>
            <div style={grid3}>
              <div><label style={labelMini}>Calle y número</label><input value={kyc.calle} placeholder="Av. Insurgentes 123" onChange={(e) => setKyc({ ...kyc, calle: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Colonia</label><input value={kyc.colonia} onChange={(e) => setKyc({ ...kyc, colonia: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Municipio / Ciudad</label><input value={kyc.municipio} onChange={(e) => setKyc({ ...kyc, municipio: e.target.value })} style={inputBase} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><label style={labelMini}>Estado</label><input value={kyc.estado} onChange={(e) => setKyc({ ...kyc, estado: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Código Postal</label><input value={kyc.cp} maxLength={5} onChange={(e) => setKyc({ ...kyc, cp: e.target.value })} style={inputBase} /></div>
            </div>
          </div>

          <div style={secStyle('#F4F6FB', '#C8D0E0')}>
            <div style={secTitulo('#4A5272')}>3. Identificación oficial</div>
            <div style={{ ...grid3, marginBottom: 0 }}>
              <div><label style={labelMini}>Tipo de identificación</label><select value={kyc.id_tipo} onChange={(e) => setKyc({ ...kyc, id_tipo: e.target.value })} style={{ ...inputBase, background: '#fff' }}>{ID_TIPOS.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
              <div><label style={labelMini}>Número</label><input value={kyc.id_numero} placeholder="Folio/serie" onChange={(e) => setKyc({ ...kyc, id_numero: e.target.value })} style={inputBase} /></div>
              <div><label style={labelMini}>Vigencia</label><input type="date" value={kyc.id_vigencia} onChange={(e) => setKyc({ ...kyc, id_vigencia: e.target.value })} style={inputBase} /></div>
            </div>
          </div>

          <div style={secStyle('#fef3c7', '#fde68a')}>
            <div style={secTitulo('#92400e')}>4. Información financiera y origen de recursos</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div><label style={labelMini}>Origen de los recursos</label><select value={kyc.origen_recursos} onChange={(e) => setKyc({ ...kyc, origen_recursos: e.target.value })} style={{ ...inputBase, background: '#fff' }}>{ORIGEN_RECURSOS.map((o) => <option key={o} value={o}>{o || '— Seleccionar —'}</option>)}</select></div>
              <div><label style={labelMini}>Monto destinado a la operación</label><input type="number" value={kyc.monto_operacion} placeholder="$0.00" onChange={(e) => setKyc({ ...kyc, monto_operacion: e.target.value })} style={{ ...inputBase, fontFamily: 'monospace' }} /></div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={labelMini}>El cliente comprende que su capital está respaldado por contrato, con derecho a devolución</label>
              <SiNo valor={kyc.comprende_respaldo_contrato} onChange={(v) => setKyc({ ...kyc, comprende_respaldo_contrato: v })} />
            </div>
            <div>
              <label style={labelMini}>El cliente comprende que puede solicitar la devolución de su capital conforme al contrato</label>
              <SiNo valor={kyc.comprende_devolucion} onChange={(v) => setKyc({ ...kyc, comprende_devolucion: v })} />
            </div>
          </div>

          <div style={secStyle('#eef7ff', '#B5D4F4')}>
            <div style={secTitulo('#185FA5')}>5. Perfil y objetivo de la operación</div>
            <div style={{ marginBottom: '8px' }}>
              <label style={labelMini}>Objetivo principal del cliente</label>
              <select value={kyc.objetivo_operacion} onChange={(e) => setKyc({ ...kyc, objetivo_operacion: e.target.value })} style={{ ...inputBase, background: '#fff' }}>{OBJETIVOS.map((o) => <option key={o} value={o}>{o || '— Seleccionar —'}</option>)}</select>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={labelMini}>Entiende que la empresa gestiona con diligencia, SIN garantizar fecha específica de entrega</label>
              <SiNo valor={kyc.entiende_diligencia_sin_fecha} onChange={(v) => setKyc({ ...kyc, entiende_diligencia_sin_fecha: v })} />
            </div>
            <div>
              <label style={labelMini}>Entiende que es una garantía CONTINGENTE (sujeta a proceso judicial) y que los pagos son por etapas</label>
              <SiNo valor={kyc.entiende_garantia_contingente} onChange={(v) => setKyc({ ...kyc, entiende_garantia_contingente: v })} />
            </div>
          </div>

          <div style={secStyle('#F4F6FB', '#C8D0E0')}>
            <div style={secTitulo('#4A5272')}>6. Documentación entregada</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 14px' }}>
              {DOCS.map((d) => (
                <label key={d.campo} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '10.5px', color: '#475569', fontWeight: 600 }}>
                  <input type="checkbox" checked={kyc[d.campo] as boolean} onChange={(e) => setKyc({ ...kyc, [d.campo]: e.target.checked })} style={{ width: '14px', height: '14px', cursor: 'pointer' }} />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
            <div style={{ marginTop: '8px' }}>
              <label style={labelMini}>Otros documentos</label>
              <input value={kyc.doc_otros} onChange={(e) => setKyc({ ...kyc, doc_otros: e.target.value })} style={inputBase} />
            </div>
          </div>

          <div style={secStyle('#F4F6FB', '#C8D0E0')}>
            <div style={secTitulo('#4A5272')}>7. Declaraciones del cliente</div>
            <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.5, marginBottom: '10px' }}>
              El cliente declara que:
              <ul style={{ margin: '6px 0 0', paddingLeft: '16px' }}>
                {DECLARACIONES_KYC.map((d, i) => <li key={i} style={{ marginBottom: '3px' }}>{d}</li>)}
              </ul>
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', cursor: 'pointer', fontSize: '10.5px', color: '#0c4a6e', fontWeight: 700 }}>
              <input type="checkbox" checked={kyc.declaraciones_aceptadas} onChange={(e) => setKyc({ ...kyc, declaraciones_aceptadas: e.target.checked })} style={{ marginTop: '2px', width: '15px', height: '15px', cursor: 'pointer' }} />
              <span>✓ El cliente acepta y reconoce todas las declaraciones anteriores</span>
            </label>
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
    const chk = (campo: keyof AmlState, texto: string) => (
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
          <div style={secStyle('#fef3c7', '#fde68a')}>
            <div style={secTitulo('#92400e')}>3. Perfil transaccional</div>
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
          <div style={secStyle('#F4F6FB', '#C8D0E0')}>
            <div style={secTitulo('#4A5272')}>4. Información sobre la operación</div>
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
          <div style={secStyle('#FDDEDE', '#F09595')}>
            <div style={secTitulo('#8B1A1A')}>5. Evaluación de riesgo (uso interno)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
              <div><label style={labelMini}>Clasificación</label><select value={aml.riesgo} onChange={(e) => setAml({ ...aml, riesgo: e.target.value })} style={{ ...inputBase, background: '#fff' }}>{RIESGOS.map((o) => <option key={o} value={o}>{o || '— Seleccionar —'}</option>)}</select></div>
              <div><label style={labelMini}>Motivos / notas</label><input value={aml.riesgo_nota} placeholder="Observaciones internas" onChange={(e) => setAml({ ...aml, riesgo_nota: e.target.value })} style={inputBase} /></div>
            </div>
          </div>
          <div style={secStyle('#F4F6FB', '#C8D0E0')}>
            <div style={secTitulo('#4A5272')}>6. Declaraciones del cliente · AML/PLD (obligatorias)</div>
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
    <Overlay maxW={620} onBackdrop={() => { if (!creando && !enviando) onCerrar() }}>
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
                let etiquetaBtn = 'Llenar'

                if (p.n === 1) hecho = paso1Hecho
                if (p.n === 2) { hecho = kycHecho; activo = paso1Hecho; if (paso1Hecho) accion = () => setVista('kyc'); etiquetaBtn = hecho ? '✏️ Editar' : 'Llenar' }
                if (p.n === 3) { hecho = amlHecho; activo = kycHecho; if (kycHecho) accion = () => setVista('aml'); etiquetaBtn = hecho ? '✏️ Editar' : 'Llenar' }
                if (p.n === 4) { hecho = descargado; activo = kycHecho && amlHecho; if (activo) accion = descargarPaquete; etiquetaBtn = hecho ? '📄 Re-descargar' : '📄 Descargar' }
                if (p.n === 6) { activo = !!archivoFirmado; if (activo) accion = solicitarCarta; etiquetaBtn = enviando ? 'Enviando…' : '📨 Solicitar' }

                // Paso 5 es un input file especial
                if (p.n === 5) {
                  const activo5 = descargado
                  const hecho5 = !!archivoFirmado
                  return (
                    <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 11px', background: hecho5 ? '#dcfce7' : '#fff', border: `1.5px solid ${hecho5 ? '#86efac' : '#cbd5e1'}`, borderRadius: '8px', marginBottom: '7px', opacity: activo5 || hecho5 ? 1 : 0.5 }}>
                      <span style={{ fontSize: '14px' }}>{hecho5 ? '✅' : p.icon}</span>
                      <div style={{ flex: 1, fontSize: '11px', color: '#475569' }}>
                        <strong>Paso {p.n}.</strong> {p.label}
                        {archivoFirmado && <div style={{ fontSize: '10px', color: '#15803d', marginTop: '2px' }}>{archivoFirmado.nombre.substring(0, 32)}</div>}
                      </div>
                      <label style={{ fontSize: '10px', fontWeight: 700, padding: '6px 12px', borderRadius: '7px', fontFamily: 'Sora, sans-serif', whiteSpace: 'nowrap', background: activo5 && !hecho5 ? 'linear-gradient(135deg,#7c2d12,#c2410c)' : hecho5 ? '#16a34a' : '#cbd5e1', color: activo5 || hecho5 ? '#fff' : '#64748b', cursor: activo5 && !subiendo ? 'pointer' : 'not-allowed', pointerEvents: activo5 && !subiendo ? 'auto' : 'none' }}>
                        <span>{subiendo ? '⏳ Subiendo…' : hecho5 ? '✅ Subido' : '📤 Subir'}</span>
                        <input type="file" accept=".pdf,image/*" onChange={subirFirmado} disabled={!activo5 || subiendo} style={{ display: 'none' }} />
                      </label>
                    </div>
                  )
                }

                const desbloqueado = p.n <= 6
                return (
                  <div key={p.n} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 11px', background: hecho ? '#dcfce7' : '#fff', border: `1.5px solid ${hecho ? '#86efac' : '#cbd5e1'}`, borderRadius: '8px', marginBottom: '7px', opacity: activo || hecho ? 1 : 0.5 }}>
                    <span style={{ fontSize: '14px' }}>{hecho ? '✅' : p.icon}</span>
                    <div style={{ flex: 1, fontSize: '11px', color: '#475569' }}><strong>Paso {p.n}.</strong> {p.label}</div>
                    {accion ? (
                      <button onClick={accion} disabled={enviando} style={{ fontSize: '10px', fontWeight: 700, padding: '6px 12px', borderRadius: '7px', border: 'none', background: hecho ? '#16a34a' : (p.n === 2 ? 'linear-gradient(135deg,#0c4a6e,#1e40af)' : p.n === 3 ? 'linear-gradient(135deg,#8B1A1A,#b91c1c)' : p.n === 4 ? 'linear-gradient(135deg,#1e40af,#3b82f6)' : 'linear-gradient(135deg,#15803d,#22c55e)'), color: '#fff', cursor: enviando ? 'not-allowed' : 'pointer', fontFamily: 'Sora, sans-serif', whiteSpace: 'nowrap' }}>{etiquetaBtn}</button>
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
              <button onClick={onCerrar} disabled={creando || enviando} style={{ fontSize: '11px', fontWeight: 600, padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>Cerrar</button>
            </div>
          </>
        )}
      </div>
    </Overlay>
  )
}