<template>
  <div class="app-container">
    <!-- <switch-roles @change="handleRolesChange" /> -->
    <!-- 其实无论编辑还是新增模板，进来都是designer，只有查看才是render。并且disabled，模板没有formData -->
    <!-- 公式工具栏 -->
    <el-row :span="24">
      <el-col :span="6" v-if="!isRender && isMD" class="formula-toolbar">
        <el-button type="text" @click="insertSymbol('∑')">∑</el-button>
        <el-button @click="openFormulaWizard">公式向导</el-button>
        <el-button @click="insertMatrix">矩阵模板</el-button>
        <el-button @click="reLocation">返回</el-button>
      </el-col>
      <el-col :span="6" v-if="!isRender && !isMD">
        <el-select clearable v-model="fieldCategory" placeholder="可多选">
          <el-option
            v-for="item in categoryList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-col>
      <el-col :span="3" v-if="!isRender && !isMD">
        <el-button @click="resetDataSource(1)">category数据源</el-button>
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
      <el-col :span="3" v-if="!isRender && !isMD">
        <el-button @click="resetDataSource(2)">entity数据源</el-button>
      </el-col>
    </el-row>

    <div class="form-des" v-if="showDesigner" style="margin-top: 30px">
      <v-form-render
        aria-disabled="true"
        v-if="isRender && !isMD"
        ref="vfRenderRef"
        :form-json="formJson"
        :form-data="formData"
        :option-data="optionData"
      >
      </v-form-render>
      <v-form-designer
        v-if="!isRender && !isMD"
        :field-list-api="getFieldopt"
        ref="vfDesignerRef"
        @field-change="handleFieldChange"
        :designerConfig="designerConfig"
        :banned-widgets="bannedWidgets"
      >
      </v-form-designer>
      <!-- 如果是编辑或者新增就是编辑器模式 -->
      <v-md-editor
        v-if="!isRender && isMD"
        ref="vmEditorRef"
        v-model="mdTemplate"
        @change="handleChange"
        @blur="mdBlurEvt"
        :include-level="[2, 3]"
      ></v-md-editor>
      <!-- 动态表单渲染 -->
      <div v-for="field in dynamicFields" :key="field">
        <input v-model="mdFormData[field]" :placeholder="`请输入 ${field}`" />
      </div>
      <!-- 条件区块 -->
      <div v-if="showTemperature">
        <h3>体温记录</h3>
        <input type="number" v-model="mdFormData.temperature" />
      </div>

      <div class="previewBox" v-if="isRender && isMD">
        <div class="previewIndexs">
          <div
            class="previewIndex"
            v-for="anchor in titles"
            :key="anchor.indent"
            :style="{ padding: `10px 0 10px ${anchor.indent * 20}px` }"
            @click="handleAnchorClick(anchor)"
          >
            <a style="cursor: pointer">{{ anchor.title }}</a>
          </div>
        </div>
        <v-md-preview
          :text="mdTemplate"
          ref="vmPreviewRef"
          height="400px"
          :include-level="[3, 4]"
        />
      </div>
    </div>
    <el-row :span="24">
      <el-col :span="24">
        <el-button
          v-if="showSubmitButton"
          style="width: 100%"
          @click="submitTemplateEvt"
        >
          保存模板
        </el-button>
      </el-col>
    </el-row>

    <!-- 弹窗配置组件 -->
    <!-- <ConfigForm v-if="isShow" ref="templateFormRef" :formConf='templateObj'></ConfigForm> -->
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

    <MyDialog
      ref="softKeyboardRef"
      :click_confirm="softKeyboardConfirmEvt"
      :click_cancel="softKeyboardCancelEvt"
    >
      <template #content>
        <div class="formula-keyboard">
          <el-button
            v-for="symbol in symbols"
            :key="symbol"
            @click="insertSymbol(symbol)"
          >
            {{ symbol }}
          </el-button>
        </div>
      </template>
    </MyDialog>
  </div>
</template>
  
  <script>
import {
  createTemplateApi,
  selectTemplateApi,
} from "@/api/medicalRecord/emrApi";
import {
  getEntitiesMetaDataApi,
  getHospitalMetadataCategoryApi,
  getDynamicOptionsApi,
} from "@/api/medicalRecord/formCreate";

import generateTemplateJson from "@/utils/generateFormJson";

