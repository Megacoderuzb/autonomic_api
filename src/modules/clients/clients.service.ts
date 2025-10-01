// src/modules/clients/clients.service.ts
import { Model } from 'mongoose';
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Client, ClientDocument } from 'src/schemas/Client.schema';
import { CreateClientsDto } from './dto/create-clients.dto';
import { UpdateClientsDto } from './dto/update-clients.dto';
import { paginate } from 'src/common/utils/pagination.util';
import { CustomQuery } from 'src/common/types/Query.type';
import filterByLang from 'src/common/utils/filterByLang';

@Injectable()
export class ClientService {
  constructor(
    @InjectModel(Client.name)
    private readonly clientsModel: Model<ClientDocument>,
  ) {}

  async getAll(query: CustomQuery, req: any) {
    // only owner’s clients
    query.filter = { owner: req.user.id };

    // populate type
    const paged = await paginate(this.clientsModel, query, ['type']);

    // lang from query or header; default 'uz'
    const lang =
      (query?.lang as string) ||
      (req?.headers?.lang as string) ||
      'uz';

    const rows = Array.isArray(paged.data) ? paged.data : [];

    // translate nested field: type.typeUz/typeRu -> type.type
    const transformed = filterByLang(
      rows as any[],
      lang,
      ['type.type']
    ) as unknown as any[];

    return {
      data: transformed,
      _meta: paged._meta,
    };
  }

  async getById(id: string, query: CustomQuery, req: any) {
    const doc = await this.clientsModel
      .findOne({ _id: id, owner: req.user.id })
      .populate('type')
      .lean();

    if (!doc) throw new BadRequestException('Clients not found');
    if ((doc as any).deleted) throw new BadRequestException('Clients is deleted');

    const lang =
      (query?.lang as string) ||
      (req?.headers?.lang as string) ||
      'uz';

    const data = filterByLang(
      doc as any,
      lang,
      ['type.type']
    ) as unknown as any;

    return { data };
  }

  async create(createClientsDto: CreateClientsDto) {
    return { data: await this.clientsModel.create(createClientsDto) };
  }

  async update(id: number, updateClientsDto: UpdateClientsDto) {
    const updatedClients = await this.clientsModel.findByIdAndUpdate(
      id,
      updateClientsDto,
      { new: true },
    );
    return { data: updatedClients };
  }

  async remove(id: number, user: string) {
    return {
      data: await this.clientsModel.findOneAndUpdate(
        { _id: id, owner: user },
        { deleted: true, deletedAt: Date.now() },
        { new: true },
      ),
    };
  }
}
