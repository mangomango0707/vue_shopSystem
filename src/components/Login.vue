<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/login.png" alt="">
            </div>
            <!-- 登录表单区域 -->
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
                </el-form-item>
                <!-- 按钮 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            // 登录表单的数据绑定对象
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            loginFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        resetLoginForm() {
            // console.log(this);
            this.$refs.loginFormRef.resetFields();
        },
        login() {
            this.$refs.loginFormRef.validate(async valid => {
                // console.log(valid);
                // 验证不通过
                if(!valid) return;
                // 校验通过
                // 发送请求(异步--利用async / await)
                const {data: res} = await this.$http.post('login', this.loginForm);
                // console.log(res);
                if(res.meta.status !== 200){
                    return this.$message.error('登录失败')
                }
                this.$message.success('登录成功');
                // console.log(res);
                
                // 将服务端返回的token保存到sessionStorage中
                window.sessionStorage.setItem("token", res.data.token);
                // 通过编程式导航跳转到后台主页，路由地址：/home
                this.$router.push("/home");
            })
        }
    }
}
</script>

<style lang="less" scoped>
.login_container {
    height: 100%;
    background-color: #2b4b6b;
    margin: 0 auto;
}
.login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3%;
    // 将绝对定位的盒子放中间
    position: absolute;
    left: 50%;
    top: 50%;
    // 位移
    transform: translate(-50%, -50%);
}
.avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
        height: 100%;
        width: 100%;
        border-radius: 50%;
    }
}
.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
.btns {
    display: flex;
    justify-content: flex-end;
}
</style>