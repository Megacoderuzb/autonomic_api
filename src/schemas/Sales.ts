import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { filterPlugin } from 'src/common/plugins/filter.plugin';
import { timestampsPlugin } from 'src/common/plugins/timestamps.plugin';
import { Brand } from './Brand.schema';
import { Color } from './Color.schema';
import { Admin } from './Admin.schema';
import { Category } from './Category.schema';
import { Client } from './Client.schema';
import { CreditTypes } from './CreditTypes.schema';

export type SalesDocument = Sales & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Sales {
  @Prop({ type: String, ref: Admin.name, required: true })
  owner: string;

  @Prop({ type: [{
    product: { type: String, ref: Model.name, required: true},
    quantity: { type: Number, required: true, default: 1 }
  }] })
  products: string;

  @Prop({ type: String , ref: Client.name, required: true })
  client: string;

  @Prop({ type: String , ref: CreditTypes.name })
  debtType: string;

  @Prop({ type: String , ref: Category.name, required: true })
  category: string;

  @Prop({ type: Number})
  total: number;

  @Prop({ type: String, enum: ['USD', 'UZS'], default: 'UZS' })
  currency: string;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Number, default: 0 })
  deletedAt: number;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;
}

const SalesSchema = SchemaFactory.createForClass(Sales);

SalesSchema.plugin(filterPlugin);

export { SalesSchema };
