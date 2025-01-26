import mongoose, { Schema, Document } from 'mongoose';
import { IItems, IAddress } from '../interfaces/user.interface';

const AddressSchema = new Schema<IAddress>({
  city: String,
  state: String,
  country: String,
  street: String,
});

const UserSchema = new Schema<IItems>({
  id: String,
  gender: String,
  name: String,
  address: AddressSchema,
  email: String,
  age: String,
  picture: String,
  createdAt: { type: Date, default: Date.now },
});

// Add indexes for search optimization
UserSchema.index({ email: 1 });
UserSchema.index({ gender: 1 });
UserSchema.index({ 'address.country': 1 });
UserSchema.index({ name: 'text' });

export default mongoose.model<IItems & Document>('User', UserSchema);
