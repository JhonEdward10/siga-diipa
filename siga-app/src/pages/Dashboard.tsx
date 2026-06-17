import ModuloLayout, { type Seccion } from '../components/ModuloLayout'
import DashboardGlobal from './secciones/DashboardGlobal'

const secciones: Seccion[] = [
  { key: 'global', icono: '📊', label: 'Vista global', titulo: 'Dashboard DGE', desc: 'Vista global · KPIs · pendientes de toda la operación', badge: 'Dirección General', contenido: <DashboardGlobal /> },
]

export default function Dashboard() {
  return <ModuloLayout tituloModulo="Dashboard DGE" tituloSidebar="Dirección · Indicadores" color="#042C53" colorBg="#E6F1FB" secciones={secciones} />
}