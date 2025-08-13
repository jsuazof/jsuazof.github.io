#!/usr/bin/env node

/**
 * PDF Thumbnail Generator
 * Generates WebP thumbnails from PDF certificates
 * Usage: node scripts/generate-thumbnails.js [pdf-file]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PDF_DIR = path.join(PROJECT_ROOT, 'public', 'certificates');
const THUMBNAIL_DIR = path.join(PROJECT_ROOT, 'src', 'assets', 'images', 'certificates');

// Ensure thumbnail directory exists
if (!fs.existsSync(THUMBNAIL_DIR)) {
  fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });
  console.log(`✅ Created thumbnail directory: ${THUMBNAIL_DIR}`);
}

/**
 * Check if required tools are installed
 */
function checkDependencies() {
  const tools = ['pdftoppm', 'cwebp'];
  const missing = [];

  for (const tool of tools) {
    try {
      execSync(`which ${tool}`, { stdio: 'ignore' });
    } catch (error) {
      missing.push(tool);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required tools:');
    missing.forEach(tool => {
      console.error(`   - ${tool}`);
    });
    console.error('\nInstall missing tools:');
    console.error('Ubuntu/Debian: sudo apt-get install poppler-utils webp');
    console.error('macOS: brew install poppler webp');
    console.error('Fedora: sudo dnf install poppler-utils libwebp-tools');
    process.exit(1);
  }
}

/**
 * Generate WebP thumbnail from PDF
 */
function generateThumbnail(pdfPath, outputPath) {
  const tempPpm = path.join('/tmp', `temp_${Date.now()}.ppm`);
  
  try {
    // Convert first page of PDF to PPM
    console.log(`📄 Converting PDF to image: ${path.basename(pdfPath)}`);
    execSync(`pdftoppm -f 1 -l 1 -r 150 -jpeg "${pdfPath}" "${tempPpm.replace('.ppm', '')}"`, { stdio: 'ignore' });
    
    // Find the generated file (pdftoppm adds -1.jpg suffix)
    const tempJpg = tempPpm.replace('.ppm', '-1.jpg');
    
    if (!fs.existsSync(tempJpg)) {
      throw new Error('Failed to generate temporary image');
    }

    // Convert to WebP with optimization
    console.log(`🖼️  Converting to WebP: ${path.basename(outputPath)}`);
    execSync(`cwebp -q 85 -resize 400 300 "${tempJpg}" -o "${outputPath}"`, { stdio: 'ignore' });
    
    // Clean up temporary file
    fs.unlinkSync(tempJpg);
    
    console.log(`✅ Generated: ${path.basename(outputPath)}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error generating thumbnail for ${path.basename(pdfPath)}:`, error.message);
    
    // Clean up any temporary files
    [tempPpm, tempPpm.replace('.ppm', '-1.jpg')].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    
    return false;
  }
}

/**
 * Process a single PDF file
 */
function processPDF(pdfFile) {
  const pdfPath = path.join(PDF_DIR, pdfFile);
  const baseName = path.basename(pdfFile, '.pdf');
  const thumbnailPath = path.join(THUMBNAIL_DIR, `${baseName}.webp`);
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF not found: ${pdfPath}`);
    return false;
  }

  // Check if thumbnail already exists and is newer than PDF
  if (fs.existsSync(thumbnailPath)) {
    const pdfStats = fs.statSync(pdfPath);
    const thumbnailStats = fs.statSync(thumbnailPath);
    
    if (thumbnailStats.mtime > pdfStats.mtime) {
      console.log(`⏭️  Skipping ${pdfFile} (thumbnail is up to date)`);
      return true;
    }
  }

  return generateThumbnail(pdfPath, thumbnailPath);
}

/**
 * Process all PDFs in the certificates directory
 */
function processAllPDFs() {
  if (!fs.existsSync(PDF_DIR)) {
    console.error(`❌ PDF directory not found: ${PDF_DIR}`);
    process.exit(1);
  }

  const pdfFiles = fs.readdirSync(PDF_DIR)
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .sort();

  if (pdfFiles.length === 0) {
    console.log('📁 No PDF files found in certificates directory');
    return;
  }

  console.log(`🔍 Found ${pdfFiles.length} PDF files`);
  console.log('📸 Generating thumbnails...\n');

  let successful = 0;
  let failed = 0;

  for (const pdfFile of pdfFiles) {
    if (processPDF(pdfFile)) {
      successful++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📁 Total: ${pdfFiles.length}`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  console.log('🚀 PDF Thumbnail Generator');
  console.log('==========================\n');

  // Check dependencies
  checkDependencies();

  if (args.length > 0) {
    // Process specific file
    const pdfFile = args[0];
    console.log(`📄 Processing single file: ${pdfFile}\n`);
    
    if (processPDF(pdfFile)) {
      console.log('\n✅ Done!');
    } else {
      console.log('\n❌ Failed!');
      process.exit(1);
    }
  } else {
    // Process all files
    processAllPDFs();
    console.log('\n✅ All done!');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { processPDF, processAllPDFs };