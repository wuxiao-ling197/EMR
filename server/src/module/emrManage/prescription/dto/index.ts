import { IsString, IsEnum, IsArray, Length, IsOptional, IsNumber, IsNumberString, IsEmail, IsDate, IsJSON, IsBoolean } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { extend } from 'dayjs';

export enum StatusEnum {
    STATIC = '1',
    DYNAMIC = '2',
}

/**
 * DTO 用于定义数据的结构，用于请求和响应的验证.
 */

// 创建处方
export class PrescriptionDto {
    // 需要身份证号
    @ApiProperty({ required: true })
    @IsString()
    patientID: string;

    // 会传进来jobId（或者来这边查？）
    @ApiProperty({ required: true })
    @IsString()
    jobId: string;
    // 姓名
    // 性别
    // public no: string;
    @ApiProperty({ required: true })
    @IsString()
    no: string;

    // public create_uid: number; 
    @ApiProperty({ required: true })
    @IsNumber()
    createUid: number;

    // public write_uid: number; 
    @ApiProperty({ required: true })
    @IsNumber()
    write_uid: number;

    // public create_date: Date;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsDate()
    createDate?: Date;

    // public write_date: Date;
    @ApiProperty({ required: false })
    @IsOptional()
    @IsDate()
    writeDate?: Date;
}
