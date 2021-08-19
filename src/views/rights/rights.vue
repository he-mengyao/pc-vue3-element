<template>
  <div>
    <el-card class="box-card">
      <el-table :data="list" stripe style="width: 100%" border>
        <el-table-column type="index" label="#" width="100" align="center">
        </el-table-column>
        <el-table-column prop="authName" label="权限名称" align="center">
        </el-table-column>
        <el-table-column prop="level" label="权限等级" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.level === '0'" disable-transitions>
              一级
            </el-tag>
            <el-tag
              v-else-if="scope.row.level === '1'"
              type="success"
              disable-transitions
              >二级</el-tag
            >
            <el-tag v-else disable-transitions type="warning">三级 </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import api from "@/http/api";
interface obj {
  authName: string;
  id: number;
  level: string;
  path: string;
  pid: number;
}

export default defineComponent({
  setup() {
    let list = ref<obj[]>([
      {
        authName: "",
        id: 0,
        level: "",
        path: "",
        pid: 0,
      },
    ]);
    let getData = () => {
      api
        .getRights({ type: "list" })
        .then((res: any) => {
          if (res.meta.status === 200) {
            list.value = res.data;
            // console.log(list.value);
          }
        })
        .catch(() => {
          console.log("所有权限列表请求失败");
        });
    };
    onMounted(() => {
      getData();
    });
    return {
      list,
    };
  },
});
</script>

<style scoped>
</style>