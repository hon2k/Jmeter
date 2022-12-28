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

    var data = {"OkPercent": 53.850770154030805, "KoPercent": 46.149229845969195};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.005601120224044809, 1500, 3000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.008741258741258742, 1500, 3000, "ListHoliday"], "isController": false}, {"data": [0.010359869138495093, 1500, 3000, "HolidayRegister"], "isController": false}, {"data": [0.0, 1500, 3000, "Logout"], "isController": false}, {"data": [0.011387163561076604, 1500, 3000, "Login"], "isController": false}, {"data": [0.0, 1500, 3000, "ListHolidayAdmin"], "isController": false}, {"data": [0.0, 1500, 3000, "SearchHoliday"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4999, 2307, 46.149229845969195, 43390.504300860026, 235, 91618, 42340.0, 60011.0, 67103.0, 87041.0, 5.896681273702028, 13908.153717744231, 2.757742969749872], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["ListHoliday", 858, 422, 49.184149184149184, 43467.65501165498, 268, 91565, 42055.0, 60010.0, 67145.7, 82038.50999999998, 1.0147373450544563, 128.52796296023897, 0.44126577470110784], "isController": false}, {"data": ["HolidayRegister", 917, 420, 45.80152671755725, 42407.32497273718, 235, 91576, 41033.0, 60013.2, 67244.2, 91392.74, 1.0852199434312833, 88.48232833191813, 0.8291240872673049], "isController": false}, {"data": ["Logout", 706, 410, 58.07365439093484, 45696.311614730905, 3080, 91618, 47163.0, 60019.3, 70520.65, 91426.88, 0.8489515568520972, 99.55196945149733, 0.38219166283876893], "isController": false}, {"data": ["Login", 966, 280, 28.985507246376812, 39661.11594202898, 303, 91570, 36699.5, 60006.0, 64606.299999999996, 75414.66, 1.1416685379315235, 1.3969738507971587, 0.3195188590257998], "isController": false}, {"data": ["ListHolidayAdmin", 794, 363, 45.71788413098237, 44000.3350125945, 4494, 91595, 43596.5, 60002.0, 63433.0, 77418.89999999989, 0.9402224561594636, 7546.307376031847, 0.4081995887118834], "isController": false}, {"data": ["SearchHoliday", 758, 412, 54.35356200527705, 46458.926121371995, 4999, 91552, 47723.0, 60030.2, 67271.25, 91401.4, 0.899846385063025, 6114.586553120912, 0.3932990621802162], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 1572, 68.14044213263979, 31.44628925785157], "isController": false}, {"data": ["500/Internal Server Error", 735, 31.85955786736021, 14.702940588117624], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4999, 2307, "504/Gateway Time-out", 1572, "500/Internal Server Error", 735, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["ListHoliday", 858, 422, "504/Gateway Time-out", 272, "500/Internal Server Error", 150, "", "", "", "", "", ""], "isController": false}, {"data": ["HolidayRegister", 917, 420, "504/Gateway Time-out", 292, "500/Internal Server Error", 128, "", "", "", "", "", ""], "isController": false}, {"data": ["Logout", 706, 410, "504/Gateway Time-out", 268, "500/Internal Server Error", 142, "", "", "", "", "", ""], "isController": false}, {"data": ["Login", 966, 280, "504/Gateway Time-out", 280, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["ListHolidayAdmin", 794, 363, "504/Gateway Time-out", 210, "500/Internal Server Error", 153, "", "", "", "", "", ""], "isController": false}, {"data": ["SearchHoliday", 758, 412, "504/Gateway Time-out", 250, "500/Internal Server Error", 162, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
