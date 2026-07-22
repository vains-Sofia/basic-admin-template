<script setup lang="ts">
import {
  CircleCheck,
  Grid,
  Lock,
  Message,
  Moon,
  Refresh,
  Sunny,
  Timer,
  User,
} from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { EmailLoginData } from '@/api/types/AuthTypes'
import { DEFAULT_ROUTE } from '@/config/app'
import { isOAuth2Enabled } from '@/config/oauth2'
import { redirectToOAuth2 } from '@/services/oauth2'
import { useLayoutStore } from '@/stores/layout'
import { useUserStore } from '@/stores/user'

import EmailLogin from './components/EmailLogin.vue'
import QrCodeLogin from './components/QrCodeLogin.vue'

defineOptions({ name: 'LoginView' })

type LoginMode = 'password' | 'qrcode' | 'email'

interface QrCodeLoginExpose {
  refresh: () => Promise<void>
}

interface EmailLoginExpose {
  validate: () => Promise<EmailLoginData | null>
}

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()
const userStore = useUserStore()
const requestedMode = route.query.mode
const initialLoginMode: LoginMode =
  requestedMode === 'qrcode' || requestedMode === 'email' ? requestedMode : 'password'
const formRef = ref<FormInstance>()
const submitting = ref(false)
const rememberAccount = ref(false)
const loginMode = ref<LoginMode>(initialLoginMode)
const alternativeModes = ref<[LoginMode, LoginMode]>(
  initialLoginMode === 'qrcode'
    ? ['password', 'email']
    : initialLoginMode === 'email'
      ? ['qrcode', 'password']
      : ['qrcode', 'email'],
)
const qrCodeRef = ref<QrCodeLoginExpose>()
const emailLoginRef = ref<EmailLoginExpose>()
const captcha = reactive({ left: 1, right: 9, answer: 10 })
const form = reactive({ username: 'admin', password: 'admin123', captcha: '' })

const primaryButtonText = computed(() => (loginMode.value === 'qrcode' ? '刷新二维码' : '登录'))
const loginModeLabels: Record<LoginMode, string> = {
  password: '账号登录',
  qrcode: '扫码登录',
  email: '邮件登录',
}

function validateCaptcha(_rule: unknown, value: string, callback: (error?: Error) => void): void {
  if (!value.trim()) {
    callback(new Error('请输入验证码'))
    return
  }

  callback(Number(value) === captcha.answer ? undefined : new Error('验证码错误'))
}

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ validator: validateCaptcha, trigger: 'blur' }],
}

function refreshCaptcha(): void {
  captcha.left = Math.floor(Math.random() * 8) + 1
  captcha.right = Math.floor(Math.random() * 8) + 1
  captcha.answer = captcha.left + captcha.right
  form.captcha = ''
  formRef.value?.clearValidate('captcha')
}

function showUnavailable(feature: string): void {
  ElMessage.info(`${feature}暂未开放`)
}

function switchLoginMode(index: number): void {
  if (index !== 0 && index !== 1) return

  const previousMode = loginMode.value
  loginMode.value = alternativeModes.value[index]
  alternativeModes.value[index] = previousMode
}

async function navigateAfterLogin(): Promise<void> {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
  if (isOAuth2Enabled()) {
    await redirectToOAuth2()
    return
  }
  await router.replace(redirect ?? DEFAULT_ROUTE)
}

async function submitPassword(): Promise<void> {
  if (!(await formRef.value?.validate().catch(() => false))) return
  submitting.value = true

  try {
    if (rememberAccount.value) localStorage.setItem('login-username', form.username)
    else localStorage.removeItem('login-username')

    await userStore.signIn({ username: form.username, password: form.password })
    await navigateAfterLogin()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
    refreshCaptcha()
  } finally {
    submitting.value = false
  }
}

async function submitEmail(): Promise<void> {
  const data = await emailLoginRef.value?.validate()
  if (!data) return

  submitting.value = true
  try {
    await userStore.signInByEmail(data)
    await navigateAfterLogin()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '邮件登录失败')
  } finally {
    submitting.value = false
  }
}

async function handlePrimaryAction(): Promise<void> {
  if (loginMode.value === 'qrcode') {
    await qrCodeRef.value?.refresh()
    return
  }

  if (loginMode.value === 'email') {
    await submitEmail()
    return
  }

  await submitPassword()
}

