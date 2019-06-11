var dbInfo = {"人口库": "jck_basic_db", "证照库": "fupindb", "法人库": "fupindb", "车辆库": "fupindb"};
var dbConfig = {"ip": "127.0.0.1", "port": "3306", "username": "root", "password": "root", "dbName":""};
var currentSubject = "";
var currentTableName = "";
var currentTableFirstCol = "";
var detailTableOptions = "";
var currentMeta = [];
var tableMap = {};
var detailTableInit = 0;
var mysqlConfig = {
    ip : "127.0.0.1",
    port : "3306",
    dbName : "",
    username : "root",
    password : "root"
};
var portraitChart = echarts.init(document.getElementById('portrait-chart'));

function init() {
    changeSubject("人口库", "trigger");
}



//切换主体（库）--更新tableName列表
changeSubject = function (item, type) {
    $("#detail-table-div").css("display", 'none');
    $("#portrait-chart-div").css("display","none");
    $("#labels-filter-div").empty();

    var subjectName;

    if (type == 'normal') {
        subjectName = $(item).val();
    }
    else if (type == 'trigger') {
        subjectName = item;
    }

    currentSubject = subjectName;

    //显示可用table
    $.ajax({
        type: 'GET',
        url: 'search/subject/tables',
        data: {"subject": subjectName},
        cache: false,
        dataType: 'json',
        success:function (data) {
            var tableName = data["tableName"];
            mysqlConfig.tables = tableName;
            mysqlConfig.dbName = dbInfo[currentSubject];

            if (tableName.length > 0) {
                $.ajax({
                    type: 'POST',
                    url: '/MySQLManager/mysql/tables/comments',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify(mysqlConfig),
                    async: false,
                    cache: false,
                    dataType: 'json',
                    success: function (resp) {
                        tableMap = Object.assign({}, tableMap, resp.data);

                        var html = "";
                        for (var i = 0; i < tableName.length; i++) {
                            html += '<li>' +
                                '<a onclick="changeTable(this, \'normal\')" value="' + tableName[i] + '">' + tableMap[tableName[i]] + '</a></li>'

                        }
                        $("#table-name-list").empty().append(html);

                        changeTable(tableName[0], "trigger");
                        $("#table-name-list").children().first().addClass('active');


                    }
                })
            }
            else {
                $("#table-name-list").empty();
            }


        }
    });
}


//切换表 --显示表中全部数据，暂未做分页 MARK TODO 分页
changeTable = function (item, type) {
    $("#portrait-chart-div").css("display","none");

    $(item).parent("li").siblings().removeClass("active");
    $(item).parent("li").addClass('active');

    if (detailTableInit == 1) {
        var table = $("#detail-table").DataTable();
        table.destroy();
        $("#detail-table").empty();
    }

    var subjectName = $("#select-subject").val();

    var tableName;
    if (type == 'normal') {
        tableName = $(item).attr("value");
    }
    else if (type == 'trigger') {
        tableName = item;
    }

    currentTableName = tableName;

    dbConfig.dbName = dbInfo[subjectName];
    //meta 获得各字段注释
    $.ajax({
        type: 'POST',
        url: '/MySQLManager/mysql/tables/' + tableName + '/comments',
        headers : {
            'Content-Type' : 'application/json'
        },
        data: JSON.stringify(dbConfig),
        async: false,
        cache: false,
        dataType: 'json',
        success: function (resp) {
            var meta = resp.data;
            var columns = [];
            var metaArr = [];
            var count = 0;
            for (var item in meta) {
                if (count == 0) {
                    currentTableFirstCol = item;
                    count++;
                }
                metaArr.push(item);
                if (!(meta[item] == "" || meta[item] == null)) {
                    columns.push({
                        "data": item,
                        "name": item,
                        "title": meta[item]
                    })
                }
            }
            currentMeta = metaArr;

            detailTableOptions =
                {
                    "columns": columns,
                    "order": [0, "desc"],
                };

            //data 获得表格数据
            $.ajax({
                type: 'POST',
                url: 'search/table-data/all',
                data: {"tableName": tableName, "dbName": dbInfo[subjectName]},
                async: false,
                cache: false,
                dataType: 'json',
                success: function (data) {

                    initTable("detail-table", data["data"], detailTableOptions);
                    detailTableInit = 1;
                    $("#detail-table-div").css("display", 'block');
                }
            })

            //显示标签过滤器，显示labels
            $.ajax({
                type: 'GET',
                url: 'search/labels/filter',
                data: {"subject": subjectName, "tableName": currentTableName},
                cache: false,
                dataType: 'json',
                success: function (data) {
                    console.log(data);
                    var html = "";

                    for (var taskName in data.labels) {
                        html += "<br><div>";
                        html += "<span task-name='" + taskName + "' class='filter-span'>" + taskName + "： ";
                        for (var taskId in data.labels[taskName]) {
                            for (var labelId in data.labels[taskName][taskId]) {
                                html += "<input type='checkbox' label-id='" + labelId + "' " +
                                    "task-id='" + taskId + "' task-name='" + taskName + "'/>" + data.labels[taskName][taskId][labelId] + "&nbsp;&nbsp;&nbsp;&nbsp;"
                            }

                        }
                        html += "</span></div>";
                    }
                    $("#labels-filter-div").empty().append(html);
                }
            })
        }
    })

}


