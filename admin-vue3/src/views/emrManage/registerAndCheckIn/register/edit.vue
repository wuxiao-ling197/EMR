<template>
    <div class="app-container">
        <el-row :span="24">
            <el-col :span="8">
                <el-button style="width: 100%">按钮</el-button>
            </el-col>
        </el-row>
        <div class='form-des' :key="key">
            <!-- <el-card>
                <template #header>
                    <span>用户信息</span>
                </template> -->
            <!-- 填写用户档案 -->
            <el-scrollbar>
                <!-- 用户档案信息表单区域 -->
                <v-form-render 
                :form-json="formJson" 
                :form-data="formData" 
                :option-data="optionData" 
                ref="vfRenderRef">
                </v-form-render>
                <!-- 用户挂号信息 -->
                <v-form-render 
                :form-json="regisFormJson" 
                :form-data="regisFormData" 
                :option-data="optionData" 
                ref="vfRenderRegisRef">
                </v-form-render>
            </el-scrollbar>
            <!-- </el-card> -->
        </div>
        <div>
            <!-- 用于显示二维码的容器 -->
            <div ref="qrcode" class="qrcode"></div>
        </div>
        <el-row :span="24">
            <el-col :span="24">
                <el-button @click="regiserEvt" style="width: 100%;">确认提交</el-button>
            </el-col>
        </el-row>
    </div>
</template>
<script setup>
    import { onMounted, ref } from "vue";
    import { registerApi,selectTemplateApi } from "@/api/medicalRecord/emrApi";
    import { getDynamicOptionsApi } from '@/api/medicalRecord/formCreate';
    import usePatientStore from '@/store/modules/patient';
    import { ElMessage } from "element-plus";
    import { useRouter } from "vue-router";
    import { ElMessageBox } from "element-plus";
    const router = useRouter()
    const vfRenderRef = ref(null)
    const vfRenderRegisRef = ref(null)
    const qrcode = ref(null)
    const patientStore = usePatientStore()
    // 用户档案信息模板
    const formJson = ref({
        "widgetList":[],
        "formConfig":{
          "labelWidth":80,
          "labelPosition":"left",
          "size":"",
          "labelAlign":"label-left-align",
          "cssCode":"",
          "customClass":"",
          "functions":"",
          "layoutType":"PC",
          "onFormCreated":"",
          "onFormMounted":"",
          "onFormDataChange":""
        }
    });
    let formData = ref({
        age:"38",
        count:"10",
        desc:"腹泻",
        payway: 1,
        sex: 1,
        registerType: 1
    })
    let patientInfo = ref({})
    // 用户挂号信息模板
    const regisFormJson = ref({})
    let regisFormData = ref({})

    onMounted(async()=>{
        await getPatientInfoMudule()
        await getRegisterMudule()
        patientInfo.value = await patientStore.getCurrentPatient()
        console.log(patientInfo.value);
        // 获取当前info，然后获取挂号模板

        // 自动填写数据
        await setPatientInfo()
    })

    async function regiserEvt(){
        // 提交数据
        try{
            regisFormData.value = await vfRenderRegisRef.value.getFormData()
            // 转成数字类型
            regisFormData.value.departmentID = +regisFormData.value.departmentID
            regisFormData.value.doctorID = +regisFormData.value.doctorID

            let regisOpt = Object.assign({},formData.value,regisFormData.value)

            // 把所有的空字符串都转为null
            for (const key in regisOpt) {
                if (regisOpt.hasOwnProperty(key) && regisOpt[key] === "") {
                    regisOpt[key] = null;
                }
            }
            console.log(regisOpt);
            // return

            let res = await registerApi(regisOpt)
            console.log(res);
            if(res.code===200){
                // // 返回签到码--暂时定为jobId
                let checkCode = res.data.jobId
                ElMessageBox.alert('挂号成功', '', {
                    // if you want to disable its autofocus
                    // autofocus: false,
                    confirmButtonText: 'OK',
                    callback: (action) => {
                        ElMessage({
                            type: 'success',
                            message: `签到码如下: ${checkCode}`,
                        })
                    },
                })
                // 跳转挂号单页面
                router.push({
                    path: "/emrManage/registerAndCheckIn/PrintRegister",
                    query: { checkCode }
                });
            }
        }catch(err){
            // throw new Error(err)
            console.log(err);
        }
    }
    // 获取用户信息表单模板
    async function getPatientInfoMudule(){
        // 根据id或者name获取
        const res2 = await selectTemplateApi({name:'用户档案信息'})
        if(res2.code===200 ){
            console.log(res2.data);
            formJson.value = res2.data.payload.template
            vfRenderRef.value.setFormJson(formJson.value)
        }
        // console.log(list);
        // console.log(module);
    }
     // 获取用户信息表单模板
     async function getRegisterMudule(){
        // 根据id或者name获取
        const res = await selectTemplateApi({name:'挂号信息模板'})
        if(res.code===200){
            console.log(res.data);
            regisFormJson.value = res.data.payload.template
            vfRenderRegisRef.value.setFormJson(regisFormJson.value)
        }
    }
    
    // 获取选框组件选项
    async function getDynamicOptions(code='TP0102'){
        let query = {code}
        let res = await getDynamicOptionsApi(query)
        console.log(res);
        return res.data
    }

    // 计算年龄
    function calculateAge(bornyearStr) {
        let birthDate = new Date(bornyearStr);
        let today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        let monthDifference = today.getMonth() - birthDate.getMonth();
        let dayDifference = today.getDate() - birthDate.getDate();
        
        // 如果今天还没到生日，那么年龄需要减一
        if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
            age--;
        }
    
        return age;
    }
    // 填写信息
    async function setPatientInfo(){
        // 处理数据
        let bornyear = patientInfo.value.bornyear
        if(bornyear){
            let age = calculateAge(bornyear)
            formData.value.age = age
        }
        console.log(patientInfo.value);
       
       Object.assign(formData.value,patientInfo.value)
        vfRenderRef.value.setFormData(formData.value)
        console.log(formData.value);
        
        regisFormData.value.patientID = patientInfo.value.id
        vfRenderRegisRef.value.setFormData(regisFormData.value)
    }
</script>
<style lang="scss" scoped>
.app-container{
    height: 100%;
}
.v-md-editor {
    height: 100%;
}
.form-des{
    height: calc(100% - 32px - 32px);
}
</style>