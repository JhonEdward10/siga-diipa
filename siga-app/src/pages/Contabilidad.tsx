import ModuloLayout, { type Seccion } from '../components/ModuloLayout'

const secciones: Seccion[] = [
  { key: 'cobros', icono: '💵', label: 'Cobros', titulo: 'Cobros', desc: 'Gestión de cobros y pagos pendientes', badge: 'Finanzas' },
  { key: 'cfdi', icono: '🧾', label: 'CFDI', titulo: 'CFDI', desc: 'Facturación electrónica y comprobantes', badge: 'Finanzas' },
  { key: 'comisiones', icono: '💰', label: 'Comisiones', titulo: 'Comisiones', desc: 'Cálculo y pago de comisiones', badge: 'Finanzas' },
  { key: 'reportes', icono: '📊', label: 'Reportes', titulo: 'Reportes financieros', desc: 'Estados de cuenta e indicadores', badge: 'Finanzas' },
]

export default function Contabilidad() {
  return <ModuloLayout tituloModulo="Contabilidad y Finanzas" tituloSidebar="Contabilidad · Operaciones" color="#0F6E56" colorBg="#E1F5EE" secciones={secciones} />
}