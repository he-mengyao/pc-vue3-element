<template>
  <el-container>
    <el-header>
      <headers></headers>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <asides></asides>
      </el-aside>
      <el-main style="border-top: 1px solid #eee">
        <top ref="top" class="top"></top>
        <el-scrollbar height="600px">
          <router-view></router-view>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import headers from "@/components/headers/headers.vue";
import asides from "@/components/asides/asides.vue";
import top from "@/components/top/top.vue";
import { defineComponent, ref } from "vue";

export default defineComponent({
  components: { headers, asides, top },
  setup() {
    let top = ref<any>(null);
    return {
      top,
    };
  },
});
</script>

<style scoped>
.top {
  margin-bottom: 20px;
}
</style>