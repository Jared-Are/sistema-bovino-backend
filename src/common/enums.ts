// src/common/enums.ts
export enum SexoAnimal {
  MACHO = 'Macho',
  HEMBRA = 'Hembra',
}

export enum RolUsuario {
  PROPIETARIO = 'propietario',
  VETERINARIO = 'veterinario',
  OPERARIO = 'operario',
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INVITADO = 'INVITADO',
  BLOQUEADO = 'BLOQUEADO',
}

export enum EstadoTratamiento {
  ACTIVO = 'ACTIVO',        
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO',
}
export enum EstadoReproductivo {
  VACIA = 'Vacía',
  GESTANTE = 'Gestante',
  LACTANDO = 'Lactando',
  SECA = 'Seca',
  EN_CELO = 'En celo',
  INSEMINADA = 'Inseminada',
  PARIDA = 'Parida',
}