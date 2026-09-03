const express = require('express');
const app = express();
const morgan=require('morgan')
const bodyParser = require ('body-parser');

//const rotateste=require('./routes/teste');
//const rotacaixas=require('./routes/caixa');
const consultaRbxRoutes = require('./routes/api_consulta_rbx');


const rotacaixass=require('./routes/caixas');
const rotacaixass_cond=require('./routes/caixas_condominio');
const rotactos=require('./routes/ctos');
const rotactosSP=require ('./routes/ctos_sp')
const rotacabos=require('./routes/cabos')
const rotaUsuarios=require('./routes/usuarios');
const rotaAutentica=require ('./routes/autentica')
const rotaCidades=require ('./routes/cidades')
const rotaBocas=require ('./routes/bocas')
const rotaBandejas=require ('./routes/bandejas')
const rotaUpdateGeoCabo=require ('./routes/update_geometria_cabo')
const rotaUpdateLabelCabo = require ('./routes/update_label_cabo')
const rotaUpdateGeoCaixa=require ('./routes/update_geometria_caixa')
const rotaUpdateGeoDio=require ('./routes/update_geometria_dio')
const rotaUpdateGeoPop=require ('./routes/update_geometria_pop')
const rotaUpdateGeoPoli=require ('./routes/update_geometria_poligono')
const rotadivideCabo = require('./routes/divide_cabo')


const rotaVerificarPonta=require ('./routes/verificar_ponta')
const rotaLeBeginEnd=require ('./routes/LeBeginEnd')
const rotaConexaoBoca=require ('./routes/conexao_boca')
const rotaConexaoBandeja=require ('./routes/conexao_bandeja')
const rotaConexaoBandejaFibra=require ('./routes/conexao_bandeja_Fibra')
const rotaConexaoBandejaFibraExclui=require ('./routes/conexao_bandeja_Fibra_Delete')
const rotaDesconexaoBoca=require ('./routes/desconexao_boca')
const rotaDesconexaoBandeja=require ('./routes/desconexao_bandeja')

const rotaExtraiCaboEntradaSP=require ('./routes/extrai_cabo_entrada_sp.js')
const rotaUpdateClienteAtivacao=require ('./routes/update_cliente_ativacao.js')
const rotaUpdateClienteDesativacao=require ('./routes/update_cliente_desativacao.js')

const rotaConex_dio=require ('./routes/conex_dio.js')
const rotaConex_bc=require ('./routes/conex_boca')
const rotaConex_bc1=require ('./routes/conex_bc1')
const rotaConex_bc2=require ('./routes/conex_bc2')
const rotaConex_bc3=require ('./routes/conex_bc3')
const rotaConex_bc4=require ('./routes/conex_bc4')
const rotaConex_bc5=require ('./routes/conex_bc5')
const rotaConex_bc6=require ('./routes/conex_bc6')
const rotaConex_bc7=require ('./routes/conex_bc7')
const rotaConex_bc8=require ('./routes/conex_bc8')
const rotaConex_bc9=require ('./routes/conex_bc9')
const rotaConex_bc10=require ('./routes/conex_bc10')
const rotaConex_bc11=require ('./routes/conex_bc11')
const rotaConex_bc12=require ('./routes/conex_bc12')
const rotaConex_bc13=require ('./routes/conex_bc13')
const rotaConex_bc14=require ('./routes/conex_bc14')
const rotaConex_bc15=require ('./routes/conex_bc15')
const rotaConex_bc16=require ('./routes/conex_bc16')
const rotaConex_bc17=require ('./routes/conex_bc17')
const rotaConex_bc18=require ('./routes/conex_bc18')
const rotaConex_pb99=require ('./routes/conex_cabopb_99')


const rotaTipo_objeto=require ('./routes/tipo_objeto')
const rotaTipo_cabo=require ('./routes/tipo_cabo')
const rotaTipos=require('./routes/tipos.js')
const rotaSplitter=require ('./routes/splitter')
const rotaSplitterEntrada=require ('./routes/splitter_entrada')
const rotaConex_sp2=require ('./routes/conex_sp2')
const rotaConex_sp4=require ('./routes/conex_sp4')
const rotaConex_sp8=require ('./routes/conex_sp8')
const rotaConex_sp16=require ('./routes/conex_sp16')
const rotaConex_sp32=require ('./routes/conex_sp32')
const rotaConex_sp64=require ('./routes/conex_sp64')
const rotaConex_sp128=require ('./routes/conex_sp128')

