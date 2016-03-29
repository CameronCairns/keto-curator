$(document).ready(function () {
    $.getJSON('resources/nutrition-data.json', function(data) {
        var tableHeader = '';
        Object.keys(data[0]).forEach(function(key, keyIndex, array) {
            //Populate table header using the keys from the JSON file created
            //earlier for convenience. Will clean this up later with custom
            //headers with more information
            tableHeader += '<th>' + key + '</th>';
        });
        var tableData = ''
        data.forEach( function(itemEntry, itemIndex, itemArray) {
            //Loop over every fooditem in the nutrition-data file
            tableHeader += '<tr>';
            for (var attribute in itemEntry) {
                        //Populate table data using the value from each of the
                        //data points in the json file
                        if( itemEntry.hasOwnProperty( attribute ) ) {
                            tableHeader += '<td>' +
                                            itemEntry[attribute] +
                                            '</td>';
                        }
                    }
            tableHeader += '</tr>';
        });
        var dataTable = document.getElementById("data-table");
        dataTable.innerHTML = tableHeader + tableData;
    });
});
