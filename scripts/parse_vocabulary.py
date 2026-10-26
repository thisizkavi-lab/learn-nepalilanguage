import re
import json
import os

source_md = "/Users/kavi/Documents/kyoto/learn-nepalilanguage/data/English_Vocabulary_Builder_Nepali_equivalents.md"
output_js = "/Users/kavi/Documents/kyoto/learn-nepalilanguage/js/vocabulary-data.js"

with open(source_md, "r", encoding="utf-8") as f:
    content = f.read()

# Thematic mapping for the 78 lessons
thematic_groups = [
    {
        "id": "basics",
        "name": "Basics, Numbers & Time",
        "icon": "compass",
        "description": "Countries, nationalities, numbers, decimals, time, and basic communication.",
        "lessons": [1, 2, 3, 7]
    },
    {
        "id": "home",
        "name": "Home, Housework & Tools",
        "icon": "home",
        "description": "Around the house, kitchen implements, chores, cleaning, gardening, tools, moving, and renting.",
        "lessons": [4, 9, 10, 11, 12, 13]
    },
    {
        "id": "people",
        "name": "People, Body & Family",
        "icon": "user",
        "description": "The body, clothes, accessories, physical appearance, personality traits, feelings, family, and baby care.",
        "lessons": [14, 15, 16, 17, 18, 19, 20, 21, 22]
    },
    {
        "id": "education",
        "name": "Education, Languages & Law",
        "icon": "book-open",
        "description": "Education, university study, foreign languages, communication, and legal concepts.",
        "lessons": [23, 24, 25, 27]
    },
    {
        "id": "food",
        "name": "Food, Drinks & Dining",
        "icon": "coffee",
        "description": "Meat, dairy, fruits, nuts, vegetables, bread, desserts, drinks, eating in, eating out, and healthy diet.",
        "lessons": [28, 29, 30, 31, 32, 33, 70]
    },
    {
        "id": "work",
        "name": "Work, Business & Finance",
        "icon": "briefcase",
        "description": "Jobs, working conditions, industries, office supplies, finance, business skills, and job applications.",
        "lessons": [34, 35, 36, 37, 38, 39, 40, 42, 43]
    },
    {
        "id": "travel",
        "name": "Travel, Driving & City Life",
        "icon": "map-pin",
        "description": "Transportation, driving, directions, accommodation, tourism, camping, beach, and urban life.",
        "lessons": [44, 45, 46, 47, 48, 49, 50, 72, 73, 74, 75]
    },
    {
        "id": "nature",
        "name": "Nature, Wildlife & Weather",
        "icon": "sun",
        "description": "Weather, geography, environment, pets, farm animals, wild animals, birds, bugs, and sea creatures.",
        "lessons": [51, 52, 53, 54, 55, 56, 57]
    },
    {
        "id": "leisure",
        "name": "Leisure, Sports & Media",
        "icon": "activity",
        "description": "Free time, abilities, sports, football, books, music, movies, TV, celebrity, and fitness.",
        "lessons": [58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 71]
    },
    {
        "id": "health",
        "name": "Health, Sickness & Medicine",
        "icon": "heart",
        "description": "Aches, symptoms, illnesses, treatments, doctors, hospitals, and pharmacies.",
        "lessons": [68, 69]
    },
    {
        "id": "tech",
        "name": "Science & Future Tech",
        "icon": "cpu",
        "description": "Gadgets, computing, internet, modern technology, future inventions, and laboratory science.",
        "lessons": [76, 77, 78]
    },
    {
        "id": "idioms",
        "name": "Idioms & Cultural Beliefs",
        "icon": "message-circle",
        "description": "Common everyday idioms, business idioms, superstitions, beliefs, and figurative language.",
        "lessons": [8, 26, 41]
    }
]

lesson_to_theme = {}
for g in thematic_groups:
    for l_num in g["lessons"]:
        lesson_to_theme[l_num] = g["id"]

