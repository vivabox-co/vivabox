# Vivabox — Línea Editorial de Experiencias

> Fuente de verdad para el contenido de cada ficha de experiencia: `descripcion_corta`, `nota_vivabox` y `claves_eleccion`.
> Tono y lenguaje general de la marca → ver `../02_brand-voice.md`.
> Esta doc NO cubre título, categoría, ubicación, duración ni estructura visual — eso se mantiene tal cual está. El registro de íconos de `claves_eleccion` (`BADGE_REGISTRY`) tampoco se cubre aquí — vive en `src/data/badges.ts`.

## 1. Propósito

Vivabox no es un marketplace de actividades. La persona que recibe la caja elige **una** experiencia dentro de un catálogo curado. El contenido de cada ficha debe transmitir que alguien buscó, conoció, evaluó y decidió incluir esa experiencia — no que fue subida a una plataforma.

Vivabox no selecciona experiencias para llenar un catálogo. Las selecciona porque cree que vale la pena regalarlas.

## 2. Arquitectura: dos secciones, dos funciones

| Sección | Campo (sheet → código) | Función |
|---|---|---|
| Descripción | `descripcion_corta` → `shortDescription` | Cuenta la experiencia |
| La elegimos | `nota_vivabox` → `vivanote` | Cuenta nuestro criterio |
| Claves de elección | `claves_eleccion` → `visibleBadges` | Ayuda a decidir |

Regla fundamental: **nunca deben leerse como dos versiones del mismo texto.** Si al leerlas seguidas dicen básicamente lo mismo con otras palabras, hay que reescribir una de las dos.

## 3. Sección 1 — Descripción

**Función:** que alguien que nunca oyó hablar de la actividad entienda rápido qué va a vivir. Responde: *¿qué hago + cómo se vive + qué tipo de experiencia puedo esperar?*

**Longitud:** ~30–45 palabras, ~3 líneas visuales (excepcionalmente 4).

**Estructura guía** (no es plantilla literal): `ACCIÓN → EXPERIENCIA → RESULTADO`

> Ejemplo conceptual: *"Aprende a preparar sushi desde cero, siguiendo paso a paso el proceso de armado, corte y presentación. Una experiencia práctica para compartir, aprender algo nuevo y terminar disfrutando lo que preparaste con tus propias manos."*

**Reglas:**
- Verbos concretos, lenguaje que permite imaginar la escena.
- No repetir lo que ya dicen título, ubicación, duración o claves de elección.
- No mencionar el nombre del prestador.
- No convertirla en una reseña.

## 4. Sección 2 — "La elegimos"

Antes: "Elegida por Vivabox". Ahora: **"La elegimos"**.

**Función:** no vuelve a vender la actividad. Explica *por qué* Vivabox decidió que esta experiencia merece estar en el catálogo. El lector debe sentir: *"esto no está aquí porque alguien lo subió a una plataforma — Vivabox lo buscó, lo conoció, lo evaluó."* Comunicado de forma natural, nunca corporativa.

**Estructura guía:** `OBSERVACIÓN CONCRETA → CRITERIO VIVABOX → DECISIÓN`

> Ejemplo: *"Fuimos a conocer la actividad y nos gustó que no parte de la idea de que ya sabes escalar. El guía explica, acompaña y deja que cada persona encuentre su propio desafío. Esa combinación de naturaleza, aprendizaje y reto nos pareció muy Vivabox."*

### Cuatro ángulos posibles (orientativos, no plantillas — usar para variar el tono entre fichas)

| Ángulo | Cuándo usarlo | Ejemplo de arranque |
|---|---|---|
| A. Fuimos y descubrimos algo | Experiencia realmente probada | "Fuimos a probarla y lo que más nos convenció fue..." |
| B. Nos llamó la atención algo concreto | Una característica particular destaca | "Nos llamó la atención que..." |
| C. La incluimos por el equilibrio | El valor está en la combinación de elementos | "La incluimos porque combina..." |
| D. Estábamos buscando algo que faltaba | Cubre un hueco del catálogo | "Queríamos encontrar algo así fuera de Bogotá. Cuando conocimos esta propuesta..." |

