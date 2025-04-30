/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FileConversion from "@/lib/models/FileConversion";
import { convertImage, convertPdfToImages, deleteFile, generatePdfFromImage, PDF_CONVERSION_SUPPORTED_FORMATS, SUPPORTED_IMAGE_FORMATS, uploadFile, convertDocument, DOC_CONVERSION_SUPPORTED_FORMATS } from "@/lib/cloundinary";
import dbConnect from "@/lib/db";
import fetch from "node-fetch";
import { convertPdfToDocx, convertPdfToDoc } from '@/lib/document-converter';
import { Readable } from 'stream';
import cloudinary from '@/lib/cloundinary';
// import { v4 as uuidv4 } from 'uuid';

const DAILY_LIMIT = 5;
const GUEST_EXPIRY_HOURS = 24;

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Check daily limit for non-authenticated users
    if (!session) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const conversionsToday = await FileConversion.countDocuments({
        ipAddress: ip,
        createdAt: { $gte: today },
      });

      if (conversionsToday >= DAILY_LIMIT) {
        return NextResponse.json(
          { success: false, message: "Daily conversion limit reached" },
          { status: 429 }
        );
      }
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const sourceFormat = formData.get('sourceFormat') as string;
    const targetFormat = formData.get('targetFormat') as string;

    if (!file || !sourceFormat || !targetFormat) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get file format from the File object
    const fileFormat = file.name.split('.').pop()?.toLowerCase();
    if (!fileFormat) {
      return NextResponse.json(
        { success: false, message: 'Invalid file format' },
        { status: 400 }
      );
    }

    // Upload original file
    const uploadResult = await uploadFile(file);
    console.log("Upload Result: ", uploadResult);

    let conversionResult: any;
    let convertedFilename = '';

    // Handle different conversion types
    if (PDF_CONVERSION_SUPPORTED_FORMATS.includes(fileFormat) && targetFormat.toLowerCase() === 'pdf') {
      // Image to PDF conversion
      conversionResult = await generatePdfFromImage(uploadResult);
      convertedFilename = `${file.name.split('.')[0]}.pdf`;
    } else if (SUPPORTED_IMAGE_FORMATS.includes(fileFormat) && SUPPORTED_IMAGE_FORMATS.includes(targetFormat.toLowerCase())) {
      // Image to Image conversion
      conversionResult = await convertImage(uploadResult, targetFormat.toLowerCase());
      convertedFilename = `${file.name.split('.')[0]}.${targetFormat.toLowerCase()}`;
    } else if (fileFormat === 'pdf' && PDF_CONVERSION_SUPPORTED_FORMATS.includes(targetFormat.toLowerCase())) {
      // PDF to Image conversion
      const images = await convertPdfToImages(uploadResult, { format: targetFormat.toLowerCase() as 'jpeg' | 'png' });
      conversionResult = images[0]; // For now, we'll return the first page
      convertedFilename = `${file.name.split('.')[0]}_page1.${targetFormat.toLowerCase()}`;
    } else if (DOC_CONVERSION_SUPPORTED_FORMATS.includes(fileFormat) && DOC_CONVERSION_SUPPORTED_FORMATS.includes(targetFormat.toLowerCase())) {
      // Document conversion
      if (fileFormat === 'pdf' && (targetFormat.toLowerCase() === 'docx' || targetFormat.toLowerCase() === 'doc')) {
        // Convert PDF to DOCX/DOC
        const pdfBuffer = Buffer.from(await file.arrayBuffer());
        let convertedBuffer: Buffer;
        
        if (targetFormat.toLowerCase() === 'docx') {
          convertedBuffer = await convertPdfToDocx(pdfBuffer);
        } else {
          convertedBuffer = await convertPdfToDoc(pdfBuffer);
        }

        // Upload the converted file to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            resource_type: 'raw',
            public_id: `converted_${Date.now()}.${targetFormat.toLowerCase()}`
          },
          async (error, result) => {
            if (error) {
              console.error('Error uploading converted file:', error);
              throw error;
            }
            conversionResult = result;
          }
        );

        const readable = Readable.from(convertedBuffer);
        readable.pipe(uploadStream);

        // Wait for the upload to complete
        await new Promise((resolve, reject) => {
          uploadStream.on('finish', resolve);
          uploadStream.on('error', reject);
        });

        convertedFilename = `${file.name.split('.')[0]}.${targetFormat.toLowerCase()}`;
      } else {
        // For other document conversions, use the existing method
        conversionResult = await convertDocument(uploadResult, targetFormat.toLowerCase());
        convertedFilename = `${file.name.split('.')[0]}.${targetFormat.toLowerCase()}`;
      }
    } else {
      // Clean up uploaded file if conversion is not supported
      await deleteFile(uploadResult.public_id);
      return NextResponse.json(
        { success: false, message: `Unsupported conversion: from ${fileFormat} to ${targetFormat}` },
        { status: 400 }
      );
    }

    // If user is logged in, save the conversion record
    if (session?.user?.id) {
      await FileConversion.create({
        userId: session.user.id,
        ipAddress: ip,
        sourceUrl: uploadResult.secure_url,
        resultUrl: conversionResult.secure_url,
        sourceFormat,
        targetFormat,
        status: 'completed',
        convertedFilename,
      });
    } else {
      // For non-authenticated users, set up automatic deletion
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + GUEST_EXPIRY_HOURS);

      // Schedule deletion of both original and converted files
      setTimeout(async () => {
        await deleteFile(uploadResult.public_id);
        await deleteFile(conversionResult.public_id);
      }, GUEST_EXPIRY_HOURS * 60 * 60 * 1000);
    }

    // Fetch the converted file
    const fileResponse = await fetch(conversionResult.secure_url);
    const fileBuffer = Buffer.from(await fileResponse.arrayBuffer());

    // Prepare headers for download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${convertedFilename}"`);
    headers.set('Content-Type', fileResponse.headers.get('content-type') || 'application/octet-stream');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const query = session?.user?.id 
      ? { userId: session.user.id }
      : { ipAddress: ip };

    const conversions = await FileConversion.find(query)
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({ success: true, data: conversions });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}











// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { NextApiRequest, NextApiResponse } from 'next';
// import fs from 'fs';
// import path from 'path';
// import sharp from 'sharp';
// import { PDFDocument } from 'pdf-lib';
// import upload from '@/lib/helpers/multer-storage';
// import { NextResponse } from 'next/server';
// import { Storage } from '@/lib/storage';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// const storageDir = path.join(process.cwd(), 'temp');

// const cleanupFile = (filePath: string) => {
//   try {
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }
//   } catch (error) {
//     console.error('Error cleaning up file:', error);
//   }
// };

// export const config = {
//   api: {
//     bodyParser: false, // Disabling body parsing to handle raw form data
//   },
// };

// interface MulterNextApiRequest extends NextApiRequest {
//   file: Express.Multer.File; // Add the file property to the request object
// }

// export default async function handler(req: MulterNextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   const session = await getServerSession(authOptions);

//   if (!session || !session.user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }
//   const user = session.user;


//   // Handle file upload using multer
//   upload.single('file')(req as any, res as any, async (err) => {
//     if (err) {
//       return NextResponse.json({ message: err.message }, {status: 400});
//     }

//     const { sourceFormat, targetFormat } = req.body;
//     const file: any = req.file;

//     // Check if the file was uploaded
//     if (!file) {
//       cleanupFile(file?.path || '');
//       return NextResponse.json({ message: 'No file uploaded' }, {status: 400});
//     }

//     // Check if user has remaining conversions
//     const canConvert = await Storage.decrementUserConversions(user.id);
//     if (!canConvert) {
//       cleanupFile(file.path);
//       return  NextResponse.json({
//         message:
//           "Daily conversion limit reached. Upgrade to Pro for unlimited conversions.",
//       }, {status: 403});
//     }

//     let convertedFilePath = '';
//     let convertedFilename = '';

//     try {
//       // Example conversion logic based on source and target formats

//       if (sourceFormat === 'pdf' && targetFormat === 'docx') {
//         // Convert PDF to DOCX (placeholder logic for demo)
//         convertedFilename = path.basename(file.path, path.extname(file.path)) + '.docx';
//         convertedFilePath = path.join(storageDir, convertedFilename);

