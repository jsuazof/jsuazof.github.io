# Certificate Management Scripts

Scripts para automatizar la gestión de certificados PDF y sus miniaturas WebP.

## 📋 Scripts Disponibles

### 1. `generate-thumbnails.js`
Genera miniaturas WebP de los certificados PDF.

```bash
# Generar todas las miniaturas
pnpm run thumbnails

# Generar miniatura de un PDF específico
node scripts/generate-thumbnails.js "AWS_CloudPractitioner.pdf"
```

**Características:**
- Convierte la primera página del PDF a imagen WebP
- Optimiza el tamaño (400x300px, calidad 85%)
- Solo regenera si el PDF es más nuevo que la miniatura existente
- Requiere `pdftoppm` y `cwebp`

### 2. `watch-certificates.js`
Observa la carpeta de certificados y genera miniaturas automáticamente.

```bash
# Iniciar el observador
pnpm run thumbnails:watch
```

**Características:**
- Detecta automáticamente nuevos PDFs
- Genera miniaturas en tiempo real
- Se ejecuta en segundo plano
- Presiona Ctrl+C para detener

### 3. `update-certificates.js`
Escanea los PDFs y genera código para actualizar la configuración.

```bash
# Escanear y generar configuración
pnpm run certificates:update
```

**Características:**
- Lista todos los PDFs encontrados
- Categoriza automáticamente los certificados
- Genera arrays de JavaScript listos para copiar
- Sugiere títulos y descripciones

## 4. `security-remediation.sh`

Realiza auditoría de los repositorios públicos y prepara correcciones controladas. Por defecto no modifica ni publica nada.

```bash
# Auditoría segura y reporte local
pnpm security:audit

# Modo explícitamente confirmado para crear correcciones y PRs
bash scripts/security-remediation.sh all --apply
```

Características:
- Lista los repositorios públicos y detecta indicadores de secretos sin mostrar valores.
- Identifica `.gitignore` insuficientes y workflows con permisos o herramientas no fijadas.
- Puede preparar ramas y PRs para el portfolio y los repositorios con hallazgos conocidos.
- Nunca rota credenciales ni limpia el historial automáticamente.
- Requiere autenticar GitHub con permisos suficientes para modificar workflows.


## 🛠️ Instalación de Dependencias

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install poppler-utils webp
```

### macOS
```bash
brew install poppler webp
```

### Fedora/RHEL
```bash
sudo dnf install poppler-utils libwebp-tools
```

## 🚀 Flujo de Trabajo Recomendado

### Para nuevos certificados:

1. **Agregar PDF**: Copia el nuevo certificado a `public/certificates/`

2. **Generar miniatura**: 
   ```bash
   pnpm run thumbnails
   ```

3. **Actualizar configuración**:
   ```bash
   pnpm run certificates:update
   ```

4. **Copiar código generado** al archivo `src/pages/certificates.astro`

### Para desarrollo continuo:

1. **Iniciar observador**:
   ```bash
   pnpm run thumbnails:watch
   ```

2. **Agregar PDFs** - las miniaturas se generan automáticamente

3. **Actualizar configuración** cuando sea necesario

## 📁 Estructura de Archivos

```
project/
├── public/certificates/          # PDFs originales
│   ├── AWS_CloudPractitioner.pdf
│   └── ...
├── src/assets/images/certificates/ # Miniaturas WebP
│   ├── AWS_CloudPractitioner.webp
│   └── ...
└── scripts/                      # Scripts de gestión
    ├── generate-thumbnails.js
    ├── watch-certificates.js
    └── update-certificates.js
```

## 🔧 Configuración Avanzada

### Calidad de imagen
Edita `generate-thumbnails.js` línea 67:
```javascript
execSync(`cwebp -q 85 -resize 400 300 "${tempJpg}" -o "${outputPath}"`, { stdio: 'ignore' });
//              ↑ calidad    ↑ tamaño
```

### Resolución PDF
Edita `generate-thumbnails.js` línea 58:
```javascript
execSync(`pdftoppm -f 1 -l 1 -r 150 -jpeg "${pdfPath}" "${tempPpm.replace('.ppm', '')}"`, { stdio: 'ignore' });
//                              ↑ DPI
```

## 🐛 Solución de Problemas

### Error: "pdftoppm not found"
Instala poppler-utils según tu sistema operativo.

### Error: "cwebp not found"  
Instala webp tools según tu sistema operativo.

### Miniaturas borrosas
Aumenta el valor DPI en la configuración (línea 58).

### Archivos muy grandes
Reduce la calidad WebP (línea 67) o el tamaño de imagen.

## 📝 Notas

- Las miniaturas se generan en `/tmp` temporalmente
- Solo se procesan archivos `.pdf` (case-insensitive)
- Los archivos temporales se limpian automáticamente
- El script verifica timestamps para evitar regeneración innecesaria