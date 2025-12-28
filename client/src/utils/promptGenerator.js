
// Constants for prompt generation
// Relational prepositions (kept for fallback)
const ACTION_VERBS = [
  'on', 'next to', 'inside', 'above', 'below', 'behind', 'in front of', 'around'
];

const DESCRIPTIVE_ADJECTIVES = [
  'absurdly oversized', 'comically tiny', 'brilliantly glowing', 'vibrantly colorful',
  'impossibly transparent', 'blindingly bright', 'magically sparkling', 'defying gravity',
  'gigantically large', 'ridiculously small', 'electrically charged', 'playfully distorted',
  'wildly exaggerated', 'comically absurd', 'strikingly vivid', 'hilariously oversized',
  'dramatically enlarged', 'whimsically small', 'radiantly glowing', 'spectacularly colorful'
];

const ART_STYLES = [
  'surreal symbolic art',
  'exaggerated cartoon style',
  'whimsical fantasy illustration',
  'absurdist symbolic imagery',
  'playful surrealism',
  'exaggerated caricature style',
  'fantastical art',
  'comically distorted illustration',
  'vibrant pop art style',
  'dramatic illustration'
];

// Fusion/transformation patterns to boost memorability - biased toward playful absurdity
const FUSION_PATTERNS = [
  // Playful transformations
  ({ mem, anchor }) => `${anchor} magically transforming into a ${mem}, mid-morph with exaggerated, whimsical features`,
  // Impossible interactions
  ({ mem, anchor }) => `a colossal ${mem} playfully interacting with the ${anchor}, with exaggerated expressions of surprise and delight`,
  // Surreal combinations
  ({ mem, anchor }) => `${anchor} made entirely of animated ${mem} that dance and move in impossible, joyful ways`,
  // Emotional absurdity
  ({ mem, anchor }) => `${mem} having a dramatic, comical reaction while fused with the ${anchor}, with exaggerated expressions and theatrical poses`,
  // Impossible physics
  ({ mem, anchor }) => `${mem} defying all physics by growing out of the ${anchor} like a magical plant, with impossible but delightful proportions`,
  // Playful fusion
  ({ mem, anchor }) => `the ${anchor} overflowing with ${mem} in a spectacular, colorful cascade, creating a vibrant and memorable image`,
  // Comical exaggeration
  ({ mem, anchor }) => `${mem} wearing the ${anchor} as a whimsical hat, with absurd proportions and exaggerated comedy`,
  // Symbolic absurdity
  ({ mem, anchor }) => `${anchor} magically producing a swarm of ${mem}, creating a playful and memorable symbolic image`,
  // Emotional salience
  ({ mem, anchor }) => `${mem} in a dramatic, theatrical embrace with the ${anchor}, with exaggerated romantic or comedic emotions`,
  // Playful exaggeration
  ({ mem, anchor }) => `the ${anchor} playfully launching a torrent of ${mem} into the air, creating a spectacular and unforgettable image`
];

// Exaggerations to force vividness - playful and memorable
const EXAGGERATIONS = [
  'absurdly colossal scale, 10x normal size',
  'a spectacular swarm of hundreds forming one impossible, delightful shape',
  'defying all physics and gravity in impossible, magical ways',
  'extreme contrast with brilliantly bright highlights and rich colorful shadows',
  'dramatic lighting creating a striking, memorable silhouette',
  'exaggerated proportions that are physically impossible but visually delightful',
  'surreal distortion that makes the image unforgettable and playful',
  'emotional intensity with exaggerated, theatrical facial expressions',
  'symbolic exaggeration that creates strong visual impact and memorability',
  'absurdly detailed textures that create rich visual interest'
];

// Sensory texture/color pairs - more vivid and contrasting
const SENSORY_DETAILS = [
  'slick marble sheen and bristly fur texture in extreme contrast',
  'wet stone glisten and rough rope fibers creating tactile dissonance',
  'polished metal shine and cracked leather with exaggerated textures',
  'glowing embers and cold blue shadows in dramatic opposition',
  'powdery dust motes and oily reflections creating visual chaos',
  'rough bark texture and smooth glass creating impossible combinations',
  'sticky honey-like surfaces and sharp metallic edges',
  'fluffy cloud-like textures and hard stone in surreal contrast',
  'electric sparks and flowing water in impossible coexistence',
  'burning flames and freezing ice creating dramatic tension'
];

