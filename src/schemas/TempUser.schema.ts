import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AutoIncrement } from 'src/common/plugins/autoIncrement.plugin';

export type TempUserDocument = TempUser & Document;

@Schema({
  versionKey: false,
  _id: false,
})
export class TempUser {
  @Prop({ type: Number })
  _id: number;

  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: Number, required: true })
  phoneNumber: number;

  @Prop({ type: Date, required: true })
  expiredAt: Date;
}

const TempUserSchema = SchemaFactory.createForClass(TempUser);

TempUserSchema.plugin(AutoIncrement, { field: '_id', modelName: 'tempUsers' });

export { TempUserSchema };
