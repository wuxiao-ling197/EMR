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
import { PatientEntity } from './entities/patient.entity';
import { HospitalPatientRecordEntity } from './entities/hospital_patient_record.entity';
import { CreatePatientDto, CreateRegisterDto } from './dto';
import { MedicalRecordService } from '../medicalRecord/medicalRecord.service';
import { PatientQueueEntity } from '../patient/entities/patient-queue.entity';
import { CreateQueueDto } from '../patient/dto';

// import QRCode from 'qrcodejs2';
import * as QRCode from 'qrcode';
import { CreateMedicalRecordDto } from '../medicalRecord/dto';

@Injectable()
export class RegisCheckService {
    constructor(
        @InjectRepository(PatientEntity, 'odoo18')
        private readonly PatientRepo: Repository<PatientEntity>,
        @InjectRepository(PatientQueueEntity, 'odoo18')
        private readonly PatientQueueRepo: Repository<PatientQueueEntity>,
        @InjectRepository(HospitalPatientRecordEntity, 'odoo18')
        private readonly HospitalPatientRecordRepo: Repository<HospitalPatientRecordEntity>,

        private readonly deptService: HrDeptService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly axiosService: AxiosService,
        private readonly medicalRecordService: MedicalRecordService,
    ) { }

    /**
     * 条件查询用户档案信息列表
     * @param query
     * @returns
     */
    async selectList(query?: any) {
        console.log(query);
        let page: number;
        let size: number;
        let offset = 0;
        if (!query || !query.page || !query.size) {
            console.log('========findAllDocumentService========');
            // 不是分页查询
        } else {
            // 分页查询
            console.log('========findDocumentService========');
            page = query.page || 1;
            size = query.size || 50;
            offset = (page - 1) * size;
        }
        // 是否还有其他条件
        let identifyid = query?.identifyid
        let name = query?.name
        try {
            const patient = this.PatientRepo.createQueryBuilder('Patient');
            if (identifyid) {
                // 根据证件号查询，添加条件
                patient.where('Patient.identifyid LIKE :identifyid', { identifyid: `%${identifyid}%` })
            } else if (name) {
                // 根据姓名查询
                patient.where('Patient.name LIKE :name', { name: `%${name}%` })
            }

            //  如果是分页查询
            if (page && size) {
                const [list, count] = await patient
                    .skip(offset)
                    .take(size)
                    .getManyAndCount();
                return ResultData.ok({ count, list });
            } else {
                // 不是分页查询
                const [list, count] = await patient.getManyAndCount();
                return ResultData.ok({ count, list });
            }
        } catch (err) {
            console.log(err);
            return ResultData.fail(500)
        }
    }

    /**
     * 创建患者信息档案
     * @param createPatientDto
     * @returns
     */
    async createDocument(createPatientDto: CreatePatientDto) {
        console.log('=====================createDocumentService=====');

        console.log(createPatientDto);
        const writeDate = new Date();
        const createDate = new Date();
        const bornyear = new Date();
        // if (Object.keys(createPatientDto).length === 0) {
        //     console.log('前端传递的空对象');
        //     createPatientDto = {
        //         patientID: 1,
        //         // nation: 1,
        //         // card_type_code: 1,
        //         // disaRes: 1,
        //         // dieLocation: 1,
        //         // schoolgrade: 1,
        //         // addressTypeCode: 1,
        //         // countryId: 1,
        //         // stateId: 1,
        //         // cityId: 1,
        //         // areaId: 1,
        //         // domicileStateId: 1,
        //         // domicileCityId: 1,
        //         // domicileAreaId: 1,
        //         // insurance: 1,
        //         // marry: 1,
        //         // career: 1,
        //         // workSubjection: 1,
        //         // averageIncome: 1,
        //         createUid: 1,
        //         writeUid: 1,
        //         name: "string",
        //         oldName: "string",
        //         gender: 10328,
        //         politicalface: "string",
        //         citizenHealthCardCode: "string",
        //         citizenHealthArchiveCode: "string",
        //         identityType: "string",
        //         identifyid: "string",
        //         phonenumber: "string",
        //         disaLv: "string",
        //         dieReason: "string",
        //         unique: "string",
        //         fax: "string",
        //         mail: "string",
        //         addressDetail: "string",
        //         domicileAddressDetail: "string",
        //         workName: "string",
        //         workPhone: "string",
        //         mail_code: "string",
        //         contactName: "string",
        //         contactPhone: "string",
        //         contacCateg: "string",
        //         remark: "string",
        //         army: false,
        //         disability: false,
        //         die: false,
        //         inpatient_flag: false,
        //         bornyear,
        //         writeDate,
        //         // 暂定固定属性
        //         createDate,
        //     }
        // }

        const emr: PatientEntity = {
            ...createPatientDto,
            writeDate,
            id: 100
        };
        delete emr.id
        try {
            const res = await this.PatientRepo.save(emr);
            return ResultData.ok(res);
        } catch (err) {
            console.log(err);
            return ResultData.fail(500, 'Failed to create template');
        }
    }


