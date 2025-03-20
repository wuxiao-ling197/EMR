import { Controller, Get, Post, Body, Put, Param, Query, Res, Delete, Request, UseGuards, CanActivate } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DynamicOptionsService } from './dynamicOptions.service';
import { query, Response } from 'express';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { RequireRole } from 'src/common/decorators/require-role.decorator';
import { DynamicOptionsDto, SelectDoctorDto } from './dto';


/**
 * 处理传入的请求，并调用服务来处理业务逻辑。
 */
@ApiTags('表单选框动态选项')
@Controller('emrManage/dynamicOptions')
export class DynamicOptionsController {
    constructor(private readonly DynamicOptionsService: DynamicOptionsService) { }
    @ApiOperation({
        summary: '获取部门选项列表',
    })
    // @RequirePermission('emr:DynamicOptions:add')//权限标识
    @Get('deptOptionlist')
    getDeptOptions() {
        console.log('========findDeptOptions========');
        return this.DynamicOptionsService.getDeptOptions();
    }

    @ApiOperation({
        summary: '根据科室获取医生选项列表',
    })
    // @RequirePermission('emr:DynamicOptions:add')//权限标识
    @Get('empOptionlist')
    getDocterOptions(@Query() query: SelectDoctorDto) {
        console.log('========findEmpOptions========');
        return this.DynamicOptionsService.getDocterOptions(query);
    }


    // 试试看后端返回模板所需字段，前端动态生成formJson
    @ApiOperation({
        summary: '动态生成病历模板所需字段',
    })
    // @RequirePermission('emr:DynamicOptions:add')//权限标识
    @Post('generateTemplate')
    generateTemplate(@Body() query: any) {
        console.log('========generateTemplate========');
        console.log(query);
        return this.DynamicOptionsService.generateTemplate(query);
    }

    // 获取模板配置页面的可选择字段
    @ApiOperation({
        summary: '获取模板配置可用的所有字段',
    })
    // @RequirePermission('emr:DynamicOptions:add')//权限标识
    @Post('getTemplateFeildList')
    getAllFeildList(@Body() query: any) {
        console.log('========getTemplateFeildList========');
        console.log(query);
        return this.DynamicOptionsService.getAllFeild(query);
    }

    // 获取模板配置页面的可选择字段
    @ApiOperation({
        summary: '获取模板配置可用的所有字段',
    })
    // @RequirePermission('emr:DynamicOptions:add')//权限标识
    @Post('getFieldsByStanderdCode')
    findFieldsByStanderdCode(@Body() data: any) {
        console.log('========getFieldsByStanderdCode========');
        console.log(data);
        return this.DynamicOptionsService.getFieldsByStanderdCode(data);
    }
}
