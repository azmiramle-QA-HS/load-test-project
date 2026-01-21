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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2916666666666667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Enhanced Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "RED List Report"], "isController": true}, {"data": [0.5, 500, 1500, "FPR - 1 Year"], "isController": true}, {"data": [1.0, 500, 1500, "Basic Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "Radial Map"], "isController": true}, {"data": [0.0, 500, 1500, "RPR"], "isController": true}, {"data": [0.0, 500, 1500, "EPR"], "isController": true}, {"data": [0.0, 500, 1500, "LBO Map"], "isController": true}, {"data": [0.5, 500, 1500, "Token"], "isController": false}, {"data": [0.5, 500, 1500, "FPR - 5 Year"], "isController": true}, {"data": [0.0, 500, 1500, "Interconnection Map"], "isController": true}, {"data": [0.0, 500, 1500, "Investee Companies Map"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 24, 0, 0.0, 18184.75, 308, 55064, 12151.5, 54475.0, 55064.0, 55064.0, 0.10991477025523125, 83.96010752183412, 0.20293264915205333], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Enhanced Entity Search", 4, 0, 0.0, 308.0, 308, 308, 308.0, 308.0, 308.0, 308.0, 12.987012987012989, 24.566254058441558, 25.390625], "isController": true}, {"data": ["RED List Report", 4, 0, 0.0, 11781.0, 11781, 11781, 11781.0, 11781.0, 11781.0, 11781.0, 0.33952975129445717, 5.2434799677446735, 0.6714333460656989], "isController": true}, {"data": ["FPR - 1 Year", 4, 0, 0.0, 846.0, 846, 846, 846.0, 846.0, 846.0, 846.0, 4.7281323877068555, 9.008385047281324, 9.493203309692671], "isController": true}, {"data": ["Basic Entity Search", 4, 0, 0.0, 333.0, 333, 333, 333.0, 333.0, 333.0, 333.0, 11.976047904191617, 8.42065868263473, 22.466785179640716], "isController": true}, {"data": ["Radial Map", 4, 0, 0.0, 55064.0, 55064, 55064, 55064.0, 55064.0, 55064.0, 55064.0, 0.07264142377190592, 385.2000902342686, 0.14755289203668392], "isController": true}, {"data": ["RPR", 4, 0, 0.0, 53886.0, 53886, 53886, 53886.0, 53886.0, 53886.0, 53886.0, 0.07422940597917865, 0.23994075565535286, 0.14729897748993265], "isController": true}, {"data": ["EPR", 4, 0, 0.0, 26824.0, 26824, 26824, 26824.0, 26824.0, 26824.0, 26824.0, 0.14911463187325255, 1.623514678471575, 0.286725302889096], "isController": true}, {"data": ["LBO Map", 4, 0, 0.0, 33405.0, 33405, 33405, 33405.0, 33405.0, 33405.0, 33405.0, 0.11974255350995361, 375.65484208950755, 0.24322706181709325], "isController": true}, {"data": ["Token", 4, 0, 0.0, 830.0, 830, 830, 830.0, 830.0, 830.0, 830.0, 2.5957170668397143, 5.756712362102531, 0.6742780661907852], "isController": false}, {"data": ["FPR - 5 Year", 4, 0, 0.0, 1143.0, 1143, 1143, 1143.0, 1143.0, 1143.0, 1143.0, 3.499562554680665, 58.234908136482936, 6.988872484689414], "isController": true}, {"data": ["Interconnection Map", 4, 0, 0.0, 21275.0, 21275, 21275, 21275.0, 21275.0, 21275.0, 21275.0, 0.18801410105757932, 1.85682285546416, 0.39126762632197415], "isController": true}, {"data": ["Investee Companies Map", 4, 0, 0.0, 12522.0, 12522, 12522, 12522.0, 12522.0, 12522.0, 12522.0, 0.3194377894904967, 211.99189426609166, 0.6488580099025715], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 24, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
