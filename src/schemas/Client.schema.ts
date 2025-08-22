import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { timestampsPlugin } from 'src/common/plugins/timestamps.plugin';
import { AutoIncrement } from 'src/common/plugins/autoIncrement.plugin';
import { filterPlugin } from 'src/common/plugins/filter.plugin';

export type ClientDocument = Client & Document;

@Schema({
  versionKey: false,
  _id: false,
})
export class Client {
  save(): Client | PromiseLike<Client> {
    throw new Error('Method not implemented.');
  }
  @Prop({ type: Number })
  _id: number;

  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: Number, required: true })
  phoneNumber: number;

  @Prop({ type: Number, default: Date.now })
  updatedAt: number;

  @Prop({ type: Number, default: Date.now })
  createdAt: number;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Number, required: false })
  deletedAt: number;
}

const ClientSchema = SchemaFactory.createForClass(Client);

ClientSchema.plugin(timestampsPlugin);
ClientSchema.plugin(filterPlugin);

export { ClientSchema };
