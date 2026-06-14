import ModuloLayout, { type Seccion } from '../components/ModuloLayout'

const secciones: Seccion[] = [
  { key: 'capital', icono: '👥', label: 'Capital Humano', titulo: 'Capital Humano', desc: 'Plantilla · nómina · IMSS · gestión del personal', badge: 'Recursos Humanos' },
]

export default function RecursosHumanos() {
  return <ModuloLayout tituloModulo="Recursos Humanos" tituloSidebar="RH · Operaciones" color="#1D9E75" colorBg="#E1F5EE" secciones={secciones} />
}