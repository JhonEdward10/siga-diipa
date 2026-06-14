import ModuloLayout, { type Seccion } from '../components/ModuloLayout'

const secciones: Seccion[] = [
  { key: 'procesos', icono: '⚖️', label: 'Demandas y Litigios', titulo: 'Demandas, Litigios y Procesos', desc: 'Gestión de demandas, litigios y procesos legales', badge: 'Jurídico' },
]

export default function Juridico() {
  return <ModuloLayout tituloModulo="Departamento Jurídico" tituloSidebar="Jurídico · Operaciones" color="#0C447C" colorBg="#E6F1FB" secciones={secciones} />
}