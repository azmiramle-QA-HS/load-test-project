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

    var data = {"OkPercent": 73.91304347826087, "KoPercent": 26.08695652173913};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1956521739130435, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Enhanced Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "FPR - 1 Year"], "isController": true}, {"data": [0.0, 500, 1500, "RED List"], "isController": true}, {"data": [1.0, 500, 1500, "Basic Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "Radial Map"], "isController": true}, {"data": [0.0, 500, 1500, "RPR"], "isController": true}, {"data": [0.0, 500, 1500, "EPR"], "isController": true}, {"data": [0.0, 500, 1500, "LBO Map"], "isController": true}, {"data": [0.0, 500, 1500, "IC Map"], "isController": true}, {"data": [0.0, 500, 1500, "FPR - 5 Year"], "isController": true}, {"data": [0.5, 500, 1500, "Login"], "isController": true}, {"data": [0.0, 500, 1500, "Interconnection Map"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 23, 6, 26.08695652173913, 10444.173913043478, 44, 43267, 2070.0, 36678.200000000026, 43267.0, 43267.0, 0.19063722564816657, 140.85210209918523, 0.3655391096412705], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Enhanced Entity Search", 4, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 90.9090909090909, 47.58522727272727, 178.26704545454547], "isController": true}, {"data": ["FPR - 1 Year", 4, 4, 100.0, 508.0, 508, 508, 508.0, 508.0, 508.0, 508.0, 7.874015748031496, 4.2138287401574805, 16.05561023622047], "isController": true}, {"data": ["RED List", 4, 0, 0.0, 11210.0, 11210, 11210, 11210.0, 11210.0, 11210.0, 11210.0, 0.35679243600035676, 5.5100738114351975, 0.7055709793952368], "isController": true}, {"data": ["Basic Entity Search", 4, 0, 0.0, 296.0, 296, 296, 296.0, 296.0, 296.0, 296.0, 13.468013468013467, 9.46969696969697, 25.26567760942761], "isController": true}, {"data": ["Radial Map", 4, 0, 0.0, 26795.0, 26795, 26795, 26795.0, 26795.0, 26795.0, 26795.0, 0.14928158238477326, 791.6107832618026, 0.3032282142190707], "isController": true}, {"data": ["RPR", 4, 4, 100.0, 197.0, 197, 197, 197.0, 197.0, 197.0, 197.0, 20.30456852791878, 11.26269035532995, 40.07376269035533], "isController": true}, {"data": ["EPR", 4, 0, 0.0, 43267.0, 43267, 43267, 43267.0, 43267.0, 43267.0, 43267.0, 0.09244707405010631, 1.006535574789683, 0.17776200078580012], "isController": true}, {"data": ["LBO Map", 4, 0, 0.0, 13969.0, 13969, 13969, 13969.0, 13969.0, 13969.0, 13969.0, 0.2863278453829635, 898.2641374373658, 0.5816034359341445], "isController": true}, {"data": ["IC Map", 4, 4, 100.0, 692.0, 692, 692, 692.0, 692.0, 692.0, 692.0, 5.780346820809248, 2.884528540462428, 11.73568460982659], "isController": true}, {"data": ["FPR - 5 Year", 4, 0, 0.0, 2070.0, 2070, 2070, 2070.0, 2070.0, 2070.0, 2070.0, 1.932367149758454, 32.15579710144928, 3.8590730676328504], "isController": true}, {"data": ["Login", 2, 0, 0.0, 1142.0, 850, 1434, 1142.0, 1434.0, 1434.0, 1434.0, 1.3947001394700138, 3.0931289225941425, 0.36229515341701535], "isController": true}, {"data": ["Interconnection Map", 4, 0, 0.0, 20635.0, 20635, 20635, 20635.0, 20635.0, 20635.0, 20635.0, 0.1938454082868912, 1.9144127089895806, 0.40340289556578623], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 4, 66.66666666666667, 17.391304347826086], "isController": false}, {"data": ["405/Method Not Allowed", 2, 33.333333333333336, 8.695652173913043], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 23, 6, "400/Bad Request", 4, "405/Method Not Allowed", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["FPR - 1 Year", 2, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["RPR", 2, 2, "400/Bad Request", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["IC Map", 2, 2, "405/Method Not Allowed", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
