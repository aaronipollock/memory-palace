const axios = require('axios');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// List of available art styles
const ART_STYLES = [
    'digital art',
    'cartoon',
    '3D render',
    'watercolor',
    'pop art',
    'photorealistic'
];

// Helper function to pick a random art style
const getRandomArtStyle = () => ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)];

// Helper function to create memorable associations with art style
const createAssociation = (item, roomFeature, artStyle) => {
    // List of action verbs to make scenes more dynamic
    const actionVerbs = [
        'dramatically interacts with',
        'unexpectedly appears in',
        'humorously transforms',
        'explosively emerges from',
        'magically floats around',
        'chaotically disrupts',
        'mysteriously merges with',
        'playfully bounces off',
        'dramatically crashes into',
        'comically slides down'
    ];

    // List of descriptive adjectives to enhance visualization
    const adjectives = [
        'giant', 'tiny', 'glowing', 'colorful',
        'transparent', 'neon', 'sparkling', 'animated',
        'surreal', 'vibrant'
    ];

    // Randomly select elements to create variety
    const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];

    // Create a dramatic/humorous scenario
    return `A ${adjective} ${item} ${verb} the ${roomFeature}, creating a memorable and surprising scene, ${artStyle} style`;
};

// Image optimization configuration
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1024, height: 1024 }
};

const IMAGE_QUALITY = {
  webp: 80,
  jpeg: 85,
  png: 9
};

// Optimize and resize image
async function optimizeImage(buffer, filename, sizes = ['medium']) {
  const optimizedImages = {};
  const baseName = path.parse(filename).name;

  for (const size of sizes) {
    const config = IMAGE_SIZES[size];

    // Create WebP version (best compression)
    const webpBuffer = await sharp(buffer)
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: IMAGE_QUALITY.webp })
      .toBuffer();

    const webpFilename = `${baseName}-${size}.webp`;
    const webpPath = path.join(__dirname, '../public/images/optimized', webpFilename);

    // Ensure directory exists
    fs.mkdirSync(path.dirname(webpPath), { recursive: true });
    fs.writeFileSync(webpPath, webpBuffer);

    optimizedImages[size] = {
      webp: `/public/images/optimized/${webpFilename}`,
      size: webpBuffer.length
    };
  }

  return optimizedImages;
}

// Generate responsive image srcset
function generateSrcSet(optimizedImages) {
  const srcset = [];
  const sizes = [];

  Object.entries(optimizedImages).forEach(([size, data]) => {
    const width = IMAGE_SIZES[size].width;
    srcset.push(`${data.webp} ${width}w`);
    sizes.push(`(max-width: ${width}px) ${width}px`);
  });

  return {
    srcset: srcset.join(', '),
    sizes: sizes.join(', '),
    defaultSrc: optimizedImages.medium?.webp || optimizedImages.large?.webp
  };
}

exports.generateImages = async (req, res) => {
    const { anchorPoints, memorables, artStyle = 'digital art' } = req.body;
    console.log('Received data:', { anchorPoints, memorables, artStyle });

    try {
        // Validate inputs
        if (!Array.isArray(anchorPoints) || !Array.isArray(memorables)) {
            return res.status(400).json({ error: 'Both room features and items must be provided as arrays' });
        }

        if (anchorPoints.length === 0 || memorables.length === 0) {
            return res.status(400).json({ error: 'Both lists must contain at least one item' });
        }

        const pairs = pairItemsWithFeatures(memorables, anchorPoints);

        // Create associations and generate images
        const generatedImages = [];
        for (const pair of pairs) {
            // Determine the art style for this image
            let style = artStyle;
            if (artStyle.toLowerCase() === 'random') {
                style = getRandomArtStyle();
            }
            const prompt = createAssociation(pair.item, pair.roomFeature, style);

            const response = await axios.post('https://api.openai.com/v1/images/generations', {
                prompt: prompt,
                n: 1,
                size: "1024x1024"
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            // Optimize the generated image
            const imageUrl = response.data.data[0].url;
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imageResponse.data);

            const filename = `${Date.now()}-${pair.item}-${pair.roomFeature}.png`;
            const optimizedImages = await optimizeImage(buffer, filename, ['thumbnail', 'small', 'medium', 'large']);
            const srcSet = generateSrcSet(optimizedImages);

            generatedImages.push({
                item: pair.item,
                roomFeature: pair.roomFeature,
                prompt: prompt,
                artStyle: style,
                url: imageUrl,
                optimized: optimizedImages,
                srcSet: srcSet
            });
        }

        console.log('Sending response:', {
            images: generatedImages
        });

        res.json({
            images: generatedImages
        });
    } catch (error) {
        console.error('Error generating images:', error);
        res.status(500).json({ error: 'Failed to generate images' });
    }
};
