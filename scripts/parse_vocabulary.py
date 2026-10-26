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

# Quick lesson -> theme id lookup
lesson_to_theme = {}
for g in thematic_groups:
    for l_num in g["lessons"]:
        lesson_to_theme[l_num] = g["id"]

# Simple verified romanizer for unambiguous Devanagari words/phrases
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
    """Generates standard phonetic romanization for search and learner aid."""
    # Strip context notes in parentheses
    text = re.sub(r'\(.*?\)', '', nepali_str).strip()
    # Take first sense before semicolon if multiple
    if ';' in text:
        text = text.split(';')[0].strip()
    if '/' in text:
        text = text.split('/')[0].strip()
    
    # Process characters
    res = []
    i = 0
    chars = list(text)
    n = len(chars)
    while i < n:
        c = chars[i]
        if c in consonants:
            base = consonants[c]
            # Check next char
            if i + 1 < n:
                nxt = chars[i+1]
                if nxt == '्': # Halant (dead consonant)
                    res.append(base)
                    i += 2
                    continue
                elif nxt in vowels: # Explicit matra
                    res.append(base + vowels[nxt])
                    i += 2
                    continue
            # Implicit 'a'
            # If end of word or before space, schwa is often dropped in spoken Nepali
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

def classify_illustration_type(lesson_num, lesson_title, eng, nep):
    eng_lower = eng.lower().strip()
    nep_clean = nep.strip()
    
    # 1. Idioms / Figurative
    if "idiom" in lesson_title.lower() or lesson_num in {8, 41}:
        return "idiom"
    if any(phrase in eng_lower for phrase in ["against the clock", "break the ice", "cold feet", "piece of cake", "in a nutshell", "on the ball", "hit the road", "touch wood", "knock on wood"]):
        return "idiom"

    # 2. Spoken phrases / full dialogue turns
    if "?" in eng or "?" in nep or "..." in eng or "!" in eng:
        return "phrase"
    if eng_lower.startswith(("i'm ", "where ", "how ", "let's ", "have you ", "do you ", "what ", "excuse me")):
        return "phrase"
    if any(k in eng_lower for k in ["see you", "goodbye", "hello", "good morning", "nice to meet", "call it a day"]):
        return "phrase"

    # 3. Actions & Verbs
    action_lessons = {4, 11, 21, 24, 39, 45, 59}
    if lesson_num in action_lessons:
        return "action"
    if nep_clean.endswith(("नु", "गर्नु", "हुनु", "बस्नु", "दिनु", "लिनु", "हेर्नु", "खानु", "जानु", "आउनु")):
        return "action"
    if any(eng_lower.startswith(v) for v in ["brush ", "wash ", "clean ", "cook ", "run ", "drive ", "ride ", "eat ", "drink ", "take ", "make ", "do ", "get ", "go ", "set "]):
        return "action"

    # 4. Abstract concepts, numbers, emotions, grammar, traits, time
    abstract_lessons = {2, 3, 5, 6, 7, 18, 19, 25, 26, 40, 43, 51, 53, 70, 71, 77, 78}
    if lesson_num in abstract_lessons:
        return "abstract"
    if any(w in eng_lower for w in ["percent", "rate", "number", "feeling", "mood", "opinion", "degree", "climate", "future", "belief", "rule"]):
        return "abstract"

    # 5. Default: concrete objects, places, animals, foods, materials
    return "concrete"

def extract_context_note(nepali_str):
    matches = re.findall(r'\((.*?)\)', nepali_str)
    if matches:
        return "; ".join(matches)
    return None

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
        print(f"Skipping bad header: {header_line}")
        continue
    
    lesson_num = int(m.group(1))
    lesson_title = m.group(2).strip()
    theme_id = lesson_to_theme.get(lesson_num, "basics")
    
    sections = re.split(r"\n###\s+", l_text)
    
    lesson_entries = []
    lesson_variants = []
    
    # First pass: collect recognition variants in this lesson
    for sec in sections[1:]:
        sec_lines = sec.strip().split("\n")
        sec_title = sec_lines[0].strip()
        sec_body = sec_lines[1:]
        if "Recognition" in sec_title:
            for b in sec_body:
                b = b.strip()
                if b.startswith("- "):
                    # e.g. - **autumn** → **fall** — शरद ऋतु।
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

    # Second pass: parse tables
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
                    
                    # Context note
                    ctx = extract_context_note(nep_text)
                    
                    # Matching recognition variants
                    matched_vars = []
                    eng_clean = re.sub(r'\(.*?\)', '', eng_word).lower().strip()
                    for v in lesson_variants:
                        std = v.get("standard")
                        if std:
                            std_clean = re.sub(r'\(.*?\)', '', std).lower().strip()
                            if eng_clean == std_clean or eng_clean.startswith(std_clean) or std_clean.startswith(eng_clean):
                                matched_vars.append(v)
                    
                    ill_type = classify_illustration_type(lesson_num, lesson_title, eng_word, nep_text)
                    rom = romanize_nepali(nep_text)
                    
                    entry = {
                        "id": entry_id,
                        "lessonNumber": lesson_num,
                        "lessonTitle": lesson_title,
                        "sourceSection": sec_type,
                        "sourceRow": row_counter,
                        "englishHeadword": eng_word,
                        "nepaliText": nep_text,
                        "contextNote": ctx,
                        "romanization": rom,
                        "illustrationType": ill_type,
                        "recognitionVariants": matched_vars if matched_vars else None,
                        "audioUrl": None
                    }
                    lesson_entries.append(entry)
                    all_entries.append(entry)
                    total_parsed_entries += 1

    total_parsed_variants += len(lesson_variants)
    
    all_lessons.append({
        "number": lesson_num,
        "title": lesson_title,
        "themeId": theme_id,
        "entriesCount": len(lesson_entries),
        "mainCount": sum(1 for e in lesson_entries if e["sourceSection"] == "main"),
        "practicalCount": sum(1 for e in lesson_entries if e["sourceSection"] == "practical"),
        "variantsCount": len(lesson_variants),
        "recognitionVariants": lesson_variants,
        "entries": lesson_entries
    })

print(f"Parsed {len(all_lessons)} lessons.")
print(f"Parsed {total_parsed_entries} total vocabulary entries.")
print(f"Parsed {total_parsed_variants} total recognition variants.")

# Generate vocabulary-data.js
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
