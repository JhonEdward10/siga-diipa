import ModuloLayout, { type Seccion } from '../components/ModuloLayout'
import Administradoras from './secciones/Administradoras'

const secciones: Seccion[] = [
  { key: 'administradoras', icono: '🏦', label: 'Administradoras', titulo: 'Administradoras', desc: 'Catálogo de instituciones con folio automático · datos protegidos · vinculación con carteras', badge: 'Acceso solo Dirección', contenido: <Administradoras /> },
  { key: 'carteras', icono: '📂', label: 'Carteras y Garantías', titulo: 'Carteras y Garantías', desc: 'Gestión integral por origen · ADM · PRO · EXT · garantías vinculadas', badge: 'Acceso para todo el equipo' },
  { key: 'urrj', icono: '⚖️', label: 'Pre-dictamen URRJ', titulo: 'Pre-dictamen URRJ', desc: 'Auditor Legal MX · 4 hitos · firma verificada · resultados', badge: 'Próxima fase' },
  { key: 'catalogo', icono: '🏘️', label: 'Catálogo publicado', titulo: 'Catálogo publicado', desc: 'Activos aprobados desde URRJ y publicados para venta', badge: 'Próxima fase' },
]

export default function Carteras() {
  return <ModuloLayout tituloModulo="Gestión de Administradoras y Carteras" tituloSidebar="URRJ · Operaciones" color="#0F6E56" colorBg="#E1F5EE" secciones={secciones} />
}