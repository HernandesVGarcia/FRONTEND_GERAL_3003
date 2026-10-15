Dim ScriptControl
Dim initialized As Boolean
Dim json As New ChilkatJsonObject
Dim jarray As New ChilkatJsonArray

Dim Json_todos As New ChilkatJsonObject
Dim Json_assinante As New ChilkatJsonObject
Dim Json_ponto As New ChilkatJsonObject
Dim Jarray_ponto As New ChilkatJsonArray

Dim CPF_CNPJ As String


Dim objHttp As New WinHttp.WinHttpRequest
Dim BaseURL As String



Private Sub Command_Consulta_RBX_Click()




Dim Texto As String
Dim name As String
Dim value As String
Dim assinante_label(50) As String
Dim assinante_valor(50) As String
Dim id_assinante As String
Dim nome As String
Dim CPF_CNPJ As String
Dim Total_paginas As Double


Dim id_ponto As String
Dim USERNAME As String
Dim STATUS As String
Dim PLANO As String
Dim logradouro As String
Dim numero As String
Dim bairro As String
Dim cep As String
Dim cidade As String
Dim estado As String
Dim gps As String




json.EmitCompact = 0

Text_endereco = ""

Me.MousePointer = 11

'BaseURL = "https://infoservic.rbxsoft.com/routerbox/ws/rbx_server_json.php"



'BaseURL = "https://app.mkfull.com.br/api/v2/listaclientes?token=f24865e566a4e3ea9d69b9e51ca7419f&"

BaseURL = "https://app.mkfull.com.br/api/v2/listaclientes?token=f24865e566a4e3ea9d69b9e51ca7419f&pagina=1"

objHttp.Open "GET", BaseURL, False

objHttp.SetTimeouts 2000, 2000, 2000, 2000

objHttp.Option(WinHttpRequestOption_SslErrorIgnoreFlags) = SslErrorFlag_UnknownCA + _
SslErrorFlag_CertWrongUsage + _
SslErrorFlag_CertCNInvalid + _
SslErrorFlag_CertDateInvalid

objHttp.SetRequestHeader "Content-Type", "application/hal+json"
objHttp.SetRequestHeader "Accept", "text/*, application/hal+json, application/json"



'========Texto = "{" & Chr$(34) & "listaclientes" & Chr$(34) & ": {"
'Texto = Texto & Chr$(34) & "Autenticacao" & Chr$(34) & ": {"
'========Texto = Texto & Chr$(34) & "token" & Chr$(34) & ":" & Chr$(34) & "0CZHP4P9LT8127RLVI7C2M696XRN11" & Chr$(34)
'========Texto = Texto & "},"
'========Texto = Texto & Chr$(34) & "pagina" & Chr$(34) & ":" & Chr$(34) & "1" & Chr$(34)
'========Texto = Texto & "}"
'Texto = Texto & "}"

objHttp.Send (BaseURL)





MSHFlexGrid_ASSINANTE.TextMatrix(0, 0) = "id_assinante"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 1) = "nome_assinante"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 2) = "cpf_cnpj"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 3) = "id_ponto"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 4) = "plano"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 5) = "STATUS"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 6) = "logradouro"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 7) = "numero"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 8) = "bairro"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 9) = "cep"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 10) = "cidade"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 11) = "estado"
MSHFlexGrid_ASSINANTE.TextMatrix(0, 12) = "gps"











'==================================== json tudo
Text_endereco = objHttp.ResponseText
json.Load (Text_endereco)
'====================================


Total_paginas = json.StringOf("total_de_paginas")

linha = 0


'==================================== json todas info cliente + pontos
Text_resultado = json.StringAt(2)
Json_todos.Load (Text_resultado)
'====================================
 
For P = 0 To (Total_paginas + 1)
 
 


For J = 1 To 50



