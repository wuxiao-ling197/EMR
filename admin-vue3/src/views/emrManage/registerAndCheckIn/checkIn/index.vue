<template>
        <div class="app-container">
        <el-row :span="24">
            <el-col :span="8">
                <el-button @click="chickInEvt">签到</el-button>
                <el-button @click="handleRegis">去挂号</el-button>
                <el-button>搜索选择挂号信息</el-button>
            </el-col>
            <el-col :span="8">
                <span>姓名</span>
                <el-input 
                @change="selectDocumentEvt('name')"
                 @focus="showListEvt" 
                 :value="name"
                 style="width: 60%;" 
                 placeholder="请输入姓名" 
                 v-model="name" type="text"></el-input>
                <!-- <el-button @click="selectDocumentEvt('name')">姓名</el-button> -->
            </el-col>
            <el-col :span="8">
                <span>证件号</span>
                <!-- <el-select-v2
                    v-model="value"
                    style="width: 240px"
                    multiple
                    filterable
                    remote
                    :remote-method="remoteMethod"
                    clearable
                    :options="options"
                    :loading="loading"
                    placeholder="Please enter a keyword"
                /> -->
                <el-input 
                 @change="selectDocumentEvt('jobID')"
                 :value="jobId"
                 style="width: 60%;" 
                 placeholder="请输入jobId" 
                 v-model="name" type="text"></el-input>
                <!-- <el-input style="width: 60%;" placeholder="请输入证件号" v-model="identifyid" type="text"></el-input> -->
<!-- 
                <el-popover
                    placement="top-start"
                    title="Title"
                    :width="200"
                    trigger="focus"
                    content="this is content, this is content, this is content"
                >
                    <template #reference>
                    </template>
                    <el-table :data="gridData">
                        <el-table-column width="150" property="date" label="date" />
                        <el-table-column width="100" property="name" label="name" />
                        <el-table-column width="300" property="address" label="address" />
                    </el-table>
                </el-popover> -->
                <!-- <el-button @click="selectDocumentEvt('id')">证件号</el-button> -->
            </el-col>
        </el-row>
        <!-- 已挂号待签到的列表 -->
        <el-card>
            <template #header>
                <span>待签到</span>
            </template>
            <el-table 
            ref="tableRef"
            :row-key="id"
            :data="infoList" 
            height="450"
            style="width: 100%"
            @select="selectEvt"
            @selection-change="selectionChangeEvt"
            @row-click="rowClickEvt"
            >
                <el-table-column fixed type="selection" width="55" />
                <el-table-column 
                label="创建日期"
                height="250"
                show-overflow-tooltip
                width="200">
                    <template #default="scope">
                        {{ scope.row.createDate }}
                    </template>
                </el-table-column>
                <el-table-column 
                fixed="left"
                property="name" 
                label="姓名" 
                width="120"/>
                <el-table-column 
                property="oldName" 
                label="曾用名" 
                width="120" />
                <el-table-column 
                property="gender" 
                label="性别" 
                width="120" >
                    <template #default=scope>
                        <span>{{ scope.row.gender===1?"男":"女" }}</span>
                    </template>
                </el-table-column>
                <el-table-column 
                property="nation" 
                label="名族" 
                width="120" >
                    <template #default=scope>
                        <span>{{ scope.row.nation===1?"汉族":"少数民族" }}</span>
                    </template>
                </el-table-column>
                <el-table-column 
                property="card_type_code" 
                label="卡类别" 
                width="120">
                    <template #default=scope>
                        <span>{{ scope.row.card_type_code===1?"身份证":scope.row.card_type_code===2?"护照":"驾驶证" }}</span>
                    </template>
                </el-table-column>
                <el-table-column 
                property="disaRes" 
                label="残疾情况" 
                width="120" >
                </el-table-column>
                <el-table-column 
                property="dieLocation" 
                label="死亡地点" 
                width="120" />
                <el-table-column 
                property="schoolgrade" 
                label="文化水平" 
                width="120" />
                
                <el-table-column 
                property="addressDetail" 
                label="详细地址" 
                width="240" />
                <el-table-column 
                property="addressTypeCode" 
                label="地址类别代码" 
                width="120" />
                <el-table-column 
                property="countryId" 
                label="国家" 
                width="120" >
                    <template #default=scope>
                        <span>{{ scope.row.countryId===48?"中国":"其他国家" }}</span>
                    </template>
                </el-table-column>
                <el-table-column 
                property="stateId" 
                label="省(自治区、直辖市)" 
                width="120" />
                <el-table-column 
                property="cityId" 
                label="市(地区、州)" 
                width="120" />
                <el-table-column 
                property="areaId" 
                label="县(区)" 
                width="120" />
                <el-table-column 
                property="domicileStateId" 
                label="户籍地址-省(自治区、直辖市)" 
                width="120" />
                <el-table-column 
                property="domicileCityId" 
                label="户籍地址-市(地区、州)" 
                width="120" />
                <el-table-column 
                property="domicileAreaId" 
                label="户籍地址-县(区)" 
                width="120" />
                <el-table-column 
                property="insurance" 
                label="医疗保险类别代码" 
                width="120" />
                <el-table-column 
                property="marry" 
                label="婚姻状况代码" 
                width="120" />
                <el-table-column 
                property="career" 
                label="职业类别代码" 
                width="120" />
                <el-table-column 
                property="workSubjection" 
                label="单位隶属关系" 
                width="120" />
                
                <el-table-column 
                property="averageIncome" 
                label="家庭年人均收入" 
                width="120" />
                
                <el-table-column 
                property="createUid" 
                label="档案创建人" 
                width="120" />
                <el-table-column 
                property="writeUid" 
                label="档案修改人" 
                width="120" />
                <el-table-column 
                property="politicalface" 
                label="政治面貌" 
                width="120" />
                <el-table-column 
                property="citizenHealthCardCode" 
                label="居民健康卡号" 
                width="120" />
                <el-table-column 
                property="citizenHealthArchiveCode" 
                label="居民健康档案编号" 
                width="120" />
                <el-table-column 
                property="identityType" 
                label="证件类型" 
                width="120" />
                <el-table-column 
                property="identifyid" 
                label="身份证号码" 
                width="120" />
                <el-table-column 
                property="phonenumber" 
                label="预留电话号码" 
                width="120" />
                <el-table-column 
                property="disaLv" 
                label="残疾等级" 
                width="120" />
                <el-table-column 
                property="dieReason" 
                label="死亡原因" 
                width="120" />
                <el-table-column 
                property="unique" 
                label="唯一识别码" 
                width="120" />
                <el-table-column 
                property="fax" 
                label="传真" 
                width="120" />
                <el-table-column 
                property="mail" 
                label="邮箱" 
                width="120" />
                width="120" />
                width="120" />
                <el-table-column 
                property="workName" 
                label="工作单位名称" 
                width="120" />
                <el-table-column 
                property="workPhone" 
                label="工作单位电话号码" 
                width="120" />
                <el-table-column 
                property="mail_code" 
                label="邮政编码" 
                width="120" />
                <el-table-column 
                property="contactName" 
                label="联系人姓名" 
                width="120" />
                <el-table-column 
                property="contactPhone" 
                label="联系人电话号码" 
                width="120" />
                <el-table-column 
                property="contacCateg" 
                label="联系人关系" 
                width="120" />
                <el-table-column 
                property="remark" 
                label="备注" 
                width="120" />
                <el-table-column 
                property="army" 
                label="是否退役军人" 
                width="120" >
                    <template #default=scope>
                        <span>{{ scope.row.army==true?"是":"否" }}</span>
                    </template>
                </el-table-column>
                <el-table-column 
                property="disability" 
                label="是否残疾人" 
                width="120" >
                    <template #default=scope>
                        <span>{{ scope.row.disability==true?"是":"否" }}</span>
                    </template>
                </el-table-column>
                <el-table-column 
                property="die" 
                label="是否死亡" 
                width="120" >
                    <template #default=scope>
                        <span>{{ scope.row.die==true?"是":"否" }}</span>
                    </template>
                </el-table-column>
                <el-table-column 
                property="bornyear" 
                label="出生年" 
                width="120" />
                <el-table-column 
                property="createDate" 
                label="创建日期" 
                width="120" />
                <el-table-column 
                property="writeDate" 
                label="修改日期" 
                width="120" />
                
                <!-- <el-table-column 
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
                </el-table-column> -->
            </el-table>
                
        </el-card>
    </div>
