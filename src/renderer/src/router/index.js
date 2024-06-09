import { createRouter, createWebHashHistory } from "vue-router";
import ApiList from "../components/ApiList.vue";
import ApiMain from "../components/ApiMain.vue";
import UseHistory from "../components/UseHistory.vue";

const routes = [
  {
    path: "/",
    name: "ApiMain",
    component: ApiMain,
  },
  {
    path: "/list",
    name: "ApiList",
    component: ApiList,
  },
  {
    path: "/history",
    name: "UseHistory",
    component: UseHistory,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
