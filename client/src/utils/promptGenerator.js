// Constants for prompt generation
const ACTION_VERBS = [
    'on',
    'next to',
    'inside',
    'above',
    'below',
    'behind',
    'in front of',
    'around'
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

// Helper function to determine if a term needs figurative representation
const needsFigurativeRepresentation = (term) => {
    // Convert to lowercase for processing
    const lowerTerm = term.toLowerCase();

    // Categories that typically benefit from figurative representation

    // 1. Proper nouns (names, places, etc.)
    const properNouns = ['washington', 'adams', 'jefferson', 'madison', 'monroe',
                         'jackson', 'van buren', 'harrison', 'tyler', 'america',
                         'europe', 'africa', 'asia'];

    // 2. Abstract concepts
    const abstractConcepts = ['freedom', 'love', 'time', 'money', 'justice', 'peace',
                             'happiness', 'sadness', 'anger', 'fear', 'courage',
                             'wisdom', 'knowledge', 'truth', 'beauty', 'democracy'];

    // 3. Complex or technical terms
    const complexTerms = ['photosynthesis', 'democracy', 'philosophy', 'psychology',
                         'mathematics', 'algorithm', 'quantum', 'relativity',
                         'economics', 'infrastructure'];

    // 4. Numbers and dates
    const isNumberOrDate = /\d+/.test(lowerTerm);

    // 5. Multi-word phrases (likely to be complex concepts)
    const isMultiWord = term.includes(' ');

    // 6. Long words (often complex and benefit from breakdown)
    const isLongWord = term.length > 6;

    // Check if the term falls into any of these categories
    if (properNouns.some(noun => lowerTerm.includes(noun)) ||
        abstractConcepts.some(concept => lowerTerm.includes(concept)) ||
        complexTerms.some(term => lowerTerm.includes(term)) ||
        isNumberOrDate ||
        isMultiWord ||
        isLongWord) {
      return true;
    }

    // Categories that are typically better with literal representation

    // 1. Common concrete nouns (everyday objects)
    const concreteNouns = ['apple', 'chair', 'table', 'dog', 'cat', 'house', 'car',
                           'tree', 'flower', 'book', 'pen', 'phone', 'computer',
                           'water', 'food', 'shirt', 'shoe'];

    // 2. Simple adjectives
    const simpleAdjectives = ['red', 'blue', 'green', 'big', 'small', 'hot', 'cold',
                             'fast', 'slow', 'happy', 'sad', 'good', 'bad'];

    // Check if the term is a concrete noun or simple adjective
    if (concreteNouns.some(noun => lowerTerm === noun) ||
        simpleAdjectives.some(adj => lowerTerm === adj)) {
      return false;
    }

    // Default to figurative for anything not explicitly categorized
    return true;
};

const generateFigurativeAssociation = (memorable) => {
    // Convert to lowercase for processing
    const term = memorable.toLowerCase().trim();

    // Common phonetic patterns - fix exact matching
    const phonetics = [
        { pattern: 'washington', replacement: 'a person washing a weight labeled "ton"' },
        { pattern: 'adams', replacement: 'a man wearing a fig leaf (like Adam)' },
        { pattern: 'jefferson', replacement: 'a jar of "Jef" peanut butter' },
        { pattern: 'madison', replacement: 'a mad-looking sun' },
        { pattern: 'monroe', replacement: 'Marilyn Monroe' },
        { pattern: 'jackson', replacement: 'jack playing cards' },
        { pattern: 'van buren', replacement: 'a toy van driving into a small bureau' },
        { pattern: 'harrison', replacement: 'a hairy baby in a small son' },
        { pattern: 'tyler', replacement: 'a person laying tiles' },

        // Common word patterns
        { pattern: 'phone', replacement: 'a foam finger pointing' },
        { pattern: 'cat', replacement: 'a feline' },
        { pattern: 'dog', replacement: 'a canine' },
        { pattern: 'school', replacement: 'a building with a bell and students' },
        { pattern: 'car', replacement: 'an automobile' },
        { pattern: 'book', replacement: 'pages bound together' },
        { pattern: 'key', replacement: 'a metal object that opens locks' },

        // Numbers and dates
        { pattern: '1776', replacement: 'the number 17 next to the number 76' },
        { pattern: '2000', replacement: 'the number 2 followed by three zeros' },

        // Abstract concepts
        { pattern: 'freedom', replacement: 'broken chains' },
        { pattern: 'love', replacement: 'a heart symbol' },
        { pattern: 'time', replacement: 'a clock with animated hands' },
        { pattern: 'money', replacement: 'dollar bills and coins' },

        // Common syllables for creative breakdown
        { pattern: 'ing', replacement: 'a ring with the letter I inside it' },
        { pattern: 'er', replacement: 'the letters E and R' },
        { pattern: 'tion', replacement: 'a weight labeled "ton"' },
        { pattern: 'pre', replacement: 'the letter P followed by "re"' },
        { pattern: 'con', replacement: 'a con artist' },
        { pattern: 'ex', replacement: 'a large X' },
        { pattern: 'pro', replacement: 'a thumbs up sign' },
        { pattern: 'un', replacement: 'the letter U next to letter N' },
    ];

    // Check for exact matches first
    for (const { pattern, replacement } of phonetics) {
        if (term === pattern) {
            console.log(`Exact match found for "${term}": ${replacement}`);
            return replacement;
        }
    }

    // Then check for partial matches
    for (const { pattern, replacement } of phonetics) {
        if (term.includes(pattern)) {
            console.log(`Partial match found for "${term}": ${replacement}`);
            return replacement;
        }
    }

    // If no direct match, try to create a figurative description based on word length
    if (term.length > 6) {
        const firstHalf = term.substring(0, Math.ceil(term.length / 2));
        const secondHalf = term.substring(Math.ceil(term.length / 2));

        return `a visual combination of "${firstHalf}" and "${secondHalf}", possibly ${firstHalf} interacting with ${secondHalf}`;
    }

    // Fallback for words we don't have a specific pattern for
    return `a creative, visual representation of "${memorable}"`;
};

const generatePrompt = (association, setCurrentPrompt) => {
    // Randomly select elements to create variety
    const verb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
    const adjective = DESCRIPTIVE_ADJECTIVES[Math.floor(Math.random() * DESCRIPTIVE_ADJECTIVES.length)];
    const artStyle = ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)];

    // Determine if we should use figurative or literal approach
    const shouldUseFigurative = needsFigurativeRepresentation(association.memorable);

    let description;
    if (shouldUseFigurative) {
        // Use figurative approach
        description = generateFigurativeAssociation(association.memorable);
    } else {
        // Use literal approach
        description = `a ${adjective} ${association.memorable}`;
    }

    // Create the prompt
    const prompt = `${description} ${verb} a ${association.anchor}, ${artStyle}.`;

    // Save a simplified version for display (without art style)
    const displayPrompt = `${description} ${verb} a ${association.anchor}.`;

    // If setCurrentPrompt function is provided, use it to update state
    if (setCurrentPrompt) {
        setCurrentPrompt(displayPrompt);
    }

    return {
        fullPrompt: prompt,
        displayPrompt: displayPrompt
    };
};

// Export everything needed by other components
export {
    ACTION_VERBS,
    DESCRIPTIVE_ADJECTIVES,
    ART_STYLES,
    needsFigurativeRepresentation,
    generateFigurativeAssociation,
    generatePrompt
};
