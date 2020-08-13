<template>
  <div>
      <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加alert提示区域 -->
            <el-row>
                <el-col>
                    <el-alert title="添加商品信息" type="info" show-icon center :closable="false">
                    </el-alert>
                </el-col>
            </el-row>

            <!-- 步骤条 -->
            <el-steps :space="200" :active="activeName - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- 添加Tab栏 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs v-model="activeName" :tab-position="'left'" :before-leave="beforeTabLeave"  @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <!-- 级联选择器 -->
                            <!-- options：用来指定数据源 -->
                            <!-- props：用来指定配置对象 -->
                            <el-cascader v-model="addForm.goods_cat" :options="cateList"
                                :props="cascaderProps" clearable @change="handleCateChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>

                    <el-tab-pane label="商品参数" name="1">
                        <!-- 渲染表单的item项 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyParamsData" :key="item.attr_id">
                            <!-- 复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <!-- 渲染表单的item项 -->
                        <el-form-item :label="item.attr_name" v-for="item in onlyParamsData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action: 图片上传的后台API路径 -->
                        <!-- on-preview	点击文件列表中已上传的文件时的钩子，可实现图片预览 -->
                        <!-- on-remove	文件列表移除文件时的钩子 -->
                        <!-- on-success	文件上传成功时的钩子 -->
                        <el-upload :action="uploadURL" :headers="headersObj" :on-success="handleSuccess"
                            :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button> 
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button type="primary" class="addGoodBtn" @click="addGood">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 实现图片的预览效果对话框 -->
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
            <img :src="picURL" class="previewPic">
        </el-dialog>
  </div>
</template>

<script>

// 导入lodash
import _ from 'lodash'

