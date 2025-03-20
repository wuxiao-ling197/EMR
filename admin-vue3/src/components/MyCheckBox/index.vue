<template>
  <div class="check-list-box">
    <el-checkbox
      v-model="checkAll"
      :indeterminate="isIndeterminate"
      @change="handleCheckAllChange"
    >
      [{{ fieldsName }}] 全选
    </el-checkbox>
    <el-checkbox-group
      v-model="checkedFields"
      @change="handleCheckedCitiesChange"
    >
      <el-checkbox
        v-for="field in fields"
        :key="field"
        :label="field.label"
        :value="field"
      >
        {{ field.label }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>
  <script setup>
import { onBeforeMount, onMounted, reactive, onBeforeUnmount, defineEmits } from "vue";
import useFieldsStore from "@/store/modules/feildsStore";
let fieldsStore = useFieldsStore();

const emit = defineEmits(["update-checked-fields"]);

const props = defineProps({
  fieldsName: {
    type: String,
    default: "",
  },
  fields: {
    type: Array,
    default: () => [{ lable: "label", value: "value" }],
  },
  title: {
    type: String,
    default: "My CheckBox",
  },
});
onMounted(() => {});

// 选中字段列表
const checkedFields = ref([]);
const isIndeterminate = ref(true);
const checkAll = ref(false);
let fields = [];

onBeforeMount(() => {
  console.log(props);
  if (props.fields) {
    // 初始化赋值
    fields = props.fields;
  }
});
// 全选事件，全选框发生变化
const handleCheckAllChange = (val) => {
  checkedFields.value = val ? fields : [];
  isIndeterminate.value = false;
  console.log(checkedFields.value);
  emit("update-checked-fields", checkedFields.value);
  // fieldsStore.setSelectedFields(checkedFields.value);
};
// 复选框列表中选择发生变化
const handleCheckedCitiesChange = (value) => {
  const checkedCount = value.length;
  //   全选和单选框变化都需要重新写入checkedFields
  // 但是最理想的情况是在弹窗的确认事件里拿到checkedFields
  // fieldsStore.setSelectedFields(checkedFields.value);
  console.log(checkedFields.value);
  emit("update-checked-fields", checkedFields.value);
  checkAll.value = checkedCount === fields.length;
  isIndeterminate.value = checkedCount > 0 && checkedCount < fields.length;
};

// 暴露获取选中字段的方法
const getCheckedFields = () => {
  return checkedFields.value;
};

defineExpose({
  getCheckedFields,
});
</script>
<style lang="scss" scoped>
.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  .el-checkbox {
    width: calc(100% / 3);
    padding: 0px;
    margin: 0px;
    ::v-deep .el-checkbox__label {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    &:hover {
      &::after {
        content: "";
      }
    }
  }
}
</style>