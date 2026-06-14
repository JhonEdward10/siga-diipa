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
      <header className="flex items-center justify-between sticky top-0 z-10"
              style={{ background: 'linear-gradient(135deg, #0C447C 0%, #042C53 100%)', color: 'white', padding: '14px 24px' }}>
        <div className="flex items-center" style={{ gap: '14px' }}>
          <div onClick={() => navigate('/')} className="flex items-center cursor-pointer"
               style={{ gap: '12px', padding: '4px 8px 4px 4px', borderRadius: '9px' }}>
            <div className="flex items-center justify-center"
                 style={{ width: '40px', height: '40px', background: '#5DCAA5', borderRadius: '9px', fontWeight: 500, fontSize: '15px', color: '#04342C' }}>D</div>
            <div style={{ fontSize: '10px', color: '#B5D4F4', letterSpacing: '0.6px', textTransform: 'uppercase' }}>← Menú</div>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.2)' }} />
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 500 }}>{tituloModulo}</h1>
            <div style={{ fontSize: '10.5px', color: '#B5D4F4', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '1px' }}>DIIPA S.A. de C.V.</div>
          </div>
        </div>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 500 }}>{nombre}</div>
            <div style={{ fontSize: '10px', color: '#B5D4F4' }}>{email}</div>
          </div>
          <button onClick={manejarSalir}
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', padding: '6px 12px', borderRadius: '7px', fontSize: '11.5px', fontFamily: 'Sora, sans-serif', fontWeight: 500, cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', minHeight: 'calc(100vh - 64px)' }}>
        <aside style={{ background: '#eef1f5', borderRight: '0.5px solid #c8d0db', padding: '1rem 0' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#5d6b80', fontWeight: 500, padding: '0 16px', marginBottom: '6px' }}>
            {tituloSidebar}
          </div>
          {secciones.map((it) => {
            const on = it.key === activa
            return (
              <div key={it.key} onClick={() => setActiva(it.key)}
                   className="flex items-center cursor-pointer"
                   style={{
                     gap: '10px', padding: '9px 16px', fontSize: '12.5px',
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
        </aside>

        <main style={{ padding: '1.5rem 1.75rem', overflowY: 'auto' }}>
          <div className="flex items-start justify-between"
               style={{ background: '#fff', border: '0.5px solid #c8d0db', borderLeft: `3px solid ${color}`, borderRadius: '10px', padding: '16px 20px', marginBottom: '1.25rem', gap: '1rem' }}>
            <div className="flex" style={{ gap: '14px', flex: 1 }}>
              <div className="flex items-center justify-center"
                   style={{ width: '42px', height: '42px', borderRadius: '9px', background: colorBg, color: color, fontSize: '20px', flexShrink: 0 }}>
                {s.icono}
              </div>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 500, marginBottom: '3px' }}>{s.titulo}</h2>
                <p style={{ fontSize: '12px', color: '#4a5a6e', marginBottom: '6px' }}>{s.desc}</p>
                <span style={{ display: 'inline-block', fontSize: '10px', color: color, background: colorBg, padding: '2px 8px', borderRadius: '5px', fontWeight: 500 }}>{s.badge}</span>
              </div>
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