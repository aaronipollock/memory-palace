import axios from 'axios'

const wordCache = {};

export const checkWordConcreteness = async (word) => {
    const normalizedWord = word.toLowerCase().trim();

    if(wordCache[normalizedWord] !== undefined) {
        return wordCache[normalizedWord];
    }

    try {
        const response = await axios.get(`/api/word-concreteness/${normalizedWord}`);

        const isConcrete = response.data.isConcrete;

        wordCache[normalizedWord] = isConcrete;

        return isConcrete;
    } catch (error) {
        console.error('Word concreteness API error:', error);
        return null;
    }
};