id_assinante = Json_todos.StringOf(J & ".assinante.id_assinante")
nome_assinante = Json_todos.StringOf(J & ".assinante.nome")
CPF_CNPJ = Json_todos.StringOf(J & ".assinante.cpf_cnpj")

If CPF_CNPJ = "" Then GoTo proximo

num_pontos = Json_todos.StringOf(J & ".quantidade_pontos_de_acesso")

For i = 0 To num_pontos - 1

'linha = linha + 1


id_ponto = Json_todos.StringOf(J & ".pontos_de_acesso[" & i & "].id_ponto")
USERNAME = Json_todos.StringOf(J & ".pontos_de_acesso[" & i & "].username")
STATUS = Json_todos.StringOf(J & ".pontos_de_acesso[" & i & "].status")
PLANO = Json_todos.StringOf(J & ".pontos_de_acesso[" & i & "].plano")
logradouro = Json_todos.StringOf(J & ".pontos_de_acesso[" & i & "].logradouro")
numero = Json_todos.StringOf(J & ".pontos_de_acesso[" & i & "].numero")
bairro = Json_todos.StringOf(J & ".pontos_de_acesso[" & i & "].bairro")
cep = Json_todos.StringOf(J & ".pontos_de_acesso[" & i & "].cep")
cidade = Json_todos.StringOf(J & ".pontos_de_acesso[" & i & "].cidade")
estado = Json_todos.StringOf(J & ".pontos_de_acesso[" & i & "].estado")
gps = Json_todos.StringOf(J & ".pontos_de_acesso[" & i & "].gps")

If gps = "null" Then GoTo pula Else linha = linha + 1
'linha = linha + 1
MSHFlexGrid_ASSINANTE.Rows = linha + 1

MSHFlexGrid_ASSINANTE.TextMatrix(linha, 0) = id_assinante
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 1) = nome_assinante
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 2) = CPF_CNPJ
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 3) = id_ponto
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 4) = PLANO
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 5) = STATUS
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 6) = logradouro
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 7) = numero
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 8) = bairro
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 9) = cep
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 10) = cidade
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 11) = estado
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 12) = gps
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 13) = "Pagina:" & (P - 1)


POSIÇÃO = InStr(1, gps, ",")

MSHFlexGrid_ASSINANTE.TextMatrix(linha, 15) = Right$(gps, (Len(gps) - POSIÇÃO))
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 14) = Replace(Left$(gps, (POSIÇÃO)), ",", "")

pula:

Next i


'teste = Json_todos.IntOf("1.pontos_de_acesso[0][1][0]")

proximo:

Next J




BaseURL = "https://app.mkfull.com.br/api/v2/listaclientes?token=f24865e566a4e3ea9d69b9e51ca7419f&pagina=" & P



objHttp.Open "GET", BaseURL, False

objHttp.SetTimeouts 2000, 2000, 2000, 2000

objHttp.Send (BaseURL)

Text_endereco = objHttp.ResponseText
json.Load (Text_endereco)


Text_resultado = json.StringAt(2)
Json_todos.Load (Text_resultado)


Next P

fim:

Command_IMPORTA_FIBERWORKS.Enabled = True

Me.MousePointer = 0

Exit Sub


End Sub





Function teste()
'========================================================================================================================================================================
'========================================================================================================================================================================
'========================================================================================================================================================================


For J = 0 To 49

'assinante_valor(J) = Json_todos.StringAt(J)
'assinante_label(J) = Json_todos.NameAt(J)


'Json_assinante.Load (assinante_valor(J))
'Json_assinante.Load (Json_assinante.StringAt(0)) 'DADOS DO ASSINANTE


''MSHFlexGrid_ASSINANTE.TextMatrix(J, 0) = Json_assinante.StringAt(0)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 1) = Json_assinante.StringAt(1)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 2) = Json_assinante.StringAt(2)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 3) = Json_assinante.StringAt(3)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 4) = Json_assinante.StringAt(4)


'Next J


'For J = 0 To 49

