<script setup lang="ts">
import { h } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { NMenu, type MenuOption, NDialogProvider, NMessageProvider, NModalProvider } from 'naive-ui'
const menuOptions: MenuOption[] = [
  {
    label: () => h(RouterLink, { to: { name: 'ecdh' } }, { default: () => 'ECDH' }), key: 'ecdh'
  },
  {
    label: () => h(RouterLink, { to: { name: 'hash' } }, { default: () => 'Hash' }), key: 'hash'
  },
  {
    label: () => h(RouterLink, { to: { name: 'base64' } }, { default: () => 'Base64' }), key: 'base64'
  },
]

</script>

<template>
  <nav>
    <NMenu class="menu" :options="menuOptions" mode="horizontal" responsive />
    <div class="right">
      <a href="https://xujinkai.net/">Author</a>
    </div>
  </nav>

  <div class="content">
    <NDialogProvider>
      <NMessageProvider>
        <RouterView />
      </NMessageProvider>
    </NDialogProvider>
  </div>

  <footer>
    <p>© 2024 Github Source: <a href="https://github.com/XUJINKAI/crypto-online">XUJINKAI/crypto-online</a></p>
  </footer>
</template>

<style scoped>
nav {
  min-width: 120px;
  border-bottom: 1px solid #e9e9e9;
  margin-top: 1rem;
  margin-bottom: 1rem;
  display: flex;
}

.right {
  float: right;
}

.content {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

footer {
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-top: 1px solid #e9e9e9;
  color: #666;
  font-size: 0.8rem;
}
</style>
