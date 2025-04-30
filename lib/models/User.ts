import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  username: string;
  password: string;
  image?: string;
  googleId?: string | null;
  role: string;
  dailyConversionsRemaining?: number;
  lastConversionReset?: Date | null;
  isPro: boolean;
  emailVerified?: Date;
  // comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    minlength: 3,
    maxlength: 20,
  },
  password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password in queries
},
  image: {
    type: String,
    required: false
  },
  googleId: {
    type: String,
    required: false
  },
  dailyConversionsRemaining: {
    type: Number,
    required: false
  },
  lastConversionReset: {
    type: Date,
    required: false
  },
  isPro: {
    type: Boolean,
    required: true,
    default: false
  },
  emailVerified: Date,
}, { timestamps: true });

// // Hash password before saving
// UserSchema.pre('save', async function(next: any) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error: any) {
//     next(error);
//   }
// });

// // Method to compare entered password with stored hash
// UserSchema.methods.comparePassword = async function(candidatePassword: string) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// Prevent mongoose from creating a new model if it already exists
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;