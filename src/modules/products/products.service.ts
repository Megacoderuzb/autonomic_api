// src/modules/products/products.service.ts
import { Model } from 'mongoose';
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Products, ProductsDocument } from 'src/schemas/Product.schema';
import { CreateProductsDto } from './dto/create-products.dto';
import { UpdateProductsDto } from './dto/update-products.dto';
import { paginate } from 'src/common/utils/pagination.util';
import { CustomQuery } from 'src/common/types/Query.type';
import filterByLang from 'src/common/utils/filterByLang';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Products.name)
    private readonly productsModel: Model<ProductsDocument>,
  ) {}

  async getAll(query: CustomQuery, req: any) {
    // only owner’s products
    query.filter = { owner: req.user.id };

    // populate type
    const paged = await paginate(this.productsModel, query, ['brand', "model","color", "category"]);

    // lang from query or header; default 'uz'
    const lang =
      (query?._l as string) ||
      (req?.headers?._l as string) ||
      '';

    const rows = Array.isArray(paged.data) ? paged.data : [];

    // translate nested field: type.typeUz/typeRu -> type.type
    const transformed = filterByLang(
      rows as any[],
      lang,
      ['brand.name', 'model.name', 'category.name' ]
    ) as unknown as any[];

    return {
      data: transformed,
      _meta: paged._meta,
    };
  }

  async getById(id: string, query: CustomQuery, req: any) {
    const doc = await this.productsModel
      .findOne({ _id: id, owner: req.user.id })
      .populate(['brand', "model","color", "category"])
      .lean();

    if (!doc) throw new BadRequestException('Productss not found');
    if ((doc as any).deleted) throw new BadRequestException('Productss is deleted');

    const lang =
      (query?._l as string) ||
      (req?.headers?._l as string) ||
      '';

    const data = filterByLang(
      doc as any,
      lang,
      ['brand.name', 'model.name', 'category.name' ]
    ) as unknown as any;

    return { data };
  }

  async create(createProductssDto: CreateProductsDto) {
    return { data: await this.productsModel.create(createProductssDto) };
  }

  async update(id: number, updateProductssDto: UpdateProductsDto) {
    const updatedProductss = await this.productsModel.findByIdAndUpdate(
      id,
      updateProductssDto,
      { new: true },
    );
    return { data: updatedProductss };
  }

  async remove(id: number, user: string) {
    return {
      data: await this.productsModel.findOneAndUpdate(
        { _id: id, owner: user },
        { deleted: true, deletedAt: Date.now() },
        { new: true },
      ),
    };
  }
}
