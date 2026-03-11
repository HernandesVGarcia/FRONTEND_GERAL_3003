'====================================
Private Sub MENU_DIVIDE_CABO_LATLONG_Click()
'====================================


Dim SHP As MapWinGIS.Shape
Dim shp_novo As MapWinGIS.Shape
Dim LAYER_VERTICE As String
Dim string_cabo_novo As String
Dim string_cabo_original As String
Dim string_cabo_original_inicio As String
'Dim ID_meta_cabo_novo As Long
Dim ID_meta_cabo_original As Long
Dim ID_meta_cabo_novo As Long
Dim num_cabo_novo As Long
Dim VARIAVEL As Double
Dim xcoordenada As Double
Dim ycoordenada As Double
Dim zcoordenada As String
Dim id_visio_A As String
Dim id_visio_B As String
Dim id_visio_M As String
Dim METRAGEM As Double
Dim LAYER_PON As Integer
Dim LAYER_CONV As Integer
Dim LABEL_Cabo_Novo As String
Dim pontox1 As Double
Dim pontox2 As Double
Dim pontoy1 As Double
Dim pontoy2 As Double
Dim IDshp As Double
Dim variavel_cabo As String

Dim string_BeginX_PB_original As String
Dim string_BeginY_PB_original As String
Dim string_EndX_PB_original As String
Dim string_EndY_PB_original As String

Dim string_GEO_PINX_B_original As String
Dim string_GEO_PINY_B_original As String


Dim i As Double


'On Error GoTo ERRO


'Me.MousePointer = 11  ' Ampulheta




    LAYER_VERTICE = Map1.LayerName(Before_LayerHandler)


    If LAYER_VERTICE = "G__cabo 1F" Then Set SHP = sf1.Shape(Shape_Before_Index)
    If LAYER_VERTICE = "G__cabo 2F" Then Set SHP = sf2.Shape(Shape_Before_Index)
    If LAYER_VERTICE = "G__cabo 4F" Then Set SHP = sf4.Shape(Shape_Before_Index)
    If LAYER_VERTICE = "G__cabo 6F" Then Set SHP = sf6.Shape(Shape_Before_Index)
    If LAYER_VERTICE = "G__cabo 8F" Then Set SHP = sf8.Shape(Shape_Before_Index)
    If LAYER_VERTICE = "G__cabo 12F" Then Set SHP = sf12.Shape(Shape_Before_Index)
    If LAYER_VERTICE = "G__cabo 18F" Then Set SHP = sf18.Shape(Shape_Before_Index)
    If LAYER_VERTICE = "G__cabo 24F" Then Set SHP = sf24.Shape(Shape_Before_Index)
    If LAYER_VERTICE = "G__cabo 36F" Then Set SHP = sf36.Shape(Shape_Before_Index)
    If LAYER_VERTICE = "G__cabo 48F" Then Set SHP = sf48.Shape(Shape_Before_Index)
    If LAYER_VERTICE = "G__cabo 72F" Then Set SHP = sf72.Shape(Shape_Before_Index)
    If LAYER_VERTICE = "G__cabo 144F" Then Set SHP = sf144.Shape(Shape_Before_Index)

    

    'If NumeroVertice < 3 Or (shp.numPoints - NumeroVertice) < 3 Then GoTo ERRO

    'shp.DeletePoint (NumeroVertice)
    
    'If shp.numPoints <= 5 Then GoTo ERRO


    If LAYER_VERTICE = "G__cabo 1F" Then ID_meta_cabo_original = sf1.CellValue(1, Shape_Before_Index): CAPACITY = 1
    If LAYER_VERTICE = "G__cabo 2F" Then ID_meta_cabo_original = sf2.CellValue(1, Shape_Before_Index): CAPACITY = 2
    If LAYER_VERTICE = "G__cabo 4F" Then ID_meta_cabo_original = sf4.CellValue(1, Shape_Before_Index): CAPACITY = 4
    If LAYER_VERTICE = "G__cabo 6F" Then ID_meta_cabo_original = sf6.CellValue(1, Shape_Before_Index): CAPACITY = 6
    If LAYER_VERTICE = "G__cabo 8F" Then ID_meta_cabo_original = sf8.CellValue(1, Shape_Before_Index): CAPACITY = 8
    If LAYER_VERTICE = "G__cabo 12F" Then ID_meta_cabo_original = sf12.CellValue(1, Shape_Before_Index): CAPACITY = 12
    If LAYER_VERTICE = "G__cabo 18F" Then ID_meta_cabo_original = sf18.CellValue(1, Shape_Before_Index): CAPACITY = 18
    If LAYER_VERTICE = "G__cabo 24F" Then ID_meta_cabo_original = sf24.CellValue(1, Shape_Before_Index): CAPACITY = 24
    If LAYER_VERTICE = "G__cabo 36F" Then ID_meta_cabo_original = sf36.CellValue(1, Shape_Before_Index): CAPACITY = 36
    If LAYER_VERTICE = "G__cabo 48F" Then ID_meta_cabo_original = sf48.CellValue(1, Shape_Before_Index): CAPACITY = 48
    If LAYER_VERTICE = "G__cabo 72F" Then ID_meta_cabo_original = sf72.CellValue(1, Shape_Before_Index): CAPACITY = 72
    If LAYER_VERTICE = "G__cabo 144F" Then ID_meta_cabo_original = sf144.CellValue(1, Shape_Before_Index): CAPACITY = 144
    
    
    
  Set rs = frmLogin.connMETA.Execute("select BeginX,BeginY,EndX,EndY from cabopb where id_meta=" & ID_meta_cabo_original & ";")
    
    
    string_BeginX_PB_original = rs!beginx
    string_BeginY_PB_original = rs!beginY
    string_EndX_PB_original = rs!endx
    string_EndY_PB_original = rs!endy
    
    
 Set rs = frmLogin.connMETA.Execute("select GEO_PINX_B_LATLONG,GEO_PINY_B_LATLONG from cabopa where id_meta=" & ID_meta_cabo_original & ";") '2023 MODIFICADO LATLONG
    
    
    string_GEO_PINX_B_original = rs!GEO_PINX_B_LatLong
    string_GEO_PINX_B_original = Replace(string_GEO_PINX_B_original, ",", ".")
    string_GEO_PINY_B_original = rs!GEO_PINY_B_LatLong
    string_GEO_PINY_B_original = Replace(string_GEO_PINY_B_original, ",", ".")

