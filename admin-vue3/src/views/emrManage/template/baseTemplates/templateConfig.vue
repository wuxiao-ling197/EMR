<template>
    <div class="container">
        <!-- <div class="form-box"> -->
        <el-form :model="localFormConf" label-width="auto" style="max-width: 600px">
            <el-form-item label="模板类型">
                <el-radio-group v-model="localFormConf.templateType">
                    <el-radio v-for="tempType in PayloadTypeEnum" :key="tempType" :label="tempType">{{tempType}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="业务类型">
                <el-radio-group v-model="localFormConf.business">
                    <el-radio v-for="business in BusinessEnum" :key="business" :label="business">{{business}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="类别">
                <el-select v-model="localFormConf.category" placeholder="Activity zone">
                    <el-option label="门诊病历" value="门诊病历" />
                    <el-option label="住院记录" value="住院记录" />
                </el-select>
            </el-form-item>
            <el-row span="24">
                <el-col span="8">
                    <el-form-item label="模板名">
                        <el-input v-model="localFormConf.name" type="textarea" />
                    </el-form-item>
                </el-col>
                <el-col span="8">
                    <el-form-item label="权限">
                        <el-input v-model="localFormConf.permission" type="textarea" />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="模板编号">
                <el-input disabled v-model="localFormConf.number" type="textarea" />
            </el-form-item>
            <el-form-item label="是否可用">
                <el-input disabled v-model="localFormConf.active" type="textarea" />
            </el-form-item>
            <el-form-item label="版本">
                <el-input disabled v-model="localFormConf.meta" type="textarea" />
            </el-form-item>
            <el-form-item label="备注">
                <el-input v-model="localFormConf.remark" type="textarea" />
            </el-form-item>
        </el-form>
        <!-- </div> -->
    </div>
</template>
  
<script setup>
    
    import { onMounted, onUnmounted } from 'vue';
    import { BusinessEnum, PayloadTypeEnum } from '@/config/common.cfg';

    const props = defineProps({
        formConf:{
            type:Object,
            required:true
        }
    })
    const localFormConf = ref({...props.formConf});
    const emit = defineEmits(['update:formConf']); // 定义自定义事件
    
    // 监听 localFormConf 的变化
    watch(localFormConf, (newVal, oldVal) => {
        // console.log(newVal);
        // 当 localFormConf 发生变化时，触发自定义事件
        emit('update:formConf', newVal);
    }, { deep: true }); // 使用 deep 选项来深度监听对象的变化

    onMounted(()=>{
        console.log('templateConfig-----');
        
        console.log(props.formConf);
    })
    onUnmounted(()=>{
        console.log('----unmounted');
        
        console.log(localFormConf.value); 
    })
</script>

<style lang="scss" scoped>
    // .container{
    //     position: relative;
    //     top: 0;
    //     left: 0;
    //     width: 100%;
    //     height: 100%;
    //     background: #eee;
        // .form-box{
        //     width: 60%;
        //     height: 60%;
        //     position: absolute;
        //     top: 50%;
        //     left: 50%;
        // }
    // }
</style>
  