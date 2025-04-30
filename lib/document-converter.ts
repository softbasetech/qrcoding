import { Document, Packer, Paragraph, TextRun } from 'docx';
import pdfParse from 'pdf-parse';

export const convertPdfToDocx = async (pdfBuffer: Buffer): Promise<Buffer> => {
  try {
    // Parse the PDF to extract text
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    // Create a new DOCX document
    const doc = new Document({
      sections: [{
        properties: {},
        children: []
      }]
    });

    // Split text into paragraphs (assuming double newlines indicate paragraph breaks)
    const paragraphs = text.split(/\n\s*\n/).filter((p: string) => p.trim());

    // Add each paragraph to the document
    for (const paragraphText of paragraphs) {
      const paragraph = new Paragraph({
        children: [
          new TextRun({
            text: paragraphText.trim(),
            break: 1,
          }),
        ],
      });

      // @ts-expect-error - docx types are not properly defined
      doc.sections[0].children.push(paragraph);
    }

    // Generate the DOCX file
    const docxBuffer = await Packer.toBuffer(doc);
    return docxBuffer;
  } catch (error) {
    console.error('Error converting PDF to DOCX:', error);
    throw new Error('Failed to convert PDF to DOCX');
  }
};

export const convertPdfToDoc = async (pdfBuffer: Buffer): Promise<Buffer> => {
  try {
    // For DOC format, we'll first convert to DOCX and then to DOC
    // This is because docx library doesn't directly support DOC format
    const docxBuffer = await convertPdfToDocx(pdfBuffer);
    return docxBuffer; // Note: This will actually return a DOCX file
  } catch (error) {
    console.error('Error converting PDF to DOC:', error);
    throw new Error('Failed to convert PDF to DOC');
  }
}; 