'----------------------------------------------------
'-----------------
Remodelagem_grafica:
'-----------------
'----------------------------------------------------

string_cabo_original_inicio = Mid(SHP.SerializeToString, 1, 5)



'------------------
cabo_original:
'------------------
    For i = 0 To NumeroVertice

        xcoordenada = SHP.Point(i).x
        ycoordenada = SHP.Point(i).y
        zcoordenada = "0.000000|0.000000"
        

        string_cabo_original = string_cabo_original & xcoordenada & "|" & ycoordenada & "|" & zcoordenada & "|"

    Next i


string_cabo_original = string_cabo_original_inicio & string_cabo_original


'------------------
CABO_NOVO:
'------------------




     For i = NumeroVertice To (SHP.numPoints - 1)
     
     
       
        xcoordenada = SHP.Point(i).x
        ycoordenada = SHP.Point(i).y

        string_cabo_novo = string_cabo_novo & xcoordenada & "|" & ycoordenada & "|" & zcoordenada & "|"

    Next i



'------------------
apaga_cabo_velho:
'------------------


        For i = (SHP.numPoints - 1) To (NumeroVertice + 1) Step -1                     '(shp.numPoints - 1) To NumeroVertice Step -1
     
     
            'If i > NumeroVertice Then shp.DeletePoint (shp.numPoints - 1)
        SHP.DeletePoint (i)

        Next i
        
        
        SHP.Point(SHP.numPoints - 1).x = SHP.Point(SHP.numPoints - 1).x - 0.00001
        SHP.Point(SHP.numPoints - 1).y = SHP.Point(SHP.numPoints - 1).y - 0.00001
        

        Do While SHP.numPoints < 3

            SHP.AddPoint SHP.Point(SHP.numPoints - 1).x, SHP.Point(SHP.numPoints - 1).y

        Loop
        
        
        


Principal.Map1.Redraw



'GoTo fim

'-----------------------------
salva_geometria_cabo_original:
'-----------------------------






    string_cabo_novo = string_cabo_original_inicio & string_cabo_novo
    string_cabo_original = Replace(string_cabo_original, ",", ".")
    string_cabo_novo = Replace(string_cabo_novo, ",", ".")


    
     frmLogin.connMETA.Execute ("update cabopa set GEOMETRIA_LAT_LONG= '" & string_cabo_original & "' where id_meta= " & ID_meta_cabo_original & ";")



'-----------------------------
cria_geometria_cabo_novo:
'-----------------------------



     



     frmLogin.connMETA.Execute "INSERT INTO ids(ID_VISIO,TIPO_OBJETO,id_city)" & "VALUES(" & ID_meta_cabo_original & ",'cabo'," & Principal.ID_CIDADE & ")"

     Set rs = frmLogin.connMETA.Execute("SELECT ID_META FROM ids ORDER BY ID_META DESC")

     ID_meta_cabo_novo = rs!id_meta
     'caboOBJ_name = "cabo" & idmeta
     
     
     
     Set shp_novo = New MapWinGIS.Shape

     shp_novo.CreateFromString (string_cabo_novo)
          
     VARIAVEL = ID_meta_cabo_novo
     
     '2023 latlong shp_novo.Point(0).X = shp_novo.Point(0).X + 0.5
     '2023 latlong shp_novo.Point(0).Y = shp_novo.Point(0).Y + 0.5
     
     shp_novo.Point(0).x = shp_novo.Point(0).x + 0.00001
     shp_novo.Point(0).y = shp_novo.Point(0).y + 0.00001
     
     
     Do While shp_novo.numPoints < 3

       shp_novo.AddPoint shp_novo.Point(0).x, shp_novo.Point(0).y

     Loop
     
     
     Principal.Map1.Redraw
     
     
     If LAYER_VERTICE = "G__cabo 1F" Then sf1.EditInsertShape shp_novo, sf1.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf1.EditCellValue 1, sf1.NumShapes - 1, VARIAVEL
     If LAYER_VERTICE = "G__cabo 2F" Then sf2.EditInsertShape shp_novo, sf2.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf2.EditCellValue 1, sf2.NumShapes - 1, VARIAVEL
     If LAYER_VERTICE = "G__cabo 4F" Then sf4.EditInsertShape shp_novo, sf4.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf4.EditCellValue 1, sf4.NumShapes - 1, VARIAVEL
     If LAYER_VERTICE = "G__cabo 6F" Then sf6.EditInsertShape shp_novo, sf6.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf6.EditCellValue 1, sf6.NumShapes - 1, VARIAVEL
     If LAYER_VERTICE = "G__cabo 8F" Then sf8.EditInsertShape shp_novo, sf8.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf8.EditCellValue 1, sf8.NumShapes - 1, VARIAVEL
     If LAYER_VERTICE = "G__cabo 12F" Then sf12.EditInsertShape shp_novo, sf12.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf12.EditCellValue 1, sf12.NumShapes - 1, VARIAVEL
     If LAYER_VERTICE = "G__cabo 18F" Then sf18.EditInsertShape shp_novo, sf18.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf18.EditCellValue 1, sf18.NumShapes - 1, VARIAVEL
     If LAYER_VERTICE = "G__cabo 24F" Then sf24.EditInsertShape shp_novo, sf24.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf24.EditCellValue 1, sf24.NumShapes - 1, VARIAVEL
     If LAYER_VERTICE = "G__cabo 36F" Then sf36.EditInsertShape shp_novo, sf36.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf36.EditCellValue 1, sf36.NumShapes - 1, VARIAVEL
     If LAYER_VERTICE = "G__cabo 48F" Then sf48.EditInsertShape shp_novo, sf48.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf48.EditCellValue 1, sf48.NumShapes - 1, VARIAVEL
     If LAYER_VERTICE = "G__cabo 72F" Then sf72.EditInsertShape shp_novo, sf72.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf72.EditCellValue 1, sf72.NumShapes - 1, VARIAVEL
     If LAYER_VERTICE = "G__cabo 144F" Then sf144.EditInsertShape shp_novo, sf144.NumShapes: shp_novo.Key = ID_meta_cabo_novo: sf144.EditCellValue 1, sf144.NumShapes - 1, VARIAVEL
    
    
        
    
    
    
