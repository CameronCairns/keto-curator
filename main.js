$(document).ready(function () {
    $.getJSON('resources/nutrition-data.json', function(data) {
        var tableHeader = '';
        var tableData = '';
        var dataTable = document.getElementById("data-table");
        var sort_key = 'carbohydrate' 
           /* (
                document.getElementById("sort-key").getAttribute('value') ||
                'carbohydrate'
                )
                */
        data.sort( function(a, b) {
            return a[sort_key] - b[sort_key]
        });
        tableHeader = '<tr>' +
            '<th>Food</th>' +
            '<th>Carbohydrates</th>' +
            '<th>Fiber</th>' +
            '<th>Available Carbohydrates</th>' +
            '</tr>';
        data.forEach( function(itemEntry, itemIndex, itemArray) {
            //Loop over every fooditem in the nutrition-data file
            tableData += '<tr>' +
                '<td>' + itemEntry['description'] + '</td>' +
                '<td>' + itemEntry['carbohydrate'] + '</td>' +
                '<td>' + itemEntry['fiber'] + '</td>' +
                '<td>' + itemEntry['available_carbohydrate'] + '</td>' +
                '</tr>';
        });
        dataTable.innerHTML = tableHeader + tableData;
    });
});
