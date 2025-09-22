import { Model } from 'mongoose';
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Models, ModelsDocument } from 'src/schemas/Model.schema';
import { CreateModelsDto } from './dto/create-models.dto';
import { UpdateModelsDto } from './dto/update-models.dto';
import { JwtService } from '@nestjs/jwt';
import { paginate } from 'src/common/utils/pagination.util';
import { CustomQuery } from 'src/common/types/Query.type';

@Injectable()
export class ModelsService {
  constructor(
    @InjectModel(Models.name)
    private readonly modelsModel: Model<ModelsDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async getAll(query: CustomQuery, req: any) {
    query.filter =  {owner: req.user.id};
    const data = await paginate(this.modelsModel, query);
    return data;
  }

  async getById(id: string) {
    const data = await this.modelsModel.findById(id);

    if (!data) {
      throw new BadRequestException('Models not found');
    }

    if (data.deleted) {
      throw new BadRequestException('Models is deleted');
    }

    return {
      data,
    };
  }

  async create(createModelsDto: CreateModelsDto) {
    return {
      data: await this.modelsModel.create(createModelsDto),
    };
  }


  async update(id: string, updateModelsDto: UpdateModelsDto) {

    const updatedModels = await this.modelsModel.findByIdAndUpdate(
      id,
      updateModelsDto,
      {
        new: true,
      },
    );
    return { data: updatedModels };
  }

 
  async remove(id: string, user: string) {
    return {
      data: await this.modelsModel.findOneAndUpdate(
        {_id: id, owner: user},
        { deleted: true, deletedAt: Date.now() },
        { new: true },
      ),
    };
  }
}
