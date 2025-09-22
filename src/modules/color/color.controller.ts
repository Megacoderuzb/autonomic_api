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
import { ColorService } from './color.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { Request } from 'src/common/types/Request.type';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { CustomQuery } from 'src/common/types/Query.type';

@Controller('color')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Query() query: CustomQuery, @Req() req: any) {
    query.baseUrl = process.env.SITE_URL;
    return await this.colorService.getAll(query, req);
  }


  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get(':id')
  async getbyId(@Param("id") id: string) {
    
    return await this.colorService.getById(id);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createColorDto: CreateColorDto, @Req() req: any) {
    createColorDto.owner =  req.user.id
    return await this.colorService.create(createColorDto);
  }



  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Put()
  async updateMe(@Req() req: Request, @Body() updateColorDto: UpdateColorDto) {
    return await this.colorService.update(req.user.id, updateColorDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateColorDto: UpdateColorDto,
  ) {
    return await this.colorService.update(id, updateColorDto);
  }

  @UseGuards(AuthGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.colorService.remove(id,req.user.id);
  }

}
