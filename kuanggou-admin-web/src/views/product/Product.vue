<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" placeholder="关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getProducts">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleViewProperties">显示属性</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSkuProperties">SKU属性</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleOnSale">上架</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleOffSale">下架</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <el-table :data="products" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="50">
            </el-table-column>
            <el-table-column prop="name" label="标题" width="150" sortable>
            </el-table-column>
            <el-table-column prop="subName" label="副标题" width="120" sortable>
            </el-table-column>
            <el-table-column prop="productType.name" label="商品类型" width="120" sortable>
            </el-table-column>
            <el-table-column prop="brand.name" label="品牌" width="120" sortable>
            </el-table-column>
            <el-table-column prop="onSaleTime" label="上架时间" width="110" sortable :formatter="formatOnSaleTime">
            </el-table-column>
            <el-table-column prop="offSaleTime" label="下架时间" width="110" sortable :formatter="formatOffSaleTime">
            </el-table-column>
            <el-table-column prop="state" label="状态" min-width="100" sortable>
                <template scope="scope">
                    <span style="color: green" v-if="scope.row.state==1">上架</span>
                    <span style="color: red" v-else>下架</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="rows" :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="标题" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="副标题" prop="subName">
                        <el-input v-model="addForm.subName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品类型">
                    <el-cascader
                            v-model="addForm.productTypes"
                            :change-on-select="true"
                            :options="producttypes"
                            :show-all-levels="false"
                            :props="defaultParams">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="品牌">
                    <el-select v-model="addForm.brandId" clearable placeholder="请选择品牌">
                        <el-option
                                v-for="item in brands"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="媒体属性">
                    <el-upload
                            class="upload-demo"
                            action="http://127.0.0.1:9527/services/common/file"
                            list-type="picture"
                            :on-success="handleSuccess"
                            :file-list="fileList">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="商品描述">
                    <el-input type="textarea" v-model="addForm.ext.description" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品详情">
                    <quill-editor
                            ref="QuillEditor"
                            v-model="addForm.ext.richContent"
                    ></quill-editor>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="标题" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="副标题" prop="subName">
                    <el-input v-model="addForm.subName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品类型">
                    <!--<el-input v-model="addForm.productTypeId" auto-complete="off"></el-input>-->
                    <el-cascader
                            v-model="addForm.productTypes"
                            :change-on-select="true"
                            :options="producttypes"
                            :show-all-levels="false"
                            :props="defaultParams">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="品牌">
                    <!--<el-input v-model="addForm.brandId" auto-complete="off"></el-input>-->
                    <el-select v-model="addForm.brandId" clearable placeholder="请选择品牌">
                        <el-option
                                v-for="item in brands"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="媒体属性">
                    <!--<el-input v-model="addForm.medias" auto-complete="off"></el-input>-->
                    <el-upload
                            class="upload-demo"
                            action="http://127.0.0.1:9527/services/common/file"
                            list-type="picture"
                            :on-success="handleSuccess"
                            :file-list="fileList">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="商品描述">
                    <el-input type="textarea" v-model="addForm.ext.description" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品详情">
                    <quill-editor
                            ref="QuillEditor"
                            v-model="addForm.ext.richContent"
                    ></quill-editor>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>


        <!--显示属性维护-->
        <el-dialog size="tiny" title="显示属性" v-model="viewPropertiesDialogVisible" :close-on-click-modal="false">

            <el-form label-width="80px">
                <el-form-item v-for="viewProperty in viewProperties" :label="viewProperty.specName">
                    <el-input v-model="viewProperty.value" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click.native="viewPropertiesDialogVisible = false">取消</el-button>
                <el-button type="primary" @click.native="handleSaveViewProperties">提交</el-button>
            </div>
        </el-dialog>

        <!--SKU属性维护-->
        <el-dialog title="SKU属性" v-model="skuPropertiesDialogVisible" :close-on-click-modal="false">

            <el-card class="box-card" v-for="(skuProperty,i) in skuProperties">
                <div slot="header" class="clearfix">
                    <span style="line-height: 36px;">{{skuProperty.specName}}</span>
                </div>
                <div v-for="index in skuProperty.options.length+1" class="text item">
                    <el-row>
                        <el-col :span="18">
                            <el-input v-model="skuProperty.options[index-1]" auto-complete="off"></el-input>
                        </el-col>
                        <el-col :span="6">
                            <el-button @click="removeProperty(i,index-1)">删除</el-button>
                        </el-col>
                    </el-row>
                </div>
            </el-card>

            <el-table :data="skus" highlight-current-row style="width: 100%;">
                <!--sku的属性-->
                <el-table-column v-if="key!='price'&&key!='store'&&key!='indexs'" v-for="(value,key) in skus[0]" :label="key" :prop="key">
                </el-table-column>
                <!--price和store-->
                <el-table-column v-if="(key=='price'||key=='store')&&key!='indexs'" v-for="(value,key) in skus[0]" :label="key" :prop="key">
                    <template scope="scope">
                        <el-input v-model="scope.row[key]" auto-complete="false"/>
                    </template>
                </el-table-column>

            </el-table>

            <div slot="footer" class="dialog-footer">
                <el-button @click.native="skuPropertiesDialogVisible = false">取消</el-button>
                <el-button type="primary" @click.native="handleSaveSkuProperties">提交</el-button>
            </div>
        </el-dialog>

    </section>
