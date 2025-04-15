import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
//import * as draw2d from 'draw2d';
//import draw2d from 'draw2d';
import { Cabo12F } from '../cabo12f-nac/cabo12f-nac.component';
declare var draw2d: any;

@Component({
  selector: 'app-caixa-interna',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caixa-interna.component.html',
  styleUrls: ['./caixa-interna.component.css']
})
export class CaixaInternaComponent implements OnInit, AfterViewInit {
  @Input() numeroCaixa: string = '';
  @Output() onClose = new EventEmitter<void>();
  @ViewChild('draggableContainer') draggableContainer!: ElementRef;
  @ViewChild('draggableHeader') draggableHeader!: ElementRef;
  
  canvas: any;

  cabo1: any;
  cabo2: any;
  cabo3: any;
  cabo4: any;

  private linhaTracejada: any;
  private elementos: any[] = [];
  
  // Variáveis para controlar o arraste
  private isDragging: boolean = false;
  private currentX: number = 0;
  private currentY: number = 0;
  private initialX: number = 0;
  private initialY: number = 0;
  private xOffset: number = 0;
  private yOffset: number = 0;

  private canvasInitialized: boolean = false;
  private readyForConnection: boolean = false;
  // Contador de tentativas de conexão
  private connectionAttempts: number = 0;
  // Máximo de tentativas
  private maxConnectionAttempts: number = 10;

  ngOnInit() {
    
    setTimeout(() => {
      this.initializeCanvas();
    }, 500);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.canvas && this.cabo1 && this.cabo2) {
        this.setupDragFunctionality();
        this.setupConnectionPolicy();
        
        // Marca como pronto para conexão após tudo estar configurado
        this.readyForConnection = true;
        console.log('Sistema pronto para conexão, tentando conectar fibras...');
        
        // Tenta fazer a conexão
        this.conectarFibrasAutomaticamente();
      } else {
        console.warn('Canvas ou cabos ainda não inicializados em ngAfterViewInit');
      }
    }, 500);
  }

  setupConnectionPolicy() {
    try {
      // Política para criar conexões com portas híbridas
      console.log ('instalando politica de Conexão')

      
      const connectionPolicy = new draw2d.policy.connection.DragConnectionCreatePolicy({
        createConnection: () => {
          // Criar uma conexão personalizada
          const connection = new draw2d.connection.Connection();
           // Usar roteador que permite mais flexibilidade em conexões
           connection.setRouter(new draw2d.layout.connection.InteractiveManhattanConnectionRouter());
           //connection.setRouter(new draw2d.layout.connection.int());

          
           // Estilizar a conexão
           connection.setOutlineColor("#83A8FF");
           connection.setOutlineStroke(5);
           connection.setStroke(33);
           connection.setColor("#5366FF");
           
           return connection;
         }
       });
       if (this.canvas) {
       this.canvas.installEditPolicy(connectionPolicy);}
    } catch (error) {
      console.error('Erro ao instalar política de conexão:', error);
    }
  }




  setupPanPolicy() {
    try {
      // Política para criar conexões com portas híbridas
      console.log ('instalando politica de Pan ')

      
      const PanPolicy = new draw2d.policy.canvas.PanningSelectionPolicy();
       if (this.canvas) {
       this.canvas.installEditPolicy(PanPolicy);}
    } catch (error) {
      console.error('Erro ao instalar PAN Politica:', error);
    }
  }




  setupDragFunctionality() {
    const element = this.draggableContainer.nativeElement;
    const header = this.draggableHeader.nativeElement;

    const dragStart = (e: MouseEvent) => {
      // Ajusta o ponto inicial de arraste
      this.initialX = e.clientX - this.xOffset;
      this.initialY = e.clientY - this.yOffset;
      this.isDragging = true;
    };

    const dragEnd = () => {
      this.isDragging = false;
    };

    const drag = (e: MouseEvent) => {
      if (this.isDragging) {
        e.preventDefault();
        this.currentX = e.clientX - this.initialX;
        this.currentY = e.clientY - this.initialY;
        this.xOffset = this.currentX;
        this.yOffset = this.currentY;

        // Removendo transform: translate(-50%, -50%) para permitir arraste livre
        element.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
      }
    };

    // Adiciona os event listeners apenas no cabeçalho para permitir o arraste
    header.addEventListener('mousedown', dragStart);
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('mousemove', drag);
  }

  fecharCaixa() {
    try {
      this.onClose.emit();
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
    }
  }

  initializeCanvas() {
    try {
      const canvasElement = document.getElementById('desenhoCanvas');
      
      if (!canvasElement) {
        console.error('Elemento do canvas não encontrado');
        return;
      }

      





      //this.canvas.height= "5%";
      this.canvas = new draw2d.Canvas('desenhoCanvas');
      

      //this.canvas.setZoom(0.2,true);
      //this.canvas.setScrollArea(window);
      this.canvas.setScrollArea("#canvas-container");

      //this.canvas.installEditPolicy(new draw2d.policy.canvas.());
      //this.canvas.policy.canvas.PanningSelectionPolicy();
      this.canvas.installEditPolicy(new draw2d.policy.canvas.ShowGridEditPolicy());
      //this.canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGeometryEditPolicy());
      //this.canvas.installEditPolicy(new draw2d.policy.canvas.SnapToInBetweenEditPolicy());
      //this.canvas.installEditPolicy(new draw2d.policy.canvas.SnapToCenterEditPolicy());
      this.canvas.installEditPolicy(new draw2d.policy.canvas.PanningSelectionPolicy());
      this.canvas.installEditPolicy(new draw2d.policy.canvas.WheelZoomPolicy());
      //this.canvas.installEditPolicy(new draw2d.policy.a);

      // Usando cabos com portas híbridas que podem ser conectados em qualquer direção
      this.cabo1 = new Cabo12F(100, 100, 'hybrid');
      this.cabo2 = new Cabo12F(350, 100, 'hybrid');
      this.cabo3 = new Cabo12F(200, 250, 'hybrid');
      this.cabo4 = new Cabo12F(500, 250, 'hybrid');

      console.log('Cabos instanciados', this.cabo1, this.cabo2, this.cabo3);
      

      // Adicionando um tracejado para demonstração
      //this.criarLinhaTracejada();
      
      

      
      if (this.canvas && this.cabo1 && this.cabo2 && this.cabo3) {

      // Adicionando os cabos ao canvas
      this.canvas.add(this.cabo1);
      this.canvas.add(this.cabo2);
      this.canvas.add(this.cabo3);
      this.canvas.add(this.cabo4);

      //this.cabo1.setRotationAngle(180);
      // this.cabo1.translate(-1,10);
      
     // this.cabo1.setScaleX(-1)

     //this.cabo1.transform({ scaleX: -1 });
      // CORREÇÃO: Definir canvasInitialized para true ANTES de verificações posteriores
      this.canvasInitialized = true;
      console.log('Elementos adicionados ao canvas com sucesso. Canvas inicializado:', this.canvasInitialized);
    } else {
      console.error('Erro: Canvas ou cabos são nulos durante adição ao canvas');
    }
    

  
 }


 


catch (error) {
  console.error('Erro ao conectar fibras automaticamente:', error instanceof Error ? error.message : 'Erro desconhecido');
}






}


