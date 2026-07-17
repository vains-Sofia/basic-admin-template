<script setup lang="ts">
import { Key, Message } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { onBeforeUnmount, reactive, ref } from 'vue'

import * as authApi from '@/api/modules/auth'
import type { EmailLoginData } from '@/api/types/AuthTypes'

defineOptions({ name: 'EmailLogin' })

const formRef = ref<FormInstance>()
const sending = ref(false)
const cooldown = ref(0)
const form = reactive<EmailLoginData>({ email: '', code: '' })
let countdownTimer: number | undefined

const rules: FormRules<EmailLoginData> = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入邮件验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码应为 6 位数字', trigger: 'blur' },
  ],
}

function startCooldown(): void {
  cooldown.value = 60
  window.clearInterval(countdownTimer)
  countdownTimer = window.setInterval(() => {
    if (cooldown.value > 0) cooldown.value -= 1
    else window.clearInterval(countdownTimer)
  }, 1000)
}

async function sendCode(): Promise<void> {
  const valid = await formRef.value?.validateField('email').catch(() => false)
  if (!valid) return

  sending.value = true
  try {
    await authApi.sendEmailCode(form.email)
    startCooldown()
    ElMessage.success(
      import.meta.env.VITE_USE_MOCK === 'true'
        ? '验证码已发送，演示验证码为 123456'
        : '验证码已发送，请检查邮箱',
    )
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '验证码发送失败')
  } finally {
    sending.value = false
  }
}

async function validate(): Promise<EmailLoginData | null> {
  const valid = await formRef.value?.validate().catch(() => false)
  return valid ? { ...form } : null
}

defineExpose({ validate })
onBeforeUnmount(() => window.clearInterval(countdownTimer))
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    class="email-login"
    hide-required-asterisk
    size="large"
  >
    <el-form-item prop="email">
      <el-input v-model="form.email" autocomplete="email" placeholder="请输入邮箱地址">
        <template #prefix
          ><el-icon><Message /></el-icon
        ></template>
      </el-input>
    </el-form-item>

    <div class="email-login__code">
      <el-form-item prop="code">
        <el-input
          v-model="form.code"
          autocomplete="one-time-code"
          inputmode="numeric"
          maxlength="6"
          placeholder="请输入邮件验证码"
        >
          <template #prefix
            ><el-icon><Key /></el-icon
          ></template>
        </el-input>
      </el-form-item>
      <el-button :disabled="cooldown > 0" :loading="sending" plain @click="sendCode">
        {{ cooldown > 0 ? `${cooldown}s` : '获取验证码' }}
      </el-button>
    </div>

    <p class="email-login__hint">验证码仅用于本次登录验证，请勿转发给他人。</p>
  </el-form>
</template>

<style scoped>
.email-login {
  display: flex;
  min-height: 250px;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 18px;
}

.email-login__code {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 138px;
  gap: 14px;
}

.email-login__code .el-button {
  height: 54px;
  border-color: var(--login-border);
  border-radius: 6px;
  color: var(--login-primary);
  background: transparent;
}

.email-login__hint {
  margin: 0;
  color: var(--login-muted);
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 480px) {
  .email-login__code {
    grid-template-columns: minmax(0, 1fr) 112px;
    gap: 10px;
  }
}
</style>
