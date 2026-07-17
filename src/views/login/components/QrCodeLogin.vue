<script setup lang="ts">
import { Refresh } from '@element-plus/icons-vue'
import QRCode from 'qrcode'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

defineOptions({ name: 'QrCodeLogin' })

const qrImage = ref('')
const expiresIn = ref(120)
const generating = ref(false)
let countdownTimer: number | undefined

const expired = computed(() => expiresIn.value <= 0)
const countdownText = computed(() => {
  const minutes = Math.floor(expiresIn.value / 60)
  const seconds = String(expiresIn.value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
})

function startCountdown(): void {
  window.clearInterval(countdownTimer)
  countdownTimer = window.setInterval(() => {
    if (expiresIn.value > 0) expiresIn.value -= 1
    else window.clearInterval(countdownTimer)
  }, 1000)
}

async function refresh(): Promise<void> {
  generating.value = true
  expiresIn.value = 120

  try {
    const token = crypto.randomUUID()
    const target = new URL(`${import.meta.env.BASE_URL}login`, window.location.origin)
    target.searchParams.set('qr_token', token)
    qrImage.value = await QRCode.toDataURL(target.toString(), {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#172033', light: '#ffffff' },
    })
    startCountdown()
  } finally {
    generating.value = false
  }
}

defineExpose({ refresh })

onMounted(() => void refresh())
onBeforeUnmount(() => window.clearInterval(countdownTimer))
</script>

<template>
  <div class="qr-login">
    <div class="qr-login__code" :class="{ 'is-expired': expired }">
      <img v-if="qrImage" :src="qrImage" alt="扫码登录二维码" />
      <div v-if="generating" class="qr-login__loading">生成中...</div>
      <button v-else-if="expired" type="button" @click="refresh">
        <el-icon><Refresh /></el-icon>
        二维码已失效
      </button>
    </div>
    <strong>使用移动端扫码登录</strong>
    <p>二维码将在 {{ countdownText }} 后失效</p>
  </div>
</template>

<style scoped>
.qr-login {
  display: flex;
  min-height: 250px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 18px;
  text-align: center;
}

.qr-login__code {
  position: relative;
  display: grid;
  width: 184px;
  height: 184px;
  place-items: center;
  margin-bottom: 15px;
  padding: 8px;
  border: 1px solid var(--login-border);
  border-radius: 6px;
  background: #fff;
}

.qr-login__code img {
  display: block;
  width: 100%;
  height: 100%;
}

.qr-login__code.is-expired img {
  opacity: 0.12;
}

.qr-login__code button,
.qr-login__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
  border: 0;
  color: #506078;
  background: rgb(255 255 255 / 88%);
  font: inherit;
  font-size: 13px;
}

.qr-login__code button {
  cursor: pointer;
}

.qr-login__code button:hover {
  color: var(--login-primary);
}

.qr-login strong {
  color: var(--login-text);
  font-size: 14px;
  font-weight: 600;
}

.qr-login p {
  margin: 7px 0 0;
  color: var(--login-muted);
  font-size: 12px;
}
</style>
