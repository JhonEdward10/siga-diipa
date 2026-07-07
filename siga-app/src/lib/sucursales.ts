/* ════════════════════════════════════════════════════════════════════
   SUCURSALES · Fuente única de verdad
   ────────────────────────────────────────────────────────────────────
   Esta lista la usan el alta de prospecto (Prospectos.tsx) y el modal
   de agendar cita (ModalAvanzarEtapa2.tsx).

   ⚠️ Para cambiar direcciones o agregar una sucursal: SOLO se edita
   aquí. No hay que tocar ningún otro archivo.

   Direcciones proporcionadas por la Lic. Elizabeth Rivera.
   ════════════════════════════════════════════════════════════════════ */

export type Sucursal = {
  id: string
  nombre: string
  direccion: string
}

export const SUCURSALES: Sucursal[] = [
  { id: 'mazatlan',    nombre: 'Mazatlán',    direccion: 'Av. Santa Rosa, Col. Federico Velarde No. 15, Mazatlán, Sinaloa' },
  { id: 'guadalajara', nombre: 'Guadalajara', direccion: 'Agustín Yáñez 2583, Col. Arcos Vallarta, Edificio JDB' },
  { id: 'culiacan',    nombre: 'Culiacán',    direccion: 'Blvd. Enrique Sánchez Alonso, Plaza #255, Local 29, Desarrollo Urbano 3 Ríos' },
  { id: 'lapaz',       nombre: 'La Paz',      direccion: '5 de Febrero esquina con Josefa Ortiz de Domínguez, Plaza San Diego, Local 4' },
]

// Helper: obtener el nombre legible a partir del id guardado
export function nombreSucursal(id: string | null | undefined): string {
  if (!id) return ''
  const s = SUCURSALES.find((x) => x.id === id)
  return s ? s.nombre : id
}