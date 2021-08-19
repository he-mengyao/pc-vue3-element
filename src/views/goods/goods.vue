<template>
  <div class="h-100">
    <el-card>
      <!-- 搜索 -->
      <el-row>
        <el-col :span="8" class="mrr-10"
          ><el-input v-model="input" placeholder="请输入搜索内容" clearable>
            <template #append>
              <el-button
                icon="el-icon-search"
                @click="search(input)"
              ></el-button> </template></el-input
        ></el-col>
        <el-col :span="8"
          ><el-button type="primary" @click="addGoods"
            >添加商品</el-button
          ></el-col
        >
      </el-row>
      <div class="mrt-20">
        <el-table :data="list" stripe style="width: 100%">
          <el-table-column type="index" label="#" width="100" align="center">
          </el-table-column>
          <el-table-column
            prop="goods_name"
            label="商品名称"
            width="380"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="goods_price"
            label="商品价格(元)"
            width="150"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="goods_weight"
            label="商品重量"
            align="center"
            width="80"
          >
          </el-table-column>
          <el-table-column prop="add_time" label="创建时间" align="center">
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="edit(scope.row)"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="handleDelete(scope.row)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagenum"
          :page-sizes="[10, 30, 50, 100]"
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
    title="编辑商品"
    v-model="dialogVisible"
    width="40%"
    :show-close="true"
  >
    <div>
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm1"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="ruleForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input
            v-model="ruleForm.goods_price"
            type="number"
            min="1"
          ></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number" min="1">
          <el-input v-model="ruleForm.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight" min="1">
          <el-input v-model="ruleForm.goods_weight" type="number"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="comfirm">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import api from "@/http/api";
import { defineComponent, ref, onMounted } from "vue";
import dayjs from "dayjs";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";

interface obj {
  add_time: string;
  cat_id: null;
  cat_one_id: null;
  cat_three_id: null;
  cat_two_id: null;
  goods_id: number;
  goods_name: string;
  goods_number: number;
  goods_price: number;
  goods_state: number;
  goods_weight: number;
  hot_mumber: number;
  is_promote: boolean;
  upd_time: number;
}

interface obj1 {
  name: string;
  path: string;
}

interface obj2 {
  goods_name: string;
  goods_price: string;
  goods_number: string;
  goods_weight: string;
}

export default defineComponent({
  setup() {
    let input = ref("");
    let query = ref("");
    let pagenum = ref(1);
    let pagesize = ref(10);
    let total = ref(0);
    let router = useRouter();
    let store = useStore();
    let dialogVisible = ref(false);
    // 弹框
    let ruleForm = ref<obj2>({
      goods_name: "",
      goods_price: "",
      goods_number: "",
      goods_weight: "",
    });
    let rules = {
      goods_name: [
        { required: true, message: "商品名称不能为空", trigger: "blur" },
        { min: 2, max: 15, message: "长度在 2 到 15 个字符", trigger: "blur" },
      ],
      goods_price: [
        { required: true, message: "商品价格不能为空", trigger: "blur" },
        { min: 2, max: 15, message: "长度在 2 到 15 个字符", trigger: "blur" },
      ],
      goods_number: [
        { required: true, message: "商品数量不能为空", trigger: "blur" },
        { min: 2, max: 15, message: "长度在 2 到 15 个字符", trigger: "blur" },
      ],
      goods_weight: [
        { required: true, message: "商品重量不能为空", trigger: "blur" },
        { min: 2, max: 15, message: "长度在 2 到 15 个字符", trigger: "blur" },
      ],
    };
    // 导航列表
    let n = ref<obj1[]>([
      {
        name: "",
        path: "",
      },
    ]);
    // 删除元素
    let item = ref({
      add_time: "string",
      cat_id: null,
      cat_one_id: null,
      cat_three_id: null,
      cat_two_id: null,
      goods_id: 0,
      goods_name: "",
      goods_number: 0,
      goods_price: 0,
      goods_state: 0,
      goods_weight: 0,
      hot_mumber: 0,
      is_promote: false,
      upd_time: 0,
    });
    let list = ref<obj[]>([
      {
        add_time: "",
        cat_id: null,
        cat_one_id: null,
        cat_three_id: null,
        cat_two_id: null,
        goods_id: 0,
        goods_name: "",
        goods_number: 0,
        goods_price: 0,
        goods_state: 0,
        goods_weight: 0,
        hot_mumber: 0,
        is_promote: false,
        upd_time: 0,
      },
    ]);
    // 获取商品列表
    let getGoods = () => {
      api
        .getGoods({
          query: query.value,
          pagenum: pagenum.value,
          pagesize: pagesize.value,
        })
        .then((res: any) => {
          // console.log(res.data.goods);
          if (res.meta.status === 200) {
            list.value = res.data.goods;
            total.value = res.data.total;
            list.value.map((i) => {
              i.add_time = dayjs(i.add_time).format("YYYY-MM-DD HH:mm:ss");
              i.goods_weight = i.goods_weight / 100;
            });
          }
        })
        .catch(() => {
          console.log("商品列表请求失败");
        });
    };
    // 搜索
    let search = (value: string) => {
      query.value = value;
      getGoods();
    };
    // 实现导航栏变化
    let navChange = () => {
      let obj1 = {
        name: "添加商品",
        path: "addGoods",
      };
      n.value = JSON.parse(store.state.list);
      n.value = n.value.filter((i) => {
        return i.path !== obj1.path;
      });
      n.value.push(obj1);
      localStorage.setItem("navlist", JSON.stringify(n.value));
      store.commit("setList", JSON.stringify(n.value));
      // console.log(n.value);
      // 路径
      localStorage.setItem("path", "addGoods");
      store.commit("setPath", "addGoods");
    };
    // 添加
    let addGoods = () => {
      router.push("addGoods");
      navChange();
    };
    // 删除的请求
    let getDel = () => {
      api
        .delGoods({ id: item.value.goods_id })
        .then((res: any) => {
          if (res.meta.status === 200) {
            ElMessage.success("删除成功");
            getGoods();
          }
        })
        .catch(() => {
          console.log("删除商品请求失败");
        });
    };
    // 删除
    let handleDelete = (row: obj) => {
      item.value = row;
      ElMessageBox.confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          getDel();
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
      getGoods();
    };
    const handleCurrentChange = (val: number) => {
      // console.log(`当前页: ${val}`);
      pagenum.value = val;
      getGoods();
    };
    // 点击编辑
    let edit = (row: obj) => {
      dialogVisible.value = true;
      ruleForm.value = {
        goods_name: row.goods_name,
        goods_price: String(row.goods_price),
        goods_number: String(row.goods_number),
        goods_weight: String(row.goods_weight),
      };
    };
    // 点击确定
    let comfirm = () => {
      ElMessage.error("商品没有设置所属分类");
      dialogVisible.value = false;
    };
    onMounted(() => {
      getGoods();
    });
    return {
      input,
      search,
      addGoods,
      pagenum,
      pagesize,
      total,
      list,
      handleDelete,
      handleSizeChange,
      handleCurrentChange,
      ruleForm,
      dialogVisible,
      rules,
      edit,
      comfirm,
    };
  },
});
</script>

<style scoped>
</style>