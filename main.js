//Global variables to be reused
var data, extraAttributes, foodGroups, nutrientData, sections, sortKey

function fetchJSON(url, dataStore) {
    //return $.getJSON(url, function(json_data) {dataStore = json_data});
    $.ajax({url:url,
            dataType:'json',
            async: false,
            success:function(json_data) {
                return json_data}});
}

function formatData() {
    //Gather all extra attributes to display in the food data
    extraAttributes = []
    for(var key in data[0]) {
        if(!(key in ['description', 'food_group', 'available_carbohydrate'])) {
            extraAttributes.push(key)
        }
    }
    extraAttributes.sort()
    //Sort foodGroups into alphabetical order
    foodGroups.sort();
    // Initialize sortKey as 'available_carbohydrate' as a default
    sortKey = 'available_carbohydrate';
    // Foods are separated into diferent groups, so create an object to
    // associate the group name of each section with its corresponding HTML
    sections = {}
    //Populate the header of each section using the food group's name
    for (var i = 0; i < foodGroups.length; i++) {
        sections[foodGroups[i]] = {'header': '', 'tableData': ''}
        sections[foodGroups[i]]['header'] += '<h3>' +
                                                  foodGroups[i] +
                                             '</h3>';
    }
}

function initializePage() {
    var element = document.getElementById("initializer-parameters");
    var attributes = ['description', 'available_carbohydrate',
                      'alternate_measurements'];
    var HTML = '';
    //Gather all extra attributes to display in the food data
    //Give user an interface to select which attributes they would like to see
    attributeChoices = '<select multiple>'
    for(var i = 0; i < extraAttributes.length; i++) {
        attributeChoices += '<option value="' + extraAttributes[i] + '">' +
                                 extraAttributes[i] +
                            '</option>'
    }
    attributeChoices += '</select multiple>'
    HTML += attributeChoices
    foodGroupsChoices = '<select multiple>'
    for(var i = 0; i < foodGroups.length; i++) {
        foodGroupsChoices += '<option value="' + foodGroups[i] + '">' +
                                  foodGroups[i] +
                             '</option>'
    }
    foodGroupsChoices += '</select multiple>'
    HTML += foodGroupsChoices
    element.innerHTML = HTML
    displayData()
}

function displayData() {
    var element = document.getElementById("javascript-fill-in");
    var extraHeader = '';
    var HTML = '';
    var tableData = '';
    var tableHeader;
    var selectedAttributes = []
    var attributes =  selectedAttributes.concat(['available_carbohydrate'])
    // Sort the data according to the defined sortKey
    // use separate comparison logic for numerical and string attributes
    if( sortKey in ['description', 'food_group', 'manufacturer']) {
        data.sort( function(a, b) {
            return a[sortKey] >= b[sortKey] ? 1 : -1;
        });
    } else {
        data.sort( function(a, b) {
            return a['nutrients']['100 gram'][sortKey] - b[
                'nutrients']['100 gram'][sortKey];
        });
    }
    // Construct the table header that will be shared amongst each food group
    // table. consists of headers defined by the attributes list
    tableHeader = '<table class="table">' +
                      '<tr>' +
                          '<th>' +
                              'Food Description' +
                          '</th>' +
                          '<th>' +
                              'Measurements' +
                          '</th>' +
                          '<th>' +
                              'Available Carbohydrate' +
                          '</th>';
    // Construct the headers for any extra attributes the user chose to see
    for (var i = 0; i < selectedAttributes.length; i++) {
        // Display every attribute specified in the attributes list
        tableHeader +=  '<th>' + selectedAttributes[i] + '</th>';
    }
    //Header construction is completed so close the header row
    tableHeader += '</tr>'
    // Construct the data for any extra attributes the user chose to see
    for (var i = 0; i < data.length; i++) {
        // Loop over every food item in the nutrition-data file and add selected
        // data
        // First add the description for the food item its respective food group
        sections[data[i]['food_group']]['tableData'] += '<tr>' +
                                                            '<td>' +
                                                                data[i]['description'] +
                                                            '</td>';
        // Fill in measurements available for the food item
        sections[data[i]['food_group']]['tableData'] += '<td><ul>';
        for(measurement in data[i]['nutrients']) {
            sections[data[i]['food_group']]['tableData'] += '<li>' +
                                                                measurement +
                                                            '</li>';
        }
        sections[data[i]['food_group']]['tableData'] += '</ul></td>';
        // Now iterate over each nutrient specified
        for (var j = 0; j < attributes.length; j++) {
            // Display every attribute specified in the attributes list
            // and show the values for 100 grams first
            sections[data[i]['food_group']]['tableData'] +=
                    '<td>' +
                        '<ul>' +
                            '<li>' +
                                data[i]['nutrients']['100 gram'][
                                    attributes[j]] +
                            '</li>';
            for(measurement in data[i]['nutrients']) {
                // Iterate over attribute values for each measurement
                // that is not 100 gram
                if(measurement != '100 gram') {
                    sections[data[i]['food_group']]['tableData'] +=
                        '<li>' +
                            data[i]['nutrients'][measurement][attributes[j]] +
                        '</li>';
                }
            }
            sections[data[i]['food_group']]['tableData'] += '</ul></td>'
        }
        sections[data[i]['food_group']]['tableData'] += '</tr>';
    }
    for (var food_group in sections) {
        HTML += sections[food_group]['header'] + tableHeader
        HTML += sections[food_group]['tableData'] + '</table>'
    }
    element.innerHTML = HTML
}

$(document).ready(function () {
    // Load the necessary JSON data before moving on with the rest of the logic
    //Wait for the all the JSON data to load
    $.ajax({url:'resources/nutrition-data.json',
            dataType:'json',
            async: false,
            success: function (json_data){data=json_data;}});
    $.ajax({url:'resources/nutrient-descriptions.json',
            dataType:'json',
            async: false,
            success: function (json_data){nutrientData=json_data;}});
    $.ajax({url:'resources/food-groups.json',
            dataType:'json',
            async: false,
            success: function (json_data){foodGroups=json_data;}});
    //format data to assist in displaying it 
    formatData();
    //initialize page for user control
    initializePage();
});
