' IMPRESSÃO 13-11-2013
'
' utilizado para mapeamento splitter entrada para origem
' utilizado para campos destino caixa

Dim rs As Recordset
Dim tabel As String
Dim IDmet As Long '19012012 INTEGER
Dim NOMECABO As String
Public RETORNOobjID As String

'***********************************************************
' Modificado em 16092013 para aceitar analise de splitter no campo destino caixa
'**********************************************************


'Public Sub ANALISA_TABELA_INI_CAIXA(regist As String, TABELA As String, IDMETA As String, FIBER As String)


Public Sub ANALISA_TABELA_INI_CAIXA(regist As String, TABELA As String, idmeta As String, FIBER As String, METRAGEM As Double, ATENUACAO As Double, NIVELS As Double)

'**************************************************************
'ENTRA: regist ==> campo da tabela (Fibra_n.Label ou Fibra_n)
'ENTRA: tabela ==> tabela cabo     (caboa_tn ou cabob_tn)
'ENTRA: IDMETA ==> ID do cabo que foi Clicado
'**************************************************************

Dim tubo As Integer
Dim POSIÇÃO As Integer
Dim DESTINO_TAB As String ' contera a tabela
Dim POS_1 As Integer
Dim POS_2 As Integer
Dim POS As Integer
Dim fibra As String
Dim reg As String ' contera o registro da tabela
Dim STATUS As String
Dim idpop As String
Dim RStst As Recordset
Dim dB As Double

FIBER = 0

Do While STATUS <> "fim"


Set RStst = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT TIPO_OBJETO from ids where id_meta = " & idmeta & ";") '190913
If ((InStr(1, RStst!tipo_objeto, "splitter")) * (InStr(1, TABELA, "cxboca"))) <> 0 Then Set RStst = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT id_meta_caixa from splitter_e where idmeta = " & idmeta & ";"): idmeta = RStst!ID_META_CAIXA


If TABELA = "SPLITTER_E" Then tabelinha = "splitter_e" Else tabelinha = TABELA

'Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT " & regist & " as registro from " & TABELA & " where idmeta = " & IDMETA & ";")
Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT " & regist & " as registro from " & tabelinha & " where idmeta = " & idmeta & ";")




'cabo aberto -> devolve idmeta do cabo
If rs!registro <> "" Then tabel = rs!registro Else STATUS = "fim": IDmet = idmeta: GoTo FIM ' se for = "" siginifica cabo aberto senão leio o custom do objeto **********************************
'caixa parado -> devolve idmeta da caixa
If tabel = "=id()" Then STATUS = "fim": GoTo FIM ' se for ="id()" esta  parando na caixa


'  exemplo de tabel   "=cabo3B!PropFibra_1.Label"
If InStr(1, tabel, "cabo") Or InStr(1, UCase(tabel), "cabo") Then DESTINO_TAB = "cabo"
If (InStr(1, tabel, "ROW_5") * InStr(1, tabel, "TST")) Then DESTINO_TAB = "POP"
If (InStr(1, tabel, "ROW_5") * InStr(1, tabel, "DIO")) Then DESTINO_TAB = "DIO"
If (InStr(1, tabel, "ROW_5") * InStr(1, tabel, "RBX")) Then DESTINO_TAB = "RABICHO"
If (InStr(1, tabel, "ROW_5") * InStr(1, tabel, "CDO")) Then DESTINO_TAB = "CONDOMINIO"
If InStr(1, tabel, "splitter") Then DESTINO_TAB = "SPLITTER_SAIDA"       '*********160913
'180315 If InStr(1, tabel, "splitter_E") Then DESTINO_TAB = "SPLITTER_ENTRADA"   '*********160913
If (InStr(1, tabel, "splitter_E") Or InStr(1, tabel, "splitter_e")) Then DESTINO_TAB = "SPLITTER_ENTRADA"   '*********160913



