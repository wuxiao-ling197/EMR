import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PatientJobIDEntity } from './entities/patient-jobid.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PatientQueueEntity } from './entities/patient-queue.entity';
import { PatientEntity } from '../registerAndCheckIn/entities/patient.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([PatientJobIDEntity, PatientQueueEntity, PatientEntity], 'odoo18'),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('jwt.secretkey'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule { }
