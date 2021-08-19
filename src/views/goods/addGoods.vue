<template>
  <el-card class="box-card">
    <div class="top">
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条 -->
      <div class="steps">
        <el-steps :active="active" finish-status="success">
          <el-step
            :title="item"
            v-for="(item, index) in stepList"
            :key="index"
          ></el-step>
        </el-steps>
      </div>
    </div>
    <div class="flex">
      <div class="w-100 addgoods">
        <el-tabs
          :tab-position="tabPosition"
          @tab-click="tabClisk"
          v-model="nums"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form
              :model="ruleForm"
              :rules="rules"
              ref="ruleForm1"
              label-width="100px"
              class="demo-ruleForm"
              style="padding-left: 0"
            >
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="ruleForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input
                  v-model.number="ruleForm.goods_price"
                  :disabled="number === 5"
                  type="number"
                ></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input
                  v-model.number="ruleForm.goods_weight"
                  :disabled="number >= 4"
                  type="number"
                ></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input
                  v-model.number="ruleForm.goods_number"
                  type="number"
                  :disabled="number >= 3"
                ></el-input>
              </el-form-item>
              <el-form-item label="商品分类">
                <el-cascader
                  v-model="ruleForm.value"
                  :options="options"
                  :disabled="number >= 2"
                  :props="props"
                ></el-cascader>
              </el-form-item>
              <el-form-item label=" " v-if="number === 0">
                <el-button type="success" size="mini" @click="next(1)"
                  >下一步</el-button
                >
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1" :disabled="num <= 0">
            <!-- 商品参数 -->
            <div v-for="(item, index) in divList" :key="index">
              <div :class="{ 'mrt-10': index !== 0 }" class="f14 fw">
                {{ item.attr_name }}
              </div>
              <div class="flex mrt-10" v-if="item.attr_vals">
                <template
                  v-for="(item1, index1) in item.attr_vals.split(',')"
                  :key="index1"
                >
                  <el-tag
                    v-if="item1"
                    style="margin-right: 10px"
                    size="small"
                    >{{ item1 }}</el-tag
                  ></template
                >
              </div>
              <div v-if="!item.attr_vals" class="mrt-10">暂无属性</div>
            </div>
            <div class="mrt-20">
              <el-button type="success" size="mini" @click="next(2)"
                >下一步</el-button
              >
            </div>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2" :disabled="num <= 1">
            <div v-if="!onlyList">暂无属性</div>
            <div v-for="(item, index) in onlyList" :key="index">
              <div :class="{ 'mrt-10': index !== 0 }" class="f14 fw">
                {{ item.attr_name }}
              </div>
              <div class="flex mrt-10" v-if="item.attr_vals">
                <template
                  v-for="(item1, index1) in item.attr_vals.split(',')"
                  :key="index1"
                >
                  <el-tag
                    v-if="item1"
                    style="margin-right: 10px"
                    size="small"
                    >{{ item1 }}</el-tag
                  ></template
                >
              </div>
            </div>
            <div class="mrt-20">
              <el-button type="success" size="mini" @click="next(3)"
                >下一步</el-button
              >
            </div>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3" :disabled="num <= 2">
            <el-upload
              class="upload-demo"
              drag
              action="/api/upload"
              :on-success="onsuccess"
              multiple
              :headers="headers"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  只能上传 jpg/png 文件，且不超过 500kb
                </div>
              </template>
            </el-upload>
            <div class="mrt-20">
              <el-button type="success" @click="next(4)">下一步</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4" :disabled="num <= 3">
            <div id="div1"></div>
            <div class="mrt-20">
              <el-button type="success" @click="next(5)">提交</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts">
import api from "@/http/api";
import router from "@/router";
import { ElMessage } from "element-plus";
import { defineComponent, ref, onMounted, watch, watchEffect } from "vue";
import E from "wangeditor";

