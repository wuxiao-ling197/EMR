import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisCheckService } from './regis_check.service';
import { RegisCheckController } from './regis_check.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PatientEntity } from './entities/patient.entity';
import { HospitalPatientRecordEntity } from './entities/hospital_patient_record.entity';
import { PatientQueueEntity } from '../patient/entities/patient-queue.entity';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([PatientEntity, PatientQueueEntity], 'odoo18'),
        TypeOrmModule.forFeature([HospitalPatientRecordEntity, PatientQueueEntity], 'odoo18'),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                secret: config.get('jwt.secretkey'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [RegisCheckController],
    providers: [RegisCheckService],
    exports: [RegisCheckService],
})
export class RegisCheckModule { }