'assinante_valor(J) = Json_todos.StringAt(J)
'assinante_label(J) = Json_todos.NameAt(J)


'Json_assinante.Load (assinante_valor(J))
'Json_assinante.Load (Json_assinante.StringAt(2)) 'DADOS DO PONTO


'MSHFlexGrid_ASSINANTE.TextMatrix(J, 5) = Json_assinante.StringAt(0)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 6) = Json_assinante.StringAt(1)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 7) = Json_assinante.StringAt(2)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 8) = Json_assinante.StringAt(3)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 9) = Json_assinante.StringAt(4)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 10) = Json_assinante.StringAt(5)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 11) = Json_assinante.StringAt(6)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 12) = Json_assinante.StringAt(7)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 13) = Json_assinante.StringAt(8)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 14) = Json_assinante.StringAt(9)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 15) = Json_assinante.StringAt(10)
'MSHFlexGrid_ASSINANTE.TextMatrix(J, 16) = "Pagina: " & P

Next J








'Text_resultado = json.IntOf("Nome[10]")







End Function


Private Sub Command_IMPORTA_FIBERWORKS_Click()

Me.MousePointer = 11

'texto(0) = Codigo
'texto(2) = CPF_CNPJ
'texto(3) = Nome
'texto(4) = Endereço
'texto(5) = Numero
'texto(6) = Complemento
'texto(7) = Bairro
'texto(8) = Cidade
'texto(10) = UF
'texto(11) = CEP
'texto(12) = telComercial
'texto(13) = telResidencial
'texto(14) = telCelular
'texto(31) = Inclusão 'data de inclusão
'texto(32) = usuario '
'texto(33) = Observações
'texto(34) = lat
'texto(35) = long
'texto(37) = Situação

Dim rs As Recordset

Dim CONTRATO_GPON As String
Dim sigla As String
Dim CNPJ_CPF As String
Dim endereço As String
Dim numero As String
Dim COMPLEMENTO As String
Dim bairro As String
'Dim Cidade As String
'Dim UF as string
Dim cep As String
Dim telComercial As String
'Dim telResidencial As String
'Dim telCelular As String
'Dim data_inclusão As String
'dim usuario_inclusão as string
Dim OBS As String
Dim C_lat As String
Dim C_long As String
Dim Situação As String
Dim utmx As Double
Dim utmy As Double
Dim UTMX_S As String
Dim UTMY_S As String
Dim GEOMETRIA As String
Dim linha As Integer
Dim x As Double
Dim y As Double

'On Error GoTo erro

linha = 1

For i = 1 To (MSHFlexGrid_ASSINANTE.Rows - 1)


'MSHFlexGrid_ASSINANTE.TextMatrix(linha, 0) = id_assinante
CNPJ_CPF = MSHFlexGrid_ASSINANTE.TextMatrix(linha, 2) '= cpf_cnpj
CONTRATO_GPON = MSHFlexGrid_ASSINANTE.TextMatrix(linha, 3) '= id_ponto
OBS = MSHFlexGrid_ASSINANTE.TextMatrix(linha, 4) '= PLANO
'MSHFlexGrid_ASSINANTE.TextMatrix(linha, 5) = status
endereço = MSHFlexGrid_ASSINANTE.TextMatrix(linha, 6) '= logradouro
numero = MSHFlexGrid_ASSINANTE.TextMatrix(linha, 7) '= numero
bairro = MSHFlexGrid_ASSINANTE.TextMatrix(linha, 8) '= bairro
cep = MSHFlexGrid_ASSINANTE.TextMatrix(linha, 9) '= cep
'MSHFlexGrid_ASSINANTE.TextMatrix(linha, 10) = cidade
'MSHFlexGrid_ASSINANTE.TextMatrix(linha, 11) = estado
'MSHFlexGrid_ASSINANTE.TextMatrix(linha, 12) = gps
'MSHFlexGrid_ASSINANTE.TextMatrix(linha, 13) = "Pagina:" & (P - 1)
C_lat = MSHFlexGrid_ASSINANTE.TextMatrix(linha, 15)
C_long = MSHFlexGrid_ASSINANTE.TextMatrix(linha, 14)
sigla = MSHFlexGrid_ASSINANTE.TextMatrix(linha, 1) & " GPON:" & CONTRATO_GPON '= nome_assinante
COMPLEMENTO = "_"
telefone = "_"


