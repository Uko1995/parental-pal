export function buildDownloadDocumentHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111; padding: 24px; }
    img { max-width: 80px; height: auto; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export function downloadHtmlDocument(
  filename: string,
  title: string,
  bodyHtml: string,
): void {
  const html = buildDownloadDocumentHtml(title, bodyHtml);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".html") ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
