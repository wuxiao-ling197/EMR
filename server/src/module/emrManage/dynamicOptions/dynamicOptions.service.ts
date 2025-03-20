import { Repository, DataSource, In, Not, EntityMetadata } from 'typeorm';
import { Injectable, BadRequestException, Response } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/module/redis/redis.service';
// 导入其他地方的实体，比如部门（department），医生（职员employee）
// import { DynamicOptionsEntity } from './entities/emr-medical-record.entity';
import { AxiosService } from 'src/module/axios/axios.service';
import { HrDeptService } from 'src/module/share/hrdept/hrdept.service';
import { DynamicOptionsDto, SelectDoctorDto, WidgetJsonDto, TreeNode, FeildTypeEnum, GenerateTemplateFieldsDto, entityFields } from './dto';
import { ResultData } from 'src/common/utils/result';

// 引入部门职员实体
import { HrDeptEntity } from 'src/module/share/hrdept/entities/hrdept.entity';
import { HrEmpEntity } from 'src/module/share/resuser/entities/hremp.entity';
import { MetadataEntity } from 'src/module/emrManage/metadata/entities/emr-metadata.entity';

import { ListHrDeptDto } from 'src/module/share/hrdept/dto';
import { MetadataService } from '../metadata/metadata.service';

// import { generateJobId } from 'src/common/utils/generator';

@Injectable()
export class DynamicOptionsService {
    constructor(
        @InjectRepository(HrDeptEntity, 'odoo18')
        private readonly hrDeptEntityRep: Repository<HrDeptEntity>,
        @InjectRepository(HrEmpEntity, 'odoo18')
        private readonly employeeEntityRep: Repository<HrEmpEntity>,
        @InjectRepository(MetadataEntity, 'odoo18')
        private readonly MetadataRepo: Repository<MetadataEntity>,
        @InjectDataSource()
        private readonly dataSource: DataSource,

        private readonly metadataService: MetadataService,
        private readonly deptService: HrDeptService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        // private readonly configService: ConfigService,
        private readonly axiosService: AxiosService,
    ) { }

    // 获取部门选框选项列表
    async getDeptOptions() {
        // let list:DynamicOptionsDto[] = []
        let list: Array<DynamicOptionsDto> = []
        const entity = this.hrDeptEntityRep.createQueryBuilder('entity');
        // 数据库里available全是f和null……先屏蔽这个条件
        // parentid为9，核算科室，可挂号的科室
        entity.where('entity.parentId = 9');
        entity.select(['entity.completeName', 'entity.name', 'entity.id', 'entity.code'])
        const res = await entity.getMany();
        console.log('deptlist');
        list = res.map(item => {
            // pop，修改原数组，删除并返回数组的最后一个
            let deptName = item.completeName.split('/').pop()
            return {
                value: item.id + '',
                label: deptName
            }
        })
        console.log(list);
        return ResultData.ok(list);
    }

    // 获取医生选框选项列表
    async getDocterOptions(query: SelectDoctorDto) {
        let list: Array<DynamicOptionsDto> = []
        let deptID = query.deptID
        // 其实应该是先从排班表里面查符合条件的排班信息，得到ID列表，然后从职工表里面查是否为医生
        const entity = this.employeeEntityRep.createQueryBuilder('entity');
        entity.where('entity.departmentId = :deptID AND entity.performanceRank LIKE :type', { deptID, type: `%医师%` });
        // 添加条件，用户选择时间段，或者用户选择医生
        // if(query.regisDate && query.bookTime){
        //     scheduleEntity.andWhere('schedule.')
        // }
        // if(query.docterID){
        //     scheduleEntity.andWhere('schedule.codterId = :docterID',{docterID:query.docterID})
        // }

        entity.select(['entity.id', 'entity.name', 'entity.performanceRank', 'entity.departmentId'])
        const res = await entity.getMany();
        console.log('deptlist');
        console.log(res);

        list = res.map(item => {
            return {
                value: item.id + '',
                label: item.name
            }
        })
        return ResultData.ok(list);
    }

    // 获取性别编码选项列表
    async getGenderCodeOptions() {
        let list: Array<DynamicOptionsDto> = []
        // 从numberCode里面获取性别代码
        // code=TP2202
        return ResultData.ok(list);
    }

