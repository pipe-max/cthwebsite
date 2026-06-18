# Proyecto: Rediseño sitio web — Colegio Theodoro Herzl (CTH)

Sitio institucional estático, multipágina. Reemplaza el sitio actual theodoro.edu.co
con una identidad moderna, institucional y cálida (no infantil).

## Despliegue
- Repo: `pipe-max/cthwebsite` en GitHub.
- Hosting: Cloudflare Pages. **Cada push a `main` despliega automáticamente** a cthwebsite.pages.dev.
- Cada archivo `.html` es una ruta: `index.html` → `/`, `admisiones.html` → `/admisiones`, etc.

## Stack
- HTML estático + un **CSS compartido `styles.css`**. Sin frameworks, sin paso de build.
- **NUNCA** uses bloques `<style>` inline en las páginas. Todo estilo va en `styles.css`.
- Si necesitas un componente nuevo, agrégalo a `styles.css` bajo un comentario de sección claro y reutiliza las variables/tokens existentes.

## Sistema de diseño (ya definido en styles.css)
Colores (CSS vars en `:root`):
- `--ink` #0A1B33 (navy profundo, base) · `--ink-2` #102A4C
- `--sapphire` #1E5BB8 · `--cyan` #19A7DE (marca) · `--cyan-soft` #D7EEFA
- `--gold` #C9A227 (acento herencia / 80 años) · `--gold-soft` #F0E2B8
- `--paper` #F6F8FC (fondo) · `--paper-2` #ECF1F8 · `--line` #DDE5F0 · `--muted` #5A6B83

Tipografía:
- Títulos (`h1,h2,h3`): **Fraunces** (serif, `--display`)
- Cuerpo/UI: **Plus Jakarta Sans** (`--sans`)
- Cargar siempre ambas desde Google Fonts en el `<head>`.

Idioma y tono: **español**, cálido pero institucional. Acentos: navy + oro + cian.

## Reglas obligatorias en CADA página nueva
1. En `<head>`: los `<link>` de Google Fonts (Fraunces + Plus Jakarta Sans) y `<link rel="stylesheet" href="styles.css">`.
2. Si la página usa patrones, incluir el bloque oculto `<svg><defs>` con `star-lattice`, `ph-grid-d`, `ph-grid-l` (cópialo de index.html / admisiones.html).
3. Reutilizar EXACTAMENTE el mismo **utility bar**, **header** y **footer** que en index.html / admisiones.html.
4. En el `<nav class="main">`, marcar el item de la página actual con `class="active"`.
5. Al final del `<body>`, incluir el script del **IntersectionObserver (.reveal)** + el toggle de idioma (cópialo de admisiones.html).
6. Para fotos: usar el placeholder con el patrón `ph-grid` y una etiqueta `📷 Foto: ...` donde irá la imagen real. No inventar imágenes.

## Contenido
La fuente de contenido es el sitio real **theodoro.edu.co**. Mantener textos reales (Horaá Mutemet, pluralidad, 80 años, Google for Education Reference School, datos de contacto, etc.).

## Naming de archivos (rutas)
- `index.html` (home) ✅
- `admisiones.html` ✅
- `quienes-somos.html`, `programas.html`, `servicios.html`, `egresados.html`, `trabaja.html`, `contacto.html` (pendientes)
- Al crear una página, **actualizar los enlaces del menú y del footer en TODAS las páginas** para que apunten al archivo real.

## Pendientes conocidos (no inventar, dejar en `#` hasta tener el dato)
- URLs reales de: formulario de inscripción, Plataforma Phidias, Intranet CTH, Calendario escolar.
- Año de fundación del sello "80 años" (provisional 1946, por confirmar con el colegio).

## Datos de contacto (reales)
- Dirección: Carrera 1 No. 36 D Sur 515 (Alto de las Palmas), Envigado — Antioquia
- Tel: (+57) 604 322 0180
- Correos: admisiones@theodoro.edu.co