# Module specifications from English Vocabulary Builder Visual Presentation Inventory
LESSON_MODULE_SPECS = {
    1: ["Countries", "Nationalities"],
    2: ["Numbers", "Ordinal numbers", "Large numbers", "Fractions, decimals, and percentages"],
    3: ["The calendar", "Seasons and frequency"],
    4: ["Daily routines"],
    5: ["Colors", "Materials", "Adjectives"],
    6: ["Opinion adjectives", "Good", "Bad"],
    7: ["Business cards", "Contact details", "Forms of communication", "Sending emails"],
    8: ["Common English idioms"],
    9: ["Homes, rooms, and furniture"],
    10: ["Kitchen implements", "Toiletries and bathroom equipment"],
    11: ["Household chores", "Laundry and cleaning"],
    12: ["Tools and home improvement", "Home improvement verbs", "Gardening equipment", "Gardening verbs"],
    13: ["Accommodation, moving, and renting", "Useful expressions"],
    14: ["Parts of the body", "Verbs"],
    15: ["Clothes", "Describing clothes and styles", "Verbs"],
    16: ["Accessories", "Make-up and beauty products", "Shoes"],
    17: ["Hair", "Verbs", "Appearance and style", "Eyes"],
    18: ["Describing personality"],
    19: ["Feelings and moods"],
    20: ["Family members", "Relationships and life stages"],
    21: ["Useful expressions"],
    22: ["Equipment and clothes", "Toys and games"],
    23: ["Subjects", "Studying and exams (nouns)", "Studying and exams (verbs)"],
    24: ["Useful expressions"],
    25: ["Useful expressions"],
    26: ["Useful expressions"],
    27: ["Crime", "Punishment and the law", "Useful expressions"],
    28: ["Meat", "Fish and seafood", "Dairy", "Fast food and light snacks"],
    29: ["Fruit", "Nuts and dried fruit"],
    30: ["Vegetables"],
    31: ["Bread, pasta, and desserts", "Flavorings and condiments"],
    32: ["Drinks", "Food and drink containers", "Food and drink adjectives", "Eating and drinking"],
    33: ["Meals", "Food preparation", "Eating out: verbs", "Eating out: nouns"],
    34: ["Jobs"],
    35: ["Employment", "Verbs", "Pay and conditions"],
    36: ["Industries", "Departments"],
    37: ["In the office", "Equipment", "Stationery"],
    38: ["Money", "Finance"],
    39: ["Useful expressions"],
    40: ["Useful expressions"],
    41: ["Workplace idioms", "Business idioms"],
    42: ["Verbs", "Useful expressions"],
    43: ["Professional attributes", "For the workplace"],
    44: ["Forms of transportation", "Verbs", "Travel"],
    45: ["Driving vocabulary", "Verbs"],
    46: ["Maps and directions", "Prepositions of place", "Verbs"],
    47: ["Verbs", "Going on vacation", "Where to stay"],
    48: ["Useful expressions"],
    49: ["Camping", "Cycling"],
    50: ["At the beach"],
    51: ["Weather", "Temperature", "Adjectives"],
    52: ["Geographical features"],
    53: ["Useful expressions"],
    54: ["Pets and farm animals", "Animal verbs", "Animal equipment"],
    55: ["Wild animals", "Verbs"],
    56: ["Birds", "Insects and bugs", "Verbs for birds and bugs"],
    57: ["Fish and sea creatures", "Whales"],
    58: ["Free time activities"],
    59: ["Abilities and actions"],
    60: ["Sports", "Adventure sports"],
    61: ["Timings and rules", "Soccer game", "Verbs"],
    62: ["Equipment", "Venues"],
    63: ["Books", "Useful expressions", "Reading and genres"],
    64: ["Verbs", "Musical instruments", "Musical genres", "Performance"],
    65: ["Movies", "Plays and shows"],
    66: ["Verbs", "Watching television", "TV shows and channels"],
    67: ["Useful expressions"],
    68: ["Adjectives for sickness", "Sickness and conditions", "Verbs for symptoms", "Symptoms", "Accidents and injuries"],
    69: ["Medicine and treatment", "First aid", "Verbs"],
    70: ["Nutrition and diets", "Useful expressions"],
    71: ["At the gym", "Verbs for fitness", "Well-being", "Fitness"],
    72: ["Around town"],
    73: ["Stores and shops", "Verbs", "Useful expressions"],
    74: ["At the checkout", "Supermarket", "Department store"],
    75: ["Useful expressions"],
    76: ["Digital technology", "Verbs"],
    77: ["Useful expressions"],
    78: ["Science and scientific equipment", "Verbs"]
}

