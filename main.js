//Global variables to be reused
var ascending, data, fats, foodGroups, foodList, minerals, nutrientData,
    sections, vitamins;
    

function fetchJSON(url, dataStore) {
    //return $.getJSON(url, function(json_data) {dataStore = json_data});
    $.ajax({url:url,
            dataType:'json',
            async: false,
            success:function(json_data) {
                return json_data}});
}

function setDefaultSettings() {
    //Sort foodGroups into alphabetical order
    foodGroups.sort();
    // Initialize sortKey as 'available_carbohydrate' as a default
    ordering = 'available_carbohydrate';
    ascending = 1
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

function initializeGlobals() {
    // Indices of vitamin, minerals and fats based upon nutrient definition
    // numbers for the USDA nutrition database
    // Selected nutrients are from FDA minimum nutrient guidelines
    // http://www.fda.gov
    // /Food/GuidanceRegulation/GuidanceDocumentsRegulatoryInformation
    // /LabelingNutrition/ucm064928.htm
    vitamins = ['318', //Vitamin A
                '401', //Vitamin C
                '324', //Vitamin D
                '323', //Vitamin E
                '573', //Vitamin E, added
                '430', //Vitamin K
                '415', //Vitamin B6
                '418', //Vitamin B12
                '578', //Vitamin B12, added
                '404', //Thiamin
                '405', //Riboflavin
                '406', //Niacin
                '410', //Pantothenic Acid
                '417', //Folate
                '401', //Vitamin C
                //Note that biotin is not included
    ];
    minerals = ['301', //Calcium
                '307', //Sodium
                '305', //Phosphorus
                '304', //Magnesium
                '306', //Potassium
                '303', //Iron
                '315', //Manganese
                '312', //Copper
                '309', //Zinc
                '317', //Selenium
                // Note that Chromium, Molbydenum, and Iodine are not listed
    ];
    fats = ['204', //Total Fat
            '605', //Total trans
            '606', //Total saturated
            '645', //Total monounsaturated
            '646', //Total polyunsaturated
    ];
    carbohydrates = ['available_carbohydrate',
                     '205', //Total Carbohydrate
                     '291', //Fiber
                     '269', //total sugar
                     '221', //Alcohol, ethyl
    ];
    foodList = Object.keys(data)
    
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
    if( ordering in ['description', 'measurement']) {
        list.sort( function(a, b) {
            // Order based upon alphanumeric value
            return data[a][ordering] >= data[b][ordering] ? ascending : -ascending;
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
        // 100 gram is displayed for every food group, and displayed first
        sections[data[i]['food_group']]['tableData'] += '<li>100 gram</li>'
        for(measurement in data[i]['nutrients']) {
            if(measurement != '100 gram') {
                sections[data[i]['food_group']]['tableData'] += '<li>' +
                                                                    measurement +
                                                                '</li>';
            }
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
    setDefaultSettings();
    initializeGlobals();
    //initialize page for user control
    displayData();
});
