export interface AreaQr {
    id:string,
    nombreArea:string
}
export interface Vehiculo{
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
  