COUNTRY_FLAGS = {
    "american": "🇺🇸", "united states of america": "🇺🇸", "us": "🇺🇸",
    "argentina": "🇦🇷", "argentinian": "🇦🇷",
    "australia": "🇦🇺", "australian": "🇦🇺",
    "brazil": "🇧🇷", "brazilian": "🇧🇷",
    "british": "🇬🇧", "united kingdom": "🇬🇧", "uk": "🇬🇧",
    "canada": "🇨🇦", "canadian": "🇨🇦",
    "china": "🇨🇳", "chinese": "🇨🇳",
    "czech republic": "🇨🇿",
    "egypt": "🇪🇬", "egyptian": "🇪🇬",
    "france": "🇫🇷", "french": "🇫🇷",
    "germany": "🇩🇪", "german": "🇩🇪",
    "greece": "🇬🇷", "greek": "🇬🇷",
    "india": "🇮🇳", "indian": "🇮🇳",
    "indonesia": "🇮🇩",
    "japan": "🇯🇵", "japanese": "🇯🇵",
    "mexico": "🇲🇽", "mexican": "🇲🇽",
    "mongolia": "🇲🇳", "mongolian": "🇲🇳",
    "netherlands": "🇳🇱",
    "new zealand": "🇳🇿",
    "pakistan": "🇵🇰", "pakistani": "🇵🇰",
    "philippines": "🇵🇭",
    "poland": "🇵🇱", "polish": "🇵🇱",
    "portugal": "🇵🇹", "portuguese": "🇵🇹",
    "republic of ireland": "🇮🇪", "roi": "🇮🇪",
    "russia": "🇷🇺", "russian": "🇷🇺",
    "singapore": "🇸🇬",
    "slovakia": "🇸🇰",
    "south africa": "🇿🇦",
    "south korea": "🇰🇷",
    "spain": "🇪🇸", "spanish": "🇪🇸",
    "thailand": "🇹🇭",
    "turkey": "🇹🇷", "turkish": "🇹🇷",
    "uae": "🇦🇪", "united arab emirates": "🇦🇪",
    "nepal": "🇳🇵", "nepali": "🇳🇵"
}

COLORS_HEX = {
    "red": "#E53E3E", "blue": "#3182CE", "green": "#38A169", "yellow": "#D69E2E",
    "black": "#1A202C", "white": "#F7FAFC", "orange": "#DD6B20", "purple": "#805AD5",
    "pink": "#ED64A6", "brown": "#744210", "gray": "#718096", "grey": "#718096",
    "gold": "#D4AF37", "silver": "#A0AEC0"
}

NUMBERS_MAP = {
    "one": ("1", "१"), "two": ("2", "२"), "three": ("3", "३"), "four": ("4", "४"),
    "five": ("5", "५"), "six": ("6", "६"), "seven": ("7", "७"), "eight": ("8", "८"),
    "nine": ("9", "९"), "ten": ("10", "१०"), "eleven": ("11", "११"), "twelve": ("12", "१२"),
    "thirteen": ("13", "१३"), "fourteen": ("14", "१४"), "fifteen": ("15", "१५"),
    "sixteen": ("16", "१६"), "seventeen": ("17", "१७"), "eighteen": ("18", "१८"),
    "nineteen": ("19", "१९"), "twenty": ("20", "२०"), "twenty-one": ("21", "२१"),
    "twenty-two": ("22", "२२"), "thirty": ("30", "३०"), "forty": ("40", "४०"),
    "fifty": ("50", "५०"), "sixty": ("60", "६०"), "seventy": ("70", "७०"),
    "eighty": ("80", "८०"), "ninety": ("90", "९०"), "hundred": ("100", "१००"),
    "one hundred": ("100", "१००"), "two hundred": ("200", "२००"),
    "thousand": ("1,000", "१,०००"), "one thousand": ("1,000", "१,०००"),
    "million": ("1,000,000", "१०,००,०००"), "one million": ("1,000,000", "१०,००,०००"),
    "first": ("1st", "१st"), "second": ("2nd", "२nd"), "third": ("3rd", "३rd"),
    "fourth": ("4th", "४th"), "fifth": ("5th", "५th"), "sixth": ("6th", "६th"),
    "seventh": ("7th", "७th"), "eighth": ("8th", "८th"), "ninth": ("9th", "९th"),
    "tenth": ("10th", "१०th"), "eleventh": ("11th", "११th"), "twelfth": ("12th", "१२th"),
    "twentieth": ("20th", "२०th"), "twenty-first": ("21st", "२१st"),
    "half": ("½", "आधा"), "quarter": ("¼", "एक चौथाइ"),
    "one percent": ("1%", "१%"), "ninety-nine percent": ("99%", "९९%"),
    "one point seven": ("1.7", "१.७"), "zero point five": ("0.5", "०.५")
}

