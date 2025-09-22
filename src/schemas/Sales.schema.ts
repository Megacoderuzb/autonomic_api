import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { filterPlugin } from 'src/common/plugins/filter.plugin';
import { Admin } from './Admin.schema';
import { Client } from './Client.schema';
import { CreditTypes } from './CreditTypes.schema';
import { Products } from './Product.schema';

export type SalesDocument = Sales & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Sales {
  @Prop({ type: String, ref: Admin.name, required: true })
  owner: string;

  @Prop({
    type: [{
      product: { type: String, ref: Products.name, required: true },
      quantity: { type: Number, default: 1 }
    }]
  })
  products: {
    product: string;
    quantity: number;
  }[];

  @Prop({ type: String, ref: Client.name})
  client: string;

  
  @Prop({ type: String, ref: CreditTypes.name })
  creditType?: string;
  
  @Prop({ type: Number })
  total: number;
  
  @Prop({ type: String, enum: ['CASH', 'DEBT', 'CREDIT'], required: true })
  saleType: 'CASH' | 'DEBT' | 'CREDIT';

  @Prop({ type: String, enum: ['USD', 'UZS'], default: 'UZS' })
  currency: string;

  @Prop({ type: Number })
  debtDeadline: number;

  @Prop({ type: Number })
  paid: number;

  @Prop([{
    method: { type: String, enum: ['CASH', 'CARD', 'SYSTEMS'] },
    amount: { type: Number },
    currency: { type: String, enum: ['USD', 'UZS'], default: 'UZS' },
    date: { type: Date, default: Date.now }
  }])
  payments: {
    method: string;
    amount: number;
    currency: string;
    date: Date;
  }[];

  @Prop([{
    month: { type: Number, required: true }, // 1, 2, 3, ...
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['USD', 'UZS'], default: 'UZS' },
    paid: { type: Number, default: 0 }
  }])
  creditSchedule?: {
    month: number;
    dueDate: Date;
    amount: number;
    currency: string;
    paid: number;
  }[];

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Number, default: 0 })
  deletedAt: number;

  @Prop({ type: Number, default: 0 })
  updatedAt: number;

  @Prop({ type: Number, default: 0 })
  createdAt: number;
}

export const SalesSchema = SchemaFactory.createForClass(Sales);
SalesSchema.plugin(filterPlugin);