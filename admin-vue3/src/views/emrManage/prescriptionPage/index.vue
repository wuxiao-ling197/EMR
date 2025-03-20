<template>
    <div class="app-container">
      <!-- 患者信息 -->
      <el-card>
        <template #header>
          <div class="card-header">
            <span>当前患者信息</span>
          </div>
        </template>
        <div v-if="currentPatient">
          <p>姓名: {{ currentPatient.name }}</p>
          <p>性别: {{ currentPatient.patient_gender }}</p>
          <p>科室: {{ currentPatient.department }}</p>
        </div>
        <div v-else>
          <el-empty description="请选择患者"></el-empty>
        </div>
      </el-card>
  
      <!-- 药品选择 -->
      <el-card>
        <template #header>
          <div class="card-header">
            <span>药品选择</span>
          </div>
        </template>
        <!-- 搜索框 -->
        <el-input v-model="searchKeyword" placeholder="搜索药品名称" @input="handleSearch"></el-input>
        <el-table
          ref="medicineTableRef"
          :data="currentMedicineList"
          style="width: 100%"
          @selection-change="handleMedicineSelectionChange"
        >
          <el-table-column fixed type="selection" width="55" />
          <el-table-column property="en_US" label="药品名称" width="120" />
          <el-table-column property="price" label="价格" width="100" />
          <el-table-column property="usage" label="用法用量" width="200" />
        </el-table>
        <!-- 分页组件 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredMedicineList.length"
        >
        </el-pagination>
        <el-button type="primary" @click="addSelectedMedicines">添加选中药品</el-button>
      </el-card>
  
      <!-- 处方信息 -->
      <el-card>
        <template #header>
          <div class="card-header">
            <span>处方信息</span>
          </div>
        </template>
        <el-table
          ref="prescriptionTableRef"
          :data="prescriptionList"
          style="width: 100%"
          @selection-change="handlePrescriptionSelectionChange"
        >
          <el-table-column fixed type="selection" width="55" />
          <el-table-column property="en_US" label="药品名称" width="120" />
          <el-table-column property="price" label="价格" width="100" />
          <el-table-column property="usage" label="用法用量" width="200" />
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="danger" @click="removeMedicine(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="savePrescription">保存处方</el-button>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue';
  import { ElMessage } from 'element-plus';
  import { getPatientListApi } from '@/api/medicalRecord/emrApi';
  import { getMedicineListApi, savePrescriptionApi } from '@/api/medicalRecord/prescriptionApi';

  import usePatientStore from '@/store/modules/patient';
  
  const patientStore = usePatientStore();
  const medicineTableRef = ref(null);
  const prescriptionTableRef = ref(null);
  const currentPatient = ref(patientStore.currentPatient);
  const medicineList = ref([]);
  const prescriptionList = ref([]);
  const selectedMedicines = ref([]);
  const selectedPrescriptionItems = ref([]);
  // 搜索关键字
  const searchKeyword = ref('');
  // 过滤后的药品列表
  const filteredMedicineList = ref([]);
  // 当前页
  const currentPage = ref(1);
  // 每页显示数量
  const pageSize = ref(10);
  // 当前显示的药品列表
  const currentMedicineList = ref([]);
  
  onMounted(async () => {
    await getMedicineList();
  });
  
  // 获取药品列表
  const getMedicineList = async () => {
    try {
      const res = await getMedicineListApi();
      if (res.code === 200) {
        medicineList.value = res.data.list.map(medi=>{
          return{
            en_US:medi.productTmpl.name.en_US,
            zh_CN:medi.productTmpl.name.zh_CN,
            price:0,
            usage:'吞服'
          }
        })
        filteredMedicineList.value = res.data.list.map(medi=>{
          return{
            en_US:medi.productTmpl.name.en_US,
            zh_CN:medi.productTmpl.name.zh_CN,
            price:0,
            usage:'吞服'
          }
        })
        updateCurrentMedicineList();
      }
    } catch (err) {
      console.log(err);
      ElMessage.error('获取药品列表失败');
    }
  };
  
  // 处理药品选择变化
  const handleMedicineSelectionChange = (selection) => {
    selectedMedicines.value = selection;
  };
  
  // 添加选中药品到处方
  const addSelectedMedicines = () => {
    if (selectedMedicines.value.length === 0) {
      ElMessage.warning('请选择要添加的药品');
      return;
    }
    prescriptionList.value = [...prescriptionList.value, ...selectedMedicines.value];
    medicineTableRef.value.clearSelection();
    selectedMedicines.value = [];
  };
  
  // 处理处方列表选择变化
  const handlePrescriptionSelectionChange = (selection) => {
    selectedPrescriptionItems.value = selection;
  };
  
  // 删除处方中的药品
  const removeMedicine = (row) => {
    const index = prescriptionList.value.findIndex(item => item.id === row.id);
    if (index !== -1) {
      prescriptionList.value.splice(index, 1);
    }
  };
  
  // 保存处方
  const savePrescription = async () => {
    if (!currentPatient.value) {
      ElMessage.warning('请选择患者');
      return;
    }
    if (prescriptionList.value.length === 0) {
      ElMessage.warning('请添加药品到处方');
      return;
    }
    try {
      const res = await savePrescriptionApi({
        patientId: currentPatient.value.patientID,
        medicines: prescriptionList.value.map(item => ({
          medicineId: item.id,
          usage: item.usage
        }))
      });
      if (res.code === 200) {
        ElMessage.success('处方保存成功');
        prescriptionList.value = [];
      } else {
        ElMessage.error('处方保存失败');
      }
    } catch (err) {
      console.log(err);
      ElMessage.error('处方保存失败');
    }
  };

  // 处理搜索
  const handleSearch = () => {
    if (searchKeyword.value) {
      filteredMedicineList.value = medicineList.value.filter(item =>
        item.zh_CN.includes(searchKeyword.value)
      );
    } else {
      filteredMedicineList.value = medicineList.value;
    }
    currentPage.value = 1;
    updateCurrentMedicineList();
  };

  // 处理每页显示数量变化
  const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
    updateCurrentMedicineList();
  };

  // 处理当前页变化
  const handleCurrentChange = (newPage) => {
    currentPage.value = newPage;
    updateCurrentMedicineList();
  };

  // 更新当前显示的药品列表
  const updateCurrentMedicineList = () => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    currentMedicineList.value = filteredMedicineList.value.slice(start, end);
  };
  </script>
  
  <style lang="scss" scoped>
  .app-container {
    padding: 20px;
    display: flex;
    flex-direction: row;
    // 修改选择器语法，并且去掉不必要的 width 属性
    & > *:nth-child(1) {
      flex: 2;
    }
    & > *:nth-child(2) {
      flex: 4;
    }
    & > *:nth-child(3) {
      flex: 4;
    }
  }
  
  .card-header {
    font-weight: bold;
  }
  .el-card.is-always-shadow, .el-card.is-hover-shadow:focus, .el-card.is-hover-shadow:hover {
      /* overflow: scroll; */
      /* height: 300px; */
      display: flex;
      flex-direction: column;
      ::v-deep .el-card__body {
          flex: 1;
          overflow: auto;
      }
  }
  
  </style>