'GoTo fim
    

    If CAPACITY = 1 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t1 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY = 2 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t1 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY = 4 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t1 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY >= 6 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t1 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY > 12 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t2 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    'If CAPACITY > 18 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t3 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY > 24 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t3 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY > 36 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t4 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY > 48 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t5 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY > 60 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t6 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY > 72 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t7 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY > 84 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t8 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY > 96 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t9 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY > 108 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t10 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY > 120 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t11 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"
    If CAPACITY > 132 Then frmLogin.connMETA.Execute "INSERT INTO caboa_t12 (IDMETA) VALUES ('" & ID_meta_cabo_novo & "')"


'LIMPA_PONTA_B_ORIGINAL ID_meta_cabo_original, ID_meta_cabo_novo

    If CAPACITY = 1 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 0, "t1"
    If CAPACITY = 2 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 0, "t1"
    If CAPACITY = 4 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 0, "t1"
    If CAPACITY >= 6 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 0, "t1"
    If CAPACITY > 12 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 12, "t2"
    If CAPACITY > 24 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 24, "t3"
    If CAPACITY > 36 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 36, "t4"
    If CAPACITY > 48 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 48, "t5"
    If CAPACITY > 60 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 60, "t6"
    If CAPACITY > 72 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 72, "t7"
    If CAPACITY > 84 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 84, "t8"
    If CAPACITY > 96 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 96, "t9"
    If CAPACITY > 108 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 108, "t10"
    If CAPACITY > 120 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 120, "t11"
    If CAPACITY > 132 Then COPIA_REGISTRO_PONTAbvelha_PONTABnova ID_meta_cabo_original, ID_meta_cabo_novo, 132, "t12"
    
  
  
LIMPA_PONTA_B_ORIGINAL ID_meta_cabo_original, ID_meta_cabo_novo
  
  
 

    id_visio_A = "cabo" & ID_meta_cabo_novo & "A"
    id_visio_B = "cabo" & ID_meta_cabo_novo & "B"
    id_visio_M = "cabo" & ID_meta_cabo_novo & "M"
    
    
    Set rs = frmLogin.connMETA.Execute("select tstmeta.cabom.codigo,tubo,Label_cabo from cabom,cabopa where tstmeta.cabom.id_meta= " & ID_meta_cabo_original & " and tstmeta.cabom.id_meta=tstmeta.cabopa.id_meta ;")
    
    
    
'-----------------
cria_label_cabos_novos:
'-----------------
    
    
    
    METRAGEM = 10
    LAYER_PON = 1
    LAYER_CONV = 0
    LABEL_Cabo_Novo = rs!Label_CABO
    
    
    pontox1 = shp_novo.Point(1).x
    pontoy1 = shp_novo.Point(1).y
    pontox2 = shp_novo.Point(shp_novo.numPoints - 2).x
    pontoy2 = shp_novo.Point(shp_novo.numPoints - 2).y
    
    
CAPACIDADE_1:

    If CAPACITY <> 1 Then GoTo CAPACIDADE_2
    IDshp = Principal.sf1.NumShapes - 1
    Principal.sf1.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
    Principal.sf1.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf1.Labels.FontColor = tkMapColor.Orange: Principal.sf1.Labels.Alignment = laTopRight
    variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf1.EditCellValue 2, IDshp, variavel_cabo
    
    
CAPACIDADE_2:

    If CAPACITY <> 2 Then GoTo CAPACIDADE_4
    IDshp = Principal.sf2.NumShapes - 1
    Principal.sf2.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
    Principal.sf2.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf2.Labels.FontColor = tkMapColor.Orange: Principal.sf2.Labels.Alignment = laTopRight
    variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf2.EditCellValue 2, IDshp, variavel_cabo
        
   
CAPACIDADE_4:

    If CAPACITY <> 4 Then GoTo CAPACIDADE_6
    IDshp = Principal.sf4.NumShapes - 1
    Principal.sf4.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
    Principal.sf4.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf4.Labels.FontColor = tkMapColor.Orange: Principal.sf4.Labels.Alignment = laTopRight
    variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf4.EditCellValue 2, IDshp, variavel_cabo
     
    
CAPACIDADE_6:

    If CAPACITY <> 6 Then GoTo CAPACIDADE_8
    IDshp = Principal.sf6.NumShapes - 1
    Principal.sf6.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
    Principal.sf6.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf6.Labels.FontColor = tkMapColor.Orange: Principal.sf6.Labels.Alignment = laTopRight
    variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf6.EditCellValue 2, IDshp, variavel_cabo
       
       
       
   
CAPACIDADE_8:

    If CAPACITY <> 8 Then GoTo CAPACIDADE_12
    IDshp = Principal.sf8.NumShapes - 1
    Principal.sf8.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
    Principal.sf8.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf8.Labels.FontColor = tkMapColor.Orange: Principal.sf8.Labels.Alignment = laTopRight
    variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf8.EditCellValue 2, IDshp, variavel_cabo
   
    
CAPACIDADE_12:

    If CAPACITY <> 12 Then GoTo CAPACIDADE_18
    IDshp = Principal.sf12.NumShapes - 1
    Principal.sf12.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
    Principal.sf12.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf12.Labels.FontColor = tkMapColor.Orange: Principal.sf12.Labels.Alignment = laTopRight
    variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf12.EditCellValue 2, IDshp, variavel_cabo
    
