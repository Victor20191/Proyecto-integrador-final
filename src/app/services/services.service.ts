import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject, of, timer } from 'rxjs';
import { catchError, takeUntil, retry, shareReplay, tap, switchMap, startWith } from 'rxjs/operators';
import { LecturasQrDb, InterfaceDb, QrLectura, Login, AreaQr, VehiculoQr } from '../interface/interface-menu';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  BASE_URL = 'http://localhost:4001';
  private cancelRequestSubjects: { [key: string]: Subject<void> } = {};
  private cacheAreas$: Observable<AreaQr[]> | null = null;
  private cacheVehiculos$: Observable<VehiculoQr[]> | null = null;

  constructor(private http: HttpClient, private authService: AuthService) { }

  loginUser(user: string, password: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/api/login`, { user, password }).pipe(
      catchError(this.handleError)
    );
  }

  consultarDb(): Observable<LecturasQrDb[]> {
    return this.http.get<LecturasQrDb[]>(`${this.BASE_URL}/api/reporte`).pipe(
      catchError(this.handleError)
    );
  }
  enviarLecturas(lecturas: QrLectura[]): Observable<any> {
    const userId = this.authService.currentUserValue?.id;
    const lecturasConUsuario = lecturas.map(lectura => ({
      ...lectura,
      id_usuario: userId
    }));
    
    console.log('Enviando datos al servidor:', lecturasConUsuario);
    
    return this.http.post<any>(`${this.BASE_URL}/api/insertar`, lecturasConUsuario).pipe(
      tap(response => console.log('Respuesta del servidor:', response)),
      catchError(error => {
        console.error('Error detallado:', error);
        return throwError(() => new Error(`Error del servidor: ${error.status}, ${error.message}`));
      })
    );
  }

  areaCapturaQr(): Observable<AreaQr[]> {
    if (this.cacheAreas$) {
      return this.cacheAreas$;
    }

    this.cancelPendingRequests('areas');

    this.cacheAreas$ = this.http.get<AreaQr[]>(`${this.BASE_URL}/api/area`).pipe(
      tap(data => console.log('Áreas cargadas del servidor:', data)),
      shareReplay(1),
      takeUntil(this.getCancelSubject('areas')),
      catchError(error => {
        console.error('Error al cargar áreas:', error);
        return throwError(() => error);
      }),
      switchMap(initialData => {
        return timer(2000).pipe(
          switchMap(() => this.http.get<AreaQr[]>(`${this.BASE_URL}/api/area`).pipe(
            catchError(() => of(initialData))
          )),
          startWith(initialData)
        );
      })
    );

    return this.cacheAreas$;
  }

  vehiculosCapturaQr(): Observable<VehiculoQr[]> {
    if (this.cacheVehiculos$) {
      return this.cacheVehiculos$;
    }

    this.cancelPendingRequests('vehiculos');

    this.cacheVehiculos$ = this.http.get<VehiculoQr[]>(`${this.BASE_URL}/api/vehiculos`).pipe(
      tap(data => console.log('Vehículos cargados del servidor:', data)),
      shareReplay(1),
      takeUntil(this.getCancelSubject('vehiculos')),
      catchError(error => {
        console.error('Error al cargar vehículos:', error);
        return throwError(() => error);
      }),
      switchMap(initialData => {
        return timer(2000).pipe(
          switchMap(() => this.http.get<VehiculoQr[]>(`${this.BASE_URL}/api/vehiculos`).pipe(
            catchError(() => of(initialData))
          )),
          startWith(initialData)
        );
      })
    );

    return this.cacheVehiculos$;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Un error desconocido ha ocurrido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor: ${error.status}, ${error.message}`;
    }
    console.error('Error detallado:', error);
    return throwError(() => new Error(errorMessage));
  }

  private getCancelSubject(key: string): Subject<void> {
    if (!this.cancelRequestSubjects[key]) {
      this.cancelRequestSubjects[key] = new Subject<void>();
    }
    return this.cancelRequestSubjects[key];
  }

  cancelPendingRequests(key?: string) {
    if (key) {
      if (this.cancelRequestSubjects[key]) {
        this.cancelRequestSubjects[key].next();
        this.cancelRequestSubjects[key].complete();
        delete this.cancelRequestSubjects[key];
      }
      if (key === 'vehiculos') {
        this.cacheVehiculos$ = null;
      } else if (key === 'areas') {
        this.cacheAreas$ = null;
      }
    } else {
      Object.values(this.cancelRequestSubjects).forEach(subject => {
        subject.next();
        subject.complete();
      });
      this.cancelRequestSubjects = {};
      this.cacheAreas$ = null;
      this.cacheVehiculos$ = null;
    }
  }

  clearCache() {
    this.cacheAreas$ = null;
    this.cacheVehiculos$ = null;
  }
}