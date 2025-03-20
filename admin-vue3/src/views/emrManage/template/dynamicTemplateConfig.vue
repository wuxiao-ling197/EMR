<template>
  <div class="app-container">
    <el-container>
      <el-aside width="300px">
        <el-input v-model="selectKey" @blur="selectEvt(selectKey)"> </el-input>
        <div class="tree-title">模板类别</div>
        <el-tree
          :data="data"
          :props="defaultProps"
          @node-click="handleNodeClick"
        />
      </el-aside>
      <el-main>
        <el-row :span="24">
          <el-col :span="12" class="formula-toolbar">
            <el-button @click="openFormulaWizard">公式向导</el-button>
            <el-button @click="insertMatrix">矩阵模板</el-button>
            <el-button @click="reLocation">返回</el-button>
          </el-col>
          <el-col :span="6" v-if="!isRender && !isMD">
            <el-select clearable v-model="fieldEntity" placeholder="可多选">
              <el-option
                v-for="item in entitiesFieldList"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-button @click="resetDataSource(2)">entity数据源</el-button>
          </el-col>
        </el-row>

        <div class="form-des" style="margin-top: 30px">
          <el-form :model="templateObj" label-width="auto">
              <el-form-item label="模板类型">
                  <el-radio-group v-model="templateObj.templateType">
                      <el-radio v-for="tempType in PayloadTypeEnum" :key="tempType" :label="tempType">{{tempType}}</el-radio>
                  </el-radio-group>
              </el-form-item>
              <el-form-item label="业务类型">
                  <el-radio-group v-model="templateObj.business">
                      <el-radio v-for="business in BusinessEnum" :key="business" :label="business">{{business}}</el-radio>
                  </el-radio-group>
              </el-form-item>
              <el-form-item label="类别">
                  <el-select v-model="templateObj.category" placeholder="Activity zone">
                      <el-option label="门诊病历" value="门诊病历" />
                      <el-option label="住院记录" value="住院记录" />
                  </el-select>
              </el-form-item>
              <el-row :span="24">
                  <el-col :span="12">
                      <el-form-item label="模板名">
                          <el-input v-model="templateObj.name" type="textarea" />
                      </el-form-item>
                  </el-col>
                  <el-col :span="12">
                      <el-form-item label="权限">
                        <el-select v-model="templateObj.permission" placeholder="Activity zone">
                            <el-option label="role1" value="role1" />
                            <el-option label="role2" value="role2" />
                        </el-select>
                      </el-form-item>
                  </el-col>
              </el-row>
              <el-form-item label="模板编号">
                  <el-input v-model="templateObj.number" type="textarea" />
              </el-form-item>
              <el-form-item label="是否可用">
                  <el-input v-model="templateObj.active" type="textarea" />
              </el-form-item>
              <el-form-item label="备注">
                  <el-input v-model="templateObj.remark" type="textarea" />
              </el-form-item>
          </el-form>
          <el-form :model="config" label-width="auto">
            <el-row>
              <el-col :span="12">
                <!-- parent: '',//上级模板 -->
                <el-form-item label="上级模板">
                  <el-select v-model="config.parent">
                    <el-option
                      v-for="opt in parentList"
                      :key="opt"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否启用">
                  <el-switch v-model="config.inUsing" />
                </el-form-item>
              </el-col>
            </el-row>
            <!-- <el-row>
              <el-col :span="12">
                <el-form-item label="模板名称">
                  <el-input v-model="config.name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="模板类型">
                  <el-select v-model="config.type" placeholder="please select">
                    <el-option label="表单" value="Form" />
                    <el-option label="markdown文档" value="MD" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row> -->
            <el-row>
              <el-col :span="12">
                <!-- readOnly: false,//是否只读 -->
                <el-form-item label="只读">
                  <el-radio-group v-model="readOnlyRedio">
                    <!-- <el-radio value="1" size="large">只读</el-radio>
                                        <el-radio value="2" size="large">编辑</el-radio> -->

                    <!-- elementPlus版本<2.6.0，只能这么用 -->
                    <el-radio label="Label1 & 1">是</el-radio>
                    <el-radio label="Label2 & 2">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <!-- editable: true,//允许编辑 -->
                <el-form-item label="允许编辑">
                  <el-select
                    v-model="config.editable"
                    placeholder="please select your zone"
                  >
                    <el-option label="允许" :value="true" />
                    <el-option label="禁止" :value="false" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="布局">
                  <el-select
                    v-model="config.format"
                    placeholder="please select your format"
                  >
                    <el-option label="栅格" value="栅格" />
                    <el-option label="表单" value="表单" />
                    <el-option label="表格" value="表格" />
                    <el-option label="无容器" value="无容器" />
                  </el-select>
                  <!-- <el-input v-model="config.format" /> -->
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否校验">
                  <el-select
                    v-model="config.ifValidate"
                    placeholder="please select your zone"
                  >
                    <el-option label="是" :value="true" />
                    <el-option label="否" :value="false" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :span="24">
                <el-col :span="20">
                  <el-form-item label="校验规则">
                      <el-input-tag
                        v-model="config.rules"
                        draggable
                        placeholder="Please input"
                      />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-button
                      @click="addValidateEvt"
                      :disabled="!config.ifValidate"
                      >添加校验</el-button
                    >
                </el-col>
            </el-row>
             
            <el-row :span="24">
              <el-col :span="20">
                <el-form-item label="包含字段">
                    <el-input-tag
                      v-model="selectFieldsLabels"
                      draggable
                      placeholder="Please input"
                    >
                    </el-input-tag>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-button @click="handleChoseValueList">选择字段</el-button>
              </el-col>
            </el-row>
            <!-- data: '',//数据源 -->
            <!-- <el-form-item label="数据源">
                            <el-input v-model="config.data" />
                        </el-form-item> -->

            <el-form-item label="时间">
              <el-col :span="11">
                <el-date-picker
                  v-model="config.date1"
                  type="date"
                  placeholder="Pick a date"
                  style="width: 100%"
                />
              </el-col>
              <el-col :span="2" class="text-center">
                <span class="text-gray-500">-</span>
              </el-col>
              <el-col :span="11">
                <el-time-picker
                  v-model="config.date2"
                  placeholder="Pick a time"
                  style="width: 100%"
                />
              </el-col>
            </el-form-item>
            <!-- 备注 -->
            <el-form-item label="备注">
              <el-input v-model="config.desc" type="textarea" />
            </el-form-item>
            <el-form-item> </el-form-item>
          </el-form>
        </div>
        <el-row :span="24">
          <el-col :span="24">
            <el-button type="primary" disabled @click="submitEvt">保存配置</el-button>
            <el-button @click="handleResetEvt">重置</el-button>
            <el-button @click="creatComponent">创建模板</el-button>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
  <MyDialog
    ref="selectModuleRef"
    :formConf="selectModuleConf"
    width="800"
    :click_confirm="selectModuleConfirmEvt"
    :click_cancel="selectModuleCancelEvt"
  >
    <template #content>
      <MyTree title="标准字段库" :data="treeData"></MyTree>
    </template>
  </MyDialog>

  <!-- 弹窗配置组件 -->
  <MyDialog
    ref="templateConfigRef"
    :click_confirm="myDialogConfirmEvt"
    :click_cancel="myDialogCancelEvt"
  >
    <template #content>
      <ConfigForm
        @update:formConf="formConfUpdate"
        :formConf="templateObj"
      ></ConfigForm>
    </template>
  </MyDialog>
