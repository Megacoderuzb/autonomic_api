import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { filterPlugin } from 'src/common/plugins/filter.plugin';
import { timestampsPlugin } from 'src/common/plugins/timestamps.plugin';

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String , required: true, unique: true })
  name: string;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Number, default: 0 })
  deletedAt: number;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;
}

const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.plugin(timestampsPlugin);
CategorySchema.plugin(filterPlugin);

export { CategorySchema };
