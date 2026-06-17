import ModuloLayout, { type Seccion } from '../components/ModuloLayout'
import Uac from './secciones/Uac'

const secciones: Seccion[] = [
  { key: 'uac', icono: '🎧', label: 'UAC', titulo: 'UAC — Unidad de Atención al Cliente', desc: 'Atención y gestión integral del cliente DIIPA', badge: 'Atención al Cliente', contenido: <Uac /> },
]

export default function Cliente() {
  return <ModuloLayout tituloModulo="Cliente DIIPA" tituloSidebar="UAC · Atención" color="#1D9E75" colorBg="#E1F5EE" secciones={secciones} />
}