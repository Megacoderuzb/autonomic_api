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
import { ClientService } from './clients.service';
import { CreateClientsDto } from './dto/create-clients.dto';
import { UpdateClientsDto } from './dto/update-clients.dto';
import { Request } from 'src/common/types/Request.type';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthGuard } from 'src/common/guards/auth.guards';
import { CustomQuery } from 'src/common/types/Query.type';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientsService: ClientService) {}

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Query() query: CustomQuery, @Req() req: any) {
    query.baseUrl = process.env.SITE_URL;
    return await this.clientsService.getAll(query, req);
  }


  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Get(':id')
  async getbyId(@Param("id") id: string, @Req() req: any) {
    

    return await this.clientsService.getById(id, req.query, req);
  }

  @Roles(Role.ADMIN , Role.SUPERADMIN)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createClientDto: CreateClientsDto, @Req() req: any) {
    createClientDto.owner =  req.user.id
    return await this.clientsService.create(createClientDto);
  }


  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateClientDto: UpdateClientsDto,
  ) {
    return await this.clientsService.update(id, updateClientDto);
  }

  @UseGuards(AuthGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req: any) {
    return await this.clientsService.remove(id,req.user.id);
  }

}
