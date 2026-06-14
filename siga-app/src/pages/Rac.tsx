import ModuloLayout, { type Seccion } from '../components/ModuloLayout'

const secciones: Seccion[] = [
  { key: 'motor', icono: '🎧', label: 'Motor de Crisis RAC', titulo: 'Retención y Devoluciones — Motor de Crisis RAC', desc: 'Gestión de retención de clientes y devoluciones · Cláusula 16ª', badge: 'RAC' },
]

export default function Rac() {
  return <ModuloLayout tituloModulo="Retención y Devoluciones" tituloSidebar="RAC · Operaciones" color="#378ADD" colorBg="#E6F1FB" secciones={secciones} />
}