    /**
     * 查询所有挂号信息列表
     * @param query
     * @returns
     */
    async findRegisterList(query: any) {
        console.log('========findRegisterService========');
        console.log(query);
        let page = query.page || 1;
        let size = query.size || 50;
        const offset = (page - 1) * size;
        try {
            const record = await this.HospitalPatientRecordRepo.createQueryBuilder('record')
                .leftJoinAndMapMany('record.patient', PatientEntity, 'patient', 'record.patientID = patient.id')
                .where('record.ifInQueue = false AND record.jobidIfActive = true')
                .getMany();
            const recordIds = record.map((r) => r.patientID);
            const list = await this.PatientRepo.find({
                where: {
                    id: In(recordIds),
                },
                skip: offset,
                take: size
            })
            list['record'] = record
            const total = list.length
            console.log('95------');
            return ResultData.ok({
                list: record,
                total,
            })
        } catch (err) {
            console.log(err);
        }
    }
    /**
     * 条件查询已挂号且在有效期内的列表
     * @param query 
     * @returns 
     */
    async selectRegisterList(query: any) {
        console.log('========selectRegisterService========');
        console.log(query);
        let jobId = query.jobId
        let name = query.name
        try {
            // const patient = this.PatientRepo.createQueryBuilder('Patient')
            // const hpRecord = this.HospitalPatientRecordRepo.createQueryBuilder('Record');
            const queryBuilder = this.PatientRepo.createQueryBuilder('patient')
                .innerJoin('HospitalPatientRecord', 'record', 'patient.id = record.patientID')
                .select(['patient.name', 'patient.id', 'record.jobID']);
            if (jobId) {
                queryBuilder.andWhere('record.jobID = :jobId', { jobId });
            } else if (name) {
                queryBuilder.andWhere('patient.name LIKE :name', { name: `%${name}%` });
            }

            const [results, count] = await queryBuilder.getManyAndCount();

            return ResultData.ok({ count, list: results });
        } catch (error) {
            console.error(error);
            return ResultData.fail(500, 'Internal Server Error');
        }
    }

