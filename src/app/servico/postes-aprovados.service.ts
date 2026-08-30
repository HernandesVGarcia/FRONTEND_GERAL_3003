import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { PosteAprovado } from '../modelo/poste-aprovado';
import { Observable, throwError } from 'rxjs';
import { retry, timeout, catchError, map } from 'rxjs/operators';
import { AuthService } from '../servico/auth.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostesAprovadosService {
  private baseUrl: string = environment.apiUrlAbsolute;
  private readonly TIMEOUT = 10000;
  private readonly RETRY_ATTEMPTS = 2;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {
    this.authService.refreshToken();
  }

  selecionar(): Observable<PosteAprovado[]> {
    const route = `/postes_aprovados_coordenadas`;
    const token = this.authService.getToken();
    const idcity = this.authService.getIdCity();

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const body = {
      id_city: idcity,
    };

    const url = `${this.baseUrl}${route}`;

    return this.http.post<{ response?: PosteAprovado[] } | PosteAprovado[]>(url, body, { headers }).pipe(
      timeout(this.TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      map((res) => {
        if (Array.isArray(res)) {
          return res;
        }
        return res?.response ?? [];
      }),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro na requisição:', error);
    let errorMessage = 'Ocorreu um erro na requisição.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Código do erro: ${error.status}, mensagem: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }
}