import { getToken } from "@/utils/auth";
import useUserStore from "@/store/modules/user";
import { nextTick, ref } from "vue";
import useMedicalRecordStore from "@/store/modules/medicalRecord";

// vform表单相关配置
import {
  vFormWidgets,
  vFormConfigJson as formJson,
} from "@/config/common.cfg.js";
// 引入自定义组件
import ConfigForm from "./templateConfig.vue";
import MyDialog from "@/components/MyDialog";

import useFieldsStore from "@/store/modules/feildsStore";

export default {
  name: "BasicInfo",
  components: { ConfigForm, MyDialog },
  setup() {
    // try md动态交互
    const mdFormData = ref({});
    const dynamicFields = ref([]);
    const dynamicLabels = ref([]);
    const showTemperature = ref(false);
    // 保存草稿
    const saveDraft = (text) => {};
    // 校验数据
    const validateContent = (text) => {};
    // 模板字段
    let selectedFields = [];
    let fieldsStore = useFieldsStore();
    selectedFields = fieldsStore.selectedFields;

    // 防抖函数
    let debounceTimeout;
    const debounceWait = 300; // 防抖等待时间（毫秒）
    const debounce = (func, wait) => {
      return function (...args) {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        debounceTimeout = setTimeout(() => {
          func.apply(this, args);
        }, wait);
      };
    };
    const handleChange = debounce((newText) => {
      // 提取变量
      dynamicFields.value = [...newText.matchAll(/{{(.*?)}}/g)].map(
        (match) => match[1]
      );
      console.log(dynamicFields.value);
      // 提取主诉等需要填写的字段
      dynamicLabels.value = [...newText.matchAll(/\*\*\[(.*?)\]\*\*/g)].map(
        (match) => match[1]
      );
      console.log(dynamicLabels.value);

      // 检测条件语句
      showTemperature.value = newText.includes("{% if 发烧 %}");

      // 可选：自动清理已删除的变量
      Object.keys(mdFormData.value).forEach((key) => {
        if (!dynamicFields.value.includes(key)) {
          delete mdFormData.value[key];
        }
      });
      saveDraft(newText); // 自动保存
      validateContent(newText); // 业务规则校验
    }, 1000);
    // try end

    const token = "Bearer " + getToken();
    // 数据源类型
    let fieldCategory = ref("人口学及社会经济学特征");
    // 如果是来自实体的数据源，实体名
    let fieldEntity = ref("");

    let showDesigner = ref(true);
    // 卫生信息数据源类型列表
    const categoryList = ref([]);
    // 数据库表数据源实体列表
    let entitiesFieldList = ref([]);
    // v-form编辑器初始数据源
    let getFieldopt = ref({
      URL: `http://localhost:8888/dev-api/emrManage/Metadata/fieldList?category=${
        fieldCategory.value
      }&categoryCode=123&_=${Date.now()}`,
      nameKey: "fieldName",
      labelKey: "fieldLabel",
      headers: {
        Authorization: token,
        "Cache-Control": "no-cache",
      },
    });
    let categoryIndex = ref(0);
    // 重新设置数据源类型
    const setCategory = (category) => {
      showDesigner.value = false;
      // 从数据源大类列表中切换当前数据源类别
      console.log(category);
      console.log(fieldCategory.value);
      // 修改数据源对象请求接口
      getFieldopt.value = {
        URL: `http://localhost:8888/dev-api/emrManage/Metadata/fieldList?category=${category}&categoryCode=123&_=${Date.now()}`,
        nameKey: "fieldName",
        labelKey: "fieldLabel",
        headers: {
          Authorization: token,
        },
      };
    };
    // 重新设置数据源实体
    const setEntities = (entity) => {
      showDesigner.value = false;
      // 从数据源大类列表中切换当前数据源类别
      console.log(entity);
      console.log(fieldEntity.value);
      // 修改数据源对象请求接口
      getFieldopt.value = {
        URL: `http://localhost:8888/dev-api/emrManage/Metadata/hospitalPatientMetadata?entityName=${entity}&entityCode=123&_=${Date.now()}`,
        nameKey: "fieldName",
        labelKey: "fieldLabel",
        headers: {
          Authorization: token,
        },
      };
    };

    const currentUser = JSON.parse(useUserStore().currentUser);
    const medicalRecordStore = useMedicalRecordStore();
    const currentTemplate = medicalRecordStore.currentModule;

    const isRender = ref(true);
    const isMD = ref(currentTemplate?.payload?.type === "2");
    let mdTemplate = "## isEmpty";
    let symbols = ["∑", "∫", "√", "∞", "≈", "≠", "≤", "≥", "π", "ε"];
    const tempType = ref(null);
    // 在点击保存或者进入创建编辑页面时弹出框，表单，绑定templateObj
    // 等于上一个页面传递过来的配置
    let templateObj = ref({});

    // md预览模式的标题锚点
    let titles = ref([]);

    // 显示配置表格
    const isShow = true;
    const templateConfigRef = ref(null);
    // 打开配置弹窗
    function showConfDialogEvt() {
      console.log("showConfDialog");
      // 打开模板配置弹窗
      try {
        console.log(templateConfigRef.value);
        templateConfigRef.value.showDialog();
      } catch (err) {
        console.log(err);
        throw err;
      }
    }
    // 获取卫生信息数据源类别（模板大类）
    async function getCategory() {
      const res = await getHospitalMetadataCategoryApi();
      if (res.code === 200) {
        res.data.list.forEach((item) => {
          categoryList.value.push(item.category);
        });
      }
      console.log("医院相关的卫生信息数据原值域-------");
      console.log(categoryList.value);
    }
    // 获取数据库实体数据源实体（实体名列表）
    async function getEntities() {
      // 获取后端所有实体
      let res = await getEntitiesMetaDataApi();
      // console.log(res);
      if (res.code === 200) {
        res.data.list.forEach((item) => {
          entitiesFieldList.value.push(item.comment);
        });
      }
    }
    return {
      mdFormData,
      dynamicFields,
      showTemperature,
      handleChange,

      showDesigner,
      currentUser,
      currentTemplate,
      categoryList,
      entitiesFieldList,
      getCategory,
      getEntities,
      setCategory,
      setEntities,
      categoryIndex,
      isRender,
      isMD,
      mdTemplate,
      symbols,
      titles,
      templateObj,
      medicalRecordStore,
      isShow,
      templateConfigRef,
      showConfDialogEvt,
      fieldCategory,
      fieldEntity,
      getFieldopt,
      tempType,
      selectedFields,
    };
  },
  computed: {
    templateId() {
      return this.$route.query.id;
    },
  },
  watch: {
    $route(to, from) {
      console.log(to.query);
      // 检查新的路由对象中的查询参数是否包含 'id' 并且与之前的不同
      if (to.query.id !== from.query.id) {
        console.log(`from ${from.query.id} change to ${to.query.id}`);
        // 执行重新加载页面方法或其他操作
        this.reloadPage(to.query.id);
        // alert('111')
      }
    },
  },
  data() {
    return {
      formJson,
      showSubmitButton: true,
      isScrolling: false,
      templateKey: "TP98",
    };
  },
  beforeMount() {
    console.log("on beforemount-------");
    // console.log('this.templateId:',this.templateId);
    this.reloadPage(this.templateId);
  },

  async mounted() {
    // 获取实体的元数据
    await this.getFieldOfEntity();
    // 获取医院的数据源值域和大类
    await this.getCategory();
    // 获取数据库实体列表
    await this.getEntities();

    // md文档浏览状态下锚点定位方法
    if (this.$refs.vmPreviewRef) {
      this.locationIndex();
    }

  },
  methods: {
    // 尝试动态生成表单widget，根据key生成
    async generateTemplate(templateKey) {
      console.log(templateKey);
      // return 
      let isEntityColumns = true;
      let isCodeList = false;
      // 初始化一下
      // this.formJson.widgetList = []
      if (typeof templateKey === "string") {
        this.formJson.widgetList = await generateTemplateJson({
          categoryCode: templateKey,
        });
      } else if (isCodeList && Array.isArray(templateKey)) {
        this.formJson.widgetList = await generateTemplateJson({
          fieldList: templateKey,
        });
      } else if(isEntityColumns){
        this.formJson.widgetList = await generateTemplateJson({
          entityColumns: templateKey,
        });
        console.log(this.formJson.widgetList);
        
      }
      console.log(this.formJson);
      
      this.$refs.vfDesignerRef.setFormJson(this.formJson);
    },
    // 锚点定位方法
    locationIndex() {
      // console.log(this.$refs.vmPreviewRef);
      // 预览模式下的锚点跳转
      const anchors =
        this.$refs.vmPreviewRef.$el.querySelectorAll("h1,h2,h3,h4,h5,h6");
      const titles = Array.from(anchors).filter(
        (title) => !!title.innerText.trim()
      );
      if (!titles.length) {
        this.titles = [];
        return;
      }
      const hTags = Array.from(
        new Set(titles.map((title) => title.tagName))
      ).sort();
      this.titles = titles.map((el) => ({
        title: el.innerText,
        lineIndex: el.getAttribute("data-v-md-line"),
        indent: hTags.indexOf(el.tagName),
      }));
    },
    // 数学公式输入图形化界面相关
    // 输入求和符号$\sum$
    insertSymbol(symbol = "sum") {
      // console.log(this.mdTemplate);
      this.addMDText(symbol);
    },
    addMDText(symbol) {
      this.$refs.vmEditorRef.insert((selected) => {
        const prefix = "$";
        const suffix = "$";
        const content = symbol;
        return {
          // 要插入的文本
          text: `${prefix}${content}${suffix}`,
          // 插入后要选中的文本
          selected: content,
        };
      });
    },
    // 公式向导
    openFormulaWizard() {
      try {
        console.log(this.$refs.softKeyboardRef);
        this.$refs.softKeyboardRef.showDialog();
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    // 矩阵模板
    insertMatrix() {
      this.addMDText("\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}");
    },

    // 编辑器失去焦点事件2
    mdBlurEvt(evt) {
      console.log(evt);
    },

    // 重新设置form编辑状态下数据源
    resetDataSource(type) {
      // 点击按钮
      // 判断是否重设哪类数据源
      if (type === 1) this.setCategory(this.fieldCategory);
      else this.setEntities(this.fieldEntity);
      // 重新加载编辑器，发送请求
      this.$nextTick(() => {
        console.log(this.getFieldopt.URL);
        // this.showDesigner = true;通过给设计器组件加一个v-if来实现销毁和重新加载组件
        this.showDesigner = true;
        console.log(this.showDesigner);
      });
    },
    // 返回基础模板
    reLocation() {
      this.$router.push("/emrManage/template/templateConfig");
    },

    // 获取选框组件选项
    async getDynamicOptions(code = "TP0102") {
      let query = { code };
      let res = await getDynamicOptionsApi(query);
      console.log(res);
      return res.data;
    },

    // 加载表单选项的方法
    // 在编辑器组件挂载后调用？
    setOptions() {
      // 获取需要设置选项的选框组件（fieldName）ref
      let selectBoxRefs = getWidgetRef(widgetName, true);
      // 获取对应fieldName的（value-valueMean）options
      selectBoxRefs.forEach((item) => {
        // getOptions
        let options = this.getDynamicOptions(item.fieldName); //[{label: '选项1', value: '1'},{label: '选项2', value: '2'},{label: '选项3', value: '3'}]
        item.loadOptions(options);
      });
    },

    // 获取patientInfo元数据和所有实体类别和元数据
    async getFieldOfEntity() {
      // 获取后端所有实体
      let res = await getEntitiesMetaDataApi();
      // console.log(res);
      if (res.code === 200) {
        let patientInfofield = [];
        let entytiesFieldList = [];
        res.data.list.forEach((item) => {
          // 获取tableName为hospital_patient的病人信息表的元数据
          if (item.comment === "病人信息表") {
            patientInfofield = item.fields;
          }
          // 将所有实体的元数据添加到一个fieldList中，即所有的数据源
          // 最好将每一个item的fields[]都解构再合并成一个数组（或者concat），但不同的实体可能有重名的字段，（比如每个实体都有id）需要处理解决）
          entytiesFieldList.push(item.fields);
        });
        // 最后根据当前创建表单的类别，将不同的数据源赋给form设计器
        // console.log(patientInfofield);
        // console.log(entytiesFieldList);
      }
    },

    // 判断当前模板类型并赋值
    determineAndAssignmentEvt(template) {
      // console.log('templatetemplatetemplatetemplate');
      // console.log(template);

      if (template.payload.type === "1") {
        this.formJson = template.payload.template;
        // console.log(this.formJson);
      } else if (template.payload.type === "2") {
        this.mdTemplate = template.payload.template;
        // console.log(this.mdTemplate);
      }
    },
    // 新增和编辑模板好像全都是designer
    async reloadPage(id) {
      if (!id) {
        return;
      }
      if (id === "add") {
        // 说明是新增
        this.isRender = false;
        this.showSubmitButton = true;
        // 从store里获取配置，修改templateObj
        if (this.medicalRecordStore.templateObj) {
          try {
            this.templateObj = this.medicalRecordStore.templateObj;
            this.tempType = this.$route.query.tempType;
          } catch (err) {
            console.error(err);
          }
        }
        // console.log(this.tempType);
        this.isMD = this.tempType === "1" ? false : true;
        if (this.tempType === "1") {
          nextTick(() => {
            // 如果是form编辑器，新增模式先清空画板
            this.$refs.vfDesignerRef.clearDesigner();
            
            // 拿到选中字段
            // fieldsStore.getSelectedFields()
            console.log(this.selectedFields);
            if(this.selectedFields.length>0){
              // 发送请求
              this.generateTemplate(this.selectedFields);
            }else{
              // 动态生成模板
              this.generateTemplate(this.templateKey);
            }
          });
        }
      } else if (id === "edit") {
        // 说明是编辑
        // console.log(this.currentTemplate);
        // console.log(this.templateObj);

        // this.templateObj = {...this.currentTemplate};
        Object.assign(this.templateObj, this.currentTemplate);
        // console.log(this.templateObj);
        this.isRender = false;
        this.showSubmitButton = true;
        this.tempType = this.currentTemplate.payload.type;
        this.isMD = this.tempType === "1" ? false : true;
        // 把当前模板的内容赋值给当前编辑器或者渲染器
        this.determineAndAssignmentEvt(this.currentTemplate);
        if (this.tempType === "1") {
          nextTick(() => {
            this.$refs.vfDesignerRef.setFormJson(this.formJson);
          });
        }
      } else if (id === "detail") {
        // 查看，不需要设计表单，只需要拿到currentTemplate然后渲染
        this.isRender = true;
        this.showSubmitButton = false;
        // console.log(this.currentTemplate);
        this.tempType = this.currentTemplate.payload.type;
        this.isMD = this.tempType === "1" ? false : true;
        // 判断类型并赋值
        this.determineAndAssignmentEvt(this.currentTemplate);
        if (this.tempType === "1") {
          nextTick(async () => {
            await this.$refs.vfRenderRef.setFormJson(this.formJson);
            // 表单禁用编辑
            this.$refs.vfRenderRef.disableForm();
          });
        }
      }
    },

    // 新增相关的问题
    setDesignerFormJson() {
      this.$refs.vfDesignerRef.serFormJson(this.formJson);
    },

    // 发送请求的方法
    async selectTemplate(id) {
      return await selectTemplateApi(id);
    },
    async createTemplate(data) {
      return await createTemplateApi(data);
    },

    // 监听子组件传递的事件
    formConfUpdate(val) {
      console.log(val);
      this.templateObj = val;
    },
    // 提交数据，新增模板
    async submitTemplateEvt() {
      // 可能是form也可能是md
      // 有可能是编辑模板，tempType为this.currentTemplate.payload.type
      // 有可能是新增模板，tempType为this.$route.query.tempType
      this.formJson =
        this.tempType === "1"
          ? this.$refs.vfDesignerRef.getFormJson()
          : this.$refs.vmEditorRef.getValue();
      console.log(this.formJson);

      // 打开配置弹窗
      try {
        this.showConfDialogEvt();
        // 处理数据
        // this.templateObj.payload = this.formJson;
        // this.templateObj.name = this.formJson;
        // this.templateObj.payload = this.formJson;
        // this.templateObj.payload = this.formJson;
      } catch (err) {
        console.log(err);
        return;
      }
    },
    async myDialogConfirmEvt() {
      // 点击确定后拿到templateObj，处理后才调用报错模板方法
      console.log(this.templateObj);
      this.templateObj.payload = {
        template: this.formJson,
        type: this.tempType,
      };
      // 发送请求，保存模板/创建模板
      let res = await this.createTemplate(this.templateObj);
      if (res.code === 200) {
        this.$message.success("模板已保存！");
        this.$router.push("/emrManage/template/templateConfig");
      } else {
        this.$message.error("模板保存失败");
      }
    },
    // 点击md锚点标题
    handleAnchorClick(anchor) {
      // if (this.isScrolling) {
      //   console.log('scrolling...');
      //   return; // 如果正在滚动，则不执行任何操作
      // }

      this.isScrolling = true; // 设置标志位为正在滚动
      console.log(anchor);
      const scrollContainer = document.querySelector(".form-des");
      const { vmPreviewRef } = this.$refs;
      const { lineIndex } = anchor;
      const heading = vmPreviewRef.$el.querySelector(
        `[data-v-md-line="${lineIndex}"]`
      );
      // v-md-editor自带的锚点定位方法
      if (heading) {
        // 注意：如果你使用的是编辑组件的预览模式,则这里的方法名改为 previewScrollToTarget
        vmPreviewRef.scrollToTarget({
          target: heading,
          scrollContainer: scrollContainer,
          top: 60,
        });
      }
      // if (heading) {
      //    // 尝试自定义滚动方法
      //   const targetPosition = heading.getBoundingClientRect().top;
      //   const containerHeight = scrollContainer.clientHeight;
      //   const scrollTop = Math.max(0, targetPosition - (containerHeight / 2)); // 例如，滚动到目标元素居中
      //   console.log('targetPosition:',targetPosition);
      //   console.log('containerscrollTop:',scrollContainer.scrollTop);
      //   scrollContainer.scrollTo({
      //     top: scrollTop,
      //     behavior: 'smooth' // 这将提供平滑的滚动效果
      //   });

      //   // 监听滚动事件，以便在滚动完成后更新标志位
      //   let scrollCheckTimeout;
      //   const onScroll = () => {
      //     console.log('scrollEvt');
      //     clearTimeout(scrollCheckTimeout); // 清除之前的定时器
      //     scrollCheckTimeout = setTimeout(() => {
      //       if (Math.abs(scrollContainer.scrollTop - scrollTop) < 5) { // 使用一个容差值
      //         console.log('finish');
      //         this.isScrolling = false;
      //         scrollContainer.removeEventListener('scroll', onScroll);
      //       }
      //     }, 100); // 等待一段时间后再检查
      //   };
      //   scrollContainer.addEventListener('scroll', onScroll);
      // }else {
      //   this.isScrolling = false; // 如果没有找到标题，也清除标志位（可选）
      // }
    },
  },
};
</script>
  
  <style lang="scss" scoped>
body {
  margin: 0; /* 如果页面出现垂直滚动条，则加入此行CSS以消除之 */
}
.app-container {
  height: 100%;
  .form-des {
    height: calc(100% - 32px);
    overflow: auto;
    .v-md-editor {
      height: 100%;
    }
  }
}
.main-container .form-des {
  margin-top: 0px !important;
  ::v-deep .el-header.main-header {
    // v-form的表头，改不了只能隐藏了
    display: none;
  }
  ::v-deep .el-header.toolbar-header {
    // v-form的 右半行工具栏，不能和左半行工具出现在同一行显示，使用定位强制限制在同一行
    position: relative;
    .right-toolbar {
      // float: right;
      position: absolute;
      top: 0;
      right: 0;
      text-align: right;
      width: 350px !important;
      display: flex;
      justify-content: flex-end;
    }
  }

  ::v-deep .el-container.full-height {
    margin-left: 0px !important;
    .el-container {
      height: 100%;
      .el-main.form-widget-main .el-scrollbar {
        height: 100% !important;
        .el-scrollbar__wrap,
        .el-scrollbar__view {
          height: 100%;
          .form-widget-container[data-v-28ec7276] {
            height: 100%;
            .el-form.full-height-width[data-v-28ec7276] {
              height: 100%;
              .form-widget-list[data-v-28ec7276] {
                min-height: 100%;
                padding: 0px;
              }
            }
          }
        }
      }
      .el-tabs.el-tabs--top {
        height: 100%;
      }
      .el-tabs__content {
        height: 90%;
        #pane-1,
        #pane-2 {
          height: 100%;
          .el-scrollbar.setting-scrollbar {
            height: 100% !important;
          }
        }
      }
    }
  }
}
.previewBox {
  display: flex;
  position: relative;
  .previewIndexs {
    width: 10vw;
    position: fixed;
    height: 100%;
    overflow: scroll;
    // top: 0;
    box-shadow: 2px 0px 3px 0px #eee;
  }
  .v-md-editor-preview {
    position: absolute;
    left: 10vw;
  }
}
</style>