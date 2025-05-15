
import { ImageAnalysis } from './types.ts';

/**
 * Extracts structured data from the GPT analysis
 */
export function extractStructuredData(content: string) {
  try {
    // Extract JSON from the response (in case GPT adds extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error parsing GPT response:', e);
    throw new Error('Failed to parse property analysis');
  }
}
