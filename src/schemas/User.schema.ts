import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { timestampsPlugin } from 'src/common/plugins/timestamps.plugin';
import { AutoIncrement } from 'src/common/plugins/autoIncrement.plugin';
import { filterPlugin } from 'src/common/plugins/filter.plugin';

export type UserDocument = User & Document;

@Schema({
  versionKey: false,
  _id: false,
})
export class User {
  save(): User | PromiseLike<User> {
    throw new Error('Method not implemented.');
  }
  @Prop({ type: Number })
  _id: number;

  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
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

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.plugin(AutoIncrement, { field: '_id', modelName: 'users' });
UserSchema.plugin(timestampsPlugin);
UserSchema.plugin(filterPlugin);

export { UserSchema };
