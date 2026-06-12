import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Bienvenida from './pages/Bienvenida'

export default function App() {
  const { session, tieneAcceso, cargando } = useAuth()

  // Mientras revisa la sesión, muestra "cargando"
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  // Si tiene sesión Y pasó el portón → Bienvenida. Si no → Login.
  return session && tieneAcceso ? <Bienvenida /> : <Login />
}