TESTA_CAIXA:
If InStr(1, tabel, "BOCA1") Or InStr(1, UCase(tabel), "BOCA1") Then DESTINO_TAB = "cxboca1"
If InStr(1, tabel, "BOCA2") Or InStr(1, UCase(tabel), "BOCA2") Then DESTINO_TAB = "cxboca2"
If InStr(1, tabel, "BOCA3") Or InStr(1, UCase(tabel), "BOCA3") Then DESTINO_TAB = "cxboca3"
If InStr(1, tabel, "BOCA4") Or InStr(1, UCase(tabel), "BOCA4") Then DESTINO_TAB = "cxboca4"
If InStr(1, tabel, "BOCA5") Or InStr(1, UCase(tabel), "BOCA5") Then DESTINO_TAB = "cxboca5"
If InStr(1, tabel, "BOCA6") Or InStr(1, UCase(tabel), "BOCA6") Then DESTINO_TAB = "cxboca6"
If InStr(1, tabel, "BOCA7") Or InStr(1, UCase(tabel), "BOCA7") Then DESTINO_TAB = "cxboca7"
If InStr(1, tabel, "BOCA8") Or InStr(1, UCase(tabel), "BOCA8") Then DESTINO_TAB = "cxboca8"
If InStr(1, tabel, "BOCA9") Or InStr(1, UCase(tabel), "BOCA9") Then DESTINO_TAB = "cxboca9"
If InStr(1, tabel, "BOCA10") Or InStr(1, UCase(tabel), "BOCA10") Then DESTINO_TAB = "cxboca10"
If InStr(1, tabel, "BOCA11") Or InStr(1, UCase(tabel), "BOCA11") Then DESTINO_TAB = "cxboca11"
If InStr(1, tabel, "BOCA12") Or InStr(1, UCase(tabel), "BOCA12") Then DESTINO_TAB = "cxboca12"
If InStr(1, tabel, "BOCA13") Or InStr(1, UCase(tabel), "BOCA13") Then DESTINO_TAB = "cxboca13"
If InStr(1, tabel, "BOCA14") Or InStr(1, UCase(tabel), "BOCA14") Then DESTINO_TAB = "cxboca14"
If InStr(1, tabel, "BOCA15") Or InStr(1, UCase(tabel), "BOCA15") Then DESTINO_TAB = "cxboca15"
If InStr(1, tabel, "BOCA16") Or InStr(1, UCase(tabel), "BOCA16") Then DESTINO_TAB = "cxboca16"
If InStr(1, tabel, "BOCA17") Or InStr(1, UCase(tabel), "BOCA17") Then DESTINO_TAB = "cxboca17"
If InStr(1, tabel, "BOCA18") Or InStr(1, UCase(tabel), "BOCA18") Then DESTINO_TAB = "cxboca18"


If InStr(1, tabel, "BOCA97") Or InStr(1, UCase(tabel), "BOCA97") Then DESTINO_TAB = "cxboca97"
If InStr(1, tabel, "BOCA98") Or InStr(1, UCase(tabel), "BOCA98") Then DESTINO_TAB = "cxboca98"



If (InStr(1, tabel, "dioc")) Then DESTINO_TAB = "DIOcabo" ' situação em que analise inicia no view dio


'******************************************************************
Cabo:
'******************************************************************
POS_2 = 0

If DESTINO_TAB <> "cabo" Then GoTo CAIXA '****** extrai tabela e campo para caso cabo

If InStr(1, tabel, "B!") Then DESTINO_TAB = DESTINO_TAB & "b": tabelacabo = "cabopb" 'TABELACABO PARA PESQUISA POSTERIOR DO ID DO CABO
If InStr(1, tabel, "A!") Then DESTINO_TAB = DESTINO_TAB & "a": tabelacabo = "cabopa"


'EXEMPLO =>>> caboa_---EXTRAI FIBRA---------------------------------------------------------
  POS_1 = InStr(1, tabel, "_") '+++++++++++++++++ para extrair numero da fibra
  If InStr(1, tabel, ".L") Then POS_2 = InStr(1, tabel, ".L")
  If InStr(1, tabel, ".V") Then POS_2 = InStr(1, tabel, ".V")
  If POS_2 = 0 Then POS_2 = Len(tabel): POS_2 = POS_2 + 1
  
  
  DIGITOS = POS_2 - POS_1
  fibra = Mid(tabel, POS_1 + 1, DIGITOS - 1) ' pego o numero da fibra
  
