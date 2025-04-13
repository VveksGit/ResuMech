import fs from "fs";
import pdf from "pdf-parse";
import { PDFExtract } from "pdf.js-extract";

const cleanText = (text: string): string => {
  return text
    .normalize("NFKD") // Normalize Unicode characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width spaces
    .replace(/[^\x00-\x7F]+/g, " ") // Remove non-ASCII characters
    .replace(/\n\s+/g, "\n") // Remove spaces after newlines
    .replace(/[•●▪■☑✔–—―]/g, "-") // Replace bullet points & dashes with hyphen
    .replace(/[_|]/g, " ") // Remove underscores & pipes
    .replace(/\n{2,}/g, "\n\n") // Reduce multiple newlines to max 2
    .replace(/(\w+)\n(\w+)/g, "$1 $2") // Fix broken words split by newlines
    .replace(/\s{2,}/g, " ") // Remove extra spaces
    .trim(); // Trim extra spaces at the start/end
};

export const extractTextFromPDF = async (
  pdfPath: string
): Promise<string | null> => {
  try {
    console.log("Trying to extract text using pdf-parse...");
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const extractedText = data.text.trim();

    if (extractedText.length > 0) {
      console.log("Extracted text using pdf-parse");
      return cleanText(extractedText);
    }

    console.log("No text found in pdf-parse. Trying pdf.js-extract...");

    // Try an alternative extraction method
    const pdfExtract = new PDFExtract();
    const extractResult = await pdfExtract.extract(pdfPath);

    // Combine all text from all pages
    const altText = extractResult.pages
      .map((page) => page.content.map((item) => item.str).join(" "))
      .join("\n");

    if (altText.trim().length > 0) {
      console.log("Extracted text using pdf.js-extract");
      return cleanText(altText);
    }

    console.log("No text found in this PDF. It may be image-based or scanned.");
    return null;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return null;
  }
};

// Enhanced function with additional diagnostics
export const extractText = async (pdfPath: string): Promise<string | null> => {
  try {
    // Basic PDF validation
    if (!fs.existsSync(pdfPath)) {
      console.error("PDF file does not exist:", pdfPath);
      return null;
    }

    const stats = fs.statSync(pdfPath);
    if (stats.size === 0) {
      console.error("PDF file is empty:", pdfPath);
      return null;
    }

    console.log(`Processing PDF: ${pdfPath} (${stats.size} bytes)`);

    // Attempt text extraction
    const extractedText = await extractTextFromPDF(pdfPath);

    if (extractedText) {
      console.log(
        `Successfully extracted ${extractedText.length} characters of text`
      );
      return extractedText;
    } else {
      console.log(
        "Text extraction failed. This PDF may be image-based or scanned."
      );
      return null;
    }
  } catch (error) {
    console.error("Unexpected error during extraction:", error);
    return null;
  }
};