const rotaConex_bc97=require ('./routes/conex_bc97') // bocas responsaveis pela interligação entre splitters
const rotaConex_bc98=require ('./routes/conex_bc98') // bocas responsaveis pela interligação entre splitters
const rotaConex_bc99=require ('./routes/conex_bc99') // bocas responsaveis pela conexao virtual splitters e clientes
const rotaPop=require ('./routes/pop')
const rotaBCXY=require ('./routes/update_bocaxy.js')
const rotaSPXY=require ('./routes/update_splitterxy')
const rotaHeartbeat=require('./routes/heartbeat');
const rotaPops_coordenadas=require('./routes/pops_coordenadas')
const rotaClientes_coordenadas=require('./routes/clientes_coordenadas')
const rotaCondominios_coordenadas=require('./routes/condominios_coordenadas')
const rotaDios_coordenadas=require('./routes/dios_coordenadas.js')
const rotaAnotacoes_coordenadas=require('./routes/anotacoes_coordenadas.js')
const rotaPoligonos_coordenadas=require('./routes/poligonos_coordenadas.js')
const rotaDio_equip=require('./routes/dio_equipamento.js')

const rotaExclui_cabo=require('./routes/exclui-cabo.js')
const rotaExclui_caixa=require('./routes/exclui-caixa.js')
const rotaExclui_dio=require('./routes/exclui-dio.js')
const rotaExclui_splitter=require('./routes/exclui-splitter.js')
const rotaExclui_estacao=require('./routes/exclui-estacao.js')
const rotaExclui_cliente=require('./routes/exclui-cliente.js')
const rotaExclui_poligono=require('./routes/exclui-poligono.js')
const rotaExclui_PosOLT=require('./routes/exclui-posicao-olt.js')


const rotaInsert_idmeta=require('./routes/insert_idmeta.js')
const rotaInsert_cabo=require('./routes/insert_cabo.js')
const rotaInsert_cliente=require('./routes/insert_cliente.js')
const rotaInsert_caixa=require('./routes/insert_caixa.js')
const rotaInsert_dio=require('./routes/insert_dio.js')
const rotaInsert_posic_olt=require('./routes/insert-posicao-olt.js')
const rotaInsert_logs=require('./routes/insert_logs.js')
const rotaInsert_splitter=require('./routes/insert_splitter.js')
const rotaInsert_poligono=require('./routes/insert_poligono.js')


const rotaLeIdmeta_log=require('./routes/le_idmeta_log.js')
const rotaLeFusao_tubo=require('./routes/le_fusao_tubo.js')
const rotaLeIdcidade_log=require('./routes/le_cidade_log.js')

const rotaBCAngle=require('./routes/update_bocaAngle')
const rotaSplitterAngle=require('./routes/update_splitterAngle')
const rotaBCLado=require('./routes/update_bocaFlipX')

const rotaFusao=require('./routes/update_fusao')
const rotaFusao_fibraEntradaSP=require('./routes/update_fusao_fibraEntradaSP.js')
const rotaFusao_fibraSaidaSP=require('./routes/update_fusao_fibraSaidaSP.js')
const rotaFusao_SaidaEntradaSP=require('./routes/update_fusao_SaidaEntradaSP.js')
const rotaFusao_tubo=require('./routes/update_fusao_tubo.js')
const rotaTipagem_caixa=require('./routes/update_tipagem_caixa.js')
const rotaDIO_equipamento=require('./routes/update_dio_equipamento.js')
const rotaUpdate_cliente=require('./routes/update_cliente.js')
const rotaUpdate_estacao=require('./routes/update_estacao.js')



const rotaExcluiFusao=require('./routes/update_exclui_fusao')
const rotaExcluiFusao_fibraEntradaSP=require('./routes/update_exclui_fusao_fibraEntradaSP')
const rotaExcluiFusao_fibraSaidaSP=require('./routes/update_exclui_fusao_fibraSaidaSP')
const rotaExcluiFusao_SaidaEntradaSP=require('./routes/update_exclui_fusao_SaidaEntradaSP')

const rotaAnalisaConexao=require('./routes/analisa-conexao');
const rotaAnalisaConexaoTotal=require('./routes/analisa-conexao-total');
const rotaAnalisaConexaoNivel=require('./routes/analisa-conexao-nivel');

const rotaPesquisaCaixa=require('./routes/pesquisa-caixa');
const rotaPesquisaDio=require('./routes/pesquisa-dio');
const rotaPesquisaCabo=require('./routes/pesquisa-cabo');
const rotaClientesBuscarCadastrados=require('./routes/clientes-buscar-cadastrados.js')
const rotaClientesPlotarCadastrados=require('./routes/clientes-plotar-cadastrados.js')

const rotaCaixasBuscar=require('./routes/caixas-buscar'); // busca caixas com filtro
const rotaClientesBuscar=require('./routes/clientes-buscar'); // busca clientes com filtro
const rotaEstacoesBuscar=require('./routes/estacoes-buscar'); // busca pops com filtro
const rotaInfoClientes=require('./routes/info-clientes'); // busca caixas com filtro
const rotaClientesULT=require('./routes/clientes-buscar-ultimo'); // busca caixas com filtro


