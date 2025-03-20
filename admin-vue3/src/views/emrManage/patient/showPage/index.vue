<template>
    <div class="app-container">
        <!-- mySwitchCard -->
      <el-scrollbar>
        <el-tabs
         v-model="activeName"
         class="demo-tabs"
         @tab-click="tabClick"
         @tab-change="tabChange">
            <el-tab-pane v-for="lab in tabList" :key="lab.key" :label="lab.label" :name="lab.name">  
                
                <el-empty v-if="isEmpty" :description="message">
                    <el-button type="primary" @click="checkPatient">{{message}}</el-button>
                </el-empty>
                <!-- table主体 -->
                <el-row :gutter="20"  v-if="!isEmpty">
                    <el-col :span="16">
                        <el-button type="primery" @click="showEMREvt">查看病历</el-button>
                        <el-button type="primary" @click="showPatientInfo">查看患者</el-button>
                        <el-button type="primery" @click="switchPatient">切换患者</el-button>
                    </el-col>
                    <el-col :span="8">
                        <el-button @click="continueEvt" type="text">开始叫号</el-button>
                        <el-button @click="continueEvt" type="text">下一个</el-button>
                        <el-button @click="confirmEvt" type="text">确认接诊</el-button>
                        <el-button @click="finishEvt" type="text">结束就诊</el-button>
                        <el-button @click="skipCurrentPatientEvt" type="text">跳过当前患者</el-button>
                    </el-col>
                </el-row>
                <div class="patient-list-box"  v-if="!isEmpty">
                    <div class="left">
                        <el-card>
                            <template #header>
                                <div class="card-header">
                                <span>等待叫号</span>
                                </div>
                            </template>
                            <el-table 
                            ref="tableRef"
                            row-key="date"
                            :data="waitCallList" 
                            style="width: 100%"
                            @select="selectEvt"
                            @selection-change="selectionChangeEvt"
                            @row-click="rowClickEvt"
                            >
                                <el-table-column fixed type="selection" width="55" />
                                <el-table-column 
                                property="name" 
                                label="患者姓名" 
                                width="120" />
                                <el-table-column
                                property="qNumber"
                                width="120"
                                label="患者排队号"
                                show-overflow-tooltip
                                />
                                <el-table-column 
                                property="desc"
                                width="240"
                                label="病情简述"
                                show-overflow-tooltip/>
                                <el-table-column
                                prop="queueState"
                                label="状态"
                                width="100"
                                >
                                    <template #default="scope">
                                        <el-tag
                                        :type="scope.row.queueState === 'in_queue' ? 'primary' : scope.row.queueState === 'call' ? 'warning' : 'success'"
                                        disable-transitions
                                        >
                                        {{ scope.row.queueState === 'in_queue' ? '等待叫号' : scope.row.queueState === 'call' ? '准备就诊' : scope.row.queueState === 'in_treatment' ? '就诊中' : '就诊结束' }}
                                        </el-tag>
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
                                        @click="handleCallNumberEvt(scope.row)">
                                            叫号
                                        </el-button>
                                        <el-button 
                                        link 
                                        type="primary" 
                                        size="small"
                                        @click.prevent="handleSkipPatientEvt(scope.row)"
                                        >跳过</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-card>
                    </div>
                    <div class="right">
                        <div class="top">
                            <el-card>
                                <template #header>
                                    <div class="card-header">
                                    <span>正在就诊</span>
                                    </div>
                                </template>
                                <el-table 
                                ref="tableRef"
                                row-key="date"
                                :data="seekingAttentionList" 
                                style="width: 100%"
                                @select="selectEvt"
                                @selection-change="selectionChangeEvt"
                                @row-click="rowClickEvt"
                                >
                                    <el-table-column fixed type="selection" width="55" />
                                    <el-table-column 
                                    property="name" 
                                    label="患者姓名" 
                                    width="120" />
                                    <el-table-column
                                    prop="queueState"
                                    label="状态"
                                    width="100"
                                    >
                                        <template #default="scope">
                                            <el-tag
                                            :type="scope.row.queueState === 'in_queue' ? 'primary' : scope.row.queueState === 'call' ? 'warning' : 'success'"
                                            disable-transitions
                                            >
                                            {{ scope.row.queueState === 'in_queue' ? '等待叫号' : scope.row.queueState === 'call' ? '准备就诊' : scope.row.queueState === 'in_treatment' ? '就诊中' : '就诊结束' }}
                                            </el-tag>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-card>
                        </div>
                        
                        <div class="bottom">
                            <el-card>
                                <template #header>
                                    <div class="card-header">
                                    <span>准备就诊</span>
                                    </div>
                                </template>
                                
                                <el-table 
                                ref="tableRef"
                                row-key="date"
                                :data="waitAttentionList" 
                                style="width: 100%"
                                @select="selectEvt"
                                @selection-change="selectionChangeEvt"
                                @row-click="rowClickEvt"
                                >
                                    <el-table-column fixed type="selection" width="55" />
                                    <el-table-column 
                                    property="name" 
                                    label="患者姓名" 
                                    width="120" />
                                    <el-table-column
                                    prop="queueState"
                                    label="状态"
                                    width="100"
                                    >
                                        <template #default="scope">
                                            <el-tag
                                            :type="scope.row.queueState === 'in_queue' ? 'primary' : scope.row.queueState === 'call' ? 'warning' : 'success'"
                                            disable-transitions
                                            >
                                            {{ scope.row.queueState === 'in_queue' ? '等待叫号' : scope.row.queueState === 'call' ? '准备就诊' : scope.row.queueState === 'in_treatment' ? '就诊中' : '就诊结束' }}
                                            </el-tag>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-card>
                        </div>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
      </el-scrollbar>
        

        <!-- 病人信息弹窗 -->
        <MyDialog ref="patientInfoRef" :formJson="patientInfoJson" :formConf="patientInfoCong"></MyDialog>
    </div>
  </template>
  
  <script setup>
    import { onMounted, ref } from 'vue';
    import dayjs from 'dayjs';
    import { useRoute, useRouter } from 'vue-router';
    import { ElMessageBox,ElMessage } from 'element-plus';
    import usePatientStore from '@/store/modules/patient';
    import useUserStore from '@/store/modules/user'
    import { getPatientListApi,getRoomCallListApi } from '@/api/medicalRecord/emrApi';

    import MyDialog from '@/components/MyDialog/index.vue';
    import { publicMessage } from '@/utils/websocket';
    import { callPatientNumberApi } from '@/api/medicalRecord/emrApi';
    import Mock from 'mockjs';
    import { updatePatientQueueStateApi } from '@/api/medicalRecord/emrApi';

    const route = useRoute();
    const router = useRouter();
    const patientStore = usePatientStore();
    const tableRef = ref(null);
    const patientInfoRef = ref(null);
    // const patientInfoJson = null;
    const patientInfoCong = {
        title: '基础信息'
    };
    // 如果是医生登录，userInfo里应该会有当前诊室信息，先固定为28
    const roomNumber = 28
    let currentUser = {}
    try{
        currentUser = JSON.parse(useUserStore().currentUser)
        roomNumber = currentUser.roomNumber || 28
    }catch(err){
        console.error(err);
        
    }
    

    let currentPatient = patientStore.currentPatient
    // 等待叫号
    let waitCallList = ref([])
    // 正在就诊
    let seekingAttentionList = ref([])
    // 等待就诊
    let waitAttentionList = ref([])

    // 当列表内容为空时显示
    let isEmpty = ref(true)
    let message = ref('当前没有排队的患者')
    // 一进来的时候就一个查询号病人列表数据，遍历tablist，将data放进去
    const tabList = [
        // {label: '在院', name: 'inhospital', key: 'inhospital', content: '在院', data:[], type:'0'},
        // {label: '出院', name:'outhospital',key:'outhospital',content:'出院', data:[], type:'1'},
        {label: '我的', name:'mine',key:'mine',content:'我的', data:[], type:'2'},
        {label: '科室', name:'department',key:'department',content:'科室', data:[], type:'3'}
    ]
    const activeName = ref('mine');

    const tabClick = (pane,ev)=>{
        console.log(pane);
        console.log(ev);
        // alert(tab);
    }
    const tabChange = async(name)=>{
        console.log(name);
        const curIndex = tabList.findIndex(e=>e.name===name);
        // 如果没有在一开始把病人list查询完整的话，tab切换时会发送请求根据类型重新获取patientList
        // 处理请求参数
        let param = {};
        switch(tabList[curIndex].type){
            case '0':
                param.business='';
                param.state='';
                break;
            case '1':
                break;
            case '2':
                break;
            case '3':
                break;
            default:
                return
        }
        const res = await getPatientListApi(param);
        tabList[curIndex].data = res.code===200 && res.data.total>0 ? res.data.list:[]
    }

    onMounted(async()=>{
        console.log(currentUser);
        
        await getPatientEvt();
        console.log(patientList.value);
        // 分块
        filterPatientEvt()
        // 获取病人基本信息的json；在填写后就一个把json存进去，可以直接用于渲染form-builder的
    });
    // 病人列表分块显示
    const filterPatientEvt = ()=>{
        // 等待叫号--准备就诊/（准备就诊）叫号--等待就诊--确认接诊/（就诊）叫号--正在就诊--结束就诊
        waitCallList.value = patientList.value.filter((item)=>{
            return item.queueState === 'in_queue'
        })
        // 等待就诊是已经叫过号，但当前就诊还没结束
        waitAttentionList.value = patientList.value.filter((item)=>{
            return item.queueState === 'call'
        })
        // 正在就诊
        seekingAttentionList.value = patientList.value.filter((item)=>{
            return item.queueState === 'in_treatment'
        })
        
    }
    // 获取病人列表
    const getPatientEvt = async()=>{
        // 处理参数query，如果有的话
        // 发送请求
        try{
            let res = await getRoomCallListApi(roomNumber);
            if(res.code == 200){
                console.log(res.data);
                console.log(isEmpty.value);
                if(res.data.list.length>0){
                    patientList.value = res.data.list.map(item=>{
                        return{
                            ...item,
                            name:item.patient.name,
                        }
                    })
                    isEmpty.value = false
                }else{
                    patientList.value = []
                    isEmpty.value = true
                }
            }
        }catch(err){
            console.log(err);
            message.value = 'err'
        }
    }

    const patientList = ref()
    const mockPL = Mock.mock({
        "list|3":[{
            'patientJID|+1':`jid-${1}`,
            'name|1': ['张三','李华','刘希','罗菲菲','黎明','杨鑫','秦柳絮','骆生'],
            'qNumber|+1': 1,
            'desc|1': '病人在住院期间的详细病情记录，包括入院时的症状、体征、诊断等。',
            'department|1': ['消化科','泌尿科','皮肤科','内科','外科'],
            'departmentID|+1': 1,
            'doctorName|1': '庄园',
            'patient_gender|1': ['男','女'],
            'doctorID|+1': 10,
            'busTypeSeq|1': ['缴费','挂号','取药'],
            'queueState|1': 1,
            'createName': 'admin',
            'createDate': '2016-05-04',
            'address|1-3': 'Lohrbergstr. 86c, Süd Lilli, Saarland',
            'tag|1': ['住院', '门诊', '急救', '体检']
        }]
    })
    
    /**当前选中患者id */
    let currentPatientID = null;

    /**叫号相关number */
    let currentPatientNumber = null;
    let nextPatientNumber = null;
    let waitAttentionNumber = null;
    let seekingAttentionNumber = null;
    let queIndex = 0;//排队的数组，用于顺序叫号的下标
    /**
     * 表格相关事件
     */
    /**查看当前患者病历 */
    const showEMREvt = (type)=>{
        // 这里只有patientJID
        // 可能要通过JID拿到patientID
        if(!currentPatientID){
            ElMessageBox.alert('请选择就诊患者', 'Title', {
                // if you want to disable its autofocus
                // autofocus: false,
                confirmButtonText: 'OK',
                callback: (action) => {
                ElMessage({
                    type: 'info',
                    message: `action: ${action}`,
                })
                },
            })
            return;
        }
        // 跳转病历页面，带着当前患者id等信息
        // router.push('/emrManage/patient/patientMedicalRecord?'+currentPatientID);
        router.push('/emrManage/patient/patientMedicalRecord')
    }
    const showPatientInfo = ()=>{
        // 显示弹窗，病人信息
        // 先判断有当前病人
        if(!currentPatientID){
            ElMessageBox.alert('请选择就诊患者', 'Title', {
                // if you want to disable its autofocus
                // autofocus: false,
                confirmButtonText: 'OK',
                callback: (action) => {
                ElMessage({
                    type: 'info',
                    message: `action: ${action}`,
                })
                },
            })
            return
        }
        try{
            patientInfoRef.value.showDialog()
        }catch(err){
            console.error(err);
        } 
    }
    const switchPatient = ()=>{
    }

   
    /**
     * 叫号相关事件
     */
    
    // 发布信息方法
    const publicEvt = (message)=>{
        // 发布信息
        // 向诊室小屏和综合大屏各发送一份
        try{
            let roomObj = {
                channel: '080room',
                message: JSON.stringify({
                    mediaType:'诊室屏',
                    type:message.type,
                    number:message.qNumber,
                    name:message.name,
                    roomNumber
                })
            }
            let screenObj = {
                channel: 'Integrated_screen',
                message: JSON.stringify({
                    mediaType:'大屏',
                    number:message.qNumber,
                    name:message.name,
                    roomNumber
                })
            }
            switch(message.type){
                case 'call':
                    publicMessage(roomObj)
                    publicMessage(screenObj)
                    break;
                case 'confirm':
                    publicMessage(roomObj)
                    break;
                case 'finish':
                    publicMessage(roomObj)
                    break;
                default:
                    return;
            }
        }catch(err){
            console.log(err);
        }
    }
    // 根据qNumber拿到病人信息
    const getPatientInfo = (number)=>{
        return patientList.value.find(item=>item.qNumber===number)
    }
    // 根据qNumber叫号，修改state
    // 修改排队state状态方法
    const updatePatientQueueState = async(obj)=>{
        return new Promise((resolve,reject)=>{
            setTimeout(()=>{
                let updated = false;
                patientList.value.forEach((item)=>{
                    if(item.qNumber === obj.qNumber){
                        item.queueState = obj.state
                        updated = true; // 标记为已更新
                    }
                })
                if (updated) {
                    resolve({ code: 200, message: 'update success!' });
                } else {
                    reject({ code: 404, message: 'Patient not found!' });
                }
            },100)
        })
    }

    // 修改排排队状态并刷新分块
    async function updateState(id,number,state){
        try{
            let res = await updatePatientQueueStateApi({
                patientID:id,
                qNumber:number,
                queueState:state
            })
            console.log(res);
            if(res.code === 200){
                ElMessage({type:'success',message:res.msg})
                console.log(patientList.value);
                // 更改状态之后是重新获取数据进行分块，还是直接修改本地数据后分块
                patientList.value.forEach((item)=>{
                    if(item.qNumber === number && item.patientID===id){
                        item.queueState = state
                    }
                })
                filterPatientEvt()
            }
        }catch(err){
            console.log(err);
        }
    }

    // 开始叫号/下一个，continueEvt
    const continueEvt = async ()=>{
        let fstNumber = waitCallList.value.length > 0 ? waitCallList.value[0].qNumber : null
        currentPatientNumber = currentPatientNumber || nextPatientNumber || fstNumber
        console.log(currentPatientNumber);
        
        currentPatient = getPatientInfo(currentPatientNumber)
        if(!currentPatientNumber || !currentPatient){
            ElMessage({
                type: 'info',
                message: `没有患者在等待就诊`,
            })
            return
        }
        publicEvt({qNumber:currentPatient.qNumber,name:currentPatient.name,type:'call'})
        // 刷新等待列表
        await updateState(currentPatient.patientID, currentPatientNumber,'call')
        let hasNextPatient = queIndex < patientList.value.length
        if(hasNextPatient){
            queIndex += 1
            console.log('qIndex:',queIndex);
            console.log('length:',patientList.value.length);
            
            
            nextPatientNumber = waitCallList.value.length>0?waitCallList.value[0].qNumber:null
            console.log('next:'+nextPatientNumber);
        }else{
            // 没有下一个就清空nextPatientNumber
            nextPatientNumber = null
            return
        }
    }
    // 确认接诊，confirmEvt
    const confirmEvt = async ()=>{
        // 拿等待就诊列表的第一个
        waitAttentionNumber = waitAttentionList.value.length>0?waitAttentionList.value[0].qNumber:null
        if(!waitAttentionNumber){
            ElMessage({
                type: 'info',
                message: `没有准备就诊的患者，请先叫号`,
            })
            return
        }
        let patientID = getPatientInfo(waitAttentionNumber).patientID
        await updateState(patientID, waitAttentionNumber,'in_treatment')
        try{
            let waitAttentionPatient = getPatientInfo(waitAttentionNumber)
            // 等待列表变化，发布消息，更新诊室屏幕
            publicEvt({
                name:waitAttentionPatient.name,
                qNumber:waitAttentionNumber,
                type:'confirm'
            })
        }catch(err){
            console.log(err);
            console.log('接诊信息发布失败');
        }
        if(!nextPatientNumber){
            waitAttentionNumber = null
            return
        }
    }
    // 结束就诊，finishEvt
    const finishEvt = async ()=>{
        seekingAttentionNumber = seekingAttentionList.value.length>0 ? seekingAttentionList.value[0].qNumber : null
        if(!seekingAttentionNumber){
            ElMessage({
                type: 'info',
                message: `没有正在就诊的患者`,
            })
            return
        }
        ElMessageBox.alert('确定结束当前就诊？', '结束就诊', {
            confirmButtonText: '确定',
            callback: async () => {
                let patientID = getPatientInfo(seekingAttentionNumber).patientID
                await updateState(patientID, seekingAttentionNumber,'finish')
                // 发布消息，更新诊室屏
                let seekingAttentionPatient = getPatientInfo(seekingAttentionNumber)
                try{
                    publicEvt({
                        name:seekingAttentionPatient.name,
                        qNumber:seekingAttentionNumber,
                        type:'finish'
                    })
                }catch(err){
                    console.log(err);
                    console.log('结束就诊信息发布失败');
                }
                currentPatientNumber = waitAttentionList.value.length>0?waitAttentionList.value[0].qNumber:null
                seekingAttentionNumber = null
                // 点下一个或者自动执行下一个（continueEvt）
                await continueEvt()
            },
        })
    }
     
    // 叫下一个患者
    // 跳过当前等待就诊的患者
    const skipCurrentPatientEvt = async()=>{
        // 当前患者排队号
        // 如果等待就诊（已叫号）列表有
        if(waitAttentionList.value.length > 0){
            currentPatientNumber = waitAttentionList.value[0].qNumber
            let patientID = getPatientInfo(currentPatientNumber).patientID
            // 修改当前状态为finish
            ElMessageBox.alert('确定跳过当前患者？', '跳过并叫号下一个患者', {
                confirmButtonText: '确定',
                callback: async () => {
                    await updateState(patientID, currentPatientNumber,'finish')
                    // 清空被选中患者（selectPatient）的id
                    currentPatientNumber = waitAttentionList.value.length > 0?waitAttentionList.value[0].qNumber:null
                    waitAttentionNumber = waitAttentionList.value.length > 0?waitAttentionList.value[0].qNumber:null
                    console.log(currentPatientNumber);
                    // 点下一个或者自动执行下一个（continueEvt）
                    await continueEvt()
                },
            })
        }else{
            ElMessage({
                type: 'info',
                message: `当前没有等待就诊的患者`,
            })
            return
        }
        console.log(currentPatientNumber);
        
    }

    // 手动操作行（或者卡片）跳过当前行
    const handleSkipPatientEvt = async(row)=>{
        console.log(row);
        console.log(row.qNumber);
        ElMessageBox.alert('跳过', '确定跳过该患者？', {
            confirmButtonText: '确定',
            callback: async () => {
                // 将当前患者queueState修改为0 并刷新列表
                await updateState(row.patientID, row.qNumber,'finish')
            },
        })
    }

    // 手动操作行（或者卡片）叫号
    const handleCallNumberEvt = async(row)=>{
        console.log(row);
        
        ElMessageBox.alert('叫号', '确定叫号当前患者？', {
            confirmButtonText: '确定',
            callback: async () => {
                callEvt()
            },
        })
        async function callEvt(){
            // 设置当前行number为waitAttentionNumber
            waitAttentionNumber = row.qNumber
            // 修改当前行的state为2准备就诊，并刷新等待列表
            await updateState(row.patientID,row.qNumber,'call')
            // 叫号：请 当前患者number 到 诊室 就诊，
            publicEvt({qNumber:row.qNumber,name:row.name,type:'call'})
            // 因为是直接从队列里提出来叫号，所以不要影响到当前的叫号和顺序
            // current和next不要改
        }
    }
    /**行点击和选选中框相关事件，基本都是改变当前选中患者的 */
    const selectEvt = (selection,row)=>{
        console.log(selection);
        console.log(row);        
        currentPatientID = selection[0].patientID || currentPatientID
    }
    const selectionChangeEvt = (selection)=>{
        console.log(selection);
        // 不让全选
    }
    const rowClickEvt = (row, column, event)=>{
        console.log(row);
        /**
         * 拿到选中行的患者id
         * 修改当前选中患者id
         * 之后点击查看病历，查看信息都要通过当前患者id
         */
        currentPatientID = row.patientID || currentPatientID
        patientStore.setCurrentPatient(row)
    }
  </script>
  
  <style lang="scss" scoped>
  body {
    margin: 0;  /* 如果页面出现垂直滚动条，则加入此行CSS以消除之 */
  }
  .patient-list-box{
    height: 100%;
    display: flex;
    .left{
        flex: 1;
        width: 50%;
        height: 100%;
        // .el-table--fit.el-table{
        //     min-height: 300px;
        // }
    }
    .right{
        flex: 1;
        box-shadow: inset 2px 2px 3px #efedec;
        width: 50%;
        height: 100%;
        // .el-table--fit.el-table{
        //     min-height: 150px;
        // }
        .top{
            height: 50%;
        }
        .bottom{
            height: 50%;
        }
    }
  }
  </style>