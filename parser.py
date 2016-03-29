import json
import pdb

def parse_nutrition_list(nutrition_file='data/ABBREV.txt'):
    # define attributes into separate variable for readability in
    # later list comprehension
    attributes = ['NDB_number',
                  'description',
                  'water',
                  'energy',
                  'protein',
                  'total_lipid',
                  'ash',
                  'carbohydrate',
                  'fiber',
                  'sugar',
                  'calcium',
                  'iron',
                  'magnesium',
                  'phosphorus',
                  'potassium',
                  'sodium',
                  'zinc',
                  'copper',
                  'manganese',
                  'selenium',
                  'vitamin_c',
                  'thiamin',
                  'riboflavin',
                  'niacin',
                  'pantothenic_acid',
                  'vitamin_b6',
                  'total_folate',
                  'folic_acid',
                  'food_folate',
                  'folate',
                  'total_choline',
                  'vitamin_b12',
                  'vitamin_a_IU',
                  'vitamin_a_RAE',
                  'retinol',
                  'alpha-carotene',
                  'beta-carotene',
                  'beta-cryptoxanthin',
                  'lycopene',
                  'lutein+zeazanthin',
                  'vitamin_e',
                  'vitamin_d_mcg',
                  'vitamin_d_IU',
                  'vitamin_k',
                  'saturated_fatty_acid',
                  'monounsaturated_fatty_acids',
                  'polyunsaturated_fatty_acids',
                  'cholesterol',
                  'household_unit_value',
                  'household_unit_description',
                  'household_unit_value2',
                  'household_unit_description2',
                  'refuse_percentage',
                 ]
    with open(nutrition_file, 'r', encoding='iso-8859-1') as file:
        # Create a list of dictionaries which contain all the
        # attributes for each food item listed in the USDA abbreviated
        # database file, note ^ character delimiter
        nutrition_list = [dict(zip(attributes, line.strip().split(sep='^')))
                          for line
                          in file
                         ]
    for food_item in nutrition_list:
        # calculate available carbohydrate by finding the remainder after
        # subtracting water, protein, fat, ash, fiber and alcohol from item
        # weight (100g)
        remainder = 100 - sum([attribute_weight
                                for attribute_weight
                                in [float(food_item[variable])
                                    for variable
                                    in [
                                        # Note to include alcohol once you have
                                        # expanded to using non abbreviated
                                        # form
                                        'water', 'protein', 'total_lipid',
                                        'ash', 'fiber'
                                        ]
                                    if food_item[variable] != '']])
        food_item['available_carbohydrate'] = (
                '0'
                if(remainder < 0 or
                   food_item['carbohydrate'] == '0' or
                   food_item['energy'] == '0')
                else '{:.2f}'.format(remainder)
                )
    return nutrition_list

if __name__ == '__main__':
   nutrition_list = parse_nutrition_list() 
   with open('resources/nutrition-data.json', 'w') as file:
       json.dump(nutrition_list, file)