CAPACIDADE_18:

        If CAPACITY <> 18 Then GoTo CAPACIDADE_24
        IDshp = Principal.sf18.NumShapes - 1
        Principal.sf18.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
        Principal.sf18.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf18.Labels.FontColor = tkMapColor.Orange: Principal.sf18.Labels.Alignment = laTopRight
        variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf18.EditCellValue 2, IDshp, variavel_cabo
    
 
CAPACIDADE_24:

    If CAPACITY <> 24 Then GoTo CAPACIDADE_36
    IDshp = Principal.sf24.NumShapes - 1
    Principal.sf24.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
    Principal.sf24.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf24.Labels.FontColor = tkMapColor.Orange: Principal.sf24.Labels.Alignment = laTopRight
    variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf24.EditCellValue 2, IDshp, variavel_cabo
     
    
CAPACIDADE_36:

    If CAPACITY <> 36 Then GoTo CAPACIDADE_48
    IDshp = Principal.sf36.NumShapes - 1
    Principal.sf36.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
    Principal.sf36.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf36.Labels.FontColor = tkMapColor.Orange: Principal.sf36.Labels.Alignment = laTopRight
    variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf36.EditCellValue 2, IDshp, variavel_cabo
    
CAPACIDADE_48:

    If CAPACITY <> 48 Then GoTo CAPACIDADE_72
    IDshp = Principal.sf48.NumShapes - 1
    Principal.sf48.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
    Principal.sf48.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf48.Labels.FontColor = tkMapColor.Orange: Principal.sf48.Labels.Alignment = laTopRight
    variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf48.EditCellValue 2, IDshp, variavel_cabo
        
    
CAPACIDADE_72:

    If CAPACITY <> 72 Then GoTo CAPACIDADE_144
    IDshp = Principal.sf72.NumShapes - 1
    Principal.sf72.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
    Principal.sf72.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf72.Labels.FontColor = tkMapColor.Orange: Principal.sf72.Labels.Alignment = laTopRight
    variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf72.EditCellValue 2, IDshp, variavel_cabo
       
    
CAPACIDADE_144:

    If CAPACITY <> 144 Then GoTo salva_cabo_novo
    IDshp = Principal.sf144.NumShapes - 1
    Principal.sf144.Labels.InsertLabel IDshp, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_A" & ")", pontox1, pontoy1, 0, 1
    Principal.sf144.Labels.InsertPart IDshp, 1, LABEL_Cabo_Novo & " " & CAPACITY & "F" & " (" & ID_meta_cabo_novo & "_B" & ")", pontox2, pontoy2, 0, 1: Principal.sf144.Labels.FontColor = tkMapColor.Orange: Principal.sf144.Labels.Alignment = laTopRight
    variavel_cabo = CAPACITY & "F " & LABEL_Cabo_Novo: Principal.sf144.EditCellValue 2, IDshp, variavel_cabo
     
    
'---------------
salva_cabo_novo:
'---------------
    

    frmLogin.connMETA.Execute "INSERT INTO cabopa(Label_cabo,GEOMETRIA_LAT_LONG,length,id_visio,codigo,id_city,CAPACIDADE,ID_META,LAYER_PON,LAYER_CONV,VIRTUAL2,GEO_PINX_B_LATLONG,GEO_PINY_B_LATLONG,BeginX,BeginY,EndX,EndY)" _
    & "VALUES('" & LABEL_Cabo_Novo & "','" & string_cabo_novo & "','" & METRAGEM & "','" & id_visio_A & "','" & rs!codigo & "','" & Principal.ID_CIDADE & "','" & CAPACITY & "','" & ID_meta_cabo_novo & "','" & LAYER_PON & "','" & LAYER_CONV & "',0," & string_GEO_PINX_B_original & "," & string_GEO_PINY_B_original & ",'','','','')"

    frmLogin.connMETA.Execute "INSERT INTO cabopb(Label_cabo,id_visio,codigo,id_city,CAPACIDADE,ID_META,LAYER_PON,LAYER_CONV,VIRTUAL2,BeginX,BeginY,EndX,EndY)" _
    & "VALUES('" & LABEL_Cabo_Novo & "','" & id_visio_B & "','" & rs!codigo & "','" & Principal.ID_CIDADE & "','" & CAPACITY & "','" & ID_meta_cabo_novo & "','" & LAYER_PON & "','" & LAYER_CONV & "',0,'" & string_BeginX_PB_original & "','" & string_BeginY_PB_original & "','" & string_EndX_PB_original & "','" & string_EndY_PB_original & "')"

    frmLogin.connMETA.Execute "INSERT INTO cabom(id_visio,tubo,codigo,id_city,CAPACIDADE,ID_META,LAYER_PON,LAYER_CONV,VIRTUAL2)" _
    & "VALUES('" & id_visio_M & "','" & rs!tubo & "','" & rs!codigo & "','" & Principal.ID_CIDADE & "','" & CAPACITY & "','" & ID_meta_cabo_novo & "','" & LAYER_PON & "','" & LAYER_CONV & "',0)"

    Principal.CAPACIDADE = CAPACITY ' usado no referencia pontas
    REFERENCIA_PONTAS_latlong VARIAVEL  ' dentro do modulo cria cabo ERA REFERENCIA_PONTAS MUDADO PARA rEFERENCIA_pontas_LATLONG EM 04092023


    


Exit Sub


'-------
ERRO:
'-------

    MsgBox " Numero de vertices dos cabos resultantes tem de ser superior a 3, crie mais vertices no cabo e tente novamente " & Err.Description


'------
FIM:
'------


'Me.MousePointer = 0






End Sub

'=========================================================================================================================================================
Private Function COPIA_REGISTRO_PONTAbvelha_PONTABnova(idmeta_velho As Long, idmeta_novo As Long, GRUPO As Integer, tubo As String)
'=========================================================================================================================================================


Dim F1 As Integer
Dim F2 As Integer
Dim F3 As Integer
Dim F4 As Integer
Dim F5 As Integer
Dim F6 As Integer
Dim F7 As Integer
Dim F8 As Integer
Dim F9 As Integer
Dim F10 As Integer
Dim F11 As Integer
Dim F12 As Integer


