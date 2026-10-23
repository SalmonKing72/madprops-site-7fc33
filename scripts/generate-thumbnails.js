const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const GALLERIES_PATH = path.join(process.cwd(), 'content', 'data', 'galleries.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const THUMBNAILS_DIR = path.join(PUBLIC_DIR, 'images', 'thumbnails');

// Thumbnail sizes
const SIZES = {
    small: 400,   // Grid view
    medium: 800,  // Hover preview
    large: 1200   // Single view initial
};

// Create thumbnails directory if it doesn't exist
if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

async function generateBlurPlaceholder(imagePath) {
    try {
        const buffer = await sharp(imagePath)
            .resize(10, 10, { fit: 'inside' })
            .blur()
            .toBuffer();
        
        return `data:image/jpeg;base64,${buffer.toString('base64')}`;
    } catch (error) {
        console.warn(`Failed to generate blur placeholder for ${imagePath}:`, error.message);
        return null;
    }
}

async function getImageDimensions(imagePath) {
    try {
        const metadata = await sharp(imagePath).metadata();
        return { width: metadata.width, height: metadata.height };
    } catch (error) {
        console.warn(`Failed to get dimensions for ${imagePath}:`, error.message);
        return null;
    }
}

async function generateThumbnail(imagePath, outputPath, width) {
    try {
        await sharp(imagePath)
            .resize(width, null, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 85 })
            .toFile(outputPath);
        
        console.log(`✓ Generated: ${path.basename(outputPath)}`);
        return true;
    } catch (error) {
        console.warn(`✗ Failed to generate thumbnail for ${imagePath}:`, error.message);
        return false;
    }
}

async function processImage(imageUrl) {
    // Skip videos
    if (imageUrl.endsWith('.mp4')) {
        return { thumbnailUrl: null, blurDataURL: null, dimensions: null };
    }

    const imagePath = path.join(PUBLIC_DIR, imageUrl);
    
    if (!fs.existsSync(imagePath)) {
        console.warn(`✗ Image not found: ${imagePath}`);
        return { thumbnailUrl: null, blurDataURL: null, dimensions: null };
    }

    // Extract filename and directory
    const parsedPath = path.parse(imageUrl);
    const filename = parsedPath.name;
    const extension = parsedPath.ext;
    
    // Generate thumbnail filename
    const thumbnailFilename = `${filename}-thumb.webp`;
    const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFilename);
    const thumbnailUrl = `/images/thumbnails/${thumbnailFilename}`;

    // Generate thumbnail (using small size for grid)
    const success = await generateThumbnail(imagePath, thumbnailPath, SIZES.small);
    
    if (!success) {
        return { thumbnailUrl: null, blurDataURL: null, dimensions: null };
    }

    // Generate blur placeholder
    const blurDataURL = await generateBlurPlaceholder(imagePath);

    // Get original image dimensions
    const dimensions = await getImageDimensions(imagePath);

    return {
        thumbnailUrl,
        blurDataURL,
        dimensions
    };
}

async function processGalleries() {
    console.log('🖼️  Starting thumbnail generation...\n');

    // Read galleries.json
    const galleriesData = JSON.parse(fs.readFileSync(GALLERIES_PATH, 'utf8'));
    
    let totalProcessed = 0;
    let totalGenerated = 0;

    // Process each gallery
    for (const gallery of galleriesData.galleries) {
        console.log(`\n📁 Processing gallery: ${gallery.title || gallery.id}`);
        
        // Process each image
        for (const image of gallery.images) {
            totalProcessed++;
            
            const { thumbnailUrl, blurDataURL, dimensions } = await processImage(image.url);
            
            // Update image object
            if (thumbnailUrl) {
                image.thumbnailUrl = thumbnailUrl;
                totalGenerated++;
            }
            
            if (blurDataURL) {
                image.blurDataURL = blurDataURL;
            }
            
            if (dimensions) {
                image.width = dimensions.width;
                image.height = dimensions.height;
            }
        }
    }

    // Write updated galleries.json
    fs.writeFileSync(
        GALLERIES_PATH,
        JSON.stringify(galleriesData, null, 2),
        'utf8'
    );

    console.log('\n✅ Thumbnail generation complete!');
    console.log(`   Processed: ${totalProcessed} images`);
    console.log(`   Generated: ${totalGenerated} thumbnails`);
    console.log(`   Updated: ${GALLERIES_PATH}\n`);
}

// Run the script
processGalleries().catch(error => {
    console.error('❌ Error generating thumbnails:', error);
    process.exit(1);
});