If fibra < 13 Then tubo = 1
If fibra > 12 Then tubo = 2
If fibra > 24 Then tubo = 3
If fibra > 36 Then tubo = 4
If fibra > 48 Then tubo = 5
If fibra > 60 Then tubo = 6
If fibra > 72 Then tubo = 7
If fibra > 84 Then tubo = 8
If fibra > 96 Then tubo = 9
If fibra > 108 Then tubo = 10
If fibra > 120 Then tubo = 11
If fibra > 132 Then tubo = 12
   
   
   
  
  DESTINO_TAB = DESTINO_TAB & "_t" & tubo 'fibra  ' destino_tab = nome da tabela
'EXEMPLO =>>> caboa_t1


reg = "FIBRA_" & fibra '---------------------------------------- reg = registro da tabela
'EXEMPLO =>>> fibra_1label

  If InStr(1, tabel, "Label") Then reg = reg & "Label" '20/07/2010
  If InStr(1, tabel, "Value") Or InStr(1, tabel, "VALUE") Then reg = reg & ""


'CAMPO.AddItem (reg)                      ' VISUALIZO REGISTRO
'-----------------------------------------------------------------------------------------


'PESQUISAR IDMETA DO CABO ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

If InStr(1, tabel, "=") Then i = 2 Else i = 1 'then alguns campos que começam com =cabo3a!...

  POS_1 = InStr(i, tabel, "!")
  NOMECABO = Mid(tabel, i, POS_1 - i)
  'EXEMPLO =>>> =cabo3B!Prop.Fibra_1.Label
'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  
  
  
Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT ID_META from " & tabelacabo & " where id_VISIO = '" & NOMECABO & "';")

IDmet = rs!ID_META ': IDMETA.Text = IDmet

FIBER = 0 ' se fibra parada no cabo retorna fibra 0


Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT length from cabopa where id_meta = '" & IDmet & "';")

If tabelacabo = "cabopa" Then METRAGEM = METRAGEM + rs!Length

GoTo FIM:

'************************************************
CAIXA:
'************************************************


If InStr(1, DESTINO_TAB, "cxboca") = 0 Then GoTo pop

'EXEMPLO =>>> caboa_---EXTRAI FIBRA---------------------------------------------------------
  POS_1 = InStr(1, tabel, "_") '+++++++++++++++++ para extrair numero da fibra
  If InStr(1, tabel, ".V") Then POS_2 = InStr(1, tabel, ".V")
  If InStr(1, tabel, ".l") Then POS_2 = InStr(1, tabel, ".l")
  If POS_2 = 0 Then POS_2 = Len(tabel): POS_2 = POS_2 + 1
  DIGITOS = POS_2 - POS_1
  fibra = Mid(tabel, POS_1 + 1, DIGITOS - 1) ' pego o numero da fibra
  
If fibra < 13 Then tubo = 1
If fibra > 12 Then tubo = 2
If fibra > 24 Then tubo = 3
If fibra > 36 Then tubo = 4
If fibra > 48 Then tubo = 5
If fibra > 60 Then tubo = 6
If fibra > 72 Then tubo = 7
If fibra > 84 Then tubo = 8
If fibra > 96 Then tubo = 9
If fibra > 108 Then tubo = 10
If fibra > 120 Then tubo = 11
If fibra > 132 Then tubo = 12



DESTINO_TAB = DESTINO_TAB & "_t" & tubo 'fibra


reg = "F" & fibra  '-------------------------------------- reg = registro da tabela
'EXEMPLO =>>> F1.L

  If InStr(1, tabel, "Label") Or InStr(1, tabel, "label") Then reg = reg & "L"
  If InStr(1, tabel, "Value") Then reg = reg & ""


'CAMPO.AddItem (reg)                      ' VISUALIZO REGISTRO
'---------------------------------------------------------------------------------------

