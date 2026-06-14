import ModuloLayout, { type Seccion } from '../components/ModuloLayout'

const secciones: Seccion[] = [
  { key: 'roles', icono: '🛡️', label: 'Roles', titulo: 'Roles', desc: 'Definición de roles y niveles de acceso', badge: 'Configuración' },
  { key: 'usuarios', icono: '👤', label: 'Usuarios', titulo: 'Usuarios', desc: 'Alta y gestión de usuarios del sistema', badge: 'Configuración' },
  { key: 'firmantes', icono: '✍️', label: 'Firmantes', titulo: 'Firmantes', desc: 'Gestión de firmantes autorizados', badge: 'Configuración' },
]

export default function Configuracion() {
  return <ModuloLayout tituloModulo="Configuración" tituloSidebar="Configuración · Sistema" color="#5d6b80" colorBg="#dde3ea" secciones={secciones} />
}