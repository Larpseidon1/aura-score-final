const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const QUALITY_SETTINGS = {
  jpg: 85,
  png: 90
};

const MAX_WIDTHS = {
  'sky-4k.jpg': 2560, // Optimize for web, not true 4K
  'sky-mobile.jpg': 1080,
  'default': 1920
};

async function optimizeImage(inputPath, outputPath) {
  const filename = path.basename(inputPath);
  const ext = path.extname(inputPath).toLowerCase();
  
  try {
    const stats = await fs.stat(inputPath);
    const fileSizeKB = stats.size / 1024;
    
    console.log(`📸 Processing ${filename} (${fileSizeKB.toFixed(1)} KB)...`);
    
    const maxWidth = MAX_WIDTHS[filename] || MAX_WIDTHS.default;
    
    if (ext === '.jpg' || ext === '.jpeg') {
      await sharp(inputPath)
        .resize(maxWidth, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ 
          quality: QUALITY_SETTINGS.jpg, 
          progressive: true,
          mozjpeg: true 
        })
        .toFile(outputPath);
    } else if (ext === '.png') {
      await sharp(inputPath)
        .resize(maxWidth, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .png({ 
          quality: QUALITY_SETTINGS.png,
          compressionLevel: 9,
          progressive: true
        })
        .toFile(outputPath);
    }
    
    const newStats = await fs.stat(outputPath);
    const newFileSizeKB = newStats.size / 1024;
    const reduction = ((fileSizeKB - newFileSizeKB) / fileSizeKB * 100).toFixed(1);
    
    console.log(`✅ Optimized ${filename}: ${fileSizeKB.toFixed(1)} KB → ${newFileSizeKB.toFixed(1)} KB (${reduction}% reduction)`);
    
    return { original: fileSizeKB, optimized: newFileSizeKB, reduction };
  } catch (error) {
    console.error(`❌ Error optimizing ${filename}:`, error);
    return null;
  }
}

async function processDirectory(dir, outputDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  let totalOriginal = 0;
  let totalOptimized = 0;
  let processedCount = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const outputPath = path.join(outputDir, entry.name);
    
    if (entry.isDirectory()) {
      await fs.mkdir(outputPath, { recursive: true });
      const subResults = await processDirectory(fullPath, outputPath);
      totalOriginal += subResults.totalOriginal;
      totalOptimized += subResults.totalOptimized;
      processedCount += subResults.count;
    } else if (entry.isFile() && /\.(jpg|jpeg|png)$/i.test(entry.name)) {
      const result = await optimizeImage(fullPath, outputPath);
      if (result) {
        totalOriginal += result.original;
        totalOptimized += result.optimized;
        processedCount++;
      }
    } else if (entry.isFile()) {
      // Copy non-image files as-is
      await fs.copyFile(fullPath, outputPath);
    }
  }
  
  return { totalOriginal, totalOptimized, count: processedCount };
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  const optimizedDir = path.join(__dirname, '..', 'public-optimized');
  
  console.log('🚀 Starting image optimization...\n');
  
  try {
    // Create optimized directory
    await fs.mkdir(optimizedDir, { recursive: true });
    
    // Process all images
    const results = await processDirectory(publicDir, optimizedDir);
    
    const totalReduction = ((results.totalOriginal - results.totalOptimized) / results.totalOriginal * 100).toFixed(1);
    
    console.log('\n📊 Optimization Summary:');
    console.log(`   Files processed: ${results.count}`);
    console.log(`   Total original size: ${(results.totalOriginal / 1024).toFixed(1)} MB`);
    console.log(`   Total optimized size: ${(results.totalOptimized / 1024).toFixed(1)} MB`);
    console.log(`   Total reduction: ${totalReduction}%`);
    console.log(`\n✨ Images optimized! Check the 'public-optimized' directory.`);
    console.log(`\n💡 To use optimized images, run: rm -rf public && mv public-optimized public`);
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

main(); 