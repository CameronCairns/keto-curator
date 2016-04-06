//Global variables to be reused
var ascending, data, foodGroups, foodList, nutrientData, sections, tableHeader;
    
// Indices of vitamin, minerals and fats based upon nutrient definition
// numbers for the USDA nutrition database
// Selected nutrients are from FDA minimum nutrient guidelines
// http://www.fda.gov
// /Food/GuidanceRegulation/GuidanceDocumentsRegulatoryInformation
// /LabelingNutrition/ucm064928.htm
var vitamins = [['318', 'A'],
                ['401', 'C'],
                ['324', 'D'],
                ['323', 'E'],
                ['430', 'K'],
                ['415', 'B6'],
                ['418', 'B12'],
                ['404', 'Thiamin'],
                ['405', 'Riboflavin'],
                ['406', 'Niacin'],
                ['410', 'Pantothenic Acid'],
                ['417', 'Folate'],
                //Note that biotin is not included
                ];
var minerals = [['301', 'Calcium'],
                ['307', 'Sodium'],
                ['305', 'Phosphorus'],
                ['304', 'Magnesium'],
                ['306', 'Potassium'],
                ['303', 'Iron'],
                ['315', 'Manganese'],
                ['312', 'Copper'],
                ['309', 'Zinc'],
                ['317', 'Selenium'],
                // Note that Chromium, Molbydenum, and Iodine are not listed
                ];
var fat = [['204', 'Total'],
           ['605', 'Trans'],
           ['606', 'Saturated'],
           ['645', 'Monounsaturated'],
           ['646', 'Polyunsaturated'],
           ];
var carbohydrate = [['available_carbohydrate', 'Available'],
                    ['205', 'Total'],
                    ['291', 'Fiber'],
                    ['269', 'Sugar'],
                    ['221', 'Alcohol'],
                    ];
var iterableAttributes = [carbohydrate, fat, vitamins, minerals]
    
    

function fetchJSON(url, dataStore) {
    //return $.getJSON(url, function(json_data) {dataStore = json_data});
    $.ajax({url:url,
            dataType:'json', async: false,
            success:function(json_data) {
                return json_data}});
}
function setDefaultSettings() {
    foodList = Object.keys(data);
    // Grab this selection element to populate foodGroup choices
    foodGroupSelection = document.getElementById('select-food-groups');
    filterAttributeSelection = document.getElementById('filter-attribute');
    // Store foodGroup choices separately to get all of them before setting
    // the inner html for select-food-groups
    var foodGroupHTML = '';
    var attributeHTML = '';
    //Sort foodGroups into alphabetical order
    foodGroups.sort();
    // Initialize sortKey as 'available_carbohydrate' as a default
    ordering = 'available_carbohydrate';
    ascending = 1;
    // Foods are separated into diferent groups, so create an object to
    // associate the group name of each section with its corresponding HTML
    sections = {};
    //Populate the header of each section using the food group's name
    //Also create the foodGroupSelection options since it uses the same data
    for (var i = 0; i < foodGroups.length; i++) {
        sections[foodGroups[i]] = {'header': '', 'tableData': ''}
        sections[foodGroups[i]]['header'] += '<h3>' +
                                                  foodGroups[i] +
                                             '</h3>';
        foodGroupHTML += '<option value=' + i + '>' +
                             foodGroups[i] +
                         '</option>';
    }
    for(var i = 0; i < iterableAttributes.length; i++) {
        for(var j = 0; j < iterableAttributes[i].length; j++) {
            attributeHTML +=
                '<option value="' + iterableAttributes[i][j][0] + '">' +
                    iterableAttributes[i][j][1] +
                '</option>';
        }
    }
    // Display food groups for user to choose from
    foodGroupSelection.innerHTML += foodGroupHTML;
    filterAttributeSelection.innerHTML += attributeHTML;
    // Hook up function to selection
    foodGroupSelection.onchange = function() {
        var group = this.value;
        displayGroup(group);
    }
}


function generateList() {
    var extraHeader = '';
    var HTML = '';
    var tableData = '';
    // Sort the data according to the defined ordering
    // use separate comparison logic for numerical and string attributes
    if( ordering in ['description']) {
        foodList.sort( function(a, b) {
            // Order based upon alphanumeric value
            return data[a][ordering] >= data[b][ordering] ? ascending : -ascending;
        });
    }
    if( ordering in ['measurements']) {
        foodList.sort( function(a, b) {
            // Order based upon alphanumeric value
            result = 0;
            result = data[a][ordering][0] > data[b][ordering][0] ?
                ascending : -ascending;
            if(result === 0) {
                // Measurement was found to be the same, so sort by
                // description
                return data[a]['description'] >= data[b][ordering] ?
                    ascending : -ascending;
            }
            else {
                return result;
            }
        });
    } else {
        foodList.sort( function(a, b) {
            result = 0;
            result = data[a]['measurements'][0][ordering] - data[b][
                'measurements'][0][ordering];
            if(result === 0) {
                // Measurement was found to be the same, so sort by
                // description
                return data[a]['description'] >= data[b]['description'] ?
                    ascending : -ascending;
            }
            else {
                return result;
            }
        });
    }
    // Construct the table header that will be shared amongst each food group
    // table. consists of headers defined by the attributes list
    tableHeader = '<table class="table table-striped">' +
                      '<tr>' +
                          '<th>' +
                              'Food Description' +
                          '</th>' +
                          '<th>' +
                              'Measurement' +
                          '</th>' +
                          '<th>' +
                              'Protein' +
                          '</th>' +
                          '<th>' +
                              'Carbohydrate' +
                          '</th>' +
                          '<th>' +
                              'Fat' +
                          '</th>' +
                          '<th>' +
                              'Vitamins' +
                          '</th>' +
                          '<th>' +
                              'Minerals' +
                          '</th>' +
                      '</tr>';
    for (var i = 0; i < foodList.length; i++) {
        // Construct a row for each data key in the foodList
        key = foodList[i]
        measurement = data[key]['measurements'][0]
        // First display data that contains only one data point
        sections[data[key]['food_group']]['tableData'] +=
            '<tr>' +
                '<td>' +
                    data[key]['description'] +
                '</td>' +
                '<td>' +
                    measurement['description'] +
                '</td>' +
                '<td>' +
                    measurement['203'] + //Protein
                '</td>';
        // Now iterate over the attributes that have many data points to
        // display
        for(var j = 0; j < iterableAttributes.length; j++) {
            sections[data[key]['food_group']]['tableData'] += 
                '<td><ul class="list-group">';
            for(var k = 0; k < iterableAttributes[j].length; k++) {
                sections[data[key]['food_group']]['tableData'] +=
                    '<li class="list-group-item">' +
                        iterableAttributes[j][k][1] + //Nutrient Description 
                        ':<br>' +
                        //Nutrient value
                        measurement[iterableAttributes[j][k][0]] + ' ' + 
                        //Nutrient units
                        nutrientData[iterableAttributes[j][k][
                            0]]['units'] + 
                    '</li>';
            }
            sections[data[key]['food_group']]['tableData'] += '</ul></td>';
        }
        sections[data[key]['food_group']]['tableData'] += '</tr>';
    }
}

function displayGroup(selectedGroup) {
    var element = document.getElementById("javascript-fill-in");
    var group = foodGroups[selectedGroup]
    element.innerHTML = sections[group]['header'] +
               tableHeader +
               sections[group]['tableData'] +
               '</table>';
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
    setDefaultSettings();
    generateList();
});
