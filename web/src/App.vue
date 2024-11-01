<script setup lang="ts">
import { h } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { NMenu, type MenuOption } from 'naive-ui'
const menuOptions: MenuOption[] = [
  {
    label: () => h(RouterLink, { to: { name: 'ecdh' } }, { default: () => 'ECDH' }), key: 'ecdh'
  },
  // {
  //   label: () => h(RouterLink, { to: { name: 'hash' } }, { default: () => 'Hash' }), key: 'hash'
  // },
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
    <RouterView />
  </div>
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
</style>
