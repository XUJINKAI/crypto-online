<script setup lang='ts'>
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps<{
    markdown: string;
}>();

const renderer = new marked.Renderer();

const document = computed<string>(() => {
    return marked.parse(props.markdown, { renderer }) as any;
});
</script>

<template>
    <div class="markd" v-html="document"></div>
</template>

<style scoped>
.markd {
    font-family: consolas, monospace;
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

p {
    margin-bottom: 1rem;
}

code {
    border-radius: 4px;
    padding: 3px 6px;
    background-color: rgba(142, 150, 170, .14);
}

strong {
    font-weight: 700;
}
</style>