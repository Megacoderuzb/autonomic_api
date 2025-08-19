import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async get() {
    return this.settingsService.get();
  }

  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(AuthGuard)
  @Put()
  async update(@Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(updateSettingDto);
  }
}
