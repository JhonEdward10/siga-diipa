import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Bienvenida() {
  const { session, salir } = useAuth()
  const navigate = useNavigate()

  const email = session?.user.email || 'usuario@diipadesarrollos.com'
  const nombre = email.split('@')[0].replace(/\./g, ' ').replace(/_/g, ' ')
  const nombreFormateado = nombre
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
  const primerNombre = nombreFormateado.split(' ')[0]

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const fecha = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  async function manejarSalir() {
    if (confirm('¿Estás segura de cerrar sesión?')) {
      await salir()
    }
  }

  const modulosPrincipales = [
    { icono: '🏦', titulo: 'Gestión de Administradoras y Carteras', desc: 'Revisión · pre-dictámenes URRJ · hitos legales', color: '#0F6E56', bg: '#E1F5EE' },
    { icono: '🏢', titulo: 'Comercial', desc: 'Prospectos · catálogo · marketing', color: '#185FA5', bg: '#E6F1FB' },
    { icono: '🏆', titulo: 'Cliente DIIPA', desc: 'Expediente · 13 pestañas integradas', color: '#1D9E75', bg: '#E1F5EE' },
  ]

  const modulosApoyo = [
    { icono: '⚖️', titulo: 'Jurídico', desc: 'Demandas · litigios · apartados', color: '#0C447C', bg: '#E6F1FB' },
    { icono: '💼', titulo: 'Contabilidad', desc: 'Cobros · CFDI · comisiones', color: '#085041', bg: '#E1F5EE' },
    { icono: '🎧', titulo: 'RAC · Retención', desc: 'Motor de Crisis · Cláusula 16ª', color: '#378ADD', bg: '#E6F1FB' },
    { icono: '👥', titulo: 'Recursos Humanos', desc: 'Plantilla · nómina · IMSS', color: '#1D9E75', bg: '#E1F5EE' },
  ]

  const modulosDireccion = [
    { icono: '📊', titulo: 'Dashboard DGE', desc: 'Vista global · KPIs · pendientes', color: '#042C53', bg: '#E6F1FB' },
    { icono: '⚙️', titulo: 'Configuración', desc: 'Usuarios · roles · firmantes', color: '#5d6b80', bg: '#dde3ea' },
  ]

  const Tarjeta = ({ m }: { m: typeof modulosPrincipales[0] }) => (
    <div onClick={() => {
      if (m.titulo === 'Gestión de Administradoras y Carteras') navigate('/carteras')
      if (m.titulo === 'Comercial') navigate('/comercial')
      if (m.titulo === 'Contabilidad') navigate('/contabilidad')
      if (m.titulo === 'Cliente DIIPA') navigate('/cliente')
      if (m.titulo === 'Jurídico') navigate('/juridico')
      if (m.titulo === 'RAC · Retención') navigate('/rac')
      if (m.titulo === 'Recursos Humanos') navigate('/recursos-humanos')
      if (m.titulo === 'Dashboard DGE') navigate('/dashboard')
      if (m.titulo === 'Configuración') navigate('/configuracion')
    }}
      className="relative overflow-hidden cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: '#fff', border: '0.5px solid #c8d0db', borderRadius: '12px', padding: '18px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: m.color }} />
      <div className="flex items-center justify-center mb-3"
        style={{ width: '38px', height: '38px', borderRadius: '9px', background: m.bg, fontSize: '20px' }}>
        {m.icono}
      </div>
      <h4 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px', color: '#042C53' }}>{m.titulo}</h4>
      <p style={{ fontSize: '11.5px', color: '#5d6b80', lineHeight: 1.5 }}>{m.desc}</p>
    </div>
  )

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', fontFamily: 'Sora, sans-serif', color: '#042C53' }}>

      {/* Header — se apila en móvil, en fila desde sm */}
      <header className="sticky top-0 z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '14px 18px' }}>
        {/* Logo + título */}
        <div className="flex items-center" style={{ gap: '12px', minWidth: 0 }}>
          <div className="flex items-center justify-center shrink-0"
            style={{ width: '42px', height: '42px', background: '#5DCAA5', borderRadius: '10px', fontWeight: 500, fontSize: '16px', color: '#04342C' }}>
            D
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 className="text-sm sm:text-base" style={{ fontWeight: 500, lineHeight: 1.25 }}>SIGA · Sistema Integral de Garantías</h1>
            <div style={{ fontSize: '10.5px', color: '#B5D4F4', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>DIIPA S.A. de C.V.</div>
          </div>
        </div>

        {/* Usuario + botones */}
        <div className="flex items-center justify-between sm:justify-end" style={{ gap: '10px' }}>
          <div className="text-left sm:text-right" style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>{nombreFormateado}</div>
            <div className="truncate" style={{ fontSize: '10.5px', color: '#B5D4F4', marginTop: '1px', maxWidth: '180px' }}>{email}</div>
          </div>
          <div className="flex items-center shrink-0" style={{ gap: '8px' }}>
            <button onClick={() => navigate('/agenda')}
              style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '7px 13px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              📅 <span className="hidden sm:inline">Agenda</span>
            </button>
            <button onClick={manejarSalir}
              style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '7px 13px', borderRadius: '8px', fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <span className="sm:hidden">Salir</span><span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="px-4 sm:px-6 pt-6 pb-12">

        {/* Banner de bienvenida */}
        <div style={{ background: '#fff', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(4,44,83,.06)', borderLeft: '3px solid #0C447C' }} className="p-4 sm:p-5">
          <h2 className="text-lg sm:text-xl" style={{ fontWeight: 500, marginBottom: '4px' }}>{saludo}, {primerNombre}</h2>
          <p style={{ color: '#4a5a6e', fontSize: '12.5px' }}>Selecciona el módulo en el que vas a trabajar hoy. Tus cambios se sincronizan automáticamente.</p>
          <span className="inline-block" style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '11px', color: '#0C447C', background: '#E6F1FB', padding: '3px 10px', borderRadius: '6px' }}>{fecha}</span>
        </div>

        {/* Operativo principal */}
        <section style={{ marginBottom: '26px' }}>
          <h3 style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#5d6b80', fontWeight: 500, marginBottom: '12px', paddingLeft: '4px' }}>Operativo principal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {modulosPrincipales.map((m) => <Tarjeta key={m.titulo} m={m} />)}
          </div>
        </section>

        {/* Áreas de apoyo */}
        <section style={{ marginBottom: '26px' }}>
          <h3 style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#5d6b80', fontWeight: 500, marginBottom: '12px', paddingLeft: '4px' }}>Áreas de apoyo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {modulosApoyo.map((m) => <Tarjeta key={m.titulo} m={m} />)}
          </div>
        </section>

        {/* Dirección y configuración */}
        <section style={{ marginBottom: '26px' }}>
          <h3 style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#5d6b80', fontWeight: 500, marginBottom: '12px', paddingLeft: '4px' }}>Dirección y configuración</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modulosDireccion.map((m) => <Tarjeta key={m.titulo} m={m} />)}
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '20px', fontSize: '10.5px', color: '#5d6b80', borderTop: '0.5px solid #c8d0db', letterSpacing: '0.4px' }}>
        DIIPA S.A. de C.V. · SIGA v4 · Mazatlán, Sinaloa
      </footer>

    </div>
  )
}