'PESQUISAR IDMETA DO CABO ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

If InStr(1, tabel, "=") Then i = 5 Else i = 4 'then alguns campos que começam com =cabo3a!...

  If InStr(i, tabel, "!") Then POS_1 = InStr(i, tabel, "!"): NOMECABO = Mid(tabel, i, POS_1 - i): IDmet = NOMECABO ': IDMETA.Text = NOMECABO' quando não esxite "!" e porque esta navegando dentro da caixa boca para boca imeta é o mesmo
  
  'EXEMPLO =>>> =cabo3B!Prop.Fibra_1.Label
'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  

'Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT IDMETA from " & DESTINO_TAB & " where id_VISIO = '" & NOMECABO & "';")

'08/11/2010 IDmet = NOMECABO ': IDMETA.Text = NOMECABO

FIBER = 0 ' se fibra parada na caixa retorna fibra 0

GoTo FIM

'***************************************
pop:
'***************************************

If InStr(1, DESTINO_TAB, "POP") = 0 Then GoTo CONDOMINIO


'PESQUISAR IDMETA DO POP ++++++++++++++extraio o id meta do POP++++++++++++++++++++++++++++++++++++++++++++

If InStr(1, tabel, "=") Then i = 5 Else i = 4 'then alguns campos que começam com =cabo3a!...

  If InStr(i, tabel, "!") Then POS_1 = InStr(i, tabel, "!"): IDmet = Mid(tabel, i, POS_1 - i) ' quando não esxite "!" e porque esta navegando dentro da caixa boca para boca imeta é o mesmo
  
  'EXEMPLO =>>> =cabo3B!Prop.Fibra_1.Label
'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  
'EXEMPLO =>>>---EXTRAI FIBRA do regist---------------------------------------------------------
  POS_1 = InStr(1, regist, "_") '+++++++++++++++++ para extrair numero da fibra
  If InStr(1, regist, "Label") Then POS_2 = InStr(1, regist, "Label")
  DIGITOS = POS_2 - POS_1
  FIBER = Mid(regist, POS_1 + 1, DIGITOS - 1) ' pego o numero da fibra
  

'MsgBox "CHEGOU NO POP"
STATUS = "fim"

GoTo FIM


'***************************************
CONDOMINIO:
'***************************************

If InStr(1, DESTINO_TAB, "CONDOMINIO") = 0 Then GoTo RABICHO


'PESQUISAR IDMETA DO POP ++++++++++++++extraio o id meta do POP++++++++++++++++++++++++++++++++++++++++++++

If InStr(1, tabel, "=") Then i = 5 Else i = 4 'then alguns campos que começam com =cabo3a!...

  If InStr(i, tabel, "!") Then POS_1 = InStr(i, tabel, "!"): IDmet = Mid(tabel, i, POS_1 - i) ' quando não esxite "!" e porque esta navegando dentro da caixa boca para boca imeta é o mesmo
  
  'EXEMPLO =>>> =cabo3B!Prop.Fibra_1.Label
'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  
'EXEMPLO =>>>---EXTRAI FIBRA do regist---------------------------------------------------------
  POS_1 = InStr(1, regist, "_") '+++++++++++++++++ para extrair numero da fibra
  If InStr(1, regist, "Label") Then POS_2 = InStr(1, regist, "Label")
  DIGITOS = POS_2 - POS_1
  FIBER = Mid(regist, POS_1 + 1, DIGITOS - 1) ' pego o numero da fibra
  

'MsgBox "CHEGOU NO POP"
STATUS = "fim"

GoTo FIM


'***************************************
RABICHO:
'***************************************

' 17092013 If InStr(1, DESTINO_TAB, "RABICHO") = 0 Then GoTo DIO
If InStr(1, DESTINO_TAB, "RABICHO") = 0 Then GoTo SPLITTER_SAIDA ' 17092013 SUBSTITUIU ACIMA

'PESQUISAR IDMETA DO POP ++++++++++++++extraio o id meta do POP++++++++++++++++++++++++++++++++++++++++++++

