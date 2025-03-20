import { IsString, IsEnum, IsArray, Length, IsOptional, IsNumber, IsNumberString, IsEmail, IsDate, IsJSON, IsBoolean } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { extend } from 'dayjs';


export class CreatePatientDto {

    patientID?: number

    addressDetail?: string

    addressTypeCode?: number

    areaId?: number

    army?: boolean

    averageIncome?: number

    bornyear?: Date

    card_type_code?: number

    career?: number

    citizenHealthArchiveCode?: string

    citizenHealthCardCode?: string

    cityId?: number

    contacCateg?: string

    contactName?: string

    contactPhone?: string

    countryId?: number

    createDate?: Date

    createUid?: number

    die?: boolean

    dieLocation?: number

    dieReason?: string

    disaLv?: string

    disaRes?: number

    disability?: boolean

    domicileAddressDetail?: string

    domicileAreaId?: number

    domicileCityId?: number

    domicileStateId?: number

    fax?: string

    gender: number

    identifyid: string

    identityType?: string

    // inpatient_flag: boolean

    insurance?: number

    mail?: string

    mail_code?: string

    marry?: number

    name: string

    nation?: number

    oldName?: string

    phonenumber?: string

    politicalface?: string

    remark?: string

    schoolgrade?: number

    stateId?: number

    unique?: string

    workName?: string

    workPhone?: string

    workSubjection?: number

    writeDate?: Date

    writeUid?: number
}

export class CreateRegisterDto {
    id: number;

    patientID: number;

    gender: number;

    departmentID: number;

    doctorID: number;

    registerType: number;

    createUid: number;

    writeUid: number;

    jobId?: string;

    age: string;

    selfReportedSymptom: string;

    historyOfPresentIllness: string;

    pastMedicalHistory: string;

    historyOfFamilyIllness: string;

    personalHistory: string;

    marriageHistory: string;

    diagnosisResult: string;

    jobidIfActive: boolean;

    registerDate: Date;

    prescriptionDate: Date;

    createDate: Date;

    writeDate: Date;

    totalAmount: number;

    currentSection: string;

    registerIfPaid: boolean;

    ifInQueue: boolean;

    roomID: number;

    prescriptionIfPaid: boolean;

    testIfPaid: boolean;

}