import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { timestampsPlugin } from 'src/common/plugins/timestamps.plugin';
import { AutoIncrement } from 'src/common/plugins/autoIncrement.plugin';
import { filterPlugin } from 'src/common/plugins/filter.plugin';
import { Role } from 'src/common/enums/role.enum';

export type AdminDocument = Admin & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Admin {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({
    type: {
      dueDate: Number,
      amount: Number,
      promocode: {
        type: {
          amount: Number,
          percentage: Number,
        },
      }
    }, required: false, default: {
      dueDate: null,
      amount: null,
      promocode: {
        amount: null,
        percentage: null,
      },
    }
  })
  payment: {
    dueDate: number;
    amount: number;
    promocode: String;
  }

  @Prop({ type: String, default: Role.ADMIN })
  role: string;

  @Prop({ type: Number, default: Date.now })
  updatedAt: number;

  @Prop({ type: Number, default: Date.now })
  createdAt: number;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Number, required: false })
  deletedAt: number;
}

const AdminSchema = SchemaFactory.createForClass(Admin);

// AdminSchema.plugin(timestampsPlugin);
AdminSchema.plugin(filterPlugin);

export { AdminSchema };
