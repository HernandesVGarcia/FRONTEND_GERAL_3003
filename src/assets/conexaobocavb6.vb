Public Function CONECTA_BOCA1()

 Dim RSteste As Recordset
 Dim CAPACIDADE As Integer
 Dim MeuValor As Integer
 Dim MeuValorID As String
 Dim MeuValor2 As String
 Dim DIGITOS As Integer
 Dim IDCAIXA As Integer
 Dim caixaID As String
 Dim fibra As Integer
 Dim CAIXAVALUE As String
 Dim CABOVALUE As String
 Dim CAIXALABEL As String
 Dim CAIXALABELnum As String
 Dim CABOLABEL As String
 Dim CABOLABELnum As String
 
 
 
 Dim cellobj As Visio.Cell
 Dim cellobjVALUE As Visio.Cell
 Dim cellobjLABEL As Visio.Cell
 Dim J As Integer
 Dim CAMPO As String
 Dim ReferenciaDIOAplic As String
 Dim tabela_A As String
 Dim tabela_B As String
 Dim tabela_CX As String
 
 
 
 Set rs = frmLogin.connMETA.Execute("SELECT BOCA1,ESTRUT01 FROM caixa WHERE ID_META = '" & CONEXAO_CABO_CAIXA_EMENDA.ID_CX & "';")
 

 If rs!ESTRUT01 = "OK" Then GoTo PULA_ESTRUTURA





PULA_ESTRUTURA: ' *******VEM DIRETO PARA CA SE ESTRUTURA JA ESTIVER CRIADA









Set rs = frmLogin.connMETA.Execute("SELECT capacidade FROM cabopa WHERE id_meta=" & CONEXAO_CABO_CAIXA_EMENDA.ID_CAB & ";")

CAPACIDADE = rs!CAPACIDADE

'***************************************************************************************
frmLogin.connMETA.Execute "start transaCtion"  '***** INICIO A TRANSAÇÃO ***************
'***************************************************************************************


If CONEXAO_CABO_CAIXA_EMENDA.PONTA_CAB = "cabopa" Then frmLogin.connMETA.Execute "UPDATE caixa SET BOCA1='cabo" & CONEXAO_CABO_CAIXA_EMENDA.ID_CAB & "A' WHERE ID_META='" & CONEXAO_CABO_CAIXA_EMENDA.ID_CX & "';"
If CONEXAO_CABO_CAIXA_EMENDA.PONTA_CAB = "cabopb" Then frmLogin.connMETA.Execute "UPDATE caixa SET BOCA1='cabo" & CONEXAO_CABO_CAIXA_EMENDA.ID_CAB & "B' WHERE ID_META='" & CONEXAO_CABO_CAIXA_EMENDA.ID_CX & "';"

 
For J = 1 To CAPACIDADE


'SÓ OS LABEL RECEBE REFERENCIA TANTO OS LABEL CAIXA COMO CABO
'****  joga no objeto de desenho cabo a referencia da caixa*********************
     
      
             CABOLABEL = "=TST" & CONEXAO_CABO_CAIXA_EMENDA.ID_CX & "!PROP.BOCA1_" & J & ".VALUE"

      
      
            CABOLABELnum = "=TST" & CONEXAO_CABO_CAIXA_EMENDA.ID_CX & "!PROP.FN1_" & J & ".VALUE"

      
       
      
     