## 5. Sección 3 — "Claves de elección"

**Campo:** `claves_eleccion` (sheet) → `visibleBadges` (código). Antes se llamaba `badges_visibles`.

**Función:** no es un resumen de las características de la experiencia. Contiene únicamente las 2-3 informaciones más útiles para que el beneficiario pueda decidir si quiere elegir esta experiencia sobre las demás del catálogo. Una característica puede ser verdadera y aun así no pertenecer aquí.

La pregunta a hacerse por cada candidato es siempre:

> ¿Esta información puede influir realmente en la decisión del beneficiario?

Si la respuesta es no, no se incluye.

**Nunca añadir por defecto** (aunque sean ciertas para la experiencia):
- Interior / Exterior
- Esfuerzo bajo
- Ambiente relajado
- Categoría
- Duración
- Ciudad

Estas informaciones solo entran si tienen una importancia real para decidir en *esa* experiencia puntual — no como relleno automático.

**Priorizar:**
- una condición importante
- un nivel de dificultad
- algo que tranquiliza o elimina una duda
- algo diferencial
- algo que el beneficiario querría saber antes de elegir
- algo que hace la experiencia especialmente adecuada para cierto tipo de persona

**Ejemplos:**

| Experiencia | Claves de elección |
|---|---|
| Escalada | Nivel básico \| Guía incluido \| Equipo incluido |
| Flotación | En silencio \| Sin pantallas \| Traje de baño |
| Motocross | +18 años \| Licencia vigente \| Equipo incluido |
| Restaurante | Cocina colombiana \| 2 bebidas |

**Cantidad:** no hay obligación de llenar 3. Puede tener 3, 2, 1 elemento, o quedar vacía si ninguna información amerita destacarse. Es preferible tener 2 claves realmente útiles que 3 genéricas de relleno.

**Formato:** elementos separados por ` | ` en el sheet. Cada elemento debe ser corto, claro, comprensible sin conocer el sistema interno, en español natural, sin lenguaje técnico y sin snake_case.

**No inventar:** cada elemento debe estar respaldado por información confirmada de la experiencia, nunca una suposición.

Técnicamente, cada elemento puede ser una key existente en `BADGE_REGISTRY` (`src/data/badges.ts`, le da un ícono específico y reutilizable) o texto libre corto como el del ejemplo de restaurante (se muestra tal cual, con un ícono genérico) para un detalle puntual que no amerita una entrada permanente en el registro.

## 6. Tono (para "La elegimos" especialmente)

Debe sentirse: humana, profesional, observadora, cercana, segura, con criterio, cálida, sobria.
No debe sentirse: corporativa, publicitaria, artificial, exagerada, turística, escrita por IA.

## 7. Regla contra el "copy IA": especificidad > adjetivos

No intentar que los textos parezcan "bonitos". Intentar que parezcan **observados**.

| Preferir (hecho/escena concreta) | Evitar (adjetivo vacío) |
|---|---|
| "El recorrido termina alrededor de una parrilla." | "Una experiencia gastronómica que combina naturaleza y conexión." |
| "El guía explica sin complicar y deja que cada persona encuentre su propio desafío." | "Una aventura perfecta para superar tus límites." |

No decir: *"Nos gusta porque es una experiencia única y especial."*
Decir algo que **demuestre** por qué gusta: *"Fuimos a conocer la actividad y nos gustó que no parte de la idea de que ya sabes escalar."*

## 8. Palabras y clichés a evitar (en ambas secciones)

`única` · `inolvidable` · `mágica` · `increíble` · `imperdible` · `especial` · "para crear recuerdos inolvidables" · "desconecta de la rutina y conecta contigo" · "vive una experiencia que..." · "perfecta para..." · "ideal para..."

Sin clichés de turismo, bienestar o lifestyle. Sin exagerar.