onMounted(() => {
  const savedUsername = localStorage.getItem('login-username')
  if (savedUsername) {
    form.username = savedUsername
    rememberAccount.value = true
  }
})
</script>

<template>
  <main class="login-page" :class="{ 'is-dark': layoutStore.isDark }">
    <section class="brand-pane" aria-label="产品介绍">
      <header class="brand-header">
        <div class="brand-logo" aria-hidden="true">
          <span>V</span>
          <span>V</span>
        </div>
        <strong>Basic Admin Template</strong>
        <span class="version">v1.0</span>
      </header>

      <div class="brand-content">
        <div class="brand-badge"><span></span>Enterprise Ready</div>
        <h1>企业级管理系统</h1>
        <p>提供安全、高效、可扩展的管理解决方案，助力企业数字化转型与业务增长。</p>

        <ul class="feature-list" aria-label="产品优势">
          <li>
            <el-icon><CircleCheck /></el-icon>安全可靠
          </li>
          <li>
            <el-icon><Timer /></el-icon>高效稳定
          </li>
          <li>
            <el-icon><Refresh /></el-icon>灵活扩展
          </li>
        </ul>
      </div>
    </section>

    <section class="form-pane">
      <div class="page-actions">
        <el-tooltip :content="layoutStore.isDark ? '切换至浅色模式' : '切换至深色模式'">
          <button
            class="icon-button"
            type="button"
            :disabled="layoutStore.isThemeTransitioning"
            :aria-label="layoutStore.isDark ? '切换至浅色模式' : '切换至深色模式'"
            @click="layoutStore.toggleDarkMode"
          >
            <el-icon :size="21">
              <Sunny v-if="layoutStore.isDark" />
              <Moon v-else />
            </el-icon>
          </button>
        </el-tooltip>
      </div>

      <div class="mobile-brand">
        <span class="mobile-brand__mark">A</span>
        <strong>Basic Admin</strong>
      </div>

      <div class="login-form-wrap">
        <div class="form-heading">
          <h2>欢迎回来</h2>
          <p>请完成身份验证后进入系统</p>
        </div>

        <div class="login-form" @keyup.enter="handlePrimaryAction">
          <el-form
            v-if="loginMode === 'password'"
            ref="formRef"
            :model="form"
            :rules="rules"
            hide-required-asterisk
            size="large"
          >
            <el-form-item prop="username">
              <el-input v-model="form.username" autocomplete="username" placeholder="请输入用户名">
                <template #prefix
                  ><el-icon><User /></el-icon
                ></template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                autocomplete="current-password"
                placeholder="请输入密码"
                show-password
                type="password"
              >
                <template #prefix
                  ><el-icon><Lock /></el-icon
                ></template>
              </el-input>
            </el-form-item>

            <div class="captcha-row">
              <el-form-item prop="captcha">
                <el-input
                  v-model="form.captcha"
                  autocomplete="off"
                  inputmode="numeric"
                  maxlength="2"
                  placeholder="请输入验证码"
                >
                  <template #prefix
                    ><el-icon><CircleCheck /></el-icon
                  ></template>
                </el-input>
              </el-form-item>
              <el-tooltip content="刷新验证码">
                <button class="captcha" type="button" @click="refreshCaptcha">
                  <span>{{ captcha.left }}</span>
                  <i>+</i>
                  <span>{{ captcha.right }}</span>
                  <i>=</i>
                  <b>?</b>
                </button>
              </el-tooltip>
            </div>

            <div class="form-options">
              <el-checkbox v-model="rememberAccount">记住我</el-checkbox>
              <button class="text-button" type="button" @click="showUnavailable('密码找回')">
                忘记密码？
              </button>
            </div>
          </el-form>

          <QrCodeLogin v-else-if="loginMode === 'qrcode'" ref="qrCodeRef" />
          <EmailLogin v-else ref="emailLoginRef" />

          <el-button
            class="login-submit"
            type="primary"
            :loading="submitting"
            @click="handlePrimaryAction"
          >
            {{ primaryButtonText }}
          </el-button>

          <div class="other-divider"><span>其他登录方式</span></div>

          <div class="other-logins">
            <el-button
              v-for="(mode, index) in alternativeModes"
              :key="`${index}-${mode}`"
              plain
              @click="switchLoginMode(index)"
            >
              <el-icon>
                <User v-if="mode === 'password'" />
                <Grid v-else-if="mode === 'qrcode'" />
                <Message v-else />
              </el-icon>
              {{ loginModeLabels[mode] }}
            </el-button>
          </div>
        </div>
      </div>

      <footer>Copyright © 2026 Basic Admin</footer>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  --login-primary: #2463eb;
  --login-text: #1d293d;
  --login-muted: #8b98ad;
  --login-border: #dce3ed;
  --login-surface: #ffffff;
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(0, 1.92fr) minmax(480px, 1fr);
  overflow: hidden;
  color: var(--login-text);
  background: var(--login-surface);
}

