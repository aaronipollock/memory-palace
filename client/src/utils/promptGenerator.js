
// Constants for prompt generation
// Relational prepositions (kept for fallback)
const ACTION_VERBS = [
  'on', 'next to', 'inside', 'above', 'below', 'behind', 'in front of', 'around'
];

const DESCRIPTIVE_ADJECTIVES = [
  'absurdly oversized', 'grotesquely tiny', 'violently glowing', 'shockingly colorful',
  'impossibly transparent', 'blindingly bright', 'manically sparkling', 'defying gravity',
  'monstrously large', 'ridiculously small', 'electrically charged', 'surreally distorted',
  'nightmarishly exaggerated', 'comically absurd', 'terrifyingly vivid', 'hilariously oversized'
];

const ART_STYLES = [
  'surreal symbolic art',
  'exaggerated cartoon style',
  'bizarre fantasy illustration',
  'absurdist symbolic imagery',
  'grotesque surrealism',
  'exaggerated caricature style',
  'nightmarish fantasy art',
  'comically distorted illustration'
];

// Fusion/transformation patterns to boost memorability - biased toward absurdity
const FUSION_PATTERNS = [
  // Absurd transformations
  ({ mem, anchor }) => `${anchor} screaming in terror as it transforms into a grotesque ${mem}, mid-morph with exaggerated features`,
  // Impossible interactions
  ({ mem, anchor }) => `a colossal ${mem} devouring the ${anchor} whole, with exaggerated expressions of shock and absurdity`,
  // Surreal combinations
  ({ mem, anchor }) => `${anchor} made entirely of writhing, living ${mem} that pulse and move in impossible ways`,
  // Emotional absurdity
  ({ mem, anchor }) => `${mem} having an emotional breakdown while fused with the ${anchor}, with exaggerated tears and dramatic expressions`,
  // Impossible physics
  ({ mem, anchor }) => `${mem} defying all physics by growing out of the ${anchor} like a bizarre plant, with impossible proportions`,
  // Nightmarish fusion
  ({ mem, anchor }) => `the ${anchor} bleeding ${mem} from every surface, creating a surreal and disturbing image`,
  // Comical exaggeration
  ({ mem, anchor }) => `${mem} wearing the ${anchor} as a ridiculous hat, with absurd proportions and exaggerated comedy`,
  // Symbolic absurdity
  ({ mem, anchor }) => `${anchor} giving birth to a swarm of ${mem}, creating a bizarre and memorable symbolic image`,
  // Emotional salience
  ({ mem, anchor }) => `${mem} in a passionate embrace with the ${anchor}, with exaggerated romantic or dramatic emotions`,
  // Grotesque exaggeration
  ({ mem, anchor }) => `the ${anchor} vomiting a torrent of ${mem}, creating a shocking and unforgettable image`
];

// Exaggerations to force vividness - more absurd and memorable
const EXAGGERATIONS = [
  'absurdly colossal scale, 10x normal size',
  'a chaotic swarm of thousands forming one impossible shape',
  'defying all physics and gravity in impossible ways',
  'extreme contrast with violently bright highlights and deep black shadows',
  'dramatic lighting creating a nightmarish silhouette',
  'exaggerated proportions that are physically impossible',
  'surreal distortion that makes the image unforgettable',
  'emotional intensity with exaggerated facial expressions',
  'symbolic exaggeration that creates strong visual impact',
  'absurdly detailed textures that create sensory overload'
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
  const fullPrompt = `Create a bizarre, exaggerated, and unforgettable image of ${fusion}. Style: ${artStyle}, avoiding polished or realistic rendering. Composition: ${framing}. Mood: absurd, surreal, emotionally charged, and impossible to forget. Exaggeration: ${exaggeration}. Sensory details: ${sensory}. Make it strange, symbolic, and memorable - prioritize memorability over aesthetic beauty. Constraint: single focal subject, simple background, no text, maximum visual impact through absurdity and exaggeration.`;

  if (setCurrentPrompt) setCurrentPrompt(displayPrompt);

  return { fullPrompt, displayPrompt };
};

// Generate an even STRANGER version of a prompt (for "Make it Stranger" button)
const generateStrangerPrompt = async (association, setCurrentPrompt) => {
  // Use the most extreme options
  const extremeAdjectives = [
    'nightmarishly grotesque', 'absurdly impossible', 'terrifyingly surreal',
    'hilariously distorted', 'monstrously exaggerated', 'shockingly bizarre'
  ];
  const extremeStyles = [
    'nightmarish surrealism', 'grotesque caricature', 'absurdist symbolism',
    'distorted fantasy art', 'comical nightmare style'
  ];
  const extremeExaggerations = [
    'impossibly exaggerated to 100x normal size',
    'defying all known physics and reality',
    'emotionally charged to the point of absurdity',
    'surreal distortion that creates visual shock',
    'symbolic exaggeration that is impossible to forget'
  ];

  const adjective = pickRandom(extremeAdjectives);
  const artStyle = pickRandom(extremeStyles);
  const exaggeration = pickRandom(extremeExaggerations);
  const sensory = pickRandom(SENSORY_DETAILS);
  const framing = pickRandom(COMPOSITION);

  const mem = extractConcreteImage(association.memorableItem);
  const anchor = association.anchor.toLowerCase();
  const anchorContext = ANCHOR_CONTEXT[anchor] || `${anchor}`;

  // Use the most absurd fusion patterns
  const extremeFusions = [
    ({ mem, anchor }) => `${anchor} having a complete emotional breakdown while violently transforming into a grotesque ${mem}, with exaggerated tears, screaming, and impossible proportions`,
    ({ mem, anchor }) => `a nightmarishly colossal ${mem} devouring the ${anchor} whole while both scream in terror, creating an unforgettable absurd image`,
    ({ mem, anchor }) => `${anchor} made entirely of writhing, living ${mem} that pulse, scream, and move in impossible ways, defying all physics`,
    ({ mem, anchor }) => `${mem} in a passionate, absurd embrace with the ${anchor}, with exaggerated romantic drama and impossible physics`,
    ({ mem, anchor }) => `the ${anchor} vomiting a torrent of ${mem} while both cry and laugh simultaneously, creating a shocking surreal image`,
    ({ mem, anchor }) => `${mem} wearing the ${anchor} as a ridiculous hat while both have exaggerated expressions of shock and comedy`,
    ({ mem, anchor }) => `${anchor} giving birth to a swarm of ${mem} in a bizarre and nightmarish symbolic image that is impossible to forget`
  ];

  const fusion = pickRandom(extremeFusions)({ mem, anchor: anchorContext });

  const displayPrompt = `${adjective} ${mem} + ${association.anchor}: ${fusion}.`;
  const fullPrompt = `Create an EXTREMELY bizarre, nightmarishly exaggerated, and absolutely unforgettable image of ${fusion}. Style: ${artStyle}, completely avoiding polished, realistic, or beautiful rendering. Composition: ${framing}. Mood: ABSURD, SURREAL, EMOTIONALLY CHARGED, and IMPOSSIBLE TO FORGET. Exaggeration: ${exaggeration}. Sensory details: ${sensory}. Make it EXTREMELY strange, symbolic, and memorable - prioritize maximum memorability through absurdity, exaggeration, and emotional impact over ANY aesthetic beauty. Make it WEIRD. Make it IMPOSSIBLE to forget. Constraint: single focal subject, simple background, no text, MAXIMUM visual impact through extreme absurdity and exaggeration.`;

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
