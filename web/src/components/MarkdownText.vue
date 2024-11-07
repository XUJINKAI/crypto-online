<script setup lang='ts'>
import { computed, toRefs } from 'vue';
import { marked } from 'marked';

const props = defineProps<{
    markdown: string;
}>();

const { markdown } = toRefs(props);

const renderer = new marked.Renderer();

const document = computed<string>(() => {
    return marked.parse(markdown.value, { renderer }) as any;
});
</script>

<template>
    <div class="markd" v-html="document"></div>
</template>

<style>
.markd {
    font-family: consolas, monospace;
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.markd p {
    margin-bottom: .2rem;
}

.markd code {
    border-radius: 4px;
    padding: 3px 6px;
    background-color: rgba(142, 150, 170, .14);
    display: inline;
    width: 100%;
    overflow-y: auto;
}

.markd pre code {
    border-radius: 4px;
    background-color: rgba(142, 150, 170, .14);
    display: block;
    width: 100%;
    overflow-y: auto;
}

.markd strong {
    font-weight: 700;
}
</style>