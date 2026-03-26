export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    await parser.destroy();
    return result.text || "";
  } catch {
    // Fallback: return raw text extraction attempt
    const text = Buffer.from(buffer).toString("utf8");
    // Filter out binary garbage, keep readable text
    return text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n");
  }
}
