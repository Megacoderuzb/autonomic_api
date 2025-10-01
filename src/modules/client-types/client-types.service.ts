// src/modules/client-types/client-types.service.ts
import { Model, Types } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientTypes, ClientTypesDocument } from 'src/schemas/ClientTypes.schema';
import { CreateClientTypesDto } from './dto/create-client-types.dto';
import { UpdateClientTypesDto } from './dto/update-client-types.dto';
import { paginate } from 'src/common/utils/pagination.util';
import { CustomQuery } from 'src/common/types/Query.type';
import filterByLang from 'src/common/utils/filterByLang';

@Injectable()
export class ClientTypesService {
  constructor(
    @InjectModel(ClientTypes.name)
    private readonly clientTypesModel: Model<ClientTypesDocument>,
  ) {}

  // CONTROLLER: getAll(query, req)
  async getAll(query: CustomQuery, req: any) {
    const userId: string = req?.user?.id;
    if (!userId) throw new BadRequestException('Unauthorized');

    query.filter = { ...(query.filter || {}), owner: userId, deleted: { $ne: true } };

    const paged = await paginate(this.clientTypesModel, query);

    const lang = query.lang || '';
    const rows = Array.isArray(paged.data) ? paged.data : [];

    // filterByLang generik emas -> unknown orqali ikki bosqichli cast
    const transformed = filterByLang(rows as any[], lang, ['type']) as unknown as ClientTypes[];

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
      .lean<ClientTypes>()
      .exec();

    if (!doc) throw new NotFoundException('ClientTypes not found');
    if ((doc as any).deleted) throw new BadRequestException('ClientTypes is deleted');

    const lang = query.lang || '';

    // filterByLang generik emas -> unknown orqali ikki bosqichli cast
    const data = filterByLang(doc as any, lang, ['type']) as unknown as ClientTypes;

    return { data };
  }

  // CONTROLLER: create(dto)  <-- controller owner ni qo‘yadi, req yubormaydi
  async create(createDto: CreateClientTypesDto) {
    const created = await this.clientTypesModel.create(createDto);
    const data = await this.clientTypesModel
      .findById(created._id)
      .lean<ClientTypes>()
      .exec();
    return { data };
  }

  // CONTROLLER: updateMe(req.user.id, dto) VA update(:id, dto)
  async update(id: any, updateDto: UpdateClientTypesDto) {
    if (typeof id === 'string' && Types.ObjectId.isValid(id) === false) {
      // agar majburan tekshirmoqchi bo‘lsangiz, bu yerda 400 qaytarishingiz mumkin
      // hozircha no-op: findByIdAndUpdate baribir urunadi
    }

    const updated = await this.clientTypesModel
      .findByIdAndUpdate(id as any, updateDto, { new: true, lean: true })
      .exec();

    if (!updated) throw new NotFoundException('ClientTypes not found');

    return { data: updated };
  }

  // CONTROLLER: remove(id, req.user.id) -> remove(id, userId)
  async remove(id: any, userId: string) {
    if (!userId) throw new BadRequestException('Unauthorized');

    const existing = await this.clientTypesModel
      .findOne({ _id: id as any, owner: userId })
      .lean<{ deleted?: boolean }>()
      .exec();

    if (!existing) throw new NotFoundException('ClientTypes not found');
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
