import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { filterPlugin } from 'src/common/plugins/filter.plugin';
import { Admin } from './Admin.schema';

export type CreditTypesDocument = CreditTypes & Document;

@Schema({
  versionKey: false,
  timestamps: true,
})
export class CreditTypes {
  @Prop({ type: String, ref: Admin.name, required: true })
  owner: string;

  @Prop({ type: Number, required: true })
  duration: number;

  @Prop({ type: Number, required: true })
  percentage: number;

  @Prop({ type: Number })
  minimal: number;

  @Prop({ type: Number })
  minimalAmount: number;

  // @Prop({ type: String, enum: ['USD', 'UZS'], default: 'USD' })
  // currency: string;

  @Prop({ type: Number, default: Date.now })
  updatedAt: number;

  @Prop({ type: Number, default: Date.now })
  createdAt: number;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Number, required: false })
  deletedAt: number;
}

const CreditTypesSchema = SchemaFactory.createForClass(CreditTypes);

CreditTypesSchema.plugin(filterPlugin);

export { CreditTypesSchema };
