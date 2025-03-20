import { Repository, DataSource, In, Not, EntityMetadata } from 'typeorm';
import { Injectable, BadRequestException, Response } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

import OpenAI from "openai";
import { qdd_ds_key_nest } from './dto/index'

import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/module/redis/redis.service';
// 导入其他地方的实体，比如部门（department），医生（职员employee）
// import { DynamicOptionsEntity } from './entities/emr-medical-record.entity';
import { AxiosService } from 'src/module/axios/axios.service';
import { HrDeptService } from 'src/module/share/hrdept/hrdept.service';
import { ResultData } from 'src/common/utils/result';

// import { generateJobId } from 'src/common/utils/generator';

@Injectable()
export class DeepseekService {
    constructor(
        private readonly deptService: HrDeptService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        // private readonly configService: ConfigService,
        private readonly axiosService: AxiosService,
    ) { }

    // 测试调用ds
    async testDSAPI(question: string) {
        console.log('try deepseek service');
        try {
            const silicon_flow_key = 'sk-lvebmoiriqkwzdrexhsejqsmjnluanukkeikleyvmswsfwgq';
            const options = {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${silicon_flow_key}`,
                    'Content-Type': 'application/json'
                },
                // 使用 JSON.stringify 构建请求体
                body: JSON.stringify({
                    model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
                    stream: false,
                    max_tokens: 512,
                    temperature: 0.7,
                    top_p: 0.7,
                    top_k: 50,
                    frequency_penalty: 0.5,
                    n: 1,
                    messages: [
                        {
                            content: question, // 使用传入的 question 参数
                            role: "user"
                        }
                    ]
                })
            };

            const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', options);
            const data = await response.json();
            console.log(data);
            return ResultData.ok(data.choices[0].message);
        } catch (err) {
            console.log(err);
            return ResultData.fail(500)
        }
    }

}