COUNTRY_NATIONALITY_PAIRS = [
    {"country": "United States of America", "countryNepali": "संयुक्त राज्य अमेरिका", "nationality": "American", "nationalityNepali": "अमेरिकी", "flag": "🇺🇸"},
    {"country": "Argentina", "countryNepali": "अर्जेन्टिना", "nationality": "Argentinian", "nationalityNepali": "अर्जेन्टिनी", "flag": "🇦🇷"},
    {"country": "Brazil", "countryNepali": "ब्राजिल", "nationality": "Brazilian", "nationalityNepali": "ब्राजिलियन", "flag": "🇧🇷"},
    {"country": "Canada", "countryNepali": "क्यानडा", "nationality": "Canadian", "nationalityNepali": "क्यानाडेली", "flag": "🇨🇦"},
    {"country": "China", "countryNepali": "चीन", "nationality": "Chinese", "nationalityNepali": "चिनियाँ", "flag": "🇨🇳"},
    {"country": "Egypt", "countryNepali": "इजिप्ट", "nationality": "Egyptian", "nationalityNepali": "इजिप्टेली; मिस्री", "flag": "🇪🇬"},
    {"country": "France", "countryNepali": "फ्रान्स", "nationality": "French", "nationalityNepali": "फ्रान्सेली", "flag": "🇫🇷"},
    {"country": "Germany", "countryNepali": "जर्मनी", "nationality": "German", "nationalityNepali": "जर्मन", "flag": "🇩🇪"},
    {"country": "Greece", "countryNepali": "ग्रीस", "nationality": "Greek", "nationalityNepali": "ग्रिक; ग्रीसको नागरिक", "flag": "🇬🇷"},
    {"country": "India", "countryNepali": "भारत", "nationality": "Indian", "nationalityNepali": "भारतीय", "flag": "🇮🇳"},
    {"country": "Japan", "countryNepali": "जापान", "nationality": "Japanese", "nationalityNepali": "जापानी", "flag": "🇯🇵"},
    {"country": "Mexico", "countryNepali": "मेक्सिको", "nationality": "Mexican", "nationalityNepali": "मेक्सिकन", "flag": "🇲🇽"},
    {"country": "Mongolia", "countryNepali": "मङ्गोलिया", "nationality": "Mongolian", "nationalityNepali": "मङ्गोलियाली", "flag": "🇲🇳"},
    {"country": "Pakistan", "countryNepali": "पाकिस्तान", "nationality": "Pakistani", "nationalityNepali": "पाकिस्तानी", "flag": "🇵🇰"},
    {"country": "Poland", "countryNepali": "पोल्यान्ड", "nationality": "Polish", "nationalityNepali": "पोलिस; पोल्यान्डको", "flag": "🇵🇱"},
    {"country": "Portugal", "countryNepali": "पोर्चुगल", "nationality": "Portuguese", "nationalityNepali": "पोर्चुगिज", "flag": "🇵🇹"},
    {"country": "Russia", "countryNepali": "रुस", "nationality": "Russian", "nationalityNepali": "रुसी", "flag": "🇷🇺"},
    {"country": "Spain", "countryNepali": "स्पेन", "nationality": "Spanish", "nationalityNepali": "स्पेनी", "flag": "🇪🇸"},
    {"country": "Turkey", "countryNepali": "टर्की", "nationality": "Turkish", "nationalityNepali": "टर्किस; टर्कीको", "flag": "🇹🇷"},
    {"country": "United Kingdom", "countryNepali": "संयुक्त अधिराज्य; बेलायत", "nationality": "British", "nationalityNepali": "बेलायती", "flag": "🇬🇧"}
]

