import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenService } from '../servico/token.service';
import { AuthService } from '../servico/auth.service';
import { CitySelectModalComponent } from '../city-select-modal/city-select-modal.component';
import { HeartbeatService } from '../servico/heartbeat.service';
import { ConsultaApiRbxService } from '../servico/consulta-api-rbx.service';
import { InsertLogService } from '../servico/insert-log.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,CitySelectModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  chave: string = '';
  senha: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  showCityModal: boolean = false;

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router,
    private heartbeatService: HeartbeatService,
    private consultaApiRbxService: ConsultaApiRbxService,
    private insertLogService: InsertLogService,
  ) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    this.loading = true;
    this.errorMessage = '';

    //console.log('🔧 ANTES DO LOGIN - Valor da chave:', this.chave);
    //console.log('🔧 ANTES DO LOGIN - Tipo da chave:', typeof this.chave);
    //console.log('🔧 ANTES DO LOGIN - Chave está vazia?', this.chave === '');
    

    this.tokenService.selecionar(this.chave, this.senha)
      .subscribe({
        next: (response: any) => {
          //console.log('Login bem-sucedido:', response); estava mostrando o token e o usuario
          console.log('=================> response.lat' , response.lat, response.lng) 
          console.log('=================> response.menu_ON', response.menu_ON)
          
          // Armazenar o token usando o AuthService
          if (response && response.token) {
            this.authService.setToken(response.token);
            // Armazenar o valor do polo


            //console.log('🔧 SALVANDO USUÁRIO - Valor da chave antes de salvar:', this.chave);
            //console.log('🔧 SALVANDO USUÁRIO - Tipo da chave:', typeof this.chave);
            //console.log('🔧 SALVANDO USUÁRIO - Chave é válida?', this.chave && this.chave.trim() !== '');

            this.authService.setUsuario(this.chave);
            this.authService.setIdUser(response.IDUSER);
            this.authService.setPolo(response.polo);
            this.authService.setLat(response.lat);
            this.authService.setLng(response.lng);
            this.authService.setceo_layer(response.ceo_layer.toString());
            console.log('*************** ceo_layer vindo da api:', response.ceo_layer)
            this.authService.setcto_layer(response.cto_layer.toString());
            this.authService.setclientes_layer(response.clientes_layer.toString());
            this.authService.setmenu_on(response.menu_on.toString());
            this.authService.setcabos_layer(response.cabos_layer.toString());

            // Iniciar heartbeat após login bem-sucedido
            console.log('🔄 Iniciando heartbeat após login...');
            this.heartbeatService.startHeartbeat();


            // Inserir log de login
            console.log('🔄 Inserindo log de login...');
            this.insertLogService.inserirLog({
              id_usuario: response.IDUSER,
              id_evento: 1,
              id_city: response.id_city,
              id_meta_objeto: 0,
              descricao: 'Login bem-sucedido',
              VERSION: 'Fiberworks WEB 1.0.0'
            }).subscribe({
              next: (logResponse) => {
                console.log('✅ Log de login inserido com sucesso:', logResponse);
              },
              error: (error) => {
                console.error('❌ Erro ao inserir log de login:', error);
                // Não bloquear o fluxo do login se o log falhar
              }
            });



            //this.router.navigate(['/mapa']);
            this.showCityModal = true;
            this.loading = false;
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


      onCitySelected(idCidade: number): void {
        console.log('Cidade selecionada no componente login:', idCidade);
        // Redirecionar para a página do mapa após a seleção da cidade
        this.authService.setIdCity(idCidade);
        
        // Iniciar consulta à API do ERP após a cidade ser definida
        console.log('🚀 Iniciando consulta à API do ERP após seleção da cidade...');
        this.consultaApiRbxService.iniciarConsultaClientes();
        
        this.router.navigate(['/mapa']);
      }
    
      onModalClosed(): void {
        // Se o usuário fechar o modal sem selecionar uma cidade, redirecione para a página do mapa
        // ou implemente uma lógica diferente conforme necessário
        this.router.navigate(['/mapa']);

  }
}
