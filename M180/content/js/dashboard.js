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

    var data = {"OkPercent": 85.32035685320356, "KoPercent": 14.679643146796431};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.013246823465801569, 1500, 3000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.018957345971563982, 1500, 3000, "ListHoliday"], "isController": false}, {"data": [0.022488755622188907, 1500, 3000, "HolidayRegister"], "isController": false}, {"data": [0.00931098696461825, 1500, 3000, "Logout"], "isController": false}, {"data": [0.024531024531024532, 1500, 3000, "Login"], "isController": false}, {"data": [0.0, 1500, 3000, "ListHolidayAdmin"], "isController": false}, {"data": [0.0, 1500, 3000, "SearchHoliday"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3699, 543, 14.679643146796431, 35032.274398486166, 238, 91593, 34017.0, 59999.0, 60003.0, 68456.0, 4.380599356943646, 13997.093606916631, 2.2668825885534787], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["ListHoliday", 633, 105, 16.587677725118482, 33978.55608214853, 261, 82216, 33151.0, 59999.0, 60002.0, 71826.2799999999, 0.7546917864973359, 60.0870172930827, 0.374474722445106], "isController": false}, {"data": ["HolidayRegister", 667, 115, 17.24137931034483, 34468.92053973017, 238, 91415, 32906.0, 60000.0, 60008.0, 68517.44, 0.7938066420312881, 32.88318166806505, 0.65544648648327], "isController": false}, {"data": ["Logout", 537, 86, 16.01489757914339, 35931.37430167597, 633, 76277, 33727.0, 59999.0, 60009.0, 69773.16, 0.6481499362712911, 31.86455007214742, 0.3301499593548434], "isController": false}, {"data": ["Login", 693, 61, 8.802308802308803, 32443.474747474775, 301, 82419, 31948.0, 59998.0, 60003.0, 68143.58, 0.828202382545844, 1.2257811211535796, 0.23175199499074997], "isController": false}, {"data": ["ListHolidayAdmin", 599, 90, 15.025041736227045, 36668.18530884811, 3470, 91593, 35851.0, 59998.0, 60004.0, 73954.0, 0.7109800723799079, 7120.729749660682, 0.353580955659888], "isController": false}, {"data": ["SearchHoliday", 570, 86, 15.087719298245615, 37442.926315789424, 3537, 84628, 36486.5, 59999.0, 60464.19999999994, 68064.03999999998, 0.6785795068988917, 6803.121314595263, 0.33808647461576924], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 309, 56.9060773480663, 8.35360908353609], "isController": false}, {"data": ["500/Internal Server Error", 234, 43.0939226519337, 6.326034063260341], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3699, 543, "504/Gateway Time-out", 309, "500/Internal Server Error", 234, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["ListHoliday", 633, 105, "504/Gateway Time-out", 54, "500/Internal Server Error", 51, "", "", "", "", "", ""], "isController": false}, {"data": ["HolidayRegister", 667, 115, "504/Gateway Time-out", 68, "500/Internal Server Error", 47, "", "", "", "", "", ""], "isController": false}, {"data": ["Logout", 537, 86, "500/Internal Server Error", 45, "504/Gateway Time-out", 41, "", "", "", "", "", ""], "isController": false}, {"data": ["Login", 693, 61, "504/Gateway Time-out", 61, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["ListHolidayAdmin", 599, 90, "500/Internal Server Error", 47, "504/Gateway Time-out", 43, "", "", "", "", "", ""], "isController": false}, {"data": ["SearchHoliday", 570, 86, "500/Internal Server Error", 44, "504/Gateway Time-out", 42, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
