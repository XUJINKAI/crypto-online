<script setup lang="ts">
import { h } from 'vue'
import { routes } from './router';
import { RouterLink, RouterView, type RouteRecordRaw } from 'vue-router'
import { NMenu, type MenuOption, NDialogProvider, NMessageProvider, NModalProvider } from 'naive-ui'

const basePath = import.meta.env.BASE_URL

function routesToMenuOptions(routes: RouteRecordRaw[]): MenuOption[] {
  return routes
    .filter((route) => route.meta?.title)
    .map((route) => ({
      label: () => h(RouterLink, { to: { name: route.name } }, { default: () => route.meta?.title }),
      key: route.name,
    } as MenuOption))
}

const menuOptions: MenuOption[] = routesToMenuOptions(routes)
</script>

<template>
  <nav>
    <NMenu class="menu" :options="menuOptions" mode="horizontal" responsive />
  </nav>

  <div class="content">
    <NDialogProvider>
      <NMessageProvider>
        <RouterView />
      </NMessageProvider>
    </NDialogProvider>
  </div>

  <footer>
    <p>© 2024 <a href="https://github.com/XUJINKAI/crypto-online">Github Source</a> 仅供交流学习使用</p>
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
  flex: 1;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

footer {
  text-align: center;
  margin-top: 1rem;
  padding: .8rem;
  background-color: #f9f9f9;
  border-top: 1px solid #e9e9e9;
  color: #666;
  font-size: 0.8rem;
}
</style>
