<template>
  <el-card>
    <template #header>
      {{ props.title }}
    </template>
    <div class="select-template-box" :style="{ height: props.height + 'px' }">
      <div class="left">
        <!--  :style="{ height: props.leftHeight + 'px' }" -->
        <el-input
          v-model="filterText"
          style="width: 240px"
          placeholder="Filter keyword"
        />
        <el-scrollbar ref="scrollLefContainer">
          <el-tree
            @node-click="nodeClickEvt"
            ref="treeRef"
            style="max-width: 600px"
            class="filter-tree"
            :data="props.data"
            :props="defaultProps"
            :filter-node-method="filterNode"
            :highlight-current="true"
            :default-expand-all="false"
            accordion
          />
        </el-scrollbar>
      </div>
      <div class="right">
        <!--  :style="{ height: props.rightHeight + 'px' }" -->
        <!-- <h1>当前模板</h1> -->
        <el-scrollbar ref="scrollRitContainer">
          <!-- <p>text content</p> -->
          <!-- 具名插槽 -->
          <slot name="rightContent" @check-content="handleContentCheck"></slot>
          <div
            class="field-check-box"
            v-for="(fields,index) in fieldList"
            :key="index"
          >
            <MyCheckBox
              :fieldsName="fields.name"
              :fields="fields.children"
              @update-checked-fields="handleCheckedFieldsUpdate(fields.name, $event)"
            ></MyCheckBox>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </el-card>
</template>
<script setup>
import { number } from "echarts";
import { onBeforeUnmount, onMounted, reactive } from "vue";
import MyCheckBox from "@/components/MyCheckBox/index";
import useFieldsStore from "@/store/modules/feildsStore";
import { getFieldsByStanderdCodeApi } from "@/api/medicalRecord/formCreate"

const fieldsStore = useFieldsStore();

const props = defineProps({
  data: {
    type: Object,
    default: () => [
      {
        id: 1,
        label: "Level one 1",
        children: [
          {
            id: 4,
            label: "Level two 1-1",
          },
        ],
      },
    ],
  },
  title: {
    type: String,
    default: "My Tree",
  },
  height: {
    type: Number,
    default: 300,
  },
});
onMounted(() => {
  console.log(props.data);
});

// 输入框检索关键字
const filterText = ref("");
const treeRef = ref();

const defaultProps = {
  children: "children",
  label: "label",
};
const fieldList = reactive([]);
watch(filterText, (val) => {
  treeRef.value.filter(val);
});
// 过滤节点数据的方法
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.includes(value);
};
// 点击节点事件
async function nodeClickEvt(target) {
  console.log(target);
  if (target.code != "TP33" && target.type === "标准编码类别") {
    console.log(target.children);
    if(target.children.length === 0){
      // 发送请求，获取fields
      let res = await getFields({categoryCode:target.code})
      if(res.code===200){
        target.children = res.data.list
        fieldList.push(target);
      }
    }
    else if(target.children.length > 0){
      // fieldList.push({
      //   fieldName: target.name,
      //   fields: target.children,
      // });
      // 校验，如果重复就不再推入
      if (fieldList.some((fields) => fields.code === target.code)) {
        return;
      }
      fieldList.push(target);
    }
  }
  else if(target.parent==="TP33" && target.type==="编码类型"){
    if(target.children.length === 0){
      // 发起请求
      let res = await getFields({code:target.code})
      if(res.code===200){
        target.children = res.data.list
        fieldList.push(target);
      }
    }
    else if(target.children.length > 0){
      // 校验，如果重复就不再推入
      if (fieldList.some((fields) => fields.code === target.code)) {
        return;
      }
      fieldList.push(target);
    }
  }
  else if(target.parent==="entities" && target.type==="实体"){
    if(target.children.length > 0){
      // 校验，如果重复就不再推入
      if (fieldList.some((fields) => fields.code === target.code)) {
        return;
      }
      fieldList.push(target);
    }
  }
}
const getFields = (opt)=>{
  console.log('getFields-------');
  return getFieldsByStanderdCodeApi(opt)
}
// 处理 MyCheckBox 组件选中字段更新
const allCheckedFields = reactive(new Map());
const handleCheckedFieldsUpdate = (index, newCheckedFields) => {
  console.log('=======emit========');
  
  console.log(index);
  console.log(newCheckedFields);
  
  // 更新对应类型的选中字段
  allCheckedFields.set(index, newCheckedFields)
  // 合并所有选中字段
  const mergedCheckedFields = [];  allCheckedFields.forEach((fields) => {
    mergedCheckedFields.push(...fields);
  });
  // 写入 store
  fieldsStore.setSelectedFields(mergedCheckedFields);
};
</script>
<style lang="scss" scoped>
.select-template-box {
  display: flex;
  position: relative;
  .left {
    width: 30%;
    height: 100%;
    position: absolute;
    padding-top: 32px;
    .el-input {
      width: 100% !important;
      position: absolute;
      top: 0px;
      z-index: 2;
    }
  }
  .right {
    width: 70%;
    height: 100%;
    position: absolute;
    padding-top: 32px;
    right: 0px;
    box-shadow: inset 2px 2px 3px #eee;
    padding: 10px 20px;
    overflow-y: hidden;
  }
}
</style>