interface obj {
  attr_id: number;
  attr_name: string;
  attr_sel: string;
  attr_vals: string;
  attr_write: string;
  cat_id: number;
  delete_time: null;
}
export default defineComponent({
  setup() {
    let tabPosition = ref("left");
    let active = ref(0);
    let nums = ref("0");
    // 分类选择
    let value = ref([]);
    let options = ref([{}]);
    let flag = ref(false);
    let num = ref(0);
    let sel = ref("many");
    let pics = ref({});
    let onlyList = ref<obj[]>([]);
    let token = localStorage.getItem("token");
    let headers = { Authorization: token };
    // 判断下一步按钮显示
    let f = ref(false);
    let props = ref({
      label: "cat_name",
      children: "children",
      expandTrigger: "hover",
      value: "cat_id",
    });
    let ruleForm = ref({
      goods_name: "",
      goods_price: "",
      goods_weight: "",
      goods_number: "",
      value: [],
    });
    let divList = ref<obj[]>([]);
    let rules = {
      goods_name: [
        { required: true, message: "请输入商品名称", trigger: "blur" },
      ],
      goods_price: [
        { required: true, message: "请输入商品价格", trigger: "blur" },
      ],
      goods_weight: [
        { required: true, message: "请输入商品重量", trigger: "blur" },
      ],
      goods_number: [
        { required: true, message: "请输入商品数量", trigger: "blur" },
      ],
    };
    // 步骤条
    let stepList = ref([
      "基本信息",
      "商品参数",
      "商品属性",
      "商品图片",
      "商品内容",
      "完成",
    ]);
    // 点击左侧导航参数
    let tabClisk = (val: any) => {
      active.value = Number(val.index);
    };
    // 获取分类数据
    let getCategory = () => {
      api
        .getCategories({ type: 0, pagenum: 0, pagesize: 0 })
        .then((res: any) => {
          options.value = res.data;
        })
        .catch(() => {
          console.log("获取分类数据失败");
        });
    };
    // 获取分类参数
    let getAttr = () => {
      if (active.value === 1) {
        sel.value = "many";
      } else if (active.value === 2) {
        sel.value = "only";
      }
      api
        .getAttributes({ id: ruleForm.value.value[2], sel: sel.value })
        .then((res: any) => {
          if (res.meta.status === 200) {
            if (sel.value === "many") {
              divList.value = res.data;
            }
            {
              onlyList.value = res.data;
            }
          }
        })
        .catch(() => {
          console.log("获取分类参数失败");
        });
    };
    // 上传成功
    let onsuccess = (res: any) => {
      pics.value = res.data;
    };
    // 添加商品的请求
    let goods_introduce = ref("");
    let addGoods = () => {
      let arr1 = divList.value.concat(onlyList.value);
      api
        .addGoods({
          goods_name: ruleForm.value.goods_name,
          goods_cat: ruleForm.value.value.join(","),
          goods_price: Number(ruleForm.value.goods_price),
          goods_number: Number(ruleForm.value.goods_number),
          goods_weight: Number(ruleForm.value.goods_weight),
          goods_introduce: goods_introduce.value,
          pics: pics.value,
          attrs: arr1,
        })
        .then((res: any) => {
          // console.log(res);
          if (res.meta.status === 201) {
            ElMessage.success(res.meta.msg);
            router.push("goods");
          } else {
            ElMessage.error(res.meta.msg);
          }
        })
        .catch(() => {
          console.log("添加商品请求失败");
        });
    };
    // 点击下一步
    let next = (n: number) => {
      if (active.value === 4) {
        active.value = 4;
      } else {
        active.value++;
      }
      nums.value = String(active.value);
      num.value = n;
      if (n === 1) {
        getAttr();
      } else if (n === 2) {
        getAttr();
      } else if (n === 5) {
        // 完成
        addGoods();
      }
    };
    onMounted(() => {
      getCategory();
      let editor = new E(document.getElementById("div1"));
      editor.create();
      // 配置 onchange 回调函数
      editor.config.onchange = function (newHtml: any) {
        goods_introduce.value = newHtml;
      };
    });
    // 用于表单禁用
    let number = ref(0);
    watch(
      () => ruleForm.value,
      (val) => {
        if (!val.goods_name) {
          number.value = 5;
        } else if (!val.goods_price) {
          number.value = 4;
        } else if (!val.goods_weight) {
          number.value = 3;
        } else if (!val.goods_number) {
          number.value = 2;
        } else if (val.value.length === 0) {
          number.value = 1;
        } else {
          number.value = 0;
        }
      },
      { deep: true, immediate: true }
    );
    watchEffect(() => {
      // console.log(ruleForm.value);
    });
    return {
      tabPosition,
      active,
      ruleForm,
      rules,
      value,
      options,
      tabClisk,
      stepList,
      props,
      flag,
      next,
      nums,
      num,
      divList,
      onlyList,
      onsuccess,
      headers,
      number,
    };
  },
});
</script>

<style scoped lang="scss">
.top {
  margin-left: 120px;
  margin-bottom: 20px;
  .steps {
    margin-top: 30px;
  }
}
</style>