'*************************************************************

      If J <= 12 Then tabela_A = "caboa_t1": tabela_B = "cabob_t1": tabela_CX = "cxboca1_t1"
      If J > 12 Then tabela_A = "caboa_t2": tabela_B = "cabob_t2": tabela_CX = "cxboca1_t2"
      If J > 24 Then tabela_A = "caboa_t3": tabela_B = "cabob_t3": tabela_CX = "cxboca1_t3"
      If J > 36 Then tabela_A = "caboa_t4": tabela_B = "cabob_t4": tabela_CX = "cxboca1_t4"
      If J > 48 Then tabela_A = "caboa_t5": tabela_B = "cabob_t5": tabela_CX = "cxboca1_t5"
      If J > 60 Then tabela_A = "caboa_t6": tabela_B = "cabob_t6": tabela_CX = "cxboca1_t6"
      If J > 72 Then tabela_A = "caboa_t7": tabela_B = "cabob_t7": tabela_CX = "cxboca1_t7"
      If J > 84 Then tabela_A = "caboa_t8": tabela_B = "cabob_t8": tabela_CX = "cxboca1_t8"
      If J > 96 Then tabela_A = "caboa_t9": tabela_B = "cabob_t9": tabela_CX = "cxboca1_t9"
      If J > 108 Then tabela_A = "caboa_t10": tabela_B = "cabob_t10": tabela_CX = "cxboca1_t10"
      If J > 120 Then tabela_A = "caboa_t11": tabela_B = "cabob_t11": tabela_CX = "cxboca1_t11"
      If J > 132 Then tabela_A = "caboa_t12": tabela_B = "cabob_t12": tabela_CX = "cxboca1_t12"
     
     
     
     If CONEXAO_CABO_CAIXA_EMENDA.PONTA_CAB = "cabopa" Then frmLogin.connMETA.Execute "UPDATE " & tabela_A & " SET FIBRA_" & J & "LABEL='" & CABOLABEL & "'WHERE IDMETA = '" & CONEXAO_CABO_CAIXA_EMENDA.ID_CAB & "';"
     If CONEXAO_CABO_CAIXA_EMENDA.PONTA_CAB = "cabopb" Then frmLogin.connMETA.Execute "UPDATE " & tabela_B & " SET FIBRA_" & J & "LABEL='" & CABOLABEL & "'WHERE IDMETA = '" & CONEXAO_CABO_CAIXA_EMENDA.ID_CAB & "';"
      
     If CONEXAO_CABO_CAIXA_EMENDA.PONTA_CAB = "cabopa" Then frmLogin.connMETA.Execute "UPDATE " & tabela_A & " SET FN_" & J & "LABEL='" & CABOLABELnum & "'WHERE IDMETA = '" & CONEXAO_CABO_CAIXA_EMENDA.ID_CAB & "';"
     If CONEXAO_CABO_CAIXA_EMENDA.PONTA_CAB = "cabopb" Then frmLogin.connMETA.Execute "UPDATE " & tabela_B & " SET FN_" & J & "LABEL='" & CABOLABELnum & "'WHERE IDMETA = '" & CONEXAO_CABO_CAIXA_EMENDA.ID_CAB & "';"
       
      
      
      
 'SÓ OS LABEL RECEBE REFERENCIA TANTO OS LABEL CAIXA COMO CABO
'****  joga no obj desenho caixa a referencia do cabo*********************
      
      
      

If CONEXAO_CABO_CAIXA_EMENDA.PONTA_CAB = "cabopa" Then CAIXALABEL = "=cabo" & CONEXAO_CABO_CAIXA_EMENDA.ID_CAB & "A!Prop.Fibra_" & J & ".VALUE"
If CONEXAO_CABO_CAIXA_EMENDA.PONTA_CAB = "cabopb" Then CAIXALABEL = "=cabo" & CONEXAO_CABO_CAIXA_EMENDA.ID_CAB & "B!Prop.Fibra_" & J & ".VALUE"
                         
           
 
If CONEXAO_CABO_CAIXA_EMENDA.PONTA_CAB = "cabopa" Then CAIXALABELnum = "=cabo" & CONEXAO_CABO_CAIXA_EMENDA.ID_CAB & "A!Prop.FN_" & J & ".VALUE"
If CONEXAO_CABO_CAIXA_EMENDA.PONTA_CAB = "cabopb" Then CAIXALABELnum = "=cabo" & CONEXAO_CABO_CAIXA_EMENDA.ID_CAB & "B!Prop.FN_" & J & ".VALUE"

              
           
           
           
           
 '************************************************************
           
           
      frmLogin.connMETA.Execute "UPDATE " & tabela_CX & " SET F" & J & "L='" & CAIXALABEL & "'WHERE IDMETA = '" & CONEXAO_CABO_CAIXA_EMENDA.ID_CX & "';"
      frmLogin.connMETA.Execute "UPDATE " & tabela_CX & " SET FN" & J & "L='" & CAIXALABELnum & "'WHERE IDMETA = '" & CONEXAO_CABO_CAIXA_EMENDA.ID_CX & "';"
      
      
Next J


frmLogin.connMETA.Execute "UPDATE caixa SET ESTRUT01 = 'OK' WHERE ID_META ='" & CONEXAO_CABO_CAIXA_EMENDA.ID_CX & "';"




Set rs = frmLogin.connMETA.Execute("SELECT NUMEROCX FROM caixa WHERE ID_META=" & CONEXAO_CABO_CAIXA_EMENDA.ID_CX & ";")

SALVA_LOGS 15, CONEXAO_CABO_CAIXA_EMENDA.ID_CX, "conectou BOCA1 CX" & rs!numerocx  ' 4 => CRIA OBJETO caixa




'*********************************************************************************************
frmLogin.connMETA.Execute "COMMIT"  ' *****  SALVO AS OPERAÇÕES REALIZADAS ATÉ O MOMENTO *****
'*********************************************************************************************
  





escapa:

End Function

