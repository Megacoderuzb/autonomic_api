import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Request } from 'src/common/types/Request.type';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/role.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @Roles(Role.USER)
  @UseGuards(AuthGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return this.usersService.getMe(req.user.id);
  }

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  @Post('confirm/register/:uuid')
  create(@Body('code') code: string, @Param('uuid') uuid: string) {
    return this.usersService.confirmRegister(uuid, code);
  }

  @Post('login')
  login(@Body('phoneNumber') phoneNumber: number) {
    return this.usersService.login(phoneNumber);
  }

  @Post('confirm/login/:uuid')
  confirmLogin(@Body('code') code: string, @Param('uuid') uuid: string) {
    return this.usersService.confirmLogin(uuid, code);
  }

  @Roles(Role.USER)
  @UseGuards(AuthGuard)
  @Put()
  update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Roles(Role.USER)
  @UseGuards(AuthGuard)
  @Delete()
  remove(@Req() req: Request) {
    return this.usersService.remove(req.user.id);
  }
}
