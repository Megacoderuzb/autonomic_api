import { Model } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Color, ColorDocument } from 'src/schemas/Color.schema';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { JwtService } from '@nestjs/jwt';
import { paginate } from 'src/common/utils/pagination.util';
import { CustomQuery } from 'src/common/types/Query.type';

@Injectable()
export class ColorService {
  constructor(
    @InjectModel(Color.name)
    private readonly colorModel: Model<ColorDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async getAll(query: CustomQuery, req: any) {
    query.filter =  {owner: req.user.id};
    const data = await paginate(this.colorModel, query);
    return data;
  }

  async getById(id: string) {
    const data = await this.colorModel.findById(id);

    if (!data) {
      throw new BadRequestException('Color not found');
    }

    if (data.deleted) {
      throw new BadRequestException('Color is deleted');
    }

    return {
      data,
    };
  }

  async create(createColorDto: CreateColorDto) {
    return {
      data: await this.colorModel.create(createColorDto),
    };
  }


  async update(id: number, updateColorDto: UpdateColorDto) {

    const updatedColor = await this.colorModel.findByIdAndUpdate(
      id,
      updateColorDto,
      {
        new: true,
      },
    );
    return { data: updatedColor };
  }

 
  async remove(id: number, user: string) {
    return {
      data: await this.colorModel.findOneAndUpdate(
        {_id: id, owner: user},
        { deleted: true, deletedAt: Date.now() },
        { new: true },
      ),
    };
  }
}
