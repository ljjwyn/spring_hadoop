/**
 * NG控制器 distributedClusteringCtrl.js 2018-07-26 15:19
 * 
 * @author Wang Xiaodong
 */
indexApp
		.controller(
				'dataComputingCtrl',
				function($scope, $http, $timeout) {

                    /**
					 * 数据库信息
                     */
                    $scope.dbInfoList = [];
					$scope.dbNameList = [];

                    $scope.selectedDatabaseIndex = 0;
                    $scope.selectedDatabase = $scope.dbNameList[0];
                    $scope.primaryKey = 'id';
                    $scope.tableMeta = {};

					/**
					 * 任务配置对象
					 */
					$scope.taskConfig = {
						taskId : null,
						taskName : "计算任务",
						description : "创建基于公式和规则的数据计算任务。",
						creator : "lijiajie",
						createTime : null,
						finishTime : null,
						dbName : null,
						tableName : null,
						formula : null,
						rules : null,
						taskTableName : null,
						taskGlobalTableName : null,
						taskProgressRate: null
					};

                    /**
                     * 连接主题表库
                     */
                    var nonevalue={};
                    $scope.createSubjectDescription = function() {
                        $http({
                            method : 'POST',
                            headers : {
                                'Content-Type' : 'application/json',
                            },
                            url : 'gettargetdescription',
                            data : nonevalue,

                        }).then(function(resp, status) {
                            $scope.result = resp.data["result"];
                            console.log(resp.data);
                            $scope.status = status;
                            $scope.dbInfoList=$scope.result;

                        }, function(resp, status) {
                            $scope.resp = resp;
                            $scope.status = status;
                        });
                    }

                    $scope.createSubjectId = function() {
                        $http({
                            method : 'POST',
                            headers : {
                                'Content-Type' : 'application/json',
                            },
                            url : 'gettargetid',
                            data : nonevalue,

                        }).then(function(resp, status) {
                            $scope.result = resp.data["result"];
                            console.log(resp.data);
                            $scope.status = status;
                            $scope.dbNameList=$scope.result;

                        }, function(resp, status) {
                            $scope.resp = resp;
                            $scope.status = status;
                        });
                    }

                    $scope.createSubjectDescription();
                    $scope.createSubjectId();


					/**
					 * 创建新计算任务
					 */
					$scope.apiCreateTask = 'cal/config';
					$scope.flagTag = 0;
					var rulaFlag = 0;
					var formulaFlag = 1;
					var sym = "";

                    $scope.textareaStartPos = 0;
                    $scope.textareaEndPos = 0;
                    $scope.getCurrentPos = function (e) {
                        var field = e.target;
                        $scope.textareaStartPos = field.selectionEnd;
                        /* 插入时 不使用插入值替换选中区域，仅从光标终止处插入字符
                            $scope.textareaStartPos = field.selectionStart;
                        */
                        $scope.textareaEndPos = field.selectionEnd;
                        // console.log("start", $scope.textareaStartPos);
                        // console.log("end", $scope.textareaEndPos);
                    }
                    $scope.movePosToEnd = function () {
                        if (rulaFlag == 0 && formulaFlag == 1){
                            $scope.textareaStartPos = $scope.formula1.length;
                            $scope.textareaEndPos = $scope.formula1.length;
                        }else if(rulaFlag == 1 && formulaFlag == 0){
                            $scope.textareaStartPos = $scope.rula.length;
                            $scope.textareaEndPos = $scope.rula.length;
                        }
                    }


                    /**
                     * 封装公式和规则
                     */

					$scope.packageJson = function (sym) {

                        var start = $scope.textareaStartPos;
                        var end = $scope.textareaEndPos;
                        if (sym != "\n") {
                            sym = sym + " ";
                        }
                        if (rulaFlag == 0 && formulaFlag == 1) {
                            if ($scope.formula1.slice((start-1)>0 ? (start-1): 0, start) != " ") {
                                sym = " " + sym;
                            }
                            $scope.formula1 = $scope.formula1.slice(0, start) + sym + $scope.formula1.slice(end);
                        } else if (rulaFlag == 1 && formulaFlag == 0) {
                            if ($scope.rula.slice((start-1)>0 ? (start-1): 0, start) != " ") {
                                sym = " " + sym;
                            }
                            $scope.rula = $scope.rula.slice(0, start) + sym + $scope.rula.slice(end);
                        }
                        $scope.movePosToEnd();
                        console.log("formula", $scope.formula1);
                        console.log("rula", $scope.rula);
                    }

                    $scope.updateSubject = function(flags, id, type) {
                        var start = $scope.textareaStartPos;
                        var end = $scope.textareaEndPos;

                        if (rulaFlag == 0){
                            if (flags == '1'){
                                if ($scope.formula1.slice((start-1)>0 ? (start-1): 0, start) != " ") {
                                    id = " " + id;
                                }
                                $scope.formula1 = $scope.formula1.slice(0, start) + id + " " + $scope.formula1.slice(end);
                            }
                            else{
                                $scope.formula1 = $scope.formula1.replace(id,'');
                            }
                        }else{
                            if (flags == '1'){
                                if ($scope.rula.slice((start-1)>0 ? (start-1): 0, start) != " ") {
                                    id = " " + id;
                                }
                                $scope.rula = $scope.rula.slice(0, start) + id + " " + $scope.rula.slice(end);
                            }
                            else{
                                $scope.rula = $scope.rula.replace(id,'');
                            }
                        }
                        $scope.movePosToEnd();
                    }

                    $scope.addSpace = function () {
                        var formula1str = $scope.formula1;
                        if (formula1str != ""
                            && formula1str.charAt(formula1str.length-1) != " "
                            && formula1str.charAt(formula1str.length-1) != "\n") {
                            $scope.formula1 = $scope.formula1 + " ";
                        }
                        var rulaStr = $scope.rula;
                        if (rulaStr != ""
                            && rulaStr.charAt(rulaStr.length-1) != " "
                            && rulaStr.charAt(rulaStr.length-1) != "\n") {
                            $scope.rula = $scope.rula + " ";
                        }
                    }


                    $scope.rula = ""
                    $scope.rulaInput = function() {
                        if (formulaFlag == 1 && rulaFlag == 0) {
                            rulaFlag = 1;
                            formulaFlag = 0;
                            $scope.movePosToEnd();
                        }
                        $scope.addSpace();
                    }

                    $scope.formulaInput = function() {
                        if (formulaFlag == 0 && rulaFlag == 1) {
                            rulaFlag = 0;
                            formulaFlag = 1;
                            $scope.movePosToEnd();
                        }
                    	$scope.addSpace();
                    }
                    $scope.formula1 = "";

                    /**
                     * 创建任务
                     */
                    $scope.submitJson = function() {
                    	$scope.taskConfig["formula"] = $scope.formula1;
                    	$scope.taskConfig["rules"] = $scope.rula;
                    	$scope.taskConfig["tableName"] = $scope.currentMySQLTable;
                    	//$scope.taskConfig["dbName"] = "jck_basic_db";
                    	//console.log("sub_dbNameList",$scope.dbNameList[parseInt($scope.selectedDatabaseIndex)]);
                    	$scope.taskConfig["dbName"] = $scope.dbNameList[parseInt($scope.selectedDatabaseIndex)];
                    	$scope.taskToken01 = true;
                    	$scope.taskToken02 = true;
                    	$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : 'cal/config',
							data : $scope.taskConfig,

						}).then(function(resp, status) {
							$scope.result = resp.data["result"];
							$scope.taskConfig.taskId = resp.data["taskId"];
							console.log(resp.data.taskId);
							$scope.status = status;
                            swal({
                                title: '创建成功！',
                                timer: 2000
                            })

						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
                    }

                    /**
					 * 切换数据库或表时，清空已输入的公式和规则
                     */
                    $scope.clearFormulaAndRula = function () {
						$scope.formula1 = "";
						$scope.rula = "";
                    }


					/**
					 * 界面视图组件可见性设置
					 */
					$scope.mysqlDbInfoVisible = false;
					$scope.mysqlDbTableInfoVisible = false;
					$scope.sqlUserDefinedTableDataVisible = false;
					$scope.progressBarVisible = false;

					/**
					 * MySQL数据源配置对象
					 */
                    var mysqlConfig = $scope.mysqlConfig = {
                        ip : "127.0.0.1",
                        port : "3306",
                        dbName : $scope.selectedDatabase,
                        username : "root",
                        password : "root"
                    };



					/**
					 * 连接MySQL数据库
					 */
					$scope.connectMySQL = function() {
						$scope.mysqlDbTableInfoVisible = false;
                        $scope.taskConfig.dbName =
                            $scope.mysqlConfig.dbName =
                                $scope.selectedDatabase =
                                    $scope.dbNameList[parseInt($scope.selectedDatabaseIndex)];


						var apiMySQLConnect = 'MySQLManager/mysql/connect';
						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLConnect,
							data : $scope.mysqlConfig,

						}).then(function(resp, status) {
							console.log(resp);
							$scope.logForConnection = resp.data["message"];
						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					}

					/**
					 * 关闭数据库连接（仅仅隐藏相关可视组件）
					 */
					$scope.disconnectMySQL = function() {
						$scope.mysqlDbInfoVisible = false;
						$scope.mysqlDbTableInfoVisible = false;
					}


                    function objKeySort(arys) {
                        var newkey = Object.keys(arys).sort();　　 //
                        var newObj = {};
                        for(var i = 0; i < newkey.length; i++) {
                            newObj[newkey[i]] = arys[newkey[i]];
                        }
                        return newObj;
                    }

					/**
					 * 查询MySQL数据库中所有表
					 */
					var listMySQLTables = $scope.listMySQLTables = function() {
						$scope.mysqlDbInfoVisible = true;
						$scope.selected = [];
						var selectedTags = $scope.selectedTags = [];
						$scope.selectedTagsString = undefined;
						$scope.sqlStatement = undefined;

						var apiMySQLTables = 'MySQLManager/mysql/tables';

						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLTables,
							data : mysqlConfig,
						}).then(function(resp, status) {
							console.log(resp);
							$scope.mysqlTables = resp.data["data"];

                            mysqlConfig.tables = resp.data["data"];
                            $http({
                                method : 'POST',
                                headers : {
                                    'Content-Type' : 'application/json',
                                },
                                url: 'MySQLManager/mysql/tables/comments',
                                data: mysqlConfig,
                            }).then(function(resp, status) {
                                // var a = $scope.tableMeta = Object.assign({}, $scope.tableMeta, resp.data["data"]);
                                var a = $scope.tableMeta = resp.data["data"]
                                $scope.tableMeta = objKeySort(a);
                            }, function(resp, status) {
                                $scope.resp = resp;
                                $scope.status = status;
                            })


						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					}



					$scope.currentMySQLTable = undefined;
					$scope.currentMySQLTableDesc = undefined;

                    /**
                     * 显示表相关信息
                     */
					var showTableInfo = $scope.showTableInfo = function (tableName) {
                        /**
                         * 获取表的列头信息
                         */
                        $http({
                            method : 'POST',
                            headers : {
                                'Content-Type' : 'application/json',
                            },
                            url : 'MySQLManager/mysql/tables/' + tableName + "/comments",
                            data : mysqlConfig,
                        }).then(function(resp, status) {
                            console.log(resp);
                            $scope.currentMySQLTableColumnName = resp.data["data"];
                            var count = 0;
                            var a = $scope.currentMySQLTableColumnName;
                            for (var item in a) {
                                if (count == 0) {
                                    $scope.primaryKey = item;
                                    count++;
                                }
                                if (a[item] == "" || a[item] == null) {
                                    delete a[item];
                                }
                            }

                            $scope.currentMySQLTableColumnName = a;

                            /**
                             * 显示表样例、表结构等信息
                             */
                            getMySQLTableDesc(tableName);
                            getMySQLTableSampleData(tableName);


                        }, function(resp, status) {
                            $scope.resp = resp;
                            $scope.status = status;
                        });
                    };



					/**
					 * 查询MySQL数据库中某表的结构
					 */
					var getMySQLTableDesc = $scope.getMySQLTableDesc = function(
							tableName) {
						$scope.currentMySQLTable = tableName;
						$scope.selected = [];
						var selectedTags = $scope.selectedTags = [];
						$scope.selectedTagsString = undefined;
						$scope.sqlStatement = undefined;
						$scope.sqlUserDefinedTableDataVisible = false;
						$scope.sqlStatement = "SELECT * FROM " + tableName;
						

						var apiMySQLTableDesc = 'MySQLManager/mysql/tables/'
								+ tableName;

						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLTableDesc,
							data : mysqlConfig,
						}).then(function(resp, status) {
							console.log(resp);
                            $scope.mysqlDbTableInfoVisible = true;
							$scope.mysqlTableDesc = resp.data["data"];
							$scope.currentMySQLTableDesc = resp.data["data"];
						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					}

					/**
					 * 查询MySQL数据库中某表查询样例（接口只返回5行样例数据）
					 */
					var getMySQLTableSampleData = $scope.getMySQLTableSampleData = function(
							tableName) {

						var apiMySQLTableSampleData = 'MySQLManager/mysql/select';

						mysqlConfig["sql"] = "SELECT * FROM " + tableName;

						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLTableSampleData,
							data : mysqlConfig,
						}).then(function(resp, status) {
							console.log(resp);
							$scope.mysqlTableSampleData = resp.data["data"];
						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					}




					/**
					 * 基于自定义SQL查询MySQL数据库中某表查询样例（接口只返回5行样例数据）
					 */
					$scope.getMySQLTableSampleDataBySQL = function() {
						var apiMySQLTableSampleData = 'MySQLManager/mysql/select';
                        updateSelected(null, null, null);
                        $scope.sqlUserDefinedTableDataVisible = true;

						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLTableSampleData,
							data : mysqlConfig,
						})
								.then(
										function(resp, status) {
											console.log(resp);
											$scope.mysqlTableSampleDataBySQL = resp.data["data"];
										}, function(resp, status) {
											$scope.resp = resp;
											$scope.status = status;
										});
					}





                });
