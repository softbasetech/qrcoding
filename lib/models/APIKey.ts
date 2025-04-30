import mongoose from 'mongoose';

export interface IAPIKey extends mongoose.Document {
  userId: typeof mongoose.Schema.Types.ObjectId;
  key: string;
  name: string;
  lastUsed?: Date | null;
}

const APIKeySchema = new mongoose.Schema<IAPIKey>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  key: {
    type: String,
    required: [true, 'Please provide a key'],
  },
  lastUsed: {
    type: Date,
    required: false,
  },
}, {timestamps: true})

const APIKey = mongoose.models.APIKey || mongoose.model<IAPIKey>('APIKey', APIKeySchema);

export default APIKey;