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
import { CreditTypesService } from './credit-types.service';
import { CreateCreditTypesDto } from './dto/create-credit-types.dto';
import { UpdateCreditTypesDto } from './dto/update-credit-types.dto';
import { Request } from 'src/common/types/Request.type';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { CustomQuery } from 'src/common/types/Query.type';

@Controller('credit-types')
export class CreditTypesController {
  constructor(private readonly creditTypesService: CreditTypesService) {}

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Query() query: CustomQuery, @Req() req: any) {
    query.baseUrl = `${process.env.SITE_URL}${req.path}`;
    query._l = req.headers._l;
    return await this.creditTypesService.getAll(query, req);
  }


  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get(':id')
  async getbyId(@Param("id") id: string,@Query() query: CustomQuery,@Req() req: any) {
    query.baseUrl = `${process.env.SITE_URL}${req.path}`;
    query._l = req.headers._l;
    return await this.creditTypesService.getById(id, query, req);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createCreditTypesDto: CreateCreditTypesDto, @Req() req: any) {
    createCreditTypesDto.owner =  req.user.id
    return await this.creditTypesService.create(createCreditTypesDto);
  }



  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put()
  async updateMe(@Req() req: Request, @Body() updateCreditTypesDto: UpdateCreditTypesDto) {
    return await this.creditTypesService.update(req.user.id, updateCreditTypesDto);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCreditTypesDto: UpdateCreditTypesDto,
  ) {
    return await this.creditTypesService.update(id, updateCreditTypesDto);
  }

  @UseGuards(AuthGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req: any) {
    return await this.creditTypesService.remove(id,req.user.id);
  }

}
