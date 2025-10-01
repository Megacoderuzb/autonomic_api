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
import { SalesService } from './sales.service';
import { CreateSalesDto } from './dto/create-sales.dto';
import { UpdateSalesDto } from './dto/update-sales.dto';
import { Request } from 'src/common/types/Request.type';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { CustomQuery } from 'src/common/types/Query.type';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Query() query: CustomQuery, @Req() req: any) {
    query.baseUrl = `${process.env.SITE_URL}${req.path}`;
    query.lang = req.headers.lang;
    return await this.salesService.getAll(query, req);
  }


  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get(':id')
  async getbyId(@Param("id") id: string,@Query() query: CustomQuery,@Req() req: any) {
    query.baseUrl = `${process.env.SITE_URL}${req.path}`;
    query.lang = req.headers.lang;
    return await this.salesService.getById(id, query, req);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createSalesDto: CreateSalesDto, @Req() req: any) {
    createSalesDto.owner =  req.user.id
    return await this.salesService.create(createSalesDto);
  }



  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put()
  async updateMe(@Req() req: Request, @Body() updateSalesDto: UpdateSalesDto) {
    return await this.salesService.update(req.user.id, updateSalesDto);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSalesDto: UpdateSalesDto,
  ) {
    return await this.salesService.update(id, updateSalesDto);
  }

  @UseGuards(AuthGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.salesService.remove(id, req.user.id);
  }

}
