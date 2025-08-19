import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Request } from 'src/common/types/Request.type';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { CustomQuery } from 'src/common/types/Query.type';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  async getAll(@Query() query: CustomQuery) {
    query.baseUrl = 'https://localhost:3001/api/admins';
    return await this.adminsService.getAll(query);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    return await this.adminsService.getMe(req.user.id);
  }

  @Post('register')
  async create(@Body() createAdminDto: CreateAdminDto) {
    return await this.adminsService.create(createAdminDto);
  }

  @Post('login')
  async login(
    @Body('login') login: string,
    @Body('password') password: string,
  ) {
    return await this.adminsService.login(login, password);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Put('reset-password')
  async resetPassword(
    @Req() req: Request,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return await this.adminsService.resetPassword(
      req.user.id,
      resetPasswordDto,
    );
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Put()
  async updateMe(@Req() req: Request, @Body() updateAdminDto: UpdateAdminDto) {
    return await this.adminsService.update(req.user.id, updateAdminDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return await this.adminsService.update(id, updateAdminDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.adminsService.remove(id);
  }
}