vowels = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ऋ': 'ri',
    'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ृ': 'ri',
    'ं': 'n', 'ँ': 'n', 'ः': 'h', '्': ''
}
consonants = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'w',
    'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy'
}

def romanize_nepali(nepali_str):
    text = re.sub(r'\(.*?\)', '', nepali_str).strip()
    if ';' in text:
        text = text.split(';')[0].strip()
    if '/' in text:
        text = text.split('/')[0].strip()
    res = []
    i = 0
    chars = list(text)
    n = len(chars)
    while i < n:
        c = chars[i]
        if c in consonants:
            base = consonants[c]
            if i + 1 < n:
                nxt = chars[i+1]
                if nxt == '्':
                    res.append(base)
                    i += 2
                    continue
                elif nxt in vowels:
                    res.append(base + vowels[nxt])
                    i += 2
                    continue
            is_end = (i + 1 == n) or (i + 1 < n and chars[i+1] in ' ,.;/—')
            if is_end:
                res.append(base)
            else:
                res.append(base + 'a')
            i += 1
        elif c in vowels:
            res.append(vowels[c])
            i += 1
        elif c in ' \t\n-':
            res.append(' ')
            i += 1
        elif c in '०१२३४५६७८९':
            digits = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'}
            res.append(digits[c])
            i += 1
        else:
            i += 1
    rom = ''.join(res).strip()
    rom = re.sub(r'\s+', ' ', rom)
    return rom if len(rom) > 1 else None

def extract_context_note(nepali_str):
    matches = re.findall(r'\((.*?)\)', nepali_str)
    if matches:
        return "; ".join(matches)
    return None

