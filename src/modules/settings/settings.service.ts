import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
import { Settings, SettingsDocument } from 'src/schemas/Settings.schema';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel: Model<SettingsDocument>,
  ) {}

  /** CBU JSON dan USD joriy kursini oladi */
  private async fetchCbuUsdRate(): Promise<number> {
    // joriy kun kurslari: https://cbu.uz/uz/arkhiv-kursov-valyut/json/
    const { data } = await axios.get(
      'https://cbu.uz/uz/arkhiv-kursov-valyut/json/',
      { timeout: 10_000 },
    );
    const usd = Array.isArray(data) ? data.find((x: any) => x?.Ccy === 'USD') : null;
    if (!usd?.Rate) throw new Error('CBU USD rate is missing');
    const rate = parseFloat(String(usd.Rate).replace(',', '.'));
    if (Number.isNaN(rate)) throw new Error('CBU USD rate parse error');
    return rate;
  }

  /** Subdoc defaultlarini kafolatlaydi */
  private ensureDefaults(doc: SettingsDocument) {
    if (!doc.currencyRate) {
      // currencyRate bo'sh bo'lsa boshlang'ich qiymatlar
      doc.currencyRate = {
        cbu: null,
        manual: null,
        selected: 'cbu',
        logs: [],
      } as any;
    } else {
      doc.currencyRate.logs ||= [];
      doc.currencyRate.selected ||= 'cbu';
    }
  }

  /** Eski currencyRate snapshotini logs ga qo'shish */
  private pushOldToLogs(doc: SettingsDocument) {
    this.ensureDefaults(doc);
    doc.currencyRate.logs.push({
      date: Date.now(),
      cbu: doc.currencyRate.cbu ?? null,
      manual: doc.currencyRate.manual ?? null,
      selected: doc.currencyRate.selected ?? 'cbu',
    } as any);

    // ixtiyoriy limit
    if (doc.currencyRate.logs.length > 365) {
      doc.currencyRate.logs = doc.currencyRate.logs.slice(-365);
    }
  }

  /** GET /settings — cbu yo'q bo'lsa CBU’dan olib saqlaydi, keyin qaytaradi */
  async get() {
    let doc = await this.settingsModel.findOne();
    if (!doc) doc = await this.settingsModel.create({});

    this.ensureDefaults(doc);

    if (doc.currencyRate.cbu == null) {
      try {
        const cbu = await this.fetchCbuUsdRate();
        // eski qiymatni logga saqlaymiz (null bo'lsa ham tarix sifatida yozamiz)
        this.pushOldToLogs(doc);
        // yangilaymiz
        doc.currencyRate.cbu = cbu;
        if (doc.currencyRate.manual == null) {
          doc.currencyRate.manual = cbu; // ixtiyoriy: manual bo'sh bo'lsa, cbu ga tenglab qo'yish
        }
        await doc.save();
      } catch (err) {
        this.logger.warn(`CBU fetch failed on GET: ${String(err)}`);
      }
    }

    return { data: doc };
  }

  /** PUT /settings — avval eski qiymat logs ga, so'ng yangisini yozish (toObject ishlatilmaydi) */
  async update(updateDto: UpdateSettingDto) {
    let doc = await this.settingsModel.findOne();
    if (!doc) doc = await this.settingsModel.create({});
    this.ensureDefaults(doc);

    // 1) eski qiymatni logs ga saqlaymiz
    this.pushOldToLogs(doc);

    // 2) agar selected='cbu' bo'lsa va dto.da cbu kiritilmagan bo'lsa, CBU’dan olib to'ldirib beramiz (ixtiyoriy)
    if (updateDto?.currencyRate?.selected === 'cbu' && updateDto.currencyRate.cbu == null) {
      try {
        updateDto.currencyRate.cbu = await this.fetchCbuUsdRate();
      } catch (err) {
        this.logger.warn(`CBU fetch failed on UPDATE: ${String(err)}`);
      }
    }

    // 3) yangisini yozamiz — oddiy merge (toObject YO'Q)
    const currentCR: any = doc.currencyRate ?? {};
    const incomingCR: any = updateDto.currencyRate ?? {};
    const mergedCurrencyRate = {
      ...currentCR,
      ...incomingCR,
      logs: currentCR.logs ?? [], // loglarni saqlab qolamiz
    };

    // boshqa fieldlar bilan birga set
    doc.set({
      ...updateDto,
      currencyRate: mergedCurrencyRate,
    });

    // Ba'zida subdoc o'zgarishini aniq belgilash foydali bo'ladi:
    // doc.markModified('currencyRate');

    await doc.save();
    return { data: doc };
  }

  /** Qo'lda yangilash: CBU’dan olib keladi, avval eski qiymat logs ga */
  async refreshCbuRate() {
    let doc = await this.settingsModel.findOne();
    if (!doc) doc = await this.settingsModel.create({});
    this.ensureDefaults(doc);

    const old = doc.currencyRate.cbu ?? null;

    try {
      const fresh = await this.fetchCbuUsdRate();
      this.pushOldToLogs(doc);
      doc.currencyRate.cbu = fresh;
      await doc.save();

      return {
        data: doc,
        message: `CBU rate refreshed: ${old} -> ${fresh}`,
      };
    } catch (err) {
      this.logger.warn(`CBU fetch failed on manual refresh: ${String(err)}`);
      return { data: doc, message: 'CBU fetch failed; rate not changed' };
    }
  }

  /**
   * Har kuni 00:00 (Asia/Tashkent) — CBU’dan eng oxirgi kursni olib,
   * avval eski qiymatni logs ga saqlaydi, so'ng yangilaydi.
   */
  @Cron('0 0 * * *', { timeZone: 'Asia/Tashkent' })
  async nightlyCbuRefresh() {
    this.logger.log('Nightly CBU refresh started');
    let doc = await this.settingsModel.findOne();
    if (!doc) doc = await this.settingsModel.create({});
    this.ensureDefaults(doc);

    try {
      const fresh = await this.fetchCbuUsdRate();
      this.pushOldToLogs(doc);
      doc.currencyRate.cbu = fresh;
      await doc.save();
      this.logger.log(`Nightly CBU refresh done: ${fresh}`);
    } catch (err) {
      this.logger.warn(`Nightly CBU refresh failed: ${String(err)}`);
    }
  }
}