export default {
    created() {
        this.getCateList();
    },
    data() {
        return {
            // tab栏的选中项,默认为0
            activeName: '0',
            // 添加商品的表单数据
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_number: 0,
                goods_weight: 0,
                goods_cat: [],
                pics: [],
                goods_introduce: '',
                // 商品参数数组
                attrs: []
            },
            addFormRules: {
                goods_name: [
                    { required: true, message: '请输入商品名称', trigger: 'blur' }
                ],
                goods_price: [
                    { required: true, message: '请输入商品价格', trigger: 'blur' }
                ],
                goods_number: [
                    { required: true, message: '请输入商品数量', trigger: 'blur' }
                ],
                goods_weight: [
                    { required: true, message: '请输入商品重量', trigger: 'blur' }
                ],
                goods_cat: [
                    { required: true, message: '请选择商品分类', trigger: 'blur' }
                ],
            },
            // 商品分类数据
            cateList: [],
            // 级联选择器的配置对象
            cascaderProps: {
                expandTrigger: "hover",
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 动态参数数组
            manyParamsData: [],
            // 静态属性数组
            onlyParamsData: [],
            // 图片上传的url
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 为上传的请求头添加Authorization属性得到token值
            headersObj: {
                Authorization: window.sessionStorage.getItem("token")
            },
            // 控制图片预览的对话框的显示与隐藏
            previewVisible: false,
            // 显示图片预览的图片URL地址
            picURL: '',
            
        }
    },
    methods: {
        // 获取商品分类数据
        async getCateList() {
            const {data: res} = await this.$http.get('categories');
            if(res.meta.status !== 200){
                return this.$message.error('商品分类数据获取失败！');
            }
            // console.log(res);
            this.cateList = res.data;
        },
        // 级联选择器的选择项发生变化时触发的函数
        handleCateChange() {
            // 控制只能选择第三级分类
            if(this.addForm.goods_cat.length !== 3){
                this.addForm.goods_cat = [];
            }
            console.log(this.addForm.goods_cat);
        },
        // 切换标签之前，先验证是否商品分类信息已选，否则阻止页签切换
        beforeTabLeave(activeName, oldActiveName) {
            // console.log(activeName);
            // console.log(oldActiveName);
            if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3){
                this.$message.error('请先选择商品分类！');
                return false;
            }
        },
        // 切换到商品参数tab即获取商品参数列表
        async tabClicked() {
            // 先判断切换到的tab栏是哪一个
            if(this.activeName === '1'){
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, { params: {sel: 'many'}});
                // console.log(res);
                if(res.meta.status !== 200){
                    return this.$message.error('获取参数列表失败！');
                }
                console.log(res);
                // 赋值之前先把attr_vals转化为字符串数组
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ');
                });
                this.manyParamsData = res.data;
            }else if(this.activeName === '2'){
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, { params: {sel: 'only'}});
                // console.log(res);
                if(res.meta.status !== 200){
                    return this.$message.error('获取参数列表失败！');
                }
                console.log(res);
                // // 赋值之前先把attr_vals转化为字符串数组
                // res.data.forEach(item => {
                //     item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
                // });
                this.onlyParamsData = res.data;
            }
        },
        // 点击文件实现图片预览
        handlePreview(file) {
            // console.log(file);
            this.picURL = file.response.data.url;
            this.previewVisible = true;
        },
        // 删除图片
        handleRemove(file) {
            // console.log(file);
            // 根据删除的图片的pic找出在数组中要删除的图片的索引
            // 再利用数组的splice方法进行删除
            const removePath = file.response.data.tmp_path;
            const removeIndex = this.addForm.pics.findIndex(item => {
                item.pic === removePath;
            });
            this.addForm.pics.splice(removeIndex, 1);
            // console.log(this.addForm);
        },
        // 监听图片上传成功后，将图片信息添加到商品中
        handleSuccess(response) {
            // console.log(response);
            // 创建一个图片对象
            const picObj = { pic: response.data.tmp_path};
            // 将图片对象存到商品的图片数组中
            this.addForm.pics.push(picObj);
            console.log(this.addForm);
        },
        // 添加商品
        addGood() {
            // 先进行预校验
            this.$refs.addFormRef.validate(async valid => {
                if(!valid){
                    return this.$message.error('请填写必要的表单项！');;
                }
                // 发起请求前先将处理addForm数据
                // console.log(this.addForm);

                // 1. 将this.addForm.goods_cat从数组转为字符串
                // 对this.addForm.goods_cat进行数组转字符串由于级联选择器双向绑定了此数据而会报错
                // 因此引用lodash将addForm进行深拷贝出一个新的form
                // 对form进行转换
                const form =  _.cloneDeep(this.addForm);
                form.goods_cat = form.goods_cat.join(',');
                // console.log(this.form);

                // 2. 将attrs商品参数的数据（包括动态参数和静态属性的数据）
                // 转为符合要求的对象数组
                // 先对动态参数和静态属性的数据做循环处理，转为对象
                // 并添加到商品参数数组中
                // console.log(this.manyParamsData);
                // console.log(this.onlyParamsData);

                this.manyParamsData.forEach(item => {
                    // 将动态参数中的attr_vals数组转化为字符串
                    const newObj = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(' ')
                    }
                    this.addForm.attrs.push(newObj);
                })
                this.onlyParamsData.forEach(item => {
                    const newObj = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    }
                    this.addForm.attrs.push(newObj);
                })
                form.attrs = this.addForm.attrs;
                console.log(form);

                // 发起添加请求
                const {data: res} = await this.$http.post('goods', form);
                if(res.meta.status !== 201){
                    return this.$message.error('添加商品失败！');
                }
                this.$message.success('添加商品成功！');

                // 通过编程式导航跳转到商品列表页面
                this.$router.push('/goods');
            })
        }
        
    },
    computed: {
        cateId() {
            if(this.addForm.goods_cat.length === 3){
                return this.addForm.goods_cat[2];
            }
            return null;
        }
    },
}
</script>

<style lang="less" scoped>
.el-checkbox {
    margin: 0 10px 0 0 !important;
}
.previewPic {
    width: 100%;
}
.addGoodBtn {
    margin-top: 20px;
}
</style>