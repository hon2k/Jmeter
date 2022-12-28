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

    var data = {"OkPercent": 64.935956084172, "KoPercent": 35.064043915827995};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.008577310155535225, 1500, 3000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.011440107671601614, 1500, 3000, "ListHoliday"], "isController": false}, {"data": [0.014411027568922305, 1500, 3000, "HolidayRegister"], "isController": false}, {"data": [0.004761904761904762, 1500, 3000, "Logout"], "isController": false}, {"data": [0.01728247914183552, 1500, 3000, "Login"], "isController": false}, {"data": [0.0, 1500, 3000, "ListHolidayAdmin"], "isController": false}, {"data": [0.0, 1500, 3000, "SearchHoliday"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4372, 1533, 35.064043915827995, 41268.05489478504, 235, 91624, 38464.5, 60004.0, 64914.49999999999, 75681.83999999982, 5.174534001967081, 13936.947847422112, 2.5405174493317015], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["ListHoliday", 743, 263, 35.39703903095558, 40005.3768506057, 266, 91592, 36591.0, 60005.0, 64803.99999999999, 75656.91999999995, 0.883750527811974, 100.59651348596763, 0.41017169872195164], "isController": false}, {"data": ["HolidayRegister", 798, 306, 38.34586466165413, 40731.898496240596, 235, 91586, 37604.5, 60004.0, 65765.4, 78794.2799999999, 0.9488241358031297, 72.26936850061412, 0.7511361849481772], "isController": false}, {"data": ["Logout", 630, 272, 43.17460317460318, 43263.48571428568, 1769, 91604, 40237.5, 60005.9, 66182.59999999999, 77004.47999999986, 0.7577935457641145, 68.81379270332022, 0.3628733016553579], "isController": false}, {"data": ["Login", 839, 167, 19.904648390941595, 38063.73659118004, 303, 91601, 35697.0, 60003.0, 63579.0, 75370.2, 0.9974214456310206, 1.335621496319408, 0.27917458657237726], "isController": false}, {"data": ["ListHolidayAdmin", 703, 239, 33.99715504978663, 41811.27738264579, 4123, 91580, 39301.0, 60003.0, 62984.79999999999, 81207.6000000001, 0.8329186512167959, 7590.571637446387, 0.3867952070152366], "isController": false}, {"data": ["SearchHoliday", 659, 286, 43.39908952959029, 44933.364188163876, 4665, 91624, 42511.0, 60010.0, 67459.0, 83305.39999999986, 0.7882539397745283, 6178.214075956535, 0.3671473172901528], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 1013, 66.07958251793868, 23.17017383348582], "isController": false}, {"data": ["500/Internal Server Error", 520, 33.92041748206132, 11.893870082342177], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4372, 1533, "504/Gateway Time-out", 1013, "500/Internal Server Error", 520, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["ListHoliday", 743, 263, "504/Gateway Time-out", 157, "500/Internal Server Error", 106, "", "", "", "", "", ""], "isController": false}, {"data": ["HolidayRegister", 798, 306, "504/Gateway Time-out", 202, "500/Internal Server Error", 104, "", "", "", "", "", ""], "isController": false}, {"data": ["Logout", 630, 272, "504/Gateway Time-out", 174, "500/Internal Server Error", 98, "", "", "", "", "", ""], "isController": false}, {"data": ["Login", 839, 167, "504/Gateway Time-out", 167, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["ListHolidayAdmin", 703, 239, "504/Gateway Time-out", 135, "500/Internal Server Error", 104, "", "", "", "", "", ""], "isController": false}, {"data": ["SearchHoliday", 659, 286, "504/Gateway Time-out", 178, "500/Internal Server Error", 108, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
