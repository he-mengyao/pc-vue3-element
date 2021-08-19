<template>
  <div class="head flex flex-c ai-c">
    <img
      src="../../assets/404.png"
      alt=""
      class=""
      style="width: 60vw; height: 100vh"
      @click="go"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    let router = useRouter();
    let go = () => {
      router.push("login");
    };
    return {
      go,
    };
  },
});
</script>

<style scoped lang='scss'>
</style>