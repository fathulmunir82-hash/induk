import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeForBarcode, formatNip, generateBarcodeElements } from './barcode';

test('sanitizeForBarcode handles standard NIP with spaces and hyphens', () => {
  const result = sanitizeForBarcode('19850315 201001 1 008');
  assert.equal(result, '19850315 201001 1 008');
});

test('sanitizeForBarcode handles lowercase letters and strips invalid characters', () => {
  const result = sanitizeForBarcode('nip_#12345!');
  assert.equal(result, 'NIP12345');
});

test('sanitizeForBarcode falls back to 0 on empty input', () => {
  assert.equal(sanitizeForBarcode(''), '0');
  assert.equal(sanitizeForBarcode('   '), '0');
});

test('formatNip formats 18-digit Indonesian NIP correctly', () => {
  const formatted = formatNip('198503152010011008');
  assert.equal(formatted, '19850315 201001 1 008');
});

test('formatNip preserves already formatted NIP or non-18-digit IDs', () => {
  assert.equal(formatNip('19850315 201001 1 008'), '19850315 201001 1 008');
  assert.equal(formatNip('GURU-HONOR-01'), 'GURU-HONOR-01');
});

test('generateBarcodeElements produces valid bars and dimensions', () => {
  const { elements, totalWidth, encodedText } = generateBarcodeElements('19850315', 2, 2.5, 10);
  
  assert.equal(encodedText, '19850315');
  assert.ok(elements.length > 0, 'Barcode elements should not be empty');
  assert.ok(totalWidth > 100, 'Total width should be greater than initial quiet zone');

  // Verify all bar elements are positive and within totalWidth
  for (const bar of elements) {
    assert.equal(bar.isBar, true);
    assert.ok(bar.width > 0, 'Bar width must be positive');
    assert.ok(bar.x >= 10, 'Bar x must start at or after quiet zone');
    assert.ok(bar.x + bar.width <= totalWidth, 'Bar must not exceed total width');
  }
});
