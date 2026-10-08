import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface UpdateIdImportacaoRequest {
  id_meta: number;
  id_importacao: number;
  id_city: number;
}

export interface UpdateIdImportacaoResponse {
  success: boolean;
  affectedRows?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UpdateIdImportacaoService {
  private baseUrl = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  atualizar(dados: UpdateIdImportacaoRequest): Observable<UpdateIdImportacaoResponse> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}/update_id_importacao`;

    return this.http.post<UpdateIdImportacaoResponse>(url, dados, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError((error: HttpErrorResponse) => {
        console.error('[UPDATE-ID-IMPORTACAO] Erro:', error);
        return throwError(
          () =>
            new Error(
              error.error?.message ||
                'Não foi possível atualizar id_importacao.',
            ),
        );
      }),
    );
  }
}
