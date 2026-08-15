---
name: vivabox-sheet-prestador
description: Convertir la información brute d'un prestataire/experiencia Vivabox en una fila lista para pegar en el Google Sheet de "Experiencias". Usar cuando el usuario da datos de un proveedor/aliado y quiere generar la fila (codigo_interno, campos obligatorios, etc.) para el sheet que alimenta src/services/sheet.ts.
---

# Llenar fila del sheet "Experiencias" a partir de datos de un prestador

## Contexto

El sitio Vivabox lee sus experiencias de un Google Sheet publicado como CSV
(`src/services/sheet.ts` → `SHEET_URL`). Solo las filas con `estado = "publicado"`
llegan al sitio. No existe un archivo xlsx fijo de referencia — este skill trabaja
directo con la estructura de columnas descrita abajo y, cuando hace falta calcular
`codigo_interno`, consulta el CSV publicado en vivo.

**Nunca se edita el Google Sheet directamente.** Este skill solo produce una fila
lista para copiar/pegar; el usuario la pega él mismo en Google Sheets.

## Diccionario de campos (orden real de columnas)

| # | Campo | Obligatorio | Valores válidos / formato | Notas |
|---|---|---|---|---|
| 1 | codigo_interno | **Sí** | `CAT-CIUDAD-000` (ej: GAS-BOG-001) | Ver "Cálculo de codigo_interno" abajo |
| 2 | nombre_experiencia | **Sí** | Texto libre | Nombre público genérico — nunca el nombre del proveedor |
| 3 | categoria | **Sí** | gastro · bienestar · aventura · cultura · estancias | |
| 4 | tipo_actividad | No | slug técnico (golf, bbq, brunch...) | No se muestra al comprador |
| 5 | ciudad | **Sí** | `Bogotá` si es en Bogotá; si no, el nombre real del municipio (ej: Choachí, Suesca, La Calera, Tocancipá, Pacho) | Visible para el comprador/beneficiario — nunca usar las abreviaturas internas "Cundi Norte/Sur/Oriente/Occidente" aquí (esas quedan solo en el prefijo de `codigo_interno`) |
| 6 | zona | No | Si `ciudad` = Bogotá: nombre real del barrio (ej: Chapinero, Usaquén, La Candelaria). Si `ciudad` es un municipio fuera de Bogotá: el departamento (ej: Cundinamarca) | Visible para el comprador/beneficiario — nunca inventar un barrio ni escribir "no sé" en la celda |
| 7 | ubicacion_lat | No | Número decimal | Uso futuro (mapa) |
| 8 | ubicacion_lng | No | Número decimal | Uso futuro (mapa) |
| 9 | distancia | No | Cercana · Lejana | |
| 10 | proveedor_nombre | **Sí** | Texto libre | Uso interno — NUNCA se muestra al comprador |
| 11 | proveedor_contacto | No | Texto libre | |
| 12 | proveedor_telefono | No | Texto libre | |
| 13 | proveedor_email | No | Texto libre | |
| 14 | proveedor_instagram | No | Texto libre | |
| 15 | duracion_min | No | Columna formateada como Duración en Sheets (`Formato > Número > Duración`), escrita `h:mm` (ej: `2:00`, `0:45`, `24:00`) | `formatDuration()` en `src/data/categories.ts` parsea `h:mm`/`h:mm:ss` y también acepta un número plano de minutos (compatibilidad hacia atrás) |
| 16 | formato | No | solo · duo | |
| 17 | descripcion_corta | **Sí** | Texto libre | Una sensación, no una ficha de servicios |
| 18 | nota_vivabox | **Sí** | Texto libre | Por qué la elegimos — razón editorial |
| 19 | incluye | No | Texto libre | |
| 20 | requisitos | No | Texto libre | Ej: edad mínima, acompañamiento |
| 21 | ideal_para | No | Texto libre | Ej: Parejas, Amigos, En familia |
| 22 | nivel_esfuerzo | No | bajo · medio · alto | |
| 23 | nota_clima | No | Texto libre | |
| 24 | nota_vestimenta | No | Texto libre | |
| 25 | info_importante | No | Texto libre | |
| 26 | ambiente_animo | No | relax · adrenalina · social · romántico · cultural | Genera la 1ª etiqueta de la tarjeta |
| 27 | entorno | No | indoor · outdoor | Genera la 2ª etiqueta de la tarjeta |
| 28 | ritmo | No | relajado · activo · sacudido | Genera la 3ª etiqueta de la tarjeta |
| 29 | tipo_duracion | No | media · larga | |
| 30 | imagen | **Sí** | `/images/experiencias-reales/<codigo_interno>.jpg` (foto real) o URL de images.pexels.com / images.unsplash.com (placeholder) | Cualquier otra fuente cae a la imagen genérica de la caja |
| 31 | imagenes_adicionales | No | Mismo formato que "imagen", separadas por `\|` | Alimenta la galería swipeable del modal |
| 32 | requiere_telefono | No | TRUE / FALSE | |
| 33 | requiere_num_personas | No | TRUE / FALSE | |
| 34 | permite_extra | No | TRUE / FALSE | |
| 35 | max_personas_extra | No | Número | |
| 36 | extra_requiere_aprobacion | No | TRUE / FALSE | |
| 37 | nota_extra | No | Texto libre | |
| 38 | tipo_calma | No | ambiental · corporal · interior | Taxonomía no conectada aún al sitio |
| 39 | tipo_participacion | No | tecnico · manual · sensorial · mental | Taxonomía no conectada aún al sitio |
| 40 | tipo_sacudida | No | sensorial · emocional | Taxonomía no conectada aún al sitio |
| 41 | resolucion | No | inmediato · entorno · duradero · cuerpo · crear · comprender | Taxonomía no conectada aún al sitio |
| 42 | precio_publico_referencia | No | Número (COP) | |
| 43 | tarifa_neta_vivabox | No | Número (COP) | |
| 44 | canal_reserva | No | Texto libre | |
| 45 | anticipacion_minima | No | Texto libre | |
| 46 | tiempo_respuesta_maximo | No | Texto libre | |
| 47 | horario_disponible | No | Texto libre | |
| 48 | politica_cancelacion | No | Texto libre | |
| 49 | politica_no_show | No | Texto libre | |
| 50 | metodo_redencion | No | Texto libre | |
| 51 | momento_redencion | No | Texto libre | |
| 52 | extras_permitidos | No | Texto libre | Nunca deben condicionar la experiencia base |
| 53 | documento_anexo_url | No | URL (Drive u otro) | |
| 54 | fecha_firma | No | AAAA-MM-DD | |
| 55 | estado | **Sí** | borrador · en validación · contrato firmado · listo para publicar · publicado · pausado · vencido | Default `borrador`. Solo "publicado" se muestra en el sitio |

