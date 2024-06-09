<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router'
import { 
  NPageHeader,
  NGrid,
  NGi,
  NStatistic,
  NAvatar,

 } from "naive-ui";
import { on } from "form-data";
const router = useRouter();
const handleBack = () => {
  router.go(-1);
};

const allImgNum = ref(0);
async function getTotalRows() {
  let doc = await window.api.db.info()
  console.log(doc);
  return doc.doc_count;
}
onMounted(async () => {
  allImgNum.value = await getTotalRows();
});


const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {};

</script>
<template>
  <n-page-header :subtitle="userInfo.deptname" @back="handleBack">
    <n-grid :cols="2">
      <n-gi>
        <n-statistic label="上传图片" :value="allImgNum" />
      </n-gi>
      <n-gi>
        <n-statistic label="发帖次数" value="220" />
      </n-gi>
    </n-grid>
    <template #title>
      <p>{{ userInfo.realname }}</p>
    </template>
    <template #avatar>
      <n-avatar
        :src="userInfo.imageAvater"
      />
    </template>
  </n-page-header>
</template>

