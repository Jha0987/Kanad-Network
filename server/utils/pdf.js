export const buildSimplePdf = (textContent) => {
  const header = '%PDF-1.3\n';
  const lines = textContent.replace(/\r/g, '').split('\n');
  const body = lines.map((line, idx) => `BT /F1 11 Tf 50 ${780 - idx * 14} Td (${line.replace(/[()]/g, '')}) Tj ET`).join('\n');

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${body.length} >> stream\n${body}\nendstream endobj`
  ];

  let offset = header.length;
  const xref = ['0000000000 65535 f '];
  const content = objects
    .map((obj) => {
      const entry = `${String(offset).padStart(10, '0')} 00000 n `;
      xref.push(entry);
      offset += `${obj}\n`.length;
      return `${obj}\n`;
    })
    .join('');

  const xrefOffset = header.length + content.length;
  const trailer = `xref\n0 ${xref.length}\n${xref.join('\n')}\ntrailer << /Size ${xref.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(`${header}${content}${trailer}`);
};
