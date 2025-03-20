<template>
    <div class="app-container">
        <el-row :span="24">
            <el-col :span="8">
                <el-button @click="choseDocumentEvt">选择档案</el-button>
                <el-button @click="regiserEvt">挂号</el-button>
                <el-button @click="handleCheckIn">去签到</el-button>
            </el-col>
            <el-col :span="8">
                <span>姓名 </span>
                <!-- :value="selectName" -->
                <el-input 
                 @change="selectDocumentEvt('name')"
                 @focus="showListEvt" 
                 style="width: 60%;" 
                 placeholder="请输入姓名" 
                 v-model="selectName"
                 type="text"></el-input>
                <!-- <el-button @click="selectDocumentEvt('name')">姓名</el-button> -->
            </el-col>
            <el-col :span="8">
                <span>证件号 </span>
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
                <!-- :value="identifyid"-->
                <el-input  
                 @change="selectDocumentEvt('id')"
                 @focus="showListEvt" 
                 style="width: 60%;" 
                 placeholder="请输入证件号" 
                 v-model="identifyid" 
                 type="text"></el-input>
            </el-col>
        </el-row>
        <!-- 填写基本信息区域 -->
        <!-- 挂号选择科室和医生的区域 -->
        <!-- 确认按钮 -->
        
        <el-card>
            <template #header>
                <span>挂号</span>
            </template>
            
                <!-- 填写用户档案 -->
                <!-- 应该是用户在客户机或者小程序上挂号 -->
                <!-- 1.建立就诊卡（就诊档案），就可以在档案管理里看到(patient表) -->
                <!-- 2.挂号,填写信息，选择科室,医生,时间段(Register表) -->
                    <!-- 2.1 客户机或者小程序挂号,-->
                     <!-- 2.1.1 刷就诊卡或者身份证，获取档案或者建立档案 -->
                     <!-- 2.1.2 选择科室,医生,时间段(Register表) -->
                     <!-- 2.1.3 挂号成功后生成签到码 -->
                     <!-- 2.1.4 （可选）在客户机刷就诊卡或者身份证取号-->
                    <!-- 2.2.到窗口，医护人员现场挂号，就是在本EMR系统的挂号页面 -->
                     <!-- 2.2.1 有就诊卡刷就诊卡，输入就诊卡号；无就诊卡刷身份证填写信息，建立档案 -->
                     <!-- 2.2.2 选择科室，医生等挂号信息 -->
                     <!-- 2.2.3 挂号成功后生成签到码，打印就诊号 -->
                <!-- 3.签到，扫码或者就诊卡 -->

            <!-- 用户档案信息表单区域 -->
            <!-- <div class='form-des' :key="key" style="margin-top:30px;">
                <v-form-render 
                :form-json="formJson" 
                :form-data="formData" 
                :option-data="optionData" 
                ref="vfRenderRef">
                </v-form-render>
            </div> -->
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
            </el-table>
            <el-pagination 
            background 
            :hide-on-single-page="value"
            :page-size="pagesize"
            :pager-count="11"
            current-change
            @update:current-page="updatePageEvt"
            layout="prev, pager, next" 
            :total="totalsize" 
            />
        </el-card>
    </div>
</template>
<script setup>
import { getEMRModulesListApi, selectTemplateApi, selectDocumentApi } from "@/api/medicalRecord/emrApi";
import { ref } from "vue";
import { getDocumentListApi } from "@/api/medicalRecord/emrApi";
import usePatientStore from '@/store/modules/patient';
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
    // 搜索选框
    // state应该是从数据库中搜索得到的结果
    // 输入框事件，remote-method里拿到的值用以搜索，数据库得到的结果就是state
    // 数据库后端返回name和identifyID（或者全部信息，state在前端处理为name和identifyID
    const states = [
        'Alabama',
        'Alaska',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Delaware',
        'Florida',
        'Georgia',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Pennsylvania',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Utah',
        'Vermont',
        'Virginia',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming',
    ]
    // 出路
    const list = states.map((item) => {
        return { value: `value:${item}`, label: `label:${item}` }
    })
    // 初始搜索条件，默认带分页
    const selectQuery = {page:1,size:20}
    let selectName = ref('')
    let identifyid = ref('')
    let pagesize = ref(20)
    let currentpage = ref(1)
    let totalsize = ref(100)

    const value = ref([])
    const options = ref([])
    const loading = ref(false)
    const infoList = ref([])
    const remoteMethod = (query) => {
        if (query !== '') {
            loading.value = true
            setTimeout(() => {
            loading.value = false
            options.value = list.filter((item) => {
                return item.label.toLowerCase().includes(query.toLowerCase())
            })
            }, 200)
        } else {
            options.value = []
        }
    }
    // end

    // 切换分页事件
    function updatePageEvt(p){
        console.log(p);
        // alert(p)
        currentpage.value = p
        reloadPage()
    }

    const currentPatientInfo = ref()
    // 表单选择事件
    const selectEvt = (selection,row)=>{
        console.log(selection);
        console.log(row);
        currentPatientInfo.value = selection[0]

    }
    // 表单点击事件
    const rowClickEvt = (row)=>{
        console.log(row);
        currentPatientInfo.value = row
    }
    const patientStore = usePatientStore()
    const router = useRouter()
    // 选择档案，跳转档案管理页面
    const choseDocumentEvt = ()=>{
        router.push('/emrManage/registerAndCheckIn/patientDocument')
    }
    // 挂号事件
    const regiserEvt = ()=>{
        console.log(currentPatientInfo.value)
        patientStore.setCurrentPatient(currentPatientInfo.value)
        router.push('/emrManage/registerAndCheckIn/registerEdit')
    }
    // 签到按钮事件
    function handleCheckIn(){
        router.push('/emrManage/registerAndCheckIn/PatientRegister')
    }
    // 分页渲染页面
    async function reloadPage(){
        console.log(selectQuery);
        // 更新一下selectQuery的page
        selectQuery.page = currentpage.value
        console.log(selectQuery);
        let res = await getDocumentListApi(selectQuery)
        console.log(res);
        if(res.code===200){
            console.log(res.data);
            infoList.value = res.data.list
            totalsize.value = res.data.count
        }
        console.log(totalsize.value);
        
    }
    onMounted(async()=>{
        reloadPage()
    })

    async function selectDocumentEvt(type){
        // 根据name查找或者根据id查找
        console.log(selectName.value);
        let query = {}
        selectQuery.page = currentpage.value
        selectQuery.size = pagesize.value
        if(type==='id'){
            // 添加搜索条件
            selectQuery.identifyid = identifyid.value
            query.identifyid = identifyid.value
        }else if(type === 'name'){
            selectQuery.name = selectName.value
            query.name = selectName.value
        }
        const res = await selectDocumentApi(selectQuery)
        console.log(res);
        if(res.code === 200){
            console.log(res.data);
            infoList.value = res.data.list
            totalsize.value = res.data.count
        }
        
    }
</script>
<style lang="scss" scoped>

</style>