F1 = 1 + GRUPO
F2 = 2 + GRUPO
F3 = 3 + GRUPO
F4 = 4 + GRUPO
F5 = 5 + GRUPO
F6 = 6 + GRUPO
F7 = 7 + GRUPO
F8 = 8 + GRUPO
F9 = 9 + GRUPO
F10 = 10 + GRUPO
F11 = 11 + GRUPO
F12 = 12 + GRUPO

'-------COPIA PONTA B ORIGINAL PARA PONTA B DO NOVO TRECHO-----------------------------------------------------------------------
frmLogin.connMETA.Execute ("INSERT INTO tstmeta.cabob_" & tubo & " (FIBRA_" & F1 & "LABEL,FIBRA_" & F2 & "LABEL,FIBRA_" & F3 & "LABEL,FIBRA_" & F4 & "LABEL,FIBRA_" & F5 & "LABEL,FIBRA_" & F6 & "LABEL," _
& "FIBRA_" & F7 & "LABEL,FIBRA_" & F8 & "LABEL,FIBRA_" & F9 & "LABEL,FIBRA_" & F10 & "LABEL,FIBRA_" & F11 & "LABEL,FIBRA_" & F12 & "LABEL,FN_" & F1 & "LABEL,FN_" & F2 & "LABEL,FN_" & F3 & "LABEL,FN_" & F4 & "LABEL,FN_" & F5 & "LABEL,FN_" & F6 & "LABEL," _
& "FN_" & F7 & "LABEL,FN_" & F8 & "LABEL,FN_" & F9 & "LABEL,FN_" & F10 & "LABEL,FN_" & F11 & "LABEL,FN_" & F12 & "LABEL,IDMETA)" _
& "SELECT FIBRA_" & F1 & "LABEL,FIBRA_" & F2 & "LABEL,FIBRA_" & F3 & "LABEL,FIBRA_" & F4 & "LABEL,FIBRA_" & F5 & "LABEL,FIBRA_" & F6 & "LABEL," _
& "FIBRA_" & F7 & "LABEL,FIBRA_" & F8 & "LABEL,FIBRA_" & F9 & "LABEL,FIBRA_" & F10 & "LABEL,FIBRA_" & F11 & "LABEL,FIBRA_" & F12 & "LABEL,FN_" & F1 & "LABEL,FN_" & F2 & "LABEL,FN_" & F3 & "LABEL,FN_" & F4 & "LABEL,FN_" & F5 & "LABEL,FN_" & F6 & "LABEL," _
& "FN_" & F7 & "LABEL,FN_" & F8 & "LABEL,FN_" & F9 & "LABEL,FN_" & F10 & "LABEL,FN_" & F11 & "LABEL,FN_" & F12 & "LABEL,'" & idmeta_novo & "' AS IDMETA  FROM tstmeta.cabob_" & tubo & " WHERE IDMETA =" & idmeta_velho & ";")


'------- APAGA CONTEUDO DA PONTA B DO CABO ORIGINAL ------------------------------------------------------------------------------
frmLogin.connMETA.Execute ("UPDATE tstmeta.cabob_" & tubo & " SET FIBRA_" & F1 & "LABEL='',FIBRA_" & F2 & "LABEL='',FIBRA_" & F3 & "LABEL='',FIBRA_" & F4 & "LABEL='',FIBRA_" & F5 & "LABEL='',FIBRA_" & F6 & "LABEL=''," _
& "FIBRA_" & F7 & "LABEL='',FIBRA_" & F8 & "LABEL='',FIBRA_" & F9 & "LABEL='',FIBRA_" & F10 & "LABEL='',FIBRA_" & F11 & "LABEL='',FIBRA_" & F12 & "LABEL='',FN_" & F1 & "LABEL='',FN_" & F2 & "LABEL='',FN_" & F3 & "LABEL='',FN_" & F4 & "LABEL='',FN_" & F5 & "LABEL='',FN_" & F6 & "LABEL=''," _
& "FN_" & F7 & "LABEL='',FN_" & F8 & "LABEL='',FN_" & F9 & "LABEL='',FN_" & F10 & "LABEL='',FN_" & F11 & "LABEL='',FN_" & F12 & "LABEL='' WHERE IDMETA=" & idmeta_velho & ";")



End Function

Private Function LIMPA_PONTA_B_ORIGINAL(idmeta_velho As Long, idmeta_novo As Long)

'********  seta GEOPIN cabo novo em cabopa
'********  seta Begin e End cabo pb novo



Dim RSG As Recordset
Dim TAMANHO_ID As Integer
Dim FIM_ID As Integer
Dim INICIO_ID As Integer
Dim BOCA As String
Dim ID_Caixa As String
Dim id_DIO As String
Dim ID_CABO As String
Dim CABO_ORIG As String
Dim CABO_NOVO As String
Dim CABO_SOBRA As String
Dim C1 As String
Dim C2 As String
Dim C3 As String
Dim C4 As String
Dim C5 As String
Dim C6 As String
Dim CAB_ponta As String
Dim id_meta_sobra As String
Dim id_meta_condominio As String
Dim rs_cabo_sobra As Recordset


'-------REFERENCIA GEOGRAFICAMENTE A PONTA B DO NOVO CABO NA CAIXA------------------------------------------------------------------------------------

    
    
    Set RSG = frmLogin.connMETA.Execute("SELECT FIBRA_1LABEL FROM cabob_t1 where IDMETA=" & idmeta_novo & ";")

    If RSG!FIBRA_1LABEL = " " Then Exit Function

    If InStr(1, RSG!FIBRA_1LABEL, "PROP.BOCA") <> 0 Then GoTo EXTRAI_CAIXA  ' Then Exit Function

    If InStr(1, RSG!FIBRA_1LABEL, "DIO") <> 0 Then GoTo EXTRAI_DIO 'Else Exit Function
    
    If InStr(1, RSG!FIBRA_1LABEL, "cabo") <> 0 Then GoTo EXTRAI_CABO Else Exit Function

