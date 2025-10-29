
// Constants for prompt generation
// Relational prepositions (kept for fallback)
const ACTION_VERBS = [
  'on', 'next to', 'inside', 'above', 'below', 'behind', 'in front of', 'around'
];

const DESCRIPTIVE_ADJECTIVES = [
  'giant', 'tiny', 'glowing', 'colorful',
  'transparent', 'bright', 'sparkling', 'floating'
];

const ART_STYLES = [
  'digital art',
  'realistic',
  'detailed illustration',
  'high quality render'
];

// Fusion/transformation patterns to boost memorability
const FUSION_PATTERNS = [
  // X made of Y
  ({ mem, anchor }) => `${anchor} constructed entirely from ${mem} stacked/combined together`,
  // Y wears/uses X
  ({ mem, anchor }) => `${mem} wearing the ${anchor} as armor or clothing`,
  // X transforms into Y
  ({ mem, anchor }) => `${anchor} transforming into ${mem}, mid‑morph with visible details`,
  // Y replaces a part of X
  ({ mem, anchor }) => `${anchor} whose surface is covered with ${mem} replacing its normal material`,
  // Y interacting impossibly with X
  ({ mem, anchor }) => `${mem} juggling/spiraling around the ${anchor}, forming a single coherent shape`
];

// Exaggerations to force vividness
const EXAGGERATIONS = [
  'colossal scale',
  'a swarm of thousands forming one shape',
  'gravity‑defying balance',
  'impossibly glossy highlights and deep shadows',
  'golden hour lighting creating a strong silhouette'
];

// Sensory texture/color pairs
const SENSORY_DETAILS = [
  'slick marble sheen and bristly fur texture',
  'wet stone glisten and rough rope fibers',
  'polished metal shine and cracked leather',
  'glowing embers and cold blue shadows',
  'powdery dust motes and oily reflections'
];

// Composition presets for clean single‑subject images
const COMPOSITION = [
  'centered composition, portrait orientation, 35mm lens, low angle, strong silhouette, simple background',
  'medium shot, slight vignette, clean backdrop, subject fully in frame',
  'close‑up hero shot, shallow depth of field, uncluttered environment'
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
  const fullPrompt = `Create a single, high‑contrast image of ${fusion}. Style: ${artStyle}. Composition: ${framing}. Mood: striking and memorable. Details: ${sensory}. Constraint: single focal subject, simple background, no text.`;

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
  generatePrompt
};
