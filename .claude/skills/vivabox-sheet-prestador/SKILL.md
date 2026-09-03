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
| 15 | proveedor_direccion | No | Texto libre (dirección exacta: calle y número) | Uso interno para logística/redención — NUNCA se muestra al comprador |
| 16 | duracion_min | No | Columna formateada como Duración en Sheets (`Formato > Número > Duración`), escrita `h:mm` (ej: `2:00`, `0:45`, `24:00`) | `formatDuration()` en `src/data/categories.ts` parsea `h:mm`/`h:mm:ss` y también acepta un número plano de minutos (compatibilidad hacia atrás) |
| 17 | formato | No | solo · duo | Alimenta el número de personas mostrado en la ficha/popup (`formatPeopleCount()` en `src/data/categories.ts`: solo → "1 persona", duo → "2 personas") |
| 18 | descripcion_corta | **Sí** | Texto libre, ~30-45 palabras | Una sensación, no una ficha de servicios. Reglas completas (longitud, estructura, clichés a evitar) en `docs/editorial/experiencias.md` |
| 19 | nota_vivabox | **Sí** | Texto libre, ~20-35 palabras | Por qué la elegimos — razón editorial, nunca inventar una visita de primera mano. Reglas completas en `docs/editorial/experiencias.md` |
| 20 | incluye | No | Texto libre | |
| 21 | requisitos | No | Texto libre | Ej: edad mínima, acompañamiento |
| 22 | ideal_para | No | Texto libre | Ej: Parejas, Amigos, En familia |
| 23 | nivel_esfuerzo | No | bajo · medio · alto | |
| 24 | nota_clima | No | Texto libre | |
| 25 | nota_vestimenta | No | Texto libre | |
| 26 | info_importante | No | Texto libre | |
| 27 | ambiente_animo | No | relax · adrenalina · social · romántico · cultural | Genera la 1ª etiqueta de la tarjeta |
| 28 | entorno | No | indoor · outdoor | Genera la 2ª etiqueta de la tarjeta |
| 29 | ritmo | No | relajado · activo · sacudido | Genera la 3ª etiqueta de la tarjeta |
| 30 | tipo_duracion | No | media · larga | |
| 31 | imagen | **Sí** | `/images/experiencias-reales/<slug-descriptivo>/<slug-descriptivo>-1.webp` (foto real) o URL de images.pexels.com / images.unsplash.com (placeholder) | Cualquier otra fuente cae a la imagen genérica de la caja. Ver "Convención de nombres para fotos reales" abajo — el slug describe lo que se ve, NO el `codigo_interno` |
| 32 | imagenes_adicionales | No | Mismo formato que "imagen" (`...-2.webp`, `...-3.webp`...), separadas por `\|` | Alimenta la galería swipeable del modal |
| 33 | requiere_telefono | No | TRUE / FALSE | |
| 34 | requiere_num_personas | No | TRUE / FALSE | |
| 35 | permite_extra | No | TRUE / FALSE | |
| 36 | max_personas_extra | No | Número | |
| 37 | extra_requiere_aprobacion | No | TRUE / FALSE | |
| 38 | nota_extra | No | Texto libre | |
| 39 | tipo_calma | No | ambiental · corporal · interior | Taxonomía no conectada aún al sitio |
| 40 | tipo_participacion | No | tecnico · manual · sensorial · mental | Taxonomía no conectada aún al sitio |
| 41 | tipo_sacudida | No | sensorial · emocional | Taxonomía no conectada aún al sitio |
| 42 | resolucion | No | inmediato · entorno · duradero · cuerpo · crear · comprender | Taxonomía no conectada aún al sitio |
| 43 | precio_publico_referencia | No | Número (COP) | |
| 44 | tarifa_neta_vivabox | No | Número (COP) | |
| 45 | canal_reserva | No | Texto libre | |
| 46 | anticipacion_minima | No | Texto libre | |
| 47 | tiempo_respuesta_maximo | No | Texto libre | |
| 48 | horario_disponible | No | Texto libre | |
| 49 | politica_cancelacion | No | Texto libre | |
| 50 | politica_no_show | No | Texto libre | |
| 51 | metodo_redencion | No | Texto libre | |
| 52 | momento_redencion | No | Texto libre | |
| 53 | extras_permitidos | No | Texto libre | Nunca deben condicionar la experiencia base |
| 54 | documento_anexo_url | No | URL (Drive u otro) | |
| 55 | fecha_firma | No | AAAA-MM-DD | |
| 56 | estado | **Sí** | borrador · en validación · contrato firmado · listo para publicar · publicado · pausado · vencido | Default `borrador`. Solo "publicado" se muestra en el sitio |
| 57 | claves_eleccion | No | Hasta 3 elementos separados por `\|`, en el orden en que deben mostrarse (ej: `nivel_basico\|guia_incluido\|equipo_incluido`, o texto libre corto como `2 bebidas`) | Antes se llamaba `badges_visibles`. NO es un resumen de características — solo las 2-3 informaciones que realmente pueden influir en la decisión del beneficiario para ESA experiencia puntual. Nunca rellenar por defecto con interior/exterior/esfuerzo bajo/ambiente relajado/categoría/duración/ciudad — eso ya se muestra en otro lado de la ficha. Reglas completas de curaduría (qué incluir, qué no, ejemplos por categoría) en `docs/editorial/experiencias.md`. Cada elemento puede ser una key existente en `BADGE_REGISTRY` (`src/data/badges.ts`, le da un ícono específico) o texto libre corto en español natural sin snake_case (se muestra tal cual con un ícono genérico) para un detalle puntual que no amerita una entrada permanente en el registro. Sistema totalmente separado de `ambiente_animo`/`entorno`/`ritmo` (cols 27-29), que siguen existiendo solo como metadata interna de filtros para la web app beneficiaria. Preferible dejarla vacía o con 1-2 elementos que rellenar hasta 3 sin que aporten nada |

