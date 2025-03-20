<template>
    <div class="app-container">
        <el-row :gutter="20">
            <el-col :span="16">
                <el-button type="primery" @click="handleTemplate(1)">编辑模板</el-button>
                <el-button type="primary" @click="handleTemplate(2)">新增模板</el-button>
                <el-button type="primery" @click="handleTemplate(3)">查看模板</el-button>
                <el-button type="primery" @click="handleTemplate(5)">配置模板</el-button>
                <el-input 
                type="text"
                v-model="inputValue"></el-input>
                <el-button type="primery" @click="useDSAPI(inputValue)">调用dsAPI测试</el-button>
            </el-col>
            <el-col :span="8">
                <el-button @click="handleStop(1)" type="text">启用模板</el-button>
                <el-button @click="handleStop(2)" type="text">禁用模板</el-button>
            </el-col>
        </el-row>
        <el-scrollbar>
            <el-table 
            ref="tableRef"
            row-key="date"
            :data="templateList" 
            style="width: 100%"
            @row-click="clickRowEvt"
            >
                <el-table-column fixed type="selection" width="55" />
                <el-table-column 
                label="创建日期"
                show-overflow-tooltip
                width="200">
                    <template #default="scope">
                        {{ scope.row.writeDate }}
                    </template>
                </el-table-column>
                <el-table-column 
                property="number" 
                label="模板编号" 
                show-overflow-tooltip
                width="220" />
                <el-table-column 
                property="name" 
                label="模板名称" 
                width="180" />
                <el-table-column 
                property="meta" 
                label="模板版本" 
                width="180" />
                <el-table-column
                property="category"
                width="160"
                label="模板类别"
                />
                <el-table-column 
                property="remark"
                width="220"
                label="模板备注"
                show-overflow-tooltip/>
                <el-table-column
                prop="business"
                label="业务类型"
                width="120"
                >
                    <template #default="scope">
                        <el-tag
                        :type="scope.row.business === '住院' ? 'primary' : 'success'"
                        disable-transitions
                        >{{ scope.row.business }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                prop="active"
                label="是否有效"
                width="120"
                >
                    <template #default="scope">
                        <el-tag
                        :type="scope.row.active==='1' ? 'success' : 'error'"
                        disable-transitions
                        >{{ scope.row.active ? '已启用' : '已禁用' }}</el-tag
                        >
                    </template>
                </el-table-column>
                <el-table-column 
                fixed="right" 
                label="操作" 
                min-width="120">
                    <template #default="scope">
                        <el-button
                        link type="primary"
                        size="small"
                        @click="handleClick">
                            Edit
                        </el-button>
                        <el-button 
                        link 
                        type="primary" 
                        size="small"
                        @click.prevent="deleteRow(scope.$index)"
                        >Detail</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-scrollbar>
        <!-- <el-button class="mt-4" style="width: 100%" @click="onAddItem">
            Add Item
        </el-button> -->

        <!-- 弹窗配置组件 -->
      <!-- <ConfigForm v-if="isShow" ref="templateFormRef" :formConf='templateObj'></ConfigForm> -->
      <MyDialog ref="templateConfigRef" 
        :click_confirm="myDialogConfirmEvt"
        :click_cancel="myDialogCancelEvt">
        <template #content>
          <ConfigForm 
          @update:formConf="formConfUpdate"
           :formConf='templateObj'></ConfigForm>
        </template>
      </MyDialog>
    </div>
</template>
<script setup>
    import { onMounted, ref } from 'vue';
    import dayjs from 'dayjs';
    import { useRouter } from 'vue-router';
    import { ElMessageBox,ElMessage } from 'element-plus';
    import useUserStore from '@/store/modules/user';
    import { createTemplateApi, getEMRModulesListApi } from '@/api/medicalRecord/emrApi';
    import useMedicalRecordStore from '@/store/modules/medicalRecord';
    import { testDSAPI } from '@/api/medicalRecord/AIApi'
    // 引入自定义组件
    import ConfigForm from './baseTemplates/templateConfig.vue';
    import MyDialog from '@/components/MyDialog'

    const router = useRouter();
    const tableRef = ref();
    let currentTemplate = ref();
    const currentUser = JSON.parse(useUserStore().currentUser);
    const medicalRecordStore = useMedicalRecordStore();
    

    const clickRowEvt = (row)=>{
        console.log(medicalRecordStore.currentModule);
        console.log(row);
        currentTemplate.value = row;
        // 将当前选中行存入store
        medicalRecordStore.setCurrentModule(row)
    }
    const resetDateFilter = () => {
        tableRef.value.clearFilter(['date'])
    }
    // 禁用、启用模板
    const handleStop = (type) => {
        if(!currentTemplate.value){
            ElMessage({
                type: 'info',
                message: `请选择模板！`,
            })
            return
        }
        console.log(currentTemplate.value);
        switch(type){
            case 1:
                ElMessage({
                    type: 'success',
                    message: `启用成功`,
                })
                break;
            case 2:
                ElMessage({
                    type: 'success',
                    message: `禁用成功`,
                })
                break;
        }
        

    }
    const now = new Date()

    // 获取模板列表数据
    async function getTemplateList(query){
        const res = await getEMRModulesListApi(query);
        console.log(res);
        if(res.code == 200 && res.data.list.length>0){
            templateList.value = res.data.list
        }
    }
    const templateList = ref([
        {
            // id:'tamplate_id_001',
            id:1,
            name: '住院志',
            remark: '病人在住院期间的详细病情记录，包括入院时的症状、体征、诊断等。',
            category: '模板类型',
            meta: '1.0',
            active: true,
            createName: 'admin',
            writeDate: '2016-05-04',
            address: 'Lohrbergstr. 86c, Süd Lilli, Saarland',
            business: '住院',
        },
        {
            // id:'tamplate_id_002',
            id: 2,
            writeDate: '2016-05-03',
            name: '医嘱单',
            remark: '医生为病人开具的治疗、用药等指令性文件。',
            active: true,
            address: '760 A Street, South Frankfield, Illinois',
            business: '门诊',
        },
        {
            id:3,
            // id:'tamplate_id_003',
            writeDate: '2016-05-03',
            name: '化验单（检验报告）',
            remark: '病人的各种检验结果，如血常规、尿常规、生化指标等。',
            active: true,
            address: '760 A Street, South Frankfield, Illinois',
            business: '门诊',
        },
        {
            id:4,
            // id:'tamplate_id_004',
            writeDate: '2016-05-03',
            name: '医学影像检查资料',
            remark: '如X光片、CT、MRI等医学影像资料，用于辅助诊断。',
            active: true,
            address: '760 A Street, South Frankfield, Illinois',
            business: '门诊',
        },
        {
            id:5,
            writeDate: '2016-05-03',
            name: '特殊检查同意书、手术同意书',
            remark: '病人接受特殊检查或手术前签署的同意书。',
            active: true,
            address: '760 A Street, South Frankfield, Illinois',
            business: '门诊',
        },
        {
            id:6,
            writeDate: '2016-05-03',
            name: '手术及麻醉记录单',
            remark: '记录病人的手术过程、麻醉方式、手术结果等信息。',
            active: true,
            address: '760 A Street, South Frankfield, Illinois',
            business: '门诊',
        },
        {
            id:7,
            writeDate: '2016-05-03',
            name: '病理资料',
            remark: '如病理切片、病理诊断报告等，用于明确病人的疾病性质。',
            active: true,
            address: '760 A Street, South Frankfield, Illinois',
            business: '门诊',
        },
        {
            id:8,
            writeDate: '2016-05-02',
            name: '护理记录',
            remark: '护士对病人进行的日常护理记录，包括病情观察、治疗护理等。',
            active: true,
            address: 'Arnold-Ohletz-Str. 41a, Alt Malinascheid, Thüringen',
            business: '住院',
        },
        {
            id:9,
            writeDate: '2016-05-02',
            name: '体温单',
            remark: '记录病人的体温、脉搏、呼吸等生命体征的变化。',
            active: true,
            address: 'Arnold-Ohletz-Str. 41a, Alt Malinascheid, Thüringen',
            business: '住院',
        },
        {
            id:10,
            writeDate: '2016-05-01',
            name: '死亡病例讨论记录',
            remark: '对死亡病例进行讨论、分析的记录。',
            active: true,
            address: '23618 Windsor Drive, West Ricardoview, Idaho',
            business: '住院',
        },
        {
            id:11,
            writeDate: '2016-05-01',
            name: '病程记录',
            remark: '医生对病人病情变化的连续记录，包括病情发展、治疗效果等。',
            active: true,
            address: '23618 Windsor Drive, West Ricardoview, Idaho',
            business: '住院',
        },
    ]);

    /**
     * 表格相关事件
     */
    // 显示配置表格
    const isShow = true
    const templateConfigRef = ref(null);
    // 在点击保存或者进入创建编辑页面时弹出框，表单，绑定templateObj
    let templateObj = ref({
        createUID: currentUser.createUid,
        writeUID: currentUser.writeUid,
        name: '模板一',
        templateType: '表单',//1为表单，2为markdown，3为json...
        business: 'outPatient',
        category: '门诊病历',
        permission: 'string',
        number: '001',
        active: '1',
        meta: '1.0',
        payload: null,
        remark: ''
    })
    // 弹出配置框
    async function showConfigEvt(){
        // 打开配置弹窗
        try{
            showConfDialogEvt();
        }catch(err){
            console.log(err);
            return
        }
    }
    // 打开配置弹窗
    const showConfDialogEvt = async()=>{
        console.log('showConfDialog'); 
        // 打开模板配置弹窗
        try{
            console.log(templateConfigRef.value);
            templateConfigRef.value.showDialog()
        }catch(err){
            console.log(err);
            throw(err);
        }
    }
    // 监听子组件传递的事件
    function formConfUpdate(val){
        console.log(val);
        templateObj.value = val;
    }
    async function myDialogConfirmEvt(){
        // 点击配置弹窗的确定后拿到templateObj，处理后传递到创建模板的页面，作为配置项，
        // 在那边保存才调用接口创建模板，这边只是暂存和初步处理模板配置项
        console.log(templateObj.value);
        // let objJson = JSON.stringify(templateObj.value)
        let type = templateObj.value.templateType==='表单'?'1':'2'
        // 跳转之前保存配置到store
        console.log(medicalRecordStore);
        
        medicalRecordStore.setTemplateConfig(templateObj.value)
        // 点击确认后跳转
        router.push({
            path: `/emrManage/template/${type==2?'basicInfo':'dynamicTemplateConfig'}`,
            // query: { id:'add',tempType: type==2?'1':'2'}
            query: { id:'add',tempType: type}
        });
    }
    const myDialogCancelEvt = ()=>{

    }
    const handleTemplate = async (type)=>{
        switch(type){
            case 1:
                // 编辑
                if(!currentTemplate.value){
                    ElMessage({
                        type: 'info',
                        message: `请选择模板！`,
                    })
                    return
                }
                // 要把当前模板存到vuex里面，还是通过路由传参？
                router.push({
                    path: "/emrManage/template/basicInfo",
                    query: { id:'edit' }
                });
                break;
            case 2:
                // 跳转页面之前，先弹出配置框，填写表单数据
                await showConfigEvt()
                // 这边配置完成，点击确认后才跳转下一页
                // 将配置后的对象，用某种方法传给下一页接受
                break;
            case 3:
                // 查看
                if(!currentTemplate.value){
                    ElMessage({
                        type: 'info',
                        message: `请选择模板！`,
                    })
                    return
                }
                router.push({
                    path: "/emrManage/template/basicInfo",
                    query: { id:'detail' }
                });
                break;
            case 5:
                // 配置模板选项字段，动态生成模板
                router.push({
                    path: "/emrManage/template/dynamicTemplateConfig",
                    // query: { id:'detail' }
                });
                break;
            default:
                alert('dont have such template')
                break;
        }
    }

    const inputValue = ref('')
    const useDSAPI = async (question)=>{
        try{
            let res = await testDSAPI(question)
            console.log(res);
            if(res.code===200){
                ElMessage({
                    type: 'success',
                    message: res.data.content
                });
            }
        }catch(err){
            console.error(err);
        }
    }

    const handleClick = ()=>{
        alert('edit')
    };
    const deleteRow = (index) => {
        templateList.value.splice(index, 1)
    };

     // 获取模板列表数据，根据模板大类处理成树形数据
     const getEMRModulesTree = async()=>{
        let res = await getEMRModulesListApi()
        if(res.code==200){
          console.log(res.data);
          // 这个在前端做还是后端做？选择一下
          const formTemp = res.data.list.filter(item => {
            return item.payload.type === '1'
          });
          const mdTemp = res.data.list.filter(item => {
            return item.payload.type === '2'
          });
          console.log(formTemp);
          console.log(mdTemp);
          
          
          // 这个应该有一张表或者规定字段（定义枚举），目前不清楚，暂时根据存入的数据筛一下
          const categoryList = []
          res.data.list.forEach(item => {
            // 如果list里没有当前category才push
            if(!categoryList.some(cate => cate === item.category)){
              categoryList.push(item.category)
            }
            // if(categoryList.findIndex(cate => cate === item.category) == -1){
            //   categoryList.push(item.category)
            // }
          });
          // 根据类别，将模板列表拆分成组，改造成tree需要的数据格式[{cate,children:[]},{cate,children:[]},{}]
          let treeData = []
          categoryList.forEach(cate=>{
            treeData.push({label:cate,children:[]})
          })
          treeData.forEach(td=>{
            res.data.list.forEach(md => {
              if(td.label==md.category){
                td.children.push(md)
              }
            })
          })
          return treeData
        }
      }

    onMounted(async ()=>{
        await getTemplateList()

        const tempTreeData = await getEMRModulesTree()
        console.log(tempTreeData);
    })
</script>
<style lang="scss" scoped>
    .el-row {
    margin-bottom: 20px;
    }
    .el-row:last-child {
    margin-bottom: 0;
    }
    .el-scrollbar {
        height: calc(100% - 32px - 20px);
    }
</style>