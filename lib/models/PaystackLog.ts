/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';

export interface IPaystackLog extends mongoose.Document {
  event: string;
  reference: string;
  data: Record<string, any>;
}

const PaystackLogSchema = new mongoose.Schema<IPaystackLog>({
  event: {
    type: String,
    required: [true, 'Please provide a event'],
  },
  reference: {
    type: String,
    required: [true, 'Please provide a reference'],
  },
  data: {
    type: Object,
    required: [true, 'Please provide a data'],
  },
}, { timestamps: true });

// Prevent mongoose from creating a new model if it already exists
const PaystackLog = mongoose.models.PaystackLog || mongoose.model<IPaystackLog>('PaystackLog', PaystackLogSchema);

export default PaystackLog;