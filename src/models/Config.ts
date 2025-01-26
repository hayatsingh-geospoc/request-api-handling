import mongoose, { Schema, Document } from 'mongoose';

export interface IConfigDocument extends Document {
  key: string;
  value: number;
  description: string;
}

const ConfigSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
  description: { type: String, required: true },
});

export default mongoose.model<IConfigDocument>('Config', ConfigSchema);