</template>

<script>
    import util from '../../common/js/util'
    //import NProgress from 'nprogress'
    import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';

    export default {
        data() {
            return {
                //显示属性
                viewProperties: [],
                //sku属性
                skuProperties: [],
                //sku
                skus: [],
                //显示属性维护的模态框
                viewPropertiesDialogVisible: false,
                skuPropertiesDialogVisible: false,

                fileList: [],
                brands: [],
                defaultParams: {
                    label: 'name',
                    value: 'id',
                    children: 'children'
                },
                producttypes: [],
                filters: {
                    keyword: ''
                },
                products: [],
                total: 0,
                page: 1,
                rows: 10,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                editForm: {
                    name: '',
                    subName: '',
                    productTypeId: null,
                    brandId: null,
                    medias: '',
                    productTypes: [],
                    ext: {
                        description: '',
                        richContent: ''
                    }
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        {required: true, message: '请输入标题', trigger: 'blur'}
                    ],
                    subName: [
                        {required: true, message: '请输入副标题', trigger: 'blur'}
                    ]
                },
                //新增界面数据
                addForm: {
                    name: '',
                    subName: '',
                    productTypeId: null,
                    brandId: null,
                    medias: '',
                    productTypes: [],
                    ext: {
                        description: '',
                        richContent: ''
                    }
                }

            }
        },
        methods: {
            //删除sku属性选项
            removeProperty(index1, index2) {
                //index1 第几个sku属性
                //index2  属性的第几个选项
                this.skuProperties[index1].options.splice(index2, 1);
            },
            //文件上传成功后的钩子函数
            handleSuccess(response, file, fileList) {
                let {success, message, restObj} = response;
                if (success) {
                    this.addForm.logo = restObj;
                    this.$message({
                        message: '上传成功',
                        type: 'success'
                    });
                } else {
                    this.$message({
                        message: message,
                        type: 'error'
                    });
                }
                this.fileList = fileList;
            },
            getBrands() {
                this.$http.get("/product/brand/list")
                    .then(res => {
                        this.brands = res.data;
                    })
            },
            getTreeData(data) {
                // 循环遍历json数据
                for (var i = 0; i < data.length; i++) {
                    if (data[i].children.length < 1) {
                        // children若为空数组，则将children设为undefined
                        data[i].children = undefined;
                    } else {
                        // children若不为空数组，则继续 递归调用 本方法
                        this.getTreeData(data[i].children);
                    }
                }
                return data;
            },
            //下拉框加载商品类型
            loadTypeTree() {
                this.$http.get("/product/productType/loadTypeTree")
                    .then(res => {
                        console.debug(res);
                        this.producttypes = this.getTreeData(res.data);
                    })
            },
            //显示属性维护
            handleViewProperties() {

                //只能选中一行数据
                if (this.sels.length == 0) {
                    this.$message({
                        message: '请选中一行数据',
                        type: 'warning'
                    });
                    return;
                }
                if (this.sels.length > 1) {
                    this.$message({
                        message: '只能选中一行数据',
                        type: 'warning'
                    });
                    return;
                }

                let productId = this.sels[0].id;

                //查询要维护商品的显示属性
                this.$http.get("/product/product/viewProperties/" + productId)
                    .then(res => {
                        this.viewProperties = res.data;
                    })
                //打开模态框
                this.viewPropertiesDialogVisible = true;
            },
            //显示属性保存
            handleSaveViewProperties() {

                let productId = this.sels[0].id;

                this.$confirm('确认保存吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.post("/product/product/updateViewProperties?productId=" + productId, this.viewProperties)
                        .then(res => {
                            let {success, message, restObj} = res.data;
                            if (success) {
                                this.$message({
                                    message: '保存成功!',
                                    type: 'success'
                                });
                                this.viewPropertiesDialogVisible = false;
                            } else {
                                this.$message({
                                    message: message,
                                    type: 'error'
                                });
                            }
                        })
                }).catch(() => {

                });
            },
            //sku属性维护
            handleSkuProperties() {

                //只能选中一行数据
                if (this.sels.length == 0) {
                    this.$message({
                        message: '请选中一行数据',
                        type: 'warning'
                    });
                    return;
                }
                if (this.sels.length > 1) {
                    this.$message({
                        message: '只能选中一行数据',
                        type: 'warning'
                    });
                    return;
                }

                let productId = this.sels[0].id;
                //查询要维护商品的sku属性
                this.$http.get("/product/product/skuProperties/" + productId)
                    .then(res => {
                        this.skuProperties = res.data;
                    })

                //打开模态框
                this.skuPropertiesDialogVisible = true;
            },
            //sku属性保存
            handleSaveSkuProperties() {

                let productId = this.sels[0].id;

                let param = {};

                param.skuProperties = this.skuProperties;
                param.skus = this.skus;

                this.$confirm('确认保存吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.post("/product/product/updateSkuProperties?productId=" + productId, param)
                        .then(res => {
                            let {success, message, restObj} = res.data;
                            if (success) {
                                this.$message({
                                    message: '保存成功!',
                                    type: 'success'
                                });
                                this.skuPropertiesDialogVisible = false;
                            } else {
                                this.$message({
                                    message: message,
                                    type: 'error'
                                });
                            }
                        })
                }).catch(() => {

                });
            },
            //上架
            handleOnSale() {
                let offSale = '';
                for(let index = 0;index <this.sels.length;index++){
                    if (this.sels[index].state==0){
                        offSale += this.sels[index].name + ",";
                    }
                }
                let offSales = offSale.substring(0,offSale.length-1);
                if (offSales != ''){
                    this.$message({
                        message: '该商品以上架，不能重复上架！',
                        type: 'warning'
                    });
                    return;
                }

                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认上架选中吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    this.$http.get("/product/product/onSale?ids=" + ids)
                        .then(res => {
                            this.listLoading = false;
                            let {success, message, resultObj} = res.data;
                            if (success) {
                                this.$message({
                                    message: '上架成功',
                                    type: 'success'
                                });
                                this.getProducts();
                            } else {
                                this.$message({
                                    message: message,
                                    type: 'error'
                                });
                            }
                        })
                }).catch(() => {});
            },
            //下架
            handleOffSale() {
                let offSale = '';
                for(let index = 0;index <this.sels.length;index++){
                    if (this.sels[index].state==0){
                        offSale += this.sels[index].name + ",";
                    }
                }
                let offSales = offSale.substring(0,offSale.length-1);
                if (offSales != ''){
                    this.$message({
                        message: '该商品以下架，不能重复下架！',
                        type: 'warning'
                    });
                    return;
                }
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认下架选中吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    this.$http.get("/product/product/offSale?ids=" + ids)
                        .then(res => {
                            this.listLoading = false;
                            let {success, message, resultObj} = res.data;
                            if (success) {
                                this.$message({
                                    message: '下架成功',
                                    type: 'success'
                                });
                                this.getProducts();
                            } else {
                                this.$message({
                                    message: message,
                                    type: 'error'
                                });
                            }
                        })
                }).catch(() => {});
            },
            //格式化时间
            formatOnSaleTime(row, column) {
                return this.formatTime(row.onSaleTime)
            },
            formatOffSaleTime(row, column) {
                return this.formatTime(row.offSaleTime)
            },
            formatTime(time) {
                if (!time) {
                    return null;
                }
                let date = new Date(time);
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                let day = date.getDate();//获取一个月中的第几天
                let hour = date.getHours();
                let minute = date.getMinutes();
                let second = date.getSeconds();
                let timeStr = year + "-" + this.formatTimeNum(month) + "-" + this.formatTimeNum(day)
                    + " " + this.formatTimeNum(hour) + ":" + this.formatTimeNum(minute) + ":" + this.formatTimeNum(second);

                return timeStr;
            },
            formatTimeNum(num) {
                if (num >= 10) {
                    return num;
                }
                return "0" + num;
            },
            //性别显示转换
            formatSex: function (row, column) {
                return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getProducts();
            },
            //获取商品列表
            getProducts() {
                let para = {
                    page: this.page,
                    rows: this.rows,
                    keyword: this.filters.keyword
                };
                this.listLoading = true;
                //NProgress.start();
                this.$http.post("/product/product/json", para)
                    .then(res => {
                        this.listLoading = false;
                        let {total, rows} = res.data;
                        this.total = total;
                        this.products = rows;
                    })
            },
            //删除
            handleDel: function (index, row) {
                if (row.state==1){
                    this.$message({
                        message: '该商品未下架，不能删除！',
                        type: 'success'
                    });
                    return;
                }
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;

                    this.$http.delete("/product/product/delete/" + row.id)
                        .then(res => {
                            this.listLoading = false;
                            let {success, message, restObj} = res.data;
                            if (success) {
                                this.$message({
                                    message: '删除成功',
                                    type: 'success'
                                });
                                this.getProducts();
                            } else {
                                this.$message({
                                    message: 'message',
                                    type: 'error'
                                });
                            }
                        });
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;
                this.editForm = Object.assign({}, row);
            },
            //显示新增界面
            handleAdd: function () {
                this.addFormVisible = true;
                this.addForm = {
                    name: '',
                    subName: '',
                    productTypeId: null,
                    brandId: null,
                    medias: '',
                    productTypes: [],
                    ext: {
                        description: '',
                        richContent: ''
                    }
                };
            },
            //编辑
            editSubmit: function () {
                if (row.state==1){
                    this.$message({
                        message: '该商品未下架，不能编辑！',
                        type: 'success'
                    });
                    return;
                }
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.editForm);
                            this.$http.post("/product/brand/add", para)
                                .then(res => {
                                    this.addLoading = false;
                                    let {success, message} = res.data;
                                    //NProgress.done();
                                    if (success) {
                                        this.$message({
                                            message: 'message',
                                            type: 'success'
                                        });
                                        this.$refs['editForm'].resetFields();
                                        this.editFormVisible = false;
                                        this.getbrands();
                                    } else {
                                        this.$message({
                                            message: 'message',
                                            type: 'error'
                                        });
                                    }
                                })
                        });
                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.addForm);
                            //参数的封装
                            para.productTypeId = this.addForm.productTypes[this.addForm.productTypes.length - 1]  //[1,2,3]
                            //从fileList中获取文件路径用，拼接给medias赋值
                            para.medias = this.fileList.map(file => file.response.restObj).join(",");

                            this.$http.post("/product/product/add", para)
                                .then(res => {
                                    this.addLoading = false;
                                    let {success, message, restObj} = res.data;
                                    if (success) {
                                        this.$message({
                                            message: '提交成功',
                                            type: 'success'
                                        });
                                        this.$refs['addForm'].resetFields();
                                        this.addFormVisible = false;
                                        this.getProducts();
                                    } else {
                                        this.$message({
                                            message: message,
                                            type: 'error'
                                        });
                                    }
                                })
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    this.$http.delete("/product/product/deleteBatch?ids=" + ids)
                        .then(res => {
                            this.listLoading = false;
                            let {success, message, resultObj} = res.data;
                            if (success) {
                                this.$message({
                                    message: '删除成功',
                                    type: 'success'
                                });
                                this.getProducts();
                            } else {
                                this.$message({
                                    message: 'message',
                                    type: 'error'
                                });
                            }
                        })
                }).catch(() => {});
            }
        },
        mounted(){
            this.getProducts();
            this.loadTypeTree();
            this.getBrands();
        },
        watch:{
            skuProperties:{
                handler(val,oldval){
                    //过滤掉options为空数组的sku属性
                    let skuPropertiesArr = this.skuProperties.filter(e=>e.options.length>0);
                    let result = skuPropertiesArr.reduce((pre,cur,currentIndex)=>{
                        let temp = [];
                        pre.forEach(e1=>{
                            cur.options.forEach((e2,index)=>{
                                let obj = Object.assign({},e1);
                                obj[cur.specName] = e2;

                                //获取上一次的indexs，后面拼接这一次的索引
                                let lastIndexs = obj.indexs;
                                if(!lastIndexs) lastIndexs = "";

                                //判断是否是最后一次reduce
                                if(currentIndex==skuPropertiesArr.length-1){
                                    obj.price = 0;
                                    obj.store = 0;
                                    lastIndexs = lastIndexs+index;
                                }else{
                                    lastIndexs = lastIndexs+index+"_";
                                }
                                obj.indexs = lastIndexs;
                                temp.push(obj);
                            })
                        })
                        return temp;
                    },[{}])
                    this.skus = result;
                    //查询价格
                    this.$http.get("/product/sku/getPrices/" + this.sels[0].id)
                        .then(res=>{
                        let s = res.data;
                        for (let  i=0 ;i<s.length;i++){
                            this.skus[i].price = s[i].price;
                            this.skus[i].store = s[i].availableStock;
                        }
                    })
                },
                deep:true
            }
        }
    }
</script>

<style scoped>

</style>