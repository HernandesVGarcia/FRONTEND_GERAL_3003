import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { VisualizaCaboData, VisualizaCaboResponse } from '../modelo/VisualizaCaboData';

@Injectable({
  providedIn: 'root'
})
export class VisualizaCaboService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Busca dados do modal VisualizaCabo por id_meta
   * @param id_meta ID do cabo
   * @returns Observable com os dados do cabo
   */
  getVisualizaCaboData(id_meta: number): Observable<VisualizaCaboData | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      id_meta: id_meta
    };

    const route = `/visualiza-cabo-data`;
    const url = `${this.apiUrl}${route}`;

    return this.http.post<VisualizaCaboResponse>(url, body, { headers }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return null;
      }),
      catchError(error => {
        console.error('Erro ao buscar dados do cabo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Atualiza dados do modal VisualizaCabo
   * @param id_meta ID do cabo
   * @param data Dados para atualizar
   * @returns Observable com resposta da atualização
   */
  updateVisualizaCaboData(id_meta: number, data: Partial<VisualizaCaboData>): Observable<VisualizaCaboResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      id_meta: id_meta,
      data: data
    };

    const route = `/visualiza-cabo-update`;
    const url = `${this.apiUrl}${route}`;

    return this.http.post<VisualizaCaboResponse>(url, body, { headers }).pipe(
      catchError(error => {
        console.error('Erro ao atualizar dados do cabo:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Conta quantos campos estão preenchidos
   * @param data Dados do cabo
   * @param fields Campos para verificar
   * @returns Número de campos preenchidos
   */
  countFilledFields(data: VisualizaCaboData, fields: string[]): number {
    let count = 0;
    fields.forEach(field => {
      if (data[field as keyof VisualizaCaboData] && 
          data[field as keyof VisualizaCaboData] !== '') {
        count++;
      }
    });
    return count;
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro no VisualizaCaboService:', error);
    return throwError(() => error);
  }
}
