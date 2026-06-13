import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { entrarConGoogle } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #071A35 0%, #0C2D58 100%)', fontFamily: 'Sora, sans-serif' }}>

      {/* Formas decorativas de fondo */}
      <div className="absolute rounded-full" style={{ top: '-150px', right: '-100px', width: '400px', height: '400px', background: '#185FA5', filter: 'blur(80px)', opacity: 0.35 }} />
      <div className="absolute rounded-full" style={{ bottom: '-100px', left: '-150px', width: '350px', height: '350px', background: '#103F7A', filter: 'blur(80px)', opacity: 0.35 }} />

      {/* Tarjeta */}
      <div className="relative z-10 w-full bg-white overflow-hidden"
           style={{ maxWidth: '440px', borderRadius: '18px', boxShadow: '0 30px 80px -20px rgba(0,0,0,.45)' }}>

        {/* Header */}
        <div className="text-white relative" style={{ background: 'linear-gradient(135deg, #071A35 0%, #103F7A 100%)', padding: '28px 32px 24px' }}>
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="flex items-center justify-center text-white font-bold"
                 style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'linear-gradient(135deg, #3B91E0, #185FA5)', fontSize: '13px', letterSpacing: '.5px' }}>
              SG
            </div>
            <div className="flex flex-col leading-tight">
              <span style={{ fontSize: '15px', fontWeight: 600 }}>SIGA</span>
              <span style={{ fontSize: '10px', color: '#B5D4F4', fontFamily: 'monospace', marginTop: '2px' }}>SISTEMA INTEGRAL · v1.0</span>
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 600, marginBottom: '4px' }}>Bienvenido</div>
          <div style={{ fontSize: '12px', color: '#B5D4F4' }}>Ingresa con tu cuenta institucional</div>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '32px' }}>
          <button
            onClick={entrarConGoogle}
            className="w-full flex items-center justify-center gap-3 transition"
            style={{ padding: '13px', background: '#fff', color: '#3D4566', border: '1.5px solid #C8D0E0', borderRadius: '9px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
          >
            <img src="https://www.google.com/favicon.ico" alt="" style={{ width: '20px', height: '20px' }} />
            Entrar con Google
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between"
             style={{ padding: '14px 32px', background: '#F4F6FB', borderTop: '1px solid #E8ECF4', fontSize: '10px', color: '#8892B0' }}>
          <span style={{ fontFamily: 'monospace' }}>DIIPA · ACCESO RESTRINGIDO</span>
          <span style={{ fontFamily: 'monospace', color: '#B0B8CC' }}>v1.0 · 2026</span>
        </div>

      </div>
    </div>
  )
}