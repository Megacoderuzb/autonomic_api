import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/User.schema';
import { TempUser, TempUserSchema } from 'src/schemas/TempUser.schema';
import {
  Confirmation,
  ConfirmationSchema,
} from 'src/schemas/Confirmation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: TempUser.name, schema: TempUserSchema },
      { name: Confirmation.name, schema: ConfirmationSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
