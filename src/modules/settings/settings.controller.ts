import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // GET /settings — agar currencyRate.cbu bo'sh bo'lsa, CBU’dan olib saqlab qaytaradi
  @Get()
  async get() {
    return this.settingsService.get();
  }

  // PUT /settings — avval eski currencyRate ni logs ga push, keyin yangisini yozish
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put()
  async update(@Body() dto: UpdateSettingDto) {
    return this.settingsService.update(dto);
  }

  // Ixtiyoriy: qo'lda CBU ni yangilash
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get('currency/refresh')
  async refreshCbu() {
    return this.settingsService.refreshCbuRate();
  }
}
