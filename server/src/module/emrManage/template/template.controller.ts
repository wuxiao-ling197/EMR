//模板管理
import { Controller, Get, Post, Body, Put, Param, Query, Res, Delete, Request, UseGuards, CanActivate } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { query, Response } from 'express';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { RequireRole } from 'src/common/decorators/require-role.decorator';
import { CreateTemplateDto, FindTemplateDto } from './dto';


/**
 * 处理传入的请求，并调用服务来处理业务逻辑。
 */
@ApiTags('模板管理')
@Controller('emrManage/EMRModules')
export class TemplateController {
  constructor(private readonly TemplateService: TemplateService) { }
  @ApiOperation({
    summary: '查询模板列表',
  })
  // @RequirePermission('emr:Patient:add')//权限标识
  @Get('findTemplate')
  findTemplateList(@Query() query: FindTemplateDto) {
    console.log('========findTemplate========');
    return this.TemplateService.findAll(query);
  }

  @ApiOperation({
    summary: '查询模板',
  })
  // @RequirePermission('emr:Patient:add')//权限标识
  @Get('selectTemplate')
  selectTemplate(@Query() query: any) {
    console.log(query);

    console.log('========selectOneTemplate========');
    return this.TemplateService.findOne(query);
  }

  @ApiOperation({
    summary: '创建模板',
  })
  // @RequirePermission('emr:Patient:add')//权限标识
  @Post('createTemplate')
  createTemplate(@Body() createTemplateDto: any) {
    console.log('========createTemplate========');
    try {
      return this.TemplateService.createTemplate(createTemplateDto);
    } catch (err) {
      console.log(err);
    }
  }

  @ApiOperation({
    summary: '校验模板名',
  })
  // @RequirePermission('emr:Patient:add')//权限标识
  @Post('checkOutTemplateName')
  checkOutTemplateName(@Body() checkOutDto: any) {
    console.log('========checkOutTemplateName========');
    try {
      return this.TemplateService.checkOutTemplate(checkOutDto);
    } catch (err) {
      console.log(err);
    }
  }

}