</template>
  
  <script setup>
// 引入我的组件
import MyDialog from "@/components/MyDialog";
import MyTree from "@/components/MyTree";
// 引入自定义组件
import ConfigForm from './baseTemplates/templateConfig.vue';
import { BusinessEnum, PayloadTypeEnum } from '@/config/common.cfg';
import { getTemplateFeildsApi } from "@/api/medicalRecord/formCreate";
import { onMounted } from "vue";
import useFieldsStore from "@/store/modules/feildsStore";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import useUserStore from "@/store/modules/user";
import useMedicalRecordStore from "@/store/modules/medicalRecord";
const medicalRecordStore = useMedicalRecordStore();

const router = useRouter();
let fieldsStore = useFieldsStore();
/**tree相关的数据 */
const handleNodeClick = (data) => {
  console.log(data);
  if (!!data.info) {
    Object.assign(config, data.info);
    readOnlyRedio.value = data.info.readOnly ? "1" : "2";
    // 暂存配置
    origConfig = Object.assign({}, config);
  }
};
// 搜索框value
const selectKey = ref("");
// 搜索事件
const selectEvt = (value) => {
  console.log(value);
};
const defaultProps = {
  children: "children",
  label: "label",
};
let treeData = reactive([
  {
    label: "门诊记录",
    info: {
      name: "门诊记录", //模板名称
      type: "Form", //模板类型
      parent: "", //上级模板
      desc: "门诊记录", //备注
      readOnly: true, //只读
      format: "", //布局
      editable: true, //允许编辑
      data: "", //数据源
    },
    children: [
      {
        label: "签到挂号表",
        info: {
          name: "签到挂号表", //模板名称
          type: "Form", //模板类型
          parent: "门诊记录", //上级模板
          desc: "窗口签到挂号模板表", //备注
          readOnly: true, //只读
          format: "", //布局
          editable: true, //允许编辑
          data: "", //数据源
        },
      },
      {
        label: "个人档案表",
        info: {
          name: "个人档案", //模板名称
          type: "Form", //模板类型
          parent: "门诊记录", //上级模板
          desc: "患者个人信息档案", //备注
          readOnly: true, //只读
          format: "", //布局
          editable: true, //允许编辑
          data: "", //数据源
        },
      },
    ],
  },
  {
    label: "诊断记录",
    info: {
      name: "诊断记录基础模板", //模板名称
      type: "Form", //模板类型
      parent: "", //上级模板
      desc: "have a try", //备注
      readOnly: true, //只读
      format: "", //布局
      editable: true, //允许编辑
      data: "", //数据源
    },
    children: [
      {
        label: "内分泌科",
        info: {
          name: "内分泌科通用模板", //模板名称
          type: "Form", //模板类型
          parent: "诊断记录基础模板", //上级模板
          desc: "内分泌科基础模板结构", //备注
          readOnly: true, //只读
          format: "", //布局
          editable: true, //允许编辑
          data: "", //数据源
        },
        children: [
          {
            label: "甲状腺疾病",
            info: {
              name: "甲状腺疾病基础模板", //模板名称
              type: "Form", //模板类型
              parent: "内分泌科通用模板", //上级模板
              desc: "甲状腺疾病基础模板", //备注
              readOnly: true, //只读
              format: "", //布局
              editable: true, //允许编辑
              data: "", //数据源
            },
          },
          {
            label: "糖尿病",
            info: {
              name: "糖尿病基础模板", //模板名称
              type: "Form", //模板类型
              parent: "内分泌科通用模板", //上级模板
              desc: "糖尿病基础模板", //备注
              readOnly: true, //只读
              format: "", //布局
              editable: true, //允许编辑
              data: "", //数据源
            },
          },
        ],
      },
      {
        label: "内科",
        info: {
          name: "内科基础模板", //模板名称
          type: "Form", //模板类型
          parent: "门诊病历通用模板", //上级模板
          desc: "内科通用基础模板结构", //备注
          readOnly: true, //只读
          format: "", //布局
          editable: true, //允许编辑
          data: "", //数据源
        },
      },
    ],
  },
]);

