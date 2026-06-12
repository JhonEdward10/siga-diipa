import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { entrarConGoogle } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-rose-950">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm text-center">
        <h1 className="text-3xl font-black text-rose-950 mb-2">SIGA</h1>
        <p className="text-gray-500 mb-8">Sistema Integral de Gestión · DIIPA</p>
        <button
          onClick={entrarConGoogle}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
          Entrar con Google
        </button>
      </div>
    </div>
  )
}