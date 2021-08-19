<template>
  <div class="flex flex-b ai-c f16 blue head">
    <div class="left">欢迎来到小爱后台管理系统</div>
    <div class="right flex ai-c">
      <div class="mrr-10">{{ time }}</div>
      <div class="mrr-10">亲爱的：{{ name }}</div>
      <div class="blue1" @click="quit">退出</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

export default defineComponent({
  setup() {
    let time = ref<any>(null);
    setInterval(() => {
      time.value =
        new Date().toLocaleString() + " ".charAt(new Date().getDay());
    }, 1000);
    let name = ref<string>("");
    let router = useRouter();
    let quit = () => {
      ElMessage.success("欢迎下次光临");
      router.push("/login");
      localStorage.removeItem("xiaoai-user");
    };
    onMounted(() => {
      name.value = JSON.parse(localStorage.getItem("xiaoai-user")!).username;
    });
    return {
      time,
      name,
      quit,
    };
  },
});
</script>

<style scoped>
.head {
  height: 60px;
  padding: 0 60px;
}
</style>