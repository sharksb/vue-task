import Vue, { VueConstructor, PluginObject } from 'vue';
import Toast from './Toast.vue';

type ShowFunc = (msg: string) => void;

const plugin: PluginObject<{}> = {
  install(VueC: VueConstructor) {
    const CONSTRUCTOR = VueC.extend(Toast);
    let cache: Vue & { show: ShowFunc } | null = null;

    function toast(msg: string, options = {}) {
      const toastComponent = cache || (cache = new CONSTRUCTOR());
      if (!toastComponent.$el) {
        const vm = toastComponent.$mount();
        (document.querySelector('body') as HTMLElement).appendChild(vm.$el);
      }
      toastComponent.show(msg);
    }
    VueC.prototype.$toast = toast;
  },
};

export default plugin;
