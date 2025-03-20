import { Controller, Get, Post, Body, Put, Param, Query, Res, Delete, Request, UseGuards, CanActivate } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MetadataService } from './metadata.service';

import { CreateMetadataDto, ListMetadataDto, ChangeStatusDto, SelectFieldListDto } from './dto/index';

/**
 * 处理传入的请求，并调用服务来处理业务逻辑。
 */
@ApiTags('元数据管理')
@Controller('emrManage/Metadata')
export class MetadataController {
  constructor(private readonly MetadataService: MetadataService) { }
  @ApiOperation({
    summary: '获取所有table实体元数据',
  })
  // @RequirePermission('emr:Patient:add')//权限标识
  @Get('entitiesMetadata')
  getEntitiesField(@Query() query: any) {
    console.log('========getEntitiesField========');
    return this.MetadataService.getField();
  }

  @ApiOperation({
    summary: 'fieldList-查询单个实体元数据 设置表单数据源',
  })
  // @RequirePermission('emr:Patient:add')//权限标识
  @Get('hospitalPatientMetadata')
  getPatientField(@Query('entityName') entityName: string) {
    console.log('========getPatientEntityField========');
    return this.MetadataService.getPatientEntityField({ entityComment: entityName });
  }

  @ApiOperation({
    summary: '元数据-获取大类categoryList',
  })
  // @UseGuards(<CanActivate[]>[])
  // @RequirePermission('emr:Metadata:add')//权限标识
  @Get('/category')
  findCategory() {
    return this.MetadataService.findCategory();
  }

  @ApiOperation({
    summary: '元数据-根据category查询值域code和codeName',
  })
  // @RequirePermission('system:Metadata:query')
  @Get('codelist:category')
  findAll(@Param('category') category: string) {
    return this.MetadataService.findCodeByCategoryCode(category);
  }

  @ApiOperation({
    summary: '元数据-根据code或者codeName查询值value和valueMean',
  })
  // @RequirePermission('system:Metadata:query')
  @Get('valuelist:code')
  findOne(@Query('code') code: string) {
    // return this.MetadataService.findOne(+MetadataId);//通过一元运算将string转换成number
    return this.MetadataService.findValueListByCode(code);
  }

  @ApiOperation({
    summary: 'fieldList-根据category获取code和codename 设置表单数据源',
  })
  @ApiQuery({
    type: SelectFieldListDto,
    required: true,
  })
  // @RequireRole('admin')
  @Get('fieldList')
  getFieldList(@Query() query: SelectFieldListDto) {
    console.log('getFieldListController-----80---');
    console.log(query.category);
    return this.MetadataService.getFieldList(query);
  }

  @ApiOperation({
    summary: '元数据-根据code或者codeName查询数据源的值value和valueMean，以选项对象列表形式返回',
  })
  // @RequirePermission('system:Metadata:query')
  @Get('getDynamicOptions')
  getOptions(@Query('code') code: string) {
    console.log('setOptionsCode:::');
    console.log(code);
    // return this.MetadataService.findOne(+MetadataId);//通过一元运算将string转换成number
    return this.MetadataService.findValueListByCode(code);
  }
}