If InStr(1, tabel, "=") Then i = 5 Else i = 4 'then alguns campos que começam com =cabo3a!...

  If InStr(i, tabel, "!") Then POS_1 = InStr(i, tabel, "!"): IDmet = Mid(tabel, i, POS_1 - i) ' quando não esxite "!" e porque esta navegando dentro da caixa boca para boca imeta é o mesmo
  
  'EXEMPLO =>>> =cabo3B!Prop.Fibra_1.Label
'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  
'EXEMPLO =>>>---EXTRAI FIBRA do regist---------------------------------------------------------
  POS_1 = InStr(1, regist, "_") '+++++++++++++++++ para extrair numero da fibra
  If InStr(1, regist, "Label") Then POS_2 = InStr(1, regist, "Label")
  DIGITOS = POS_2 - POS_1
  FIBER = Mid(regist, POS_1 + 1, DIGITOS - 1) ' pego o numero da fibra
  

'MsgBox "CHEGOU NO POP"
STATUS = "fim"

GoTo FIM

'***************************************
SPLITTER_SAIDA: 'SENTIDO SAIDA -> ENTRADA OU ENTRADA -> SAIDA
'***************************************



If InStr(1, DESTINO_TAB, "SPLITTER_ENTRADA") <> 1 Then STATUS = "": GoTo SPLITTER_ENTRADA


 Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT TIPO_OBJETO from ids where id_meta = " & idmeta & ";") '180913

SENTIDO_ENTRADA_SAIDA: '-------------------------------
 If rs!tipo_objeto <> "CAIXA" Then GoTo SENTIDO_SAIDA_ENTRADA

 POS1 = 16    ' prop.splitter_E25.label -> exemplo do formato de campo
 POS2 = InStr(1, tabel, ".l")
 TAM = POS2 - POS1
 IDmet = Mid(tabel, 16, TAM) ' entra o valor do id do splitter

 STATUS = "fim"
 GoTo FIM
 
SENTIDO_SAIDA_ENTRADA:  '-------------------------------
 
 DESTINO_TAB = "SPLITTER_E": tabelinha = "splitter_e"

 '020115 Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT ENTRADA as registro,ID_META_CAIXA from " & DESTINO_TAB & " where idmeta = " & IDMETA & ";") '180913
 Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT ENTRADA as registro,ID_META_CAIXA,CAPACIDADE from " & tabelinha & " where idmeta = " & idmeta & ";") '180913
 
 IDmet = rs!ID_META_CAIXA  ' 180913 PEGO ID DA CAIXA POIS ESTAVA COM O ID DO SPLITTER

 If rs!registro <> "" Then tabel = rs!registro Else STATUS = "fim":  GoTo FIM ' se for = "" siginifica cabo aberto senão leio o custom do objeto **********************************


 DESTINO_TAB = "cxboca"
 tabel = rs!registro








 GoTo TESTA_CAIXA




'***************************************
SPLITTER_ENTRADA: 'SENTIDO SAIDA -> ENTRADA OU ENTRADA -> SAIDA
'***************************************




If InStr(1, DESTINO_TAB, "SPLITTER_SAIDA") <> 1 Then STATUS = "": GoTo DIO









Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT TIPO_OBJETO from ids where id_meta = " & idmeta & ";") '180913

SENTIDO__ENTRADA_SAIDA: '-------------------------------
If rs!tipo_objeto <> "CAIXA" Then GoTo SENTIDO_SAIDA__ENTRADA

POS1 = 14   ' prop.splitter_E25.label -> exemplo do formato de campo
POS2 = InStr(1, tabel, "_")
TAM = POS2 - POS1
IDmet = Mid(tabel, 14, TAM) ' entra o valor do id do splitter

POS1 = InStr(1, tabel, "_")    ' prop.splitter_E25.label -> exemplo do formato de campo
POS2 = InStr(1, tabel, ".l")
TAM = POS2 - POS1
fibra = Mid(tabel, POS1, TAM)  ' entra o valor do id do splitter