// Composition presets - still clean but more dramatic
const COMPOSITION = [
  'centered composition, portrait orientation, dramatic low angle, strong silhouette, simple dark background',
  'medium shot, heavy vignette, dark backdrop, subject fully in frame with exaggerated presence',
  'close‑up hero shot, shallow depth of field, uncluttered environment, maximum visual impact',
  'extreme close-up, distorted perspective, dramatic lighting, simple background',
  'heroic composition, low angle, strong shadows, minimal background distraction'
];

// Anchor-specific context for better AI generation
const ANCHOR_CONTEXT = {
  'tapestry': 'a large medieval tapestry prominently displayed, hanging vertically on a stone wall, featuring intricate embroidery, heraldic symbols, rich colors, and decorative patterns, clearly visible in the foreground',
  'column': 'a tall stone column or pillar, classical architecture style',
  'dais': 'a large raised stone platform with multiple steps leading up to it, prominently positioned in the center, featuring ornate stone railings and decorative carvings, clearly elevated above the floor level',
  'statue': 'a detailed stone or bronze statue, classical or medieval style',
  'stained glass window': 'a colorful stained glass window with intricate patterns',
  'candlestick': 'a ornate candlestick or candelabra, medieval or gothic style',
  'footstool': 'a decorative footstool or ottoman',
  'red carpet': 'a rich red carpet or rug, luxurious and ornate',
  'throne': 'an ornate throne chair, royal or medieval style',
  'chandelier': 'a grand chandelier hanging from the ceiling, crystal or metal',
  'wardrobe': 'a large wooden wardrobe or armoire',
  'bed': 'a four-poster bed with curtains and ornate headboard',
  'mirror': 'a large ornate mirror in a decorative frame',
  'fireplace': 'a stone fireplace with mantel and hearth',
  'bookshelf': 'a tall wooden bookshelf filled with books',
  'desk': 'a wooden writing desk with drawers',
  'chair': 'an ornate wooden chair with decorative details',
  'table': 'a wooden table, possibly with tablecloth',
  'sink': 'a stone or ceramic sink basin',
  'stove': 'a large cooking stove or oven, medieval style',
  'pantry': 'wooden pantry shelves with food storage',
  'barrel': 'wooden barrels for storage',
  'cauldron': 'a large metal cauldron for cooking',
  'torture rack': 'a medieval torture device, dark and ominous',
  'iron maiden': 'a spiked iron torture device',
  'chains': 'heavy metal chains hanging from walls',
  'dungeon door': 'a heavy wooden door with metal reinforcements',
  'torch': 'wall-mounted torches providing flickering light',
  'cell bars': 'iron bars forming a prison cell',
  'stone floor': 'cold stone floor with cracks and wear'
};

// Utility for random selection
const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

// Extract concrete image from memorable item (handles parentheses format)
const extractConcreteImage = (memorableItem) => {
  // If the item contains parentheses, extract the part before them
  const parenthesesIndex = memorableItem.indexOf('(');
  if (parenthesesIndex !== -1) {
    return memorableItem.substring(0, parenthesesIndex).trim();
  }
  // Otherwise, return the full item
  return memorableItem;
};

// Prompt generator (fusion + exaggeration schema)
const generatePrompt = async (association, setCurrentPrompt) => {
  const adjective = pickRandom(DESCRIPTIVE_ADJECTIVES);
  const artStyle = pickRandom(ART_STYLES);
  const exaggeration = pickRandom(EXAGGERATIONS);
  const sensory = pickRandom(SENSORY_DETAILS);
  const framing = pickRandom(COMPOSITION);

  const mem = extractConcreteImage(association.memorableItem);
  const anchor = association.anchor.toLowerCase();
  const anchorContext = ANCHOR_CONTEXT[anchor] || `${anchor}`;

  // Fusion description
  const fusion = pickRandom(FUSION_PATTERNS)({ mem, anchor: anchorContext });

  const displayPrompt = `${adjective} ${mem} + ${association.anchor}: ${fusion}.`;
  const fullPrompt = `Create a playful, exaggerated, and unforgettable image of ${fusion}. Style: ${artStyle}, avoiding polished or realistic rendering. Composition: ${framing}. Mood: whimsical, surreal, emotionally engaging, and impossible to forget. Exaggeration: ${exaggeration}. Sensory details: ${sensory}. Make it memorable, symbolic, and striking - prioritize memorability through playful absurdity, exaggeration, and vibrant colors. Use bright, vivid colors and dramatic lighting. Constraint: single focal subject, simple background, no text, maximum visual impact through playful absurdity and exaggeration.`;

  if (setCurrentPrompt) setCurrentPrompt(displayPrompt);

  return { fullPrompt, displayPrompt };
};

