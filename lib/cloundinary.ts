/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { PDFDocument } from 'pdf-lib';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { Readable } from 'stream';
import path from 'path';
import fs from "fs";
import { convert } from 'pdf-poppler';
import archiver from 'archiver';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const SUPPORTED_FILE_FORMATS = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'tiff', 'heif'];
export const PDF_CONVERSION_SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png'];
export const DOC_CONVERSION_SUPPORTED_FORMATS = ['pdf', 'doc', 'docx'];

export const uploadFileString = async (file: string) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const uploadFile = async (file: File) => {
  try {
    console.log('Starting file upload...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('File converted to buffer, size:', buffer.length);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      console.log('Creating upload stream...');
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'auto',
          folder: 'uploads' // Optional: specify a folder in Cloudinary
        },
        (error, result) => {
          if (error) {
            console.error('Upload stream error:', error);
            reject(error);
          } else {
            console.log('Upload successful:', result);
            resolve(result);
          }
        }
      );

      console.log('Piping buffer to upload stream...');
      const readable = Readable.from(buffer);
      readable.pipe(uploadStream);
      
      // Handle stream errors
      readable.on('error', (error) => {
        console.error('Readable stream error:', error);
        reject(error);
      });
      
      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(error);
      });
    });

    if (!uploadResult) {
      throw new Error('Upload result is undefined');
    }

    // console.log('Upload completed successfully:', uploadResult);
    return uploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const convertFile = async (publicId: string, format: string) => {
  try {
    const result = await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      format,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary conversion error:', error);
    throw error;
  }
};

export const deleteFile = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

export const generatePdfFromImage = async (uploadResult: UploadApiResponse) => {
  try {
    const imageUrl = uploadResult.secure_url;
    const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.create();
    const imageFormat = uploadResult.format.toLowerCase();

    let image;
    if (imageFormat === 'jpg' || imageFormat === 'jpeg') {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (imageFormat === 'png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else if (imageFormat === 'webp') {
      // Convert WebP to PNG first
      const webpBuffer = await fetch(imageUrl).then(res => res.buffer());
      const pngBuffer = await sharp(webpBuffer).toFormat('png').toBuffer();
      image = await pdfDoc.embedPng(pngBuffer);
    } else {
      throw new Error(`Unsupported image format: ${imageFormat}`);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0 });
    const pdfBytes = await pdfDoc.save();

    const uploadPdfResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', public_id: `generated_pdf_${Date.now()}.pdf` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(pdfBytes);
    });

    return uploadPdfResult;
  } catch (error) {
    console.error('Error generating and uploading PDF:', error);
    throw new Error('Failed to generate and upload PDF');
  }
};

export const convertImage = async (uploadResult: UploadApiResponse, targetFormat: string) => {
  try {
    if (!SUPPORTED_IMAGE_FORMATS.includes(targetFormat.toLowerCase())) {
      throw new Error(`Unsupported target format: ${targetFormat}`);
    }

    const imageUrl = uploadResult.secure_url;
    const imageBuffer = await fetch(imageUrl).then((res) => res.buffer());
    const imageMetadata = await sharp(imageBuffer).metadata();
    const sourceFormat = imageMetadata.format;

    if (!sourceFormat || !SUPPORTED_IMAGE_FORMATS.includes(sourceFormat)) {
      throw new Error(`Unsupported source image format: ${sourceFormat}`);
    }

    if (sourceFormat === targetFormat.toLowerCase()) {
      return uploadResult;
    }

    const convertedImageBuffer = await sharp(imageBuffer)
      .toFormat(targetFormat.toLowerCase() as any)
      .toBuffer();

    const uploadImageResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image', public_id: `converted_image_${Date.now()}.${targetFormat}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(convertedImageBuffer);
    });

    return uploadImageResult;
  } catch (error) {
    console.error('Error converting and uploading image:', error);
    throw new Error('Failed to convert and upload image');
  }
};

interface PdfToImageOptions {
  format?: 'jpeg' | 'png';
  scale?: number;
}

export const convertPdfToImages = async (uploadResult: UploadApiResponse, options?: PdfToImageOptions): Promise<UploadApiResponse[]> => {
  try {
    const pdfUrl = uploadResult.secure_url;
    const pdfBuffer = await fetch(pdfUrl).then(res => res.buffer());
    
    // Create a temporary directory for processing
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempPdfPath = path.join(tempDir, `temp_pdf_${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    const outputDir = path.join(tempDir, `output_${Date.now()}`);
    fs.mkdirSync(outputDir);

    const opts = {
      format: options?.format || 'jpeg',
      out_dir: outputDir,
      out_prefix: 'page',
      scale: options?.scale || 1024,
    };

    await convert(tempPdfPath, opts);

    // Collect and upload all generated images
    const imageFiles = fs.readdirSync(outputDir)
      .filter(file => file.startsWith('page'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });

    const uploadedImages = await Promise.all(
      imageFiles.map(async (file) => {
        const filePath = path.join(outputDir, file);
        const imageBuffer = fs.readFileSync(filePath);
        
        const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', public_id: `pdf_page_${Date.now()}_${file}` },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as UploadApiResponse);
            }
          );
          uploadStream.end(imageBuffer);
        });

        // Clean up the temporary file
        fs.unlinkSync(filePath);
        return uploadResult;
      })
    );

    // Clean up temporary directory
    fs.rmdirSync(outputDir);
    fs.unlinkSync(tempPdfPath);

    return uploadedImages;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw new Error('Failed to convert PDF to images');
  }
};

export const convertDocument = async (uploadResult: UploadApiResponse, targetFormat: string) => {
  try {
    if (!DOC_CONVERSION_SUPPORTED_FORMATS.includes(targetFormat.toLowerCase())) {
      throw new Error(`Unsupported document format: ${targetFormat}`);
    }

    // For document conversions, we'll use Cloudinary's raw file handling
    const result = await cloudinary.uploader.explicit(uploadResult.public_id, {
      type: 'upload',
      format: targetFormat.toLowerCase(),
      resource_type: 'raw'
    });

    return result;
  } catch (error) {
    console.error('Error converting document:', error);
    throw new Error('Failed to convert document');
  }
};

export const createZip = async (files: string[], zipPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    for (const file of files) {
      archive.file(file, { name: path.basename(file) });
    }
    archive.finalize();
  });
};

export default cloudinary;