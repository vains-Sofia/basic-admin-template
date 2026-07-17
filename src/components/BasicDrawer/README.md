# BasicDrawer

`BasicDrawer` 采用“全局宿主 + 函数式实例”模式。宿主已经在 `App.vue` 中挂载一次，业务页面只需调用 `useBasicDrawer()` 初始化和控制抽屉。

## 基础用法

```vue
<script setup lang="ts">
import UserEditor from './UserEditor.vue'
import { useBasicDrawer } from '@/components/BasicDrawer'

interface UserPayload {
  id: number
  name: string
}

const drawer = useBasicDrawer<UserPayload>({
  title: '编辑用户',
  size: '520px',
  showFooter: true,
  destroyOnClose: true,
  content: UserEditor,
  async onConfirm(payload) {
    if (!payload) return
    await updateUser(payload)
  },
})

function editUser(user: UserPayload): void {
  drawer.open(user)
}
</script>
```

每次调用 `useBasicDrawer(options)` 都会创建一个独立实例。除非需要在不同模块获取同一个实例，否则不必手动设置 `drawerKey`。

确认回调返回 Promise 时，默认确认按钮会自动进入加载状态；Promise 成功后自动关闭，失败时保留抽屉。设置 `closeOnConfirm: false` 可以关闭自动关闭行为。

## 内容组件

通过 `content` 设置抽屉正文组件。宿主会向内容组件注入以下属性：

```ts
defineProps<{
  payload?: UserPayload
  drawer: BasicDrawerController<UserPayload>
}>()
```

还可以使用 `contentProps` 传入固定属性：

```ts
const drawer = useBasicDrawer({
  content: UserEditor,
  contentProps: { mode: 'advanced' },
})
```

简单内容可以直接传入字符串，字符串会按普通文本渲染：

```ts
const drawer = useBasicDrawer({
  content: '这是一段抽屉内容',
})
```

## 可用配置

`useBasicDrawer()` 接受 Element Plus `DrawerProps`，包括：

- `title`
- `size`
- `direction`
- `destroyOnClose`
- `beforeClose`
- `appendToBody`
- `closeOnClickModal`
- `closeOnPressEscape`
- `showClose`
- 其他 Element Plus Drawer 原始属性

额外配置：

| 配置                               | 默认值   | 说明                        |
| ---------------------------------- | -------- | --------------------------- |
| `drawerKey`                        | 自动生成 | 实例唯一标识                |
| `content`                          | -        | 正文组件或普通字符串        |
| `contentProps`                     | -        | 传给正文组件的固定属性      |
| `bodyPadding`                      | `0`      | Body 内边距，数字按 px 处理 |
| `showFooter`                       | `false`  | 显示默认取消、确定页脚      |
| `cancelText`                       | `取消`   | 取消按钮文字                |
| `confirmText`                      | `确定`   | 确定按钮文字                |
| `closeOnConfirm`                   | `true`   | 确认成功后自动关闭          |
| `clearPayloadOnClose`              | `true`   | 关闭动画完成后清理载荷      |
| `onConfirm`                        | -        | 确认处理函数，支持 Promise  |
| `onCancel`                         | -        | 取消处理函数，支持 Promise  |
| `onOpen/onOpened/onClose/onClosed` | -        | Drawer 生命周期回调         |

未设置 `title` 时不会渲染头部区域。设置标题后会显示头部，但关闭图标仍默认隐藏；需要关闭图标时显式设置 `showClose: true`。

默认头部和底部高度至少为 `56px`，内部元素垂直居中。头部带下分割线，底部带上分割线；传入的 `headerClass`、`bodyClass`、`footerClass` 会和组件基础 class 合并，不会被覆盖。

控制器提供 `open`、`close`、`toggle`、`setLoading`、`setPayload`、`setOptions`、`clearPayload` 和 `destroy`。其中 `setOptions()` 可在运行时增量修改标题、尺寸等配置。

全局宿主依赖通用 Overlay Store，并使用 `drawer:` 命名空间；后续 `BasicDialog` 可以复用同一 Store 的 `dialog:` 命名空间，不会与 Drawer 实例冲突。
