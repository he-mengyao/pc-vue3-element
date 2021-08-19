<template>
  <div>
    <el-card class="box-card">
      <el-button type="primary" @click="addRole(1)">添加角色</el-button>
      <div class="mrt-20">
        <el-table :data="tableData" style="width: 100%" border>
          <el-table-column type="expand" align="center">
            <template #default="props">
              <el-form class="demo-table-expand tags">
                <el-form-item v-if="props.row.children.length > 0">
                  <div
                    v-for="(item, index) in props.row.children"
                    :key="index"
                    class="item flex ai-c"
                  >
                    <div class="left">
                      <el-tag closable @close="delTag(props.row.id, item.id)">
                        {{ item.authName }}
                      </el-tag>
                      <i class="el-icon-caret-right"></i>
                    </div>
                    <div class="right flex col flex-c">
                      <!-- 二层标题 -->
                      <div
                        v-for="(item1, index1) in item.children"
                        :key="index1"
                        class="flex ai-c"
                      >
                        <div class="mrr-20" style="width: 150px">
                          <el-tag
                            closable
                            type="success"
                            @close="delTag(props.row.id, item1.id)"
                          >
                            {{ item1.authName }}
                          </el-tag>
                          <i class="el-icon-caret-right"></i>
                        </div>
                        <!-- 三层标题 -->
                        <div class="flex">
                          <div
                            v-for="(item2, index2) in item1.children"
                            :key="index2"
                            class="flex ai-c"
                            style="margin-right: 10px"
                          >
                            <el-tag
                              closable
                              type="warning"
                              @close="delTag(props.row.id, item2.id)"
                            >
                              {{ item2.authName }}
                            </el-tag>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item
                  v-if="props.row.children.length === 0"
                  class="flex ai-c"
                >
                  暂无权限
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column
            label="#"
            type="index"
            align="center"
          ></el-table-column>
          <el-table-column label="职位" prop="roleName" align="center">
          </el-table-column>
          <el-table-column label="描述" prop="roleDesc" align="center">
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button type="primary" size="mini" @click="edit(scope.row, 2)"
                >编辑</el-button
              >
              <el-button type="danger" size="mini" @click="del(scope.row)"
                >删除</el-button
              >
              <el-button
                type="warning"
                size="mini"
                @click="distribute(scope.row)"
                >分配权限</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
  <!-- 弹框 -->
  <el-dialog
    :title="num === 1 ? '添加角色' : '编辑角色'"
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
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="ruleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="ruleForm.roleDesc"></el-input>
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
  <!-- 分配角色的弹框 -->
  <el-dialog title="提示" v-model="dialogVisible1" width="30%">
    <el-tree
      :data="data"
      show-checkbox
      node-key="id"
      :default-expand-all="true"
      :default-checked-keys="ids"
      :props="defaultProps"
      ref="tree"
    >
    </el-tree>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible1 = false">取 消</el-button>
        <el-button type="primary" @click="comfirmAttr">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import api from "@/http/api";