// 主体配置表单config
/**config的数据 */
const config = reactive({
  name: "", //模板名称
  type: "", //模板类型
  parent: "", //上级模板
  // children: [],//子级模板
  readOnly: false, //是否只读
  format: "栅格", //布局
  editable: true, //允许编辑
  data: "", //数据源
  valueCode: [], //模板需要的字段，点击弹窗，从后端获取字段类别，category，code，value，树形选择，批量选择，创建模板时以规定格式传到后端，获取所有字段的组件配置，跳转编辑器，生成基础组件……
  date1: "",
  date2: "",
  inUsing: true, //是否启用
  resource: "",
  desc: "", //备注
  ifValidate: false, //是否设置校验
  rules: ["tag1", "tag2", "tag3"], //校验规则，暂定结构为{name:'name1',rule:[rule1,rule2,rule3...]}
});

let rules = ref();
// 暂存初始配置
let origConfig = {};
// 保存配置
function submitEvt() {}
// 重置事件
function handleResetEvt() {
  // 重新赋值为初始配置
  Object.assign(config, origConfig);
}
// 创建模板
async function creatComponent() {
  // 跳转到编辑器
  // 跳转页面之前，先弹出配置框，填写表单数据
  if (selectedFields.length == 0) {
    ElMessageBox({ type: "error", message: "请选给模板添加字段！" });
    return;
  }
  await showConfigEvt();
}

