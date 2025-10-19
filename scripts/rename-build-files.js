#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../build/static');

// Función para procesar archivos
function renameFiles(dir, ext, type) {
  const typeDir = path.join(buildDir, type);
  
  if (!fs.existsSync(typeDir)) {
    console.log(`Directorio ${typeDir} no encontrado`);
    return;
  }

  const files = fs.readdirSync(typeDir).filter(file => file.endsWith(ext));
  
  files.forEach(file => {
    const filePath = path.join(typeDir, file);
    const fileName = path.parse(file).name;
    
    // Extraer el hash (último segmento antes de la extensión)
    // Ejemplo: main.f2ae46b9.js -> main.[hash].js
    const parts = fileName.split('.');
    
    if (parts.length >= 2) {
      const baseName = parts[0]; // main, 453, etc.
      const newFileName = `${baseName}.latest${ext}`;
      const newFilePath = path.join(typeDir, newFileName);
      
      // Copiar archivo con nuevo nombre
      fs.copyFileSync(filePath, newFilePath);
      console.log(`✓ Creado: ${type}/${newFileName}`);
    }
  });
}

console.log('🔨 Renombrando archivos de build...\n');

// Procesar CSS
renameFiles(buildDir, '.css', 'css');

// Procesar JS
renameFiles(buildDir, '.js', 'js');

// Procesar archivos .map
renameFiles(buildDir, '.map', 'css');
renameFiles(buildDir, '.map', 'js');

console.log('\n✅ Build finalizado con nombres predecibles');
console.log('Ahora puedes referenciar siempre los últimos archivos con:');
console.log('  - static/css/main.latest.css');
console.log('  - static/js/main.latest.js');
console.log('  - static/js/[chunk].latest.js');