'====================================================21082019===================================================================================
'=======================================soma atenuaçãode splitters======================================================================
Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT CAPACIDADE,tipo_splitter from splitter_e where idmeta = " & IDmet & ";") '180913
 

If rs!CAPACIDADE = 2 And rs!TIPO_SPLITTER = 12 Then dB = 3.7 'dB = 3
If rs!CAPACIDADE = 4 And rs!TIPO_SPLITTER = 13 Then dB = 7.1 'dB = 6
If rs!CAPACIDADE = 8 And rs!TIPO_SPLITTER = 14 Then dB = 10.5 'dB = 9
If rs!CAPACIDADE = 16 And rs!TIPO_SPLITTER = 15 Then dB = 13.7 'dB = 12
If rs!CAPACIDADE = 32 And rs!TIPO_SPLITTER = 16 Then dB = 17.1 'dB = 15
If rs!CAPACIDADE = 64 And rs!TIPO_SPLITTER = 17 Then dB = 20.5 'dB = 18
If rs!CAPACIDADE = 128 And rs!TIPO_SPLITTER = 18 Then dB = 23 'dB = 21
If rs!CAPACIDADE = 256 And rs!TIPO_SPLITTER = 19 Then dB = 26 'dB = 24


If rs!TIPO_SPLITTER = 1 And fibra = "_1" Then dB = 20.5 '1/99
If rs!TIPO_SPLITTER = 1 And fibra = "_2" Then dB = 0.16 '1/99

If rs!TIPO_SPLITTER = 2 And fibra = "_1" Then dB = 18 ' 2/98
If rs!TIPO_SPLITTER = 2 And fibra = "_2" Then dB = 0.16 '2/98

If rs!TIPO_SPLITTER = 3 And fibra = "_1" Then dB = 13.7 '5/95
If rs!TIPO_SPLITTER = 3 And fibra = "_2" Then dB = 0.36 '5/95

If rs!TIPO_SPLITTER = 4 And fibra = "_1" Then dB = 10.5 ' 10/90
If rs!TIPO_SPLITTER = 4 And fibra = "_2" Then dB = 0.55 ' 10/90

If rs!TIPO_SPLITTER = 5 And fibra = "_1" Then dB = 8.07 ' 15/85
If rs!TIPO_SPLITTER = 5 And fibra = "_2" Then dB = 0.85 ' 15/85

If rs!TIPO_SPLITTER = 6 And fibra = "_1" Then dB = 7.3 ' 20/80
If rs!TIPO_SPLITTER = 6 And fibra = "_2" Then dB = 1.04 ' 20/80

If rs!TIPO_SPLITTER = 7 And fibra = "_1" Then dB = 6.4 ' 25/75
If rs!TIPO_SPLITTER = 7 And fibra = "_2" Then dB = 1.4 ' 25/75

If rs!TIPO_SPLITTER = 8 And fibra = "_1" Then dB = 5.3 ' 30/70
If rs!TIPO_SPLITTER = 8 And fibra = "_2" Then dB = 1.2 ' 30/70

If rs!TIPO_SPLITTER = 9 And fibra = "_1" Then dB = 4.8 ' 35/65
If rs!TIPO_SPLITTER = 9 And fibra = "_2" Then dB = 2.05 ' 35/65

If rs!TIPO_SPLITTER = 10 And fibra = "_1" Then dB = 4.3 ' 40/60
If rs!TIPO_SPLITTER = 10 And fibra = "_2" Then dB = 2.4 ' 40/60

If rs!TIPO_SPLITTER = 11 And fibra = "_1" Then dB = 3.7 ' 45/55
If rs!TIPO_SPLITTER = 11 And fibra = "_2" Then dB = 2.8 ' 45/55



ATENUACAO = ATENUACAO + dB
'==============================================================================================================
'==============================================================================================================








DESTINO_TAB = "SPLITTER_E": tabelinha = "splitter_e"
reg = "ENTRADA"

GoTo FIM
 
  
SENTIDO_SAIDA__ENTRADA:  '-------------------------------
 
