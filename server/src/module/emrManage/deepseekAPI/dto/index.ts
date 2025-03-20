import { IsString, IsEnum, IsArray, Length, IsOptional, IsNumber, IsNumberString, IsEmail, IsDate, IsJSON, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

// deepseek API Keys
export const qdd_ds_key_nest = 'sk-d69be47fceaf4d6b995a813d6d5e6eda'
// 硅基流动的API密钥 是访问 SiliconCloud 接口的凭证，具有该账户的完整权限
export const siliconflow_key = 'sk-lvebmoiriqkwzdrexhsejqsmjnluanukkeikleyvmswsfwgq'

export class CallDSDto {
    @ApiProperty({ required: true })
    @IsString()
    question: string;
}