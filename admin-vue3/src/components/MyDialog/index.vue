<template>
  <div class="dialog-container">
    <el-dialog v-model="dialogVisible" :title="formConf.title" :width="width">
      <!-- 使用默认插槽 -->
      <template v-if="!hasContentSlot">
        <div class="form-render-container">
          <v-form-render
            :form-json="formJson"
            :form-data="formData"
            :option-data="optionData"
            ref="vFormRef"
          >
          </v-form-render>
        </div>
      </template>

      <!-- 使用命名插槽 -->
      <slot name="content" @check-content="handleContentCheck"></slot>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelEvt">取消</el-button>
          <el-button type="primary" @click="confirmEvt"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { ref } from "vue";

export default {
  name: "MyDialog",
  props: {
    formTitle: {
      type: String,
      default: "医嘱",
    },
    formJson: {
      default: {
        widgetList: [
          {
            type: "textarea",
            icon: "textarea-field",
            formItemFlag: true,
            options: {
              name: "textarea60950",
              label: "doctor words",
              labelAlign: "label-left-align",
              rows: 3,
              defaultValue: "",
              placeholder: "",
              columnWidth: "200px",
              size: "large",
              labelWidth: null,
              labelHidden: false,
              readonly: false,
              disabled: false,
              hidden: false,
              required: false,
              requiredHint: "",
              validation: "",
              validationHint: "",
              customClass: [],
              labelIconClass: null,
              labelIconPosition: "rear",
              labelTooltip: null,
              minLength: null,
              maxLength: null,
              showWordLimit: false,
              onCreated: "",
              onMounted: "",
              onInput: "",
              onChange: "",
              onFocus: "",
              onBlur: "",
              onValidate: "",
            },
            id: "textarea60950",
          },
          {
            type: "number",
            icon: "number-field",
            formItemFlag: true,
            options: {
              name: "number38682",
              label: "number",
              labelAlign: "",
              defaultValue: 0,
              placeholder: "",
              columnWidth: "200px",
              size: "",
              labelWidth: null,
              labelHidden: false,
              disabled: false,
              hidden: false,
              required: false,
              requiredHint: "",
              validation: "",
              validationHint: "",
              customClass: "",
              labelIconClass: null,
              labelIconPosition: "rear",
              labelTooltip: null,
              min: -100000000000,
              max: 100000000000,
              precision: 0,
              step: 1,
              controlsPosition: "right",
              onCreated: "",
              onMounted: "",
              onChange: "",
              onFocus: "",
              onBlur: "",
              onValidate: "",
            },
            id: "number38682",
          },
        ],
        formConfig: {
          modelName: "formData",
          refName: "vForm",
          rulesName: "rules",
          labelWidth: 80,
          labelPosition: "left",
          size: "",
          labelAlign: "label-left-align",
          cssCode: "",
          customClass: "",
          functions: "",
          layoutType: "PC",
          onFormCreated: "",
          onFormMounted: "",
          onFormDataChange: "",
          onFormValidate: "",
        },
      },
    },
    width: {
      type: String,
      default: "500",
    },
    formConf: {
      default: {
        title: "my dialog",
      },
    },
    formData: {},
    optionData: {},
    click_confirm: {
      default: () => {},
    },
    click_cancel: {
      default: () => {},
    },
  },
  setup(props, { slots, emit }) {
    // 判断content具名插槽是否传入
    const hasContentSlot = ref(false);
    // 监听插槽内容的变化
    const checkSlotContent = () => {
      // 这是一个简单的方法来检查是否有内容传入插槽
      // 判断内容的有效性
      const slotContent = slots.content && slots.content()[0];
      hasContentSlot.value =
        slotContent && slotContent.type && slotContent.type !== "text";
    };
    // 在组件挂载后检查插槽内容
    onMounted(() => {
      checkSlotContent();
      console.log("hasContentSlot::");
      console.log(hasContentSlot.value);
      console.log(props.width);
    });
    // 监听插槽的变化（可选，取决于你的需求）
    // watch(() => slots.content, checkSlotContent);

    // 处理从插槽发送的事件
    const handleContentCheck = (hasContent) => {
      hasContentSlot.value = hasContent;
    };

    const myDialogRef = ref(null);
    const dialogVisible = ref(false);
    function showDialog() {
      console.log("-------show-dialog--------------");
      checkSlotContent();
      console.log("hasContentSlot::");

      console.log(hasContentSlot.value);

      dialogVisible.value = true;
    }
    function closeDialog() {
      dialogVisible.value = false;
    }
    function cancelEvt() {
      // 点击取消，关闭弹窗前逻辑
      console.log("cancel----");

      if (props.click_cancel) {
        console.log(props.click_cancel);
        props.click_cancel();
      }
      closeDialog();
    }
    function confirmEvt() {
      // 点击确定，关闭弹窗前逻辑
      console.log("confirm----");
      if (props.click_confirm) {
        console.log(props.click_confirm);
        props.click_confirm();
      }
      closeDialog();
    }

    return {
      hasContentSlot,
      handleContentCheck,
      // Props,
      myDialogRef,
      dialogVisible,
      showDialog,
      closeDialog,
      cancelEvt,
      confirmEvt,
    };
  },
};
</script>
<style lang="scss" scoped>
// .dialog-container{
//     position: fixed;
//     top: 50%;
//     left: 50%;
//     width: 50vw;
//     height: 50vh;
//     background: rgba(200, 102, 41, 0.3);
//     z-index: 999;
// }
.form-render-container {
  overflow-x: hidden;
  max-height: 300px;
  background: white;
  border-top: 1px solid #eee;
  box-shadow: 0px 3px 3px #ccc;
  padding: 15px;
}
</style>