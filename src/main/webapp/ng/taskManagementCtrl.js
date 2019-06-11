/**
 * NG控制器 taskManagementCtrl.js 2018-07-23 22:55
 *
 * @author Wang Xiaodong
 */
var taskManagementFunc = function ($scope, $http) {

    $scope.taskList = [{
        taskId: 'T00001',
        taskName: '测试任务',
        creator: 'dataworker',
    }];

    /**
     * 数据库信息
     */
    $scope.dbInfoList = ["人口库","法人库","证照库","车辆库"];
    $scope.dbNameList = ["source","source","source","source"];

    // 搜索状态
    $scope.searchByTaskId = false;

    // 当前任务
    $scope.currentTask = undefined;

    $scope.startLimit = 0;
    $scope.endLimit = 10;
    $scope.searchParam = "";

    // 查看任务输出按钮禁用，除非该任务执行完成
    $scope.viewTaskBtnStatus = false;

    // 任务输出默认隐藏
    $scope.taskOuputDivVisible = false;


    // 输出数据默认隐藏
    $scope.dataOuputDivVisible = false;



    /**
     * 列出所有分布式聚类任务
     */
    var getAllTasks = $scope.getAllTasks = function () {
        console.log("[INFO] You are getting tasks");
        // 任务输出隐藏
        $scope.taskOuputDivVisible = false;
        // 任务输出可视化隐藏
        $scope.taskChartDivVisible = false;

        $http({
            method: 'GET',
            url: 'task/findAll',
        }).then(function (resp, status) {
            $scope.taskList = resp.data;

            console.log("[INFO] Task list includes: ");
            console.log(resp.data);
            $scope.status = status;
        }, function (resp, status) {
            $scope.resp = resp;
            $scope.status = status;
        });
    };

    /**
     * 显示当前任务信息
     */
    $scope.showTaskInfo = function (task) {
        $scope.currentTask = task;
        $scope.focus = task.taskId;
/*
        if ($scope.currentTask.taskProcessRate == 1) {
            $scope.viewTaskBtnStatus = true;
        }
        else {
            $scope.viewTaskBtnStatus = false;
        }
*/
        // 显示主题库名
        var dbName = $scope.currentTask.databaseName;
        var dbIndex = null;
        for (var i = 0; i < $scope.dbNameList.length; i++) {
            if ($scope.dbNameList[i] == dbName) {
                dbIndex = i;
                break;
            }
        }
        $scope.currentTask.dataBaseSubject = $scope.dbInfoList[dbIndex];


        console.log("[INFO] Current task is " + task.taskId + "#"
            + task.taskName);

        // 任务输出隐藏
        $scope.taskOuputDivVisible = false;

        $scope.viewTaskBtnStatus = true;

    };


    /**
     * 搜索任务
     */
    var searchTask = $scope.searchTask = function () {
        if ($scope.searchParam != "") {
            $scope.currentTask = null;
            $http({
                method: 'GET',
                url: 'task/findBy' + $scope.searchParam,
            }).then(function (resp, status) {
                var list = [];
                console.log("findByresp", resp);
                if (resp.data.result != null) {
                    list.push(resp.data.result);
                }
                $scope.taskList = list;

                console.log("[INFO] Task list includes: ");
                console.log(resp.data);
                $scope.status = status;
            }, function (resp, status) {
                $scope.resp = resp;
                $scope.status = status;
            });
        }
        else {
            getAllTasks();
        }

    };


    /**
     * 删除任务
     *
     */
    $scope.delTask = function (task) {
        console.log("[DELETE TASK] You are deletting the task whose id is "
            + task.taskId);
        swal({
            title: '确认删除该任务',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '删除',
            cancelButtonText: '取消'
        }).then(function(isConfirm) {
            console.log("ic",isConfirm);
            if (isConfirm.value) {
                $http(
                    {
                        method: 'GET',
                        url: 'task/delete' + task.taskId
                    }).then(function (resp, status) {
                    getAllTasks();
                }, function (resp, status) {
                    getAllTasks();
                });
                Swal.fire("删除成功")
            }
        })


    };




    /**
     * 查看任务输出
     */
    var getTaskOutput = $scope.getTaskOutput = function (task) {
        console.log("[GET TASK RESULT] You are getting the task whose id is "
            + task.taskId);


        $http(
            {
                method: 'GET',
                url: 'task/'
                + task.taskId + '/output1?start=' + $scope.startLimit
                + "&end=" + $scope.endLimit
            })
            .then(
                function (resp, status) {

                    // 显示隐藏的任务输出控件
                    $scope.taskOuputDivVisible = true;
                    $scope.output1 = resp.data;
                    console.log("output1", resp.data)
                }, function (resp, status) {
                    $scope.resp = resp;
                    $scope.status = status;
                })


        $http(
            {
                method: 'GET',
                url: 'task/'
                + task.taskId + '/output2'
            }).then(
                        function (resp, status) {

                            // 显示隐藏的任务输出控件
                            $scope.taskOuputDivVisible = true;
                            $scope.output2 = resp.data;
                            console.log("output2", resp.data)
                        }, function (resp, status) {
                            $scope.resp = resp;
                            $scope.status = status;
                        })


    };





};

indexApp.controller('taskManagementCtrl', taskManagementFunc);


indexApp.filter('trustHtml', function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input);
    }
});