    // 动态生成模板所需字段组件json
    async generateTemplate(query: GenerateTemplateFieldsDto) {
        let byCategory = query.categoryCode ? true : false;
        let byCodeList = query.fieldList ? true : false;
        console.log('byCategory:', byCategory);
        console.log('byCodeList:', byCodeList);
        // 查询逻辑：根据category(_code)->code(_name)->no/value/value_mean
        let widgetListPromises = [];
        if (byCategory) {
            // 以TP04为例
            let { categoryCode } = query
            if (categoryCode && categoryCode !== 'TP33' && categoryCode !== 'TP34') {
                if (categoryCode === 'TP98') {
                    // 自定义编码
                }
                else if (categoryCode === 'TP99') {
                    // 其他编码
                }
                else {
                    let codeList: { fieldLabel: string, fieldName: string }[] = []
                    // [{fieldName,fieldLabel}]
                    let res = await this.metadataService.getFieldList({ categoryCode });
                    codeList = Array.isArray(res) ? res : []
                    console.log(codeList);
                    if (codeList.length > 0) {
                        widgetListPromises = codeList.map(codeItem => {
                            return new Promise(async (resolve) => {
                                let widgetJson: WidgetJsonDto;
                                let code = codeItem.fieldName;
                                let codeName = codeItem.fieldLabel;
                                widgetJson = {
                                    "type": "input",
                                    "name": code,
                                    "label": codeName,
                                    "id": code,
                                    "optionItems": []
                                };
                                let options = await this.getOptions(code);
                                console.log('options-------------');
                                // console.log(options);
                                let objType = Object.prototype.toString.call(options);
                                console.log(objType);
                                if (objType === '[object Array]' && options.length > 0) {
                                    console.log('111111111');
                                    widgetJson.type = "select";
                                    widgetJson.optionItems = options;
                                }
                                console.log(widgetJson);
                                resolve(widgetJson); // 解析 Promise
                            });
                        });
                    }
                }
            } else if (categoryCode === 'TP33') {
                // ICD10疾病编码
                // 诊断编码和形态学编码

            } else if (categoryCode === 'TP34') {
                // ICD9手术编码
                // 只有手术编码

            }

            // 等待所有 Promise 完成，并收集结果
            let widgetList = await Promise.all(widgetListPromises);
            return ResultData.ok(widgetList);
        } else if (byCodeList) {
            let codeList: { fieldLabel: string, fieldName: string }[] = []
            // [{code,codeName,categoryCode,label,name,...}]=>[{code,codeName}]
            codeList = query.fieldList.map(codes => ({ fieldName: codes.code, fieldLabel: codes.codeName }))
            // codeList = JSON.parse(JSON.stringify(query))
            console.log(codeList);
            if (codeList.length > 0) {
                widgetListPromises = codeList.map(codeItem => {
                    return new Promise(async (resolve) => {
                        let widgetJson: WidgetJsonDto;
                        let code = codeItem.fieldName;
                        let codeName = codeItem.fieldLabel;
                        widgetJson = {
                            "type": "input",
                            "name": code,
                            "label": codeName,
                            "id": code,
                            "optionItems": []
                        };
                        let options = await this.getOptions(code);
                        console.log('options-------------');
                        // console.log(options);
                        let objType = Object.prototype.toString.call(options);
                        console.log(objType);
                        if (objType === '[object Array]' && options.length > 0) {
                            console.log('111111111');
                            widgetJson.type = "select";
                            widgetJson.optionItems = options;
                        }
                        console.log(widgetJson);
                        resolve(widgetJson); // 解析 Promise
                    });
                });
            }

            // 等待所有 Promise 完成，并收集结果
            let widgetList = await Promise.all(widgetListPromises);
            return ResultData.ok(widgetList);
        }
        else if (query.entityName) {
            let widgetList = await this.generateByEntityName(query.entityName)
            return ResultData.ok(widgetList);
        }
        else if (query.entityColumns) {
            let widgetList = await this.generateByEntityColumns(query.entityColumns)
            return ResultData.ok(widgetList);
        }
    }
    // 通过实体名生成模板json
    async generateByEntityName(tableName: string) {
        console.log('===========generate by entity name========');
        console.log(tableName);
        if (tableName) {
            let codeList: { fieldLabel: string, fieldName: string }[] = []
            // [{fieldName,fieldLabel}]
            let res = await this.metadataService.getPatientEntityField({ entityComment: tableName });
            codeList = Array.isArray(res) ? res : []
            console.log(codeList);
            let widgetListPromises = [];
            if (codeList.length > 0) {
                widgetListPromises = codeList.map(codeItem => {
                    return new Promise(async (resolve) => {
                        let widgetJson: WidgetJsonDto;
                        let code = codeItem.fieldName;
                        let codeName = codeItem.fieldLabel;
                        widgetJson = {
                            "type": "input",
                            "name": code,
                            "label": codeName,
                            "id": code,
                            "optionItems": []
                        };
                        let options = await this.getOptions(code);
                        console.log('options-------------');
                        // console.log(options);
                        let objType = Object.prototype.toString.call(options);
                        console.log(objType);
                        if (objType === '[object Array]' && options.length > 0) {
                            console.log('111111111');
                            widgetJson.type = "select";
                            widgetJson.optionItems = options;
                        }
                        console.log(widgetJson);
                        resolve(widgetJson); // 解析 Promise
                    });
                });
            }
        }
    }
    // 通过实体选中行生成模板json
    async generateByEntityColumns(columns: Array<{ label, comment, code, parent, fieldType, nullable }>) {
        console.log('===========generate by entity columns========');
        console.log(columns);
        // 理想状态下columns里面包含字段的各种信息[{label,comment,code,parent,fieldType,nullable}]
        // 不用查询，直接遍历
        let widgetListPromises = []
        let widgetJsonList = []
        if (columns.length > 0) {
            widgetListPromises = columns.map(column => {
                return new Promise(async (resolve) => {
                    // columns.forEach(column => {
                    let widgetJson: WidgetJsonDto;
                    let code = column.code;
                    let codeName = column.label;
                    widgetJson = {
                        "type": "input",
                        "name": code,
                        "label": codeName,
                        "id": code,
                        "optionItems": []
                    };
                    console.log('options-------------');

                    switch (column.fieldType) {
                        case 'int':
                        case 'int4':
                            widgetJson.type = "number";
                            break;
                        case 'varchar':
                        case 'char':
                            widgetJson.type = "input";
                            break;
                        case 'jsonb':
                            widgetJson.type = "input";
                            break;
                        case 'timestamp':
                            widgetJson.type = "date";
                            widgetJson.options = {
                                showType: 'datetime',
                                format: 'YYYY-MM-DD HH:mm:ss',
                                valueFormat: 'YYYY-MM-DD HH:mm:ss'
                            }
                            break;
                        case 'date':
                            widgetJson.type = "date";
                            widgetJson.options = {
                                type: 'datetime',
                                format: 'YYYY-MM-DD HH:mm:ss',
                                valueFormat: 'YYYY-MM-DD HH:mm:ss'
                            }
                            break;
                        case 'bool':
                            widgetJson.type = "radio";
                            widgetJson.optionItems = [{
                                "label": "是",
                                "value": true
                            },
                            {
                                "label": "否",
                                "value": false
                            }];
                            break;
                        case 'text':
                            widgetJson.type = "input";
                            break;
                        case 'float8':
                        case 'float':
                            widgetJson.type = "input";
                            break;
                        case 'bytea':
                            widgetJson.type = "input";
                            break;
                        default:
                            return;
                    }
                    // 如果name包含性别、省、市、县就从编码表获取options
                    // 如果是科室、部门、医生、病房等，调用dynamicOptions里的方法获取选项
                    if (code === 'gender') {
                        let options = await this.getOptions('TP2202');
                        console.log('options-------------');
                        // console.log(options);
                        if (options.length > 0) {
                            console.log('111111111');
                            widgetJson.type = "radio";
                            widgetJson.optionItems = options;
                        }
                    } else if (code === 'marray') {
                        // 婚姻状况代码
                        let options = await this.getOptions('TP2201');
                        console.log('options-------------');
                        // console.log(options);
                        if (options.length > 0) {
                            console.log('111111111');
                            widgetJson.type = "radio";
                            widgetJson.optionItems = options;
                        }
                    } else if (code === 'career') {
                        // 职业类别代码
                        let options = await this.getOptions('TP2301');
                        console.log('options-------------');
                        // console.log(options);
                        if (options.length > 0) {
                            console.log('111111111');
                            widgetJson.type = "radio";
                            widgetJson.optionItems = options;
                        }
                    } else if (code === 'workSubjection') {
                        // 单位隶属关系
                        let options = await this.getOptions('TP1801');
                        console.log('options-------------');
                        // console.log(options);
                        if (options.length > 0) {
                            console.log('111111111');
                            widgetJson.type = "radio";
                            widgetJson.optionItems = options;
                        }
                    } else if (code === 'averageIncome') {
                        // 家庭年均人收入
                        let options = await this.getOptions('TP0108');
                        console.log('options-------------');
                        // console.log(options);
                        if (options.length > 0) {
                            console.log('111111111');
                            widgetJson.type = "radio";
                            widgetJson.optionItems = options;
                        }
                    } else if (code === 'insurance') {
                        // 医疗保险类别代码
                        let options = await this.getOptions('CV02.01.204');
                        console.log('options-------------');
                        // console.log(options);
                        if (options.length > 0) {
                            console.log('111111111');
                            widgetJson.type = "radio";
                            widgetJson.optionItems = options;
                        }
                    }
                    // if (code.match(/contryId/)) {
                    //     // 和‘省’有关（自治区直辖市），code包含stateID（大小写不定）
                    //     let options = await this.getOptions('TP2202');
                    //     console.log('options-------------');
                    //     // console.log(options);
                    //     if (options.length > 0) {
                    //         console.log('111111111');
                    //         widgetJson.type = "select";
                    //         widgetJson.optionItems = options;
                    //     }
                    // }
                    // else if (code.match(/stateId/)) {
                    //     // 和‘省’有关（自治区直辖市），code包含stateID（大小写不定）
                    //     let options = await this.getOptions('TP2202');
                    //     console.log('options-------------');
                    //     // console.log(options);
                    //     if (options.length > 0) {
                    //         console.log('111111111');
                    //         widgetJson.type = "radio";
                    //         widgetJson.optionItems = options;
                    //     }
                    // } else if (code.match()) {
                    //     // 市（地区，州），包含cityID（大小写不限）
                    //     let options = await this.getOptions('TP2202');
                    //     console.log('options-------------');
                    //     // console.log(options);
                    //     if (options.length > 0) {
                    //         console.log('111111111');
                    //         widgetJson.type = "radio";
                    //         widgetJson.optionItems = options;
                    //     }
                    // } else if (code.match()) {
                    //     // 县（区），包含areaID（大小写不限）
                    //     let options = await this.getOptions('TP2202');
                    //     console.log('options-------------');
                    //     // console.log(options);
                    //     if (options.length > 0) {
                    //         console.log('111111111');
                    //         widgetJson.type = "radio";
                    //         widgetJson.optionItems = options;
                    //     }
                    // }
                    console.log(widgetJson);
                    widgetJsonList.push(widgetJson)
                    resolve(widgetJson); // 解析 Promise
                });
            });
            // 等待所有 Promise 完成，并收集结果
            let widgetList = await Promise.all(widgetListPromises);
        }
        return widgetJsonList
    }

