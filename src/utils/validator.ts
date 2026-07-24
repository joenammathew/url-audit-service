import { z } from 'zod';

// Validation rules
const urlSchema = z.object({
  url: z
    .string()
    .url({ message: 'Invalid URL format' })
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      { message: 'URL must start with http:// or https://' }
    )
});

// Function to check URL
export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    urlSchema.parse({ url });
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Invalid URL' };
  }
}