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

// A balanced approach that works reasonably well without extensive lists
const needsFigurativeRepresentation = (term) => {
    // Convert to lowercase for processing
    const lowerTerm = term.toLowerCase().trim();

    // Quick check for common concrete objects (just a small core list)
    const commonConcreteObjects = ['apple', 'dog', 'cat', 'car', 'house', 'book', 'tree', 'water'];
    if (commonConcreteObjects.some(obj => lowerTerm === obj)) {
        return false;
    }

    // Use these simple heuristics:

    // 1. Single-word vs multi-word
    const isMultiWord = lowerTerm.includes(' ');

    // 2. Word length (shorter words tend to be more concrete)
    const isLongWord = lowerTerm.length > 6;

    // 3. Contains numbers
    const containsNumbers = /\d/.test(lowerTerm);

    // 4. Common abstract suffixes
    const hasAbstractSuffix = ['tion', 'sion', 'ment', 'ness', 'ity'].some(suffix =>
        lowerTerm.endsWith(suffix)
    );

    // Combine heuristics - if any suggest abstraction, use figurative approach
    return isMultiWord || isLongWord || containsNumbers || hasAbstractSuffix;
};

const splitIntoSyllables = (word) => {
    // This is a simplified syllable splitting algorithm
    // More sophisticated versions exist but require larger libraries

    word = word.toLowerCase();

    // Define vowels
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];

    // Find syllable boundaries
    const syllables = [];
    let currentSyllable = '';
    let hasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      currentSyllable += char;

      // Check if current character is a vowel
      if (vowels.includes(char)) {
        hasVowel = true;
      }

      // Check if we should end the current syllable
      // Basic rule: after a vowel followed by a consonant
      if (hasVowel &&
          i < word.length - 1 &&
          !vowels.includes(char) &&
          vowels.includes(word[i+1])) {
        syllables.push(currentSyllable);
        currentSyllable = '';
        hasVowel = false;
      }
    }

    // Add the last syllable
    if (currentSyllable) {
      syllables.push(currentSyllable);
    }

    // Handle edge cases
    if (syllables.length === 0) {
      return [word]; // Return the whole word if no syllables found
    }

    return syllables;
};

const generateFigurativeAssociation = (memorable) => {
    const term = memorable.toLowerCase().trim();

    // For multi-word terms, create a scene with the parts
    if (term.includes(' ')) {
        const parts = term.split(' ');
        return `a scene showing ${parts.join(' and ')}`;
    }

    // For longer single words, use syllable-based approach
    if (term.length > 6) {
        const syllables = splitIntoSyllables(term);

        // If we have multiple syllables, create a scene with them
        if (syllables.length > 1) {
            return `a scene showing ${syllables.join(' and ')}`;
        }
    }

    // Fallback for anything else
    return `a visual representation of "${term}"`;
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
    splitIntoSyllables,
    generateFigurativeAssociation,
    generatePrompt
};
