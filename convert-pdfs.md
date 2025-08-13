# Guía para Convertir PDFs a Imágenes WebP

## Opción 1: Usando ImageMagick (Recomendado)

### Instalar ImageMagick:
```bash
# Ubuntu/Debian
sudo apt-get install imagemagick

# macOS
brew install imagemagick

# Windows
# Descargar desde: https://imagemagick.org/script/download.php#windows
```

### Convertir PDFs individuales:
```bash
# Convertir primera página del PDF a WebP
convert "public/certificates/AWS_CloudPractitioner.pdf[0]" -density 300 -quality 85 "src/assets/images/certificates/aws-cloud-practitioner.webp"

convert "public/certificates/AWS_TechnicalEssentials.pdf[0]" -density 300 -quality 85 "src/assets/images/certificates/aws-technical-essentials.webp"

convert "public/certificates/AWS_IdentityAndAccessManagement.pdf[0]" -density 300 -quality 85 "src/assets/images/certificates/aws-iam.webp"

convert "public/certificates/AWS_ComputeServicesOverview.pdf[0]" -density 300 -quality 85 "src/assets/images/certificates/aws-compute.webp"

convert "public/certificates/AWS_DatabaseOfferings.pdf[0]" -density 300 -quality 85 "src/assets/images/certificates/aws-database.webp"
```

### Script para convertir todos los PDFs:
```bash
#!/bin/bash
cd /home/jorge-suazo/Documents/Personal/github_dev/jsuazof.github.io

# Crear directorio si no existe
mkdir -p src/assets/images/certificates

# Convertir cada PDF
for pdf in public/certificates/*.pdf; do
    filename=$(basename "$pdf" .pdf)
    # Convertir nombre a formato kebab-case
    webp_name=$(echo "$filename" | tr '[:upper:]' '[:lower:]' | sed 's/_/-/g' | sed 's/ /-/g')
    
    echo "Convirtiendo $pdf a $webp_name.webp"
    convert "$pdf[0]" -density 300 -quality 85 "src/assets/images/certificates/$webp_name.webp"
done
```

## Opción 2: Usando PDF.js y Canvas (Online)

1. Abrir cada PDF en el navegador
2. Tomar screenshot de la primera página
3. Usar herramientas online como:
   - https://convertio.co/pdf-webp/
   - https://cloudconvert.com/pdf-to-webp

## Opción 3: Usando Python con pdf2image

```bash
pip install pdf2image pillow

python3 << EOF
from pdf2image import convert_from_path
from PIL import Image
import os

pdf_dir = "public/certificates"
output_dir = "src/assets/images/certificates"

os.makedirs(output_dir, exist_ok=True)

for filename in os.listdir(pdf_dir):
    if filename.endswith('.pdf'):
        pdf_path = os.path.join(pdf_dir, filename)
        
        # Convert first page only
        pages = convert_from_path(pdf_path, first_page=1, last_page=1, dpi=300)
        
        if pages:
            # Convert filename to kebab-case
            webp_name = filename.replace('.pdf', '').lower().replace('_', '-').replace(' ', '-')
            webp_path = os.path.join(output_dir, f"{webp_name}.webp")
            
            # Save as WebP
            pages[0].save(webp_path, 'WEBP', quality=85, optimize=True)
            print(f"Converted {filename} to {webp_name}.webp")
EOF
```

## Parámetros Recomendados:
- **Densidad**: 300 DPI para buena calidad
- **Calidad WebP**: 85 (buen balance entre calidad y tamaño)
- **Solo primera página**: `[0]` en ImageMagick
- **Optimización**: Activada para menor tamaño de archivo

## Nombres de Archivos Esperados:
- `aws-cloud-practitioner.webp`
- `aws-technical-essentials.webp`
- `aws-iam.webp`
- `aws-compute.webp`
- `aws-database.webp`
- etc.

Una vez que tengas las imágenes WebP, el componente las mostrará automáticamente como previews de alta calidad que se pueden hacer clic para abrir el PDF completo.