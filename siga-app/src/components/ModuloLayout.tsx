import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export type Seccion = {
  key: string
  icono: string
  label: string
  titulo: string
  desc: string
  badge: string
  contenido?: ReactNode
}

type Props = {
  tituloModulo: string
  tituloSidebar: string
  color: string
  colorBg: string
  secciones: Seccion[]
}

export default function ModuloLayout({ tituloModulo, tituloSidebar, color, colorBg, secciones }: Props) {
  const { session, salir } = useAuth()
  const navigate = useNavigate()
  const [activa, setActiva] = useState(secciones[0].key)

  const email = session?.user.email || 'usuario'
  const nombre = email.split('@')[0].replace(/\./g, ' ').replace(/_/g, ' ')
    .split(' ').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')

  const s = secciones.find((x) => x.key === activa) || secciones[0]

  async function manejarSalir() {
    if (confirm('¿Cerrar sesión?')) await salir()
  }

  return (
    <div style={{ fontFamily: 'Sora, sans-serif', background: '#f4f6f9', minHeight: '100vh', color: '#042C53' }}>
      {/* Header — se apila en móvil, en fila desde md */}
      <header className="sticky top-0 z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '12px 18px' }}>
        <div className="flex items-center" style={{ gap: '12px', minWidth: 0 }}>
          <div onClick={() => navigate('/')} className="flex items-center cursor-pointer shrink-0"
               style={{ gap: '10px', padding: '4px 8px 4px 4px', borderRadius: '9px' }}>
            <div className="flex items-center justify-center"
                 style={{ width: '40px', height: '40px', background: '#5DCAA5', borderRadius: '9px', fontWeight: 500, fontSize: '15px', color: '#04342C' }}>D</div>
            <div style={{ fontSize: '10px', color: '#B5D4F4', letterSpacing: '0.6px', textTransform: 'uppercase' }}>← Menú</div>
          </div>
          <div className="hidden md:block" style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ minWidth: 0 }}>
            <h1 className="text-sm md:text-base" style={{ fontWeight: 500, lineHeight: 1.25 }}>{tituloModulo}</h1>
            <div style={{ fontSize: '10.5px', color: '#B5D4F4', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '1px' }}>DIIPA S.A. de C.V.</div>
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-end" style={{ gap: '10px' }}>
          <div className="text-left md:text-right" style={{ minWidth: 0 }}>
            <div style={{ fontSize: '12.5px', fontWeight: 500 }}>{nombre}</div>
            <div className="truncate" style={{ fontSize: '10px', color: '#B5D4F4', maxWidth: '180px' }}>{email}</div>
          </div>
          <button onClick={manejarSalir} className="shrink-0"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '6px 12px', borderRadius: '7px', fontSize: '11.5px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <span className="md:hidden">Salir</span><span className="hidden md:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Layout: columna en móvil (menú arriba), fila en PC (sidebar a la izquierda) */}
      <div className="flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Sidebar / menú */}
        <aside className="md:w-[220px] md:shrink-0 md:border-r md:border-b-0 border-b"
               style={{ background: '#eef1f5', borderColor: '#c8d0db' }}>
          <div className="hidden md:block" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#5d6b80', fontWeight: 500, padding: '16px 16px 6px' }}>
            {tituloSidebar}
          </div>
          {/* En móvil: fila con scroll horizontal. En PC: columna. */}
          <div className="flex flex-row overflow-x-auto md:flex-col md:overflow-visible md:py-2">
            {secciones.map((it) => {
              const on = it.key === activa
              return (
                <div key={it.key} onClick={() => setActiva(it.key)}
                     className="flex items-center cursor-pointer whitespace-nowrap shrink-0"
                     style={{
                       gap: '10px', padding: '11px 16px', fontSize: '12.5px',
                       borderLeft: on ? `3px solid ${color}` : '3px solid transparent',
                       background: on ? colorBg : 'transparent',
                       color: on ? '#042C53' : '#4a5a6e',
                       fontWeight: on ? 500 : 400,
                     }}>
                  <span style={{ width: '18px', textAlign: 'center', fontSize: '14px' }}>{it.icono}</span>
                  {it.label}
                </div>
              )
            })}
          </div>
        </aside>

        {/* Contenido */}
        <main className="flex-1 min-w-0 p-4 md:p-6" style={{ overflowY: 'auto' }}>
          <div className="flex items-start"
               style={{ background: '#fff', border: '0.5px solid #c8d0db', borderLeft: `3px solid ${color}`, borderRadius: '10px', padding: '16px 20px', marginBottom: '1.25rem', gap: '14px' }}>
            <div className="flex items-center justify-center"
                 style={{ width: '42px', height: '42px', borderRadius: '9px', background: colorBg, color: color, fontSize: '20px', flexShrink: 0 }}>
              {s.icono}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 className="text-base md:text-lg" style={{ fontWeight: 500, marginBottom: '3px' }}>{s.titulo}</h2>
              <p style={{ fontSize: '12px', color: '#4a5a6e', marginBottom: '6px' }}>{s.desc}</p>
              <span style={{ display: 'inline-block', fontSize: '10px', color: color, background: colorBg, padding: '2px 8px', borderRadius: '5px', fontWeight: 500 }}>{s.badge}</span>
            </div>
          </div>

          {s.contenido || (
            <div style={{ background: '#fff', border: '0.5px dashed #c8d0db', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', color: '#5d6b80' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>🚧</div>
              <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#4a5a6e', marginBottom: '6px' }}>{s.titulo}</h3>
              <p style={{ fontSize: '12.5px', maxWidth: '480px', margin: '0 auto' }}>Esta sección se construirá próximamente.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}