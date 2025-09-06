// src/modules/category/category.service.ts
import { Model, Types } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from 'src/schemas/Category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { paginate } from 'src/common/utils/pagination.util';
import { CustomQuery } from 'src/common/types/Query.type';
import filterByLang from 'src/common/utils/filterByLang';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly clientTypesModel: Model<CategoryDocument>,
  ) {}

  // CONTROLLER: getAll(query, req)
  async getAll(query: CustomQuery, req: any) {
    const userId: string = req?.user?.id;
    if (!userId) throw new BadRequestException('Unauthorized');

    query.filter = { ...(query.filter || {}), owner: userId, deleted: { $ne: true } };

    const paged = await paginate(this.clientTypesModel, query);

    const lang = query._l || '';
    const rows = Array.isArray(paged.data) ? paged.data : [];

    // filterByLang generik emas -> unknown orqali ikki bosqichli cast
    const transformed = filterByLang(rows as any[], lang, ['name']) as unknown as Category[];

    return {
      data: transformed,
      _meta: paged._meta,
    };
  }

  // CONTROLLER: getById(id, query, req)
  async getById(id: string, query: CustomQuery, req: any) {
    const userId: string = req?.user?.id;
    if (!userId) throw new BadRequestException('Unauthorized');

    if (Types.ObjectId.isValid(id) === false) {
      throw new BadRequestException('Invalid id');
    }

    const doc = await this.clientTypesModel
      .findOne({ _id: id, owner: userId })
      .lean<Category>()
      .exec();

    if (!doc) throw new NotFoundException('Category not found');
    if ((doc as any).deleted) throw new BadRequestException('Category is deleted');

    const lang = query._l || '';

    // filterByLang generik emas -> unknown orqali ikki bosqichli cast
    const data = filterByLang(doc as any, lang, ['name']) as unknown as Category;

    return { data };
  }

  // CONTROLLER: create(dto)  <-- controller owner ni qo‘yadi, req yubormaydi
  async create(createDto: CreateCategoryDto) {
    const created = await this.clientTypesModel.create(createDto);
    const data = await this.clientTypesModel
      .findById(created._id)
      .lean<Category>()
      .exec();
    return { data };
  }

  // CONTROLLER: updateMe(req.user.id, dto) VA update(:id, dto)
  async update(id: any, updateDto: UpdateCategoryDto) {
    if (typeof id === 'string' && Types.ObjectId.isValid(id) === false) {
      // agar majburan tekshirmoqchi bo‘lsangiz, bu yerda 400 qaytarishingiz mumkin
      // hozircha no-op: findByIdAndUpdate baribir urunadi
    }

    const updated = await this.clientTypesModel
      .findByIdAndUpdate(id as any, updateDto, { new: true, lean: true })
      .exec();

    if (!updated) throw new NotFoundException('Category not found');

    return { data: updated };
  }

  // CONTROLLER: remove(id, req.user.id) -> remove(id, userId)
  async remove(id: any, userId: string) {
    if (!userId) throw new BadRequestException('Unauthorized');

    const existing = await this.clientTypesModel
      .findOne({ _id: id as any, owner: userId })
      .lean<{ deleted?: boolean }>()
      .exec();

    if (!existing) throw new NotFoundException('Category not found');
    if (existing.deleted) return { data: existing };

    const deleted = await this.clientTypesModel
      .findOneAndUpdate(
        { _id: id as any, owner: userId },
        { deleted: true, deletedAt: Date.now() },
        { new: true, lean: true },
      )
      .exec();

    return { data: deleted };
  }
}
