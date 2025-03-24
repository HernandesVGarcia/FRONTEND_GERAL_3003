import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenService } from '../servico/token.service';
import { AuthService } from '../servico/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  chave: string = '';
  senha: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    this.loading = true;
    this.errorMessage = '';
    console.log ('submite')

    this.tokenService.selecionar(this.chave, this.senha)
      .subscribe({
        next: (response: any) => {
          console.log('Login bem-sucedido:', response);
          
          // Armazenar o token usando o AuthService
          if (response && response.token) {
            this.authService.setToken(response.token);
            this.router.navigate(['/mapa']);
          } else {
            this.errorMessage = 'Resposta inválida do servidor';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Erro ao fazer login:', error);
          this.errorMessage = typeof error === 'string' ? error : 'Falha na autenticação. Verifique suas credenciais.';
          this.loading = false;
        }
      });
  }
}
