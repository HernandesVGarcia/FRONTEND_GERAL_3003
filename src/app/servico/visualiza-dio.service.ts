import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, retry, timeout } from 'rxjs/operators';
import { VisualizaDioData, VisualizaDioResponse } from '../modelo/VisualizaDioData';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VisualizaDioService {
  private baseUrl = 'https://www.fiberworks-api.com:3002';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Busca dados do modal VisualizaDio por id_meta
   */
  getVisualizaDioData(id_meta: number): Observable<VisualizaDioData | null> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => 'Token não encontrado');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const route = `/visualiza-dio-data`;
    const body = { id_meta };
    const url = `${this.baseUrl}${route}`;

    return this.http.post<VisualizaDioResponse>(url, body, { headers }).pipe(
      timeout(10000),
      retry(2),
      map(response => {
        if (response && response.success && response.data) {
          return response.data;
        }
        return null;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Atualiza dados do modal VisualizaDio
   */
  updateVisualizaDioData(id_meta: number, data: Partial<VisualizaDioData>): Observable<VisualizaDioResponse> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => 'Token não encontrado');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const route = `/visualiza-dio-update`;
    const body = { id_meta, ...data };
    const url = `${this.baseUrl}${route}`;

    return this.http.post<VisualizaDioResponse>(url, body, { headers }).pipe(
      timeout(10000),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * Gera campos dinâmicos baseado na capacidade
   */
  generateFieldsByCapacity(capacity: number): string[] {
    const fields: string[] = [];
    for (let i = 1; i <= capacity; i++) {
      fields.push(`F${i}`);
    }
    return fields;
  }

  /**
   * Valida se um campo está preenchido
   */
  isFieldValid(fieldValue: string | undefined): boolean {
    return fieldValue !== undefined && fieldValue !== null && fieldValue.trim() !== '';
  }

  /**
   * Conta quantos campos estão preenchidos
   */
  countFilledFields(data: VisualizaDioData, fields: string[]): number {
    let count = 0;
    fields.forEach(field => {
      const value = (data as any)[field];
      if (this.isFieldValid(value)) {
        count++;
      }
    });
    return count;
  }

  private handleError = (error: any): Observable<never> => {
    console.error('Erro no VisualizaDioService:', error);
    let errorMessage = 'Erro desconhecido';
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => errorMessage);
  };
}
