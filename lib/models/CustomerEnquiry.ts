import mongoose from 'mongoose';

export interface ICustomerEnquiry extends mongoose.Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const CustomerEnquirySchema = new mongoose.Schema<ICustomerEnquiry>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  phone: {
    type: String,
    required: false,
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
  },
}, { timestamps: true });

// Prevent mongoose from creating a new model if it already exists
const CustomerEnquiry = mongoose.models.CustomerEnquiry || mongoose.model<ICustomerEnquiry>('CustomerEnquiry', CustomerEnquirySchema);

export default CustomerEnquiry;