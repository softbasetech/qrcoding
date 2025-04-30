/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { NextRequest, NextResponse } from 'next/server';

interface MulterNextApiRequest extends NextRequest {
  file: Express.Multer.File; // Add the file property to the request object
}

export const validateFileUpload = (req: MulterNextApiRequest) => {
  if (!req.file) {
    return NextResponse.json({ message: 'No file uploaded' }, {status: 500});
  }
};