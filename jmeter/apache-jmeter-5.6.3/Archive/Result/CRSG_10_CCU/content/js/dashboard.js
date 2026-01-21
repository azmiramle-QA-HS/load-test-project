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

    var data = {"OkPercent": 32.432432432432435, "KoPercent": 67.56756756756756};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.09009009009009009, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9, 500, 1500, "Enhanced Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "RED List Report"], "isController": true}, {"data": [0.0, 500, 1500, "FPR - 1 Year"], "isController": true}, {"data": [0.05, 500, 1500, "Basic Entity Search"], "isController": true}, {"data": [0.0, 500, 1500, "Radial Map"], "isController": true}, {"data": [0.0, 500, 1500, "RPR"], "isController": true}, {"data": [0.0, 500, 1500, "EPR"], "isController": true}, {"data": [0.0, 500, 1500, "LBO Map"], "isController": true}, {"data": [0.5, 500, 1500, "Token"], "isController": false}, {"data": [0.0, 500, 1500, "FPR - 5 Year"], "isController": true}, {"data": [0.0, 500, 1500, "Interconnection Map"], "isController": true}, {"data": [0.0, 500, 1500, "Investee Companies Map"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 222, 150, 67.56756756756756, 29207.405405405414, 15, 167804, 76.0, 152882.30000000002, 167597.0, 167794.11, 0.6723910771886783, 359.88421508942497, 1.3279108551784713], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Enhanced Entity Search", 40, 0, 0.0, 461.90000000000003, 130, 2118, 292.0, 1939.9999999999975, 2118.0, 2118.0, 5.41198755242863, 10.237324110404547, 10.580858476525504], "isController": true}, {"data": ["RED List Report", 40, 40, 100.0, 38.800000000000004, 17, 76, 37.5, 73.49999999999997, 76.0, 76.0, 183.4862385321101, 123.27981651376147, 362.8512041284404], "isController": true}, {"data": ["FPR - 1 Year", 40, 40, 100.0, 18.9, 17, 22, 18.5, 21.9, 22.0, 22.0, 196.078431372549, 131.74019607843138, 393.6887254901961], "isController": true}, {"data": ["Basic Entity Search", 40, 0, 0.0, 4578.000000000001, 813, 7830, 4927.5, 7729.699999999999, 7830.0, 7830.0, 2.6500596263415925, 1.8633231747714325, 4.971449748244336], "isController": true}, {"data": ["Radial Map", 40, 0, 0.0, 166218.09999999998, 160140, 167804, 167638.0, 167799.7, 167804.0, 167804.0, 0.23834209240522922, 1263.8810993231084, 0.48413237519812186], "isController": true}, {"data": ["RPR", 40, 40, 100.0, 44.6, 28, 76, 38.5, 76.0, 76.0, 76.0, 173.91304347826087, 116.84782608695652, 345.1086956521739], "isController": true}, {"data": ["EPR", 40, 40, 100.0, 28.0, 20, 36, 28.0, 35.49999999999999, 36.0, 36.0, 228.57142857142856, 153.57142857142858, 439.5089285714286], "isController": true}, {"data": ["LBO Map", 40, 32, 80.0, 18121.799999999996, 84, 71514, 107.0, 70582.59999999999, 71514.0, 71514.0, 0.3570217247719524, 224.2007176136668, 0.7252003784430283], "isController": true}, {"data": ["Token", 4, 0, 0.0, 1487.0, 1487, 1487, 1487.0, 1487.0, 1487.0, 1487.0, 1.9342359767891684, 4.289697171179884, 0.5024480174081237], "isController": false}, {"data": ["FPR - 5 Year", 40, 40, 100.0, 22.200000000000003, 16, 36, 18.5, 36.0, 36.0, 36.0, 199.00497512437812, 133.70646766169153, 397.4269278606965], "isController": true}, {"data": ["Interconnection Map", 40, 28, 70.0, 126420.9, 40440, 152954, 152487.5, 152930.1, 152954.0, 152954.0, 0.26151482462162073, 0.8978079745676832, 0.5442266516295642], "isController": true}, {"data": ["Investee Companies Map", 40, 40, 100.0, 8100.3, 15, 40410, 20.5, 40409.9, 40410.0, 40410.0, 0.9862176089154072, 0.6626149559900393, 2.003254518109421], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 150, 100.0, 67.56756756756756], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 222, 150, "502/Bad Gateway", 150, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["RED List Report", 20, 20, "502/Bad Gateway", 20, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["FPR - 1 Year", 20, 20, "502/Bad Gateway", 20, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["RPR", 20, 20, "502/Bad Gateway", 20, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["EPR", 20, 20, "502/Bad Gateway", 20, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["LBO Map", 20, 16, "502/Bad Gateway", 16, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["FPR - 5 Year", 20, 20, "502/Bad Gateway", 20, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Interconnection Map", 20, 14, "502/Bad Gateway", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Investee Companies Map", 20, 20, "502/Bad Gateway", 20, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