//         // Placeholder for actual conversion logic
//         fs.copyFileSync(file.path, convertedFilePath);
//       } else if (sourceFormat === 'docx' && targetFormat === 'pdf') {
//         // Convert DOCX to PDF (placeholder logic for demo)
//         convertedFilename = path.basename(file.path, path.extname(file.path)) + '.pdf';
//         convertedFilePath = path.join(storageDir, convertedFilename);

//         // Placeholder for actual conversion logic
//         fs.copyFileSync(file.path, convertedFilePath);
//       } else if (['jpg', 'jpeg', 'png', 'webp'].includes(sourceFormat) && ['jpg', 'jpeg', 'png', 'webp'].includes(targetFormat)) {
//         // Convert image using sharp
//         convertedFilename = path.basename(file.path, path.extname(file.path)) + '.' + targetFormat;
//         convertedFilePath = path.join(storageDir, convertedFilename);

//         await sharp(file.path).toFormat(targetFormat as any).toFile(convertedFilePath);
//       } else if (['jpg', 'jpeg', 'png', 'webp'].includes(sourceFormat) && targetFormat === 'pdf') {
//         // Convert image to PDF
//         convertedFilename = path.basename(file.path, path.extname(file.path)) + '.pdf';
//         convertedFilePath = path.join(storageDir, convertedFilename);

//         const pdfDoc = await PDFDocument.create();
//         // eslint-disable-next-line @typescript-eslint/no-unused-vars
//         const page = pdfDoc.addPage();
//         const pdfBytes = await pdfDoc.save();
//         fs.writeFileSync(convertedFilePath, pdfBytes);
//       } else if (sourceFormat === 'pdf' && ['jpg', 'jpeg', 'png', 'webp'].includes(targetFormat)) {
//         // Convert PDF to Image (first page only)
//         convertedFilename = path.basename(file.path, path.extname(file.path)) + '.' + targetFormat;
//         convertedFilePath = path.join(storageDir, convertedFilename);

//         await sharp({
//           create: {
//             width: 800,
//             height: 1000,
//             channels: 4,
//             background: { r: 255, g: 255, b: 255, alpha: 1 },
//           },
//         }).toFormat(targetFormat as any).toFile(convertedFilePath);
//       } else {
//         cleanupFile(file.path);
//         return NextResponse.json({ message: 'Unsupported conversion' }, {status: 400});
//       }

//             // Manually send the converted file to the user
//       const fileStream = fs.createReadStream(convertedFilePath);

//       res.setHeader('Content-Type', 'application/octet-stream'); // Set content type
//       res.setHeader('Content-Disposition', `attachment; filename="${convertedFilename}"`);

//       fileStream.pipe(res);

//       fileStream.on('end', () => {
//         cleanupFile(file.path);
//         cleanupFile(convertedFilePath);
//       });

//       fileStream.on('error', (err) => {
//         console.error('Error sending file:', err);
//         cleanupFile(file.path);
//         cleanupFile(convertedFilePath);
//         return res.status(500).json({ message: 'Error sending file' });
//       });

//       // // Send the converted file to the user
//       // res.download(convertedFilePath, convertedFilename, (err: any) => {
//       //   cleanupFile(file.path);
//       //   cleanupFile(convertedFilePath);

//       //   if (err) {
//       //     console.error('Error sending file:', err);
//       //   }
//       // });

//       // // Send the converted file to the user
//       // res.sendFile(convertedFilePath, (err) => {
//       //   cleanupFile(file.path);
//       //   cleanupFile(convertedFilePath);

//       //   if (err) {
//       //     console.error('Error sending file:', err);
//       //     return res.status(500).json({ message: 'Error sending file' });
//       //   }
//       // });
//     } catch (error: any) {
//       cleanupFile(file.path);
//       cleanupFile(convertedFilePath);
//       console.error('Error during conversion:', error.message);
//       return NextResponse.json({ message: `Conversion error: ${error.message}` }, {status: 500});
//     }
//   });
// }