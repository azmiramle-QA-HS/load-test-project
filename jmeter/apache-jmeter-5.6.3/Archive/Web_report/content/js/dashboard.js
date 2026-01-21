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

    var data = {"OkPercent": 50.413223140495866, "KoPercent": 49.586776859504134};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.047520661157024795, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.25, 500, 1500, "Enhanced Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "Radial Map"], "isController": true}, {"data": [0.0, 500, 1500, "EPR"], "isController": true}, {"data": [0.0, 500, 1500, "LBO Map"], "isController": true}, {"data": [0.0, 500, 1500, "IC Map"], "isController": true}, {"data": [0.75, 500, 1500, "Login"], "isController": true}, {"data": [0.0, 500, 1500, "Interconnection Map"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 121, 60, 49.586776859504134, 2489542.289256198, 1, 14897443, 9621.0, 1.48470406E7, 1.48611193E7, 1.4897443E7, 0.00803094768833153, 1.3752135216809038, 0.008541826511286633], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Enhanced Entity Search", 40, 0, 0.0, 4212.0, 223, 9621, 3566.0, 9499.999999999998, 9621.0, 9621.0, 2.733173898189272, 13.3188845234028, 5.655854970960028], "isController": true}, {"data": ["Radial Map", 40, 0, 0.0, 152296.09999999995, 137837, 163510, 152495.5, 163345.6, 163510.0, 163510.0, 0.22691559307226694, 231.13746404806074, 0.4884003585266371], "isController": true}, {"data": ["EPR", 40, 40, 100.0, 1.8000000000000003, 1, 7, 1.0, 6.499999999999993, 7.0, 7.0, 1052.6315789473683, 2239.9259868421054, 0.0], "isController": true}, {"data": ["LBO Map", 40, 40, 100.0, 1.4854037700000001E7, 14837604, 14897443, 1.48506035E7, 1.48946146E7, 1.4897443E7, 1.4897443E7, 0.002685021473459234, 0.00829367472710113, 0.0], "isController": true}, {"data": ["IC Map", 40, 40, 100.0, 67.10000000000001, 19, 104, 76.0, 102.99999999999999, 104.0, 104.0, 363.6363636363636, 804.6519886363636, 0.0], "isController": true}, {"data": ["Login", 2, 0, 0.0, 648.5, 353, 944, 648.5, 944.0, 944.0, 944.0, 2.1186440677966103, 4.698672537076272, 0.5503509004237288], "isController": true}, {"data": ["Interconnection Map", 40, 0, 0.0, 51098.49999999999, 20345, 60641, 53962.0, 60587.6, 60641.0, 60641.0, 0.4988775255674732, 2.483669555999002, 1.0976279932651534], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 20, 33.333333333333336, 16.52892561983471], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (api-preprod.stg.handshakes.ai)", 2, 3.3333333333333335, 1.6528925619834711], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api-preprod.stg.handshakes.ai", 38, 63.333333333333336, 31.40495867768595], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 121, 60, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api-preprod.stg.handshakes.ai", 38, "Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 20, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (api-preprod.stg.handshakes.ai)", 2, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["EPR", 20, 20, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api-preprod.stg.handshakes.ai", 20, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["LBO Map", 20, 20, "Non HTTP response code: java.net.SocketException/Non HTTP response message: An established connection was aborted by the software in your host machine", 20, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["IC Map", 20, 20, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: api-preprod.stg.handshakes.ai", 18, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (api-preprod.stg.handshakes.ai)", 2, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
