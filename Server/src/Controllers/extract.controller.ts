import fs from "fs";
import pdf from "pdf-parse";
import { fromPath as pdfToImage } from "pdf2pic";
import Tesseract from "tesseract.js";

const cleanText = (text: string): string => {
  return text
    .replace(/\n\s+/g, "\n") // Remove spaces after newlines
    .replace(/•|/g, "-") // Replace bullet symbols with a hyphen
    .replace(/\n{2,}/g, "\n\n") // Ensure only one blank line between sections
    .replace(/(\w+)\n(\w+)/g, "$1 $2") // Fix broken words split by a newline
    .trim(); // Trim extra spaces at the start/end
};

export const extractTextFromPDF = async (
  pdfPath: string
): Promise<string | null> => {
  console.log("Trying to extract text using pdf-parse..");

  const dataBuffer = fs.readFileSync(pdfPath); // Reads the PDF file and stores it as a buffer (Binary Format). The file is NOT converted, just loaded into memory as raw binary data.

  const data = await pdf(dataBuffer); // Processes the buffer data using pdf-parse. Extracts the text content from the PDF (if it is text-based).

  const extractedText = data.text.trim(); // Removes extra spaces from the extracted text.

  if (extractedText.length > 0) {
    console.log("Extracted text using pdf-parse");
    return cleanText(extractedText);
  }
  console.log("No text found in pdf-parse. Switching to OCR... ");
  return null;
};

export const extractedTextFromImage = async (
  pdfPath: string
): Promise<string | null> => {
  console.log("Converting PDF to images for OCR...");

  const converter = pdfToImage(pdfPath, {
    density: 300,
    saveFilename: "page",
    savePath: "../../public/images",
    format: "png",
    width: 1000,
    height: 1200,
  });

  try {
    const result = await converter(1);
    if (!result.path) {
      console.log("failed to convert pdf to image");
      throw Error;
    }
    const ocrResult = await Tesseract.recognize(result.path, "eng");

    const extractedText = ocrResult.data.text.trim();

    if (extractedText.length > 0) {
      console.log("Extracted text using OCR.");
      return cleanText(extractedText);
    } else {
      console.log("OCR extraction failed.");
      return null;
    }
  } catch (error) {
    console.error("Error during OCR:", error);
    return null;
  }
};

export const extractText = async (pdfPath: string): Promise<string | null> => {
  let extractedText = await extractTextFromPDF(pdfPath);

  if (!extractedText) {
    extractedText = await extractedTextFromImage(pdfPath);
  }

  return extractedText;
};