    // [{'value', 'valueMean'}]
    async getOptions(code: string | Array<string>) {
        let valueList = [];
        let res = await this.metadataService.findValueListByCode(code);
        if (res.code === 200) {
            console.log(res.data)
            valueList = [...res.data]
        }
        return valueList
    }

    /**
     * 获取所有字段库，把标准字段编码表和实体表处理成前端选择字段需要的树形结构
     * @param query 
     * @returns 
     */
    async getAllFeild(query: any) {
        // 获取常用category（这里暂时获取第一个category）的feilds（[{code,codeName}])
        console.log(query);
        let feilds: TreeNode[] = []
        // 获取标准库字段
        try {
            let standardFeilds = await this.getStandardLibrary({ page: 1, limit: 3 })
            feilds.push({
                level: 1,
                label: '标准编码库',
                code: 'standard',
                name: '标准编码库',
                type: FeildTypeEnum.LIBRARY,
                children: standardFeilds
            })
        } catch (err) {
            console.log(err);
            throw new Error('err')
        }
        // 获取实体相关字段
        try {
            let entitiesFeilds = await this.getEntitiesFeilds()
            feilds.push({
                level: 1,
                code: 'entities',
                name: '实体字段',
                label: '实体字段库',
                type: FeildTypeEnum.LIBRARY,
                children: entitiesFeilds
            })
        } catch (err) {
            console.log(err);

        }
        return ResultData.ok(feilds)
    }
    async getStandardLibrary(query: { page: number; limit: number }) {
        console.log('============查询标准库=============');
        // 获取所有category
        let categoryList = [];
        let cates = [];
        let codes = [];
        let res = await this.metadataService.findCategory();
        console.log(res);
        if (res.code === 200) {
            categoryList = res.data.list;
            res.data.list.forEach(cate => {
                codes.push(cate.categoryCode);
                cates.push(cate.category);
            });
        }

        // 初始化树结构和映射表
        let treeData: TreeNode[] = [];
        let codeLists = [];
        // 构建树数据
        const categoryMap = new Map<string, TreeNode>();
        // 在循环前初始化Promise收集器
        const allPromises: Promise<void>[] = [];

        // 加载指定分类代码
        // 默认加载前三类别
        // let codeList = codes.slice(0, 2);
        let codeList = ['TP33']; // 可配置化
        try {
            // [{code,codeName,categoryCode}]
            codeLists = await this.metadataService.findCodeByCategoryCode(codeList);
            if (!Array.isArray(codeLists)) {
                throw new Error('Invalid response format');
            }
            // 构建分类节点
            categoryList.forEach(cate => {
                // category直接推到tree里面
                let treeItem: TreeNode = {
                    level: 2,
                    type: FeildTypeEnum.CATEGORY,
                    code: cate.categoryCode,
                    name: cate.category,
                    parent: 'standard',
                    children: [],
                    label: cate.category
                };
                treeData.push(treeItem);
                categoryMap.set(cate.categoryCode, treeItem);

                // 处理ICD分类
                if (['TP33', 'TP34'].includes(cate.categoryCode)) {
                    // ICD10疾病编码ICD8手术编码
                    // [{code,codeName,categoruCode}]
                    // 如果是ICD9或者ICD10，筛选出codes类别
                    let codesForICD = codeLists.filter(item => item.categoryCode === cate.categoryCode);
                    const codes = codesForICD.map(item => item.code);
                    console.log(`${cate.categoryCode}--Codes passed to getOptionsWithPagination:`, codes); // 添加日志输出
                    // 每个类别categoryCode或者code，分别进行分页查询，在前端点击动态查询的时候也是传递单个类别字符串
                    let codeNodes: TreeNode[] = [];
                    // 构建中间层code节点
                    codesForICD.forEach(codeItem => {
                        const codeNode: TreeNode = {
                            level: 3,
                            type: FeildTypeEnum.CODE,
                            code: codeItem.code,
                            name: codeItem.codeName,
                            parent: cate.categoryCode,
                            children: [],
                            label: codeItem.codeName
                        };
                        treeItem.children.push(codeNode);
                        categoryMap.set(codeItem.code, codeNode);
                    });

                    // 并行加载所有code的子项
                    const { page, limit } = query;
                    const offset = (page - 1) * limit;
                    codesForICD.forEach(codeItem => {
                        const promise = this.getOptionsWithPagination(codeItem.code, offset, limit)
                            .then(valueList => {
                                valueList.forEach(item => {
                                    const parentNode = categoryMap.get(codeItem.code);
                                    if (parentNode) {
                                        parentNode.children.push({
                                            level: 4,
                                            type: FeildTypeEnum.FIELD,
                                            code: item.value,
                                            name: item.valueMean,
                                            parent: codeItem.code,
                                            label: item.valueMean
                                        });
                                    }
                                });
                            });
                        allPromises.push(promise);
                    });
                } else if (cate.categoryCode === 'TP98') {
                    // 自定义编码
                } else if (cate.categoryCode === 'TP99') {
                    // 其他编码
                } else {
                    // 只有预加载的三个常用categoryCode加载children
                    codeLists.forEach(item => {
                        console.log('358', item);
                        if (item.categoryCode === cate.categoryCode) {
                            const treeItem = categoryMap.get(item.categoryCode);
                            if (treeItem) {
                                item.label = item.codeName;
                                item.level = 3;
                                item.parent = item.categoryCode;
                                item.name = item.codeName;
                                item.type = FeildTypeEnum.FIELD;
                                treeItem.children.push(item);
                            }
                        }
                    });
                }
            });
            await Promise.all(allPromises)
            // // 等待所有异步操作完成
        } catch (err) {
            console.log(err);
        }
        return treeData;
    }

