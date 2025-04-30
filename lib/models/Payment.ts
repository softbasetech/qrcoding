/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';

export interface IPayment extends mongoose.Document {
  userId: typeof mongoose.Schema.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  provider: string;
  providerReference: string;
  metadata: Record<string, any>;
}

const PaymentSchema = new mongoose.Schema<IPayment>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount'],
  },
  currency: {
    type: String,
    required: [true, 'Please provide currency'],
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    required: [true, 'Please provide status'],
    default: 'pending'
  },
  provider: {
    type: String,
    required: [true, 'Please provide a provider'],
  },
  providerReference: {
    type: String,
    required: [true, 'Please provide a provider reference'],
    unique: true
  },
  metadata: {
    type: Object,
    required: false,
  },
});
const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;