Set rs = frmLogin.conn.Execute("select CONTRATO_GPON from estações where M=" & PRINCIPAL.ID_CIDADE & " and CONTRATO_GPON= " & CONTRATO_GPON & ";")


If rs.EOF = False Then MSHFlexGrid_ASSINANTE.TextMatrix(linha, 16) = "Jà Existente": GoTo proximo


x = Replace(C_lat, ".", ",")
y = Replace(C_long, ".", ",")

PRINCIPAL.Map1.DegreesToProj x, y, utmx, utmy

UTMX_S = Replace(utmx, ",", ".")

UTMY_S = Replace(utmy, ",", ".")




'busca id_meta novo
    frmLogin.connMETA.Execute "INSERT INTO ids(ID_VISIO,TIPO_OBJETO,id_city)" & "VALUES(" & PRINCIPAL.sf_cli.NumShapes & ",'POP'," & PRINCIPAL.ID_CIDADE & ")"
    Set rs = frmLogin.connMETA.Execute("SELECT ID_META FROM ids ORDER BY ID_META DESC")
    idmeta = rs!id_meta


'busca usuario
    Set rsuser = frmLogin.conn.Execute("select iduser from usuario where registro= '" & frmLogin.userREGISTRO & "'")



frmLogin.conn.Execute "INSERT INTO estações (contrato_gpon,gpon,estacao,SIGLA,BAIRRO,NUMERO,COMPLEMENTO,ENDEREÇO,TELEFONE,CONTATO,M,UTMX,UTMY,OBS,POP_ESTACAO)" _
& "values ('" & CONTRATO_GPON & "','1','" & sigla & "','" & sigla & "','" & bairro & "','" & numero & "','" & COMPLEMENTO & "','" & endereço & "','" & telefone & "','" & sigla & "','" & PRINCIPAL.ID_CIDADE & "','" & UTMX_S & "','" & UTMY_S & "','" & OBS & "',0)"

Set rs_estacao = frmLogin.conn.Execute("SELECT ID_ESTACAO FROM ESTAÇÕES ORDER BY ID_ESTACAO DESC")

    idEstacao = rs_estacao!ID_ESTACAO
    
    frmLogin.conn.Execute "update estações set id_meta= '" & idmeta & "' WHERE ID_ESTACAO = '" & idEstacao & "';"


GEOMETRIA = "1;" & UTMX_S & "|" & UTMY_S & "|"

frmLogin.connMETA.Execute "INSERT INTO pop(data,projetista,id_estacao,shapename,uniqueID,id_visio,ID_META,width,height,angle,pinx,piny,locpinx,locpiny,flipx,flipy,resizemode,sigla,TAMANHO,id_city,LAYER_PON,LAYER_CONV,GEOMETRIA,GEO_PINX,GEO_PINY)" _
& "values(CURdate(),'1','" & idEstacao & "','" & idmeta & "','" & idmeta & "','" & idmeta & "','" & idmeta & "','0','0',0,'0 mm','0 mm',0,0,0,0,'FALSE','" & sigla & "',1,'" & PRINCIPAL.ID_CIDADE & "','" & PRINCIPAL.GPON & "','" & PRINCIPAL.CONVENCIONAL & "','" & GEOMETRIA & "'," & UTMX_S & "," & UTMY_S & ")"


MSHFlexGrid_ASSINANTE.TextMatrix(linha, 16) = "IMPLANTADO"

