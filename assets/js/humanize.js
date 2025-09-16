// Humanize Text functionality

let humanizeAnalysisResult = null;

// HTML template for humanize tool
function getHumanizeHTML() {
    return `
    <div class="space-y-6">
        <div>
            <label for="text-input" class="block text-sm font-medium text-gray-700 mb-1">Masukkan teks untuk dianalisis:</label>
            <textarea id="text-input" rows="6" class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Tulis atau tempel teks di sini..."></textarea>
        </div>
        
        <div class="flex space-x-4">
            <button id="analyze-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <i class="fas fa-search mr-2"></i>Analyze
            </button>
            <button id="humanize-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                <i class="fas fa-magic mr-2"></i>Humanize
            </button>
        </div>
        
        <div id="analysis-result" class="hidden">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Hasil Analisis</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center mb-4">
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div id="ai-score-bar" class="bg-red-600 h-2.5 rounded-full"></div>
                    </div>
                    <span id="ai-score-text" class="ml-4 text-sm font-medium text-gray-700">0% AI</span>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h4 class="text-sm font-medium text-gray-700">Karakteristik AI Terdeteksi:</h4>
                        <ul id="ai-characteristics" class="mt-2 text-sm text-gray-600 space-y-1"></ul>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-700">Saran Perbaikan:</h4>
                        <ul id="improvement-suggestions" class="mt-2 text-sm text-gray-600 space-y-1"></ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="humanized-result" class="hidden">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Teks yang Dihumanisasi</h3>
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <p id="humanized-text" class="text-gray-800"></p>
            </div>
            <div class="mt-4 flex justify-end">
                <button id="copy-humanized" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <i class="fas fa-copy mr-2"></i>Salin Teks
                </button>
            </div>
        </div>
    </div>
    `;
}

// Initialize humanize tool
function initHumanize() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const humanizeBtn = document.getElementById('humanize-btn');
    const copyBtn = document.getElementById('copy-humanized');
    
    analyzeBtn.addEventListener('click', analyzeText);
    humanizeBtn.addEventListener('click', humanizeText);
    
    if (copyBtn) {
        copyBtn.addEventListener('click', copyHumanizedText);
    }
}

// Analyze text for AI characteristics
function analyzeText() {
    const textInput = document.getElementById('text-input').value.trim();
    
    if (!textInput) {
        alert('Silakan masukkan teks terlebih dahulu!');
        return;
    }
    
    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    
    // Simulate analysis (in a real app, this would be more sophisticated)
    setTimeout(() => {
        humanizeAnalysisResult = analyzeTextForAI(textInput);
        displayAnalysisResult(humanizeAnalysisResult);
        document.getElementById('loading').classList.add('hidden');
    }, 1000);
}

// Analyze text for AI characteristics
function analyzeTextForAI(text) {
    // Heuristic analysis of text
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.length > 0);
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const avgSentenceLength = wordCount / sentenceCount;
    
    // Check for repetition
    const wordFrequency = {};
    words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
        if (cleanWord.length > 3) {
            wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
        }
    });
    
    // Calculate repetition score
    const repetitionScore = Object.values(wordFrequency).reduce((sum, freq) => {
        return sum + (freq > 3 ? 1 : 0);
    }, 0) / Object.keys(wordFrequency).length;
    
    // Check for common AI phrases
    const aiPhrases = [
        'as an ai', 'as a language model', 'as an artificial intelligence',
        'however, it is important to', 'additionally, it is worth noting',
        'moreover, it should be mentioned', 'in conclusion', 'furthermore'
    ];
    
    let aiPhraseCount = 0;
    const lowerText = text.toLowerCase();
    aiPhrases.forEach(phrase => {
        if (lowerText.includes(phrase)) {
            aiPhraseCount++;
        }
    });
    
    // Calculate AI likelihood score (0-100)
    let aiScore = 0;
    
    // Sentence length factor (AI tends to have more uniform sentence lengths)
    if (avgSentenceLength > 15 && avgSentenceLength < 25) {
        aiScore += 20;
    }
    
    // Repetition factor
    aiScore += Math.min(30, repetitionScore * 100);
    
    // AI phrases factor
    aiScore += Math.min(30, aiPhraseCount * 10);
    
    // Entropy factor (AI text often has lower character entropy)
    const entropy = calculateEntropy(text);
    if (entropy < 4) {
        aiScore += 20;
    }
    
    aiScore = Math.min(100, Math.max(0, aiScore));
    
    // Generate characteristics and suggestions
    const characteristics = [];
    const suggestions = [];
    
    if (avgSentenceLength > 15 && avgSentenceLength < 25) {
        characteristics.push('Panjang kalimat cukup konsisten (karakteristik AI)');
        suggestions.push('Variasi panjang kalimat untuk membuatnya lebih alami');
    }
    
    if (repetitionScore > 0.1) {
        characteristics.push('Terdapat pengulangan kata yang cukup tinggi');
        suggestions.push('Gunakan sinonim untuk kata yang diulang');
    }
    
    if (aiPhraseCount > 0) {
        characteristics.push('Mengandung frasa yang umum digunakan AI');
        suggestions.push('Hindari frasa yang terlalu formal dan umum');
    }
    
    if (entropy < 4) {
        characteristics.push('Keragaman karakter rendah');
        suggestions.push('Tambah variasi dalam pemilihan kata dan struktur');
    }
    
    if (characteristics.length === 0) {
        characteristics.push('Teks sudah terlihat cukup alami');
        suggestions.push('Pertahankan gaya penulisan yang sudah baik');
    }
    
    return {
        aiScore,
        characteristics,
        suggestions,
        originalText: text
    };
}

