# BasicDialog

`BasicDialog` 采用“全局宿主 + 函数式实例”模式。宿主已在 `App.vue` 中挂载，业务页面只需调用 `useBasicDialog()`。

## 基础用法

```vue
<script setup lang="ts">
import UserEditor from './UserEditor.vue'
import { useBasicDialog } from '@/components/BasicDialog'

interface UserPayload {
  id: number
  name: string
}

const dialog = useBasicDialog<UserPayload>({
  title: '编辑用户',
  width: '520px',
  bodyPadding: 20,
  showFooter: true,
  destroyOnClose: true,
  content: UserEditor,
  async onConfirm(payload) {
    if (!payload) return
    await updateUser(payload)
  },
})

function editUser(user: UserPayload): void {
  dialog.open(user)
}
</script>
```

确认函数返回 Promise 时，确认按钮自动进入加载状态；成功后自动关闭，失败时保留 Dialog。设置 `closeOnConfirm: false` 可关闭自动关闭行为。

## 内容

`content` 支持 Vue 组件或普通字符串。内容组件会收到：

```ts
defineProps<{
  payload?: UserPayload
  dialog: BasicDialogController<UserPayload>
}>()
```

固定属性可通过 `contentProps` 传入：

```ts
const dialog = useBasicDialog({
  content: UserEditor,
  contentProps: { mode: 'advanced' },
})
```

## 配置

支持 Element Plus `DialogProps`，包括 `title`、`width`、`alignCenter`、`draggable`、`fullscreen`、`beforeClose`、`appendToBody`、`closeOnClickModal` 等。

额外配置：

| 配置                               | 默认值   | 说明                        |
| ---------------------------------- | -------- | --------------------------- |
| `dialogKey`                        | 自动生成 | 实例唯一标识                |
| `content`                          | -        | 正文组件或普通字符串        |
| `contentProps`                     | -        | 传给正文组件的固定属性      |
| `bodyPadding`                      | `0`      | Body 内边距，数字按 px 处理 |
| `showFooter`                       | `false`  | 显示默认操作区              |
| `cancelText`                       | `取消`   | 取消按钮文字                |
| `confirmText`                      | `确定`   | 确认按钮文字                |
| `closeOnConfirm`                   | `true`   | 确认成功后自动关闭          |
| `clearPayloadOnClose`              | `true`   | 关闭动画完成后清理载荷      |
| `onConfirm/onCancel`               | -        | 操作回调，支持 Promise      |
| `onOpen/onOpened/onClose/onClosed` | -        | Dialog 生命周期回调         |

未设置 `title` 时头部不占空间。头部、底部最小高度为 `56px`，内容垂直居中，并带对应分割线。用户设置的 `headerClass`、`bodyClass`、`footerClass` 会与基础 class 合并。

控制器提供 `open`、`close`、`toggle`、`setLoading`、`setPayload`、`setOptions`、`clearPayload` 和 `destroy`。
