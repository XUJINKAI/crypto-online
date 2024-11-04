<script setup lang='ts'>
import MarkdownText from '@/components/MarkdownText.vue';

const help_CN = `
# 纯静态的密码学应用

本工具特点：

- 除了常见的工具类，还针对实际使用场景做了复合的应用
- 针对小屏优化体验
- 支持通过URL参数传入数据
- [WIP] 暴露出一个封装好的js接口，在控制台(F12)可直接编写复杂的数据处理逻辑

功能列表：

- ECDH: 通过公钥链接与对方协商密钥，并可加解密文本或文件
- SM4: 除了key/iv的方式，也可通过psk加解密文本或文件
- HASH
- BASE64
- 二维码生成

作者: https://xujinkai.net
`;
const help_EN = `
# A pure static crypto app

Features of this tool:

- In addition to common tools, it also makes composite applications for practical use cases
- Optimized for small screens
- Support passing data through URL parameters
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