import { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/schemas/User.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import {
  Confirmation,
  ConfirmationDocument,
} from 'src/schemas/Confirmation.schema';
import { TempUser, TempUserDocument } from 'src/schemas/TempUser.schema';
import { comparePassword, hashPassword } from 'src/common/utils/password.util';
import generateId from 'src/common/utils/generateId';
import { ConfirmationTypeEnum } from 'src/common/enums/confirmationType.enum';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(TempUser.name)
    private readonly tempUserModel: Model<TempUserDocument>,
    @InjectModel(Confirmation.name)
    private readonly confirmationModel: Model<ConfirmationDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async getAll() {
    const data = await this.userModel.find();
    return { data };
  }

  async getMe(id: number) {
    try {
      const data = await this.userModel.findById(id);
      return { data };
    } catch (err) {
      return {
        data: null,
        message: 'Interval server error!',
        error: (err as Error).message,
      };
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    try {
      const findUser = await this.userModel.findOne({
        phoneNumber: registerUserDto.phoneNumber,
      });

      if (findUser) {
        throw new BadRequestException('User already exists');
      }

      const findConfirmation = await this.confirmationModel.findOne({
        phoneNumber: registerUserDto.phoneNumber,
      });

      if (findConfirmation) {
        if (findConfirmation.expiredAt < Date.now()) {
          await this.confirmationModel.findByIdAndDelete(findConfirmation._id);
        } else {
          throw new BadRequestException('User already exists');
        }
      }

      const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
      console.log(code);
      const hashedCode = await hashPassword(code);
      const uuid = generateId();
      const expiredAt = Date.now() + 2 * 60 * 1000;

      const newConfirmation = await this.confirmationModel.create({
        type: ConfirmationTypeEnum.PHONE,
        uuid,
        code: hashedCode,
        phoneNumber: registerUserDto.phoneNumber,
        expiredAt,
      });

      await this.tempUserModel.create({
        ...registerUserDto,
        expiredAt,
      });

      return { data: newConfirmation };
    } catch (err: any) {
      return {
        data: null,
        message: 'Interval server error!',
        error: (err as Error).message,
      };
    }
  }

  async confirmRegister(uuid: string, code: string) {
    try {
      const findConfirmation = await this.confirmationModel.findOne({
        uuid,
      });

      if (!findConfirmation) {
        throw new BadRequestException('Confirmation not found');
      }

      if (findConfirmation.expiredAt < Date.now()) {
        throw new BadRequestException('Confirmation expired');
      }

      const isMatch = await comparePassword(code, findConfirmation.code);

      if (!isMatch) {
        throw new BadRequestException('Invalid code');
      }

      const findTempUser = await this.tempUserModel
        .findOne({
          phoneNumber: findConfirmation.phoneNumber,
        })
        .lean();

      if (!findTempUser) {
        throw new BadRequestException('Temp user not found');
      }

      const findUser = await this.userModel.findOne({
        phoneNumber: findTempUser.phoneNumber,
      });

      if (findUser) {
        throw new BadRequestException('User already exists');
      }

      const user = await this.userModel.create({
        ...findTempUser,
      });

      await this.tempUserModel.findByIdAndDelete(findTempUser._id);
      await this.confirmationModel.findByIdAndDelete(findConfirmation._id);

      const token = await this.jwtService.signAsync({
        id: user._id,
        role: Role.USER,
      });

      return {
        data: {
          token,
          ...user.toJSON(),
        },
      };
    } catch (err: any) {
      return {
        data: null,
        message: 'Interval server error!',
        error: (err as Error).message,
      };
    }
  }

  async login(phoneNumber: number) {
    const findUser = await this.userModel.findOne({ phoneNumber });

    if (!findUser) {
      throw new BadRequestException('User not found');
    }

    const findConfirmation = await this.confirmationModel.findOne({
      phoneNumber,
    });

    if (findConfirmation) {
      if (findConfirmation.expiredAt < Date.now()) {
        await this.confirmationModel.findByIdAndDelete(findConfirmation._id);
      } else {
        throw new BadRequestException('Confirmation already exists');
      }
    }

    const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
    console.log(code);
    const hashedCode = await hashPassword(code);

    const newConfirmation = await this.confirmationModel.create({
      type: ConfirmationTypeEnum.PHONE,
      uuid: generateId(),
      code: hashedCode,
      phoneNumber,
      expiredAt: Date.now() + 2 * 60 * 1000,
    });

    return { data: newConfirmation };
  }

  async confirmLogin(uuid: string, code: string) {
    try {
      const findConfirmation = await this.confirmationModel.findOne({
        uuid,
      });

      if (!findConfirmation) {
        throw new BadRequestException('Confirmation not found');
      }

      if (findConfirmation.expiredAt < Date.now()) {
        throw new BadRequestException('Confirmation expired');
      }

      const isMatch = await comparePassword(code, findConfirmation.code);

      if (!isMatch) {
        throw new BadRequestException('Invalid code');
      }

      await this.confirmationModel.findByIdAndDelete(findConfirmation._id);

      const findUser = await this.userModel
        .findOne({
          phoneNumber: findConfirmation.phoneNumber,
        })
        .lean();

      if (!findUser) {
        throw new BadRequestException('User not found');
      }

      const token = await this.jwtService.signAsync({
        id: findUser._id,
        role: Role.USER,
      });

      return {
        data: {
          token,
          ...findUser,
        },
      };
    } catch (err: any) {
      return {
        data: null,
        message: 'Interval server error!',
        error: (err as Error).message,
      };
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
    return { data };
  }

  async remove(id: number) {
    const data = await this.userModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: Date.now(),
      },
      { new: true },
    );

    return { data };
  }
}
