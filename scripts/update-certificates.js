#!/usr/bin/env node

/**
 * Certificate Config Updater
 * Updates the certificates.astro file with new certificate entries
 * Usage: node scripts/update-certificates.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PDF_DIR = path.join(PROJECT_ROOT, 'public', 'certificates');
const CERTIFICATES_PAGE = path.join(PROJECT_ROOT, 'src', 'pages', 'certificates.astro');

/**
 * Generate certificate object from PDF filename
 */
function generateCertificateEntry(filename) {
  const baseName = path.basename(filename, '.pdf');
  const title = baseName
    .replace(/^AWS_/, '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/&/g, ' & ')
    .trim()
    .replace(/\s+/g, ' ');

  // Determine category based on filename patterns
  let category = 'awsAdvanced';
  let provider = 'AWS';
  
  if (filename.includes('CloudPractitioner') || filename.includes('TechnicalEssentials')) {
    category = 'awsCertificates';
  } else if (filename.includes('Storage') || filename.includes('Network') || filename.includes('Security') || filename.includes('IAM') || filename.includes('Backup')) {
    category = 'awsInfrastructure';
  } else if (filename.includes('IPCHILE') || filename.includes('Diplomado')) {
    category = 'professional';
    provider = 'IPCHILE';
  }

  return {
    category,
    entry: {
      title: title,
      description: `Professional certification covering ${title.toLowerCase()} concepts and best practices.`,
      provider: provider,
      url: `/certificates/${filename}`
    }
  };
}

/**
 * Scan for new PDFs and suggest additions
 */
function scanForNewCertificates() {
  if (!fs.existsSync(PDF_DIR)) {
    console.error(`❌ PDF directory not found: ${PDF_DIR}`);
    return;
  }

  const pdfFiles = fs.readdirSync(PDF_DIR)
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .sort();

  if (pdfFiles.length === 0) {
    console.log('📁 No PDF files found');
    return;
  }

  console.log('🔍 Found PDF certificates:');
  console.log('========================\n');

  const categories = {
    awsCertificates: [],
    awsInfrastructure: [],
    awsAdvanced: [],
    professional: []
  };

  pdfFiles.forEach(filename => {
    const cert = generateCertificateEntry(filename);
    categories[cert.category].push(cert.entry);
    console.log(`📄 ${filename}`);
    console.log(`   Category: ${cert.category}`);
    console.log(`   Title: ${cert.entry.title}`);
    console.log(`   Provider: ${cert.entry.provider}\n`);
  });

  console.log('📋 Generated certificate arrays:');
  console.log('================================\n');

  Object.entries(categories).forEach(([category, certs]) => {
    if (certs.length > 0) {
      console.log(`// ${category}`);
      console.log(`const ${category} = [`);
      certs.forEach((cert, index) => {
        console.log('  {');
        console.log(`    title: "${cert.title}",`);
        console.log(`    description: "${cert.description}",`);
        console.log(`    provider: "${cert.provider}",`);
        console.log(`    url: "${cert.url}"`);
        console.log(index === certs.length - 1 ? '  }' : '  },');
      });
      console.log('];\n');
    }
  });

  console.log('💡 Copy the arrays above and update your certificates.astro file');
}

/**
 * Main function
 */
function main() {
  console.log('📋 Certificate Config Updater');
  console.log('=============================\n');
  
  scanForNewCertificates();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}