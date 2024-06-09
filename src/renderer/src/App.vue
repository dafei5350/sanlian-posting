<script setup>
const ipcHandle = () => window.electron.ipcRenderer.send('ping')
import MessageProvider from './components/MessageProvider.vue'
import { NConfigProvider, NMessageProvider, zhCN, dateZhCN } from 'naive-ui' 

</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <MessageProvider />
    </n-message-provider>
    <router-view />
  </n-config-provider>
</template>
<style>
.main-api {
  width: 100%;
  height: 500px;
  display: flex;
}
</style>