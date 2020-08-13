<template>
  <div>
      <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="6">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- 商品列表区域 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
                <el-table-column prop="add_time" label="创建时间" width="165px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <!-- 通过作用域插槽渲染操作列 -->
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditGoodDialog(scope.row.goods_id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
             <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" 
                            :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" 
                            layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 修改商品对话框 -->
        <el-dialog title="修改商品" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
                <!-- 内容主体区域 -->
                <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
                    <el-form-item label="商品名称">
                        <el-input v-model="editForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格">
                        <el-input v-model="editForm.goods_price"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量">
                        <el-input v-model="editForm.goods_number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量">
                        <el-input v-model="editForm.goods_weight"></el-input>
                    </el-form-item>
                    <el-form-item label="商品介绍">
                        <quill-editor v-model="editForm.goods_introduce"></quill-editor>
                    </el-form-item>
                    <el-form-item label="商品图片">
                        <el-upload :action="uploadURL" :headers="headersObj" :on-success="handleSuccess"
                            :on-remove="handleRemove" list-type="picture">
                            <el-button size="small" type="primary">点击上传</el-button> 
                        </el-upload>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editGood">确 定</el-button>
                </span>
        </el-dialog>
  </div>
</template>

<script>
export default {
    created() {
        this.getGoodsList();
    },
    data() {
        return {
            // 控制添加商品对话框的显示与隐藏
            addDialogVisible: false,
            // 查询参数
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            // 商品列表数据
            goodsList: [],
            // 商品总数
            total: 0,

            // 控制修改商品对话框的显示与隐藏
            editDialogVisible: false,
            // 修改商品表单数据
            editForm: {},
            editFormRules: {
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
                ]
            },
            // 图片上传的URL
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 为上传的请求头添加Authorization属性得到token值
            headersObj: {
                Authorization: window.sessionStorage.getItem("token")
            },
            // 控制图片预览的对话框的显示与隐藏
            previewVisible: false,
            // 显示图片预览的图片URL地址
            picURL: ''
        }
    },
    methods: {
        // 获取商品列表数据
        async getGoodsList() {
            const {data: res} = await this.$http.get('goods', { params: this.queryInfo});
            if(res.meta.status !== 200){
                return this.$message.error('获取商品列表数据失败！');
            }
            console.log(res);
            this.goodsList = res.data.goods;
            this.total = res.data.total;
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getGoodsList();
        },
        // 监听当前页码改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage;
            this.getGoodsList();
        },
        // 删除商品
        async removeGoodsById(id) {
            const confirmResult = await this.$confirm('确定删除该商品吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err);

            if(confirmResult !== 'confirm'){
                return this.$message.error('取消删除！');
            }
            const {data: res} = await this.$http.delete('goods/' + id);
            if(res.meta.status !== 200){
                return this.$message.error('删除商品失败！');
            }
            this.$message.success('删除商品成功！');
            // 重新渲染商品列表
            this.getGoodsList();
        },
        // 通过编程式导航跳转到添加商品页面
        goAddPage() {
            this.$router.push('/goods/add');
        },
        // 展示修改商品对话框并根据id查询商品信息
        async showEditGoodDialog(id) {
            // 根据id查询商品信息
            const {data: res} = await this.$http.get('goods/' + id);
            if(res.meta.status !== 200){
                return this.$message.error('查询商品信息失败！');
            }
            console.log(res);
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        // 监听修改商品对话框的关闭事件
        editDialogClosed() {
            // 重置表单
            this.$refs.editFormRef.resetFields();
        },
        // 修改商品
        editGood() {
            this.$refs.editFormRef.validate(async valid => {
                if(!valid){
                    return;
                }
                // console.log(this.editForm);
                const {data: res} = await this.$http.put('goods/' + this.editForm.goods_id, this.editForm);
                if(res.meta.status !== 200){
                    return this.$message.error('修改商品信息失败！');
                }
                
                console.log(res);
                this.$message.success('修改商品信息成功！');
                this.getGoodsList();
                this.editDialogVisible = false;
            })
        },
        
        // 删除图片
        handleRemove(file) {
            // console.log(file);
            // 根据删除的图片的pic找出在数组中要删除的图片的索引
            // 再利用数组的splice方法进行删除
            const removePath = file.response.data.tmp_path;
            const removeIndex = this.editForm.pics.findIndex(item => {
                item.pic === removePath;
            });
            this.editForm.pics.splice(removeIndex, 1);
            // console.log(this.addForm);
        },

        // 监听图片上传成功后，将图片信息添加到商品中
        handleSuccess(response) {
            // console.log(response);
            this.editForm.pics = [];
            // 创建一个图片对象
            const picObj = { pic: response.data.tmp_path};
            // 将图片对象存到商品的图片数组中
            this.editForm.pics.push(picObj);
            console.log(this.editForm);
        }
    }
}
</script>

<style>

</style>