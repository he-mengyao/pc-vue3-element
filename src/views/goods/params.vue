<template>
  <el-card>
    <el-alert
      title="注意:只允许为第三级分类设置相关参数!"
      type="warning"
      show-icon
    >
    </el-alert>
    <div class="f18 mrtb-20 select">
      选择商品分类：
      <el-cascader
        v-model="value"
        :options="options"
        :props="props"
      ></el-cascader>
    </div>
    <!-- 动态参数和静态参数 -->
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="动态参数" name="动态参数"></el-tab-pane>
      <el-tab-pane label="静态属性" name="静态属性"></el-tab-pane>
    </el-tabs>
    <!-- 添加 -->
    <el-button
      type="primary"
      size="mini"
      @click="add"
      :disabled="value.length === 0"
      >添加{{ label.substr(2, 2) }}</el-button
    >
    <!-- 表格 -->
    <el-table :data="tableData" style="width: 100%">
      <el-table-column label="#" type="index" align="center"> </el-table-column>
      <el-table-column type="expand">
        <template #default="props">
          <div class="flex">
            <template
              :key="index"
              v-for="(tag, index) in props.row.attr_vals.split(',')"
            >
              <el-tag
                v-if="tag"
                closable
                :disable-transitions="false"
                @close="handleClose(Number(index), props.row)"
                style="margin-right: 10px"
              >
                {{ tag }}
              </el-tag>
            </template>
            <span :id="`${props.row.attr_id}-input`" class="input-new-tag">
              <el-input
                v-model="inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter="handleInputConfirm"
                style="width: 200px"
                @blur="blur(props.row)"
              >
              </el-input>
            </span>
            <el-button
              :id="`${props.row.attr_id}-button`"
              class="button-new-tag"
              size="small"
              @click="showInput(props.row)"
              >+ New Tag</el-button
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column label="参数名称" prop="attr_name" align="center">
      </el-table-column>
      <el-table-column label="操作" prop="name" align="center">
        <template #default="scope">
          <el-button
            size="mini"
            @click="handleEdit(scope.row, 1)"
            type="primary"
            icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row)"
            icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <!-- 弹框 -->
  <el-dialog
    :title="num === 1 ? '修改' + label : '添加' + label"
    v-model="dialogVisible"
    width="30%"
  >
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm1"
      label-width="100px"
      class="demo-ruleForm"
    >
      <el-form-item label="参数名称" prop="attr_name">
        <el-input v-model="ruleForm.attr_name"></el-input>
      </el-form-item>
    </el-form>
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
import { defineComponent, ref, onMounted, watch, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
interface Obj {
  attr_id: number;
  attr_name: string;
  attr_sel: string;
  cat_id: number;
  attr_vals: string;
}

export default defineComponent({
  setup() {
    let type = ref(0);
    let pagenum = ref(0);
    let pagesize = ref(0);
    let options = ref([{}]);
    let value = ref([]);
    let activeName = ref("动态参数");
    let sel = ref("many");
    let tableData = ref<Obj[]>([]);
    let label = ref("动态参数");
    let dialogVisible = ref(false);
    let num = ref(0);
    let inputValue = ref("");
    let saveTagInput = ref();
    // 点击每一项是记录id
    let attrid = ref(0);
    let ruleForm = ref({
      attr_name: "",
    });
    let rules = {
      attr_name: [
        { required: true, message: "参数名称不能为空", trigger: "blur" },
        { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
      ],
    };
    let props = ref({
      label: "cat_name",
      children: "children",
      expandTrigger: "hover",
      value: "cat_id",
    });
    // 获取分类数据
    let getData = () => {
      api
        .getCategories({
          type: type.value,
          pagenum: pagenum.value,
          pagesize: pagesize.value,
        })
        .then((res: any) => {
          if (res.meta.status === 200) {
            options.value = res.data;
          }
        })
        .catch(() => {
          console.log("获取商品分类请求失败");
        });
    };
    // 获取分类参数
    let getAttr = () => {
      api
        .getAttributes({ id: value.value[2], sel: sel.value })
        .then((res: any) => {
          if (res.meta.status === 200) {
            tableData.value = res.data;
          }
        })
        .catch(() => {
          console.log("获取分类参数失败");
        });
    };
    let alter = (res: any) => {
      if (res.meta.status === 200) {
        ElMessage.success(res.meta.msg);
        getAttr();
      } else {
        ElMessage.error(res.meta.msg);
      }
    };
    // 点击动态参数还是静态参数
    let handleClick = (tab: any) => {
      if (tab.props.label === "动态参数") {
        sel.value = "many";
      } else {
        sel.value = "only";
      }
      label.value = tab.props.label;
      getAttr();
    };
    // 点击添加参数
    let add = () => {
      dialogVisible.value = true;
      ruleForm.value.attr_name = "";
      num.value = 0;
    };
    // 点击编辑
    let handleEdit = (row: any, n: number) => {
      dialogVisible.value = true;
      num.value = n;
      ruleForm.value.attr_name = row.attr_name;
      attrid.value = row.attr_id;
    };
    // 删除参数的请求
    let getDel = () => {
      api
        .deleteAttr({
          id: value.value[2],
          attrid: attrid.value,
        })
        .then((res: any) => {
          alter(res);
        })
        .catch(() => {
          console.log("删除参数请求失败");
        });
    };
    // 点击删除
    let handleDelete = (row: any) => {
      attrid.value = row.attr_id;
      ElMessageBox.confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          getDel(); // 删除的请求
        })
        .catch(() => {
          ElMessage({
            type: "info",
            message: "已取消删除",
          });
        });
    };
    // 添加参数的请求
    let addAttributes = () => {
      api
        .addAttributes({
          id: value.value[2],
          attr_name: ruleForm.value.attr_name,
          attr_sel: sel.value,
          attr_vals: "",
        })
        .then((res: any) => {
          if (res.meta.status === 201) {
            ElMessage.success(res.meta.msg);
            getAttr();
          } else {
            ElMessage.error(res.meta.msg);
          }
        })
        .catch(() => {
          console.log("添加参数请求失败");
        });
    };
    // 编辑提交的请求
    let editcategories = () => {
      api
        .editcategories({
          id: value.value[2],
          attrId: attrid.value,
          attr_name: ruleForm.value.attr_name,
          attr_sel: sel.value,
          attr_vals: "",
        })
        .then((res: any) => {
          alter(res);
        })
        .catch(() => {
          console.log("编辑提交参数失败");
        });
    };
    // 弹框点击确认
    let comfirm = () => {
      dialogVisible.value = false;
      if (num.value === 1) {
        editcategories();
      } else {
        addAttributes();
      }
    };
    // 添加标签的请求
    let addtag = (row: Obj) => {
      api
        .editcategories({
          id: row.cat_id,
          attrId: row.attr_id,
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals,
        })
        .then((res: any) => {
          // console.log(res);
          if (res.meta.status === 200) {
            ElMessage.success(res.meta.msg);
          }
        })
        .catch(() => {
          console.log("添加标签请求失败");
        });
    };
    // 点击添加标签
    let showInput = (row: Obj) => {
      let btn: any = document.getElementById(`${row.attr_id}-button`);
      let ipt: any = document.getElementById(`${row.attr_id}-input`);
      btn.style.display = "none";
      ipt.style.display = "block";
      nextTick(() => {
        saveTagInput.value.focus();
      });
    };
    // 关闭标签
    let handleClose = (index: number, row: Obj) => {
      let arr = row.attr_vals.split(",");
      arr.splice(index, 1);
      row.attr_vals = arr.join(",");
      addtag(row);
    };
    // 输入框确认
    let handleInputConfirm = () => {
      saveTagInput.value.blur();
    };
    // 失去焦点
    let blur = (row: Obj) => {
      if (inputValue.value) {
        row.attr_vals += inputValue.value + ",";
        addtag(row);
        inputValue.value = "";
      } else {
        ElMessage.error("添加内容不能为空");
      }
    };
    onMounted(() => {
      getData();
    });
    watch(
      () => value.value,
      (val) => {
        getAttr();
      }
    );
    return {
      value,
      options,
      props,
      activeName,
      handleClick,
      tableData,
      handleEdit,
      handleDelete,
      add,
      dialogVisible,
      label,
      comfirm,
      ruleForm,
      rules,
      num,
      inputValue,
      showInput,
      handleClose,
      handleInputConfirm,
      saveTagInput,
      blur,
    };
  },
});
</script>

<style scoped>
.input-new-tag {
  display: none;
}
</style>