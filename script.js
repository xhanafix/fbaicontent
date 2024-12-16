// Constants
const STORAGE_KEY = 'openrouter_api_key';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const SITE_URL = window.location.origin;
const SITE_NAME = 'Facebook Content Generator';
const GENERATION_STEPS = 5; // Total number of steps in generation process
let currentProgress = 0;

// Load API key from localStorage when page loads
document.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem(STORAGE_KEY);
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleButton(savedTheme);

    // Add theme toggle listener
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
});

// Save API key to localStorage
function saveApiKey() {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (apiKey) {
        localStorage.setItem(STORAGE_KEY, apiKey);
        alert('API key saved successfully!');
    } else {
        alert('Please enter a valid API key');
    }
}

// Theme toggle function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleButton(newTheme);
}

function updateThemeToggleButton(theme) {
    const button = document.getElementById('themeToggle');
    button.textContent = theme === 'light' ? '🌙' : '☀️';
}

// Add this function to get language-specific guidelines
function getLanguageGuidelines(language) {
    return language === 'malay' ? 
        '- Tulis dalam Bahasa Malaysia yang formal dan tepat\n- Gunakan tatabahasa yang betul\n- Masukkan kata-kata tempatan yang sesuai\n' :
        '- Write in clear, grammatically correct English\n- Use appropriate language and expressions\n';
}

// Update the getToneSpecificPrompt function to include language selection
function getToneSpecificPrompt(tone, productDescription, language) {
    const basePrompt = `Write a Facebook post for the following product/service: ${productDescription}\n\n`;
    const languageGuideline = getLanguageGuidelines(language);
    
    const tonePrompts = {
        professional: `${basePrompt}
Guidelines:
${languageGuideline}
- Use a professional and authoritative tone
- Focus on credibility and expertise
- Highlight value propositions and benefits
- Maintain a formal yet approachable voice
- Include relevant industry statistics or facts when possible
- End with a professional call-to-action
- Add appropriate business-focused hashtags
${language === 'malay' ? '\nSila hasilkan kandungan dalam Bahasa Malaysia.' : ''}`,

        casual: `${basePrompt}
Guidelines:
${languageGuideline}
- Use a friendly, conversational tone
- Write as if talking to a friend
- Include relatable everyday situations
- Use casual language and expressions
- Keep it light and engaging
- Add emoji where appropriate 😊
- End with a casual, inviting call-to-action
- Use fun, trendy hashtags
${language === 'malay' ? '\nSila hasilkan kandungan dalam Bahasa Malaysia.' : ''}`,

        humorous: `${basePrompt}
Guidelines:
${languageGuideline}
- Use witty and entertaining language
- Include clever wordplay or puns
- Reference popular culture when relevant
- Keep the humor appropriate for all audiences
- Balance humor with product information
- Use playful emoji 😄
- End with a fun call-to-action
- Add humorous yet relevant hashtags
${language === 'malay' ? '\nSila hasilkan kandungan dalam Bahasa Malaysia.' : ''}`,

        inspirational: `${basePrompt}
Guidelines:
${languageGuideline}
- Use uplifting and motivational language
- Share transformative stories or possibilities
- Focus on personal growth and achievement
- Include inspiring quotes or insights
- Create an emotional connection
- Use empowering words
- End with an inspiring call-to-action
- Add motivational hashtags
${language === 'malay' ? '\nSila hasilkan kandungan dalam Bahasa Malaysia.' : ''}`,

        storytelling: `${basePrompt}
Guidelines:
${languageGuideline}
- Create a narrative arc with beginning, middle, and end
- Include character development and conflict resolution
- Use descriptive language and vivid imagery
- Build emotional connection through relatable scenarios
- Weave the product naturally into the story
- End with a story-driven call-to-action
- Add storytelling-related hashtags
${language === 'malay' ? '\nSila hasilkan kandungan dalam Bahasa Malaysia.' : ''}`
    };

    return tonePrompts[tone] || tonePrompts.professional;
}

// Generate content using the API
async function generateContent() {
    const apiKey = localStorage.getItem(STORAGE_KEY);
    if (!apiKey) {
        alert('Please save your API key first');
        return;
    }

    const productDescription = document.getElementById('productDescription').value.trim();
    if (!productDescription) {
        alert('Please enter a product or service description');
        return;
    }

    const loadingSpinner = document.getElementById('loadingSpinner');
    const outputContent = document.getElementById('outputContent');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progressText');
    
    loadingSpinner.classList.remove('hidden');
    progressContainer.classList.remove('hidden');
    outputContent.textContent = '';
    currentProgress = 0;
    updateProgress(0);

    try {
        updateProgress(20);
        
        // Get selected tone and language
        const selectedTone = document.querySelector('input[name="tone"]:checked').value;
        const selectedLanguage = document.querySelector('input[name="language"]:checked').value;
        const prompt = getToneSpecificPrompt(selectedTone, productDescription, selectedLanguage);

        updateProgress(40);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': SITE_URL,
                'X-Title': SITE_NAME,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/learnlm-1.5-pro-experimental:free',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        updateProgress(60); // Received response

        const data = await response.json();
        updateProgress(80); // Processing response
        
        if (data.choices && data.choices[0]) {
            outputContent.textContent = data.choices[0].message.content;
            updateProgress(100); // Complete
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        outputContent.textContent = `Error: ${error.message}`;
        updateProgress(100);
    } finally {
        loadingSpinner.classList.add('hidden');
        setTimeout(() => {
            progressContainer.classList.add('hidden');
        }, 1000);
    }
}

function updateProgress(percentage) {
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
}

// Copy generated content to clipboard
function copyContent() {
    const outputContent = document.getElementById('outputContent');
    const content = outputContent.textContent;
    
    if (content) {
        navigator.clipboard.writeText(content)
            .then(() => alert('Content copied to clipboard!'))
            .catch(err => alert('Failed to copy content: ' + err));
    } else {
        alert('No content to copy');
    }
}
  