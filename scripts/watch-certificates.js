#!/usr/bin/env node

/**
 * Certificate Watcher
 * Watches for new PDF files and automatically generates thumbnails
 * Usage: node scripts/watch-certificates.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processPDF } from './generate-thumbnails.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PDF_DIR = path.join(PROJECT_ROOT, 'public', 'certificates');

console.log('👀 Certificate Watcher Started');
console.log('===============================');
console.log(`📁 Watching: ${PDF_DIR}`);
console.log('🔄 Waiting for new PDF files...\n');

// Ensure directory exists
if (!fs.existsSync(PDF_DIR)) {
  console.error(`❌ Directory not found: ${PDF_DIR}`);
  process.exit(1);
}

// Watch for file changes
fs.watch(PDF_DIR, { recursive: false }, (eventType, filename) => {
  if (!filename || !filename.toLowerCase().endsWith('.pdf')) {
    return;
  }

  if (eventType === 'rename') {
    const filePath = path.join(PDF_DIR, filename);
    
    // Check if file was added (exists) or removed (doesn't exist)
    if (fs.existsSync(filePath)) {
      console.log(`📄 New PDF detected: ${filename}`);
      console.log('🔄 Generating thumbnail...');
      
      // Small delay to ensure file is fully written
      setTimeout(() => {
        if (processPDF(filename)) {
          console.log(`✅ Thumbnail generated for: ${filename}\n`);
        } else {
          console.log(`❌ Failed to generate thumbnail for: ${filename}\n`);
        }
      }, 1000);
    }
  }
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\n👋 Certificate watcher stopped');
  process.exit(0);
});