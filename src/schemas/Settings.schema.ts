import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AutoIncrement } from 'src/common/plugins/autoIncrement.plugin';
import { Admin } from './Admin.schema';

export type SettingsDocument = Settings & Document;

@Schema()
export class Settings {
  @Prop({ type: String, ref: Admin.name, required: true })
  owner: string;

  @Prop({ type: Number, enum: [1, 2], default: 1 }) // 1 = active, 2 = inactive
  isWorking: number;

  @Prop({ type: String })
  instagram: string;

  @Prop({ type: String })
  telegram: string;

  @Prop({ type: String })
  facebook: string;

  @Prop({ type: String })
  youtube: string;

  @Prop({ type: Number })
  phoneNumber: number;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String })
  website: string;

  @Prop({ type: {
    cbu: Number,
    manual: Number,
    selected: { type: String, enum: ['cbu', 'manual'], default: 'cbu'}
  } })
  currencyRate: {
    cbu: number;
    manual: number;
    selected: string;
  };

  @Prop({ type: Object })
  address: {
    lat: number;
    lng: number;
  };
}

const SettingsSchema = SchemaFactory.createForClass(Settings);

SettingsSchema.plugin(AutoIncrement, {
  field: '_id',
  modelName: 'Settings',
});

export { SettingsSchema };
