<script setup lang="ts">
import { h } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { NMenu, type MenuOption } from 'naive-ui'
const menuOptions: MenuOption[] = [
  {
    label: () => h(RouterLink, { to: { name: 'home' } }, { default: () => 'Home' }), key: 'home'
  },
  {
    label: () => h(RouterLink, { to: { name: 'ecdh' } }, { default: () => 'ECDH' }), key: 'ecdh'
  },
]

</script>

<template>
  <nav>
    <NMenu :options="menuOptions" />
  </nav>

  <RouterView />
</template>

<style scoped>
nav {
  min-width: 120px;
  /* padding-right: 3rem; */
  border-right: 1px solid #e9e9e9;
}
</style>
