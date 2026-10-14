export function pdfFilename(filename: string): string {
  const base = filename.replace(/\.(html|pdf)$/i, "");
  return `${base}.pdf`;
}

export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
  });
  const image = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const imageWidth = pageWidth - margin * 2;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = margin;

  pdf.addImage(image, "JPEG", margin, position, imageWidth, imageHeight);
  heightLeft -= pageHeight - margin * 2;

  while (heightLeft > 0) {
    position = margin - (imageHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(image, "JPEG", margin, position, imageWidth, imageHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  pdf.save(pdfFilename(filename));
}
