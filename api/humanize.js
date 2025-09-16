// Vercel serverless function for text humanization

// You can use OpenAI, HuggingFace, or any other API here
// For this example, we'll use a simple synonym replacement approach

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        // Simple humanization using synonym replacement and sentence variation
        const humanizedText = await humanizeText(text);
        
        return res.status(200).json({ humanizedText });
    } catch (error) {
        console.error('Humanize error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Simple text humanization function
async function humanizeText(text) {
    // This is a simplified version - in a real application, you would use
    // a proper API like OpenAI or HuggingFace
    
    // Common AI phrases to replace
    const aiPhrases = {
        'as an ai': 'as a person',
        'as a language model': 'from my perspective',
        'as an artificial intelligence': 'in my experience',
        'however, it is important to': 'it is worth considering that',
        'additionally, it is worth noting': 'also,',
        'moreover, it should be mentioned': 'further,',
        'in conclusion': 'to sum up',
        'furthermore': 'additionally'
    };
    
    // Common word synonyms
    const synonyms = {
        'utilize': 'use',
        'facilitate': 'help',
        'implement': 'put in place',
        'optimize': 'improve',
        'leverage': 'use',
        'paradigm': 'model',
        'synergy': 'collaboration',
        'robust': 'strong',
        'streamline': 'simplify',
        'enhance': 'improve'
    };
    
    let humanized = text;
    
    // Replace AI phrases
    for (const [phrase, replacement] of Object.entries(aiPhrases)) {
        const regex = new RegExp(phrase, 'gi');
        humanized = humanized.replace(regex, replacement);
    }
    
    // Replace words with synonyms
    for (const [word, synonym] of Object.entries(synonyms)) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        humanized = humanized.replace(regex, synonym);
    }
    
    // Vary sentence structure slightly
    const sentences = humanized.split(/(?<=[.!?])\s+/);
    
    if (sentences.length > 2) {
        // Occasionally combine short sentences
        for (let i = 0; i < sentences.length - 1; i++) {
            if (sentences[i].length < 50 && sentences[i + 1].length < 50 && Math.random() > 0.7) {
                sentences[i] = sentences[i] + ' ' + sentences[i + 1].toLowerCase();
                sentences.splice(i + 1, 1);
            }
        }
        
        // Occasionally split long sentences
        for (let i = 0; i < sentences.length; i++) {
            if (sentences[i].length > 100 && sentences[i].includes(',') && Math.random() > 0.5) {
                const parts = sentences[i].split(',');
                if (parts.length >= 2) {
                    const firstPart = parts[0] + '.';
                    const secondPart = parts.slice(1).join(',').trim();
                    sentences[i] = firstPart;
                    sentences.splice(i + 1, 0, secondPart);
                }
            }
        }
    }
    
    humanized = sentences.join(' ');
    
    return humanized;
}