const rotaQueryConex=require('./routes/query_conex'); //rota utilizada componente le_conex



app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false})); // para aceitar apenas dados simples
app.use(bodyParser.json()); // para aceitar apenas a entrada de Json no Body

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin', '*'); // * para aceitar de qualquer servidor
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

   // if (req.method === 'OPTIONS') {
       // res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      //  return res.status(200).send({});
    //}

    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    if (req.method === 'OPTIONS') {
        return res.status(200).send({});
    }
    next();
})


    //app.use ('/teste',(req, res, next) => {
    //    res.status(200).send ({
    //                mensagem: 'ok, deu certo'
    //        });


    //app.use('/caixa',rotacaixas);
    //app.use('/teste',rotateste);
    app.use('/consulta-rbx', consultaRbxRoutes);

    app.use('/caixas',rotacaixass);
    app.use('/caixas_condominio',rotacaixass_cond);
    app.use('/ctos',rotactos);
    app.use('/ctos_sp',rotactosSP);
    app.use('/cabos',rotacabos);
    app.use('/usuarios',rotaUsuarios);
    app.use('/autentica',rotaAutentica);
    app.use('/cidades',rotaCidades);
    app.use('/bocas',rotaBocas);
    app.use('/bandejas',rotaBandejas);
    app.use('/update_geocabo',rotaUpdateGeoCabo)
    app.use('/update_Label_cabo',rotaUpdateLabelCabo)
    app.use('/update_geocaixa',rotaUpdateGeoCaixa)
    app.use('/update_geodio',rotaUpdateGeoDio)
    app.use('/update_geopop',rotaUpdateGeoPop)
    app.use('/update_geopoligono',rotaUpdateGeoPoli)
    app.use('/divide_cabo',rotadivideCabo)


    app.use('/update_fusao',rotaFusao)
    app.use('/update_fusao_fibraEntradaSP',rotaFusao_fibraEntradaSP)
    app.use('/update_fusao_fibraSaidaSP',rotaFusao_fibraSaidaSP)
    app.use('/update_fusao_SaidaEntradaSP',rotaFusao_SaidaEntradaSP)
    app.use('/update_fusao_tubo',rotaFusao_tubo)
    app.use('/update_tipagem_caixa',rotaTipagem_caixa)
    app.use('/update_dio_equipamento',rotaDIO_equipamento)
    app.use('/update_cliente',rotaUpdate_cliente)
    app.use('/update_estacao',rotaUpdate_estacao)

    app.use('/update_exclui_fusao',rotaExcluiFusao)
    app.use('/update_exclui_fusao_fibraEntradaSP',rotaExcluiFusao_fibraEntradaSP)
    app.use('/update_exclui_fusao_fibraSaidaSP',rotaExcluiFusao_fibraSaidaSP)
    app.use('/update_exclui_fusao_SaidaEntradaSP',rotaExcluiFusao_SaidaEntradaSP)
    

    app.use('/verificar_ponta',rotaVerificarPonta)
    app.use('/LeBeginEnd',rotaLeBeginEnd)
    app.use('/conexao_boca',rotaConexaoBoca)
    app.use('/conexao_bandeja',rotaConexaoBandeja)
    app.use('/conexao_bandeja_fibra',rotaConexaoBandejaFibra)
    app.use('/conexao_bandeja_fibra_exclui',rotaConexaoBandejaFibraExclui)
    app.use('/desconexao_boca',rotaDesconexaoBoca)
    app.use('/desconexao_bandeja',rotaDesconexaoBandeja)

    app.use('/extrai_cabo_entrada_sp',rotaExtraiCaboEntradaSP)
    app.use('/update_cliente_ativacao',rotaUpdateClienteAtivacao)
    app.use('/update_cliente_desativacao',rotaUpdateClienteDesativacao)

    app.use('/conex_dio',rotaConex_dio);
    app.use('/conex_bc',rotaConex_bc);
    app.use('/conex_bc1',rotaConex_bc1);
    app.use('/conex_bc2',rotaConex_bc2);
    app.use('/conex_bc3',rotaConex_bc3);
    app.use('/conex_bc4',rotaConex_bc4);
    app.use('/conex_bc5',rotaConex_bc5);
    app.use('/conex_bc6',rotaConex_bc6); 
    app.use('/conex_bc7',rotaConex_bc7); 
    app.use('/conex_bc8',rotaConex_bc8);
    app.use('/conex_bc9',rotaConex_bc9);
    app.use('/conex_bc10',rotaConex_bc10);
    app.use('/conex_bc11',rotaConex_bc11);
    app.use('/conex_bc12',rotaConex_bc12);
    app.use('/conex_bc13',rotaConex_bc13);
    app.use('/conex_bc14',rotaConex_bc14);
    app.use('/conex_bc15',rotaConex_bc15);
    app.use('/conex_bc16',rotaConex_bc16);
    app.use('/conex_bc17',rotaConex_bc17);
    app.use('/conex_bc18',rotaConex_bc18);
    app.use('/conex_cabopb_99',rotaConex_pb99);

    app.use('/tipo_objeto',rotaTipo_objeto)
    app.use('/tipo_cabo',rotaTipo_cabo);
    app.use('/tipos',rotaTipos);
    app.use('/le_idmeta_log',rotaLeIdmeta_log);
    app.use('/le_fusao_tubo',rotaLeFusao_tubo);
    app.use('/le_idcidade_log',rotaLeIdcidade_log);

    app.use('/splitter',rotaSplitter);
    app.use('/splitter_entrada',rotaSplitterEntrada)
    app.use('/conex_sp2',rotaConex_sp2);
    app.use('/conex_sp4',rotaConex_sp4);
    app.use('/conex_sp8',rotaConex_sp8);
    app.use('/conex_sp16',rotaConex_sp16);
    app.use('/conex_sp32',rotaConex_sp32);
    app.use('/conex_sp64',rotaConex_sp64);
    app.use('/conex_sp128',rotaConex_sp128);

    app.use('/conex_bc97',rotaConex_bc97);
    app.use('/conex_bc98',rotaConex_bc98);
    app.use('/conex_bc99',rotaConex_bc99);
    app.use('/pop',rotaPop);
    app.use('/update_bocaxy',rotaBCXY);
    app.use('/update_splitterxy',rotaSPXY);
    app.use('/heartbeat',rotaHeartbeat);
    app.use('/pops_coordenadas',rotaPops_coordenadas)
    app.use('/clientes_coordenadas',rotaClientes_coordenadas)
    app.use('/dios_coordenadas',rotaDios_coordenadas)
    app.use('/anotacoes_coordenadas', rotaAnotacoes_coordenadas)
    app.use('/poligonos_coordenadas', rotaPoligonos_coordenadas)
    app.use('/dio_equipamento',rotaDio_equip)

    app.use('/exclui_cabo',rotaExclui_cabo)
    app.use('/exclui_caixa',rotaExclui_caixa)
    app.use('/exclui_dio',rotaExclui_dio)
    app.use('/exclui_splitter',rotaExclui_splitter)
    app.use('/exclui_estacao',rotaExclui_estacao)
    app.use('/exclui_cliente',rotaExclui_cliente)
    app.use('/exclui_poligono',rotaExclui_poligono)
    app.use('/exclui_posicao_olt',rotaExclui_PosOLT)


    app.use('/insert_idmeta',rotaInsert_idmeta)
    app.use('/insert_cabo', rotaInsert_cabo)
    app.use('/insert_cliente', rotaInsert_cliente)
    app.use('/insert_caixa', rotaInsert_caixa)
    app.use('/insert_dio', rotaInsert_dio)
    app.use('/insert_posicao_olt', rotaInsert_posic_olt)
    app.use('/insert_logs', rotaInsert_logs)
    app.use('/insert_splitter', rotaInsert_splitter)
    app.use('/insert_poligono', rotaInsert_poligono)

    app.use('/condominios_coordenadas',rotaCondominios_coordenadas)
    app.use('/update_bocaAngle',rotaBCAngle)
    app.use('/update_splitterAngle',rotaSplitterAngle)
    app.use('/update_bocaLado',rotaBCLado)
    app.use('/analisa-conexao',rotaAnalisaConexao);
    app.use('/analisa-conexao-total',rotaAnalisaConexaoTotal);
    app.use('/analisa-conexao-nivel',rotaAnalisaConexaoNivel);

    app.use('/pesquisa-caixa',rotaPesquisaCaixa);
    app.use('/pesquisa-dio',rotaPesquisaDio);
    app.use('/pesquisa-cabo',rotaPesquisaCabo);
    app.use('/clientes-buscar-cadastrados',rotaClientesBuscarCadastrados);
    app.use('/clientes-plotar-cadastrados',rotaClientesPlotarCadastrados)

    app.use('/caixas-buscar',rotaCaixasBuscar);
    app.use('/clientes-buscar',rotaClientesBuscar);
    app.use('/estacoes-buscar',rotaEstacoesBuscar);
    app.use('/clientes-info',rotaInfoClientes);
    app.use('/clientes-buscar-ultimo',rotaClientesULT)

    app.use('/query-conex',rotaQueryConex)

    
    

    app.use((req,res,next) =>{
        const erro = new Error('Rota não encontrada')
        erro.status = 404;
        next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
        return res.send({
            erro:{
                mensagem: error.message
        }
    })

})



module.exports = app;