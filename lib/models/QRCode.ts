import mongoose from 'mongoose';

export interface IQRCode extends mongoose.Document {
  userId?: typeof mongoose.Schema.Types.ObjectId;
  ipAddress: string;
  content: string;
  title: string;
  shortId: string;
  scans: number;
  url: string;
  createdAt: Date;
}

const QRCodeSchema = new mongoose.Schema<IQRCode>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
  scans: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
// QRCodeSchema.index({ ipAddress: 1, createdAt: 1 });
// QRCodeSchema.index({ userId: 1, createdAt: 1 });
// QRCodeSchema.index({ shortId: 1 }, { unique: true });

const QRCode = mongoose.models.QRCode || mongoose.model<IQRCode>('QRCode', QRCodeSchema);

export default QRCode;