<template>
  <el-card class="card">
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
        ><el-button type="primary" @click="add(1)">添加用户</el-button></el-col
      >
    </el-row>
    <!-- 表格 -->
    <div class="table">
      <el-table :data="list" stripe style="width: 100%" border>
        <el-table-column type="index" width="100" label="#" align="center">
        </el-table-column>
        <el-table-column
          prop="username"
          label="姓名"
          width="180"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="role_name"
          label="角色"
          width="180"
          align="center"
        >
        </el-table-column>
        <el-table-column prop="mobile" label="电话" align="center" width="180">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" align="center" width="180">
        </el-table-column>
        <el-table-column prop="mg_state" label="状态" align="center" width="80">
          <template #default="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="change(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="操作" align="center">
          <template #default="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="编辑角色"
              placement="top-start"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                @click="edit(scope.row, 2)"
                size="mini"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除角色"
              placement="top-start"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                @click="del(scope.row)"
                size="mini"
              ></el-button
            ></el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top-start"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="assign(scope.row)"
              ></el-button
            ></el-tooltip>
          </template>
        </el-table-column>
        <el-row v-if="list.length === 0">暂无数据</el-row>
      </el-table>
      <!-- 分页 -->
      <div class="mrt-20">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagenum"
          :page-sizes="[5, 15, 20, 30]"
          :page-size="pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
  </el-card>
  <!-- 弹框 -->
  <el-dialog
    :title="num === 1 ? '添加用户' : '编辑用户'"
    v-model="dialogVisible"
    width="40%"
    :show-close="false"
  >
    <div>
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm1"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="ruleForm.username"
            :disabled="num === 2"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="num === 1">
          <el-input v-model="ruleForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="ruleForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="ruleForm.mobile"></el-input>
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
  <!-- 分配角色弹框 -->
  <el-dialog
    title="分配角色"
    v-model="dialogVisible1"
    width="40%"
    :show-close="false"
  >
    <div>当前用户: {{ item.username }}</div>
    <div class="mrt-20">当前角色: {{ item.role_name }}</div>
    <el-form class="mrt-20">
      <el-form-item>
        <el-select v-model="role" placeholder="请选择">
          <el-option
            :label="item.roleName"
            :value="item.id"
            v-for="(item, index) in roleList"
            :key="index"
          ></el-option>
        </el-select>
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
import { defineComponent, ref, onMounted, watch } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import api from "@/http/api";
import _Row from "element-plus/lib/el-row";

interface obj {
  username: string;
  password: string;
  email: string;
  mobile: string;
}
interface obj1 {
  create_time: number;
  email: string;
  id: number;
  mg_state: boolean;
  mobile: string;
  role_name: string;
  username: string;
}

