/**
 * NG控制器 distributedClusteringCtrl.js 2019/4/29
 * 
 * @author lijiajie
 */
indexApp
		.controller(
				'subjectCtrl',
				function($scope, $http, $timeout,$interval) {
					/**
					 * 定义数据
                     */
					$scope.dbInfoList = [];
					$scope.dbNameList = [];
                    $scope.listItem=[];
                    $scope.listItemSum=[];
					$scope.sourceFieldList = [];
					$scope.sourceKeysList = [];
					$scope.selectedDatabaseIndex = 0;
					$scope.sourceMysqlTable = null;
					$scope.sourceMysqlId = null;
                    $scope.selectedSourceId = $scope.dbNameList[0];
                    $scope.primaryKey = 'id';
                    $scope.targetTableInfoVisible=false;
                    $scope.targetTableInfoVisible1=false;
                    $scope.targetTableInfoVisible2=false;
                    $scope.tableMeta = {};
                    $scope.totalCount=1;
                    $scope.nowCount=0;
                    $scope.vmvalue=0;
                    $scope.finishFlage=null;
					$scope.subjectConfig = {
						subjectSchame : null,
						subjectTable : null,
						subjectDescription : null,
                        subjectTableDescription : null,
                        subjectUUID : null,
						creator : "lijiajie",
						limites : null,
						data : []
					};
					$scope.data = {
						SourceId : null,
						Sourcetable : null,
						field : [],
						keys : [],
					};
                    $scope.ItemData = {
                        SourceId : null,
                        Sourcetable : null,
                        nowField:null,
                        field : null,
                        iskeys : null,
                    };
					var sourceConfig = $scope.sourceConfig = {
                        ip : "127.0.0.1",
                        port : "3306",
                        dbName : "Dataset",
                        username : "root",
                        password : "root",
                        tableName:"datasourceconf",
                        sourceId : $scope.selectedSourceId
                    };
                    var mysqlConfig = $scope.mysqlConfig = {
                        ip : "127.0.0.1",
                        port : "3306",
                        dbName : $scope.selectedDatabase,
                        username : "root",
                        password : "root"
                    };
                    var sourceDBconfig = $scope.sourceDBconfig = {
                        ip : null,
                        port : null,
                        dbName : null,
                        username : null,
                        password : null,
                        sourceName:null,
                        sourceId : null,
                        description:null
                    };
					$scope.createSubjectDescription = function() {
                        $scope.sourceFieldList = [];
                        $scope.sourceKeysList = [];
                        $scope.listItemSum=[];
                        $scope.selectedDatabaseIndex = 0;
                        $scope.sourceMysqlTable = null;
                        $scope.sourceMysqlId = null;
                        $scope.mysqlDbTableInfoVisible = false;
                        $scope.mysqlDbInfoVisible = false;
                        $scope.targetTableInfoVisible=false;
                        $scope.targetTableInfoVisible1=false;
                        $scope.targetTableInfoVisible2=false;
                        $scope.finishFlage=null;
                        $scope.subjectConfig.data=[];
                        $scope.data = {
                            SourceId : null,
                            Sourcetable : null,
                            field : [],
                            keys : [],
                        };
                        $scope.tableMeta = {};
                        $scope.totalCount=1;
                        $scope.nowCount=0;
                        $scope.vmvalue=0;
                        $scope.listItem=[];
                        if(!$scope.subjectConfig.subjectDescription){
                            $scope.subjectConfig.subjectDescription=$scope.subjectConfig.subjectSchame;
						}
                        if(!$scope.subjectConfig.subjectTableDescription){
                            $scope.subjectConfig.subjectTableDescription=$scope.subjectConfig.subjectTable;
                        }
                        console.log($scope.subjectConfig.subjectTableDescription);
                        console.log($scope.subjectConfig.subjectDescription);
						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : 'getsourcedescription',
							data : $scope.subjectConfig,

						}).then(function(resp, status) {
							$scope.result = resp.data["result"];
							console.log(resp.data);
							$scope.status = status;
							$scope.dbInfoList=$scope.result;
                            $scope.createSubjectId();

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
							url : 'getsourceid',
							data : $scope.subjectConfig,

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

                    $scope.getUUID = function() {
                        $http({
                            method : 'POST',
                            headers : {
                                'Content-Type' : 'application/json',
                            },
                            url : 'getuuid',
                            data : $scope.subjectConfig,

                        }).then(function(resp, status) {
                            $scope.result = resp.data["result"];
                            console.log(resp.data);
                            $scope.status = status;
                            $scope.subjectConfig.subjectUUID=$scope.result;

                        }, function(resp, status) {
                            $scope.resp = resp;
                            $scope.status = status;
                        });
                    }

                    $scope.createSubjectDescription();
					$scope.checkflag1=null;
					$scope.checkflag2=null;
					/**
					 * 连接MySQL数据库
					 */
					$scope.connectMySQL = function() {
                        $scope.tableMeta=null;
						$scope.mysqlDbTableInfoVisible = false;
						console.log($scope.dbNameList);
						console.log($scope.selectedDatabaseIndex);
                        $scope.sourceConfig.sourceId =
                            $scope.selectedSourceId =
                                $scope.dbNameList[parseInt($scope.selectedDatabaseIndex)];
                        var apiMySQLConnect = 'connect';
						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLConnect,
							data : sourceConfig,
						}).then(function(resp, status) {
							console.log(resp);
							$scope.sourceDBconfig.description = resp.data["dataSourceDescription"];
							$scope.sourceDBconfig.sourceName = resp.data["dataSourceName"];
							$scope.sourceDBconfig.ip = resp.data["dataSourceUrl"];
							$scope.sourceDBconfig.username = resp.data["dataSourceUserName"];
							$scope.sourceDBconfig.password = resp.data["dataSourceUserPassword"];
							$scope.sourceDBconfig.dbName = resp.data["datasourceDB"];
                            $scope.mysqlConfig.dbName=resp.data["datasourceDB"];
                            $scope.mysqlConfig.ip=resp.data["dataSourceUrl"];
                            $scope.mysqlConfig.port= resp.data["datasourcePort"];
                            $scope.mysqlConfig.username=resp.data["dataSourceUserName"];
                            $scope.mysqlConfig.password=resp.data["dataSourceUserPassword"];
							$scope.sourceDBconfig.port = resp.data["datasourcePort"];
							$scope.sourceDBconfig.sourceId = resp.data["id"];
							console.log($scope.sourceDBconfig);

							listMySQLTables();
						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
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
						console.log($scope.sourceDBconfig);
						console.log($scope.sourceDBconfig.sourceId);
						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : apiMySQLTables,
							data : sourceDBconfig,
						}).then(function(resp, status) {
							console.log(resp);
							$scope.mysqlTables = resp.data["data"];

                            sourceDBconfig.tables = resp.data["data"];
                            $http({
                                method : 'POST',
                                headers : {
                                    'Content-Type' : 'application/json',
                                },
                                url: 'MySQLManager/mysql/tables/comments',
                                data: sourceDBconfig,
                            }).then(function(resp, status) {
                                var a = $scope.tableMeta = Object.assign({}, $scope.tableMeta, resp.data["data"]);
                                $scope.tableMeta = objKeySort(a);
                                console.log(resp);
                                showTableInfo(resp.data["data"][0]);
                            }, function(resp, status) {
                                $scope.resp = resp;
                                $scope.status = status;
                            })


						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					}

					/**
                     * 显示表相关信息
                     */
					var showTableInfo = $scope.showTableInfo = function (tableName) {
                        /**
                         * 获取表的列头信息
                         */
                        console.log(tableName);
                        $scope.sourceMysqlTable=tableName;
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

                    $scope.createTask = function() {
						// 重置Token
						$scope.taskToken01 = false;
						$scope.taskToken02 = false;
                        $scope.taskConfig.portraitSubject = $scope.dbInfoList[$scope.selectedDatabaseIndex];
                        //$scope.dataPrimaryKey = $scope.primaryKey;
                        $scope.taskConfig.dataPrimaryKeyName = $scope.primaryKey;

						$scope.taskConfig.dataTableName = $scope.currentMySQLTable;

						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : $scope.apiCreateTask,
							data : $scope.taskConfig,

						}).then(function(resp, status) {
							$scope.taskConfig.taskId = resp.data;
							console.log(resp.data);
							$scope.status = status;

						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					};

					/**
					 * 生成Token以满足任务创建条件（要求数据集配置和参数配置全部完成后才能点击创建任务按钮）
					 */
					$scope.saveDatasetPath = function() {
						$scope.taskToken01 = true;
					};

					$scope.saveAlgParam = function() {
						$scope.taskToken02 = true;
					};

					/**
					 * 界面视图组件可见性设置
					 */
					$scope.mysqlDbInfoVisible = false;
					$scope.mysqlDbTableInfoVisible = false;
					$scope.sqlUserDefinedTableDataVisible = false;
					$scope.progressBarVisible = false;
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


					$scope.currentMySQLTable = undefined;
					$scope.currentMySQLTableDesc = undefined;
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
					 * 处理字段复选框
					 */
					$scope.selected = [];
					var selectedTags = $scope.selectedTags = [];
					$scope.selectedTagsString = undefined;
                    $scope.selectedMeta = [];
                    $scope.sqlsubject = [];
                    
					var updateSelected = function(action, id, name) {
						$scope.sqlUserDefinedTableDataVisible = false;
						$scope.progressBarValue = 0;
						$scope.flagTag = 1;
						if (action == 'add'
								&& $scope.selected.indexOf(id) == -1) {
							$scope.selected.push(id);
							$scope.selectedTags.push(name);
						}

						if (action == 'remove'
								&& $scope.selected.indexOf(id) != -1) {
							var idx = $scope.selected.indexOf(id);
							$scope.selected.splice(idx, 1);
							$scope.selectedTags.splice(idx, 1);
							
						}
						

						if ($scope.selected.length > 0) {
							$scope.selectedTagsString = $scope.selected.join(', ');
                            mysqlConfig["meta"] = $scope.selectedMeta = $scope.selected.map(function (item) {
                                return $scope.currentMySQLTableColumnName[item] ;
                            });
                            /*
							$scope.selectedTagsString = $scope.selected.reduce(function (p, current) {
                                var comma = ", ";
                                var label = " ";
                                if (p == "") {
                                    comma = " ";
                                }
                                if ($scope.currentMySQLTableColumnName[current] != ""
                                    && $scope.currentMySQLTableColumnName[current] != null ) {
                                    label = " as '" + $scope.currentMySQLTableColumnName[current] +"' ";
                                }
                                return p + comma + current + label;

                            }, "");
                            if ($scope.flagTag == 0){
								$scope.formula1 = $scope.formula1
									+ sym ;
							}
						else{
								$scope.formula1 = $scope.formula1
									+ $scope.selectedTagsString;
							}
                            */
                            mysqlConfig["sql"] = $scope.sqlStatement = "SELECT "
									+ $scope.selectedTagsString + " FROM "
									+ $scope.currentMySQLTable;

						} else {
						    var a = $scope.primaryKey;
                            $scope.selectedMeta = [a];

                            var colStr = "";
                            for (var item in $scope.currentMySQLTableColumnName) {
                                colStr += item + ", ";
                                $scope.selectedMeta.push($scope.currentMySQLTableColumnName[item]);
                            }
                            mysqlConfig["meta"] = $scope.selectedMeta;
                            mysqlConfig["sql"] = $scope.sqlStatement
                                = "SELECT " + colStr.substring(0, colStr.length - 2) + " FROM " + $scope.currentMySQLTable;
                            if(action == 'addPrimaryKey') {
                                colStr = $scope.primaryKey + ", " + colStr;
                                mysqlConfig["sql"] = "SELECT " + colStr.substring(0, colStr.length - 2) + " FROM " + $scope.currentMySQLTable;
                            }
						}
					}

					$scope.deleteItem = function(item){
						for (var i = 0; i < $scope.sourceFieldList.length; i++) {
                			if ($scope.sourceFieldList[i] == item) {
                    			$scope.sqlsubject.splice(i, 1);
                    			$scope.sourceFieldList.splice(i, 1);
                                $scope.listItem.splice(i, 1);
                                console.log("tset:"+$scope.sourceFieldList);
                			}

            			}


					}

                    $scope.deleteItem1 = function(item){
                        for (var i = 0; i < $scope.sourceFieldList.length; i++) {
                            if ($scope.sourceFieldList[i] == item) {
                                $scope.sqlsubject.splice(i, 1);
                                $scope.sourceFieldList.splice(i, 1);
                                $scope.listItem.splice(i, 1);
                                console.log("tset:"+$scope.sourceFieldList);
                            }

                        }


                    }

					var updateSelect = function(flags, id, type) {
						if(flags=='add'){
							var subject = $scope.selectedSourceId+"_"+$scope.currentMySQLTable+"_"+id;
							$scope.sourceFieldList.push(id);
							$scope.sqlsubject.push(subject);
							console.log($scope.sqlsubject);
                            $scope.ItemData={};
                            console.log($scope.sourceFieldList);
                            $scope.ItemData.field=id;
                            $scope.ItemData.nowField=subject;
                            $scope.ItemData.iskeys="no";
                            $scope.ItemData.Sourcetable=$scope.sourceMysqlTable;
                            $scope.ItemData.SourceId=$scope.selectedSourceId;
                            $scope.listItem.push($scope.ItemData);
                            console.log($scope.listItem);
						}
						else{
							$scope.sqlsubject.pop();
							$scope.sourceFieldList.pop();
                            $scope.listItem.pop();
							console.log($scope.sqlsubject);
						}

					}
					$scope.switchTable = function() {
						$scope.mysqlDbInfoVisible = false;
						$scope.mysqlDbTableInfoVisible = false;
						$scope.data={};
                        for(var i=0;i<$scope.listItem.length;i++){
                            $scope.listItemSum.push($scope.listItem[i])
                        }
						console.log($scope.sourceFieldList);
						$scope.data.field=$scope.sourceFieldList;
						$scope.data.keys=$scope.sourceKeysList;
						$scope.data.Sourcetable=$scope.sourceMysqlTable;
						$scope.data.SourceId=$scope.selectedSourceId;
						console.log($scope.data);
						$scope.subjectConfig.data.push($scope.data);
						console.log($scope.subjectConfig);
						$scope.sourceFieldList=[];	
						$scope.sourceKeysList=[];
                        $scope.listItem=[];
						

					}
                    $scope.preCalculate = function() {
                        $http({
                            method : 'POST',
                            headers : {
                                'Content-Type' : 'application/json',
                            },
                            url : 'precalculate',
                            data : $scope.subjectConfig,
                        }).then(function(resp, status) {
                            $scope.result = resp.data["result"];
                            console.log(resp.data);
                            $scope.status = status;
                            $scope.getTotalCount();
                            $scope.createSubjectTable();
                            $scope.checkProcess();

                        }, function(resp, status) {
                            $scope.resp = resp;
                            $scope.status = status;
                        });
                    }
					$scope.createSubjectTable = function() {
                        $scope.mysqlDbTableInfoVisible=false;
						$scope.targetTableInfoVisible=true;
                        $scope.sqlStatement = "SELECT * FROM "
                            + $scope.subjectConfig.subjectTable;
                        $scope.mysqlConfig.ip="127.0.0.1";
                        $scope.mysqlConfig.port="3306";
                        $scope.mysqlConfig.username="root";
                        $scope.mysqlConfig.password="root";
                        console.log($scope.sourceConfig.dbName);
                        $scope.mysqlConfig.dbName=$scope.subjectConfig.subjectSchame;
						$http({
							method : 'POST',
							headers : {
								'Content-Type' : 'application/json',
							},
							url : 'run',
							data : $scope.subjectConfig,
						}).then(function(resp, status) {
							$scope.result = resp.data["result"];
							console.log(resp.data);
							$scope.status = status;
							$scope.finishFlage=$scope.result;

						}, function(resp, status) {
							$scope.resp = resp;
							$scope.status = status;
						});
					}
                    $scope.getTotalCount=function(){
                        $http({
                            method : 'GET',
                            headers : {
                                'Content-Type' : 'application/json',
                            },
                            url : 'getTotalCount',
                        }).then(function(resp, status) {
                            $scope.result = resp.data["count"];
                            console.log(resp.data);
                            $scope.status = status;
                            $scope.totalCount=$scope.result;

                        }, function(resp, status) {
                            $scope.resp = resp;
                            $scope.status = status;
                        });
                    }
                    var check = $scope.check = function() {
                        $http({
                            method : 'GET',
                            headers : {
                                'Content-Type' : 'application/json',
                            },
                            url : 'check',
                        }).then(function(resp, status) {
                            $scope.result = resp.data["rows"];
                            console.log(resp.data);
                            $scope.status = status;
                            $scope.nowCount=$scope.result;

                        }, function(resp, status) {
                            $scope.resp = resp;
                            $scope.status = status;
                        });
                    }
                    $scope.checkProcess = function() {
                        $scope.timer=$interval(function(){
                            $scope.check();
                            $scope.finishedCheck();
                        },1000);
                    }
                    $scope.deleteAll = function() {
                        console.log("listitem",$scope.listItem);
						$scope.listItemSum=[];
                        $scope.listItem=[];
                        $scope.subjectConfig.data=[];
                        console.log("jsondata",$scope.subjectConfig.data);
                    }
                    $scope.finishedCheck = function() {
					    console.log($scope.totalCount);
                        console.log($scope.nowCount);
                        var i =console.log($scope.nowCount);
					    if(parseInt($scope.totalCount)<=parseInt($scope.nowCount)||parseInt($scope.nowCount)==99999){
                            $interval.cancel($scope.timer);
                            $scope.vmvalue=90;
                        }else {
                            $scope.vmvalue=parseInt(((parseInt($scope.nowCount)/parseInt($scope.totalCount))*100)*0.9);
                            console.log($scope.vmvalue);
						}
						if($scope.finishFlage=='true'){
                            $scope.vmvalue=100;
                            $scope.targetTableInfoVisible2=true;
						}

                    }

					
					$scope.updateSubject = function(flags, id, type) {
						if (rulaFlag == 0){
							if (flags == '1'){
								$scope.formula1 = $scope.formula1
										+ id;
							}
							else{
								$scope.formula1 = $scope.formula1.replace(id,'');
							}
						}else{
							if (flags == '1'){
								$scope.rula = $scope.rula
										+ id;
							}
							else{
								$scope.rula = $scope.rula.replace(id,'');
							}
						}
					}

					$scope.updateSelection = function($event, id, type) {
						$scope.checkflag1="1";
                        console.log("event", $event);
                        if (type == 'primaryKey'){
                        }
                        else if (type == "selected"){
                            var checkbox = $event.target;
                            var action = (checkbox.checked ? 'add' : 'remove');
                            updateSelected(action, id, checkbox.name);
                            updateSelect(action, id, checkbox.name);
                        }

					}

					$scope.updateKeys = function($event, id) {
                        console.log("event", id);
                        $scope.checkflag2="1";
                        var checkbox = $event.target;
                        var action = (checkbox.checked ? 'add' : 'remove');
                        if(action=='add'){
                        	$scope.sourceKeysList.push(id);
							console.log(id);
                            console.log($scope.listItem);
                            for(var item in $scope.listItem){
                            	if($scope.listItem[item].field==id){
                                    $scope.listItem[item].iskeys="yes";
								}
							}
						}
						else{
							$scope.sourceKeysList.pop();
							console.log($scope.sourceKeysList);
                            for(var item in $scope.listItem){
                                if($scope.listItem[item].field==id){
                                    $scope.listItem[item].iskeys="no";
                                }
                            }
						}
                        

					}

					$scope.isSelected = function(id) {
						return $scope.selected.indexOf(id) >=0;

					}
/*					$scope.initPrimaryKey = function (a) {
                        $scope.primaryKey = a;
                    }
*/                   $scope.isPrimaryKey = function(v) {
					    var pk = $scope.primaryKey;
					    if (pk == v) {
					        return 'checked';
                        }
                        else {
					        return 'false';
                        }
                    }
                    /**
					 * 封装公式和规则
					 */


                    $scope.getTargetMySQLTableSampleData = function() {
                        var apiMySQLTableSampleData = 'MySQLManager/mysql/select';
                        updateSelected(null, null, null);
                        $scope.targetTableInfoVisible1=true;
                        mysqlConfig["sql"] = $scope.sqlStatement = "SELECT * FROM "
                            + $scope.subjectConfig.subjectTable;
                        mysqlConfig["dbName"]=$scope.subjectConfig.subjectSchame;
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
					/**
					 * 基于自定义SQL查询MySQL数据库中某表查询样例（接口只返回5行样例数据）
					 *
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

					/**
					 * 设置数据导出进度条初始值
					 */
					$scope.progressBarValue = 0;

					/**
					 * 导出MySQL数据到HDFS（用Sqoop）
					 */
					$scope.btnExportDataToHDFSDisable = false;

					var exportMySQLTableDataToHDFS = $scope.exportMySQLTableDataToHDFS = function() {

						$scope.btnExportDataToHDFSDisable = true;
						$timeout(function() {
							$scope.btnExportDataToHDFSDisable = false;
						}, 5000);

						$scope.progressBarVisible = true;
						var apiMySQLTableSampleData = '/MySQLManager/mysql/mysql2hdfs';

                        var sql = $scope.sqlStatement;

                        mysqlConfig["sql"] = "SELECT " + $scope.primaryKey + ", " + sql.substring(6, sql.length);

                        var timestamp = new Date().getTime();

						// 用时间戳构造数据集存储目录
						var datasetPath = mysqlConfig["outputDirectory"] = "/user/hadoop/sqoop-job/dataset-"
								+ timestamp;

						$scope.taskConfig.datasetPath = "hdfs://master:9000" + datasetPath;

						$scope.mysqlConfig.meta = $scope.selectedMeta;

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
                                    console.log(resp.data);
                                    $scope.taskConfig.datasetPath = "hdfs://master:9000" + datasetPath;

                                }, function(resp, status) {
                                    $scope.resp = resp;
                                    $scope.status = status;
                                });
					}


					$scope.getOutputProgress = function (datasetPath) {
                        $http({
                            method : 'POST',
                            headers : {
                                'Content-Type' : 'application/json',
                            },
                            url : '/MySQLManager/mysql/mysql2hdfs/progress',
                            data : {"outputDirectory": $scope.taskConfig.datasetPath},
                        }).then(function(resp, status){

                            if (resp.data.progress == "导出成功"){
                                $scope.progressBarValue = 100;
                                $scope.progressStatus = "完成";
                            }
                            else {
                                if (resp.data.progress.indexOf("%")!=-1 ){
                                    var progress = resp.data.progress.substring(0, resp.data.progress.length-1);
                                    $scope.progressBarValue = parseFloat(progress);
                                }
                                $scope.progressBarValue = 10;
                                $scope.progressStatus = resp.data.progress;
                            }
                        },function(resp, status) {
                            $scope.resp = resp;
                            $scope.status = status;
                        })

                    }


				});