.brand-pane {
  position: relative;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding: clamp(28px, 3.8vw, 60px) clamp(36px, 4vw, 80px);
  overflow: hidden;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 0%) 91%, rgb(116 109 255 / 7%)),
    linear-gradient(145deg, #f8fbff 6%, #f3faff 52%, #e8f7ff 100%);
}

.brand-pane::after {
  position: absolute;
  right: -12%;
  bottom: -30%;
  width: 64%;
  height: 75%;
  border-radius: 50%;
  background: rgb(123 97 255 / 8%);
  content: '';
  filter: blur(80px);
}

.brand-header {
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: clamp(20px, 1.7vw, 29px);
}

.brand-logo {
  position: relative;
  width: 44px;
  height: 42px;
  flex: 0 0 44px;
  font-size: 42px;
  font-weight: 300;
  line-height: 42px;
}

.brand-logo span {
  position: absolute;
  font-family: Arial, sans-serif;
}

.brand-logo span:first-child {
  top: -4px;
  left: 0;
  color: #ff7849;
}

.brand-logo span:last-child {
  top: 4px;
  left: 8px;
  color: #36b8ff;
}

.version {
  padding: 3px 9px;
  border: 1px solid #d6e2ff;
  border-radius: 999px;
  color: #5d82ed;
  background: #edf3ff;
  font-size: 12px;
  font-weight: 600;
}

.brand-content {
  z-index: 1;
  width: min(100%, 760px);
  margin: auto 0;
  padding-bottom: 10vh;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #cfe0ff;
  border-radius: 999px;
  color: #5d82ed;
  background: rgb(239 246 255 / 75%);
  font-size: 13px;
  font-weight: 600;
}

.brand-badge span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6692ff;
  box-shadow: 0 0 0 4px rgb(102 146 255 / 12%);
}

.brand-content h1 {
  margin: 24px 0 16px;
  font-size: clamp(38px, 4vw, 62px);
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.15;
}

.brand-content > p {
  margin: 0;
  color: #6c7e97;
  font-size: clamp(16px, 1.3vw, 21px);
  line-height: 1.8;
}

.feature-list {
  display: flex;
  align-items: center;
  gap: 0;
  margin: 34px 0 0;
  padding: 0;
  list-style: none;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #314056;
  font-size: 14px;
  font-weight: 600;
}

.feature-list li + li::before {
  width: 1px;
  height: 16px;
  margin: 0 18px;
  background: #d6deea;
  content: '';
}

.feature-list .el-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  color: #6692ff;
  background: #e9f2ff;
}

.form-pane {
  position: relative;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding: 32px clamp(34px, 5vw, 104px) 24px;
  background: var(--login-surface);
  transition: background 0.2s ease;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
}

.icon-button,
.text-button,
.captcha {
  border: 0;
  font: inherit;
  cursor: pointer;
}

.icon-button {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  padding: 0;
  border-radius: 6px;
  color: #657184;
  background: transparent;
}

.icon-button:hover {
  color: var(--login-primary);
  background: rgb(36 99 235 / 7%);
}

.login-form-wrap {
  width: min(100%, 500px);
  margin: auto;
  padding: 36px 0 56px;
  transform: translateY(-4vh);
}

.form-heading {
  margin-bottom: 30px;
}

.form-heading h2 {
  margin: 0 0 8px;
  font-size: 38px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
}

.form-heading p {
  margin: 0;
  color: var(--login-muted);
  font-size: 15px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.login-form :deep(.el-input__wrapper) {
  min-height: 54px;
  padding: 1px 16px;
  border-radius: 6px;
  background: transparent;
  box-shadow: 0 0 0 1px var(--login-border) inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--login-primary) inset;
}

.login-form :deep(.el-input__inner) {
  color: var(--login-text);
}

