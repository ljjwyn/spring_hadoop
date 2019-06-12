indexApp
    .controller(
        'hdfsManagementCtrl',
        function($scope, $http, $timeout) {
            var request={
                path:null
            };
            $scope.dbInfoList=[];
            $scope.kmeansCall={
                path:null,
                keys:null,
                iteration:null
            };
            $scope.finshData={};
            var allData0=[];
            $scope.allData=[];
            var Cult=null;
            var temppath=null;
            var allserval=[];
            $scope.kmeansShow=null;
            var searchTask = $scope.searchTask = function () {
                var rootRoad=null;
                if (!$scope.searchParam) {
                    rootRoad="/";
                }else {
                    rootRoad=$scope.searchParam;
                }
                request.path=rootRoad;
                temppath=rootRoad;
                console.log($scope.searchParam);
                $http({
                    method: 'POST',
                    url: '/hadoop/hdfs/readPathInfo',
                    data:request,
                }).then(function (resp, status) {
                    console.log(resp.data);
                    $scope.taskList=resp.data.result;
                    $scope.status = status;
                }, function (resp, status) {
                    $scope.resp = resp;
                    $scope.status = status;
                });

            }

            $scope.delTask = function (task) {
                request.path=null;
                if(task.isD=="true"){
                    if(temppath=="/"){
                        request.path=temppath+task.name;
                    }else {
                        request.path=temppath+"/"+task.name;
                    }
                    $scope.searchParam=request.path;
                    temppath=request.path;
                    searchTask();
                }else {
                    console.log(task);
                    request.path=temppath+"/"+task.name;
                    $http({
                        method: 'POST',
                        url: '/hadoop/hdfs/readFile',
                        data:request,
                    }).then(function (resp, status) {
                        console.log(resp.data);
                        $scope.contents=resp.data.result;
                        $scope.status = status;
                    }, function (resp, status) {
                        $scope.resp = resp;
                        $scope.status = status;
                    });
                }
            }
            $scope.wordCount=function () {
                var Cpath="hdfs://127.0.0.1:9000"+request.path;
                request.path=Cpath;
                $http({
                    method: 'POST',
                    url: '/hadoop/hdfs/wordCount',
                    data:request,
                }).then(function (resp, status) {
                    console.log(resp.data);
                    $scope.count=resp.data.result;
                    $scope.zcfzChart(resp.data.key,resp.data.value);
                    $scope.status = status;
                }, function (resp, status) {
                    $scope.resp = resp;
                    $scope.status = status;
                });
            }

            $scope.zcfzChart = function (key,value){

                // 指定图表的配置项和数据

                var option = {
                    title : {
                        text: '单词统计',
                        subtext: '统计退表'
                    },
                    tooltip : {
                        trigger: 'axis'
                    },
                    legend: {
                        data:['单词']
                    },
                    toolbox: {
                        show : true,
                        feature : {
                            mark : {show: true},
                            dataView : {show: true, readOnly: false},
                            magicType : {show: true, type: ['line', 'bar']},
                            restore : {show: true},
                            saveAsImage : {show: true}
                        }
                    },
                    calculable : true,
                    xAxis : [
                        {
                            type : 'category',
                            data : key
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value'
                        }
                    ],
                    series : [
                        {
                            name:'单词数',
                            type:'bar',
                            data:value,
                            markPoint : {
                                data : [
                                    {type : 'max', name: '最大值'},
                                    {type : 'min', name: '最小值'}
                                ]
                            },
                            markLine : {
                                data : [
                                    {type : 'average', name: '平均值'}
                                ]
                            }
                        },

                    ]
                };
                echarts.init(document.getElementById('zcfzChart')).dispose();

                var echartsWarp = document.getElementById("zcfzChart");

                var myChart = echarts.init(echartsWarp);// 基于准备好的dom，初始化echarts实例

                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(option);

                window.addEventListener("resize", function () {
                    myChart.resize();
                });
            };

            $scope.getNewChart=function(){
                console.log("x",$scope.selectedX);
                console.log("y",$scope.selectedY);
                console.log("z",$scope.selectedZ);
                $scope.Kmeans();
            }

            $scope.Kmeans=function(){
                var centerServal=[];
                allserval=[];
                $scope.kmeansCall.path=request.path;
                $http({
                    method: 'POST',
                    url: '/hadoop/hdfs/Kmeans',
                    data:$scope.kmeansCall,
                }).then(function (resp, status) {
                    console.log('kmeansData',resp.data);
                    $scope.KmeansData=resp.data.kmeansDatas;
                    $scope.KmeansCenters=resp.data.kmeansCenters;
                    $scope.kmeansCost=resp.data.cost;
                    var keyNum=parseInt($scope.kmeansCall.keys);
                    var dataMap=new Map();
                    var dimnum;
                    for(var i in $scope.KmeansData){
                        i=i.replace('[','');
                        i=i.replace(']','');
                        i=i.split(", ");
                        dimnum=i.length;
                    }
                    console.log('dim',dimnum);
                    for(var num=1;num<=dimnum;num++){
                        $scope.dbInfoList.push("第"+num+"维特征");
                    }
                    for(var i in $scope.KmeansCenters){
                        var centerList=[];
                        var serval={
                            type: 'scatter3D',
                            dimensions: ['a', 'b', 'c'//显示框信息
                            ],
//                encode: {
////                    x: [3, 1, 5],      // 表示维度 3、1、5 映射到 x 轴。
////                    y: 2,              // 表示维度 2 映射到 y 轴。
//                    tooltip:['a','c','b'], // 表示维度 3、2、4 会在 tooltip 中显示。
//                    label: 'a'           // 表示 label 使用维度 3。
//                },
                            data: null,
                            symbolSize: 10,//点的大小
                            // symbol: 'triangle',
                            itemStyle: {
                                borderWidth: 50,
                                borderColor: 'rgba(255,255,255,0.8)'//边框样式
                            },
                            emphasis: {
                                itemStyle: {
                                    color: '#ccc'//高亮
                                }
                            },
                            itemStyle: {
                                color: '#ffee00'
                            }
                        };
                        var templist=[];
                        i=i.replace('[','');
                        i=i.replace(']','');
                        i=i.split(", ");
                        templist.push(i[$scope.selectedX]);
                        templist.push(i[$scope.selectedY]);
                        templist.push(i[$scope.selectedZ]);
                        console.log(templist);
                        centerList.push(templist);
                        serval.data=centerList;
                        centerServal.push(serval);
                    }
                    for(var j=0;j<keyNum;j++){
                        var serval={
                            type: 'scatter3D',
                            dimensions: ['a', 'b', 'c'//显示框信息
                            ],
//                encode: {
////                    x: [3, 1, 5],      // 表示维度 3、1、5 映射到 x 轴。
////                    y: 2,              // 表示维度 2 映射到 y 轴。
//                    tooltip:['a','c','b'], // 表示维度 3、2、4 会在 tooltip 中显示。
//                    label: 'a'           // 表示 label 使用维度 3。
//                },
                            data: null,
                            symbolSize: 10,//点的大小
                            // symbol: 'triangle',
                            itemStyle: {
                                borderWidth: 50,
                                borderColor: 'rgba(255,255,255,0.8)'//边框样式
                            },
                            emphasis: {
                                itemStyle: {
                                    color: '#ccc'//高亮
                                }
                            },
                            itemStyle: {
                                color: null
                            }
                        };
                        allData0=[];
                        for(var i in $scope.KmeansData){
                            if($scope.KmeansData[i]==j.toString()){
                                var templist=[];
                                i=i.replace('[','');
                                i=i.replace(']','');
                                i=i.split(", ");
                                templist.push(i[$scope.selectedX]);
                                templist.push(i[$scope.selectedY]);
                                templist.push(i[$scope.selectedZ]);
                                console.log(templist);
                                allData0.push(templist);
                            }
                        }
                        serval.data=allData0;
                        serval.itemStyle.color=getRandomColor();
                        allserval.push(serval);
                        $scope.allData.push(allData0);
                        dataMap.put(j.toString(),allData0)
                    }
                    allserval=allserval.concat(centerServal);
                    console.log('kmeansData',$scope.allData);
                    console.log("alls",allserval);
                    $scope.get3dchart();
                    $scope.status = status;
                    $scope.showData=dataMap.toString();
                }, function (resp, status) {
                    $scope.resp = resp;
                    $scope.status = status;
                });

            }

            $scope.get3dchart=function () {
                var myChart = echarts.init(document.getElementById('3DChart'));
                console.log(myChart);
                myChart.setOption({
                    tooltip: {},
                    xAxis3D: {
                        name: "x",
                        type: 'value',
//                min: 'dataMin',//获取数据中的最值
//                max: 'dataMax'
                    },
                    yAxis3D: {
                        name: "y",
                        type: 'value',
//                min: 'dataMin',
//                max: 'dataMax'
                    },
                    zAxis3D: {
                        name: "z",
                        type: 'value',
//                min: 'dataMin',
//                max: 'dataMax'
                    },
                    grid3D: {
                        axisLine: {
                            lineStyle: {
                                color: '#000'//轴线颜色
                            }
                        },
                        axisPointer: {
                            lineStyle: {
                                color: '#80ff59'//坐标轴指示线
                            },
                            show: true//不坐标轴指示线
                        },
                        viewControl: {
//                     autoRotate: true,//旋转展示
//                     projection: 'orthographic'
                            beta: 10
                        },
                        boxWidth: 200,
                        boxHeight: 100,
                        boxDepth: 100,
                        top: -100
                    },

                    series: allserval,
                    backgroundColor: "#fff"
                },true);

            }

            $scope.showKmeans=function () {
                $scope.kmeansShow=true;
            }

            function Map() {
                /** 存放键的数组(遍历用到) */
                this.keys = new Array();
                /** 存放数据 */
                this.data = new Object();

                /**
                 * 放入一个键值对
                 * @param {String} key
                 * @param {Object} value
                 */
                this.put = function(key, value) {
                    if(this.data[key] == null){
                        this.keys.push(key);
                    }
                    this.data[key] = value;
                };

                /**
                 * 获取某键对应的值
                 * @param {String} key
                 * @return {Object} value
                 */
                this.get = function(key) {
                    return this.data[key];
                };

                /**
                 * 删除一个键值对
                 * @param {String} key
                 */
                this.remove = function(key) {
                    this.keys.remove(key);
                    this.data[key] = null;
                };

                /**
                 * 遍历Map,执行处理函数
                 *
                 * @param {Function} 回调函数 function(key,value,index){..}
                 */
                this.each = function(fn){
                    if(typeof fn != 'function'){
                        return;
                    }
                    var len = this.keys.length;
                    for(var i=0;i<len;i++){
                        var k = this.keys[i];
                        fn(k,this.data[k],i);
                    }
                };

                /**
                 * 获取键值数组(类似Java的entrySet())
                 * @return 键值对象{key,value}的数组
                 */
                this.entrys = function() {
                    var len = this.keys.length;
                    var entrys = new Array(len);
                    for (var i = 0; i < len; i++) {
                        entrys[i] = {
                            key : this.keys[i],
                            value : this.data[i]
                        };
                    }
                    return entrys;
                };

                /**
                 * 判断Map是否为空
                 */
                this.isEmpty = function() {
                    return this.keys.length == 0;
                };

                /**
                 * 获取键值对数量
                 */
                this.size = function(){
                    return this.keys.length;
                };

                /**
                 * 重写toString
                 */
                this.toString = function(){
                    var s = "{";
                    for(var i=0;i<this.keys.length;i++,s+=','){
                        var k = this.keys[i];
                        s += k+"="+this.data[k];
                        s +="               ";
                    }
                    s+="}";
                    return s;
                };
            }

            var getRandomColor = function () {
                var r = Math.round(Math.random() * 255), g = Math.round(Math.random() * 255), b = Math.round(Math.random() * 255);
                var color = r << 16 | g << 8 | b;
                return "#" + color.toString(16)
            }
        })