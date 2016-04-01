import json
import pdb

def format_nutrition_data(parsers, files):
    """
    Uses the USDA nutrition database dataset to create a concise list of food
    items nutritional data
    """
    # Populate food_group code values for use in constructing nutrition data
    food_groups = {food_group['food_group_code']: food_group['description']
                   for food_group
                   in parsers['food_group']}
    # Populate nutrition code values for use in constructing nutrition data
    nutrient_descriptions = {description['nutrient_number']: {
                              key: value
                              for key, value
                              in description.items()
                              if key in ['units', 'description', 'precision']}
                             for description
                             in parsers['nutrient_description']}
    # Get basic food_item information from food description file
    nutrition_data = {data['NDB_number']: dict(
                            description=data['long_description'],
                            food_group=food_groups[data['food_group_code']],
                            manufacturer=data['manufacturer'],
                            alternate_names=data['common_name'],
                            **{value['description']: '0' 
                               for value
                               in nutrient_descriptions.values()},
                            alternate_measurements={})
                      for data
                      in parsers['description']}
    # Complete nutrient data for each food's nutrient dictionary 
    for nutrient in parsers['nutrient']:
        # translate the nutrient number into its corresponding description to
        # modify the appropriate key in each nutrition data dict
        nutrient_description = nutrient_descriptions[nutrient[
            'nutrient_number']]['description']
        nutrition_data[nutrient['NDB_number']][nutrient_description] = (
            nutrient['nutrient_value'])
    # Associate common household measurements with each food item
    for weight in parsers['weight']:
        nutrition_data[weight['NDB_number']]['alternate_measurements'][
            weight['unit']] = dict(amount=weight['amount'],
                                   gram_weight=weight['gram_weight'])
    # Now that the nutrition data has been formed, remove the NDB_number
    # from the data set as it is no longer necessary
    nutrition_data = list(nutrition_data.values())
    # Calculate the available_carbohydrates for each food item
    for food_item in nutrition_data:
        # calculate available carbohydrate by finding the remainder after
        # subtracting water, protein, fat, ash, fiber and alcohol from item
        # weight (100g) per instructions from sr28
        remainder = 100 - sum(attribute_weight
                              for attribute_weight
                              in [float(food_item[variable])
                                  for variable
                                  in ['Water', 'Protein', 'Total lipid (fat)',
                                      'Ash', 'Fiber, total dietary',
                                      'Alcohol, ethyl']])
        food_item['available_carbohydrate'] = (
                '0'
                if(remainder <= 0 or
                   food_item['Carbohydrate, by difference'] == '0' or
                   food_item['Energy'] == '0')
                else '{:.2f}'.format(remainder)
                )
    # Transform food groups into a list for usability
    food_groups = list(food_groups.values())
    # Close the files as we are done using them now
    map(lambda x: x.close(), files)
    return nutrition_data, nutrient_descriptions, food_groups

def generate_database_parsers(**kwargs):
    """
    Parses the ASCII ISO-8859-1 files that incorporate the full USDA
    nutritional database into a set of python dictionaries
    """
    # Gather the name of the description and nutrient file, defaults
    # are given as fallback if no kwarg is set
    description_file = kwargs.get('description', 'data/FOOD_DES.txt')
    nutrient_file = kwargs.get('nutrient', 'data/NUT_DATA.txt')
    nutrient_description_file = kwargs.get('nutrient_description',
                                           'data/NUTR_DEF.txt')
    food_group_file = kwargs.get('food_group', 'data/FD_GROUP.txt')
    langual_file = kwargs.get('langual', 'data/LANGUAL.txt')
    langual_description_file = kwargs.get('langual_description',
                                          'data/LANGDESC.txt')
    weight_file = kwargs.get('weight', 'data/WEIGHT.txt')
    
    # pack the file_names into a list for later iteration
    file_names = {'description': description_file,
                  'nutrient': nutrient_file,
                  'nutrient_description': nutrient_description_file,
                  'food_group': food_group_file,
                  'langual_description': langual_description_file,
                  'langual': langual_file,
                  'weight': weight_file}
    files = {dataset: open(file_name, 'r', encoding='iso-8859-1')
             for dataset, file_name
             in file_names.items()}
    # Please refer to sr28 documentation for information about attributes
    # Define values for attributes that will be gathered from each respective
    # file
    description_attributes = ['NDB_number', 'food_group_code',
                              'long_description', 'short_description',
                              'common_name', 'manufacturer', 'survey',
                              'refuse_description', 'refuse',
                              'scientific_name', 'nitrogen_factor',
                              'protein_factor', 'fat_factor', 'carb_factor']
    nutrient_attributes = ['NDB_number', 'nutrient_number', 'nutrient_value',
                           'number_data_points', 'standard_error',
                           'source_code', 'derivation_code',
                           'reference_NDB_number', 'added_for_fortification',
                           'number_studies', 'min', 'max', 'degrees_freedom',
                           'lower_error_bound', 'upper_error_bound',
                           'statistical_comments', 'last_modified',
                           'confidence code']
    nutrient_descriptions = ['nutrient_number', 'units', 'tagname',
                             'description', 'precision', 'SR_order']
    food_group_descriptions = ['food_group_code', 'description']
    langual_descriptions = ['factor_code', 'description']
    langual_attributes = ['NDB_number', 'factor_code']
    weight_attributes = ['NDB_number', 'sequence_number', 'amount', 'unit',
                         'gram_weight', 'number_data_points',
                         'standard_deviation']
    # pack the file attributes into a list for later iteration
    attributes = {'description': description_attributes,
                  'nutrient': nutrient_attributes,
                  'nutrient_description': nutrient_descriptions,
                  'food_group': food_group_descriptions,
                  'langual': langual_attributes,
                  'langual_description': langual_descriptions,
                  'weight': weight_attributes}
    # Create a dictionary to separate data by its file
    parsers = {}
    # iterate over files in the file_name file to get their attributes
    for dataset, data_file in files.items():
        # Store each dataset as a list of dictionaries with keys that
        # correspond to the attributes of that dataset 
        parsers[dataset] = [{attributes[dataset][i]: value.strip('~') 
                             for i, value in enumerate(line.strip().split('^'))}
                             for line
                             in data_file]
    return parsers, files

if __name__ == '__main__':
    parsers, files = generate_database_parsers()
    nutrition_data, nutrient_descriptions, food_groups = (
            format_nutrition_data(parsers, files))
    with open('resources/nutrition-data.json', 'w') as file:
        json.dump(nutrition_data, file)
    with open('resources/nutrient-descriptions.json', 'w') as file:
        json.dump(nutrient_descriptions, file)
    with open('resources/food-groups.json', 'w') as file:
        json.dump(food_groups, file)
