/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

interface MulterNextApiRequest extends NextApiRequest {
  file: Express.Multer.File; // Add the file property to the request object
}

export const validateFileUpload = (req: MulterNextApiRequest , res: NextApiResponse, next: Function) => {
  if (!req.file) {
    return NextResponse.json({ message: 'No file uploaded' }, {status: 500});
  }
  next();
};