'-------------------
EXTRAI_CAIXA:
'-------------------

    FIM_ID = InStr(1, RSG!FIBRA_1LABEL, "_")
    INICIO_ID = InStr(1, RSG!FIBRA_1LABEL, "!PROP"): INICIO_ID = INICIO_ID + 6
    TAMANHO_ID = FIM_ID - INICIO_ID
    BOCA = Mid$(RSG!FIBRA_1LABEL, INICIO_ID, TAMANHO_ID)
    'BOCA = LCase(BOCA)
    
    
    INICIO_ID = 5
    FIM_ID = InStr(1, RSG!FIBRA_1LABEL, "!")
    TAMANHO_ID = FIM_ID - INICIO_ID
    ID_Caixa = Mid$(RSG!FIBRA_1LABEL, INICIO_ID, TAMANHO_ID)
    
    
'-------------------
SUBSTITUI_CABO_BOCA:
'-------------------
    
    
frmLogin.connMETA.Execute ("UPDATE caixa set " & BOCA & "= 'cabo" & idmeta_novo & "B' where ID_META=" & ID_Caixa & ";")
    
'-------------------------------------------------------------------
SUBSTITUI_ID_CABO: 'SUBSTITUI ID CABO NA TABELA DE CONEXAO DA CAIXA
'-------------------------------------------------------------------
    
    If CAPACITY = 1 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 0, "t1"
    If CAPACITY = 2 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 0, "t1"
    If CAPACITY = 4 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 0, "t1"
    If CAPACITY >= 6 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 0, "t1"
    If CAPACITY > 12 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 12, "t2"
    If CAPACITY > 24 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 24, "t3"
    If CAPACITY > 36 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 36, "t4"
    If CAPACITY > 48 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 48, "t5"
    If CAPACITY > 60 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 60, "t6"
    If CAPACITY > 72 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 72, "t7"
    If CAPACITY > 84 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 84, "t8"
    If CAPACITY > 96 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 96, "t9"
    If CAPACITY > 108 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 108, "t10"
    If CAPACITY > 120 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 120, "t11"
    If CAPACITY > 132 Then Replace_IDCABO_naBOCA BOCA, ID_Caixa, idmeta_velho, idmeta_novo, 132, "t12"
    
Exit Function
    
'-------------------
EXTRAI_DIO:
'-------------------

    FIM_ID = InStr(1, RSG!FIBRA_1LABEL, "!")
    INICIO_ID = InStr(1, RSG!FIBRA_1LABEL, "DIO"): INICIO_ID = INICIO_ID + 3
    TAMANHO_ID = FIM_ID - INICIO_ID
    id_DIO = Mid$(RSG!FIBRA_1LABEL, INICIO_ID, TAMANHO_ID) '=DIO402916!PROP.ROW_5.LABEL



    CABO_ORIG = "cabo" & idmeta_velho & "B"
    CABO_NOVO = "cabo" & idmeta_novo & "B"


    C1 = "C1=replace(C1,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
    C2 = "C2=replace(C2,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
    C3 = "C3=replace(C3,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
    C4 = "C4=replace(C4,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
    C5 = "C5=replace(C5,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
    C6 = "C6=replace(C6,'" & CABO_ORIG & "','" & CABO_NOVO & "')"


    frmLogin.connMETA.Execute ("UPDATE DIO SET " & C1 & "," & C2 & "," & C3 & "," & C4 & "," & C5 & "," & C6 & " WHERE ID_META=" & id_DIO & ";")



Exit Function

'-------------------
EXTRAI_CABO:  ' Para cabos a serem dividios antes de sobra
'-------------------


    FIM_ID = InStr(1, RSG!FIBRA_1LABEL, "!")
    FIM_ID = FIM_ID - 1
    INICIO_ID = 6
    TAMANHO_ID = FIM_ID - INICIO_ID
    ID_CABO = Mid$(RSG!FIBRA_1LABEL, INICIO_ID, TAMANHO_ID) '=cabo129154B!PROP.FIBRA_1

    If InStr(1, RSG!FIBRA_1LABEL, "B!") <> 0 Then CAB_ponta = "B"

    If InStr(1, RSG!FIBRA_1LABEL, "A!") <> 0 Then CAB_ponta = "A"

    CABO_ORIG = "cabo" & idmeta_velho & "B"
    CABO_NOVO = "cabo" & idmeta_novo & "B"
    CABO_SOBRA = "cabo" & ID_CABO & CAB_ponta


    '-------------------------------------------------------------------
SUBSTITUI_ID_CABO_destino: 'SUBSTITUI ID CABO NA TABELA DE cabo apos a sobra
'-------------------------------------------------------------------
    
    If CAPACITY = 1 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 0, "t1"
    If CAPACITY = 2 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 0, "t1"
    If CAPACITY = 4 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 0, "t1"
    If CAPACITY >= 6 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 0, "t1"
    If CAPACITY > 12 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 12, "t2"
    If CAPACITY > 24 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 24, "t3"
    If CAPACITY > 36 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 36, "t4"
    If CAPACITY > 48 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 48, "t5"
    If CAPACITY > 60 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 60, "t6"
    If CAPACITY > 72 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 72, "t7"
    If CAPACITY > 84 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 84, "t8"
    If CAPACITY > 96 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 956, "t9"
    If CAPACITY > 108 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 108, "t10"
    If CAPACITY > 120 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 120, "t11"
    If CAPACITY > 132 Then Replace_IDCABO_noCABO CAB_ponta, ID_CABO, idmeta_velho, idmeta_novo, 132, "t12"


    '---------------
    'sobra:
    '---------------
    Set rs_cabo_sobra = frmLogin.connMETA.Execute("select id_meta from segmento where Caboxe ='" & CABO_SOBRA & "' or Caboxd='" & CABO_SOBRA & "' and id_city=" & Principal.ID_CIDADE & ";")
    
    If rs_cabo_sobra.EOF Then GoTo CONDOMINIO
    
    id_meta_sobra = rs_cabo_sobra!id_meta
    
    
    
    
    frmLogin.connMETA.Execute ("UPDATE segmento SET Caboxe= REPLACE(Caboxe,'" & CABO_ORIG & "','" & CABO_NOVO & "') where id_meta=" & id_meta_sobra & ";")
    
    frmLogin.connMETA.Execute ("UPDATE segmento SET Caboxd= REPLACE(Caboxd,'" & CABO_ORIG & "','" & CABO_NOVO & "') where id_meta=" & id_meta_sobra & ";")
    
    Exit Function
    
    '---------------