</template>
<script setup>
    import { onMounted, ref } from "vue";
    import { selectRegisterListApi, getRegisterListApi, chickInApi } from "@/api/medicalRecord/emrApi";
    import { ElMessage } from "element-plus";
    import { useRouter } from "vue-router";
    // import QRCode from 'qrcodejs2'

    const router = useRouter()
    let infoList = ref([])
    let name = ref('')
    let jobId = ref('')
    const currentPatientInfo = ref()
    // 表单选择事件
    const selectEvt = (selection,row)=>{
        console.log(selection);
        console.log(row);
        currentPatientInfo.value = selection[0]

    }
    
    async function selectDocumentEvt(type){
        // 根据name查找或者根据jobId查找
        console.log(name.value);
        let query = {}
        if(type==='jobId'){
            query.identifyid = jobId.value
        }else if(type === 'name'){
            query.name = name.value
        }
        const res = await selectRegisterListApi(query)
        console.log(res);
        if(res.code === 200){
            console.log(res.data);
            infoList.value = res.data.list
        }
        
    }
    // 挂号按钮事件
    function handleRegis(){
        router.push('/emrManage/registerAndCheckIn/PatientRegister')
    }
    async function chickInEvt(){
        // 签到方法，应该传递标识字段，id，patientID，jobID
        // 扫码，扫的应该是什么码……也是jobID吧？
        // 后端判断码或者jobID对应的的挂号记录是否有效（三天内）
        // getCheckInCode()
        if(!currentPatientInfo.value){
            ElMessage({type:'error',message:'请选择要签到的患者！'})
            return
        }
        console.log(currentPatientInfo.value.jobId);
        
        let res = await chickInApi({code:currentPatientInfo.value.jobId})
        if(res.code===200){
            console.log(res.data);
            // data里应该返回诊室信息，排队号，等信息吧
            ElMessage.success('签到成功，请去对应诊室等待就诊')
            // 刷新数据列表，重新显示
            await loadRegisterList({page:1,size:10})
            // 跳转页面，已签到列表或者回到挂号页面
            // router.push('/emrManage/registerAndCheckIn/PatientRegister')
        }
    }
    async function loadRegisterList(data){
        let res = await getRegisterListApi(data)
        console.log(res);
        if(res.code===200){
            console.log(res.data);
            
            infoList.value = res.data.list
            infoList.value.forEach(item=>{
                item.name = item.patient[0].name
            })
            // Object.assign(infoList.value,res.data.list.patient[0])
            console.log(infoList.value);
            
        }
    }
    onMounted(async ()=>{
        let res = 160.05 + 163.80 + 165.07 + 167.89 + 170.24 + 172.95
        console.log(res);
        
        // await selectDocumentEvt()
        await loadRegisterList({page:1,size:10})
    })

</script>
<style lang="scss" scoped>

</style>