// 弹窗相关数据
const selectModuleConf = ref({
  title: "选择模板所需字段",
});
const selectModuleRef = ref(null);
// 选择模板所需字段的弹窗
const handleChoseValueList = () => {
  console.log(selectModuleRef.value);
  if (selectModuleRef.value) {
    selectModuleRef.value.showDialog();
  } else {
    console.error("selectModuleRef is not yet mounted or does not exist");
  }
};
let selectFieldsLabels = ref([])
let selectedFields = [];
// 点击选择模板弹窗确认按钮
async function selectModuleConfirmEvt() {
  console.log("------confirm");
  // 从store中获取当前模板已选择的字段
  //   getSelectedFeilds();
  // fieldsStore.getSelectedFields()
  console.log(fieldsStore.selectedFields);
  // 发送请求
  selectedFields = await fieldsStore.selectedFields;
  console.log(selectedFields);
  selectedFields.forEach(ele => {
    selectFieldsLabels.value.push(ele.label)
  });
  // console.log(selectFieldsLabels.value);
}

// 获取字段库
const getFieldLibrary = async () => {
  let res = await getTemplateFeildsApi();
  if (res.code === 200) {
    console.log(res.data);
    treeData = res.data;
  }
};

onMounted(async () => {
  // 获取字段库和字段
  await getFieldLibrary();
  console.log(treeData);
  // fieldsStore.getSelectedFields()
  console.log(fieldsStore.selectedFields);

  // 从store里读取模板配置templateObj
  if (medicalRecordStore.templateObj) {
    try {
      templateObj.value = medicalRecordStore.templateObj;
    }catch(err){
      console.log(err);
      
    }
  }
});
const currentUser = JSON.parse(useUserStore().currentUser);

/** 创建模板配置弹窗相关事件 */
// 在点击保存或者进入创建编辑页面时弹出框，表单，绑定templateObj
let templateObj = ref({});
const templateConfigRef = ref(null);
// 弹出配置框
async function showConfigEvt() {
  // 打开配置弹窗
  try {
    showConfDialogEvt();
  } catch (err) {
    console.log(err);
    return;
  }
}
// 打开配置弹窗
const showConfDialogEvt = async () => {
  console.log("showConfDialog");
  // 打开模板配置弹窗
  try {
    console.log(templateConfigRef.value);
    templateConfigRef.value.showDialog();
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// 监听子组件传递的事件
function formConfUpdate(val) {
  console.log(val);
  templateObj.value = val;
}
async function myDialogConfirmEvt() {
  // 点击配置弹窗的确定后拿到templateObj，处理后传递到创建模板的页面，作为配置项，
  // 在那边保存才调用接口创建模板，这边只是暂存和初步处理模板配置项
  console.log(templateObj.value);
  // let objJson = JSON.stringify(templateObj.value)
  let type = templateObj.value.templateType === "表单" ? "1" : "2";
  // 跳转之前保存配置到store
  console.log(medicalRecordStore);
  medicalRecordStore.setTemplateConfig(templateObj.value);
  // 点击确认后跳转
  router.push({
    path: "/emrManage/template/basicInfo",
    // query: { id:'add',tempType: type==2?'1':'2'}
    query: { id: "add", tempType: type },
  });
}
</script>
  
  <style lang="scss" scoped>
body {
  margin: 0; /* 如果页面出现垂直滚动条，则加入此行CSS以消除之 */
}
.app-container {
  height: 100%;
  &::v-deep .el-container{
    height: 100%;
    .el-main{
      height: 100%;
      display: flex!important;
      flex-direction: column;
    }
  }
  .form-des {
    overflow: auto;
    .v-md-editor {
      height: 100%;
    }
  }
}
</style>