proximo:

linha = linha + 1


Next i

Command_IMPORTA_FIBERWORKS.Enabled = False
Me.MousePointer = 0

Exit Sub

ERRO:

MsgBox "Não foi possivel importar o Cliente CNPJ=" & CNPJ_CPF & "-" & Err.Description


End Sub



Private Sub Command_IMPORTA_POR_CPF_CNPJ_Click()

Dim rs_estacao As Recordset
Dim id_ponto As String
Dim USERNAME As String
Dim PLANO As String


id_ponto = Text_Cliente(2)
USERNAME = Text_Cliente(1)
STATUS = Text_Cliente(4)
PLANO = Text_Cliente(3)
logradouro = Text_Cliente(5)
numero = Text_Cliente(6)
bairro = Text_Cliente(7)
cep = Text_Cliente(8)
cidade = Text_Cliente(9)
estado = Text_Cliente(10)
cnpj = Text_Cliente(13)
sigla = USERNAME & " - GPON: " & id_ponto
COMPLEMENTO = "_"


On Error GoTo ERRO:

Set rs_estacao = frmLogin.conn.Execute("SELECT CONTRATO_GPON FROM ESTAÇÕES WHERE CONTRATO_GPON=" & id_ponto & " and M=" & PRINCIPAL.ID_CIDADE & ";")


If rs_estacao.EOF <> True Then MsgBox " Este ponto de cliente ja esta cadastrado na Base !": Exit Sub




frmLogin.conn.Execute "INSERT INTO estações (contrato_gpon,gpon,estacao,SIGLA,BAIRRO,NUMERO,COMPLEMENTO,ENDEREÇO,TELEFONE,CONTATO,M,OBS,POP_ESTACAO,CEP)" _
& "values ('" & id_ponto & "','1','" & USERNAME & "','" & sigla & "','" & bairro & "','" & numero & "','" & COMPLEMENTO & "','" & logradouro & "','" & telefone & "','" & sigla & "','" & PRINCIPAL.ID_CIDADE & "','" & PLANO & "',0,'" & cep & "')"


MsgBox "Cliente Cadastrado, pronto para plotagem !!"

    limpa_campos
    Command_plotar.Enabled = True
    GoTo fim


'=======
ERRO:
'=======

MsgBox "Não foi possível cadastrar o cliente !!" & Err.Description



'=======
fim:
'=======


End Sub

Private Sub Command_PESQISA_CPF_Click()

Dim CPF_CNPJ As String


On Error GoTo fim


CPF_CNPJ = Text_CPF_CNPJ


json.EmitCompact = 0

Text_endereco = ""

Me.MousePointer = 11

'BaseURL = "https://infoservic.rbxsoft.com/routerbox/ws/rbx_server_json.php"



'BaseURL = "https://app.mkfull.com.br/api/v2/listaclientes?token=f24865e566a4e3ea9d69b9e51ca7419f&"

'BaseURL = "https://app.mkfull.com.br/api/v2/listaclientes?token=f24865e566a4e3ea9d69b9e51ca7419f&pagina=1"

BaseURL = "https://app.mkfull.com.br/api/v2/consultacliente?token=f24865e566a4e3ea9d69b9e51ca7419f&cpf_cnpj=" & CPF_CNPJ

objHttp.Open "GET", BaseURL, False

objHttp.SetTimeouts 2000, 2000, 2000, 2000

objHttp.Option(WinHttpRequestOption_SslErrorIgnoreFlags) = SslErrorFlag_UnknownCA + _
SslErrorFlag_CertWrongUsage + _
SslErrorFlag_CertCNInvalid + _
SslErrorFlag_CertDateInvalid

objHttp.SetRequestHeader "Content-Type", "application/hal+json"
objHttp.SetRequestHeader "Accept", "text/*, application/hal+json, application/json"



