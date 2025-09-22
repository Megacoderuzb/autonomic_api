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
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Request } from 'src/common/types/Request.type';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { CustomQuery } from 'src/common/types/Query.type';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Query() query: CustomQuery, @Req() req: any) {
    query.baseUrl = process.env.SITE_URL;
    return await this.brandService.getAll(query, req);
  }


  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get(':id')
  async getbyId(@Param("id") id: string) {
    
    return await this.brandService.getById(id);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createBrandDto: CreateBrandDto, @Req() req: any) {
    createBrandDto.owner =  req.user.id
    return await this.brandService.create(createBrandDto);
  }



  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put()
  async updateMe(@Req() req: Request, @Body() updateBrandDto: UpdateBrandDto) {
    return await this.brandService.update(req.user.id, updateBrandDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return await this.brandService.update(id, updateBrandDto);
  }

  @UseGuards(AuthGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.brandService.remove(id,req.user.id);
  }

}