conectarFibrasAutomaticamente() {

  this.connectionAttempts++;

  // Verificar se o canvas, cabos e flag de prontidão estão ok
  if (!this.canvasInitialized || !this.cabo1 || !this.cabo2 || !this.readyForConnection) {
    console.log(`Tentativa ${this.connectionAttempts}/${this.maxConnectionAttempts}: Sistema não está pronto para conexão. Estado:`, {
      canvasInitialized: this.canvasInitialized,
      cabo1Exists: !!this.cabo1,
      cabo2Exists: !!this.cabo2,
      readyForConnection: this.readyForConnection
    });


     // Tentar novamente se não excedeu o máximo de tentativas
     if (this.connectionAttempts < this.maxConnectionAttempts) {
      setTimeout(() => {
        this.conectarFibrasAutomaticamente();
      }, 800); // Aumentando o intervalo para dar mais tempo para inicialização
    } else {
      console.warn('Número máximo de tentativas de conexão atingido. Verifique se o canvas e os cabos foram inicializados corretamente.');
    }
    return;
  }

  console.log('Conectando fibra 1 do cabo 1 com fibra 1 do cabo 2...');
      
  // Acesso direto às portas F1 dos cabos (sem verificações extras)
 
 
  const portasCabo1 = this.cabo1.getPorts().data;
     
  const portasCabo2 = this.cabo2.getPorts().data;
  
  // A primeira porta (índice 0) é a F1 em cada cabo
  ;

  for (let i=0;i<12;i++) {
  const portaCabo1 = portasCabo1[i]
  const portaCabo2 = portasCabo2[i]; 
  
  // Criar conexão diretamente
  const connection = new draw2d.Connection();
  
  // Configurar a aparência da conexão
  connection.setRouter(new draw2d.layout.connection.SketchConnectionRouter());
            //CircuitConnectionRouter: any;
            //ConnectionRouter: any;
            //DirectRouter: any;
            // FanConnectionRouter: any;
            //InteractiveManhattanConnectionRouter: any;
            //ManhattanBridgedConnectionRouter: any;
            //ManhattanConnectionRouter: any;
            //MazeConnectionRouter: any;
            //MuteableManhattanConnectionRouter: any;
            //RubberbandRouter: any;
            //SketchConnectionRouter: any;
            //SplineConnectionRouter: any;
            //VertexRouter: any;







  connection.setOutlineColor("#33A8FF");
  connection.setOutlineStroke(0.1);
  connection.setStroke(0.9);
  connection.setColor("#3366FF");
  
  // Definir fonte e destino da conexão
  connection.setSource(portaCabo1);
  connection.setTarget(portaCabo2);
  
  // Adicionar ao canvas
  this.canvas.add(connection);
  
  console.log('Conexão automática entre fibras F1 criada com sucesso!');

  }



};



}