DESTINO_TAB = "SPLITTER_E": tabelinha = "splitter_e"

 '020115 Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT ENTRADA as registro,ID_META_CAIXA from " & DESTINO_TAB & " where idmeta = " & IDMETA & ";") '180913
  Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT ENTRADA as registro,ID_META_CAIXA,capacidade from " & tabelinha & " where idmeta = " & idmeta & ";") '180913

 IDmet = rs!ID_META_CAIXA  ' 180913 PEGO ID DA CAIXA POIS ESTAVA COM O ID DO SPLITTER
 If rs!registro <> "" Then tabel = rs!registro Else STATUS = "fim":  GoTo FIM ' se for = "" siginifica cabo aberto senão leio o custom do objeto **********************************

 DESTINO_TAB = "cxboca"
 tabel = rs!registro
 GoTo TESTA_CAIXA




'***************************************
DIO:
'***************************************

If InStr(1, DESTINO_TAB, "DIOc") <> 0 Then STATUS = "": GoTo DIOc ' mudado em 0711 para <> 0 era =1

'PESQUISAR IDMETA DO POP ++++++++++++++extraio o id meta do POP++++++++++++++++++++++++++++++++++++++++++++

If InStr(1, tabel, "=") Then i = 5 Else i = 4 'then alguns campos que começam com =cabo3a!...

  If InStr(i, tabel, "!") Then POS_1 = InStr(i, tabel, "!"): IDmet = Mid(tabel, i, POS_1 - i) ' quando não esxite "!" e porque esta navegando dentro da caixa boca para boca imeta é o mesmo
  
  'EXEMPLO =>>> =cabo3B!Prop.Fibra_1.Label
'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  
'EXEMPLO =>>>---EXTRAI FIBRA do regist---------------------------------------------------------
  POS_1 = InStr(1, regist, "_") '+++++++++++++++++ para extrair numero da fibra
  If InStr(1, regist, "Label") Then POS_2 = InStr(1, regist, "Label")
  DIGITOS = POS_2 - POS_1
  FIBER = Mid(regist, POS_1 + 1, DIGITOS - 1) ' pego o numero da fibra
  
  
If FIBER <= 12 Then DIO_TAB = "dio_t1"
If FIBER > 12 Then DIO_TAB = "dio_t2"
If FIBER > 24 Then DIO_TAB = "dio_t3"
If FIBER > 36 Then DIO_TAB = "dio_t4"
If FIBER > 48 Then DIO_TAB = "dio_t5"
If FIBER > 60 Then DIO_TAB = "dio_t6"
If FIBER > 72 Then DIO_TAB = "dio_t7"
If FIBER > 84 Then DIO_TAB = "dio_t8"
If FIBER > 96 Then DIO_TAB = "dio_t9"
If FIBER > 108 Then DIO_TAB = "dio_t10"
If FIBER > 120 Then DIO_TAB = "dio_t11"
If FIBER > 132 Then DIO_TAB = "dio_t12"
  
  
'----------- COMENTEI EM 03122020 -----------------------------------------------------
'Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("select N" & FIBER & " AS NIVEL FROM " & DIO_TAB & " WHERE IDMETA=" & IDmet & ";")
  
  
'If rs!NIVEL <> " " And rs!NIVEL <> "" And rs!NIVEL <> "OFF" Then NIVELS = rs!NIVEL Else NIVELS = -399  ' 399 para indicar que não existe sinal OFF


  
  

regist = "FN_" & FIBER & "LABEL" 'OBTENHO REGISTRO DO CABO QUE TEM O NUMERO DA FIBRA NO CONECTOR DO DIO

Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("SELECT " & regist & " as registro from " & TABELA & " where idmeta = " & idmeta & ";")
FIBER = rs!registro