> Nota de auditoría (2026): el contenido actual en el sheet usa "desconectar" con mucha frecuencia y algún "perfecta para" suelto — no son errores graves pero conviene variar el vocabulario entre fichas para que no se sientan repetidas entre sí.

## 9. Primera persona / experiencia de Vivabox — regla de veracidad

Cuando hay evidencia real de que Vivabox visitó/probó/conoció la experiencia, se puede usar: "Fuimos a conocerla...", "La probamos...", "Cuando la conocimos...", "Nos llamó la atención...", "Lo que más nos gustó fue...", "Nos convenció...", "Después de vivirla...".

**Nunca inventar una visita o experiencia de primera mano.** Si no hay evidencia de que Vivabox estuvo ahí, usar una formulación basada en criterio de selección: "La incluimos porque...", "Nos llamó la atención...", "Nos convenció...", siempre sustentado en información real (no inventada).

## 10. Prohibido mencionar al prestador

El nombre del prestador de servicio **no** aparece en `descripcion_corta` ni en `vivanote`. El foco es siempre la experiencia que vive la persona, no un directorio de proveedores.

## 11. Ejemplos reales (del catálogo actual, para calibrar el nivel esperado)

**Bueno** — Escalada en las rocas de Suesca:
- Descripción: *"Escalar las icónicas rocas de Suesca con un guía experto y todo el equipo necesario, para sentir la montaña de una forma distinta."*
- La elegimos: *"Nos gusta porque las rocas de Suesca son cuna de la escalada en Colombia, y vivirlo con un guía hace la experiencia accesible incluso para quienes nunca han escalado."*
- Claves de elección: `Nivel básico | Guía incluido | Equipo incluido`
- Por qué funciona: acción concreta + dato específico (cuna de la escalada en Colombia) que demuestra criterio, no adjetivos; las claves de elección refuerzan justo lo que alguien sin experiencia necesita saber antes de decidir.

**Mejorable** — evitar este patrón:
- *"Una experiencia perfecta para desconectar y vivir algo especial."* — cero información concreta, usa dos palabras de la lista prohibida (§8), podría ser cualquier experiencia de cualquier categoría.
- Claves de elección `Interior | Esfuerzo bajo | Categoría Bienestar` — información genérica que no ayuda a decidir y que además está en la lista de "nunca añadir por defecto" (§5).

## 12. Checklist editorial obligatorio (antes de dar por terminado un texto)

1. **Comprensión** — ¿Se entiende qué se va a hacer? Si no, falla la descripción.
2. **Curaduría** — ¿Se entiende por qué Vivabox escogió esta experiencia y no cualquier otra? Si no, falla "La elegimos".
3. **Humanidad** — ¿Podría este texto haberlo escrito cualquier marketplace con IA? Si la respuesta es sí, reescribir.
4. **Especificidad** — ¿Hay al menos una observación concreta que justifique la elección? Si no, profundizar.
5. **Veracidad** — ¿Todo lo que afirma está sustentado por datos reales? Nunca inventar detalles ni visitas.
6. **Claves de elección** — ¿Cada elemento realmente ayuda a decidir, o es información genérica de relleno? Si es relleno, sacarlo (una lista vacía es mejor que una genérica).

## 13. Dónde vive esto técnicamente

- Datos: columnas `descripcion_corta` (obligatoria), `nota_vivabox` (obligatoria) y `claves_eleccion` (opcional) del Google Sheet "Experiencias" — ver diccionario completo en `.claude/skills/vivabox-sheet-prestador/SKILL.md`.
- Código: `src/services/sheet.ts` (mapea headers ES→EN) → `src/services/experiences.ts` (arma `Experience`) → `src/components/ExperienceModal.tsx` (renderiza `shortDescription` como descripción, `vivanote` en el bloque "La elegimos", y `claves_eleccion` como pills vía `resolveVisibleBadges` en `src/data/badges.ts`, con fallback genérico por categoría en `src/data/categories.ts` solo para filas sin datos).
- No hay que crear campos nuevos: la separación `description` / nota editorial / claves de elección ya existe en el modelo de datos.
