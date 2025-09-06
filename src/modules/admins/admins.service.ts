import { Model } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from 'src/schemas/Admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AddPaymentDto, UpdateAdminDto } from './dto/update-admin.dto';
import { comparePassword, hashPassword } from 'src/common/utils/password.util';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/common/enums/role.enum';
import { paginate } from 'src/common/utils/pagination.util';
import { CustomQuery } from 'src/common/types/Query.type';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
  ) { }

  async getAll(query: CustomQuery) {
    const data = await paginate(this.adminModel, query);
    return data;
  }

  async getMe(id: number) {
    const data = await this.adminModel.findById(id);

    if (!data) {
      throw new BadRequestException('Admin not found');
    }

    if (data.deleted) {
      throw new BadRequestException('Admin is deleted');
    }

    return {
      data,
    };
  }

  async create(createAdminDto: CreateAdminDto) {
    createAdminDto.password = await hashPassword(createAdminDto.password);
    return {
      data: await this.adminModel.create(createAdminDto),
    };
  }

  async login(username: string, password: string) {
    const admin = await this.adminModel.findOne({ username });
    if (!admin) {
      throw new Error('Admin not found');
    }
    const isPasswordCorrect = await comparePassword(password, admin.password);
    if (!isPasswordCorrect) {
      throw new Error('Password is incorrect');
    }

    if (admin.deleted) {
      throw new Error('Admin is deleted');
    }
    const payment = admin.payment;
    const isValid = payment && payment.dueDate && payment.dueDate > Date.now();
    if (isValid) {
      
      const token = await this.jwtService.signAsync({
        id: admin._id,
        role: admin.role,
      });
      return {
        data: {
          token,
          ...admin.toJSON(),
        },
      };
    }
    
    throw new BadRequestException({
      message: "Your Payment has been expired!!!"
    })
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    if (updateAdminDto.password) {
      updateAdminDto.password = await hashPassword(updateAdminDto.password);
    } else {
      const existingAdmin = await this.adminModel.findById(id);
      if (!existingAdmin) {
        throw new NotFoundException('Admin not found');
      }
      updateAdminDto.password = existingAdmin.password;
    }
    const updatedAdmin = await this.adminModel.findByIdAndUpdate(
      id,
      updateAdminDto,
      {
        new: true,
      },
    );
    return { data: updatedAdmin };
  }

    async payment(id: number, updateAdminDto: AddPaymentDto) {

      const existingAdmin = await this.adminModel.findById(id);
      if (!existingAdmin) {
        throw new NotFoundException('Admin not found');
      }
    
    const updatedAdmin = await this.adminModel.findByIdAndUpdate(
      id,
      updateAdminDto,
      {
        new: true,
      },
    );
    return { data: updatedAdmin };
  }


  async verifyPayment(id: string) {
    const admin = await this.adminModel.findById(id);
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }
    if (admin.deleted) {
      throw new BadRequestException('Admin is deleted');
    }
    const payment = admin.payment;
    const isValid = payment && payment.dueDate && payment.dueDate > Date.now();
    return {
      adminId: admin._id,
      paymentValid: isValid,
      dueDate: payment?.dueDate || null,
    };
  }

  async resetPassword(id: number, resetPasswordDto: ResetPasswordDto) {
    const admin = await this.adminModel.findById(id);
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    if (admin.deleted) {
      throw new BadRequestException('Admin is deleted');
    }

    const isPasswordCorrect = await comparePassword(
      resetPasswordDto.oldPassword,
      admin.password,
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedPassword = await hashPassword(resetPasswordDto.newPassword);
    if (hashedPassword === admin.password) {
      throw new BadRequestException(
        'New password cannot be the same as the old password',
      );
    }

    return {
      data: await this.adminModel.findByIdAndUpdate(
        id,
        { password: hashedPassword },
        { new: true },
      ),
    };
  }

  async remove(id: number) {
    return {
      data: await this.adminModel.findByIdAndUpdate(
        id,
        { deleted: true, deletedAt: Date.now() },
        { new: true },
      ),
    };
  }
}