'========Texto = "{" & Chr$(34) & "listaclientes" & Chr$(34) & ": {"
'Texto = Texto & Chr$(34) & "Autenticacao" & Chr$(34) & ": {"
'========Texto = Texto & Chr$(34) & "token" & Chr$(34) & ":" & Chr$(34) & "0CZHP4P9LT8127RLVI7C2M696XRN11" & Chr$(34)
'========Texto = Texto & "},"
'========Texto = Texto & Chr$(34) & "pagina" & Chr$(34) & ":" & Chr$(34) & "1" & Chr$(34)
'========Texto = Texto & "}"
'Texto = Texto & "}"

objHttp.Send (BaseURL)



MSHFlexGrid_CLIENTE.TextMatrix(0, 0) = "id_assinante"
MSHFlexGrid_CLIENTE.TextMatrix(0, 1) = "nome_assinante"
MSHFlexGrid_CLIENTE.TextMatrix(0, 2) = "cpf_cnpj"
MSHFlexGrid_CLIENTE.TextMatrix(0, 3) = "id_ponto"
MSHFlexGrid_CLIENTE.TextMatrix(0, 4) = "plano"
MSHFlexGrid_CLIENTE.TextMatrix(0, 5) = "STATUS"
MSHFlexGrid_CLIENTE.TextMatrix(0, 6) = "logradouro"
MSHFlexGrid_CLIENTE.TextMatrix(0, 7) = "numero"
MSHFlexGrid_CLIENTE.TextMatrix(0, 8) = "bairro"
MSHFlexGrid_CLIENTE.TextMatrix(0, 9) = "cep"
MSHFlexGrid_CLIENTE.TextMatrix(0, 10) = "cidade"
MSHFlexGrid_CLIENTE.TextMatrix(0, 11) = "estado"
MSHFlexGrid_CLIENTE.TextMatrix(0, 12) = "gps"

'==================================== json tudo
Text_endereco = objHttp.ResponseText
json.Load (Text_endereco)
'====================================


Total_paginas = json.StringOf("total_de_paginas")

linha = 0


'==================================== json todas info cliente + pontos
Text_resultado = json.StringAt(2)
Json_todos.Load (Text_endereco)
'====================================

'For J = 1 To 50



id_assinante = Json_todos.StringOf("assinante.id_assinante")
nome_assinante = Json_todos.StringOf("assinante.nome")
CPF_CNPJ = Json_todos.StringOf("assinante.cpf_cnpj")


num_pontos = Json_todos.StringOf("quantidade_pontos_de_acesso")

For i = 0 To num_pontos - 1

linha = linha + 1


id_ponto = Json_todos.StringOf("pontos_de_acesso[" & i & "].id_ponto")
USERNAME = Json_todos.StringOf("pontos_de_acesso[" & i & "].username")
STATUS = Json_todos.StringOf("pontos_de_acesso[" & i & "].status")
PLANO = Json_todos.StringOf("pontos_de_acesso[" & i & "].plano")
logradouro = Json_todos.StringOf("pontos_de_acesso[" & i & "].logradouro")
numero = Json_todos.StringOf("pontos_de_acesso[" & i & "].numero")
bairro = Json_todos.StringOf("pontos_de_acesso[" & i & "].bairro")
cep = Json_todos.StringOf("pontos_de_acesso[" & i & "].cep")
cidade = Json_todos.StringOf("pontos_de_acesso[" & i & "].cidade")
estado = Json_todos.StringOf("pontos_de_acesso[" & i & "].estado")
gps = Json_todos.StringOf("pontos_de_acesso[" & i & "].gps")

'If gps = "null" Then GoTo pula Else linha = linha + 1
'linha = linha + 1
MSHFlexGrid_ASSINANTE.Rows = linha + 1

