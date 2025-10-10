import CommonDrawer from './src/index.vue'
import { type DrawerOptions, usePluginStore } from '@/stores/Plugins.ts'

const drawer = usePluginStore()

const openDrawer = (options: DrawerOptions) => drawer.openDrawer(options)
const closeDrawer = (id: string | undefined) => drawer.closeDrawer(id)
export { CommonDrawer, openDrawer, closeDrawer }

export default CommonDrawer
