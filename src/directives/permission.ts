import type { Directive } from 'vue'

import { useUserStore } from '@/stores/user'
import { hasPermission } from '@/utils/permission'

export const permissionDirective: Directive<HTMLElement, string | string[]> = {
  mounted(element, binding) {
    if (!hasPermission(binding.value, useUserStore().permissions)) element.remove()
  },
}