    /**
     * 创建挂号信息
     * @param createRegisterDto
     * @returns
     */
    async createRegister(createRegisterDto: CreateRegisterDto) {
        console.log('=====================createRegister=====');
        console.log(createRegisterDto);
        let { patientID } = createRegisterDto
        try {
            // 根据输入的patientID查询patient
            const queryBuilder = this.PatientRepo.createQueryBuilder('patient')
                .andWhere('patient.id = :patientID', { patientID });
            let patient = await queryBuilder.getOne()
            if (!patient) {
                // 如果没查到patient就返回提示，让先建档
                return ResultData.fail(300, '请先创建就诊档案信息，再挂号');
            }
        } catch (err) {
            console.log(err);
            return ResultData.fail(500)
        }
        try {
            const record = await this.HospitalPatientRecordRepo.createQueryBuilder('record')
                .where('record.patientID = :patientID', { patientID })
                .getOne()
            console.log(record);

            if (record && record.jobId && record.jobidIfActive === true) {
                return ResultData.fail(204, '用户挂号在有效期内，无需多次挂号。')
            }
        } catch (err) {
            console.log(err);
            return ResultData.fail(500)
        }
        let jobId;
        let qrImage;
        try {
            // 生成jobId
            jobId = await this.medicalRecordService.generateID()
            // 将签到码（暂时用jobId）转成二维码
            qrImage = await QRCode.toDataURL(jobId, { type: 'png' });
        } catch (err) {
            console.log(err);
            return ResultData.fail(500)
        }
        // 保存挂号记录payload到emr表
        let payload = {
            type: 1,//1是form类型的文档，2是markdown类型
            record_type: '挂号记录',
            template: '',
        }
        let header = {
            title: '挂号单',
            business: '门诊',
            // business (business：门诊、住院、CT、体检、检查、检验) 
            id: 'string',
            // id：(payload文档id) 
            jobId: '',
            // jobId (病人job_id) 
            patient: '',
            // patient (病人unique)
            project: '',
            // project (项目编号；区分payload类型) 
            status: 1,
            // status (payload状态，发布状态:1/草稿状态:2) 
        }
        let participants = {
            role_id: 'writeID',
            role_name: '参与角色名',
            place: '地点，',
            checkInTime: new Date(),
            priority: 1//老板说是暂时用1234的数字表示序列
        }

        // try{
        // 保存挂号记录到record表
        let regRes = await this.addRegisterRecord(createRegisterDto, jobId)

        let ares = await this.addPayload({ jobId, payload, header, participants })
        if (regRes.code === 500 || ares.code === 500) {
            return ResultData.fail(500, '挂号失败')
        }
        return ResultData.ok({ jobId, qrImage });
    }

    /**
    * 签到
    * @param checkInCode
    * @returns
    */
    async checkIn(checkInCode: any) {
        console.log('=====================checkIn=====');
        const self = this;
        console.log(checkInCode);
        const { code } = checkInCode
        let regis = null
        // 根据输入的code查询regis信息
        const queryBuilder = this.HospitalPatientRecordRepo.createQueryBuilder('record')
            .andWhere('record.jobId = :code', { code });
        try {
            regis = await queryBuilder.getOne()
        } catch (err) {
            console.log(err);
            return ResultData.fail(300, '签到码无效');
        }
        let checkRes = regis.jobidIfActive
        if (!checkRes) {
            // 如果regis的某些字段--用于标识时间的字段，超时
            return ResultData.fail(300, '签到码无效！');
        } else {
            // 存入签到记录payload到emr表里
            let jobId = regis.jobId
            let payload = {
                type: 1,
                record_type: '签到记录',
                template: '',
            }

            let header = {
                title: '签到记录',

                business: '门诊',
                // business (business：门诊、住院、CT、体检、检查、检验) 
                id: 'string',
                // id：(payload文档id) 
                jobId: '',
                // jobId (病人job_id) 
                patient: '',
                // patient (病人unique)
                project: '',
                // project (项目编号；区分payload类型) 
                status: 1,
                // status (payload状态，发布状态:1/草稿状态:2) 
            }
            // 这个应该是操作签到的人的id和name以及place
            let participants = {
                role_id: regis.writeUID,
                role_name: '角色，',
                place: '窗口',
                desc: '签到',
                checkInTime: new Date(),
                priority: ''//序列
            }
            // {"place": "线上", "role_id": "HPID2503190000002", "priority": "", "role_name": "赵国良", "checkInTime": "2025-03-19 10:01:40"}
            let ares = await this.addPayload({ jobId, payload, header, participants })
            // 挂号记录添加入排队表
            let qres = await this.addInQueue(regis)
            // 修改挂号记录的排队状态
            let ures = await this.updateRecord(code)
            if (qres.code === 500 || ures.code === 500 || ares.code === 500) {
                return ResultData.fail(500, '签到失败！')
            }
            // 修改和添加成功才算签到成功
            return ResultData.ok(qres);
        }
    }

