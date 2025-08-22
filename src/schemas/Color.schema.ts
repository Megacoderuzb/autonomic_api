import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AutoIncrement } from 'src/common/plugins/autoIncrement.plugin';
import { filterPlugin } from 'src/common/plugins/filter.plugin';
import { timestampsPlugin } from 'src/common/plugins/timestamps.plugin';

export type ColorDocument = Color & Document;

@Schema({
  timestamps: true,
})
export class Color {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String , required: true, unique: true })
  name: string;

  @Prop({ type: String })
  hex: string;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Number, default: 0 })
  deletedAt: number;

  @Prop({ type: Number })
  createdAt: number;

  @Prop({ type: Number })
  updatedAt: number;
}

const ColorSchema = SchemaFactory.createForClass(Color);

ColorSchema.plugin(timestampsPlugin);
ColorSchema.plugin(filterPlugin);

export { ColorSchema };
