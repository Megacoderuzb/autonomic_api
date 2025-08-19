import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AutoIncrement } from 'src/common/plugins/autoIncrement.plugin';

export type ConfirmationDocument = Confirmation & Document;

@Schema()
export class Confirmation {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String, required: true })
  uuid: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Number, required: true })
  phoneNumber: number;

  @Prop({ type: Number, required: true })
  expiredAt: number;

  @Prop({ type: Number, default: Date.now })
  updatedAt: number;

  @Prop({ type: Number, default: Date.now })
  createdAt: number;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Number, required: false })
  deletedAt: number;
}

const ConfirmationSchema = SchemaFactory.createForClass(Confirmation);

ConfirmationSchema.plugin(AutoIncrement, {
  field: '_id',
  modelName: 'confirmations',
});

export { ConfirmationSchema };
