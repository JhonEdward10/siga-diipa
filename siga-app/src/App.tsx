import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Bienvenida from './pages/Bienvenida'
import Carteras from './pages/Carteras'

export default function App() {
  const { session, tieneAcceso, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  const autenticado = session && tieneAcceso

  return (
    <BrowserRouter>
      <Routes>
        {/* Si NO está autenticado, solo puede ver el login */}
        {!autenticado ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Bienvenida />} />
            <Route path="/carteras" element={<Carteras />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}