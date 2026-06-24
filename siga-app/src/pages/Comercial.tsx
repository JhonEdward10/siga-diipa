import ModuloLayout, { type Seccion } from '../components/ModuloLayout'
import Prospectos from './secciones/Prospectos'
import Catalogo from './secciones/Catalogo'
import ReportesComerciales from './secciones/ReportesComerciales'
import SeguimientoGeneral from './secciones/SeguimientoGeneral'
import Apartados from './secciones/Apartados'
import Contratos from './secciones/Contratos'

const secciones: Seccion[] = [
  { key: 'catalogo', icono: '🏘️', label: 'Catálogo', titulo: 'Catálogo', desc: 'Catálogo de propiedades publicadas para venta', badge: 'Comercial', contenido: <Catalogo /> },
  { key: 'reportes', icono: '📊', label: 'Reportes', titulo: 'Reportes', desc: 'Indicadores y reportes del área comercial', badge: 'Comercial', contenido: <ReportesComerciales /> },
  { key: 'prospectos', icono: '🎯', label: 'Prospectos e Interacciones', titulo: 'Prospectos e Interacciones', desc: 'CRM · Pipeline comercial · seguimiento de prospectos', badge: 'CRM', contenido: <Prospectos /> },
  { key: 'apartados', icono: '🔑', label: 'Apartados', titulo: 'Apartados', desc: 'Proceso de compra · Cláusula 4ª · KYC · PLD · comprobante', badge: 'Proceso de compra', contenido: <Apartados /> },
  { key: 'seguimiento', icono: '📋', label: 'Seguimiento general', titulo: 'Seguimiento general', desc: 'Seguimiento global de la actividad comercial', badge: 'Comercial', contenido: <SeguimientoGeneral /> },
  { key: 'contratos', icono: '📜', label: 'Contratos', titulo: 'Contratos', desc: 'Contrato del cliente · firma · cláusulas · estados', badge: 'Proceso de compra', contenido: <Contratos /> },
]

export default function Comercial() {
  return <ModuloLayout tituloModulo="Comercial" tituloSidebar="Comercial · Operaciones" color="#185FA5" colorBg="#E6F1FB" secciones={secciones} />
}