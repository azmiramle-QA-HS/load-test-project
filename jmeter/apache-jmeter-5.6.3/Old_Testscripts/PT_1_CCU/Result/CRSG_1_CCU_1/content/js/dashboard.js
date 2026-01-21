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

    var data = {"OkPercent": 93.93939393939394, "KoPercent": 6.0606060606060606};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.24615384615384617, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5, 500, 1500, "Enhanced Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "RED List Report"], "isController": true}, {"data": [0.5714285714285714, 500, 1500, "FPR - 1 Year"], "isController": true}, {"data": [0.0, 500, 1500, "Radial Map"], "isController": true}, {"data": [1.0, 500, 1500, "Basic Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "EPR"], "isController": true}, {"data": [0.0, 500, 1500, "LBO Map"], "isController": true}, {"data": [0.75, 500, 1500, "Token"], "isController": false}, {"data": [0.0, 500, 1500, "FPR - 5 Year"], "isController": true}, {"data": [0.0, 500, 1500, "Interconnection Map"], "isController": true}, {"data": [0.0, 500, 1500, "Investee Companies Map"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 33, 2, 6.0606060606060606, 2505415.2424242417, 59, 77506344, 7499.0, 74821.60000000003, 2.6589664199999794E7, 7.7506344E7, 3.991055440053471E-4, 0.301606865815697, 7.333706098919277E-4], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Enhanced Entity Search", 6, 0, 0.0, 1338.0, 269, 2350, 1395.0, 2350.0, 2350.0, 2350.0, 7.707918500118195E-5, 1.393296596066287E-4, 1.501689199974199E-4], "isController": true}, {"data": ["RED List Report", 6, 2, 33.333333333333336, 2.5845280333333332E7, 8295, 77506344, 21202.0, 7.7506344E7, 7.7506344E7, 7.7506344E7, 7.712940698631227E-5, 8.516874165982047E-4, 1.0133277558488161E-4], "isController": true}, {"data": ["FPR - 1 Year", 7, 2, 28.571428571428573, 948.4285714285716, 301, 2736, 312.0, 2736.0, 2736.0, 2736.0, 0.024641379917275368, 0.10195852217724193, 0.057241017997007836], "isController": true}, {"data": ["Radial Map", 6, 0, 0.0, 57438.0, 26770, 83020, 62524.0, 83020.0, 83020.0, 83020.0, 7.705532064741624E-5, 0.45438160572789443, 1.5599187470907605E-4], "isController": true}, {"data": ["Basic Entity Search", 6, 0, 0.0, 241.33333333333331, 172, 306, 246.0, 306.0, 306.0, 306.0, 7.71253212687393E-5, 5.2496434496397744E-5, 1.4415807119957716E-4], "isController": true}, {"data": ["EPR", 6, 0, 0.0, 19748.333333333332, 17631, 22018, 19596.0, 22018.0, 22018.0, 22018.0, 7.710605156050825E-5, 8.44476922120215E-4, 1.4773639957198946E-4], "isController": true}, {"data": ["LBO Map", 6, 0, 0.0, 7892.666666666667, 5913, 10555, 7210.0, 10555.0, 10555.0, 10555.0, 7.711637108454318E-5, 0.11378189194117343, 1.561154660725176E-4], "isController": true}, {"data": ["Token", 4, 0, 0.0, 446.0, 59, 833, 446.0, 833.0, 833.0, 833.0, 5.152002624636217E-5, 1.1425974570848485E-4, 1.3030944138484183E-5], "isController": false}, {"data": ["FPR - 5 Year", 6, 0, 0.0, 1595822.6666666665, 5359, 4768230, 13879.0, 4768230.0, 4768230.0, 4768230.0, 0.0011890104519963784, 0.01954784273374905, 0.0023664094737974794], "isController": true}, {"data": ["Interconnection Map", 6, 0, 0.0, 16564.333333333336, 7059, 30566, 12068.0, 30566.0, 30566.0, 30566.0, 7.711026109328779E-5, 0.01006055468000424, 1.7470293528948014E-4], "isController": true}, {"data": ["Investee Companies Map", 6, 0, 0.0, 13848.0, 7499, 19563, 14482.0, 19563.0, 19563.0, 19563.0, 7.711821467836995E-5, 0.058854151249718024, 1.5611919826978603E-4], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["401/Unauthorized", 1, 50.0, 3.0303030303030303], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, 50.0, 3.0303030303030303], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 33, 2, "401/Unauthorized", 1, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["RED List Report", 3, 1, "Non HTTP response code: java.net.SocketTimeoutException/Non HTTP response message: Read timed out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["FPR - 1 Year", 4, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
