import { Controller, Get, Post, Body, Put, Param, Query, Res, Delete, Request, UseGuards, CanActivate } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DeepseekService } from './deepseek.service';
import { CallDSDto } from './dto';
import { query } from 'express';


/**
 * 处理传入的请求，并调用服务来处理业务逻辑。
 */
@ApiTags('AI调用相关')
@Controller('emrManage/deepseek')
export class DeepseekController {
    constructor(private readonly DeepseekService: DeepseekService) { }
    @ApiOperation({
        summary: '调用dsAPI测试',
    })
    // @RequirePermission('emr:DynamicOptions:add')//权限标识
    @Post('testDSAPI')
    testDeepseekAPI(@Body() query: CallDSDto) {
        console.log('========try deepseek========');
        console.log(query);
        let { question } = query
        return this.DeepseekService.testDSAPI(question);
    }
}
