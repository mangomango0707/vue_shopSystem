<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加分类按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格区域 -->
            <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index>
                <template v-slot:isok="scope">
                   <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: #42b983"></i>
                   <i class="el-icon-error" v-else  style="color: red"></i>
                </template>
                <template v-slot:order="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" v-else>三级</el-tag>
                </template>
                <template v-slot:opt="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteDialog(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[3, 5, 10, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>

            <!-- 添加分类对话框 -->
            <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
                
                <el-form ref="addCateFormRef" :model="addCateForm" :rules="addCateFormRules" label-width="80px">
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input v-model="addCateForm.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类">
                        <!-- 级联选择器 -->
                        <!-- options：用来指定数据源 -->
                        <!-- props：用来指定配置对象 -->
                        <el-cascader v-model="selectedKeys" :options="ParentCateList"
                            :props="cascaderProps" clearable @change="parentCateChanged">
                        </el-cascader>
                    </el-form-item>
                </el-form>

                <span slot="footer" class="dialog-footer">
                    <el-button @click="addCateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addCate">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 修改分类对话框 -->
            <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
                
                <el-form ref="editCateFormRef" :model="editCateForm" :rules="editCateFormRules" label-width="80px">
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input v-model="editCateForm.cat_name"></el-input>
                    </el-form-item>
                </el-form>

                <span slot="footer" class="dialog-footer">
                    <el-button @click="editCateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editCate">确 定</el-button>
                </span>
            </el-dialog>
            

        </el-card>
        
    </div>
</template>

<script>
export default {
    created() {
        this.getCateList();
    },
    data() {
        return {
            // 控制添加商品分类对话框的显示与隐藏
            addCateDialogVisible: false,
            // 商品分类的请求参数
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 商品分类列表数据
            cateList: [],
            // 总数据条数
            total: 0,
            // 为table指定列的定义
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    type: 'template',
                    template: 'isok'
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'order'
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'opt'
                },
            ],

            // 添加分类的表单数据
            addCateForm: {
                cat_name: '',
                // 父级分类的ID，默认为0
                cat_pid: 0,
                // 分类的等级，默认要添加的是1级分类
                cat_level: 0
            },
            // 添加表单的验证规则对象
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
                ]
            },

            // 父级分类数据列表
            ParentCateList: [],
            // 选中的父级分类的id数组
            selectedKeys: [],
            // 级联选择器的配置对象
            cascaderProps: {
                expandTrigger: "hover",
                checkStrictly: true,
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },

            // 控制修改商品分类对话框的显示与隐藏
            editCateDialogVisible: false,
            // 修改分类的表单数据
            editCateForm: {},
            // 修改表单的验证规则对象
            editCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
                ]
            },
        }
    },
    methods: {
        // 获取商品分类列表数据
        async getCateList() {
            const {data: res} = await this.$http.get('categories', { params: this.queryInfo});
            if(res.meta.status !== 200){
                return this.$message.error('获取商品分类数据列表失败！');
            }
            this.cateList = res.data.result;
            this.total = res.data.total;
            // this.$message.success('获取商品分类数据列表成功！');
            console.log(res);
        },

        // 监控pagesize的改变
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getCateList();
        },

        // 监控pagenum的改变
        handleCurrentChange(newNum) {
            this.queryInfo.pagenum = newNum;
            this.getCateList();
        },

        // 展示添加分类对话框
        showAddCateDialog() {
            // 一点击展示对话框即获取父级分类数据
            this.getParentCateList();

            this.addCateDialogVisible = true;
        },

        // 获取父级分类列表
        async getParentCateList() {
            const {data: res} = await this.$http.get('categories', { params: {type: 2} });
            if(res.meta.status !== 200){
                return this.$message.error('获取父级分类数据失败！');
            }
            // console.log(res);
            
            this.ParentCateList = res.data;
            console.log(this.ParentCateList);
            
        },

        // 级联选择器的选择项发生变化时触发的函数
        parentCateChanged() {
            console.log(this.selectedKeys);
            // 有选中的父级分类ID
            if(this.selectedKeys.length > 0){
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
                this.addCateForm.cat_level = this.selectedKeys.length;
                
                return;
            }else{
                // 没有选中的父级分类ID，自成父级
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
            }
            
        },
        // 监听添加分类对话框的关闭事件
        addCateDialogClosed() {
            // 重置表单
            this.$refs.addCateFormRef.resetFields();
            this.selectedKeys = [];
            this.addCateForm.cat_pid = 0;
            this.addCateForm.cat_level = 0;
        },
        // 添加分类
        addCate() {
            // 先进行预校验
            this.$refs.addCateFormRef.validate(async valid => {
                if(!valid){
                    return;
                }
                // 发送请求
                const {data: res} = await this.$http.post('categories', this.addCateForm);
                if(res.meta.status !== 201){
                    return this.$message.error('添加分类失败！');
                }
                this.$message.success('添加分类成功！');
                this.getCateList();
                this.addCateDialogVisible = false;
            })
            // console.log(this.addCateForm);
        },

        // 展示修改分类对话框
        async showEditCateDialog(id) {
            // 一点击展示对话框即获取父级分类数据
            this.getParentCateList();

            const {data: res} = await this.$http.get('categories/' + id);
            if(res.meta.status !== 200){
                return;
            }
            this.editCateForm = res.data;
            console.log(this.editCateForm);
            
            this.editCateDialogVisible = true;
        },
        editCateDialogClosed() {
            // 重置表单
            this.$refs.editCateFormRef.resetFields();
        },
        // 修改分类
        editCate() {
            this.$refs.editCateFormRef.validate(async valid => {
                if(!valid){
                    return;
                }
                const {data: res} = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name });
                if(res.meta.status !== 200){
                    return this.$message.error('修改分类数据失败！');
                }
                this.getCateList();
                this.editCateDialogVisible = false;
            })
        },
        // 展示删除分类弹框并删除指定分类
        async showDeleteDialog(id) {
            const confirmResult = await this.$confirm('确定删除该商品分类吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err);

            if(confirmResult !== 'confirm'){
                return;
            }

            // 发送删除请求
            const {data: res} = await this.$http.delete('categories/' + id);
            if(res.meta.status !== 200){
                return this.$message.error('删除分类失败！');
            }
            this.$message.success('删除分类成功！');
            // 重新渲染分类列表
            this.getCateList();
        }
    }
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
.el-cascader {
    width: 100%;  
}

</style>