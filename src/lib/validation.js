import { PROVIDERS } from './constants.js';

export function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }
  if (prompt.length > 4096) {
    throw new Error('Prompt exceeds maximum length of 4096 characters');
  }
  return prompt.trim();
}