    async getOptionsWithPagination(codes: string[] | string, offset: number, limit: number) {
        let valueList = [];
        let res = await this.metadataService.findValueListByCodeWithPagination(codes, offset, limit);
        console.log(res);
        if (res.code === 200) {
            valueList = [...res.data]
        }
        return valueList
    }

    async getEntitiesFeilds() {
        // code=== 'entities'
        // 获取所有实体
        console.log('============查询实体字段元数据=============');
        try {
            const metadatas = this.dataSource.entityMetadatas;
            console.log(metadatas.map(mt => ({ tbname: mt.tableName, comment: mt.comment })));
            let metadataMap = new Map<string, EntityMetadata>();
            const list: TreeNode[] = [];
            metadatas.forEach((metadata, index) => {
                let seen = metadataMap.get(metadata.tableName)
                console.log('===============================================================');
                console.log(metadata.tableName);
                if (!seen) {
                    console.log(seen);
                    metadataMap.set(metadata.tableName, metadata)
                    const fields: TreeNode[] = [];
                    // patientMetadata.columns.forEach((column: ObjectLiteral) => {
                    metadata.columns.forEach((column: ObjectLiteral) => {
                        fields.push({
                            // fieldName: column.propertyName, // 这通常是TypeScript类中的属性名
                            // fieldLabel: column.comment || column.propertyName, // 如果没有comment，则使用属性名作为label
                            // 注意：如果你需要数据库中的实际列名而不是TypeScript属性名，你应该使用column.databaseName
                            // 但这通常不是前端表单所需的，因为前端代码是基于TypeScript实体类编写的。
                            level: 3,
                            type: FeildTypeEnum.FIELD,
                            code: column.propertyName,
                            name: column.databaseName,
                            parent: metadata.tableName,
                            children: [],
                            label: column.comment || column.propertyName,
                            // 添加字段属性：是否必填和数据类型
                            nullable: column.isNullable,
                            fieldType: column.type,
                        });
                    });
                    list.push({
                        level: 2,
                        type: FeildTypeEnum.ENTITY,
                        code: metadata.tableName,
                        name: metadata.tableName,
                        parent: 'entities',
                        children: fields,
                        label: metadata.comment,
                    })
                }
            })
            const total = metadatas.length;
            console.log(metadataMap.size);

            console.log(list);
            // console.log(total);

            return list
        } catch (err) {
            console.log(err);
            return []
        }
    }
    translateTree(parent: { string: any }[], child: Array<any>) {

    }


    async getFieldsByStanderdCode(data: any) {
        let code = data.code;
        let categoryCode = data.categoryCode;
        let valueList = [];
        if (code) {
            const limit = data.limit || 10;
            const page = data.page || 1;
            const offset = (page - 1) * limit;
            try {
                // [{code,value,valueMean}]
                let res = await this.getOptionsWithPagination(code, offset, limit)
                valueList = res.map(item => {
                    return {
                        level: 4,
                        type: FeildTypeEnum.FIELD,
                        code: item.value,
                        name: item.valueMean,
                        parent: item.code,
                        label: item.valueMean
                    };
                });
            } catch (err) {
                console.log(err);

            }
        } else if (categoryCode) {
            try {
                let codeList = await this.metadataService.findCodeByCategoryCode([categoryCode]);
                valueList = codeList.map(item => ({
                    ...item,
                    label: item.codeName,
                    level: 3,
                    parent: item.categoryCode,
                    name: item.codeName,
                    type: FeildTypeEnum.FIELD,
                }));
            } catch (err) {
                console.log(err);

            }
        }
        return ResultData.ok({ list: valueList })
    }
}