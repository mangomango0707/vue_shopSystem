<template>
  <div>
      <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加alert提示区域 -->
            <el-row>
                <el-col>
                    <el-alert show-icon title="注意！只允许给三级分类添加参数！" type="warning" :closable="false">
                    </el-alert>
                </el-col>
            </el-row>
            <!-- 添加商品分类级联选择器 -->
            <el-row class="cate_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 级联选择器 -->
                    <!-- options：用来指定数据源 -->
                    <!-- props：用来指定配置对象 -->
                    <el-cascader v-model="selectedKeys" :options="cateList"
                        :props="cascaderProps" clearable @change="handleCateChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- Tab标签切换 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <!-- 添加参数按钮 -->
                    <el-button type="primary" :disabled="isBtnDisable" @click="showAddParamsDialog">添加参数</el-button>
                    <!-- 获取参数列表数据 -->
                    <el-table :data="paramsList" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i, scope.row)">
                                    {{item}}
                                </el-tag>
                                <el-input class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                    >
                                    </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                        <el-table-column label="操作">
                            <!-- 通过作用域插槽渲染操作列 -->
                            <template slot-scope="scope">
                                <!-- 修改按钮 -->
                                <el-button type="primary" icon="el-icon-edit" size="mini"  @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                                <!-- 删除按钮 -->
                                <el-button type="danger" icon="el-icon-delete" size="mini"  @click="showDeleteDialog(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary"  :disabled="isBtnDisable" @click="showAddParamsDialog">添加参数</el-button>
                    <!-- 获取参数列表数据 -->
                    <el-table :data="paramsList" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i, scope.row)">
                                    {{item}}
                                </el-tag>
                                <el-input class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                    >
                                    </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                        <el-table-column label="操作">
                            <!-- 通过作用域插槽渲染操作列 -->
                            <template slot-scope="scope">
                                <!-- 修改按钮 -->
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                                <!-- 删除按钮 -->
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteDialog(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>

            <!-- 添加参数对话框 -->
            <el-dialog :title="'添加' + titleText" :visible.sync="addParamsDialogVisible" width="50%" @close="addParamsDialogClosed">
                <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
                    <el-form-item label="参数名称" prop="attr_name">
                        <el-input v-model="addForm.attr_name"></el-input>
                    </el-form-item>
                </el-form>
                    
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addParamsDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addParams">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 修改参数对话框 -->
            <el-dialog :title="'修改' + titleText" :visible.sync="editParamsDialogVisible" width="50%" @close="editParamsDialogClosed">
                <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
                    <el-form-item label="参数名称" prop="attr_name">
                        <el-input v-model="editForm.attr_name"></el-input>
                    </el-form-item>
                </el-form>
                    
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editParamsDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editParams">确 定</el-button>
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
            // 商品分类数据
            cateList: [],
            // 被选择的项
            selectedKeys: [],
            // 级联选择器的配置对象
            cascaderProps: {
                expandTrigger: "hover",
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            activeName: 'many',
            // 静态属性数据
            onlyParamsData: [],
            // 动态参数数据
            manyParamsData: [],
            // 控制添加参数对话框的显示与隐藏
            addParamsDialogVisible: false,
            // 添加参数的表单数据
            addForm: {
                attr_name: ''
            },
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },

            // 修改
            editParamsDialogVisible: false,
            editForm: {},
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },

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
            console.log(this.selectedKeys);
            this.getParamsList();
        },
        // Tab切换时触发
        handleTabClick() {
            this.getParamsList();
        },
        // 获取参数列表数据
        async getParamsList() {
            if(this.selectedKeys.length !== 3){
                this.selectedKeys = [];
                // 切换分类时，清空表格数据
                this.manyParamsData = [];
                this.onlyParamsData = [];
                return;
            }

            const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, { params: {sel: this.activeName}});
            // console.log(res);
            if(res.meta.status !== 200){
                return this.$message.error('获取参数列表失败！');
            }
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
                // 添加属性，控制文本框的显示与隐藏
                item.inputVisible = false;
                // 文本框中的值
                item.inputValue = '';
            });
            console.log(res);

            if(this.activeName === 'only'){
                this.onlyParamsData = res.data;
            }else{
                this.manyParamsData = res.data;
            }
        },
        // 展示添加参数对话框
        showAddParamsDialog() {
            this.addParamsDialogVisible = true;
        },
        // 监听添加参数对话框的关闭事件
        addParamsDialogClosed() {
            // 重置表单
            this.$refs.addFormRef.resetFields();
        },
        // 添加参数
        addParams() {
            // 先进行预校验
            this.$refs.addFormRef.validate(async valid => {
                if(!valid){
                    return;
                } 
                const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                });
                if(res.meta.status !== 201){
                    return this.$message.error('添加参数失败！');
                }
                this.$message.success('添加参数成功！');
                this.addParamsDialogVisible = false;
                this.getParamsList();
            });
            
        },
        // 展示修改参数对话框
        async showEditDialog(id) {
            // 根据id查询参数信息
            const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, { params: {attr_sel: this.activeName}});
            if(res.meta.status !== 200){
                return this.$message.error('查询参数信息失败！');
            }
            this.editForm = res.data;
            this.editParamsDialogVisible = true;
        },
        // 监听修改参数对话框的关闭事件
        editParamsDialogClosed() {
            // 重置表单
            this.$refs.editFormRef.resetFields();
        },
        // 修改参数
        editParams() {
            // 先进行预校验
            this.$refs.editFormRef.validate(async valid => {
                if(!valid){
                    return;
                }
                const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                });
                if(res.meta.status !== 200){
                    return this.$message.error('更新参数信息失败！');
                }
                this.$message.success('更新参数信息成功！');
                this.getParamsList();
                this.editParamsDialogVisible = false;
            })
        },
        // 删除参数
        async showDeleteDialog(id) {
            const confirmResult = await this.$confirm('确定删除此参数吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err);

            if(confirmResult !== 'confirm'){
                return;
            }

            const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`);
            if(res.meta.status !== 200){
                return this.$message.error('删除参数信息失败！');
            }
            this.$message.success('删除参数信息成功！');
            this.getParamsList();
        },
        // 操作attr参数项，并保存到数据库中
        async saveAttrVals(row) {
            // 发起请求，保存参数
            const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(' ')
            });
            if(res.meta.status !== 200){
                return this.$message.error('更新参数项失败！');
            }
            this.$message.success('更新参数项成功！');
        },
        // 文本框失去焦点或者按下enter时触发的事件
        handleInputConfirm(row) {
            if(row.inputValue.trim()){
                row.attr_vals.push(row.inputValue.trim());
            }
            row.inputVisible = false;
            row.inputValue = '';
            this.saveAttrVals(row);
        },
        // 切换为文本框
        showInput(row) {
            row.inputVisible = true;
            // 让文本框自动获得焦点
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        // 标签关闭,删除参数项
        handleClosed(i, row) {
            row.attr_vals.splice(i, 1);
            this.saveAttrVals(row);
        }
    },
    computed: {
        // 监听按钮是否禁用
        isBtnDisable() {
            if(this.selectedKeys.length === 3){
                return false;
            }
            return true;
        },
        // 当前选中的三级分类的id
        cateId(){
            if(this.selectedKeys.length === 3){
                return this.selectedKeys[2];
            }
            return null;
        },
        paramsList() {
            if(this.activeName === 'only'){
                return this.onlyParamsData;
            }else{
                return this.manyParamsData;
            }
        },
        titleText() {
            if(this.activeName === 'many'){
                return '动态参数';
            }else{
                return '静态参数';
            }
        }
    }
}
</script>

<style lang="less" scoped>
.cate_opt {
    margin: 15px;
}
.el-tag {
    margin: 5px;
}
.input-new-tag {
    width: 120px;
}
</style>