def assign_module_and_visual(lesson_num, lesson_title, sec_type, eng, nep):
    eng_lower = eng.lower().strip()
    nep_clean = nep.strip()
    
    # Practical additions always get the final practical module
    module_specs = LESSON_MODULE_SPECS.get(lesson_num, ["Vocabulary"])
    
    if sec_type == "practical":
        mod_idx = len(module_specs) + 1
        mod_id = f"{lesson_num}.{mod_idx}"
        mod_title = "Practical Additions & Phrases"
        
        # Check phrase or concrete
        if "?" in eng or "..." in eng or nep_clean.endswith(("हुनुहुन्छ?", "हुँ।", "गर्नुस्।", "छ?")):
            vis_type = "speech_bubble"
        elif nep_clean.endswith("नु"):
            vis_type = "action"
        else:
            vis_type = "concrete"
        
        vis_meta = {}
        flag = COUNTRY_FLAGS.get(eng_lower)
        if flag:
            vis_meta["flag"] = flag
            
        return mod_id, mod_title, vis_type, vis_meta

    # Main American-facing vocabulary
    # Lesson-specific smart classification matching Visual Presentation Inventory
    if lesson_num == 1:
        # Countries vs Nationalities
        nat_words = {"american", "argentinian", "brazilian", "british", "canadian", "chinese", "egyptian", "french", "german", "greek", "indian", "japanese", "mexican", "mongolian", "pakistani", "polish", "portuguese", "russian", "spanish", "turkish", "nationalities"}
        if eng_lower in nat_words:
            mod_id = "1.2"
            mod_title = "Nationalities"
            vis_type = "country_flag"
        else:
            mod_id = "1.1"
            mod_title = "Countries"
            vis_type = "map"
        vis_meta = {}
        flag = COUNTRY_FLAGS.get(eng_lower)
        if flag:
            vis_meta["flag"] = flag
        return mod_id, mod_title, vis_type, vis_meta

    elif lesson_num == 2:
        vis_meta = {}
        num_info = NUMBERS_MAP.get(eng_lower)
        if num_info:
            vis_meta["symbol"] = num_info[0]
            vis_meta["nepaliSymbol"] = num_info[1]

        if any(w in eng_lower for w in ["percent", "decimal", "fraction", "half", "quarter", "point"]):
            return "2.4", "Fractions, decimals, and percentages", "number_table", vis_meta
        elif any(w in eng_lower for w in ["hundred", "thousand", "million"]):
            return "2.3", "Large numbers", "number_table", vis_meta
        elif any(w in eng_lower for w in ["first", "second", "third", "th"]):
            return "2.2", "Ordinal numbers", "ordinal_strip", vis_meta
        else:
            return "2.1", "Numbers", "number_table", vis_meta

    elif lesson_num == 3:
        if any(w in eng_lower for w in ["season", "spring", "summer", "autumn", "fall", "winter", "often", "always", "sometimes", "never", "frequency"]):
            return "3.2", "Seasons and frequency", "calendar", {}
        else:
            return "3.1", "The calendar & months", "calendar", {}

    elif lesson_num == 5:
        if eng_lower in COLORS_HEX:
            return "5.1", "Colors", "color_swatch", {"colorHex": COLORS_HEX[eng_lower]}
        elif any(m in eng_lower for m in ["cotton", "denim", "glass", "leather", "metal", "paper", "plastic", "rubber", "silk", "wood", "wool", "material"]):
            return "5.2", "Materials", "material", {}
        else:
            return "5.3", "Adjectives", "concrete", {}

    elif lesson_num == 6:
        if any(w in eng_lower for w in ["good", "great", "excellent", "wonderful", "amazing", "fantastic", "perfect", "lovely"]):
            return "6.2", "Good & Positive opinions", "contrast_good", {}
        elif any(w in eng_lower for w in ["bad", "terrible", "horrible", "awful", "dreadful", "poor", "ugly"]):
            return "6.3", "Bad & Negative opinions", "contrast_bad", {}
        else:
            return "6.1", "Opinion adjectives", "face_expression", {}

    elif lesson_num in (8, 41):
        bracketed = extract_context_note(nep)
        vis_meta = {"bracketedMeaning": bracketed} if bracketed else {}
        mod_title = "Common English idioms" if lesson_num == 8 else "Workplace & business idioms"
        return f"{lesson_num}.1", mod_title, "idiom_cartoon", vis_meta

    elif lesson_num == 14:
        if nep_clean.endswith("नु"):
            return "14.2", "Body verbs & actions", "action", {}
        else:
            return "14.1", "Parts of the body", "body_map", {}

    elif lesson_num == 15:
        if nep_clean.endswith("नु"):
            return "15.3", "Clothing verbs", "action", {}
        elif any(w in eng_lower for w in ["tight", "loose", "baggy", "formal", "casual", "striped", "patterned", "style"]):
            return "15.2", "Describing clothes and styles", "concrete", {}
        else:
            return "15.1", "Clothes & garments", "concrete", {}

    elif lesson_num == 20:
        if any(w in eng_lower for w in ["relationship", "divorced", "married", "single", "partner", "grow up"]):
            return "20.2", "Relationships and life stages", "family_tree", {}
        else:
            return "20.1", "Family members & tree", "family_tree", {}

    elif lesson_num in (28, 29, 30, 31, 32, 33):
        return f"{lesson_num}.1", module_specs[0] if module_specs else "Food & Dining", "food", {}

    elif lesson_num in (54, 55, 56, 57):
        if nep_clean.endswith("नु"):
            return f"{lesson_num}.2", "Animal verbs", "action", {}
        else:
            return f"{lesson_num}.1", module_specs[0] if module_specs else "Animals & Wildlife", "animal", {}

    elif lesson_num in (76, 78):
        if nep_clean.endswith("नु"):
            return f"{lesson_num}.2", "Action verbs", "action", {}
        else:
            return f"{lesson_num}.1", module_specs[0] if module_specs else "Technology & Science", "device_grid", {}

    # General fallback based on module count and verbs
    if len(module_specs) == 1:
        mod_id = f"{lesson_num}.1"
        mod_title = module_specs[0]
        vis_type = "action" if nep_clean.endswith("नु") else "concrete"
        return mod_id, mod_title, vis_type, {}
    
    # If module specs contains a "Verbs" module
    has_verbs_module = any("verb" in m.lower() for m in module_specs)
    if has_verbs_module and nep_clean.endswith("नु"):
        verb_mod_idx = next(i for i, m in enumerate(module_specs, 1) if "verb" in m.lower())
        return f"{lesson_num}.{verb_mod_idx}", module_specs[verb_mod_idx - 1], "action", {}
    
    # Default to module 1
    vis_type = "phrase" if ("?" in eng or "..." in eng) else ("action" if nep_clean.endswith("नु") else "concrete")
    return f"{lesson_num}.1", module_specs[0], vis_type, {}

