import mongoose from 'mongoose';

export interface IQRScan extends mongoose.Document {
  qrCodeId: typeof mongoose.Schema.Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  device: {
    type: string;
    browser: string;
    os: string;
  };
  location: {
    city?: string;
    country?: string;
  };
  timestamp: Date;
}

const QRScanSchema = new mongoose.Schema<IQRScan>({
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode',
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  device: {
    type: {
      type: String,
      required: true,
    },
    browser: {
      type: String,
      required: true,
    },
    os: {
      type: String,
      required: true,
    },
  },
  location: {
    city: String,
    country: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
// QRScanSchema.index({ qrCodeId: 1, timestamp: 1 });
// QRScanSchema.index({ ipAddress: 1, timestamp: 1 });

const QRScan = mongoose.models.QRScan || mongoose.model<IQRScan>('QRScan', QRScanSchema);

export default QRScan;