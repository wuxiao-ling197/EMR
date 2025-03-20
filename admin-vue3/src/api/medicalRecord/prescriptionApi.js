import request from '@/utils/request'

/**
 * 获取药品列表
 * @param {*} query 
 * @returns 
 */
export function getMedicineListApi(query) {
    return request({
        url: `/emrManage/prescription/getMedicineList`,
        method: 'get',
        params: query
    })
}

/**
 * 保存处方列表
 * @param {*} query 
 * @returns 
 */
export function savePrescriptionApi(data) {
    return request({
        url: `/emrManage/prescription/savePrescription`,
        method: 'post',
        data: data
    })
}