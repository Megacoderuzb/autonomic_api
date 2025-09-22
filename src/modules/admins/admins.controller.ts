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
import { AddPaymentDto, UpdateAdminDto } from './dto/update-admin.dto';
import { Request } from 'src/common/types/Request.type';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { CustomQuery } from 'src/common/types/Query.type';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) { }

  @Roles(Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Query() query: CustomQuery) {
    query.baseUrl = 'https://localhost:3001/api/admins';
    return await this.adminsService.getAll(query);
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
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
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return await this.adminsService.login(username, password);
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
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

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put()
  async updateMe(@Req() req: Request, @Body() updateAdminDto: UpdateAdminDto) {
    return await this.adminsService.update(req.user.id, updateAdminDto);
  }

  @Get('verify/:id')
  async verifyPayment(@Param('id') id: string) {
    return await this.adminsService.verifyPayment(id);
  }

  @Get(':id')
  async getbyid(
    @Param('id') id: string,
  ) {
    return await this.adminsService.getMe(id);
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() addPaymentDto: AddPaymentDto,
  ) {
    return await this.adminsService.payment(id, addPaymentDto);
  }


  @UseGuards(AuthGuard)
  @Roles(Role.SUPERADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.adminsService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Roles(Role.SUPERADMIN)
  @Delete('profile')
  async removeProfile(@Req() req: Request) {
    return await this.adminsService.remove(req.user.id);
  }
}
