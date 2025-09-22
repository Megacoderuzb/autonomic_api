import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Sales, SalesDocument } from 'src/schemas/Sales.schema';
import { Products, ProductsDocument } from 'src/schemas/Product.schema';
import { Model } from 'mongoose';
import { CreateSalesDto } from './dto/create-sales.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sales.name) private readonly salesModel: Model<SalesDocument>,
    @InjectModel(Products.name) private readonly productsModel: Model<ProductsDocument>,
  ) { }

  async getAll(query: any, req: any) {
    const sales = await this.salesModel.find({ deleted: false, owner: req.user.id }).populate(['owner', 'products.product', 'client', 'creditType']);
    return { data: sales };
  }

  async getById(id: string, query: any, req: any) {
    const sale = await this.salesModel.findById(id).populate(['owner', 'products.product', 'client', 'creditType']);
    if (!sale || sale.deleted) throw new NotFoundException('Sale not found');
    if (sale.owner.toString() !== req.user.id) throw new ForbiddenException('Not your sale');
    return { data: sale };
  }

  async create(createSalesDto: CreateSalesDto) {
    // Calculate total
    let total = 0;
    for (const item of createSalesDto.products) {
      const product = await this.productsModel.findById(item.product);
      if (!product) throw new BadRequestException(`Product ${item.product} not found`);
      total += (product.salePrice || 0) * (item.quantity || 1);
    }
    let isCompleted = false;
    let paid = createSalesDto.payments?.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    if (createSalesDto.saleType === 'CASH' && total <= paid) {
      isCompleted = true;
      const sale = await this.salesModel.create({
        ...createSalesDto,
        total,
        isCompleted,
        paid,
        payments: createSalesDto.payments || [],
        creditSchedule: createSalesDto.creditSchedule || [],
      });
      return { data: sale };
    }
    console.log("second");
    console.log(createSalesDto.saleType == 'DEBT');
    console.log(createSalesDto.debtDeadline );
    
    if (createSalesDto.saleType == 'DEBT' && createSalesDto.debtDeadline ) {
      isCompleted = false;
      console.log("third");
      
        const sale = await this.salesModel.create({
        ...createSalesDto,
        total,
        paid,
        isCompleted,
        payments: createSalesDto.payments || [],
        creditSchedule: createSalesDto.creditSchedule || [],
      });
      console.log(sale);
      
      return { data: sale };
      // 1760352835255
    }

    if (createSalesDto.saleType === 'CREDIT' && createSalesDto.creditSchedule && createSalesDto.creditSchedule.length > 0) {
      isCompleted = false;
        const sale = await this.salesModel.create({
        ...createSalesDto,
        total,
        paid,
        isCompleted,
        payments: createSalesDto.payments || [],
        creditSchedule: createSalesDto.creditSchedule || [],
      });
      return { data: sale };
      
    }

  }

  async update(id: string, updateSalesDto: UpdateSalesDto) {
    const sale = await this.salesModel.findById(id);
    if (!sale || sale.deleted) throw new NotFoundException('Sale not found');
    // Optionally recalculate total if products are updated
    if (updateSalesDto.products) {
      let total = sale.total || 0;
      for (const item of updateSalesDto.products) {
        const product = await this.productsModel.findById(item.product);
        if (!product) throw new BadRequestException(`Product ${item.product} not found`);
        total += (product.salePrice || 0) * (item.quantity || 1);
      }
      updateSalesDto.total = total;
    }
    // Prevent updating completed sales
    if (sale.isCompleted) throw new BadRequestException('Cannot update a completed sale');
    // Update isCompleted status based on payments and total
    let paid = sale.paid || 0;
    if (updateSalesDto.payments) {
      paid += updateSalesDto.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      sale.payments = [...(sale.payments || []), ...updateSalesDto.payments];
    }
    if (updateSalesDto.total && paid >= updateSalesDto.total) {
      updateSalesDto.isCompleted = true;
      updateSalesDto.paid = paid;
      // updateSalesDto.paid = updateSalesDto.total;
    } else if (paid >= sale.total) {
      updateSalesDto.isCompleted = true;
      updateSalesDto.paid = paid;
      // updateSalesDto.paid = sale.total;
    } else {
      updateSalesDto.isCompleted = false;
      updateSalesDto.paid = paid;
    }
    // If saleType or debtDeadline is updated, validate them
    // if (updateSalesDto.saleType && updateSalesDto.saleType === 'DEBT') {
    //   if (!updateSalesDto.debtDeadline && !sale.debtDeadline) {
    //     throw new BadRequestException('Debt sales must have a debtDeadline');
    //   }
    // }



    const updated = await this.salesModel.findByIdAndUpdate(id, updateSalesDto, { new: true });
    return { data: updated };
  }

  async remove(id: string, userId: string) {
    const sale = await this.salesModel.findById(id);
    if (!sale || sale.deleted) throw new NotFoundException('Sale not found');
    if (sale.owner.toString() !== userId) throw new ForbiddenException('Not your sale');
    sale.deleted = true;
    sale.deletedAt = Date.now();
    await sale.save();
    return { data: sale };
  }
}