export default defineComponent({
  setup() {
    // 判断是添加用户还是编辑
    let num = ref(0);
    let input = ref<string>("");
    // 验证
    let ruleForm = ref<obj>({
      username: "",
      password: "",
      email: "",
      mobile: "",
    });
    // 电话验证
    // let checkTel = (rule: any, value: string, callback: any) => {
    //   if (!/^1(3|4|5|6|7|8|9)d{9}$/.test(value)) {
    //     return callback("请填写正确的电话");
    //   } else {
    //     callback();
    //   }
    // };
    let rules = {
      username: [
        { required: true, message: "用户名不能为空", trigger: "blur" },
        { min: 2, max: 15, message: "长度在 2 到 15 个字符", trigger: "blur" },
      ],
      password: [
        { required: true, message: "密码不能为空", trigger: "blur" },
        { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" },
      ],
      email: [
        { required: true, message: "邮箱不能为空", trigger: "blur" },
        {
          type: "email",
          message: "请输入正确的邮箱地址",
          trigger: ["blur", "change"],
        },
      ],
      mobile: [
        { required: true, message: "电话不能为空", trigger: "blur" },
        // { validator: checkTel, trigger: "blur" },
      ],
    };
    // 单个用户数据
    let item = ref<obj1>({
      create_time: 0,
      email: "",
      id: 0,
      mg_state: false,
      mobile: "",
      role_name: "",
      username: "",
    });
    // 弹框
    const dialogVisible = ref(false);
    const dialogVisible1 = ref(false);
    // 点击添加用户
    let add = (num1: number) => {
      dialogVisible.value = true;
      num.value = num1;
      // 弹框列表清空
      ruleForm.value = {
        username: "",
        password: "",
        email: "",
        mobile: "",
      };
    };
    // 点击编辑
    let edit = (row: obj1, index: number) => {
      dialogVisible.value = true;
      num.value = index;
      ruleForm.value.username = row.username;
      ruleForm.value.email = row.email;
      ruleForm.value.mobile = row.mobile;
      item.value = row;
    };
    // 添加用户请求
    let done = () => {
      api
        .Addusers(ruleForm.value)
        .then((res: any) => {
          // console.log(res);
          if (res.meta.status === 201) {
            ElMessage.success(res.meta.msg);
            getData();
          } else {
            ElMessage.error(res.meta.msg);
          }
        })
        .catch((err: any) => {
          console.log("添加用户失败", err);
        });
    };
    // 编辑用户请求
    let done1 = () => {
      api
        .Subituser({
          id: String(item.value.id),
          email: ruleForm.value.email,
          mobile: ruleForm.value.mobile,
        })
        .then((res: any) => {
          if (res.meta.status === 200) {
            ElMessage.success(res.meta.msg);
            getData();
          } else {
            ElMessage.error(res.meta.msg);
          }
          dialogVisible.value = false;
        })
        .catch(() => {
          console.log("编辑用户请求失败");
        });
    };
    // 获取角色列表
    let roleList = ref<any[]>([]);
    let role = ref("");
    let getRoles = () => {
      api
        .getRoles()
        .then((res: any) => {
          if (res.meta.status === 200) {
            res.data.map((i: any) => {
              roleList.value.push(i);
            });
            roleList.value.shift();
          }
        })
        .catch(() => {
          console.log("获取角色列表失败");
        });
    };
    // 得到用户列表
    let query = ref<string>("");
    let pagenum = ref<number>(1);
    let pagesize = ref(5);
    let list = ref<obj1[]>([
      {
        create_time: 0,
        email: "",
        id: 0,
        mg_state: false,
        mobile: "",
        role_name: "",
        username: "",
      },
    ]);
    let total = ref<number>(0);
    // 得到用户列表
    let getData = () => {
      api
        .Getusers({
          query: query.value,
          pagenum: pagenum.value,
          pagesize: pagesize.value,
        })
        .then((res: any) => {
          if (res.meta.status === 200) {
            list.value = res.data.users;
            total.value = res.data.total;
            // console.log(res.data);
          }
        })
        .catch((err: any) => {
          console.log("请求用户数据失败", err);
        });
    };
    // 确认
    let comfirm = () => {
      if (num.value === 1) {
        if (
          ruleForm.value.username !== "" &&
          ruleForm.value.password !== "" &&
          ruleForm.value.email !== "" &&
          ruleForm.value.mobile !== ""
        ) {
          done();
        } else {
          ElMessage("表单填写错误，请检查");
        }
        dialogVisible.value = false;
      } else if (num.value === 2) {
        if (
          ruleForm.value.username !== "" &&
          ruleForm.value.email !== "" &&
          ruleForm.value.mobile !== ""
        ) {
          done1();
        } else {
          ElMessage("表单填写错误，请检查");
        }
      }
    };
    // 查询用户信息
    let search = (value: string) => {
      if (value === "") {
        getData();
      } else {
        api
          .search({ id: value })
          .then((res: any) => {
            if (res.meta.status === 200) {
              console.log(list.value);
              list.value = [res.data];
            } else {
              list.value = [];
            }
          })
          .catch(() => {
            console.log("查询用户信息请求失败");
          });
      }
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
    // 点击用户状态
    let change = (row: obj1) => {
      api
        .Changeuser({
          uId: String(row.id),
          type: row.mg_state,
        })
        .then((res: any) => {
          // console.log(res);
          if (res.meta.status === 200) {
            ElMessage.success(res.meta.msg);
          } else {
            ElMessage.error(res.meta.msg);
          }
        })
        .catch((err: any) => {
          console.log("修改用户状态请求失败", err);
        });
    };
    // 删除用户的请求
    let getDel = () => {
      api
        .delete({ id: String(item.value.id) })
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
          console.log("删除用户请求失败");
        });
    };
    // 删除用户
    let del = (row: obj1) => {
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
    // 分配角色
    let assign = (row: obj1) => {
      // console.log(row);
      dialogVisible1.value = true;
      item.value = row;
      role.value = "";
    };
    // 分配角色确认
    let comfirm1 = () => {
      dialogVisible1.value = false;
      api
        .distributerole({ id: item.value.id, rid: Number(role.value) })
        .then((res: any) => {
          if (res.meta.status === 200) {
            ElMessage.success(res.meta.msg);
            getData();
          } else {
            ElMessage.error(res.meta.msg);
          }
        })
        .catch(() => {
          console.log("分配角色请求失败");
        });
    };
    // 监听
    watch(
      () => [input.value],
      (val) => {
        search(val[0]);
      }
    );
    onMounted(() => {
      getData();
      getRoles();
    });
    return {
      input,
      dialogVisible,
      ruleForm,
      pagenum,
      rules,
      // checkTel,
      total,
      list,
      edit,
      handleSizeChange,
      handleCurrentChange,
      comfirm,
      change,
      search,
      del,
      assign,
      num,
      add,
      // 分配角色弹框
      dialogVisible1,
      item,
      comfirm1,
      pagesize,
      roleList,
      role,
    };
  },
});
</script>

<style scoped>
.table {
  margin-top: 20px;
}
</style>