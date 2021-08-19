<template>
  <el-config-provider :locale="locale">
    <router-view></router-view>
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import zhCn from "element-plus/lib/locale/lang/zh-cn";

export default defineComponent({
  setup() {
    let locale = zhCn;
    return {
      locale,
    };
  },
});
</script>

<style  lang='scss'>
@import "./styles/base.scss";
@import "./styles/ui";
</style>