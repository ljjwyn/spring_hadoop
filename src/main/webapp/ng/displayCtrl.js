var displayFunc = function ($scope, $http) {

    $scope.enterprises = [];
    $scope.enterpriseSelected = undefined;
    $scope.enterpriseInfo = undefined;

    $scope.getEnterpriseList = function () {
        $http({
            method: 'GET',
            url: 'display/enterprises',
        }).then(function (resp, status) {
            $scope.enterprises = resp.data.data;
            console.log("getEnterpriseList企业列表", resp.data.data);
        }, function (resp, status) {
            $scope.initRadarChart();
            $scope.resp = resp;
            $scope.status = status;
        });
    };


    $scope.showEnterpriseDetail = function (enterprise) {
        console.log("showEnterpriseDetail点击企业", enterprise);

        // 当前选中企业
        $scope.enterpriseSelected = enterprise;

        $http({
            method: 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            url: 'display/enterprise/basic-info',
            data: enterprise
        }).then(function (resp, status) {
            console.log("showEnterpriseDetail企业信息", resp);

            $scope.enterpriseInfo = resp.data;

            // MARK 后期需要经过计算获取雷达图数据
            $scope.initRadarChart();

            $scope.initProfileChart();

            $scope.zcfzChart();

            $scope.xjllChart();



        }, function (resp, status) {

            $scope.resp = resp;
            $scope.status = status;
        });
    };


    $scope.initProfileChart = function () {

        var currentDate = new Date();
        console.log(currentDate.getYear());
        var years = currentDate.getFullYear() - parseInt($scope.enterpriseInfo.basicInfo[0].date_of_establishment.substring(0, 4));
        var alterTimes = $scope.enterpriseInfo.alterationCount.reduce(function (prev, cur) {
            return prev + cur.count
        }, 0);
        var alteration = ['成立' + years + "年", "工商变更（" + alterTimes + "）"];

        var intellectualProperty = $scope.enterpriseInfo.intellectualPropertyCount.reduce(function (prev, cur) {
            if(cur.count > 0) prev.push(cur.type + "（" + cur.count + ")");
            return prev
        }, []);

        var justiceInformation = $scope.enterpriseInfo.justiceInformationCount.reduce(function (prev, cur) {
            if(cur.count > 0) prev.push(cur.judicial_type + "（" + cur.count + ")");
            return prev
        }, []);

        var enterprisePublicOpinion = $scope.enterpriseInfo.enterprisePublicOpinionCount.reduce(function (prev, cur) {
            var arr = ["其它公告", "相关提及", "公司信息", "产品信息", "经营业务"];
            if (arr.indexOf(cur.event_classification) === -1) {
                prev.push(cur.event_classification + "（" + cur.count + ")");
            }
            return prev
        }, []);



        var myGraphData = [
            { "parentNode":$scope.enterpriseSelected.name, "childNodes":["稳定性", "软实力", "诉讼风险", "舆情风险"]},
            { "parentNode":"稳定性", "childNodes": alteration },
            { "parentNode":"软实力", "childNodes": intellectualProperty },
            { "parentNode":"诉讼风险", "childNodes": justiceInformation },
            { "parentNode":"舆情风险", "childNodes": enterprisePublicOpinion }
        ];

        function setNodeData(arr, m, n ,listdata) {
            var size = 20;
            for(var i=0; i<arr.length; i++){
                listdata.push({
                    id : m++,
                    category: n,
                    name: arr[i],
                    symbolSize: size,
                    draggable: "true"
                });
            }
        }

        function setLinkData(sourceList, m, links) {
            for(var i=0; i<sourceList.length; i++){
                links.push({
                    "source": sourceList[i],
                    "target": m,
                    lineStyle: {
                        normal: {
                            color: 'source',
                        }
                    }
                })
            }
        }


        var listdata = [];
        var linksdata = [];

        var nodeData = myGraphData;
        var m = 0;
        var source = [];
        for(var i=1; i < nodeData.length; i++){
            var node = nodeData[i].parentNode;
            var tx = [node];
            setNodeData( tx, m, 1, listdata);
            source.push(m);

            var Data = nodeData[i].childNodes;
            setNodeData( Data, m+1, 2, listdata);

            var sourceList = [];
            for(var n = m+1; n < m + Data.length + 1; n++){
                sourceList.push(n);
            }
            setLinkData( sourceList, m, linksdata);
            m = m + Data.length + 1;
        }

        var tx7 = [];
        tx7.push(nodeData[0].parentNode);
        setNodeData(tx7, m, 0, listdata);
        setLinkData(source, m, linksdata);

        var portraitChartOption = {
            title: {
                // text: "张三的朋友和他朋友的朋友",
                top: "top",
                left: "left",
                textStyle: {
                    color: '#292421'
                }
            },
            tooltip: {
                formatter: '{b}'
            },
            backgroundColor: '#FFFFFF',
           /* legend: {
                show : true,
                data : [ {
                    name : '父节点',
                    icon : 'rect'
                },
                    {
                        name : '层级二',
                        icon : 'roundRect'
                    }, {
                        name : '层级三',
                        icon : 'circle'
                    } ],
                textStyle: {
                    color: '#292421'
                },
                icon: 'circle',
                type: 'scroll',
                orient: 'horizontal',
                left: 10,
                top: 20,
                bottom: 20,
                itemWidth: 10,
                itemHeight: 10
            },*/
            animationDuration: 0,
            animationEasingUpdate: 'quinticInOut',
            series: [{
                name: '知识图谱',
                type: 'graph',
                layout: 'force',
                force: {
                    repulsion: 400,
                    gravity: 0.2,
                    edgeLength: 10,
                    layoutAnimation: true,
                },
                data: listdata,
                links: linksdata,
                categories:[
                    {
                        name : '父节点',
                        symbol : 'rect',
                        label : {
                        }
                    }, {
                        name : '层级二',
                        symbol : 'rect'
                    }, {
                        name : '层级三',
                        symbol : 'roundRect'
                    }],
                roam: true,
                label: {
                    normal: {
                        show: true,
                        position: 'bottom',
                        formatter: '{b}',
                        fontSize: 10,
                        fontStyle: '600',
                    }
                },
                lineStyle: {
                    normal: {
                        opacity: 0.9,
                        width: 1.5,
                        curveness: 0
                    }
                }
            }]
        };

        echarts.init(document.getElementById('profileChart')).dispose();

        var echartsWarp = document.getElementById("profileChart");

        var portraitChart = echarts.init(echartsWarp);// 基于准备好的dom，初始化echarts实例

        portraitChart.setOption(portraitChartOption);

        window.addEventListener("resize", function () {
            portraitChart.resize();
        });

    };

    $scope.initRadarChart = function (){

        // MARK avg的值经评估后设定; data的真实值后期需要经过计算后取得
        var indicator = [
            {"name":"稳定性", "max": 5},
            {"name":"软实力", "max": 5},
            {"name":"财务风险", "max": 5},
            {"name":"舆情风险", "max": 5},
            {"name":"诉讼风险", "max": 5}];
        var avg = [3, 2, 3, 3, 4];
        var data = [4, 1, 4, 2, 4];



        var option = {
            backgroundColor: '#fafafa',
            tooltip: {},

            legend: {                        // 图例组件
                show: true,
                itemWidth: 10,                  // 图例标记的图形宽度。[ default: 25 ]
                itemHeight: 10,                 // 图例标记的图形高度。[ default: 14 ]
                itemGap: 30,                	// 图例每项之间的间隔。[ default: 10 ]横向布局时为水平间隔，纵向布局时为纵向间隔。
                orient: 'horizontal',             // 图例列表的布局朝向,'horizontal'为横向,''为纵向.

            },

            radar: [{                       // 雷达图坐标系组件，只适用于雷达图。
                center: ['50%', '50%'],             // 圆中心坐标，数组的第一项是横坐标，第二项是纵坐标。[ default: ['50%', '50%'] ]
                radius: '60%',                        // 圆的半径，数组的第一项是内半径，第二项是外半径。
                startAngle: 90,                     // 坐标系起始角度，也就是第一个指示器轴的角度。[ default: 90 ]
                name: {                             // (圆外的标签)雷达图每个指示器名称的配置项。
                    formatter: '{value}',
                    textStyle: {
                        fontSize: 10,
                        color: '#292929'
                    }
                },
                nameGap: 20,                        // 指示器名称和指示器轴的距离。[ default: 15 ]
                splitNumber: 5,                     // (这里是圆的环数)指示器轴的分割段数。[ default: 5 ]
                shape: 'polygon',                    // 雷达图绘制类型，支持 'polygon'(多边形) 和 'circle'(圆)。[ default: 'polygon' ]
                axisLine: {                         // (圆内的几条直线)坐标轴轴线相关设置
                    lineStyle: {
                        color: '#fff',                   // 坐标轴线线的颜色。
                        width: 1,                      	 // 坐标轴线线宽。
                        type: 'solid',                   // 坐标轴线线的类型。
                    }
                },
                splitLine: {                        // (这里是指所有圆环)坐标轴在 grid 区域中的分隔线。
                    lineStyle: {                    // 分隔线颜色
                        width: 0.5, 							 // 分隔线线宽
                    }
                },
                splitArea: {                        // 坐标轴在 grid 区域中的分隔区域，默认不显示。
                    show: true,
                    areaStyle: {                            // 分隔区域的样式设置。
                        color: ['rgba(250,250,250,0.3)','rgba(200,200,200,0.3)'],       // 分隔区域颜色。分隔区域会按数组中颜色的顺序依次循环设置颜色。默认是一个深浅的间隔色。
                    }
                },
                indicator: indicator
            }],
            series: [{         // 系列名称,用于tooltip的显示，legend 的图例筛选，在 setOption 更新数据和配置项时用于指定对应的系列。
                type: 'radar',              // 系列类型: 雷达图
                itemStyle: {                // 折线拐点标志的样式。
                    normal: {                   // 普通状态时的样式
                        lineStyle: {
                            width: 1
                        },
                        opacity: 0.3
                    },
                    emphasis: {                 // 高亮时的样式
                        lineStyle: {
                            width: 5
                        },
                        opacity: 1
                    }
                },
                data: [{                    // 雷达图的数据是多变量（维度）的
                    name: '行业均值',                 // 数据项名称
                    value: avg,        // 其中的value项数组是具体的数据，每个值跟 radar.indicator 一一对应。
                    symbol: 'circle',                   // 单个数据标记的图形。
                    symbolSize: 5,                      // 单个数据标记的大小，可以设置成诸如 10 这样单一的数字，也可以用数组分开表示宽和高，例如 [20, 10] 表示标记宽为20，高为10。
                    label: {                    // 单个拐点文本的样式设置
                        normal: {
                            show: true,             // 单个拐点文本的样式设置。[ default: false ]
                            position: 'top'        // 标签的位置。[ default: top ]
                        }
                    },
                    lineStyle: {                // 单项线条样式。
                        normal: {
                            opacity: 0.5            // 图形透明度
                        }
                    },
                    areaStyle: {                // 单项区域填充样式
                        normal: {
                            color: "#cd6a67"       // 填充的颜色。[ default: "#000" ]
                        }
                    }
                }, {
                    name: '企业数据',
                    value: data,
                    symbol: 'circle',
                    symbolSize: 5,
                    label: {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    lineStyle: {
                        normal: {
                            opacity: 0.5
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: '#2f4554'
                        }
                    }
                }]
            }, ]
        };

        echarts.init(document.getElementById('radarChart')).dispose();

        var echartsWarp = document.getElementById("radarChart");


        var radarChart = echarts.init(echartsWarp);// 基于准备好的dom，初始化echarts实例

        // 使用刚指定的配置项和数据显示图表。
        radarChart.setOption(option);

        window.addEventListener("resize", function () {
            radarChart.resize();
        });
    };



    $scope.zcfzChart = function (){

        // 指定图表的配置项和数据
        var liudongzc = $scope.enterpriseInfo.balanceSheet.map(function (cur) {
            if (cur.total_current_assets.indexOf("亿") !== -1) {
                return parseFloat(cur.total_current_assets) * 10000
            }
            else return parseFloat(cur.total_current_assets);
        });
        var feiliudongzc = $scope.enterpriseInfo.balanceSheet.map(function (cur) {
            if (cur.total_non_current_assets.indexOf("亿") !== -1) {
                return parseFloat(cur.total_non_current_assets) * 10000
            }
            else return parseFloat(cur.total_non_current_assets);
        });
        var liudongfz = $scope.enterpriseInfo.balanceSheet.map(function (cur) {
            if (cur.total_current_liability.indexOf("亿") !== -1) {
                return parseFloat(cur.total_current_liability) * 10000
            }
            else return parseFloat(cur.total_current_liability);
        });
        var feiliudongfz = $scope.enterpriseInfo.balanceSheet.map(function (cur) {
            if (cur.total_non_current_liabilities.indexOf("亿") !== -1) {
                return parseFloat(cur.total_non_current_liabilities) * 10000
            }
            else return parseFloat(cur.total_non_current_liabilities);
        });
        var quanyi = $scope.enterpriseInfo.balanceSheet.map(function (cur) {
            if (cur.total_equity.indexOf("亿") !== -1) {
                return parseFloat(cur.total_equity) * 10000
            }
            else return parseFloat(cur.total_equity);
        });
        var time = $scope.enterpriseInfo.balanceSheet.map(function (cur) {
            return cur.date_info;
        });

        var option = {
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                top: '8%',
                data: ['流动资产', '非流动资产', '流动负债', '非流动负债','权益合计'],
            },
            grid: { //图表的位置
                top: '20%',
                left: '3%',
                right: '4%',
                bottom: '5%',
                containLabel: true
            },
            yAxis: [{
                type: 'value',
                axisLabel: {
                    show: true,
                    interval: 'auto',
                    formatter: '{value} '
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                show: true

            }],
            xAxis: [{
                type: 'category',
                axisLabel: {
                    interval: 0,
                    show: true,
                    splitNumber: 15,
                    textStyle: {
                        fontSize: 10,
                        color: '#000'
                    },

                },
                data: time,
            }],
            series: [
                {
                    name: '非流动资产',
                    type: 'bar',
                    barWidth: '20px',
                    stack: 'zc',
                    data: feiliudongzc,
                    color: '#c23531'
                },{
                    name: '流动资产',
                    type: 'bar',
                    stack: 'zc',
                    barWidth: '20px',
                    data: liudongzc,
                    color: '#c56e6f'

                },{
                    name: '非流动负债',
                    type: 'bar',
                    stack: 'fz',
                    barWidth: '20px',
                    data: feiliudongfz,
                    color: '#3c5767'
                },
                {
                    name: '流动负债',
                    type: 'bar',
                    stack: 'fz',
                    barWidth: '20px',
                    data: liudongfz,
                    color: '#5f89af'
                },
                {
                    name: '权益合计',
                    type: 'bar',
                    stack: 'qy',
                    barWidth: '20px',
                    data: quanyi,
                    color: '#5fa89b'
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


    $scope.xjllChart = function (){

        // 经营
        var jingying_in = $scope.enterpriseInfo.cashFlow.map(function (cur) {
            if (cur.cash_inflows_from_operating_activities.indexOf("亿") !== -1) {
                return parseFloat(cur.cash_inflows_from_operating_activities) * 10000
            }
            else return parseFloat(cur.cash_inflows_from_operating_activities);
        });

        var jinying_out = $scope.enterpriseInfo.cashFlow.map(function (cur) {
            if (cur.cash_outflow_for_operating_activities.indexOf("亿") !== -1) {
                return parseFloat(cur.cash_outflow_for_operating_activities) * 10000 * (-1)
            }
            else return parseFloat(cur.cash_outflow_for_operating_activities) * (-1);
        });

        var jinying_jinge = $scope.enterpriseInfo.cashFlow.map(function (cur) {
            if (cur.net_cash_flow_occurred_in_operating_activities.indexOf("亿") !== -1) {
                return parseFloat(cur.net_cash_flow_occurred_in_operating_activities) * 10000
            }
            else return parseFloat(cur.net_cash_flow_occurred_in_operating_activities);
        });


        // 投资
        var touzi_in = $scope.enterpriseInfo.cashFlow.map(function (cur) {
            if (cur.cash_inflow_from_investment_activities.indexOf("亿") !== -1) {
                return parseFloat(cur.cash_inflow_from_investment_activities) * 10000
            }
            else return parseFloat(cur.cash_inflow_from_investment_activities);
        });

        var touzi_out = $scope.enterpriseInfo.cashFlow.map(function (cur) {
            if (cur.cash_outflow_for_investment_activities.indexOf("亿") !== -1) {
                return parseFloat(cur.cash_outflow_for_investment_activities) * 10000 * (-1)
            }
            else return parseFloat(cur.cash_outflow_for_investment_activities) * (-1);
        });

        var touzi_jinge = $scope.enterpriseInfo.cashFlow.map(function (cur) {
            if (cur.net_cash_flow_from_investment_activities.indexOf("亿") !== -1) {
                return parseFloat(cur.net_cash_flow_from_investment_activities) * 10000
            }
            else return parseFloat(cur.net_cash_flow_from_investment_activities);
        });


        // 筹资
        var chouzi_in = $scope.enterpriseInfo.cashFlow.map(function (cur) {
            if (cur.cash_inflow_from_financing_activities.indexOf("亿") !== -1) {
                return parseFloat(cur.cash_inflow_from_financing_activities) * 10000
            }
            else return parseFloat(cur.cash_inflow_from_financing_activities);
        });

        var chouzi_out = $scope.enterpriseInfo.cashFlow.map(function (cur) {
            if (cur.cash_outflow_for_financing_activities.indexOf("亿") !== -1) {
                return parseFloat(cur.cash_outflow_for_financing_activities) * 10000 * (-1)
            }
            else return parseFloat(cur.cash_outflow_for_financing_activities) * (-1);
        });

        var chouzi_jinge = $scope.enterpriseInfo.cashFlow.map(function (cur) {
            if (cur.net_cash_flow_from_financing_activities.indexOf("亿") !== -1) {
                return parseFloat(cur.net_cash_flow_from_financing_activities) * 10000
            }
            else return parseFloat(cur.net_cash_flow_from_financing_activities);
        });

        var time = $scope.enterpriseInfo.balanceSheet.map(function (cur) {
            return cur.date_info;
        });


        var option = {
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                top: '8%',
                data: ['经营流入','经营流出','经营净额','投资流入','投资流出','投资净额', '筹资流入', '筹资流出', '筹资净额'],
            },
            grid: { //图表的位置
                top: '20%',
                left: '3%',
                right: '4%',
                bottom: '5%',
                containLabel: true
            },
            yAxis: [{
                type: 'value',
                axisLabel: {
                    show: true,
                    interval: 'auto',
                    formatter: '{value} '
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                show: true

            }],
            xAxis: [{
                type: 'category',
                axisLabel: {
                    interval: 0,
                    show: true,
                    splitNumber: 15,
                    textStyle: {
                        fontSize: 10,
                        color: '#000'
                    },

                },
                data: time,
            }],
            series: [
                {
                    name: '经营流入',
                    type: 'bar',
                    barWidth: '10px',
                    stack: 'jingying',
                    data: jingying_in,
                    color: '#c23531'
                },{
                    name: '经营流出',
                    type: 'bar',
                    stack: 'jingying',
                    barWidth: '10px',
                    data: jinying_out,
                    color: '#c56e6f'

                },{
                    name: '经营净额',
                    type: 'line',
                    data: jinying_jinge,
                    color: '#f81112'

                },{
                    name: '投资流入',
                    type: 'bar',
                    stack: 'touzi',
                    barWidth: '10px',
                    data: touzi_in,
                    color: '#3c5767'
                },
                {
                    name: '投资流出',
                    type: 'bar',
                    stack: 'touzi',
                    barWidth: '10px',
                    data: touzi_out,
                    color: '#5f89af'
                },
                {
                    name: '投资净额',
                    type: 'line',
                    data: touzi_jinge,
                    color: '#006ddc'
                },
                {
                    name: '筹资流入',
                    type: 'bar',
                    stack: 'chouzi',
                    barWidth: '10px',
                    data: chouzi_in,
                    color: '#00866b'
                },
                {
                    name: '筹资流出',
                    type: 'bar',
                    stack: 'chouzi',
                    barWidth: '10px',
                    data: chouzi_out,
                    color: '#5fa89b'
                },
                {
                    name: '筹资净额',
                    type: 'line',
                    data: chouzi_jinge,
                    color: '#00f7b1'
                },
            ]
        };



        echarts.init(document.getElementById('xjllChart')).dispose();

        var echartsWarp = document.getElementById("xjllChart");

        var myChart = echarts.init(echartsWarp);// 基于准备好的dom，初始化echarts实例

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);

        window.addEventListener("resize", function () {
            myChart.resize();
        });
    };

};



indexApp.controller('displayCtrl', displayFunc);

indexApp.filter('trustHtml', function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input);
    }
});