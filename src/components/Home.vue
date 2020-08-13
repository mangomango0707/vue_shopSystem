<template>
  <el-container class="home-container">
      <!-- 头部区域 -->
    <el-header>
      <div>
          <img src="../assets/logo.png" alt="">
          <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
            <div class="toggle-button" @click="toggleCollapse">|||</div>
            <el-menu background-color="#333744" text-color="#fff" active-text-color="#ffd04b" unique-opened
             :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
            <!-- 一级菜单 -->
                <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">

                    <!-- 一级菜单模板区域 -->
                    <template slot="title">
                        <!-- 图标 -->
                        <i :class="iconsObj[item.id]"></i>
                        <span>{{item.authName}}</span>
                    </template>

                    <!-- 二级菜单 -->
                    <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                        <!-- 二级菜单模板区域 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i class="el-icon-menu"></i>
                            <span>{{subItem.authName}}</span>
                        </template>
                    </el-menu-item>

                </el-submenu>
            </el-menu>
        </el-aside>
        <!-- 右侧内容主体 -->
        <el-main>
            <!-- 路由占位符 -->
            <router-view></router-view>
        </el-main>
    </el-container>
</el-container>
</template>

<script>
export default {
    created(){
        this.getMenuList();
        this.activePath = window.sessionStorage.getItem("activePath");
    },
    data() {
        return {
            // 左侧菜单数据
            menuList: [],
            iconsObj: {
                '125': 'iconfont icon-user',
                '103': 'iconfont icon-tijikongjian',
                '101': 'iconfont icon-shangpin',
                '102': 'iconfont icon-danju',
                '145': 'iconfont icon-baobiao'
            },
            isCollapse: false,
            // 激活的状态路径
            activePath: ''
        }
    },
    methods: {
        // 退出
        logout() {
            // 销毁token
            window.sessionStorage.clear();
            // 跳转到登录页面
            this.$router.push('/login');
        },
        // 获取左侧菜单
        async getMenuList() {
            const {data: res} = await this.$http.get('menus');
            console.log(res);
            if(res.meta.status !== 200){
                return this.$message.error(res.meta.msg);
            }
            this.menuList = res.data;
        },
        // 切换是否折叠左侧菜单
        toggleCollapse() {
            this.isCollapse = !this.isCollapse;
        },
        // 保存链接的激活状态
        saveNavState(activePath) {
            window.sessionStorage.setItem("activePath", activePath);
            this.activePath = activePath;
        }
    }
}
</script>

<style lang="less" scoped>
.home-container {
    height: 100%;
}
.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    color: #ffffff;
    font-size: 20px;
    
    > div {
        display: flex;
        align-items: center;
        img {
            width: 100px;
            height: 60px;
        }
        span {
            margin-left: 15px;
        }
    }
}
.el-aside {
    background-color: #333744;
    .el-menu {
        border-right: none;
    }
}
.el-main {
    background-color: #eaedf1;
}
.iconfont {
    margin-right: 10px;
}
.toggle-button {
    background-color: #4a5064;
    color: #ffffff;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>