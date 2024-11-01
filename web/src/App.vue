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
    <NMenu :options="menuOptions" mode="horizontal" responsive/>
  </nav>

  <RouterView />
</template>

<style scoped>
nav {
  min-width: 120px;
  border-bottom: 1px solid #e9e9e9;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
