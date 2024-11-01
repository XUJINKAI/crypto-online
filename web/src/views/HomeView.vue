<script setup lang="ts">
import MarkdownText from '@/components/MarkdownText.vue';
const HomeMarkdown = `
# Home

一个简单的在线密码学工具。

A simple online cryptography tool.

`;
</script>

<template>
  <main>
    <MarkdownText :markdown="HomeMarkdown" />
  </main>
</template>
