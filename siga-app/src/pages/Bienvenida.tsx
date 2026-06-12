import { useAuth } from '../context/AuthContext'

export default function Bienvenida() {
  const { session, salir } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <h1 className="text-2xl font-bold text-rose-950">
        Bienvenido, {session?.user.email}
      </h1>
      <p className="text-gray-500">Ya tienes acceso al sistema SIGA.</p>
      <button
        onClick={salir}
        className="bg-rose-950 text-white rounded-lg py-2 px-6 font-medium hover:bg-rose-900 transition"
      >
        Cerrar sesión
      </button>
    </div>
  )
}