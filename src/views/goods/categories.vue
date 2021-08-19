<template>
  <div>
    <el-card class="box-card">
      <el-button type="primary" @click="addCateg(1)">添加分类</el-button>
      <div class="mrt-20 table">
        <el-table
          :data="tableData"
          style="width: 100%"
          row-key="cat_id"
          border
          indent="20"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column type="index" label="#" width="100" align="center">
          </el-table-column>
          <el-table-column prop="cat_name" label="分类名称" align="center">
          </el-table-column>
          <el-table-column prop="cat_deleted" label="是否有效" align="center">
            <template #default="scope">
              <el-icon
                class="el-icon-success"
                color="#409EFC"
                v-if="scope.row.cat_deleted"
              ></el-icon>
              <el-icon
                class="el-icon-success"
                v-if="!scope.row.cat_deleted"
              ></el-icon>
            </template>
          </el-table-column>
          <el-table-column label="排序" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.cat_level === 0" disable-transitions>
                一级
              </el-tag>
              <el-tag
                v-else-if="scope.row.cat_level === 1"
                type="success"
                disable-transitions
                >二级</el-tag
              >
              <el-tag v-else disable-transitions type="warning">三级 </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="edit(2, scope.row)"
                >编辑</el-button
              >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagenum"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>
  </div>
  <!-- 弹框 -->
  <el-dialog
    :title="num === 1 ? '添加分类' : '编辑分类'"
    v-model="dialogVisible1"
    width="35%"
    :show-close="false"
  >
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm1"
      label-width="100px"
      class="demo-ruleForm"
    >
      <el-form-item label="分类名称" prop="cat_name">
        <el-input v-model="ruleForm.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="父级分类" prop="parent_name" v-if="num === 1">
        <el-cascader
          v-model="value"
          :options="options"
          :disabled="ruleForm.cat_name == ''"
          :props="props"
        ></el-cascader>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible1 = false">取 消</el-button>
        <el-button type="primary" @click="comfirm1">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import api from "@/http/api";
import { defineComponent, ref, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

interface obj {
  cat_deleted: boolean;
  cat_id: number;
  cat_level: number;
  cat_name: string;
  cat_pid: number;
}
interface obj1 {
  cat_deleted: boolean;
  cat_id: number;
  cat_level: number;
  cat_name: string;
  cat_pid: number;
  children: obj[];
}
interface obj2 {
  cat_name: string;
  parent_name: string;
  value: "";
}

export default defineComponent({
  setup() {
    let type = ref(0);
    let pagenum = ref(1);
    let pagesize = ref(5);
    let total = ref(0);
    let dialogVisible1 = ref(false);
    let num = ref(0);
    let options = ref([{}]);
    let value = ref([]);
    let props = ref({
      label: "cat_name",
      children: "children",
      checkStrictly: true,
      value: "cat_pid",
    });
    let tableData = ref<obj1[]>([
      {
        cat_deleted: false,
        cat_id: 0,
        cat_level: 0,
        cat_name: "",
        cat_pid: 0,
        children: [],
      },
    ]);
    let item = ref<obj>({
      cat_deleted: false,
      cat_id: 0,
      cat_level: 0,
      cat_name: "",
      cat_pid: 0,
    });
    let ruleForm = ref<obj2>({
      cat_name: "",
      parent_name: "",
      value: "",
    });
    let rules = {
      cat_name: [
        { required: true, message: "分类名称不能为空", trigger: "blur" },
        { min: 2, max: 10, message: "分类名称在2-10个字符", trigger: "blur" },
      ],
    };
    // 获取列表
    let getData = () => {
      api
        .getCategories({
          type: type.value,
          pagenum: pagenum.value,
          pagesize: pagesize.value,
        })
        .then((res: any) => {
          if (res.meta.status === 200) {
            tableData.value = res.data.result;
            total.value = res.data.total;
            // console.log(res);
          }
        })
        .catch(() => {
          console.log("获取商品分类请求失败");
        });
    };
    // 获取分类数据
    let getCategory = () => {
      api
        .getCategories({ type: 0, pagenum: 0, pagesize: 0 })
        .then((res: any) => {
          options.value = res.data;
          options.value.map((i: any) => {
            if (i.children) {
              i.children.map((j: any) => {
                j.children = undefined;
              });
            }
          });
        })
        .catch(() => {
          console.log("获取分类数据失败");
        });
    };
    // 删除的请求
    let getDel = (row: obj1) => {
      api
        .delCategory({ id: row.cat_id })
        .then((res: any) => {
          // console.log(res);
          if (res.meta.status === 200) {
            ElMessage.success(res.meta.msg);
            getData();
          }
        })
        .catch(() => {
          console.log("删除分类请求失败");
        });
    };
    // 删除
    let handleDelete = (row: obj1) => {
      ElMessageBox.confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          getDel(row); // 删除的请求
        })
        .catch(() => {
          ElMessage({
            type: "info",
            message: "已取消删除",
          });
        });
    };
    // 分页
    const handleSizeChange = (val: number) => {
      // console.log(`每页 ${val} 条`);
      pagesize.value = val;
      getData();
    };
    const handleCurrentChange = (val: number) => {
      // console.log(`当前页: ${val}`);
      pagenum.value = val;
      getData();
    };
    // 添加分类发请求
    let addCategory = () => {
      // 发请求
      console.log(value.value);
      api
        .addCategories({
          cat_pid: value.value[value.value.length - 1],
          cat_name: ruleForm.value.cat_name,
          cat_level: value.value.length,
        })
        .then((res: any) => {
          if (res.meta.status === 201) {
            ElMessage.success(res.meta.msg);
            getData();
          } else {
            ElMessage.error(res.meta.msg);
          }
        })
        .catch(() => {
          console.log("添加分类请求失败");
        });
    };
    // 编辑分类请求
    let editCategories = () => {
      api
        .editCategories({
          id: item.value.cat_id,
          cat_name: ruleForm.value.cat_name,
        })
        .then((res: any) => {
          // console.log(res);
          if (res.meta.status === 200) {
            ElMessage.success(res.meta.msg);
            getData();
          } else {
            ElMessage.error(res.meta.msg);
          }
        })
        .catch(() => {
          console.log("编辑分类请求失败");
        });
    };
    // 点击添加分类
    let addCateg = (n: number) => {
      dialogVisible1.value = true;
      num.value = n;
      ruleForm.value.cat_name = "";
      ruleForm.value.value = "";
      getCategory();
    };
    // 弹框确认
    let ruleForm1 = ref<any>(null);
    let comfirm1 = () => {
      ruleForm1.value.validate((valid: boolean) => {
        if (valid) {
          if (num.value === 1) {
            addCategory();
            dialogVisible1.value = false;
          } else if (num.value === 2) {
            editCategories();
            dialogVisible1.value = false;
          }
        }
      });
    };
    // 点击编辑
    let edit = (n: number, i: obj) => {
      dialogVisible1.value = true;
      num.value = n;
      ruleForm.value.cat_name = i.cat_name;
      item.value = i;
    };
    onMounted(() => {
      getData();
      getCategory();
    });
    return {
      tableData,
      handleDelete,
      pagenum,
      pagesize,
      total,
      handleSizeChange,
      handleCurrentChange,
      dialogVisible1,
      item,
      comfirm1,
      addCateg,
      ruleForm,
      rules,
      edit,
      num,
      ruleForm1,
      options,
      props,
      value,
    };
  },
});
</script>

<style scoped>
</style>