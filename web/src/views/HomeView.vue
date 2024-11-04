<script setup lang='ts'>
import MarkdownText from '@/components/MarkdownText.vue';

const help_CN = `
# 纯静态的密码学应用

本工具特点：

- 除了常见的工具类，还针对实际使用场景做了复合的应用
- 自制多个控件，优化使用体验
- 支持通过URL参数传入数据，方便使用和分享
- [WIP] 暴露出一个封装好的js接口，在控制台(F12)可直接编写复杂的数据处理逻辑

作者: https://xujinkai.net
`;
const help_EN = `
# A pure static crypto app

Features of this tool:

- In addition to common tools, it also makes composite applications for practical use cases
- Self-made multiple controls to optimize the user experience
- Support passing data through URL parameters, convenient to use and share
- [WIP] Expose a well-encapsulated js interface, you can directly write complex data processing logic in the console(F12)

Author: https://xujinkai.net
`;
</script>

<template>
    <div>
        <div class="flex-responsive-row" style="gap: 1rem;">
            <MarkdownText :markdown="help_CN"></MarkdownText>
            <MarkdownText :markdown="help_EN"></MarkdownText>
        </div>
    </div>
</template>

<style scoped>
.flex-responsive-row * {
    flex: 1;
}
</style>