import { Repository, In, Not } from 'typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/module/redis/redis.service';
import { ResultData } from 'src/common/utils/result';
import { PatientJobIDEntity } from './entities/patient-jobid.entity';
import { PatientQueueEntity } from './entities/patient-queue.entity'
import { AxiosService } from 'src/module/axios/axios.service';
import { HrDeptService } from 'src/module/share/hrdept/hrdept.service';

import { JwtService } from '@nestjs/jwt';
import { PatientEntity } from '../registerAndCheckIn/entities/patient.entity';
import { UpdateQueueStataDto } from './dto';


@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientJobIDEntity, 'odoo18')
    private readonly PatientJobIDRepo: Repository<PatientJobIDEntity>,
    @InjectRepository(PatientQueueEntity, 'odoo18')
    private readonly PatientQueueRepo: Repository<PatientQueueEntity>,
    @InjectRepository(PatientEntity, 'odoo18')
    private readonly PatientRepo: Repository<PatientEntity>,
    private readonly deptService: HrDeptService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly axiosService: AxiosService,
  ) { }

  /**
   * 查询所有就诊病人列表
   * @param query
   * @returns
   */
  async findAll() {
    console.log('========findPatientService========');
    try {
      const queues = await this.PatientQueueRepo.createQueryBuilder('queue')
        .leftJoinAndSelect('queue.patient', 'patient')
        .where('queue.queueState != :state', { state: 'finish' })
        .select([
          'patient.name',
          'queue.queueState',
          'queue.qNumber',
          'queue.departmentID',
          'queue.roomID',
          'queue.type',
          'queue.reserveType',
          'queue.vipLevel',
          'queue.ticketNumber',
          'queue.idCard',
          'queue.doctorID',
          'queue.patientID'
        ])
        .getMany();
      const total = queues.length;
      return ResultData.ok({
        list: queues,
        total,
      })
    } catch (err) {
      console.log(err);
      return ResultData.fail(500, 'server error')
    }
  }

  /**
   * 根据就诊号查找一个患者
   * @param patientID 证件号码
   * @returns 
   */
  async findOneByID(patientID: any) {
    console.log('========findOnePatientService========');
    const patient = this.PatientQueueRepo.createQueryBuilder('Patient');
    patient.where('Patient.patientID = :patientID', { patientID: patientID })
    // patient.select(['Patient.name']);
    const data = await patient.getOne();
    // const list = await this.PatientJobIDRepo.find();
    // return list;
    return ResultData.ok(data)
  }

  /**
   * 通过姓名查找患者
   * @param name 姓名
   * @returns 
   */
  async findByName(name: any) {
    console.log('========findOnePatientService========');
    const patient = this.PatientJobIDRepo.createQueryBuilder('Patient');
    patient.where('Patient.name = :name', { name: name })
    // patient.select(['Patient.name']);
    const data = await patient.getManyAndCount();
    // const list = await this.PatientJobIDRepo.find();
    // return list;
    return ResultData.ok(data)
  }

  /**
   * 根据诊室号拿到排队的患者
   * @param roomID 诊室号
   * @returns 
   */
  async getCallListByRoomId(roomID: number) {
    try {
      const queues = await this.PatientQueueRepo.createQueryBuilder('queue')
        .leftJoinAndSelect('queue.patient', 'patient')
        .where('queue.queueState != :state', { state: 'finish' })
        .andWhere('queue.roomID = :roomID', { roomID })
        .select([
          'patient.name',
          'queue.queueState',
          'queue.qNumber',
          'queue.departmentID',
          'queue.roomID',
          'queue.type',
          'queue.reserveType',
          'queue.vipLevel',
          'queue.ticketNumber',
          'queue.idCard',
          'queue.doctorID',
          'queue.patientID'
        ])
        .getMany();
      const total = queues.length;
      return ResultData.ok({
        list: queues,
        total,
      })
    } catch (err) {
      console.log(err);
      return ResultData.fail(500, 'server error')
    }

  }


  async callPatientNumber(callPatientNumberDto: any) {
    console.log('========callPatientNumberService========');
    const patientID = callPatientNumberDto.patientID;
    const patient = this.PatientJobIDRepo.createQueryBuilder('Patient');
    patient.where('Patient.patientID = :number', { number: patientID })
    // patient.select(['Patient.name']);
    const data = await patient.getOne();
    console.log(data);
    if (!data) {
      return ResultData.fail(400, 'not such patientID')
    }
    try {
      const updateResult = await this.PatientJobIDRepo.update(
        { patientID: patientID },//更新条件
        { ifInQueue: true }//要更新的字段和值
      )
      // 根据 updateResult.affected 来判断是否有记录被更新
      if (updateResult.affected > 0) {
        const message = 'Patient status updated successfully';
        return ResultData.ok(message)
      } else {
        const message = 'No patient found with the specified ID';
        return ResultData.fail(400, message)
      }
    } catch (err) {
      console.log(err);
      return ResultData.fail(500, 'server is error', err)
    }
  }

  /**
   * 修改排队状态
   * @param updateQueueStataDto 
   * @returns 
   */
  async updateQueueState(updateQueueStataDto: UpdateQueueStataDto) {
    console.log('========updateStateService========');
    const { patientID, qNumber, queueState } = updateQueueStataDto;
    console.log(patientID, qNumber, queueState);

    const queue = await this.PatientQueueRepo.createQueryBuilder('Queue')
      .where('Queue.patientID = :patientID AND Queue.qNumber = :qNumber', { patientID, qNumber })
      .getOne();
    console.log(queue);
    if (!queue) {
      return ResultData.fail(400, 'not such queueInfo')
    }
    try {
      const updateResult = await this.PatientQueueRepo.update(
        { qNumber: qNumber, patientID: patientID },//更新条件
        { queueState: queueState }//要更新的字段和值
      )
      // 根据 updateResult.affected 来判断是否有记录被更新
      console.log('---updateRes:');
      console.log(updateResult);

      if (updateResult.affected > 0) {
        const message = 'queue status updated successfully';
        return ResultData.ok(message)
      } else {
        const message = 'No queue info found with the qnumber and patientID';
        return ResultData.fail(400, message)
      }
    } catch (err) {
      console.log(err);
      return ResultData.fail(500, 'server is error', err)
    }
  }


}