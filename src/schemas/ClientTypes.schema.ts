import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { timestampsPlugin } from 'src/common/plugins/timestamps.plugin';
import { AutoIncrement } from 'src/common/plugins/autoIncrement.plugin';
import { filterPlugin } from 'src/common/plugins/filter.plugin';
import { Admin } from './Admin.schema';

export type ClientTypesDocument = ClientTypes & Document;

@Schema({
  versionKey: false,
  timestamps: true,
})
export class ClientTypes {
  @Prop({ type: String, ref: Admin.name, required: true })
  owner: string;

  @Prop({ type: String, required: true })
  typeUz: string;

  @Prop({ type: String, required: true })
  typeRu: string;

  @Prop({ type: Number, default: Date.now })
  updatedAt: number;

  @Prop({ type: Number, default: Date.now })
  createdAt: number;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Number, required: false })
  deletedAt: number;
}

const ClientTypesSchema = SchemaFactory.createForClass(ClientTypes);

ClientTypesSchema.plugin(filterPlugin);

export { ClientTypesSchema };
