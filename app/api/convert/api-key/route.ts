/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import FileConversion from "@/lib/models/FileConversion";
import { convertImage, generatePdfFromImage, PDF_CONVERSION_SUPPORTED_FORMATS, SUPPORTED_FILE_FORMATS, SUPPORTED_IMAGE_FORMATS, uploadFile } from "@/lib/cloundinary";
import dbConnect from "@/lib/db";
import { validateApiKey } from "@/lib/utils";
import { authOptions } from "@/app/utils/authOptions";

// const DAILY_LIMIT = 1000;
// const GUEST_EXPIRY_HOURS = 24;

export async function POST(req: NextRequest) {
  await validateApiKey(req)
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Check daily limit for non-authenticated users
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized Access" },
        { status: 503 }
      );
    }

    const { file, sourceFormat, targetFormat } = await req.json();

    if (!SUPPORTED_FILE_FORMATS.includes(sourceFormat) || !SUPPORTED_FILE_FORMATS.includes(targetFormat)) {
      return NextResponse.json(
        { success: false, message: "Unsupported file format" },
        { status: 400 }
      );
    }

    // Upload original file
    const uploadResult = await uploadFile(file);
    let conversionResult: any;
    // Determine the file format from the upload result
    const FileFormat = uploadResult.format.toLowerCase();
    // const resourceType = uploadResult.resource_type;


    // Case 1: Image -> PDF
    if (PDF_CONVERSION_SUPPORTED_FORMATS.includes(FileFormat) && targetFormat.toLowerCase() === 'pdf') {
      console.log('Converting image to PDF...');
      conversionResult = await generatePdfFromImage(uploadResult);
      // Case 2: Image -> Image (format to format)
    } else if (SUPPORTED_IMAGE_FORMATS.includes(FileFormat) && SUPPORTED_IMAGE_FORMATS.includes(targetFormat.toLowerCase())) {
      console.log('Converting image format...');
      conversionResult = await convertImage(uploadResult, targetFormat.toLowerCase());
    } else {
      // Case 3: Unsupported
      throw new Error(`Unsupported conversion: from ${FileFormat} to ${targetFormat}`);
    }

    // // Case 2: PDF -> Image
    // if (FileFormat === 'pdf' && SUPPORTED_IMAGE_FORMATS.includes(targetFormat.toLowerCase())) {
    //   console.log('Converting PDF to image...');
    //   const imageUrl = await convertPdfToImage(uploadResult.secure_url, targetFormat.toLowerCase());
    //   return {
    //     success: true,
    //     message: 'PDF converted to image successfully.',
    //     url: imageUrl,
    //   };
    // }


    // Save conversion record
    const conversion = await FileConversion.create({
      userId: session?.user?.id,
      ipAddress: ip,
      sourceUrl: uploadResult.secure_url,
      resultUrl: conversionResult.secure_url,
      sourceFormat,
      targetFormat,
      status: 'completed',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: conversion._id,
        resultUrl: conversionResult.secure_url,
        expiresAt: conversion.expiresAt,
      },
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
// import { Conversion } from '@/lib/services/conversion.service';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import { validateApiKey } from '@/lib/utils';

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
//     await validateApiKey(req, res)
    
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//     const session = await getServerSession(authOptions);

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

//         const lastRecord = await Conversion.findLastRecord();
//         const newId = lastRecord ? lastRecord.id + 1 : 1;
//     // Record the conversion
//     const conversion = new Conversion({
//         id: newId,
//         userId: user.id,
//         sourceFormat,
//         targetFormat,
//         originalFilename: file.originalname,
//         convertedFilename,
//         status: "completed",
//         createdAt: new Date()
//     });

//     await conversion.save()

//     // Manually send the converted file to the user
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