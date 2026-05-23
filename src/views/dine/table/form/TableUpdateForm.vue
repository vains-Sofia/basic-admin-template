<script setup lang="ts">
import { ref } from 'vue'
import { formRules } from '../utils/rule'
import type { FormProps } from '../utils/types'
import { pageStore } from '@/api/dine/Store.ts'
import { TableStatusEnum } from '@/api/types/Enums.ts'

const {
    formInline = {
        storeId: undefined,
        name: '',
        code: '',
        capacity: 5,
        tableStatus: TableStatusEnum.IDLE,
    },
} = defineProps<FormProps>()

const ruleFormRef = ref()
const newFormInline = ref(JSON.parse(JSON.stringify(formInline)))

const fetchStores = async (params: any) => {
    return pageStore(params)
}

defineExpose({
    getRef: () => ruleFormRef.value,
    getData: () => newFormInline,
})
</script>

<template>
    <el-form ref="ruleFormRef" :model="newFormInline" :rules="formRules" label-width="96px">
        <el-form-item label="所属门店" prop="storeId">
            <remote-select-v2
                v-model="newFormInline.storeId"
                :fetch-function="fetchStores"
                placeholder="请选择所属门店"
                class="w-full"
                clearable
            />
        </el-form-item>
        <el-form-item label="桌台名称" prop="name">
            <el-input v-model="newFormInline.name" clearable placeholder="请输入桌台名称" />
        </el-form-item>
        <el-form-item label="桌台编号" prop="code">
            <el-input v-model="newFormInline.code" clearable placeholder="请输入桌台编号" />
        </el-form-item>
        <el-form-item label="桌台容量" prop="capacity">
            <el-input-number
                v-model="newFormInline.capacity"
                class="!w-full"
                :min="1"
                :max="99"
                controls-position="right"
            />
        </el-form-item>
        <el-form-item label="桌台状态" prop="tableStatus">
            <el-radio-group v-model="newFormInline.tableStatus">
                <el-radio-button :value="TableStatusEnum.IDLE">空闲</el-radio-button>
                <el-radio-button :value="TableStatusEnum.OCCUPY">占用</el-radio-button>
                <el-radio-button :value="TableStatusEnum.RESERVE_A_SEAT">留座</el-radio-button>
            </el-radio-group>
        </el-form-item>
    </el-form>
</template>
