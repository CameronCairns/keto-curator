import pdb

def parse_nutrition_list(nutrition_file='data/ABBREV.txt'):
    with open(nutrition_file, 'r', encoding='iso-8859-1') as file:
        nutrition_list = [line.strip().split(sep='^') for line in file]
    return nutrition_list

if __name__ == '__main__':
   nutrition_list = parse_nutrition_list() 