MSHFlexGrid_CLIENTE.TextMatrix(linha, 0) = id_assinante
MSHFlexGrid_CLIENTE.TextMatrix(linha, 1) = nome_assinante
MSHFlexGrid_CLIENTE.TextMatrix(linha, 2) = CPF_CNPJ
MSHFlexGrid_CLIENTE.TextMatrix(linha, 3) = id_ponto
MSHFlexGrid_CLIENTE.TextMatrix(linha, 4) = PLANO
MSHFlexGrid_CLIENTE.TextMatrix(linha, 5) = STATUS
MSHFlexGrid_CLIENTE.TextMatrix(linha, 6) = logradouro
MSHFlexGrid_CLIENTE.TextMatrix(linha, 7) = numero
MSHFlexGrid_CLIENTE.TextMatrix(linha, 8) = bairro
MSHFlexGrid_CLIENTE.TextMatrix(linha, 9) = cep
MSHFlexGrid_CLIENTE.TextMatrix(linha, 10) = cidade
MSHFlexGrid_CLIENTE.TextMatrix(linha, 11) = estado
MSHFlexGrid_CLIENTE.TextMatrix(linha, 12) = gps
MSHFlexGrid_CLIENTE.TextMatrix(linha, 13) = "Pagina:" & (P - 1)


POSIÇÃO = InStr(1, gps, ",")

MSHFlexGrid_ASSINANTE.TextMatrix(linha, 15) = Right$(gps, (Len(gps) - POSIÇÃO))
MSHFlexGrid_ASSINANTE.TextMatrix(linha, 14) = Replace(Left$(gps, (Len(gps) - POSIÇÃO - 1)), ",", "")

pula:

Next i


'teste = Json_todos.IntOf("1.pontos_de_acesso[0][1][0]")



'Next J


Me.MousePointer = 0

fim:


End Sub

Private Sub Command1_Click()

End Sub

Private Sub Command_plotar_Click()


Cria_Objeto_POP.Show


End Sub

Private Sub Form_Load()


MSHFlexGrid_ASSINANTE.ColWidth(0) = 1000
MSHFlexGrid_ASSINANTE.ColWidth(1) = 2000
MSHFlexGrid_ASSINANTE.ColWidth(2) = 2000
MSHFlexGrid_ASSINANTE.ColWidth(12) = 2000

MSHFlexGrid_CLIENTE.ColWidth(0) = 1200
MSHFlexGrid_CLIENTE.ColWidth(1) = 2000
MSHFlexGrid_CLIENTE.ColWidth(2) = 2000
MSHFlexGrid_CLIENTE.ColWidth(3) = 1200
MSHFlexGrid_CLIENTE.ColWidth(4) = 2000
MSHFlexGrid_CLIENTE.ColWidth(5) = 1200

End Sub

Private Sub MSHFlexGrid_CLIENTE_Click()




Text_Cliente(0) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 0)

If Text_Cliente(0) = "" Then limpa_campos: Exit Sub

Command_IMPORTA_POR_CPF_CNPJ.Enabled = True

Text_Cliente(1) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 1) 'ID_ASSINANTE
Text_Cliente(2) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 3) 'NOME
Text_Cliente(3) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 4)
Text_Cliente(4) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 5)
Text_Cliente(5) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 6)
Text_Cliente(6) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 7)
Text_Cliente(7) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 8)
Text_Cliente(8) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 9)
Text_Cliente(9) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 10)
Text_Cliente(10) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 11)
'Text_Cliente(11) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 12)
'Text_Cliente(12) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 13)
Text_Cliente(13) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 2)
Text_Cliente(12) = MSHFlexGrid_CLIENTE.TextMatrix(MSHFlexGrid_CLIENTE.RowSel, 12)

End Sub

Private Sub Text_CPF_CNPJ_Change()



CPF_CNPJ = Text_CPF_CNPJ.Text



End Sub

Private Function limpa_campos()

For i = 0 To 10
Text_Cliente(i) = ""
Next i

Text_Cliente(13) = ""

Command_IMPORTA_POR_CPF_CNPJ.Enabled = False

End Function
