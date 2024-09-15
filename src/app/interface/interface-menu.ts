export interface AreaQr {
    id: number;
    id_area: number;
    area: string;
    sede: string;
    fecha_creacion?: string;
}
export interface VehiculoQr{
    id:string,
    placa:string
}
//Interface para base de datos
export interface InterfaceDb {
    // id:number
    // fechaRegistro:string
    area_captura:string
    vehiculo: string
    lectura:string
}

export interface LecturasQrDb {
    id:number
    fecha_registro:string
    area_captura:string
    vehiculo: string
    lectura:string
}
// interface-menu.ts
export interface QrLectura {
    area_captura: string;
    vehiculo: string;
    lectura: string;
  }
  
  export interface Login{
    usuario:string,
    password:string
  }