.login-form :deep(.el-input__prefix) {
  margin-right: 8px;
  color: #a3adbb;
}

.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 138px;
  gap: 14px;
}

.captcha {
  display: flex;
  height: 54px;
  align-items: center;
  justify-content: space-evenly;
  padding: 0 12px;
  border: 1px solid var(--login-border);
  border-radius: 6px;
  color: #24c8a4;
  background: transparent;
  font-family: Georgia, serif;
  font-size: 22px;
}

.captcha span:first-child {
  color: #98b83e;
}

.captcha i {
  color: #f05daf;
  font-style: normal;
}

.captcha b {
  color: #ff6c7b;
  font-weight: 500;
}

.captcha:hover {
  border-color: var(--login-primary);
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2px 0 28px;
}

.text-button {
  padding: 6px 0;
  color: #6688f7;
  background: transparent;
}

.text-button:hover {
  color: var(--login-primary);
}

.login-submit {
  width: 100%;
  height: 54px;
  border-radius: 6px;
  border-color: var(--login-primary);
  background: var(--login-primary);
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 14px 28px rgb(36 99 235 / 18%);
}

.other-divider {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 46px 0 30px;
  color: #98a4b7;
  font-size: 13px;
}

.other-divider::before {
  position: absolute;
  right: 0;
  left: 0;
  height: 1px;
  background: #e7ebf2;
  content: '';
}

.other-divider span {
  z-index: 1;
  padding: 0 14px;
  background: var(--login-surface);
}

.other-logins {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.other-logins .el-button {
  width: 100%;
  height: 52px;
  margin: 0;
  border-color: var(--login-border);
  border-radius: 6px;
  color: #66748b;
  background: transparent;
}

.other-logins .el-icon {
  margin-right: 7px;
}

.form-pane footer {
  color: #9ba7bb;
  font-size: 12px;
  text-align: center;
}

.mobile-brand {
  display: none;
}

.login-page.is-dark {
  --login-text: #f0f3f8;
  --login-muted: #8d99aa;
  --login-border: #333e4d;
  --login-surface: #141920;
}

.is-dark .brand-pane {
  background:
    linear-gradient(90deg, rgb(20 25 32 / 0%) 91%, rgb(91 111 176 / 8%)),
    linear-gradient(145deg, #181e28 6%, #121a24 52%, #102430 100%);
}

.is-dark .brand-pane::after {
  background: rgb(95 83 210 / 10%);
}

.is-dark .version,
.is-dark .brand-badge {
  border-color: #34496d;
  color: #91adff;
  background: rgb(34 50 75 / 75%);
}

.is-dark .brand-content > p {
  color: #9baabd;
}

.is-dark .feature-list li {
  color: #c7d0dc;
}

.is-dark .feature-list li + li::before {
  background: #3a4655;
}

.is-dark .feature-list .el-icon {
  color: #8babff;
  background: #233653;
}

.is-dark .form-pane {
  color-scheme: dark;
}

.is-dark .icon-button,
.is-dark .other-logins .el-button {
  color: #aeb8c6;
}

.is-dark .login-form :deep(.el-checkbox__label),
.is-dark .login-form :deep(.el-input__inner) {
  color: var(--login-text);
}

.is-dark .other-divider::before {
  background: var(--login-border);
}

@media (max-width: 1100px) {
  .login-page {
    grid-template-columns: minmax(0, 1.25fr) minmax(440px, 1fr);
  }

  .brand-pane {
    padding: 32px;
  }

  .brand-content h1 {
    font-size: 42px;
  }
}

@media (max-width: 840px) {
  .login-page {
    display: block;
    min-height: 100vh;
  }

  .brand-pane {
    display: none;
  }

  .form-pane {
    min-height: 100vh;
    padding: 24px clamp(22px, 7vw, 56px) 20px;
  }

  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: -38px;
    font-size: 17px;
  }

  .mobile-brand__mark {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 6px;
    color: #fff;
    background: var(--login-primary);
    font-weight: 700;
  }

  .login-form-wrap {
    padding: 42px 0;
    transform: none;
  }
}

@media (max-width: 480px) {
  .form-heading h2 {
    font-size: 30px;
  }

  .captcha-row {
    grid-template-columns: minmax(0, 1fr) 112px;
    gap: 10px;
  }

  .other-logins {
    grid-template-columns: 1fr;
  }

  .other-divider {
    margin: 36px 0 24px;
  }
}
</style>