## Cálculo de codigo_interno

Formato: `CAT-CIUDAD-000`

- CAT: gastro=GAS, bienestar=BIE, aventura=AVE, cultura=CUL, estancias=EST
- CIUDAD: Bogotá=BOG, Cundi Norte=CNO, Cundi Sur=CSU, Cundi Oriente=COR, Cundi Occidente=COC
- 000: siguiente número secuencial de 3 dígitos para esa combinación CAT-CIUDAD

Para calcularlo, hacer `WebFetch` al CSV publicado (`SHEET_URL` en `src/services/sheet.ts`),
buscar todos los `codigo_interno` que empiecen con el prefijo `CAT-CIUDAD-`, tomar el número
más alto encontrado y sumar 1 (con padding a 3 dígitos, ej `007`). Si no se puede alcanzar el
sheet (fetch falla), pedir al usuario el próximo código disponible en vez de inventarlo.

## Flujo de trabajo

1. El usuario pega información libre sobre un prestador/experiencia (puede ser desordenada:
   nombre del negocio, contacto, qué ofrece, precio, ciudad, etc.).
2. Mapear esa información a las columnas de la tabla de arriba. No inventar valores para
   campos que no fueron mencionados — dejarlos vacíos salvo que sean obligatorios.
3. Determinar `categoria` y `ciudad` (obligatorios) para poder calcular `codigo_interno`
   vía WebFetch como se describe arriba.
4. Revisar la lista de campos **obligatorios** (marcados "Sí" en la tabla). Para cada uno que
   siga faltando después del mapeo, hacer UNA pregunta agrupada al usuario (usar
   AskUserQuestion si las opciones son limitadas y conocidas, por ejemplo categoria/ciudad/
   formato; texto libre para el resto). No preguntar por campos opcionales — dejarlos vacíos.
5. Aplicar `estado = borrador` por defecto si no se especifica otro.
6. Para `imagen`, si el usuario no tiene foto todavía, proponer un placeholder de
   images.pexels.com o images.unsplash.com coherente con la categoría, y avisar que se puede
   reemplazar luego por `/images/experiencias-reales/<codigo_interno>.jpg` cuando haya foto real.
7. Producir la fila final en un bloque de texto separado por tabulaciones (TSV), en el
   **orden exacto** de las 55 columnas de la tabla — listo para pegar directamente en una
   fila del Google Sheet. Incluir también un resumen legible campo por campo debajo, para
   que el usuario pueda revisar antes de pegar.
8. Recordar al usuario que debe pegar la fila él mismo en el Google Sheet real — este skill
   nunca escribe directamente en Google Sheets.
