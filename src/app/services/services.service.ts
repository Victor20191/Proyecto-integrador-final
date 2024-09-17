import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, Subject, of, timer } from 'rxjs';
import { catchError, takeUntil, retry, shareReplay, tap, switchMap, startWith } from 'rxjs/operators';
import { LecturasQrDb, InterfaceDb, QrLectura, Login, AreaQr, VehiculoQr } from '../interface/interface-menu';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  BASE_URL = 'http://localhost:4001';
  private cancelRequestSubjects: { [key: string]: Subject<void> } = {};
  private cacheAreas$: Observable<AreaQr[]> | null = null;
  private cacheVehiculos$: Observable<VehiculoQr[]> | null = null;

  constructor(private http: HttpClient) { }

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

  enviarLecturas(lecturas: QrLectura[]) {
    return this.http.post<string>(`${this.BASE_URL}/api/insertar`, lecturas).pipe(
      catchError(this.handleError)
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