# Split lessons by markdown header
lessons_split = re.split(r"\n## Lesson ", content)[1:]

all_lessons = []
all_entries = []
total_parsed_entries = 0
total_parsed_variants = 0

for l_text in lessons_split:
    lines = l_text.strip().split("\n")
    header_line = lines[0].strip()
    m = re.match(r"^(\d+)\s*—\s*(.+)", header_line)
    if not m:
        continue
    
    lesson_num = int(m.group(1))
    lesson_title = m.group(2).strip()
    theme_id = lesson_to_theme.get(lesson_num, "basics")
    
    sections = re.split(r"\n###\s+", l_text)
    
    lesson_entries = []
    lesson_variants = []
    
    # Collect recognition variants
    for sec in sections[1:]:
        sec_lines = sec.strip().split("\n")
        sec_title = sec_lines[0].strip()
        sec_body = sec_lines[1:]
        if "Recognition" in sec_title:
            for b in sec_body:
                b = b.strip()
                if b.startswith("- "):
                    var_text = b[2:].strip()
                    m_var = re.search(r'\*\*(.+?)\*\*\s*→\s*\*\*(.+?)\*\*(?:\s*—\s*(.+))?', var_text)
                    if m_var:
                        variant_word = m_var.group(1).strip()
                        standard_word = m_var.group(2).strip()
                        var_note = m_var.group(3).strip() if m_var.group(3) else None
                        lesson_variants.append({
                            "variant": variant_word,
                            "standard": standard_word,
                            "note": var_note,
                            "raw": var_text
                        })
                    else:
                        lesson_variants.append({
                            "variant": var_text,
                            "standard": None,
                            "note": None,
                            "raw": var_text
                        })

    # Parse tables
    for sec in sections[1:]:
        sec_lines = sec.strip().split("\n")
        sec_title = sec_lines[0].strip()
        sec_body = sec_lines[1:]
        
        is_main = "American-facing" in sec_title or "Main" in sec_title
        is_practical = "Practical" in sec_title
        
        if not (is_main or is_practical):
            continue
            
        sec_type = "main" if is_main else "practical"
        prefix = "M" if is_main else "P"
        
        row_counter = 0
        for r in sec_body:
            r = r.strip()
            if r.startswith("|") and not r.startswith("|---") and "English" not in r:
                cols = [c.strip() for c in r.split("|")[1:-1]]
                if len(cols) == 2:
                    row_counter += 1
                    eng_word = cols[0]
                    nep_text = cols[1]
                    entry_id = f"L{lesson_num:02d}-{prefix}{row_counter:03d}"
                    
                    ctx = extract_context_note(nep_text)
                    
                    matched_vars = []
                    eng_clean = re.sub(r'\(.*?\)', '', eng_word).lower().strip()
                    for v in lesson_variants:
                        std = v.get("standard")
                        if std:
                            std_clean = re.sub(r'\(.*?\)', '', std).lower().strip()
                            if eng_clean == std_clean or eng_clean.startswith(std_clean) or std_clean.startswith(eng_clean):
                                matched_vars.append(v)
                    
                    mod_id, mod_title, vis_type, vis_meta = assign_module_and_visual(lesson_num, lesson_title, sec_type, eng_word, nep_text)
                    rom = romanize_nepali(nep_text)
                    
                    # Classic classification for backwards compatibility
                    ill_type = "idiom" if vis_type == "idiom_cartoon" else ("phrase" if vis_type == "speech_bubble" else ("action" if vis_type == "action" else "concrete"))
                    
                    entry = {
                        "id": entry_id,
                        "lessonNumber": lesson_num,
                        "lessonTitle": lesson_title,
                        "sourceSection": sec_type,
                        "sourceRow": row_counter,
                        "moduleId": mod_id,
                        "moduleTitle": mod_title,
                        "englishHeadword": eng_word,
                        "nepaliText": nep_text,
                        "contextNote": ctx,
                        "romanization": rom,
                        "illustrationType": ill_type,
                        "visualType": vis_type,
                        "visualMeta": vis_meta if vis_meta else None,
                        "recognitionVariants": matched_vars if matched_vars else None,
                        "audioUrl": None
                    }
                    lesson_entries.append(entry)
                    all_entries.append(entry)
                    total_parsed_entries += 1

    total_parsed_variants += len(lesson_variants)
    
    # Calculate module summaries
    module_dict = {}
    for e in lesson_entries:
        m_id = e["moduleId"]
        if m_id not in module_dict:
            module_dict[m_id] = {
                "id": m_id,
                "title": e["moduleTitle"],
                "visualType": e["visualType"],
                "count": 0
            }
        module_dict[m_id]["count"] += 1
    
    sorted_modules = [module_dict[k] for k in sorted(module_dict.keys(), key=lambda x: [int(p) for p in x.split('.')])]
    
    all_lessons.append({
        "number": lesson_num,
        "unitMarker": f"{lesson_num:02d}",
        "title": lesson_title,
        "themeId": theme_id,
        "entriesCount": len(lesson_entries),
        "mainCount": sum(1 for e in lesson_entries if e["sourceSection"] == "main"),
        "practicalCount": sum(1 for e in lesson_entries if e["sourceSection"] == "practical"),
        "variantsCount": len(lesson_variants),
        "visualSpreads": {
            "page1": f"assets/visuals/spreads/lesson_{lesson_num:02d}_p1.webp",
            "page2": f"assets/visuals/spreads/lesson_{lesson_num:02d}_p2.webp",
            "printedPages": f"{(lesson_num - 1) * 4 + 10}–{(lesson_num - 1) * 4 + 11}",
            "pdfPages": f"{(lesson_num - 1) * 4 + 12}–{(lesson_num - 1) * 4 + 13}"
        },
        "modules": sorted_modules,
        "recognitionVariants": lesson_variants,
        "countryNationalityPairs": COUNTRY_NATIONALITY_PAIRS if lesson_num == 1 else None,
        "entries": lesson_entries
    })

