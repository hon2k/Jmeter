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

    var data = {"OkPercent": 73.4060606060606, "KoPercent": 26.593939393939394};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.011636363636363636, 1500, 3000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.017482517482517484, 1500, 3000, "ListHoliday"], "isController": false}, {"data": [0.018666666666666668, 1500, 3000, "HolidayRegister"], "isController": false}, {"data": [0.007666098807495741, 1500, 3000, "Logout"], "isController": false}, {"data": [0.021822849807445442, 1500, 3000, "Login"], "isController": false}, {"data": [0.0, 1500, 3000, "ListHolidayAdmin"], "isController": false}, {"data": [0.0, 1500, 3000, "SearchHoliday"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4125, 1097, 26.593939393939394, 38627.23951515132, 238, 91644, 35512.0, 60002.0, 60753.69999999999, 76574.95999999998, 4.842822526110151, 14105.79983900917, 2.4366883961422956], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["ListHoliday", 715, 199, 27.832167832167833, 37775.37482517483, 264, 91597, 33735.0, 60001.0, 60026.6, 74769.40000000004, 0.8415348654368096, 82.21188299458122, 0.4036576643523477], "isController": false}, {"data": ["HolidayRegister", 750, 226, 30.133333333333333, 37418.79733333332, 238, 91549, 33741.0, 60002.0, 60009.0, 71652.00000000003, 0.8859111773641426, 49.82150020235688, 0.7171381768952002], "isController": false}, {"data": ["Logout", 587, 192, 32.70868824531516, 41357.49403747866, 1001, 91644, 39158.0, 60004.0, 65356.200000000004, 91477.56, 0.6998259376713798, 46.02897958940366, 0.34360032204511315], "isController": false}, {"data": ["Login", 779, 110, 14.120667522464698, 35154.37612323494, 299, 91400, 32560.0, 60000.0, 60010.0, 71807.60000000014, 0.9210933934310315, 1.3010668192510884, 0.2577838913446781], "isController": false}, {"data": ["ListHolidayAdmin", 669, 182, 27.20478325859492, 39726.33183856503, 3798, 78481, 36753.0, 60001.0, 60976.0, 73141.19999999978, 0.7862254245793576, 7346.040988372179, 0.3762624669321108], "isController": false}, {"data": ["SearchHoliday", 625, 188, 30.08, 41639.75679999998, 4060, 91557, 39553.0, 60001.0, 62367.599999999955, 80209.16000000002, 0.7384643014541248, 6631.398878557035, 0.3533367066382624], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 712, 64.90428441203282, 17.26060606060606], "isController": false}, {"data": ["500/Internal Server Error", 385, 35.095715587967184, 9.333333333333334], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4125, 1097, "504/Gateway Time-out", 712, "500/Internal Server Error", 385, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["ListHoliday", 715, 199, "504/Gateway Time-out", 118, "500/Internal Server Error", 81, "", "", "", "", "", ""], "isController": false}, {"data": ["HolidayRegister", 750, 226, "504/Gateway Time-out", 154, "500/Internal Server Error", 72, "", "", "", "", "", ""], "isController": false}, {"data": ["Logout", 587, 192, "504/Gateway Time-out", 126, "500/Internal Server Error", 66, "", "", "", "", "", ""], "isController": false}, {"data": ["Login", 779, 110, "504/Gateway Time-out", 110, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["ListHolidayAdmin", 669, 182, "504/Gateway Time-out", 96, "500/Internal Server Error", 86, "", "", "", "", "", ""], "isController": false}, {"data": ["SearchHoliday", 625, 188, "504/Gateway Time-out", 108, "500/Internal Server Error", 80, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
