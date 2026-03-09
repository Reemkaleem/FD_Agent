import fetch from 'node-fetch';
import { buildPrompt } from '../utils/prompts.js';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = 'phi3:mini';

/**
 * Check if Ollama is running
 */
export async function checkOllamaStatus() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      return { running: true, models: data.models };
    }
    return { running: false };
  } catch (error) {
    return { running: false, error: error.message };
  }
}

/**
 * Call Ollama API to generate React code
 */
export async function generateReactCode(simplifiedDesign, outputFormat = 'tsx') {
  // Check if Ollama is running
  const status = await checkOllamaStatus();
  if (!status.running) {
    throw new Error(
      '❌ Ollama is not running!\n\n' +
      'Please start Ollama in a separate terminal:\n' +
      '  > ollama serve\n\n' +
      'Or if already running, check it\'s accessible at: ' + OLLAMA_URL
    );
  }

  // Build the prompt
  const prompt = buildPrompt(simplifiedDesign, outputFormat);
  
  console.log('📝 Sending request to Ollama...');
  console.log(`   Model: ${MODEL}`);
  console.log(`   Design: ${simplifiedDesign.name}`);

  // Call Ollama API
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,  // Lower = more consistent
        num_predict: 2048, // Max tokens
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${error}`);
  }

  const result = await response.json();
  const generatedText = result.response;

  console.log('✅ AI response received');
  console.log(`   Tokens: ${result.eval_count || 'unknown'}`);

  // Extract code from response (remove markdown markers if present)
  const code = extractCode(generatedText);

  return code;
}

/**
 * Extract actual code from LLM response
 * Removes markdown code blocks, explanations, etc.
 */
function extractCode(text) {
  // Remove markdown code blocks
  let code = text.replace(/```typescript\n?/g, '').replace(/```tsx\n?/g, '').replace(/```\n?/g, '');
  
  // Try to find React component (starts with import or interface/function)
  const componentMatch = code.match(/(import.*?[\s\S]*?export.*?})/);
  if (componentMatch) {
    code = componentMatch[1];
  }

  // Clean up
  code = code.trim();

  // If code looks invalid, return original with warning comment
  if (!code.includes('export') && !code.includes('function')) {
    return `// ⚠️ AI generated unexpected output. Here's the raw response:\n\n${text}`;
  }

  return code;
}
