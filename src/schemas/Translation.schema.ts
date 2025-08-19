import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { timestampsPlugin } from 'src/common/plugins/timestamps.plugin';

export type TranslationDocument = Translation & Document;

@Schema({
  timestamps: true,
  versionKey: false,
  _id: false,
})
export class Translation {
  @Prop({ type: Number })
  _id: number;

  @Prop({ required: true, type: String })
  message: string;

  @Prop({ type: String })
  uz?: string;

  @Prop({ type: String })
  ru?: string;

  @Prop({ type: String })
  en?: string;
}

const TranslationSchema = SchemaFactory.createForClass(Translation);

// TranslationSchema.plugin(timestampsPlugin);

export { TranslationSchema };
