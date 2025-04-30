import mongoose from 'mongoose';

export interface IFileConversion extends mongoose.Document {
  userId?: typeof mongoose.Schema.Types.ObjectId;
  ipAddress: string;
  sourceUrl: string;
  resultUrl: string;
  sourceFormat: string;
  targetFormat: string;
  originalFile?: string;
  convertedFile?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type?: 'image' | 'pdf_image' | 'image_pdf' | 'pdf_doc' | 'doc_pdf';
  expiresAt?: Date;
}

const FileConversionSchema = new mongoose.Schema<IFileConversion>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  sourceUrl: {
    type: String,
    required: true,
  },
  resultUrl: {
    type: String,
    required: true,
  },
  sourceFormat: {
    type: String,
    required: true,
  },
  targetFormat: {
    type: String,
    required: true,
  },
  originalFile: {
    type: String,
    required: false,
  },
  convertedFile: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  expiresAt: {
    type: Date,
    required: false,
  }
}, { timestamps: true });

// // Create indexes
// FileConversionSchema.index({ ipAddress: 1, createdAt: 1 });
// FileConversionSchema.index({ userId: 1, createdAt: 1 });
// FileConversionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const FileConversion = mongoose.models.FileConversion || mongoose.model<IFileConversion>('FileConversion', FileConversionSchema);

export default FileConversion;