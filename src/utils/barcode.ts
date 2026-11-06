// Code 39 Barcode Generator for Teacher NIP and IDs
// Code 39 standard: 9 elements per character (5 bars, 4 spaces: 3 wide, 6 narrow)

export const CODE39_PATTERNS: Record<string, string> = {
  '0': 'bwbwBwBwb',
  '1': 'BwbwbwBwb',
  '2': 'bwBwbwBwb',
  '3': 'BwBwbwbwb',
  '4': 'bwbwBwbwb',
  '5': 'BwbwBwbwb',
  '6': 'bwBwBwbwb',
  '7': 'bwbwbwBwB',
  '8': 'BwbwbwBwb',
  '9': 'bwBwbwBwb',
  'A': 'BwbwbwbwB',
  'B': 'bwBwbwbwB',
  'C': 'BwBwbwbwb',
  'D': 'bwbwBwbwB',
  'E': 'BwbwBwbwb',
  'F': 'bwBwBwbwb',
  'G': 'bwbwbwBwB',
  'H': 'BwbwbwBwb',
  'I': 'bwBwbwBwb',
  'J': 'bwbwBwBwb',
  'K': 'Bwbwbwbwb',
  'L': 'bwBwbwbwb',
  'M': 'BwBwbwbwb',
  'N': 'bwbwBwbwb',
  'O': 'BwbwBwbwb',
  'P': 'bwBwBwbwb',
  'Q': 'bwbwbwbwB',
  'R': 'Bwbwbwbwb',
  'S': 'bwBwbwbwb',
  'T': 'bwbwBwbwb',
  'U': 'BwBwbwbwb',
  'V': 'bwBwBwbwb',
  'W': 'BwBwBwbwb',
  'X': 'bwBwbwBwb',
  'Y': 'BwBwbwBwb',
  'Z': 'bwBwBwBwb',
  '-': 'bWbwbwbwB',
  '.': 'BwBwbwbwb',
  ' ': 'bWBwbwbwb',
  '$': 'bWbWbWbwb',
  '/': 'bWbWbwbWb',
  '+': 'bWbwbWbWb',
  '%': 'bwbWbWbWb',
  '*': 'bWbwBwBwb' // Asterisk is the start/stop sentinel delimiter
};

/**
 * Sanitizes input string to ensure all characters are valid for Code 39 barcode encoding.
 * Replaces invalid characters with hyphens or strips them.
 */
export function sanitizeForBarcode(input: string): string {
  if (!input) return '0';
  const upper = input.toUpperCase().trim();
  const cleaned = upper.replace(/[^0-9A-Z\-\. \$\/\+\%]/g, '');
  return cleaned.length > 0 ? cleaned : '0';
}

/**
 * Formats a raw 18-digit Indonesian NIP into official spacing:
 * Format: YYYYMMDD YYYYMM G NNN (e.g. 19850315 201001 1 008)
 */
export function formatNip(rawNip: string): string {
  if (!rawNip) return '-';
  const digits = rawNip.replace(/\D/g, '');
  if (digits.length === 18) {
    return `${digits.slice(0, 8)} ${digits.slice(8, 14)} ${digits.slice(14, 15)} ${digits.slice(15, 18)}`;
  }
  return rawNip.trim();
}

export interface BarcodeElement {
  x: number;
  width: number;
  isBar: boolean;
}

export interface BarcodeResult {
  elements: BarcodeElement[];
  totalWidth: number;
  encodedText: string;
}

/**
 * Encodes text into a Code 39 bar/space sequence.
 * Narrow element = narrowWidth, Wide element = narrowWidth * wideRatio.
 */
export function generateBarcodeElements(
  text: string,
  narrowWidth: number = 2,
  wideRatio: number = 2.5,
  quietZone: number = 10
): BarcodeResult {
  const sanitized = sanitizeForBarcode(text);
  const fullText = `*${sanitized}*`; // Add start/stop delimiters

  const elements: BarcodeElement[] = [];
  let currentX = quietZone;

  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['-'];

    for (let p = 0; p < pattern.length; p++) {
      const symbol = pattern[p];
      const isBar = symbol === 'b' || symbol === 'B';
      const isWide = symbol === 'B' || symbol === 'W';
      const width = isWide ? narrowWidth * wideRatio : narrowWidth;

      if (isBar) {
        elements.push({
          x: currentX,
          width,
          isBar: true
        });
      }
      currentX += width;
    }

    // Inter-character narrow space (except after last character)
    if (i < fullText.length - 1) {
      currentX += narrowWidth;
    }
  }

  const totalWidth = currentX + quietZone;

  return {
    elements,
    totalWidth,
    encodedText: sanitized
  };
}