print(f"Parsed {len(all_lessons)} lessons.")
print(f"Parsed {total_parsed_entries} total vocabulary entries.")
print(f"Parsed {total_parsed_variants} total recognition variants.")

vocab_export = {
    "meta": {
        "title": "English Vocabulary Builder — Everyday Nepali Equivalents",
        "totalLessons": len(all_lessons),
        "totalEntries": total_parsed_entries,
        "totalVariants": total_parsed_variants,
        "sourceFile": "English_Vocabulary_Builder_Nepali_equivalents.md",
        "generatedAt": "2026-10-26"
    },
    "thematicGroups": thematic_groups,
    "countryNationalityPairs": COUNTRY_NATIONALITY_PAIRS,
    "lessons": all_lessons
}

with open(output_js, "w", encoding="utf-8") as f:
    f.write("/* Generated from English_Vocabulary_Builder_Nepali_equivalents.md */\n")
    f.write("/* Source of truth: All 78 lessons, 4,210 entries, 102 recognition variants */\n")
    f.write("const VOCABULARY_DATA = ")
    json.dump(vocab_export, f, ensure_ascii=False, indent=2)
    f.write(";\n\n")
    f.write("if (typeof module !== 'undefined' && module.exports) {\n")
    f.write("    module.exports = { VOCABULARY_DATA };\n")
    f.write("}\n")

print(f"Successfully generated {output_js} with file size: {os.path.getsize(output_js)} bytes.")
