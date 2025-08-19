import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AutoIncrement } from 'src/common/plugins/autoIncrement.plugin';

export type FileDocument = File & Document;

@Schema()
export class File {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: Number, required: true })
  lastRequest: number;

  @Prop({ type: Number, default: Date.now })
  updatedAt: number;

  @Prop({ type: Number, default: Date.now })
  createdAt: number;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Number, required: false })
  deletedAt: number;
}

const FileSchema = SchemaFactory.createForClass(File);

FileSchema.plugin(AutoIncrement, {
  field: '_id',
  modelName: 'Files',
});

export { FileSchema };
