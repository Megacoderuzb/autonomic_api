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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Request } from 'src/common/types/Request.type';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { CustomQuery } from 'src/common/types/Query.type';

@Controller('category')
export class CategoryController {
  constructor(private readonly clientTypesService: CategoryService) {}

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Query() query: CustomQuery, @Req() req: any) {
    query.baseUrl = `${process.env.SITE_URL}${req.path}`;
    query._l = req.headers._l;
    return await this.clientTypesService.getAll(query, req);
  }


  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get(':id')
  async getbyId(@Param("id") id: string,@Query() query: CustomQuery,@Req() req: any) {
    query.baseUrl = `${process.env.SITE_URL}${req.path}`;
    query._l = req.headers._l;
    return await this.clientTypesService.getById(id, query, req);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: any) {
    createCategoryDto.owner =  req.user.id
    return await this.clientTypesService.create(createCategoryDto);
  }



  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put()
  async updateMe(@Req() req: Request, @Body() updateCategoryDto: UpdateCategoryDto) {
    return await this.clientTypesService.update(req.user.id, updateCategoryDto);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.clientTypesService.update(id, updateCategoryDto);
  }

  @UseGuards(AuthGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req: any) {
    return await this.clientTypesService.remove(id,req.user.id);
  }

}
