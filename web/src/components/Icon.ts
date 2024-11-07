import { defineComponent, h, ref, watch } from 'vue';
import { NIcon } from 'naive-ui';

export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const html = ref<string | null>(null);

    function refreshHtml() {
      // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
      import(`../assets/icon/${props.icon}.svg?raw`)
        .then((module) => {
          html.value = module.default;
        });
    }
    watch(() => props.icon, refreshHtml, { immediate: true });

    return () => h(NIcon, { innerHTML: html.value })
  }
})