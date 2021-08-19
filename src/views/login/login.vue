<template>
  <div class="box">
    <el-card class="box-card">
      <div class="title flex flex-c fw border-b mrtb-20">
        欢迎来到小爱后台管理系统
      </div>
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm1"
        label-width="120px"
        class="demo-ruleForm"
      >
        <el-form-item label="请输入用户名" prop="username">
          <el-input v-model="ruleForm.username"></el-input>
        </el-form-item>
        <el-form-item label="请输入密码" prop="password">
          <el-input v-model="ruleForm.password"></el-input>
        </el-form-item>
        <div class="f16">
          特别提醒:
          如果您是管理员,请使用管理员账号登录,如果不知道账号,请联系公司人事。
        </div>
        <div class="ta-c mrtb-20">
          <el-button type="primary" @click="submitForm">立即登录</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { defineComponent, ref } from "vue";
import api from "../../http/api";
import { useStore } from "vuex";
import { stringify } from "qs";

interface Obj {
  username: string;
  password: string;
}
export default defineComponent({
  setup() {
    let store = useStore();
    let ruleForm = ref<Obj>({
      username: "",
      password: "",
    });
    let rules = ref<any>({
      username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        { min: 5, max: 8, message: "长度在 5 到 8 个字符", trigger: "blur" },
      ],
      password: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        { min: 5, max: 8, message: "长度在 5 到 8 个字符", trigger: "blur" },
      ],
    });
    let router = useRouter();
    // 定义方法
    let ruleForm1 = ref<any>(null);
    let submitForm = () => {
      ruleForm1.value!.validate((valid: boolean) => {
        if (valid) {
          api
            .login({
              username: ruleForm.value.username,
              password: ruleForm.value.password,
            })
            .then((res: any) => {
              console.log(res);
              if (res.meta.status === 200) {
                ElMessage.success(res.meta.msg);
                // 存用户信息
                localStorage.setItem("xiaoai-user", JSON.stringify(res.data));
                // 存token
                localStorage.setItem("token", res.data.token);
                router.push("/");
                // 存导航列表
                localStorage.setItem(
                  "navlist",
                  JSON.stringify([{ name: "首页", path: "/" }])
                );
                store.commit(
                  "setList",
                  JSON.stringify([{ name: "首页", path: "/" }])
                );
                // 存path
                localStorage.setItem("path", "/");
                store.commit("setPath", "/");
              } else {
                ElMessage.error(res.meta.msg);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          console.log("表单填写有误，请检查");
          return false;
        }
      });
    };
    return {
      ruleForm,
      rules,
      ruleForm1,
      submitForm,
    };
  },
});
</script>

<style scoped lang='scss'>
.box-card {
  width: 650px;
  .title {
    height: 60px;
    font-size: 32px;
  }
}
</style>