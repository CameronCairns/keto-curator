function fetchJSON(url, dataStore) {
    //return $.getJSON(url, function(json_data) {dataStore = json_data});
    $.ajax({url:url,
            dataType:'json',
            async: false,
            success:function(json_data) {
                return json_data}});
}

function generatePage(data, nutrient_data, food_groups) {
    var tableHeader;
    var HTML = document.getElementById("javascript-fill-in");
    var sortKey = 'available_carbohydrate';
    var attributes = ['description', 'manufacturer',
                      'available_carbohydrate'];
    //Sort food_groups into alphabetical order
    food_groups.sort();
    // Sort the data according to the defined sortKey
    // Separate comparison logic for numerical and string attributes
    if( sortKey in ['description', 'food_group', 'manufacturer']) {
        data.sort( function(a, b) {
            return a[sortKey] >= b[sortKey] ? 1 : -1;
        });
    } else {
        data.sort( function(a, b) {
            return a[sortKey] - b[sortKey];
        });
    }
    // Construct the table header that will be shared amongst each food group
    // consists of headers defined by the attributes list
    tableHeader = '<table class="table"><tr>';
    for (var i = 0; i < attributes.length; i++) {
        // Display every attribute specified in the attributes list
        tableHeader +=  '<th>' + attributes[i] + '</th>';
    }
    sections = {}
    for (var i = 0; i < food_groups.length; i++) {
        sections[food_groups[i]] = '<h3>' + food_groups[i] + '</h3>';
        sections[food_groups[i]] += tableHeader;
    }
    for (var i = 0; i < data.length; i++) {
        //Loop over every fooditem in the nutrition-data file
        sections[data[i]['food_group']] += '<tr>';
        for (var j = 0; j < attributes.length; j++) {
            // Display every attribute specified in the attributes list
            sections[data[i]['food_group']] += '<td>' +
                                                   data[i][attributes[j]] +
                                               '</td>';
        }
        sections[data[i]['food_group']] += '</tr>';
    }
    tableFooter = '</table>';
    pageHTML = '';
    for (var food_group in sections) {
        pageHTML += sections[food_group]
        pageHTML += tableFooter
    }
    HTML.innerHTML = pageHTML;
}

$(document).ready(function () {
    // Load the necessary JSON data before moving on with the rest of the logic
    var data, nutrient_data, food_groups
    //Wait for the all the JSON data to load
    $.ajax({url:'resources/nutrition-data.json',
            dataType:'json',
            async: false,
            success: function (json_data){data=json_data;}});
    $.ajax({url:'resources/nutrient-descriptions.json',
            dataType:'json',
            async: false,
            success: function (json_data){nutrient_data=json_data;}});
    $.ajax({url:'resources/food-groups.json',
            dataType:'json',
            async: false,
            success: function (json_data){food_groups=json_data;}});
    generatePage(data, nutrient_data, food_groups);
});