If FIBER <= 12 Then DIO_TAB = "dio_t1"
If FIBER > 12 Then DIO_TAB = "dio_t2"
If FIBER > 24 Then DIO_TAB = "dio_t3"
If FIBER > 36 Then DIO_TAB = "dio_t4"
If FIBER > 48 Then DIO_TAB = "dio_t5"
If FIBER > 60 Then DIO_TAB = "dio_t6"
If FIBER > 72 Then DIO_TAB = "dio_t7"
If FIBER > 84 Then DIO_TAB = "dio_t8"
If FIBER > 96 Then DIO_TAB = "dio_t9"
If FIBER > 108 Then DIO_TAB = "dio_t10"
If FIBER > 120 Then DIO_TAB = "dio_t11"
If FIBER > 132 Then DIO_TAB = "dio_t12"




'---------------INCLUI AQUI A LEITURA DO NIVEL PARA PEGAR A FIBRA DEPOIS DA CONEXAO DA BANDEIJA--------------------------------------------------
    
    Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("select N" & FIBER & " AS NIVEL FROM " & DIO_TAB & " WHERE IDMETA=" & IDmet & ";")
  
    If rs!NIVEL <> " " And rs!NIVEL <> "" And rs!NIVEL <> "OFF" Then NIVELS = rs!NIVEL Else NIVELS = -399  ' 399 para indicar que não existe sinal OFF
'-------------------------------------------------------------------------------------------------------------------------------------------------





'MsgBox "CHEGOU NO DIO"
STATUS = "fim"

GoTo FIM

'*************************************** extrair proxima tabela a partir do dio
DIOc:
'***************************************



'PESQUISAR IDMETA DO POP ++++++++++++++extraio o id meta do POP++++++++++++++++++++++++++++++++++++++++++++

' obtendo numero do conector
TAM = Len(regist)
FIBER = Mid(regist, 2, TAM - 1)

' obtendo cabo conectado a bandeja
If InStr(1, tabel, "c1") Then Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("select c1 as cabo from dio where id_meta = " & idmeta & ";")
If InStr(1, tabel, "c2") Then Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("select c2 as cabo from dio where id_meta = " & idmeta & ";")
If InStr(1, tabel, "c3") Then Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("select c3 as cabo from dio where id_meta = " & idmeta & ";")
If InStr(1, tabel, "c4") Then Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("select c4 as cabo from dio where id_meta = " & idmeta & ";")
If InStr(1, tabel, "c5") Then Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("select c5 as cabo from dio where id_meta = " & idmeta & ";")
If InStr(1, tabel, "c6") Then Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("select c6 as cabo from dio where id_meta = " & idmeta & ";")



If rs!Cabo = "ZERO" Then IDmet = idmeta: STATUS = "fim": GoTo FIM '04102010 NO LUGA DE ZERO = ""
Cabo = rs!Cabo

'obtendo numero da fibra do cabo fundida no conector
Set rs = VIEW_PROJETO_CONEXOES_CAIXA_VISIO_CADASTRO.connMETA.Execute("select FN" & FIBER & " as fiber from " & TABELA & " where idmeta =" & idmeta & ";")

fibra = rs!FIBER


If fibra <= 12 Then tubo = 1
If fibra > 12 Then tubo = 2
If fibra > 24 Then tubo = 3
If fibra > 36 Then tubo = 4
If fibra > 48 Then tubo = 5
If fibra > 60 Then tubo = 6
If fibra > 72 Then tubo = 7
If fibra > 84 Then tubo = 8
If fibra > 96 Then tubo = 9
If fibra > 108 Then tubo = 10
If fibra > 120 Then tubo = 11
If fibra > 132 Then tubo = 12

If InStr(1, Cabo, "A") Then tabel = "caboa_t" & tubo: POS = InStr(1, Cabo, "A")

If InStr(1, Cabo, "B") Then tabel = "cabob_t" & tubo: POS = InStr(1, Cabo, "B")

reg = "Fibra_" & fibra

IDmet = Mid(Cabo, 5, POS - 5)

DESTINO_TAB = tabel





FIM:


TABELA = DESTINO_TAB
idmeta = IDmet
regist = reg

'TABELA_DESTINO.AddItem (DESTINO_TAB)
'TABELA.Text = DESTINO_TAB
'REGISTRO.Text = reg




Loop

STATUS = ""


End Sub



