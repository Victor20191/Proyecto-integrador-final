import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {


  BASE_URL= 'http://localhost:4001'

  constructor(private http:HttpClient) { }
//consultar datos db

consultarDb():Observable<any>{
  return this.http.get<any>(this.BASE_URL+'/api/areas');
}


  enviarLecturas(comentario:any){
    return this.http.post<string>(`${this.BASE_URL}/api/insertar`,comentario);
  }

}
