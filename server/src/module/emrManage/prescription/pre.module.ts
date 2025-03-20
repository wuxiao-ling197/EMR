import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrescriptionService } from './pre.service';
import { PrescriptionController } from './pre.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PatientEntity } from '../registerAndCheckIn/entities/patient.entity';
import { PrescriptionEntity } from './entities/prescription.entity';
import { ProductTemplateEntity } from './entities/product_template.entity';
import { MedicalRecordService } from '../medicalRecord/medicalRecord.service';
import { ProductEntity } from './entities/product.entity';
import { PrescriptionDto } from './dto';

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductEntity, PrescriptionEntity, ProductTemplateEntity], 'odoo18'),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                secret: config.get('jwt.secretkey'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [PrescriptionController],
    providers: [PrescriptionService],
    exports: [PrescriptionService],
})
export class PrescriptionModule { }
