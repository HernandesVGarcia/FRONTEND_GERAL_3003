import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, firstValueFrom } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

export interface PoloErpInfo {
  idErp: number;
  erp: string;
}

interface PoloErpResponseRow {
  ID_ERP?: number | string;
  id_erp?: number | string;
  ERP?: string;
  erp?: string;
}

interface PoloErpApiResponse {
  response?: PoloErpResponseRow[];
}

@Injectable({
  providedIn: 'root'
})
export class PoloErpService {
  private readonly TIMEOUT = 10000;
  private baseUrl: string = environment.apiUrlAbsolute;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  async consultarErpDoPolo(idPolo: string): Promise<PoloErpInfo | null> {
    const idPoloTexto = String(idPolo ?? '').trim();

    if (!idPoloTexto) {
      console.warn('[POLO-ERP] IDPOLO vazio — consulta ignorada');
      return null;
    }

    const token = this.authService.getToken();
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    const url = `${this.baseUrl}/polo_erp`;

    try {
      const response = await firstValueFrom(
        this.http.post<PoloErpApiResponse>(url, { IDPOLO: idPoloTexto }, { headers }).pipe(
          timeout(this.TIMEOUT),
          catchError(this.handleError)
        )
      );

      const rows = response?.response;

      if (!Array.isArray(rows) || rows.length === 0) {
        console.warn('[POLO-ERP] Nenhum ERP encontrado para IDPOLO:', idPoloTexto);
        return null;
      }

      const row = rows[0];
      const idErpRaw = row.ID_ERP ?? row.id_erp;
      const idErp = typeof idErpRaw === 'string' ? parseInt(idErpRaw, 10) : Number(idErpRaw);
      const erp = String(row.ERP ?? row.erp ?? '').trim();

      if (!Number.isFinite(idErp)) {
        console.warn('[POLO-ERP] ID_ERP inválido na resposta:', idErpRaw);
        return null;
      }

      return { idErp, erp };
    } catch (error) {
      console.error('[POLO-ERP] Erro ao consultar ERP do polo:', error);
      return null;
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro ao consultar ERP do polo.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = String(error.error.error);
    } else {
      errorMessage = `HTTP ${error.status}: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }
}