    /**
     * 保存挂号签到等步骤产生的payload记录
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

    /**
     * 将挂号记录存入record表并返回签到码
     * @param jobId 
     * @returns 
     */
    async addRegisterRecord(createRegisterDto: CreateRegisterDto, jobId: string) {
        console.log(createRegisterDto);
        // 新建挂号信息
        const writeDate = new Date();
        const createDate = new Date();
        const registerDate = new Date();
        const emr: HospitalPatientRecordEntity = {
            ...createRegisterDto,
            jobId,
            writeDate,
            createDate,
            registerDate,
            currentSection: 'register',
            ifInQueue: false,
            registerIfPaid: true,
            jobidIfActive: true
        };
        try {
            // 存表
            let res = await this.HospitalPatientRecordRepo.save(emr);
            return ResultData.ok(res);
        } catch (err) {
            console.log(err);
            return ResultData.fail(500, 'Failed to addRegisterRecord');
        }
    }
    /**
     * 将regis存入签到排队表中，添加排队状态为排队中
     * @param regis 签到记录
     * @returns 
     */
    async addInQueue(regis: CreateRegisterDto) {
        console.log('------addInQueue');

        console.log(regis);
        // 查询当前诊室的queue长度
        let qNumber = 0
        try {
            const count = await this.PatientQueueRepo.createQueryBuilder('queue')
                .where('queue.roomID = :roomID', { roomID: regis.roomID })
                .getCount()
            qNumber = count + 1

        } catch (err) {
            console.log(err);
            return ResultData.fail(500, 'get qnumber error')
        }
        const writeDate = new Date();
        const createDate = new Date();
        const patientJID = regis.id
        const patientGender = 1
        const busTypeSeq = 1
        const idCard = ''
        const patientAge = regis.age
        const ticketNumber = '3001'
        const vipLevel = '0'
        const state = '1'
        const reserveSeq = ''
        const reserveType = ''
        const type = ''
        const qType = ''
        const queueState = 'in_queue'
        const roomID = regis.roomID || 3
        const reserveDate = new Date()
        const ticketTime = new Date()
        const reserveStartTime = new Date()
        const reserveEndTime = new Date()
        const reserveTime = new Date()
        const emr: PatientQueueEntity = {
            ...regis,
            writeDate,
            callTimes: 1,
            patientJID,
            // 暂定固定属性
            id: 100,
            createDate,
            patientGender,
            qNumber,
            busTypeSeq,
            patientAge,
            ticketNumber,
            idCard,
            vipLevel,
            state,
            reserveSeq,
            reserveType,
            type,
            qType,
            queueState,
            reserveDate,
            ticketTime,
            reserveStartTime,
            reserveEndTime,
            reserveTime,
            roomID
        };
        // 删除任何不应该在创建时设置的属性，比如如果 id 是自动生成的
        delete emr.id; // 仅在 id 是自动生成的并且不应该在创建时设置时添加此行
        try {
            let res = await this.PatientQueueRepo.save(emr);
            console.log('add in success!');
            return ResultData.ok(res)
        } catch (err) {
            console.log(err);
            return ResultData.fail(500, 'Failed to create template');
        }
    }

    /**
     * 修改record表的状态，根据jobID查找对应行，update添加内容
     * @param jobID 
     */
    async updateRecord(jobID: string) {
        if (jobID) {
            // todo
            try {
                const updateResult = await this.HospitalPatientRecordRepo.update(
                    { jobId: jobID }, // 查找条件，假设jobID是唯一的
                    { ifInQueue: true } // 要更新的字段
                )
                if (updateResult.affected > 0) {
                    console.log('Update record success!');
                    return ResultData.ok()
                } else {
                    console.warn('No records were updated for the given jobID.');
                    // 可以在这里添加额外的逻辑来处理更新失败的情况
                    return ResultData.fail(500)
                }
            } catch (err) {
                console.log(err);

                return ResultData.fail(500, '修改挂号记录排队状态失败')
            }
        }
    }
}