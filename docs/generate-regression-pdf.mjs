import fs from 'node:fs';
import path from 'node:path';

const inputPath = path.resolve('docs/FullRegressionReport_TindaTrack.html');
const outputPath = path.resolve('docs/FullRegressionReport_TindaTrack.pdf');

const html = fs.readFileSync(inputPath, 'utf8');
const text = html
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<tr>/gi, '\n')
  .replace(/<\/tr>/gi, '\n')
  .replace(/<\/(h1|h2|h3|p|li|pre|td|th)>/gi, '\n')
  .replace(/<li>/gi, '- ')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .split(/\r?\n/)
  .map((line) => line.replace(/\s+/g, ' ').trim())
  .filter(Boolean);

const pageWidth = 612;
const pageHeight = 792;
const margin = 54;
const fontSize = 10;
const lineHeight = 14;
const maxChars = 92;
const usableLines = Math.floor((pageHeight - margin * 2) / lineHeight);

function wrapLine(line) {
  if (line.length <= maxChars) return [line];
  const words = line.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

const lines = text.flatMap((line) => wrapLine(line));
const pages = [];
for (let i = 0; i < lines.length; i += usableLines) {
  pages.push(lines.slice(i, i + usableLines));
}

function pdfEscape(value) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

const objects = [];
function addObject(body) {
  objects.push(body);
  return objects.length;
}

const catalogId = addObject('<< /Type /Catalog /Pages 2 0 R >>');
const pagesId = addObject('');
const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
const pageIds = [];

for (const pageLines of pages) {
  let y = pageHeight - margin;
  const content = [
    'BT',
    `/F1 ${fontSize} Tf`,
    `${margin} ${y} Td`,
  ];
  pageLines.forEach((line, index) => {
    if (index > 0) content.push(`0 -${lineHeight} Td`);
    content.push(`(${pdfEscape(line)}) Tj`);
    y -= lineHeight;
  });
  content.push('ET');

  const stream = content.join('\n');
  const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);
  const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  pageIds.push(pageId);
}

objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

let pdf = '%PDF-1.4\n';
const offsets = [0];
objects.forEach((body, index) => {
  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
});

const xrefOffset = Buffer.byteLength(pdf, 'utf8');
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += '0000000000 65535 f \n';
offsets.slice(1).forEach((offset) => {
  pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
});
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

fs.writeFileSync(outputPath, pdf, 'binary');
console.log(`Generated ${outputPath}`);
