import { Model } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Brand, BrandDocument } from 'src/schemas/Brand.schema';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { comparePassword, hashPassword } from 'src/common/utils/password.util';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/common/enums/role.enum';
import { paginate } from 'src/common/utils/pagination.util';
import { CustomQuery } from 'src/common/types/Query.type';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async getAll(query: CustomQuery, req: any) {
    query.filter =  {owner: req.user.id};
    const data = await paginate(this.brandModel, query);
    return data;
  }

  async getById(id: string) {
    const data = await this.brandModel.findById(id);

    if (!data) {
      throw new BadRequestException('Brand not found');
    }

    if (data.deleted) {
      throw new BadRequestException('Brand is deleted');
    }

    return {
      data,
    };
  }

  async create(createBrandDto: CreateBrandDto) {
    return {
      data: await this.brandModel.create(createBrandDto),
    };
  }


  async update(id: string, updateBrandDto: UpdateBrandDto) {

    const updatedBrand = await this.brandModel.findByIdAndUpdate(
      id,
      updateBrandDto,
      {
        new: true,
      },
    );
    return { data: updatedBrand };
  }

 
  async remove(id: string, user: string) {
    return {
      data: await this.brandModel.findOneAndUpdate(
        {_id: id, owner: user},
        { deleted: true, deletedAt: Date.now() },
        { new: true },
      ),
    };
  }
}