// Calculate text entropy
function calculateEntropy(text) {
    const charCount = {};
    let entropy = 0;
    
    for (let char of text) {
        charCount[char] = (charCount[char] || 0) + 1;
    }
    
    const textLength = text.length;
    for (let char in charCount) {
        const probability = charCount[char] / textLength;
        entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
}

// Display analysis result
function displayAnalysisResult(result) {
    const analysisResult = document.getElementById('analysis-result');
    const aiScoreBar = document.getElementById('ai-score-bar');
    const aiScoreText = document.getElementById('ai-score-text');
    const aiCharacteristics = document.getElementById('ai-characteristics');
    const improvementSuggestions = document.getElementById('improvement-suggestions');
    
    // Set AI score
    const humanScore = 100 - result.aiScore;
    aiScoreBar.style.width = `${result.aiScore}%`;
    aiScoreText.textContent = `${Math.round(result.aiScore)}% AI, ${Math.round(humanScore)}% Human`;
    
    // Set characteristics
    aiCharacteristics.innerHTML = '';
    result.characteristics.forEach(char => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-chevron-right text-red-500 mr-2"></i>${char}`;
        aiCharacteristics.appendChild(li);
    });
    
    // Set suggestions
    improvementSuggestions.innerHTML = '';
    result.suggestions.forEach(sugg => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-lightbulb text-yellow-500 mr-2"></i>${sugg}`;
        improvementSuggestions.appendChild(li);
    });
    
    analysisResult.classList.remove('hidden');
    document.getElementById('humanized-result').classList.add('hidden');
}

// Humanize text using serverless function
function humanizeText() {
    const textInput = document.getElementById('text-input').value.trim();
    
    if (!textInput) {
        alert('Silakan masukkan teks terlebih dahulu!');
        return;
    }
    
    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    
    // Call serverless function to humanize text
    fetch('/api/humanize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textInput })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
            return;
        }
        
        displayHumanizedResult(data.humanizedText);
        document.getElementById('loading').classList.add('hidden');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat memproses teks. Silakan coba lagi.');
        document.getElementById('loading').classList.add('hidden');
    });
}

// Display humanized result
function displayHumanizedResult(text) {
    const humanizedResult = document.getElementById('humanized-result');
    const humanizedText = document.getElementById('humanized-text');
    
    humanizedText.textContent = text;
    humanizedResult.classList.remove('hidden');
}

// Copy humanized text to clipboard
function copyHumanizedText() {
    const humanizedText = document.getElementById('humanized-text').textContent;
    
    navigator.clipboard.writeText(humanizedText)
        .then(() => {
            alert('Teks berhasil disalin!');
        })
        .catch(err => {
            console.error('Gagal menyalin teks: ', err);
            alert('Gagal menyalin teks. Silakan coba manual.');
        });
}

// Export functions for global access
window.getHumanizeHTML = getHumanizeHTML;
window.initHumanize = initHumanize;