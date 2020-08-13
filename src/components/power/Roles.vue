<template>
  <div>
      <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">

                        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop':'', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable>{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <el-row :class="[i2 === 0 ? '':'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable>{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                       
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="showDeleteDialog(scope.row.id)">删除</el-button>
                        <!-- 分配角色按钮 -->
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                        
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加角色的对话框 -->
        <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
               <el-button @click="addDialogVisible = false">取 消</el-button>
               <el-button type="primary" @click="addRole">确 定</el-button>
            </span>    
        </el-dialog>

        <!-- 修改角色的对话框 -->
        <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <!-- 内容主体区域 -->
            <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
               <el-button @click="editDialogVisible = false">取 消</el-button>
               <el-button type="primary" @click="editRole">确 定</el-button>
            </span>    
        </el-dialog>

        <!-- 分配权限对话框 -->
        <el-dialog title="分配角色权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <el-tree :data="rightsList" :props="treeProps" ref="treeRef" show-checkbox node-key="id" default-expand-all :default-checked-keys="defaultKeys"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
  </div>
</template>

<script>
export default {
    created() {
        this.getRolesList();
    },

    data() {
        return {
            // 角色列表数据
            rolesList: [],
            // 控制添加角色对话框的显示与隐藏
            addDialogVisible: false,
            // 添加角色的表单数据
            addForm: {
                roleName: '',
                roleDesc: ''
            },
            // 添加表单的验证规则对象
            addFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ]
            },

            // 控制修改角色对话框的显示与隐藏
            editDialogVisible: false,
            editForm: {},
            // 修改表单的验证规则对象
            editFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ]
            },

            // 控制分配权限对话框的显示与隐藏
            setRightDialogVisible: false,
            // 权限数据
            rightsList: [],
            // 树形控件的属性绑定对象
            treeProps: {
                label: 'authName',
                children: 'children'
            },
            // 默认勾选的数组
            defaultKeys: [],

            // 分配权限的角色ID
            roleId: ''
        }
    },
    
    methods: {
        async getRolesList() {
            const {data: res} = await this.$http.get('roles');
            console.log(res);
             if(res.meta.status !== 200){
                return this.$message.error('获取角色列表数据失败！');
            }
            this.rolesList = res.data;
        },
        // 监听添加角色对话框的关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        // 添加角色
        addRole() {
            // 进行预校验
            // 进行预校验
            this.$refs.addFormRef.validate(async valid => {
                // console.log(valid);
                if(valid){
                    const {data: res} = await this.$http.post('roles', this.addForm);
                    if(res.meta.status !== 201) return;

                    this.addDialogVisible = false;
                    this.getRolesList();
                }
            })
        },

        // 展示修改用户对话框
        async showEditDialog(id) {
            // 根据id查询用户信息
            const {data: res} = await this.$http.get('roles/' + id);
            if(res.meta.status !== 200){
                return this.$message.error('查询角色信息失败！');
            }
            this.editForm = res.data;
            console.log(this.editForm);
            
            this.editDialogVisible = true;
            // console.log(id);
            
        },
        // 监听修改角色对话框的关闭事件
        editDialogClosed() {
            // 重置表单
            this.$refs.editFormRef.resetFields();
        },
        // 修改角色
        editRole() {
            this.$refs.editFormRef.validate(async valid => {
                // console.log(valid);
                if(valid){
                    const {data: res} = await this.$http.put('roles/' + this.editForm.roleId, {roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc});
                    if(res.meta.status !== 200) return this.$message.error('修改数据失败！');

                    this.editDialogVisible = false;
                    this.getRolesList();
                    this.$message.success('修改数据成功！');
                }
            })
        },

        // 展示删除角色弹框并实现删除角色
        async showDeleteDialog(id) {

            // 展示删除角色弹框
            const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err);

            if (confirmResult !== 'confirm') {
                return this.$message.error('取消删除！');
            }

            // 删除角色
            const {data: res} = await this.$http.delete('roles/' + id);
            if(res.meta.status !== 200){
                return this.$message.error('删除角色失败！');
            }

            this.$message.success('删除用户成功！');
            // 重新渲染角色列表
            this.getRolesList();
        },

        // 删除权限
        async removeRightById(role, rightId) {
            const confirmResult = await this.$confirm('确认删除该权限吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err);

            if(confirmResult !== 'confirm'){
                return this.$message.error('取消删除！');
            }

            // 删除角色指定权限
            const {data: res} = await this.$http.delete('roles/' + role.id + '/rights/' + rightId);
            if(res.meta.status !== 200){
                return this.$message.error('删除权限失败！');
            }
            // console.log(res.data);
            
            // this.$message.success('删除权限成功！');
            // 重新渲染： 重新赋值role.children
            role.children = res.data;

        },

        // 展示分配权限对话框
        async showSetRightDialog(role) {

            this.roleId= role.id;

            const {data: res} = await this.$http.get('rights/tree');
            console.log(res);
            
            if(res.meta.status !== 200){
                return this.$message.error('获取权限数据失败！');
            }

            this.rightsList = res.data;
            // 显示对话框
            this.getLeafKeys(role, this.defaultKeys);
            this.setRightDialogVisible = true;

        },

        // 获取默认勾选的数组, 利用递归
        getLeafKeys(node, arr) {
            if(!node.children){
                return arr.push(node.id);
            }

            node.children.forEach(item => {
                this.getLeafKeys(item, arr);
            });
        },

        // 监听分配权限对话框的关闭事件
        setRightDialogClosed() {
            this.defaultKeys = [];
        },
        
        // 点击为角色分配权限
        async allotRights() {
            // 拿到所有选中（包括半选中的）key
            const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()];
            // console.log(keys);

            // 拼接成以，分割的字符串
            const idStr = keys.join(',');

            // 发起角色授权请求
            const {data: res} = await this.$http.post('roles/' + this.roleId +'/rights', {rids: idStr});

            if(res.meta.status !== 200){
                return this.$message.error('更新成功！');
            }
            // 重新渲染列表
            this.getRolesList();
            // 关闭设置权限对话框
            this.setRightDialogVisible = false;
            // console.log(res);
            
            
        }
    }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
// 纵向居中对齐
.vcenter {
    display: flex;
    align-items: center;
}
</style>