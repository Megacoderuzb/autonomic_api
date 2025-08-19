import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Settings, SettingsDocument } from 'src/schemas/Settings.schema';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Model } from 'mongoose';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel: Model<SettingsDocument>,
  ) {}

  async get() {
    const data = await this.settingsModel.findOne();
    if (!data) {
      const newData = await this.settingsModel.create({});
      return {
        data: newData,
      };
    }
    return {
      data,
    };
  }

  async update(updateSettingDto: UpdateSettingDto) {
    const data = await this.settingsModel.findOneAndUpdate(
      {},
      updateSettingDto,
      {
        new: true,
      },
    );
    return {
      data,
    };
  }
}
