import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface UpdateLabelCaboBody {
  id_meta: number;
  Label_cabo: string;
}

export interface UpdateLabelCaboResponse {
  success?: boolean;
  message?: string;
  affectedRows?: number;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateLabelCaboService {
  private readonly baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 15000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  atualizarLabel(body: UpdateLabelCaboBody): Observable<UpdateLabelCaboResponse> {
    const route = '/update_label_cabo';
    const url = `${this.baseUrl}${route}`;
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token de autenticação não encontrado'));
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    return this.http.post<UpdateLabelCaboResponse>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError),
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    let msg = 'Erro ao atualizar o label do cabo.';
    if (error.error instanceof ErrorEvent) {
      msg = error.error.message;
    } else if (error.status === 0) {
      msg = 'Não foi possível conectar ao servidor.';
    } else if (error.status === 401) {
      msg = 'Não autorizado. Faça login novamente.';
    } else if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      msg = String((error.error as { message?: string }).message ?? msg);
    }
    return throwError(() => new Error(msg));
  };
}
