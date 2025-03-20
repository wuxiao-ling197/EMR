import { Repository, DataSource, In, Not } from 'typeorm';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';

// import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/module/redis/redis.service';
import { ResultData } from 'src/common/utils/result';
import { AxiosService } from 'src/module/axios/axios.service';
import { HrDeptService } from 'src/module/share/hrdept/hrdept.service';

import { JwtService } from '@nestjs/jwt';
import { PrescriptionEntity } from './entities/prescription.entity';
import { ProductTemplateEntity } from './entities/product_template.entity';
import { MedicalRecordService } from '../medicalRecord/medicalRecord.service';
import { ProductEntity } from './entities/product.entity';
import { PrescriptionDto } from './dto';
import { CreateMedicalRecordDto } from '../medicalRecord/dto';

@Injectable()
export class PrescriptionService {
    constructor(
        @InjectRepository(ProductEntity, 'odoo18')
        private readonly ProductRepo: Repository<ProductEntity>,
        @InjectRepository(ProductTemplateEntity, 'odoo18')
        private readonly MedicienRepo: Repository<ProductTemplateEntity>,
        @InjectRepository(PrescriptionEntity, 'odoo18')
        private readonly PrescriptionRepo: Repository<PrescriptionEntity>,

        private readonly deptService: HrDeptService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly axiosService: AxiosService,
        private readonly medicalRecordService: MedicalRecordService,
    ) { }
    /**
     * 查询所有药品信息列表
     * @param query
     * @returns
     */
    async findMedicineList(query: any) {
        console.log('========findMedicineList========');
        console.log(query);
        let page = query.page || 1;
        let size = query.size || 20;
        const offset = (page - 1) * size;
        try {
            const medicines = await this.ProductRepo.createQueryBuilder('product')
                .leftJoinAndSelect('product.productTmpl', 'productTemplate')
                //    .where('productTemplate.ifInQueue = false AND productTemplate.jobidIfActive = true')
                .select([
                    'product', // 选择 ProductEntity 的所有字段
                    'productTemplate.name' // 仅选择 ProductTemplateEntity 的 name 字段
                ])
                .skip(offset)
                .take(size)
                .getMany();

            return ResultData.ok({
                list: medicines
            });
        } catch (err) {
            console.log(err);
            return ResultData.fail(500, 'Failed to fetch medicine list');
        }
    }
    /**
     * 保存处方记录
     * @param createRegisterDto
     * @returns
     */
    async savePrescription(prescription: PrescriptionDto) {
        console.log('=====================savePrescription=====');
        console.log(prescription);
        // let { patientID, jobId } = prescription

        // try {
        //     // 根据输入的patientID查询patient
        //     const queryBuilder = this.PatientRepo.createQueryBuilder('patient')
        //         .andWhere('patient.id = :patientID', { patientID });
        //     let patient = await queryBuilder.getOne()
        //     if (!patient) {
        //         // 如果没查到patient就返回提示，让先建档
        //         return ResultData.fail(300, '请先创建就诊档案信息，再挂号');
        //     }
        // } catch (err) {
        //     console.log(err);
        //     return ResultData.fail(500)
        // }
        // try {
        //     // 把处方记录保存到处方表
        //     const record = await this.PrescriptionRepo.createQueryBuilder('pre')
        //         .where('pre.patientID = :patientID', { patientID })
        //         .getOne()
        //     console.log(record);

        // } catch (err) {
        //     console.log(err);
        //     return ResultData.fail(500)
        // }
        // // 保存处方记录payload到emr表
        // let payload = {
        //     type: 3,//1是form类型的文档，2是markdown类型，3是其他类型的数据
        //     record_type: '处方记录',
        //     template: '',
        // }
        // let header = {
        //     title: '挂号单',
        //     business: '门诊',
        //     // business (business：门诊、住院、CT、体检、检查、检验) 
        //     id: 'string',
        //     // id：(payload文档id) 
        //     jobId: '',
        //     // jobId (病人job_id) 
        //     patient: '',
        //     // patient (病人unique)
        //     project: '',
        //     // project (项目编号；区分payload类型) 
        //     status: 1,
        //     // status (payload状态，发布状态:1/草稿状态:2) 
        // }
        // let participants = {
        //     role_id: 'writeID',
        //     role_name: '参与角色名',
        //     place: '地点，',
        //     checkInTime: new Date(),
        //     priority: 1//老板说是暂时用1234的数字表示序列
        // }
        // try {
        //     let ares = await this.addPayload({ jobId, payload, header, participants })
        //     if (ares.code === 500) {
        //         return ResultData.fail(500, '保存payload失败')
        //     }
        //     return ResultData.ok('处方创建成功');
        // } catch (err) {
        //     console.error(err);
        //     return ResultData.fail(500, '保存payload失败')
        // }
    }

    /**
     * 保存开处方等步骤产生的payload记录
     * @param emr 
     */
    async addPayload(emr: any) {
        let { jobId, payload, header, participants } = emr
        // 创建payload，包含步骤，业务类型，参与人，时间地点等等
        const createEmrDot: CreateMedicalRecordDto = {
            createUID: 1,
            writeUID: 1,
            active: 'string',
            jobID: jobId,
            patientID: 'string',
            payloadID: 'string',
            meta: 'string',
            businessType: '门诊',
            header,
            participants,
            payload,
            createDate: new Date(),
            writeDate: new Date()
        }
        try {
            let res = await this.medicalRecordService.create(createEmrDot)
            if (res.code !== 200) {
                return ResultData.fail(500, 'Failed to create template');
            } else {
                return ResultData.ok()
            }
        } catch (err) {
            console.log('save payload wrong');
            console.log(err);
            return ResultData.fail(500, 'Failed to create template');
        }
    }
}