import { defineComponent, onMounted, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { number } from "echarts";
import { stringifyQuery } from "vue-router";
interface obj {
  children: [];
  id: number;
  roleDesc: string;
  roleName: string;
}

interface obj2 {
  roleDesc: string;
  roleName: string;
}
interface obj3 {
  authName: string;
  children: [];
}
export default defineComponent({
  setup() {
    let dialogVisible = ref(false);
    let dialogVisible1 = ref(false);
    let num = ref(0);
    let ids = ref<number[]>([]);
    const tree = ref<any>(null);
    let tableData = ref<obj[]>([
      {
        children: [],
        id: 0,
        roleDesc: "string",
        roleName: "string",
      },
    ]);
    let ruleForm = ref<obj2>({
      roleDesc: "",
      roleName: "",
    });
    let rules = {
      roleName: [
        { required: true, message: "角色名不能为空", trigger: "blur" },
        { min: 2, max: 8, message: "长度在 2 到 8 个字符", trigger: "blur" },
      ],
    };
    let item = ref<obj>({
      children: [],
      id: 0,
      roleDesc: "",
      roleName: "",
    });
    let data = ref<obj3[]>([]);
    let defaultProps = ref({
      label: "authName",
      children: "children",
    });
    // 获取角色列表
    let getData = () => {
      api
        .getRoles()
        .then((res: any) => {
          // console.log(res.data);
          if (res.meta.status === 200) {
            tableData.value = res.data;
          }
        })
        .catch(() => {
          console.log("角色列表请求失败");
        });
    };
    // 获取权限列表
    let getRight = () => {
      api
        .getRight({ type: "tree" })
        .then((res: any) => {
          if (res.meta.status === 200) {
            data.value = res.data;
          }
        })
        .catch(() => {
          console.log("获取权限列表请求失败");
        });
    };
    // 添加角色请求
    let addro = () => {
      api
        .addRoles({
          roleName: ruleForm.value.roleName,
          roleDesc: ruleForm.value.roleDesc,
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
          console.log("添加角色请求失败");
        });
    };
    // 编辑角色请求
    let editRoles = () => {
      api
        .putRoles({
          id: item.value.id,
          roleName: ruleForm.value.roleName,
          roleDesc: ruleForm.value.roleDesc,
        })
        .then((res: any) => {
          if (res.meta.status === 200) {
            ElMessage.success("编辑成功");
            getData();
          } else {
            ElMessage.error(res.meta.msg);
          }
        })
        .catch(() => {
          console.log("编辑角色提交请求失败");
        });
    };
    // 添加角色
    let addRole = (n: number) => {
      num.value = n;
      dialogVisible.value = true;
      ruleForm.value = {
        roleName: "",
        roleDesc: "",
      };
    };
    // 点击编辑
    let edit = (row: obj, n: number) => {
      num.value = n;
      dialogVisible.value = true;
      ruleForm.value.roleName = row.roleName;
      item.value = row;
    };
    // 删除角色的请求
    let delRole = () => {
      api
        .delRoles({ id: item.value.id })
        .then((res: any) => {
          if (res.meta.status === 200) {
            ElMessage.success(res.meta.msg);
            getData();
          } else {
            ElMessage.error(res.meta.msg);
          }
        })
        .catch(() => {
          console.log("删除角色请求失败");
        });
    };
    // 点击删除
    let del = (row: obj) => {
      ElMessageBox.confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          item.value = row;
          delRole(); // 删除的请求
        })
        .catch(() => {
          ElMessage({
            type: "info",
            message: "已取消删除",
          });
        });
    };
    // 点击分配角色
    let distribute = (row: obj) => {
      item.value = row;
      console.log(row);
      dialogVisible1.value = true;
      row.children.map((item1: obj) => {
        item1.children.map((item2: obj) => {
          item2.children.map((item3: obj) => {
            ids.value.push(item3.id);
          });
        });
      });
      if (tree.value) {
        tree.value.setCheckedKeys(ids.value);
      }
    };
    // 点击确认
    let comfirm = () => {
      if (ruleForm.value.roleName !== "") {
        if (num.value === 1) {
          addro();
        } else if (num.value === 2) {
          editRoles();
        }
        dialogVisible.value = false;
      }
    };
    // 删除权限标签
    let delTag = (id: number, rightId1: number) => {
      ElMessageBox.confirm("此操作将永久删除该权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          api
            .delRoleRights({ roleId: id, rightId: rightId1 })
            .then((res: any) => {
              if (res.meta.status === 200) {
                ElMessage.success(res.meta.msg);
                getData();
              } else {
                ElMessage.success(res.meta.msg);
              }
            })
            .catch(() => {
              console.log("删除指定权限请求失败");
            });
        })
        .catch(() => {
          ElMessage({
            type: "info",
            message: "已取消删除",
          });
        });
    };
    // 分配权限点击确认
    let comfirmAttr = () => {
      dialogVisible1.value = false;
      let str = ref([]);
      str.value = tree.value
        .getCheckedKeys()
        .concat(tree.value.getHalfCheckedKeys());
      api
        .postRights({
          roleId: item.value.id,
          rids: str.value.join(","),
        })
        .then((res: any) => {
          if (res.meta.status === 200) {
            ElMessage.success(res.meta.msg);
            getData();
          }
        })
        .catch(() => {
          console.log("角色授权请求失败");
        });
    };
    onMounted(() => {
      getData();
      getRight();
    });
    watch(
      () => [dialogVisible1.value],
      (val) => {
        if (val[0] === false) {
          tree.value.setCheckedKeys([]);
          ids.value = [];
        }
      }
    );
    return {
      dialogVisible,
      ruleForm,
      rules,
      comfirm,
      tableData,
      edit,
      del,
      distribute,
      addRole,
      num,
      dialogVisible1,
      delTag,
      defaultProps,
      data,
      ids,
      tree,
      comfirmAttr,
    };
  },
});
</script>

<style scoped lang='scss'>
.item {
  border-top: 1px solid #eeeeee;
  width: 100%;
  padding: 10px;
  .left {
    padding: 20px 0;
    width: 180px;
  }
}
</style>