export interface AreaQr {
    id: number;
    id_area: number;
    area: string;
    sede: string;
    fecha_creacion?: string;
}

export interface VehiculoQr {
    id: string,
    placa: string
}

export interface InterfaceDb {
    area_captura: string
    vehiculo: string
    lectura: string
}

export interface LecturasQrDb {
    fecha_registro: string;
    nombre_area: string;
    placa_vehiculo: string;
    nombre_usuario: string;
    orden_produccion: string;
    referencia: string;
    unidades: string;
    lote: string;
    fecha_vencimiento: string;
    numero_corbata: string;
  }

export interface QrLectura {
    area_captura: string;
    vehiculo: string;
    lectura: string;
    id_usuario: number; 
}

export interface Login {
    usuario: string,
    password: string
}