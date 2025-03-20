<template>
  <div class="login-bg">
    <div v-for="n in 5" :key="n"></div>
  </div>
  <div class="login">
    <el-form
      ref="loginRef"
      :model="loginForm.model"
      :rules="loginForm.rules"
      class="login-form"
    >
      <h3 class="title">nest-admin后台管理系统</h3>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.model.username"
          maxlength="40"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="账号"
        >
          <template #prefix>
            <!-- <svg-icon icon-class="user" class="el-input__icon input-icon" /> -->
            <User class="input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.model.password"
          maxlength="20"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <!-- <svg-icon icon-class="password" class="el-input__icon input-icon" /> -->
            <Lock class="input-icon" />
          </template>
        </el-input>
      </el-form-item>
      <!-- TOTP认证码-->
      <el-form-item prop="code">
        <el-input
          v-model="loginForm.model.code"
          maxlength="6"
          size="large"
          auto-complete="off"
          placeholder="认证码"
          @keyup.enter="handleLogin"
        >
          <template #prefix
            ><svg-icon icon-class="validCode" class="el-input__icon input-icon"
          /></template>
        </el-input>
        <el-dialog class="qr-code" v-model="qrCodeBase64" width="500" center title="请扫描二维码获取认证码">
          <img :src="qrCodeBase64" alt=""/>
        </el-dialog>
      </el-form-item>
      <el-checkbox
        v-model="loginForm.model.rememberMe"
        style="margin: 0px 0px 25px 0px"
        >记住密码</el-checkbox
      >

      <el-form-item style="width: 100%">
        <el-button
          :loading="authCodeInfo.loading"
          size="large"
          type="primary"
          style="width: 100%"
          @click.prevent="handleLogin"
        >
          <span v-if="!authCodeInfo.loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div class="register" style="float: right" v-if="register">
          <router-link class="link-type" :to="'/register'"
            >没有账号？立即注册</router-link
          >
        </div>
        <div class="forgot" style="float: left">
          <el-button
            class="underline-button"
            type="danger"
            text
            underline="true"
            @click="resetTotp"
            >丢失认证码，确认重置吗？</el-button
          >
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2023 ruoyi.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import useAuthCode from "@/hooks/useAuthCode";
import { validateTotp, getMoreinfo } from "@/api/login";
import { createTotp, closeTotp } from "@/api/system/user";
import { ElMessage } from "element-plus";
import useUserStore from "@/store/modules/user";

console.log("user store totp flag=", useUserStore().isValid);
const userStore = useUserStore();
const authCodeInfo = useAuthCode.authCodeInfo;
// 重置报错userID没有，故放开下面两行
const currentUser = JSON.parse((useUserStore().currentUser));
const userId = authCodeInfo.uuid || String(currentUser.id)

// const proxy = getCurrentInstance()

const route = useRoute();
const router = useRouter();
const qrCodeBase64 = ref(); //二维码显示标志

const loginRef = ref();
const loginForm = reactive({
  model: {
    username: "",
    password: "",
    rememberMe: false,
    code: "",
    uuid: "",
  },
  rules: {
    username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
    password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
    code: [{ required: true, trigger: "change", message: "请输入验证码" }],
  },
});
// 注册开关
const register = ref(true);
const redirect = ref(undefined);

watch(
  route,
  (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
  },
  { immediate: true }
);

function handleLogin() {
  console.log('loginref=', loginRef);
  
  loginRef.value.validate((valid) => {
    if (valid) {
      authCodeInfo.loading = true;
      loginForm.model.uuid = authCodeInfo.uuid;
      // loginForm.model.uuid = userId;
      console.log('uuid=',authCodeInfo.uuid);
      console.log(authCodeInfo);
      console.log(loginForm.model);
      
      
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码，否则移除
      useAuthCode.setUserCookie(loginForm.model);
      // 调用action的登录方法
      userStore
        .login(loginForm.model)
        .then(() => {
          // router.push({ path: redirect.value || '/' })
          // 调用action的登录方法
          // 进行totp验证
          validCode(loginForm.model);
        })
        .catch(() => {
          authCodeInfo.loading = false;
        });
    }
  });
}

function validCode(value) {
  console.log('validate==value::');
  console.log(value);
  
  
  validateTotp(value).then((response) => {
    qrCodeBase64.value = response.data.qrCodeDataURL;
    authCodeInfo.qrCode = response.data.qrCodeDataURL;

    if (response.data.verify) {
      ElMessage({
        message: " 登录成功，请妥善保存您的认证码。",
        type: "success",
      });
      userStore.changeTotpState(response.data.verify); //使用action来修改更加合理
      qrCodeBase64.value = undefined;
      //路由跳转
      router.push({ path: redirect.value || "/" });
    }
    if (loginForm.model.code !== undefined && !response.data.verify) {
      ElMessage.error(" 认证码错误，请重新输入！");
      loginForm.model.code = "";
      authCodeInfo.loading = false;
    }
  });
}

function resetTotp() {
  //按规范应该请求系统管理员重置，但这里为便于处理直接获取系统的secret，再次扫描二维码激活
  // ElMessage({
  //   message: "若需重置认证码请联系管理员操作",
  //   type: "warning",
  // });
  // console.log(proxy);
  
  createTotp(userId).then((res) => {
    if (!res.data.activateTotp) {
      setTimeout(() => {
        proxy.$modal
          .confirm("用户 " + row.login + " 已启用双重验证，是否需要重置？")
          .then(() => {
            closeTotp(userId).then((res) => {
              createTotp(userId).then((res) => {
                proxy.$modal.msgSuccess("重置已完成");
              });
            });
          });
      }, 150);
    }
    proxy.$modal.msgSuccess("操作成功");
  });
}

getMoreinfo();
loginForm.model = useAuthCode.getUserCookie(loginForm.model);
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}
.qr-code {
  border: 1px solid #ccc;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.qr-code img {
  padding-left: 110px;
  max-width: 100%;
  height: auto;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 40px;
  padding-left: 12px;
}
.link-type {
  padding-left: 2px;
}
</style>
