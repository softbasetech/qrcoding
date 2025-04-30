/* eslint-disable @typescript-eslint/no-explicit-any */
// User Model Interface
export interface IIUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  displayName?: string | null;
  googleId?: string | null;
  role: string;
  dailyConversionsRemaining?: number;
  lastConversionReset?: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  isPro: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Conversion Model Interface
export interface IIConversion {
  _id: string;
  userId: string;
  sourceFormat: string;
  targetFormat: string;
  originalFilename: string;
  convertedFilename: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// QR Code Model Interface
// export interface IIQRCode {
//   _id: string;
//   userId: string;
//   content: string;
//   type: string;
//   svg: string | Promise<string>;
//   backgroundColor?: string | null;
//   foregroundColor?: string | null;
//   createdAt: Date;
//   updatedAt: Date;
// }

// API Key Model Interface
export interface IIAPIKey {
  _id: string;
  userId: string;
  key: string;
  name: string;
  lastUsed: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Model Interface
export interface IIPayment {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  provider: string;
  providerReference: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// PaystackLog Interface
export interface IIPaystackLog {
  _id: string;
  event: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIContactForm {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginData{
  username: string;
  password: string;
}

export interface RegisterData{
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
  displayName?: string,
}

export interface IIQRCodeData {
  _id?: string;
  content: string
  type: "url" | "text" | "email"
  title?: string
  options?: {
    color?: string,
    backgroundColor?: string,
    size?: number,
    margin?: number,
  },
  scans?: number,
  shortId?: string,
  url?: string,
  createdAt?: Date,
  updatedAt?: Date,
}