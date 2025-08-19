import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { timestampsPlugin } from 'src/common/plugins/timestamps.plugin';
import { AutoIncrement } from 'src/common/plugins/autoIncrement.plugin';
import { filterPlugin } from 'src/common/plugins/filter.plugin';

export type AdminDocument = Admin & Document;

@Schema({
  versionKey: false,
  _id: false,
})
export class Admin {
  save(): Admin | PromiseLike<Admin> {
    throw new Error('Method not implemented.');
  }
  @Prop({ type: Number })
  _id: number;

  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Number, default: Date.now })
  updatedAt: number;

  @Prop({ type: Number, default: Date.now })
  createdAt: number;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Number, required: false })
  deletedAt: number;
}

const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.plugin(AutoIncrement, { field: '_id', modelName: 'Admins' });
AdminSchema.plugin(timestampsPlugin);
AdminSchema.plugin(filterPlugin);

export { AdminSchema };
