# Guía para Generar PDF del CV

## Opción 1: Imprimir desde el Navegador (Recomendado)

1. **Abrir la página CV** en tu navegador:
   ```
   http://localhost:4321/cv
   ```

2. **Usar Ctrl+P** (Cmd+P en Mac) para abrir el diálogo de impresión

3. **Configurar opciones de impresión**:
   - Destino: "Guardar como PDF"
   - Diseño: Vertical
   - Márgenes: Mínimos
   - Opciones: Desmarcar "Encabezados y pies de página"
   - Escala: Ajustar para que quepa en una página (usualmente 80-90%)

4. **Guardar como**: `Jorge_Suazo_CV.pdf`

5. **Mover el archivo** a: `public/cv/Jorge_Suazo_CV.pdf`

## Opción 2: Usando Puppeteer (Automatizado)

```bash
npm install puppeteer

node << 'EOF'
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Navegar a tu CV local
  await page.goto('http://localhost:4321/cv', {
    waitUntil: 'networkidle0'
  });
  
  // Generar PDF
  await page.pdf({
    path: 'public/cv/Jorge_Suazo_CV.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in'
    }
  });
  
  await browser.close();
  console.log('CV PDF generado exitosamente!');
})();
EOF
```

## Opción 3: Herramientas Online

1. **Abrir** https://www.web2pdfconvert.com/
2. **Ingresar URL**: tu sitio desplegado + /cv
3. **Configurar** opciones de PDF
4. **Descargar** y renombrar a `Jorge_Suazo_CV.pdf`
5. **Colocar** en `public/cv/`

## Configuración CSS para PDF (Opcional)

Si quieres optimizar el CV específicamente para PDF, puedes agregar estilos de impresión:

```css
@media print {
  /* Ocultar elementos no necesarios en PDF */
  header, .download-button {
    display: none !important;
  }
  
  /* Ajustar espaciado para PDF */
  body {
    font-size: 12px;
    line-height: 1.4;
  }
  
  /* Evitar saltos de página en secciones */
  .cv-section {
    page-break-inside: avoid;
  }
}
```

## Estructura Final

```
public/
└── cv/
    └── Jorge_Suazo_CV.pdf
```

Una vez que tengas el PDF en la ubicación correcta, el botón "Descargar CV (PDF)" funcionará automáticamente.