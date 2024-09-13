import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { LecturasQrDb,InterfaceDb,QrLectura,Login } from '../interface/interface-menu';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  BASE_URL= 'http://localhost:4001'

  constructor(private http:HttpClient) { }

//Sevicio Login Usuario
loginUser(user: string, password: string): Observable<any> {
  return this.http.post(`${this.BASE_URL}/api/login`, { user, password });
}


//consultar datos db
consultarDb():Observable<LecturasQrDb[]>{
  return this.http.get<LecturasQrDb[]>(this.BASE_URL+'/api/reporte');
}
enviarLecturas(lecturas: QrLectura[]) {
  return this.http.post<string>(`${this.BASE_URL}/api/insertar`, lecturas);
}
}