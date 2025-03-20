// 创建、生成表单相关的方法
import request from '@/utils/request'


/**
 * 获取卫生信息元数据类别
 * @param {*} data 
 * @returns 
 */
export function getHospitalMetadataCategoryApi(query) {
  return request({
    url: `/emrManage/Metadata/category`,
    method: 'get',
    params: query
  })
}
/**
 * 根据类别获取卫生信息元数据feildList
 * @param {category?: string, categoryCode?: string} query 
 * @returns 
 */
export function getFieldListApi(query) {
  return request({
    url: `/emrManage/Metadata/fieldList`,
    method: 'get',
    params: query
  })
}

/**
 * 获取所有后端实体的元数据
 * @param {*} query 
 * @returns 
 */
export function getEntitiesMetaDataApi(query) {
  return request({
    url: `/emrManage/Metadata/entitiesMetadata`,
    method: 'get',
    params: query
  })
}
/**
 * 获取patient实体的元数据
 * @param {*} query 
 * @returns 
 */
export function getPatientInfoEntityMetaDataApi(query) {
  return request({
    url: `/emrManage/Metadata/hospitalPatientMetadata`,
    method: 'get',
    params: query
  })
}

/**
 * 动态获取选框选项
 * @param {*} query 
 * @returns 
 */
export function getDynamicOptionsApi(query) {
  return request({
    url: `/emrManage/Metadata/getDynamicOptions`,
    method: 'get',
    params: query
  })
}

/**
 * 动态获取模板字段
 * @param {*} query 
 * @returns 
 */
export function generateTemplateApi(data) {
  return request({
    url: `/emrManage/dynamicOptions/generateTemplate`,
    method: 'post',
    data: data
  })
}

/**
 * 获取所有可选模板配置字段
 * @param {*} query 
 * @returns 
 */
export function getTemplateFeildsApi(data) {
  return request({
    url: `/emrManage/dynamicOptions/getTemplateFeildList`,
    method: 'post',
    data: data
  })
}

/**
 * 根据code编码获取可选模板配置字段
 * @param {*} query 
 * @returns 
 */
export function getFieldsByStanderdCodeApi(data) {
  return request({
    url: `/emrManage/dynamicOptions/getFieldsByStanderdCode`,
    method: 'post',
    data: data
  })
}



