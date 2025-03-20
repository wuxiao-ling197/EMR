import { Controller, Get, Post, Body, Put, Param, Query, Res, Delete, Request, UseGuards, CanActivate } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionService } from './pre.service';
import { query, Response } from 'express';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { RequireRole } from 'src/common/decorators/require-role.decorator';


/**
 * 处理传入的请求，并调用服务来处理业务逻辑。
 */
@ApiTags('病人管理')
@Controller('emrManage/prescription')
export class PrescriptionController {
    constructor(private readonly PrescriptionService: PrescriptionService) { }
    @ApiOperation({
        summary: '获取药品列表',
    })
    // @RequirePermission('emr:Patient:add')//权限标识
    @Get('getMedicineList')
    findAll(@Query() query: any) {
        console.log('========findMedicineList========');
        return this.PrescriptionService.findMedicineList(query);
    }

    @ApiOperation({
        summary: '保存处方',
    })
    // @RequirePermission('emr:Patient:add')//权限标识
    @Post('savePrescription')
    createPrescription(@Body() data: any) {
        console.log('========savePrescriptionRecord========');
        console.log(data);
        return this.PrescriptionService.savePrescription(data);
    }

}