## Cálculo de codigo_interno

Formato: `CAT-CIUDAD-000`

- CAT: gastro=GAS, bienestar=BIE, aventura=AVE, cultura=CUL, estancias=EST
- CIUDAD: Bogotá=BOG, Cundi Norte=CNO, Cundi Sur=CSU, Cundi Oriente=COR, Cundi Occidente=COC
- 000: siguiente número secuencial de 3 dígitos para esa combinación CAT-CIUDAD

Para calcularlo, hacer `WebFetch` al CSV publicado (`SHEET_URL` en `src/services/sheet.ts`),
buscar todos los `codigo_interno` que empiecen con el prefijo `CAT-CIUDAD-`, tomar el número
más alto encontrado y sumar 1 (con padding a 3 dígitos, ej `007`). Si no se puede alcanzar el
sheet (fetch falla), pedir al usuario el próximo código disponible en vez de inventarlo.

## Convención de nombres para fotos reales (columnas imagen/imagenes_adicionales)

El `codigo_interno` es un identificador interno — no describe la experiencia, así que ya
no se usa como nombre de archivo (esto se migró en agosto 2026; las fotos viejas vivían en
`/images/experiencias-reales/<codigo_interno>/<n>.webp`, poco legible para SEO/accesibilidad).

Cuando el prestador entregue fotos reales, el slug de carpeta/archivo debe describir lo que
la foto **realmente muestra** (nunca solo el nombre comercial ni el `codigo_interno`):

- Formato: `<qué-se-ve>-<ciudad-o-zona>-vivabox`, todo en minúsculas, sin tildes, con guiones.
- Ejemplos ya en uso: `motocross-tocancipa-vivabox`, `cena-carnes-bogota-vivabox`,
  `taller-cata-cacao-bogota-vivabox`, `domo-glamping-suesca-vivabox`.
- La carpeta y cada archivo comparten el slug: `<slug>/<slug>-1.webp`, `<slug>/<slug>-2.webp`...
- Si no hay foto real todavía, usar el placeholder (paso 6 abajo) — nunca inventar un slug
  para una foto que no existe.
- Nunca copiar el slug de otro código a ciegas: si dos experiencias comparten fotos (caso
  real: `AVE-COR-004` no tiene fotos propias y usa las de `AVE-COR-003`), esa decisión debe
  quedar explícita — avisar al usuario en el resumen, no dejarlo implícito.

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
   reemplazar luego por una foto real siguiendo la convención de slug descriptivo de arriba
   (`/images/experiencias-reales/<slug-descriptivo>/<slug-descriptivo>-1.webp`) una vez que
   haya foto real y se sepa qué muestra exactamente.
7. Producir la fila final en un bloque de texto separado por tabulaciones (TSV), en el
   **orden exacto** de las 57 columnas de la tabla — listo para pegar directamente en una
   fila del Google Sheet. Incluir también un resumen legible campo por campo debajo, para
   que el usuario pueda revisar antes de pegar.
8. Recordar al usuario que debe pegar la fila él mismo en el Google Sheet real — este skill
   nunca escribe directamente en Google Sheets.
