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

    var data = {"OkPercent": 26.31578947368421, "KoPercent": 73.6842105263158};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.07894736842105263, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3333333333333333, 500, 1500, "Enhanced Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "Radial Map"], "isController": true}, {"data": [0.0, 500, 1500, "EPR"], "isController": true}, {"data": [0.0, 500, 1500, "LBO Map"], "isController": true}, {"data": [0.5, 500, 1500, "Token"], "isController": true}, {"data": [0.0, 500, 1500, "Interconnection Map"], "isController": true}, {"data": [0.0, 500, 1500, "Investee Companies Map"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 19, 14, 73.6842105263158, 4367.894736842105, 0, 33431, 1.0, 23401.0, 33431.0, 33431.0, 0.22611510448897987, 24.53117608490622, 0.10474791512948065], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Enhanced Entity Search", 6, 4, 66.66666666666667, 164.99999999999997, 0, 494, 1.0, 494.0, 494.0, 494.0, 0.07283409606817272, 0.3514387389383216, 0.05007344104686874], "isController": true}, {"data": ["Radial Map", 6, 4, 66.66666666666667, 7800.666666666666, 0, 23401, 1.0, 23401.0, 23401.0, 23401.0, 0.07331736644019747, 32.22641930201867, 0.05243432749645633], "isController": true}, {"data": ["EPR", 6, 6, 100.0, 0.6666666666666667, 0, 1, 1.0, 1.0, 1.0, 1.0, 95.23809523809523, 202.00892857142858, 0.0], "isController": true}, {"data": ["LBO Map", 6, 4, 66.66666666666667, 11144.333333333334, 1, 33431, 1.0, 33431.0, 33431.0, 33431.0, 0.1344176355937899, 29.360539602795885, 0.09613136243475144], "isController": true}, {"data": ["Token", 2, 0, 0.0, 799.0, 799, 799, 799.0, 799.0, 799.0, 799.0, 0.5027652086475616, 1.1150193250377074, 0.12716424710910004], "isController": true}, {"data": ["Interconnection Map", 6, 4, 66.66666666666667, 4584.999999999999, 0, 13754, 1.0, 13754.0, 13754.0, 13754.0, 0.10271861946175444, 1.972384741149079, 0.0751664897623776], "isController": true}, {"data": ["Investee Companies Map", 6, 6, 100.0, 3701.3333333333335, 0, 11103, 1.0, 11103.0, 11103.0, 11103.0, 0.5359535506922732, 1.2004871036176865, 0.0], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api2.stg.handshakes.ai", 13, 92.85714285714286, 68.42105263157895], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (api2.stg.handshakes.ai)", 1, 7.142857142857143, 5.2631578947368425], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 19, 14, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api2.stg.handshakes.ai", 13, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (api2.stg.handshakes.ai)", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Enhanced Entity Search", 3, 2, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api2.stg.handshakes.ai", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Radial Map", 3, 2, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api2.stg.handshakes.ai", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["EPR", 3, 3, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api2.stg.handshakes.ai", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["LBO Map", 3, 2, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api2.stg.handshakes.ai", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Interconnection Map", 3, 2, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api2.stg.handshakes.ai", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Investee Companies Map", 3, 3, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api2.stg.handshakes.ai", 2, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (api2.stg.handshakes.ai)", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