CONDOMINIO:
    '---------------
    
    Set rs_cabo_sobra = frmLogin.connMETA.Execute("select id_meta from condominio where ENTRADAX1 ='" & CABO_SOBRA & "' or ENTRADAX2='" & CABO_SOBRA & "' or '" _
    & "' or ENTRADAX3='" & CABO_SOBRA & "' or ENTRADAX4='" & CABO_SOBRA & "' or ENTRADAX5='" & CABO_SOBRA & "' or ENTRADAX6='" & CABO_SOBRA & "' or ENTRADAX7='" & CABO_SOBRA & "' or ENTRADAX8='" & CABO_SOBRA & "' and id_city=" & Principal.ID_CIDADE & ";")
    
    
    If rs_cabo_sobra.EOF Then Exit Function
    
    
    id_meta_condominio = rs_cabo_sobra!id_meta
    
    
    
    frmLogin.connMETA.Execute ("UPDATE condominio SET CABOX1= REPLACE(CABOX1,'" & CABO_ORIG & "','" & CABO_NOVO & "') where id_meta=" & id_meta_condominio & ";")
    
    frmLogin.connMETA.Execute ("UPDATE condominio SET CABOX2= REPLACE(CABOX2,'" & CABO_ORIG & "','" & CABO_NOVO & "') where id_meta=" & id_meta_condominio & ";")
    
    frmLogin.connMETA.Execute ("UPDATE condominio SET CABOX3= REPLACE(CABOX3,'" & CABO_ORIG & "','" & CABO_NOVO & "') where id_meta=" & id_meta_condominio & ";")
    
    frmLogin.connMETA.Execute ("UPDATE condominio SET CABOX4= REPLACE(CABOX4,'" & CABO_ORIG & "','" & CABO_NOVO & "') where id_meta=" & id_meta_condominio & ";")
    
    frmLogin.connMETA.Execute ("UPDATE condominio SET CABOX5= REPLACE(CABOX5,'" & CABO_ORIG & "','" & CABO_NOVO & "') where id_meta=" & id_meta_condominio & ";")
    
    frmLogin.connMETA.Execute ("UPDATE condominio SET CABOX6= REPLACE(CABOX6,'" & CABO_ORIG & "','" & CABO_NOVO & "') where id_meta=" & id_meta_condominio & ";")
    
    frmLogin.connMETA.Execute ("UPDATE condominio SET CABOX7= REPLACE(CABOX7,'" & CABO_ORIG & "','" & CABO_NOVO & "') where id_meta=" & id_meta_condominio & ";")
    
    frmLogin.connMETA.Execute ("UPDATE condominio SET CABOX8= REPLACE(CABOX8,'" & CABO_ORIG & "','" & CABO_NOVO & "') where id_meta=" & id_meta_condominio & ";")
    
    
    
    
    
    
    
    


End Function


'=========================================================================================================================================================
Private Function Replace_IDCABO_naBOCA(BOCA As String, idmeta_caixa As String, idmeta_velho As Long, idmeta_novo As Long, GRUPO As Integer, tubo As String)


'=========================================================================================================================================================


Dim F1 As Integer
Dim F2 As Integer
Dim F3 As Integer
Dim F4 As Integer
Dim F5 As Integer
Dim F6 As Integer
Dim F7 As Integer
Dim F8 As Integer
Dim F9 As Integer
Dim F10 As Integer
Dim F11 As Integer
Dim F12 As Integer

Dim f1L As String
Dim f2L As String
Dim f3L As String
Dim f4L As String
Dim f5L As String
Dim f6L As String
Dim f7L As String
Dim f8L As String
Dim f9L As String
Dim f10L As String
Dim f11L As String
Dim f12L As String

Dim fN1L As String
Dim fN2L As String
Dim fN3L As String
Dim fN4L As String
Dim fN5L As String
Dim fN6L As String
Dim fN7L As String
Dim fN8L As String
Dim fN9L As String
Dim fN10L As String
Dim fN11L As String
Dim fN12L As String

Dim CABO_ORIG As String
Dim CABO_NOVO As String

F1 = 1 + GRUPO
F2 = 2 + GRUPO
F3 = 3 + GRUPO
F4 = 4 + GRUPO
F5 = 5 + GRUPO
F6 = 6 + GRUPO
F7 = 7 + GRUPO
F8 = 8 + GRUPO
F9 = 9 + GRUPO
F10 = 10 + GRUPO
F11 = 11 + GRUPO
F12 = 12 + GRUPO

CABO_ORIG = "cabo" & idmeta_velho & "B"
CABO_NOVO = "cabo" & idmeta_novo & "B"


f1L = "F" & F1 & "L=replace(F" & F1 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f2L = "F" & F2 & "L=replace(F" & F2 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f3L = "F" & F3 & "L=replace(F" & F3 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f4L = "F" & F4 & "L=replace(F" & F4 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f5L = "F" & F5 & "L=replace(F" & F5 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f6L = "F" & F6 & "L=replace(F" & F6 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f7L = "F" & F7 & "L=replace(F" & F7 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f8L = "F" & F8 & "L=replace(F" & F8 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f9L = "F" & F9 & "L=replace(F" & F9 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f10L = "F" & F10 & "L=replace(F" & F10 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f11L = "F" & F11 & "L=replace(F" & F11 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f12L = "F" & F12 & "L=replace(F" & F12 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"