searchSubject = function () {
    $("#portrait-chart-div").css("display","none");


    var arr = [];
    $("#labels-filter-div").find("[type='checkbox']:checked").each(function (i, d) {
       arr.push({
           "taskId": $(d).attr("task-id"),
           "labelId": $(d).attr("label-id"),
           "taskName": $(d).attr("task-name")
       });
    });

/*    var filter = {};
    $(".filter-span").each(function (i, d) {

        var arr = [];
        $(d).find("[type='checkbox']:checked").each(function (i, d) {
            arr.push({
                "taskId": $(d).attr("task-id"),
                "labelId": $(d).attr("label-id"),
            });
        });
        filter[$(d).attr("task-name")] = arr;
    })
*/
    $.ajax({
        type: 'POST',
        url: 'search/subject/labels',
        headers : {
            'Content-Type' : 'application/json'
        },
        data: JSON.stringify({"primaryKey": currentTableFirstCol,"tableName":currentTableName,
            "dbName": dbInfo[currentSubject],"searchParam":arr}),
        cache: false,
        dataType: 'json',
        success: function (data) {
            console.log(data);
            initTable("detail-table", data["data"], detailTableOptions);
        }
    })

}


$(document).on('click','#detail-table tbody > tr', function () {
    $('#detail-table tbody > tr').css("background-color", "");
    $(this).css("background-color", "#c2e5ff");

    var table = $("#detail-table").DataTable();
    var tbData = table.row(this).data();

    //获得标签
    $.ajax({
        type: 'GET',
        url: 'search/labels/individual',
        data: {"id": tbData['id'], "tableName": currentTableName, "subject": currentSubject},
        cache: false,
        dataType: 'json',
        success: function (data) {
            $("#portrait-chart-div").css("display","block");
            drawPortraitChart(data["labels"]);
        }
    })

});


function initTable(tableName, data, OtherOptions) {
    var options = {
        "destroy": true,
        "bAutoWidth": false,
        "bLengthChange": true,
        "aLengthMenu": [5, 10, 20, 50],  //用户可自选每页展示数量
        "iDisplayLength": 20,
        "searching": false,
        "processing": true,
        "ordering": true,
        "data": data,
        "select": {
            style: 'os',
            selector: 'td:first-child'
        },
        "oLanguage": {
            "sProcessing": "正在获取数据，请稍后...",
            "sLengthMenu": "显示 _MENU_ 条",
            "sZeroRecords": "没有找到数据",
            "sInfo": "从 _START_ 到  _END_ 条记录 总记录数为 _TOTAL_ 条",
            "sInfoEmpty": "记录数为0",
            "sInfoFiltered": "(全部记录数 _MAX_ 条)",
            "sInfoPostFix": "",
            "sSearch": "查 询",
            "sUrl": "",
            "oPaginate": {
                "sFirst": "第一页",
                "sPrevious": "上一页",
                "sNext": "下一页",
                "sLast": "最后一页"
            }
        }
    };

    var newOptions = $.extend({}, options, OtherOptions);

    $("#" + tableName).dataTable(newOptions);
}


function drawPortraitChart(data) {

    var symbols = [
        "image://data:image/png;base64,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"
    ];
    var count = 1;
    var chartData = [];
    var chartLinks = [];

    chartData.push({
        name: '',
        fixed: false,
        draggable: true, // 是否可以拖拽，默认false
        number: 0, // 这是编号 非必须，目的仅为方便编写line
        symbol : symbols[0],
        symbolSize: [60,160], //图形大小
        value: data,
        itemStyle: {
            normal: {
                color: '#47b9f9',
                borderColor: '#156ACF',
                borderWidth: 1,
                shadowColor: 'rgba(0, 0, 0, 0.4)',
                shadowBlur: 20,
                borderType:'dashed'
            }
        },
    });

    for (var key in data) {
        var source = count;
        chartData.push({
            "name": key,
            "number": count,
            itemStyle: {
                normal: {
                    color: '#dcebff',
                }
            },
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        fontSize: 9,
                        color: '#484b4e'
                    }
                }
            },
            symbol: 'circle',
        });
        chartLinks.push({
            "source": 0,
            "target": count
        });

        count++;

        var arr = data[key];
        for (var i = 0; i < arr.length; i++) {
            chartData.push({
                "name": arr[i] + "(" + key + ")",
                "number": count,
                itemStyle: {
                    normal: {
                        color: '#749dce',
                    }
                },
                symbol: 'rect',
            });
            chartLinks.push({
                "source": source,
                "target": count
            });

            count++;
        }
    }


    var portraitChartOption = {

        tooltip:{
            show:false
        },
        series: [ {
            type: 'graph',
            layout: 'force',
            focusNodeAdjacency: false,
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        fontSize: 12
                    },
                    //color:'auto'
                }
            },
            force: {
                repulsion: 1500
            },
            lineStyle: {
                normal: {
                    opacity: 1,
                    width: 1,
                    curveness: 0.1
                }
            },
            draggable: true,
            symbolSize: function (value, params) {
                return  [params.data.name.length*15,30]
            },
            data: chartData,
            links: chartLinks
        }]
    };

    portraitChart.setOption(portraitChartOption);

    window.addEventListener("resize", function () {
        portraitChart.resize();
    });


}