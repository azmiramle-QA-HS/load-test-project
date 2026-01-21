/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.29411764705882354, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Enhanced Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "RED List Report"], "isController": true}, {"data": [0.5, 500, 1500, "FPR - 1 Year"], "isController": true}, {"data": [0.0, 500, 1500, "Radial Map"], "isController": true}, {"data": [1.0, 500, 1500, "Basic Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "RPR"], "isController": true}, {"data": [0.0, 500, 1500, "EPR"], "isController": true}, {"data": [0.0, 500, 1500, "LBO Map"], "isController": true}, {"data": [0.5, 500, 1500, "Token"], "isController": false}, {"data": [0.6666666666666666, 500, 1500, "FPR - 5 Year"], "isController": true}, {"data": [0.0, 500, 1500, "Interconnection Map"], "isController": true}, {"data": [0.0, 500, 1500, "Investee Companies Map"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 68, 0, 0.0, 19073.264705882346, 162, 103022, 8895.0, 54453.10000000003, 82131.0, 103022.0, 0.10456069133068857, 64.72118190100562, 0.20457147895716085], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Enhanced Entity Search", 12, 0, 0.0, 281.0, 228, 333, 282.0, 333.0, 333.0, 333.0, 0.025630346330054784, 0.04848240316534777, 0.05010932944606414], "isController": true}, {"data": ["RED List Report", 12, 0, 0.0, 7449.666666666666, 4319, 9481, 8549.0, 9481.0, 9481.0, 9481.0, 0.030415244120353124, 0.46971354542896904, 0.06014733334347175], "isController": true}, {"data": ["FPR - 1 Year", 12, 0, 0.0, 948.3333333333331, 528, 1308, 1009.0, 1308.0, 1308.0, 1308.0, 0.031123641258536307, 0.13045182449378692, 0.06249043596440493], "isController": true}, {"data": ["Radial Map", 12, 0, 0.0, 86130.0, 73237, 103022, 82131.0, 103022.0, 103022.0, 103022.0, 0.021871030180199064, 109.87717223755219, 0.044425530053529345], "isController": true}, {"data": ["Basic Entity Search", 12, 0, 0.0, 332.3333333333333, 162, 466, 369.0, 466.0, 466.0, 466.0, 0.028179995021534215, 0.019814058999516243, 0.052865010191764865], "isController": true}, {"data": ["RPR", 12, 0, 0.0, 34081.333333333336, 30535, 40154, 31555.0, 40154.0, 40154.0, 40154.0, 0.029006596583506364, 0.09376155731582624, 0.057559965095395446], "isController": true}, {"data": ["EPR", 12, 0, 0.0, 26492.333333333336, 21922, 29193, 28362.0, 29193.0, 29193.0, 29193.0, 0.026380873866446827, 0.2872269167353669, 0.050726504534212694], "isController": true}, {"data": ["LBO Map", 12, 0, 0.0, 7036.999999999999, 4189, 9241, 7681.0, 9241.0, 9241.0, 9241.0, 0.027136244298562005, 31.561810640460592, 0.05512049623145407], "isController": true}, {"data": ["Token", 4, 0, 0.0, 1065.0, 1065, 1065, 1065.0, 1065.0, 1065.0, 1065.0, 0.9220839096357768, 2.044973201936376, 0.2395257030889811], "isController": false}, {"data": ["FPR - 5 Year", 12, 0, 0.0, 973.0, 272, 2369, 278.0, 2369.0, 2369.0, 2369.0, 0.031207820679862372, 0.5193176410008348, 0.06232421219757671], "isController": true}, {"data": ["Interconnection Map", 12, 0, 0.0, 22920.666666666668, 18474, 26057, 24231.0, 26057.0, 26057.0, 26057.0, 0.02585621788172935, 2.843098207840898, 0.05875724512771894], "isController": true}, {"data": ["Investee Companies Map", 12, 0, 0.0, 29162.999999999996, 17251, 52366, 17872.0, 52366.0, 52366.0, 52366.0, 0.027112455688080232, 18.015856126624204, 0.05507217561641298], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 68, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
