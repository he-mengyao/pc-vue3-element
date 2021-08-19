<template>
  <div class="asides">
    <el-col :span="12">
      <el-menu
        class="el-menu-vertical-demo"
        router
        :default-active="route.meta.index"
      >
        <el-menu-item index="/" @click="click('首页', '/')">
          <i class="el-icon-s-home"></i>
          <template #title>首页</template>
        </el-menu-item>
        <el-submenu
          :index="item.path"
          v-for="(item, index) in list1"
          :key="index"
        >
          <template #title>
            <i :class="icon[index].one"></i>
            <span>{{ item.authName }}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item
              :index="item1.path"
              v-for="(item1, index1) in item.children"
              :key="index1"
              @click="click(item1.authName, item1.path)"
            >
              <i :class="icon[index].two[index1]"></i>
              {{ item1.authName }}</el-menu-item
            >
          </el-menu-item-group>
        </el-submenu>
      </el-menu>
    </el-col>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from "vue";
import api from "@/http/api";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

interface Obj {
  id: number;
  authName: string;
  path: string;
  children: Obj[];
}
interface obj1 {
  name: string;
  path: string;
}
export default defineComponent({
  setup() {
    let list1 = ref<Obj[]>([]);
    let route = useRoute();
    let store = useStore();
    let icon = [
      {
        one: "el-icon-user",
        two: ["el-icon-folder-opened"],
      },
      {
        one: "el-icon-folder",
        two: ["el-icon-setting", "el-icon-c-scale-to-original"],
      },
      {
        one: "el-icon-shopping-bag-2",
        two: ["el-icon-help", "el-icon-bell", "el-icon-date"],
      },
      {
        one: "el-icon-s-order",
        two: ["el-icon-folder-add"],
      },
      {
        one: "el-icon-message",
        two: ["el-icon-position"],
      },
    ];
    let list2 = ref<obj1[]>([]);
    let getData = () => {
      api
        .Getmenus()
        .then((res: any) => {
          // console.log(res);
          if (res.meta.status === 200) {
            list1.value = res.data;
          }
          list2.value = JSON.parse(store.state.list);
        })
        .catch((err: any) => {
          console.log("左侧菜单栏请求失败", err);
        });
    };
    let click = (name: string, path: string) => {
      list2.value = JSON.parse(store.state.list);
      let a = list2.value.find((item: obj1) => {
        return item.name === name;
      });
      let object = ref<obj1>({
        name: name,
        path: path,
      });
      // 如果没有重复值
      if (!a) {
        list2.value.push(object.value);
        // 存
        localStorage.setItem("navlist", JSON.stringify(list2.value));
        store.commit("setList", JSON.stringify(list2.value));
      }
      localStorage.setItem("path", path);
      store.commit("setPath", path);
    };
    onMounted(() => {
      getData();
    });
    return {
      list1,
      icon,
      route,
      list2,
      click,
    };
  },
});
</script>

<style scoped>
</style>