// Generate an even STRANGER version of a prompt (for "Make it Stranger" button)
const generateStrangerPrompt = async (association, setCurrentPrompt) => {
  // Use the most extreme but playful options
  const extremeAdjectives = [
    'wildly impossible', 'absurdly exaggerated', 'spectacularly surreal',
    'hilariously distorted', 'dramatically oversized', 'shockingly vibrant'
  ];
  const extremeStyles = [
    'extreme surrealism', 'exaggerated caricature', 'absurdist symbolism',
    'distorted fantasy art', 'comical pop art style', 'vibrant surreal illustration'
  ];
  const extremeExaggerations = [
    'impossibly exaggerated to 100x normal size',
    'defying all known physics and reality in magical ways',
    'emotionally charged to the point of theatrical absurdity',
    'surreal distortion that creates unforgettable visual impact',
    'symbolic exaggeration that is impossible to forget',
    'dramatically vibrant colors creating maximum visual impact'
  ];

  const adjective = pickRandom(extremeAdjectives);
  const artStyle = pickRandom(extremeStyles);
  const exaggeration = pickRandom(extremeExaggerations);
  const sensory = pickRandom(SENSORY_DETAILS);
  const framing = pickRandom(COMPOSITION);

  const mem = extractConcreteImage(association.memorableItem);
  const anchor = association.anchor.toLowerCase();
  const anchorContext = ANCHOR_CONTEXT[anchor] || `${anchor}`;

  // Use the most absurd but playful fusion patterns
  const extremeFusions = [
    ({ mem, anchor }) => `${anchor} having a complete theatrical transformation into a ${mem}, with exaggerated, comical expressions and impossible proportions`,
    ({ mem, anchor }) => `a spectacularly colossal ${mem} playfully interacting with the ${anchor} in an impossible way, creating an unforgettable absurd image`,
    ({ mem, anchor }) => `${anchor} made entirely of animated ${mem} that dance, pulse, and move in impossible, joyful ways, defying all physics`,
    ({ mem, anchor }) => `${mem} in a passionate, theatrical embrace with the ${anchor}, with exaggerated dramatic emotions and impossible physics`,
    ({ mem, anchor }) => `the ${anchor} spectacularly launching a torrent of ${mem} into the air while both have exaggerated expressions of surprise and delight`,
    ({ mem, anchor }) => `${mem} wearing the ${anchor} as a whimsical hat while both have exaggerated expressions of shock and comedy`,
    ({ mem, anchor }) => `${anchor} magically producing a spectacular swarm of ${mem} in a vibrant and unforgettable symbolic image`
  ];

  const fusion = pickRandom(extremeFusions)({ mem, anchor: anchorContext });

  const displayPrompt = `${adjective} ${mem} + ${association.anchor}: ${fusion}.`;
  const fullPrompt = `Create an EXTREMELY playful, wildly exaggerated, and absolutely unforgettable image of ${fusion}. Style: ${artStyle}, completely avoiding polished, realistic, or beautiful rendering. Composition: ${framing}. Mood: WHIMSICAL, SURREAL, EMOTIONALLY ENGAGING, and IMPOSSIBLE TO FORGET. Exaggeration: ${exaggeration}. Sensory details: ${sensory}. Make it EXTREMELY memorable, symbolic, and striking - prioritize maximum memorability through playful absurdity, exaggeration, vibrant colors, and emotional impact. Use bright, vivid, saturated colors and dramatic lighting. Make it WEIRD but delightful. Make it IMPOSSIBLE to forget. Constraint: single focal subject, simple background, no text, MAXIMUM visual impact through extreme playful absurdity and exaggeration.`;

  if (setCurrentPrompt) setCurrentPrompt(displayPrompt);

  return { fullPrompt, displayPrompt };
};


export {
  ACTION_VERBS,
  DESCRIPTIVE_ADJECTIVES,
  ART_STYLES,
  ANCHOR_CONTEXT,
  FUSION_PATTERNS,
  EXAGGERATIONS,
  SENSORY_DETAILS,
  COMPOSITION,
  generatePrompt,
  generateStrangerPrompt
};
