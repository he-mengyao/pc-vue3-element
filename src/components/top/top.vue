<template>
  <div class="top flex ai-c">
    <div
      class="item1 border flex ai-c pr"
      v-for="(item, index) in list3"
      :key="index"
      @click="click(item.path)"
      :class="{ active: item.path === store.state.path }"
      @contextmenu.prevent="contextmenu(item.path)"
      ref="box"
    >
      <div class="circle" v-if="item.path === store.state.path"></div>
      <div class="mr-3">{{ item.name }}</div>
      <div
        class="color-fff"
        v-if="item.path === store.state.path"
        @click.stop="del(item.path, Number(index))"
      >
        {{ !flag1 && item.name === "首页" && list3.length === 1 ? "" : "×" }}
      </div>
      <!-- 右击弹框盒子 -->
      <div
        class="box-card pa bg-fff border-radius flex col color-333"
        v-if="flag && item.path === path2"
      >
        <div class="text item flex-1 flex ai-c" @click.stop="close(item.path)">
          关闭其他
        </div>
        <div
          class="text item flex-1 flex ai-c"
          @click.stop="closeLeft(item, Number(index))"
        >
          关闭左侧
        </div>
        <div
          class="text item flex-1 flex ai-c"
          @click.stop="closeRight(item, Number(index))"
        >
          关闭右侧
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ElMessage } from "element-plus";
import { defineComponent, ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useClickOutside } from "@/hooks";

interface obj1 {
  name: string;
  path: string;
}
export default defineComponent({
  setup() {
    // 右击时关闭框显示
    let flag = ref<boolean>(false);
    let flag1 = ref<boolean>(false);
    let router = useRouter();
    let path = ref<string>("");
    let store = useStore();
    let box = ref<HTMLElement | null>(null);
    const { isClickoutside } = useClickOutside(box);
    // 点击
    let click = (path: string) => {
      flag.value = false;
      router.push(path);
      localStorage.setItem("path", path);
      store.commit("setPath", path);
      getData();
    };
    // 获取导航数据
    let list = ref<obj1[]>([]);
    let getData = () => {
      list.value = JSON.parse(store.state.list);
    };
    // 右击事件
    let path2 = ref<string>("");
    let contextmenu = (path1: string) => {
      path2.value = path1;
      flag.value = true;
    };
    // 关闭左侧
    let closeLeft = (item: obj1, index: number) => {
      list.value = list.value.slice(index);
      if (index === 0) {
        ElMessage.error("已经是第一个啦");
      }
      path.value = item.path;
      console.log(path.value);
      save();
    };
    // 关闭右侧
    let closeRight = (item: obj1, index: number) => {
      if (index === list.value.length - 1) {
        ElMessage.error("已经是最后一个啦");
      }
      list.value = list.value.slice(0, index + 1);
      path.value = item.path;
      save();
    };
    // 关闭其他
    let close = (path1: string) => {
      if (list.value.length === 1) {
        ElMessage.error("没有其他数据了");
      } else {
        list.value = list.value.filter((i) => {
          return i.path === path1;
        });
        save();
      }
    };
    // 删除单个
    let del = (path1: string, index: number) => {
      list.value = list.value.filter((i) => {
        return i.path !== path1;
      });
      if (list.value.length > 0) {
        if (index !== 0) {
          path.value = list.value[index - 1].path;
        } else {
          path.value = list.value[index].path;
        }
        flag1.value = false;
      } else {
        path.value = "/";
        list.value = [
          {
            name: "首页",
            path: "/",
          },
        ];
        flag1.value = true;
      }
      save();
      router.push(path.value);
    };
    // 存数据
    let save = () => {
      localStorage.setItem("path", path.value);
      store.commit("setPath", path.value);
      localStorage.setItem("navlist", JSON.stringify(list.value));
      store.commit("setList", JSON.stringify(list.value));
    };
    onMounted(() => {
      getData();
    });
    let list3 = computed(() => {
      if (store.state.list) {
        return JSON.parse(store.state.list);
      } else {
        return [];
      }
    });
    watch(
      () => isClickoutside.value,
      (val) => {
        flag.value = val;
      }
    );
    watch(
      () => flag.value,
      (val) => {
        isClickoutside.value = val;
      }
    );
    return {
      list,
      click,
      path,
      contextmenu,
      flag,
      path2,
      closeLeft,
      closeRight,
      close,
      save,
      del,
      flag1,
      store,
      box,
      list3,
    };
  },
});
</script>

<style scoped lang='scss'>
.top {
  height: 30px;
  border-bottom: 1px solid #eeeeee;
  .item1 {
    padding: 2px 10px;
    margin-right: 5px;
    margin-bottom: 10px;
  }
  .active {
    background: #409eff;
    color: #fff;
    .circle {
      height: 8px;
      width: 8px;
      border-radius: 100%;
      background-color: #fff;
    }
  }
  .box-card {
    width: 68px;
    height: 103px;
    top: 10px;
    left: 90%;
    z-index: 4;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    padding: 10px;
  }
}
</style>