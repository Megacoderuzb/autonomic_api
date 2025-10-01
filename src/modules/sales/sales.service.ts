import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Sales, SalesDocument } from 'src/schemas/Sales.schema';
import { Products, ProductsDocument } from 'src/schemas/Product.schema';
import { CreditTypes, CreditTypesDocument } from 'src/schemas/CreditTypes.schema';

import { CreateSalesDto } from './dto/create-sales.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sales.name) private readonly salesModel: Model<SalesDocument>,
    @InjectModel(Products.name) private readonly productsModel: Model<ProductsDocument>,
    @InjectModel(CreditTypes.name) private readonly creditTypeModel: Model<CreditTypesDocument>,
  ) { }

  /* ----------------------------- HELPERS ----------------------------- */

  private sumPayments(payments?: { amount?: number }[]) {
    return (payments ?? []).reduce((s, p) => s + (p.amount || 0), 0);
  }

  private async calcBaseTotal(
    products: { product: string; quantity?: number }[],
    isCredit: boolean,
    creditType?: CreditTypesDocument | null,
  ) {
    let total = 0;
    for (const item of products) {
      const prod = await this.productsModel.findById(item.product);
      if (!prod) throw new BadRequestException(`Product ${item.product} not found`);
      total += (prod.salePrice || 0) * (item.quantity || 1);
    }
    if (isCredit && creditType) {
      const pct = creditType.percentage || 0;        // masalan 24 => 24%
      total = total * (1 + pct / 100);               // foizni qo‘shamiz
    }
    return total;
  }

  /* ------------------------------- READ ------------------------------ */

  async getAll(query: any, req: any) {
    const sales = await this.salesModel
      .find({ deleted: false, owner: req.user.id })
      .populate(['owner', 'products.product', 'client', 'creditType','products.product.brand','products.product.model','products.product.color','products.product.category']);
    return { data: sales };
  }

  async getById(id: string, query: any, req: any) {
    const sale = await this.salesModel
      .findById(id)
      .populate(['owner', 'products.product', 'client', 'creditType','products.product.brand','products.product.model','products.product.color','products.product.category']);
    if (!sale || sale.deleted) throw new NotFoundException('Sale not found');
    if (sale.owner.toString() !== req.user.id) {
      throw new ForbiddenException('Not your sale');
    }
    return { data: sale };
  }

  /* ------------------------------ CREATE ---------------------------- */

  async create(dto: CreateSalesDto) {
    // 1) Bazaviy total (foizsiz) — mahsulotlar yig'indisi
    let baseTotal = 0;
    for (const item of dto.products) {
      const prod = await this.productsModel.findById(item.product);
      if (!prod) throw new BadRequestException(`Product ${item.product} not found`);
      baseTotal += (prod.salePrice || 0) * (item.quantity || 1);
    }
    baseTotal = Math.round(baseTotal);

    // 2) Yig'ilgan to'lovlar
    const paid = (dto.payments ?? []).reduce((s, p) => s + (p.amount || 0), 0);

    // 3) Sotuv turlari bo‘yicha ishlov
    if (dto.saleType === 'CASH') {
      // CASH: foiz qo‘shilmaydi, paid >= total shart
      const total = baseTotal;
      if (paid < total) {
        throw new BadRequestException('For CASH sales, paid must be greater than or equal to total');
      }
      const sale = await this.salesModel.create({
        ...dto,
        total,
        paid,
        isCompleted: true,
        payments: dto.payments ?? [],
        // creditSchedule yuborilmaydi
      });
      return { data: sale };
    }

    if (dto.saleType === 'DEBT') {
      // DEBT: foiz yo‘q, debtDeadline majburiy
      if (!dto.debtDeadline) {
        throw new BadRequestException('Debt sales must have a debtDeadline');
      }
      const total = baseTotal;
      const sale = await this.salesModel.create({
        ...dto,
        total,
        paid,
        isCompleted: false,
        payments: dto.payments ?? [],
        // creditSchedule yuborilmaydi
      });
      return { data: sale };
    }

    if (dto.saleType === 'CREDIT') {

      // 3.1) Kredit turi tekshiruvi
      if (!dto.creditType) throw new BadRequestException('Credit type is required for CREDIT sales');
      const creditType = await this.creditTypeModel.findById(dto.creditType);
      if (!creditType) throw new BadRequestException('Credit type not found');

      // 3.2) Yakuniy total (base + interest)
      const pct = creditType.percentage ?? 0; // masalan 24 => 24%
      const interestAmount = Math.round(baseTotal * (pct / 100));
      const total = baseTotal + interestAmount;

      // 3.3) Minimal boshlang‘ich to‘lov tekshiruvi
      //    - agar creditType.minimalAmount berilgan bo‘lsa shuni olamiz
      //    - aks holda minimal % asosida (total * minimal%) / 100
      const minimalAmount =
        creditType.minimalAmount ??
        Math.round((total * (creditType.minimal ?? 0)) / 100);

      if (paid < (minimalAmount || 0)) {
        throw new BadRequestException(
          `Minimum initial payment for this credit type is ${minimalAmount}`,
        );
      }


      const duration = creditType.duration || 1;
      const remain = Math.max(0, total - paid);
      const monthly = Math.ceil(remain / duration);

      const cs: any = { ...(dto.creditSchedule ?? {}) };
      cs.month = duration;          // jami oy
      cs.monthly = monthly;           // oylik to‘lov (yaratilganda fix bo‘ladi)
      cs.paid = paid;              // down payment (boshlang‘ich)
      cs.completed = 0;                 // yopilgan oylar (startda 0)
      cs.credited = remain;            // qolgan qarz = total - paid
      const due = new Date();
      due.setMonth(due.getMonth() + 1); // 1-oy to‘lov sanasi
      cs.dueDate = due;

      // 3.5) CREDIT sotuvni yaratish
      const sale = await this.salesModel.create({
        ...dto,
        total,               // faqat yakuniy total saqlaymiz
        paid,
        isCompleted: false,  // kredit yaratishda doim false
        payments: dto.payments ?? [],
        creditSchedule: cs,  // <-- object sifatida
      });

      return { data: sale };
    }

    throw new BadRequestException('Invalid saleType');
  }

  async update(id: string, dto: UpdateSalesDto) {
    const sale = await this.salesModel.findById(id);
    if (!sale || sale.deleted) throw new NotFoundException('Sale not found');
    if (sale.isCompleted) throw new BadRequestException('Cannot update a completed sale');

    // Agar productlar yangilansa totalni qayta hisoblaymiz
    if (dto.products) {
      const isCredit = sale.saleType === 'CREDIT';
      const creditType =
        isCredit && sale.creditType
          ? await this.creditTypeModel.findById(sale.creditType)
          : null;

      dto.total = await this.calcBaseTotal(dto.products, isCredit, creditType);
    }

    // Yangi to‘lovlar
    const newlyPaid = this.sumPayments(dto.payments);
    const newPaid = (sale.paid || 0) + newlyPaid;
    const mergedPayments = [...(sale.payments || []), ...(dto.payments ?? [])];

    const updates: any = {
      ...dto,
      payments: mergedPayments,
      paid: newPaid,
    };

    if (sale.saleType === 'CREDIT') {
      const current = sale.creditSchedule ?? ({} as any);
      const cs: any = { ...current, ...(dto.creditSchedule ?? {}) };

      const month = cs.month ?? current.month ?? 1;  // umumiy oylar
      const monthly = cs.monthly ?? current.monthly ?? 0;  // oylik to‘lov (yaratilganda fix)
      const dp = cs.paid ?? current.paid ?? 0;  // down payment

      // Kredit boshlanganidan beri oyliklarga ketgan summa
      const paidSinceStart = Math.max(0, newPaid - dp);

      // Nechta oy yopildi (0..month)
      const newCompleted = Math.min(
        month,
        Math.floor(monthly > 0 ? paidSinceStart / monthly : 0),
      );

      // Qolgan qarz (informativ): (total - dp) - paidSinceStart
      const creditedRemaining = Math.max(
        0,
        (sale.total || 0) - dp - paidSinceStart,
      );

      cs.completed = newCompleted;
      cs.credited = creditedRemaining;

      updates.creditSchedule = cs;

      // Yakunlanganmi?
      updates.isCompleted = newCompleted >= month || newPaid >= (sale.total || 0);
    } else {
      // CASH/DEBT
      const targetTotal = dto.total ?? sale.total ?? 0;
      updates.isCompleted = newPaid >= targetTotal;
    }

    const updated = await this.salesModel.findByIdAndUpdate(id, updates, { new: true });
    return { data: updated };
  }

  /* ------------------------------ REMOVE ---------------------------- */

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
