import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { filterPlugin } from 'src/common/plugins/filter.plugin';
import { timestampsPlugin } from 'src/common/plugins/timestamps.plugin';
import { Brand } from './Brand.schema';
import { Color } from './Color.schema';
import { Admin } from './Admin.schema';
import { Category } from './Category.schema';

export type ProductsDocument = Products & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Products {
  @Prop({ type: String, ref: Admin.name, required: true })
  owner: string;

  @Prop({ type: String , ref: Brand.name, required: true })
  brand: string;

  @Prop({ type: String , ref: Model.name, required: true })
  model: string;

  @Prop({ type: String , ref: Color.name, required: true })
  color: string;

  @Prop({ type: String , ref: Category.name, required: true })
  category: string;

  @Prop({ type: Boolean, default: false })
  imei: boolean;

  @Prop({ type: String , required: true })
  storage: string;

  @Prop({ type: String  })
  problem: string;

  @Prop({ type: String  })
  region: string;

  @Prop({ type: String  })
  originalPrice: string;

  @Prop({ type: String  })
  salePrice: string;

  @Prop({ type: String, enum: ['new', 'used'], default: 'new' })
  condition: string;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Number, default: 0 })
  deletedAt: number;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;
}

const ProductsSchema = SchemaFactory.createForClass(Products);

ProductsSchema.plugin(filterPlugin);

export { ProductsSchema };