fN1L = "FN" & F1 & "L=replace(FN" & F1 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN2L = "FN" & F2 & "L=replace(FN" & F2 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN3L = "FN" & F3 & "L=replace(FN" & F3 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN4L = "FN" & F4 & "L=replace(FN" & F4 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN5L = "FN" & F5 & "L=replace(FN" & F5 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN6L = "FN" & F6 & "L=replace(FN" & F6 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN7L = "FN" & F7 & "L=replace(FN" & F7 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN8L = "FN" & F8 & "L=replace(FN" & F8 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN9L = "FN" & F9 & "L=replace(FN" & F9 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN10L = "FN" & F10 & "L=replace(FN" & F10 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN11L = "FN" & F11 & "L=replace(FN" & F11 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN12L = "FN" & F12 & "L=replace(FN" & F12 & "L,'" & CABO_ORIG & "','" & CABO_NOVO & "')"



frmLogin.connMETA.Execute ("update tstmeta.cx" & LCase(BOCA) & "_" & tubo & " SET " & f1L & "," & f2L & "," & f3L & "," & f4L & "," & f5L & "," & f6L & "," & f7L & "," & f8L & "," & f9L & "," & f10L & "," & f11L & "," & f12L & "" _
& "," & fN1L & "," & fN2L & "," & fN3L & "," & fN4L & "," & fN5L & "," & fN6L & "," & fN7L & "," & fN8L & "," & fN9L & "," & fN10L & "," & fN11L & "," & fN12L & " WHERE IDMETA=" & idmeta_caixa & ";")



End Function


'=========================================================================================================================================================
Private Function Replace_IDCABO_noCABO(cabo_ponta As String, idmeta_cabo As String, idmeta_velho As Long, idmeta_novo As Long, GRUPO As Integer, tubo As String)
'usado na sobra para atualizar o cabo destino depois da sobra

'=========================================================================================================================================================


Dim F1 As Integer
Dim F2 As Integer
Dim F3 As Integer
Dim F4 As Integer
Dim F5 As Integer
Dim F6 As Integer
Dim F7 As Integer
Dim F8 As Integer
Dim F9 As Integer
Dim F10 As Integer
Dim F11 As Integer
Dim F12 As Integer

Dim f1L As String
Dim f2L As String
Dim f3L As String
Dim f4L As String
Dim f5L As String
Dim f6L As String
Dim f7L As String
Dim f8L As String
Dim f9L As String
Dim f10L As String
Dim f11L As String
Dim f12L As String

Dim fN1L As String
Dim fN2L As String
Dim fN3L As String
Dim fN4L As String
Dim fN5L As String
Dim fN6L As String
Dim fN7L As String
Dim fN8L As String
Dim fN9L As String
Dim fN10L As String
Dim fN11L As String
Dim fN12L As String

Dim CABO_ORIG As String
Dim CABO_NOVO As String
Dim CABO_SOBRA As String



Dim TABELA As String


F1 = 1 + GRUPO
F2 = 2 + GRUPO
F3 = 3 + GRUPO
F4 = 4 + GRUPO
F5 = 5 + GRUPO
F6 = 6 + GRUPO
F7 = 7 + GRUPO
F8 = 8 + GRUPO
F9 = 9 + GRUPO
F10 = 10 + GRUPO
F11 = 11 + GRUPO
F12 = 12 + GRUPO

CABO_ORIG = "cabo" & idmeta_velho & "B"
CABO_NOVO = "cabo" & idmeta_novo & "B"


If cabo_ponta = "A" Then TABELA = "caboa_" & tubo
If cabo_ponta = "B" Then TABELA = "cabob_" & tubo

f1L = "FIBRA_" & F1 & "LABEL=replace(FIBRA_" & F1 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f2L = "FIBRA_" & F2 & "LABEL=replace(FIBRA_" & F2 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f3L = "FIBRA_" & F3 & "LABEL=replace(FIBRA_" & F3 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f4L = "FIBRA_" & F4 & "LABEL=replace(FIBRA_" & F4 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f5L = "FIBRA_" & F5 & "LABEL=replace(FIBRA_" & F5 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f6L = "FIBRA_" & F6 & "LABEL=replace(FIBRA_" & F6 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f7L = "FIBRA_" & F7 & "LABEL=replace(FIBRA_" & F7 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f8L = "FIBRA_" & F8 & "LABEL=replace(FIBRA_" & F8 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f9L = "FIBRA_" & F9 & "LABEL=replace(FIBRA_" & F9 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f10L = "FIBRA_" & F10 & "LABEL=replace(FIBRA_" & F10 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f11L = "FIBRA_" & F11 & "LABEL=replace(FIBRA_" & F11 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
f12L = "FIBRA_" & F12 & "LABEL=replace(FIBRA_" & F12 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"

fN1L = "FN_" & F1 & "LABEL=replace(FN_" & F1 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN2L = "FN_" & F2 & "LABEL=replace(FN_" & F2 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN3L = "FN_" & F3 & "LABEL=replace(FN_" & F3 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN4L = "FN_" & F4 & "LABEL=replace(FN_" & F4 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN5L = "FN_" & F5 & "LABEL=replace(FN_" & F5 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN6L = "FN_" & F6 & "LABEL=replace(FN_" & F6 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN7L = "FN_" & F7 & "LABEL=replace(FN_" & F7 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN8L = "FN_" & F8 & "LABEL=replace(FN_" & F8 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN9L = "FN_" & F9 & "LABEL=replace(FN_" & F9 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN10L = "FN_" & F10 & "LABEL=replace(FN_" & F10 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN11L = "FN_" & F11 & "LABEL=replace(FN_" & F11 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"
fN12L = "FN_" & F12 & "LABEL=replace(FN_" & F12 & "LABEL,'" & CABO_ORIG & "','" & CABO_NOVO & "')"



frmLogin.connMETA.Execute ("update tstmeta." & TABELA & " SET " & f1L & "," & f2L & "," & f3L & "," & f4L & "," & f5L & "," & f6L & "," & f7L & "," & f8L & "," & f9L & "," & f10L & "," & f11L & "," & f12L & "" _
& "," & fN1L & "," & fN2L & "," & fN3L & "," & fN4L & "," & fN5L & "," & fN6L & "," & fN7L & "," & fN8L & "," & fN9L & "," & fN10L & "," & fN11L & "," & fN12L & " WHERE IDMETA=" & idmeta_cabo & ";")



End Function
