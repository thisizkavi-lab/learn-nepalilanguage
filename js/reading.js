// Nepali Reading Practice — Data & Logic

// ─── LEVEL 1: 100 Most Common Words ───
const WORDS = [
    { np: 'म', en: 'I / me', roman: 'ma' },
    { np: 'तिमी', en: 'you (informal)', roman: 'timī' },
    { np: 'तपाईं', en: 'you (formal)', roman: 'tapāīṁ' },
    { np: 'उ', en: 'he / she', roman: 'u' },
    { np: 'हामी', en: 'we', roman: 'hāmī' },
    { np: 'यो', en: 'this', roman: 'yo' },
    { np: 'त्यो', en: 'that', roman: 'tyo' },
    { np: 'के', en: 'what', roman: 'ke' },
    { np: 'को', en: 'who', roman: 'ko' },
    { np: 'कहाँ', en: 'where', roman: 'kahā̃' },
    { np: 'कसरी', en: 'how', roman: 'kasarī' },
    { np: 'किन', en: 'why', roman: 'kina' },
    { np: 'कति', en: 'how much / how many', roman: 'kati' },
    { np: 'कहिले', en: 'when', roman: 'kahile' },
    { np: 'हो', en: 'is (affirmative)', roman: 'ho' },
    { np: 'छ', en: 'is / exists', roman: 'cha' },
    { np: 'छैन', en: 'is not', roman: 'chaina' },
    { np: 'थियो', en: 'was', roman: 'thiyo' },
    { np: 'हुन्छ', en: 'will be / okay', roman: 'huncha' },
    { np: 'गर्नु', en: 'to do', roman: 'garnu' },
    { np: 'जानु', en: 'to go', roman: 'jānu' },
    { np: 'आउनु', en: 'to come', roman: 'āunu' },
    { np: 'खानु', en: 'to eat', roman: 'khānu' },
    { np: 'पिउनु', en: 'to drink', roman: 'piunu' },
    { np: 'हेर्नु', en: 'to look / see', roman: 'hernu' },
    { np: 'बोल्नु', en: 'to speak', roman: 'bolnu' },
    { np: 'सुन्नु', en: 'to listen / hear', roman: 'sunnu' },
    { np: 'पढ्नु', en: 'to read / study', roman: 'paḍhnu' },
    { np: 'लेख्नु', en: 'to write', roman: 'lekhnu' },
    { np: 'बस्नु', en: 'to sit / live', roman: 'basnu' },
    { np: 'दिनु', en: 'to give', roman: 'dinu' },
    { np: 'लिनु', en: 'to take', roman: 'linu' },
    { np: 'राम्रो', en: 'good / nice', roman: 'rāmro' },
    { np: 'नराम्रो', en: 'bad', roman: 'narāmro' },
    { np: 'ठूलो', en: 'big', roman: 'ṭhūlo' },
    { np: 'सानो', en: 'small', roman: 'sāno' },
    { np: 'नयाँ', en: 'new', roman: 'nayā̃' },
    { np: 'पुरानो', en: 'old (thing)', roman: 'purāno' },
    { np: 'धेरै', en: 'many / much / very', roman: 'dherai' },
    { np: 'अलि', en: 'a little', roman: 'ali' },
    { np: 'अहिले', en: 'now', roman: 'ahile' },
    { np: 'भोलि', en: 'tomorrow', roman: 'bholi' },
    { np: 'हिजो', en: 'yesterday', roman: 'hijo' },
    { np: 'आज', en: 'today', roman: 'āj' },
    { np: 'दिन', en: 'day', roman: 'din' },
    { np: 'रात', en: 'night', roman: 'rāt' },
    { np: 'घर', en: 'house / home', roman: 'ghar' },
    { np: 'मान्छे', en: 'person', roman: 'mānchhe' },
    { np: 'नाम', en: 'name', roman: 'nām' },
    { np: 'काम', en: 'work', roman: 'kām' },
    { np: 'पानी', en: 'water', roman: 'pānī' },
    { np: 'खाना', en: 'food', roman: 'khānā' },
    { np: 'बाटो', en: 'road / way', roman: 'bāṭo' },
    { np: 'पैसा', en: 'money', roman: 'paisā' },
    { np: 'समय', en: 'time', roman: 'samay' },
    { np: 'देश', en: 'country', roman: 'desh' },
    { np: 'नेपाल', en: 'Nepal', roman: 'nepāl' },
    { np: 'भाषा', en: 'language', roman: 'bhāṣā' },
    { np: 'किताब', en: 'book', roman: 'kitāb' },
    { np: 'विद्यालय', en: 'school', roman: 'vidyālay' },
    { np: 'बच्चा', en: 'child', roman: 'bacchā' },
    { np: 'आमा', en: 'mother', roman: 'āmā' },
    { np: 'बुबा', en: 'father', roman: 'bubā' },
    { np: 'दिदी', en: 'elder sister', roman: 'didī' },
    { np: 'दाइ', en: 'elder brother', roman: 'dāi' },
    { np: 'साथी', en: 'friend', roman: 'sāthī' },
    { np: 'मन', en: 'heart / mind', roman: 'man' },
    { np: 'र', en: 'and', roman: 'ra' },
    { np: 'वा', en: 'or', roman: 'wā' },
    { np: 'तर', en: 'but', roman: 'tara' },
    { np: 'पनि', en: 'also / too', roman: 'pani' },
    { np: 'मा', en: 'in / at', roman: 'mā' },
    { np: 'को', en: 'of / possessive', roman: 'ko' },
    { np: 'लाई', en: 'to / for (dative)', roman: 'lāī' },
    { np: 'बाट', en: 'from', roman: 'bāṭa' },
    { np: 'सँग', en: 'with', roman: 'sã̄ga' },
    { np: 'मात्र', en: 'only', roman: 'mātra' },
    { np: 'सबै', en: 'all / everyone', roman: 'sabai' },
    { np: 'एक', en: 'one', roman: 'ek' },
    { np: 'दुई', en: 'two', roman: 'duī' },
    { np: 'तीन', en: 'three', roman: 'tīn' },
    { np: 'चार', en: 'four', roman: 'chār' },
    { np: 'पाँच', en: 'five', roman: 'pā̃ch' },
    { np: 'दश', en: 'ten', roman: 'dash' },
    { np: 'सय', en: 'hundred', roman: 'say' },
    { np: 'हजार', en: 'thousand', roman: 'hajār' },
    { np: 'बिहान', en: 'morning', roman: 'bihān' },
    { np: 'बेलुका', en: 'evening', roman: 'belukā' },
    { np: 'खुसी', en: 'happy', roman: 'khusī' },
    { np: 'दु:खी', en: 'sad', roman: 'du:khī' },
    { np: 'चिसो', en: 'cold', roman: 'chiso' },
    { np: 'गर्मी', en: 'hot / summer', roman: 'garmī' },
    { np: 'सुन्दर', en: 'beautiful', roman: 'sundar' },
    { np: 'ठीक', en: 'okay / fine', roman: 'ṭhīk' },
    { np: 'चाहिनु', en: 'to want / need', roman: 'chāhinu' },
    { np: 'थाहा', en: 'knowledge / to know', roman: 'thāhā' },
    { np: 'कुरा', en: 'thing / matter / talk', roman: 'kurā' },
    { np: 'ठाउँ', en: 'place', roman: 'ṭhāū̃' },
    { np: 'माया', en: 'love', roman: 'māyā' },
    { np: 'धन्यवाद', en: 'thank you', roman: 'dhanyavād' },
];

// ─── LEVEL 2: Phrases (2-3 words) ───
const PHRASES = [
    {
        id: 'p1',
        title: 'Greetings & Courtesy',
        items: [
            { np: 'नमस्ते हजुर', en: 'Hello (respectful)', roman: 'namaste hajur' },
            { np: 'सुप्रभात हजुर', en: 'Good morning (respectful)', roman: 'suprabhāt hajur' },
            { np: 'शुभ रात्री', en: 'Good night', roman: 'shubha rātrī' },
            { np: 'धन्यवाद दिनुहोस्', en: 'Please give thanks', roman: 'dhanyavād dinuhos' },
            { np: 'माफ गर्नुहोस्', en: 'Excuse me / Sorry', roman: 'māf garnuhos' },
            { np: 'कस्तो छ?', en: 'How are you?', roman: 'kasto cha?' },
            { np: 'सञ्चै छु', en: 'I am fine', roman: 'sañchai chu' },
            { np: 'फेरि भेटौँला', en: 'See you again', roman: 'pheri bheṭaũlā' },
        ]
    },
    {
        id: 'p2',
        title: 'Common Phrases',
        items: [
            { np: 'मेरो नाम', en: 'My name', roman: 'mero nām' },
            { np: 'तपाईंको नाम', en: 'Your name', roman: 'tapāīṅko nām' },
            { np: 'घर जानु', en: 'Go home', roman: 'ghar jānu' },
            { np: 'पानी दिनुहोस्', en: 'Please give water', roman: 'pānī dinuhos' },
            { np: 'कति पर्छ?', en: 'How much does it cost?', roman: 'kati parcha?' },
            { np: 'ठीक छ', en: 'It\'s okay', roman: 'ṭhīk cha' },
            { np: 'थाहा छैन', en: 'I don\'t know', roman: 'thāhā chaina' },
            { np: 'राम्रो भयो', en: 'That\'s good', roman: 'rāmro bhayo' },
        ]
    },
    {
        id: 'p3',
        title: 'Daily Life',
        items: [
            { np: 'खाना खानु', en: 'Eat food', roman: 'khānā khānu' },
            { np: 'चिया पिउनु', en: 'Drink tea', roman: 'chiyā piunu' },
            { np: 'काम गर्नु', en: 'Do work', roman: 'kām garnu' },
            { np: 'किताब पढ्नु', en: 'Read a book', roman: 'kitāb paḍhnu' },
            { np: 'बजार जानु', en: 'Go to market', roman: 'bajār jānu' },
            { np: 'सुत्न जानु', en: 'Go to sleep', roman: 'sutna jānu' },
            { np: 'बिहान उठ्नु', en: 'Wake up in the morning', roman: 'bihān uṭhnu' },
            { np: 'साथी भेट्नु', en: 'Meet a friend', roman: 'sāthī bheṭnu' },
        ]
    },
];

// ─── LEVEL 3: Sentences ───
const SENTENCES = [
    {
        id: 's1',
        title: 'Self Introduction',
        items: [
            {
                np: 'मेरो नाम राम हो।',
                en: 'My name is Ram.',
                words: [
                    { np: 'मेरो', en: 'my' }, { np: 'नाम', en: 'name' },
                    { np: 'राम', en: 'Ram' }, { np: 'हो।', en: 'is.' }
                ]
            },
            {
                np: 'म नेपालबाट आएको हुँ।',
                en: 'I am from Nepal.',
                words: [
                    { np: 'म', en: 'I' }, { np: 'नेपालबाट', en: 'from Nepal' },
                    { np: 'आएको', en: 'came (have come)' }, { np: 'हुँ।', en: 'am.' }
                ]
            },
            {
                np: 'म विद्यालयमा पढ्छु।',
                en: 'I study at school.',
                words: [
                    { np: 'म', en: 'I' }, { np: 'विद्यालयमा', en: 'at school' },
                    { np: 'पढ्छु।', en: 'study.' }
                ]
            },
            {
                np: 'मलाई नेपाली भाषा मन पर्छ।',
                en: 'I like the Nepali language.',
                words: [
                    { np: 'मलाई', en: 'to me (I)' }, { np: 'नेपाली', en: 'Nepali' },
                    { np: 'भाषा', en: 'language' }, { np: 'मन', en: 'heart/mind' },
                    { np: 'पर्छ।', en: 'falls (like).' }
                ]
            },
        ]
    },
    {
        id: 's2',
        title: 'Daily Routine',
        items: [
            {
                np: 'म बिहान ६ बजे उठ्छु।',
                en: 'I wake up at 6 in the morning.',
                words: [
                    { np: 'म', en: 'I' }, { np: 'बिहान', en: 'morning' },
                    { np: '६', en: '6' }, { np: 'बजे', en: 'o\'clock' },
                    { np: 'उठ्छु।', en: 'wake up.' }
                ]
            },
            {
                np: 'हामी सबैजना खाना खान्छौँ।',
                en: 'We all eat food.',
                words: [
                    { np: 'हामी', en: 'we' }, { np: 'सबैजना', en: 'everyone' },
                    { np: 'खाना', en: 'food' }, { np: 'खान्छौँ।', en: 'eat.' }
                ]
            },
            {
                np: 'बिहान चिया पिउनु राम्रो लाग्छ।',
                en: 'Drinking tea in the morning feels nice.',
                words: [
                    { np: 'बिहान', en: 'morning' }, { np: 'चिया', en: 'tea' },
                    { np: 'पिउनु', en: 'to drink' }, { np: 'राम्रो', en: 'good/nice' },
                    { np: 'लाग्छ।', en: 'feels.' }
                ]
            },
            {
                np: 'बेलुका म घर फर्कन्छु।',
                en: 'In the evening I return home.',
                words: [
                    { np: 'बेलुका', en: 'evening' }, { np: 'म', en: 'I' },
                    { np: 'घर', en: 'home' }, { np: 'फर्कन्छु।', en: 'return.' }
                ]
            },
        ]
    },
    {
        id: 's3',
        title: 'At the Market',
        items: [
            {
                np: 'यो कति पर्छ?',
                en: 'How much does this cost?',
                words: [
                    { np: 'यो', en: 'this' }, { np: 'कति', en: 'how much' },
                    { np: 'पर्छ?', en: 'costs?' }
                ]
            },
            {
                np: 'मलाई दुईवटा दिनुहोस्।',
                en: 'Please give me two.',
                words: [
                    { np: 'मलाई', en: 'to me' }, { np: 'दुईवटा', en: 'two (pieces)' },
                    { np: 'दिनुहोस्।', en: 'please give.' }
                ]
            },
            {
                np: 'अलि सस्तो गर्नुहोस्।',
                en: 'Please make it a little cheaper.',
                words: [
                    { np: 'अलि', en: 'a little' }, { np: 'सस्तो', en: 'cheap' },
                    { np: 'गर्नुहोस्।', en: 'please do/make.' }
                ]
            },
            {
                np: 'धन्यवाद, फेरि आउँछु।',
                en: 'Thank you, I will come again.',
                words: [
                    { np: 'धन्यवाद,', en: 'thank you,' }, { np: 'फेरि', en: 'again' },
                    { np: 'आउँछु।', en: 'I will come.' }
                ]
            },
        ]
    },
];

// ─── LEVEL 4: Paragraphs ───
const PARAGRAPHS = [
    {
        id: 'para1',
        title: 'मेरो परिचय (My Introduction)',
        text: 'मेरो नाम सीता हो। म काठमाडौंमा बस्छु। मेरो परिवारमा चार जना छन् — बुबा, आमा, मेरो भाइ र म। म विद्यालयमा पढ्छु। मलाई किताब पढ्न मन पर्छ। बिहान म छिटो उठ्छु र विद्यालय जान्छु।',
        en: 'My name is Sita. I live in Kathmandu. There are four people in my family — father, mother, my brother and I. I study at school. I like reading books. In the morning I wake up early and go to school.',
        words: {
            'मेरो': 'my', 'नाम': 'name', 'सीता': 'Sita', 'हो।': 'is.',
            'म': 'I', 'काठमाडौंमा': 'in Kathmandu', 'बस्छु।': 'live.',
            'परिवारमा': 'in (my) family', 'चार': 'four', 'जना': 'people',
            'छन्': 'are', '—': '—', 'बुबा,': 'father,', 'आमा,': 'mother,',
            'भाइ': 'brother', 'र': 'and', 'म।': 'I.',
            'विद्यालयमा': 'at school', 'पढ्छु।': 'study.',
            'मलाई': 'to me (I)', 'किताब': 'book', 'पढ्न': 'to read',
            'मन': 'heart/mind', 'पर्छ।': 'like (falls).',
            'बिहान': 'morning', 'छिटो': 'quickly/early', 'उठ्छु': 'wake up',
            'विद्यालय': 'school', 'जान्छु।': 'go.'
        }
    },
    {
        id: 'para2',
        title: 'नेपालको मौसम (Nepal\'s Weather)',
        text: 'नेपालमा चार वटा मौसम हुन्छन्। वसन्त ऋतुमा फूलहरू फुल्छन्। गर्मी ऋतुमा धेरै गर्मी हुन्छ। वर्षा ऋतुमा पानी पर्छ। जाडो ऋतुमा चिसो हुन्छ र हिमाल सेतो देखिन्छ।',
        en: 'Nepal has four seasons. In spring, flowers bloom. In summer, it is very hot. In the rainy season, it rains. In winter, it is cold and the mountains look white.',
        words: {
            'नेपालमा': 'in Nepal', 'चार': 'four', 'वटा': '(counter)',
            'मौसम': 'season', 'हुन्छन्।': 'there are.',
            'वसन्त': 'spring', 'ऋतुमा': 'in season', 'फूलहरू': 'flowers',
            'फुल्छन्।': 'bloom.', 'गर्मी': 'summer/hot', 'धेरै': 'very/much',
            'हुन्छ।': 'is.', 'वर्षा': 'rain/rainy', 'पानी': 'water/rain',
            'पर्छ।': 'falls.', 'जाडो': 'winter/cold', 'चिसो': 'cold',
            'हुन्छ': 'is', 'र': 'and', 'हिमाल': 'mountain (Himalaya)',
            'सेतो': 'white', 'देखिन्छ।': 'appears/looks.'
        }
    },
    {
        id: 'para3',
        title: 'बजारमा (At the Market)',
        text: 'आज म बजार गएँ। बजारमा धेरै मान्छे थिए। मैले तरकारी र फलफूल किनें। तरकारी ताजा थियो। फलफूलको मूल्य अलि महँगो थियो तर मैले डिस्काउन्ट पाएँ। म खुसी भएर घर फर्किएँ।',
        en: 'Today I went to the market. There were many people at the market. I bought vegetables and fruits. The vegetables were fresh. The price of fruits was a bit expensive but I got a discount. I returned home happily.',
        words: {
            'आज': 'today', 'म': 'I', 'बजार': 'market', 'गएँ।': 'went.',
            'बजारमा': 'at the market', 'धेरै': 'many', 'मान्छे': 'people',
            'थिए।': 'were.', 'मैले': 'I (agent)', 'तरकारी': 'vegetables',
            'र': 'and', 'फलफूल': 'fruits', 'किनें।': 'bought.',
            'ताजा': 'fresh', 'थियो।': 'was.',
            'फलफूलको': 'of fruits', 'मूल्य': 'price', 'अलि': 'a little',
            'महँगो': 'expensive', 'थियो': 'was', 'तर': 'but',
            'डिस्काउन्ट': 'discount', 'पाएँ।': 'got.',
            'खुसी': 'happy', 'भएर': 'being', 'घर': 'home', 'फर्किएँ।': 'returned.'
        }
    },
];

// ─── LEVEL 5: Essays ───
const ESSAYS = [
    {
        id: 'e1',
        title: 'मेरो देश नेपाल (My Country Nepal)',
        text: `नेपाल दक्षिण एसियामा अवस्थित एउटा सुन्दर देश हो। यो चीन र भारतको बीचमा पर्छ। नेपालको राजधानी काठमाडौं हो। नेपालमा हिमालय, पहाड र तराई गरी तीनवटा भौगोलिक क्षेत्रहरू छन्।

संसारको सबैभन्दा अग्लो हिमाल सगरमाथा नेपालमा पर्छ। यसको उचाइ ८,८४८ मिटर छ। नेपालमा धेरै जातजाति र भाषाहरू छन्। नेपाली भाषा राष्ट्रभाषा हो। नेपालको झण्डा संसारमा अनौठो छ किनभने यो त्रिकोणाकार छ।

नेपालमा धेरै सुन्दर ठाउँहरू छन्। लुम्बिनी, पशुपतिनाथ, चितवन र पोखरा प्रसिद्ध पर्यटन स्थलहरू हुन्। नेपाली मान्छेहरू अतिथिसत्कारी र मिलनसार हुन्छन्। नेपालको संस्कृति र परम्परा धेरै धनी छ।

म आफ्नो देश नेपाललाई माया गर्छु।`,
        en: `Nepal is a beautiful country situated in South Asia. It lies between China and India. The capital of Nepal is Kathmandu. Nepal has three geographical regions: Himalaya, hills, and Terai.

The world's tallest mountain, Mount Everest (Sagarmatha), is in Nepal. Its height is 8,848 meters. Nepal has many ethnic groups and languages. The Nepali language is the national language. Nepal's flag is unique in the world because it is triangular.

Nepal has many beautiful places. Lumbini, Pashupatinath, Chitwan, and Pokhara are famous tourist destinations. Nepali people are hospitable and friendly. Nepal's culture and tradition are very rich.

I love my country Nepal.`,
        words: {
            'नेपाल': 'Nepal', 'दक्षिण': 'south', 'एसियामा': 'in Asia',
            'अवस्थित': 'situated', 'एउटा': 'one/a', 'सुन्दर': 'beautiful',
            'देश': 'country', 'हो।': 'is.', 'यो': 'this/it',
            'चीन': 'China', 'र': 'and', 'भारतको': 'of India',
            'बीचमा': 'between', 'पर्छ।': 'falls/lies.',
            'नेपालको': 'of Nepal', 'राजधानी': 'capital', 'काठमाडौं': 'Kathmandu',
            'नेपालमा': 'in Nepal', 'हिमालय,': 'Himalaya,', 'पहाड': 'hills',
            'तराई': 'Terai (plains)', 'गरी': 'making/including',
            'तीनवटा': 'three (counter)', 'भौगोलिक': 'geographical',
            'क्षेत्रहरू': 'regions', 'छन्।': 'are.',
            'संसारको': 'of the world', 'सबैभन्दा': 'most (superlative)',
            'अग्लो': 'tall/high', 'हिमाल': 'mountain',
            'सगरमाथा': 'Sagarmatha (Everest)', 'यसको': 'its',
            'उचाइ': 'height', '८,८४८': '8,848', 'मिटर': 'meters',
            'छ।': 'is.', 'धेरै': 'many', 'जातजाति': 'ethnic groups',
            'भाषाहरू': 'languages', 'छन्।': 'are.',
            'नेपाली': 'Nepali', 'भाषा': 'language', 'राष्ट्रभाषा': 'national language',
            'झण्डा': 'flag', 'संसारमा': 'in the world',
            'अनौठो': 'unique', 'छ': 'is', 'किनभने': 'because',
            'त्रिकोणाकार': 'triangular',
            'ठाउँहरू': 'places', 'लुम्बिनी,': 'Lumbini,',
            'पशुपतिनाथ,': 'Pashupatinath,', 'चितवन': 'Chitwan',
            'पोखरा': 'Pokhara', 'प्रसिद्ध': 'famous',
            'पर्यटन': 'tourism', 'स्थलहरू': 'destinations', 'हुन्।': 'are.',
            'मान्छेहरू': 'people', 'अतिथिसत्कारी': 'hospitable',
            'मिलनसार': 'friendly', 'हुन्छन्।': 'are.',
            'संस्कृति': 'culture', 'परम्परा': 'tradition', 'धनी': 'rich',
            'म': 'I', 'आफ्नो': 'own', 'नेपाललाई': 'Nepal (to/for)',
            'माया': 'love', 'गर्छु।': 'do.'
        }
    },
];

// ─── All levels ───
const LEVELS = [
    { id: 'words', label: 'शब्द (Words)', sublabel: '100 most common words', icon: '१', type: 'words' },
    { id: 'phrases', label: 'वाक्यांश (Phrases)', sublabel: '2-3 word combinations', icon: '२', type: 'phrases' },
    { id: 'sentences', label: 'वाक्य (Sentences)', sublabel: 'Simple sentences', icon: '३', type: 'sentences' },
    { id: 'paragraphs', label: 'अनुच्छेद (Paragraphs)', sublabel: 'Short paragraphs', icon: '४', type: 'paragraphs' },
    { id: 'essays', label: 'निबन्ध (Essays)', sublabel: 'Longer texts', icon: '५', type: 'essays' },
];

// ─── State ───
let currentLevel = null;
let currentItemIndex = 0;
let showRoman = localStorage.getItem('nepali-show-roman') !== 'false';
let learnedWords = new Set(JSON.parse(localStorage.getItem('nepali-learned') || '[]'));

document.addEventListener('DOMContentLoaded', () => {
    renderLevelSidebar();
    setupThemeToggle();
    setupRomanToggle();
    selectLevel('words');
});

// ─── Audio: Web Speech API ───
function speakNepali(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ne-NP';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
}

function createSpeakBtn(text) {
    const btn = document.createElement('button');
    btn.className = 'speak-btn';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    btn.title = 'Listen';
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        speakNepali(text);
        btn.classList.add('speak-active');
        setTimeout(() => btn.classList.remove('speak-active'), 600);
    });
    return btn;
}

// ─── Romanization Toggle ───
function setupRomanToggle() {
    const toggle = document.getElementById('roman-toggle');
    if (!toggle) return;
    toggle.checked = showRoman;
    toggle.addEventListener('change', () => {
        showRoman = toggle.checked;
        localStorage.setItem('nepali-show-roman', showRoman);
        document.querySelectorAll('.roman-sub').forEach(el => {
            el.style.display = showRoman ? '' : 'none';
        });
    });
}

// ─── Progress Tracking ───
function saveLearned() {
    localStorage.setItem('nepali-learned', JSON.stringify([...learnedWords]));
}

function toggleLearned(key) {
    if (learnedWords.has(key)) learnedWords.delete(key);
    else learnedWords.add(key);
    saveLearned();
}

function updateProgressBar(total, learnedKeys) {
    const container = document.getElementById('progress-bar-container');
    const label = document.getElementById('progress-label');
    const fill = document.getElementById('progress-fill');
    if (!container) return;
    const count = learnedKeys.filter(k => learnedWords.has(k)).length;
    container.style.display = '';
    label.textContent = `${count} / ${total} learned`;
    fill.style.width = total > 0 ? `${(count / total) * 100}%` : '0%';
}

function hideProgressBar() {
    const container = document.getElementById('progress-bar-container');
    if (container) container.style.display = 'none';
}

function renderLevelSidebar() {
    const sidebar = document.getElementById('level-list');
    LEVELS.forEach(level => {
        const li = document.createElement('li');
        li.className = 'level-item';
        li.dataset.level = level.id;
        li.innerHTML = `
            <span class="level-icon">${level.icon}</span>
            <div class="level-info">
                <span class="level-label">${level.label}</span>
                <span class="level-sublabel">${level.sublabel}</span>
            </div>
        `;
        li.addEventListener('click', () => selectLevel(level.id));
        sidebar.appendChild(li);
    });
}

function selectLevel(levelId) {
    currentLevel = levelId;
    currentItemIndex = 0;

    // Highlight active
    document.querySelectorAll('.level-item').forEach(el => {
        el.classList.toggle('active', el.dataset.level === levelId);
    });

    renderContent();
}

function renderContent() {
    const main = document.getElementById('reading-content');
    const vocabBar = document.getElementById('vocab-display');
    vocabBar.innerHTML = '<span class="vocab-hint">Hover over any Nepali word to see its English meaning</span>';

    switch (currentLevel) {
        case 'words': renderWords(main); break;
        case 'phrases': renderPhrases(main); break;
        case 'sentences': renderSentences(main); break;
        case 'paragraphs': renderParagraphs(main); break;
        case 'essays': renderEssays(main); break;
    }
}

// ─── Word-level hover logic ───
function makeHoverable(text, en, roman) {
    const span = document.createElement('span');
    span.className = 'hoverable-word';
    span.textContent = text;
    span.dataset.en = en || '';
    span.dataset.roman = roman || '';

    span.addEventListener('mouseenter', () => {
        const vocabBar = document.getElementById('vocab-display');
        vocabBar.innerHTML = `
            <span class="vocab-np">${text}</span>
            ${roman ? `<span class="vocab-roman">${roman}</span>` : ''}
            <span class="vocab-en">${en}</span>
        `;
        span.classList.add('word-active');
    });

    span.addEventListener('mouseleave', () => {
        span.classList.remove('word-active');
    });

    return span;
}

// ─── Render: Words ───
function renderWords(container) {
    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'content-header';
    header.innerHTML = `<h2>शब्द — 100 Most Common Words</h2>
        <p class="content-subtitle">Click a word to hear it. Tap ✓ to mark as learned.</p>`;
    container.appendChild(header);

    // Build learned keys for progress
    const learnedKeys = WORDS.map((_, i) => `word-${i}`);
    updateProgressBar(WORDS.length, learnedKeys);

    const grid = document.createElement('div');
    grid.className = 'word-grid';

    WORDS.forEach((w, i) => {
        const key = `word-${i}`;
        const card = document.createElement('div');
        card.className = 'word-card' + (learnedWords.has(key) ? ' learned' : '');

        card.addEventListener('mouseenter', () => {
            const vocabBar = document.getElementById('vocab-display');
            vocabBar.innerHTML = `
                <span class="vocab-np">${w.np}</span>
                <span class="vocab-roman">${w.roman}</span>
                <span class="vocab-en">${w.en}</span>
            `;
            card.classList.add('word-active');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('word-active');
        });

        // Nepali text + romanization
        card.innerHTML = `<span class="word-np">${w.np}</span>
            <span class="roman-sub" style="${showRoman ? '' : 'display:none'}">${w.roman}</span>`;

        // Speak on card click
        card.addEventListener('click', () => speakNepali(w.np));

        // Speak button
        card.appendChild(createSpeakBtn(w.np));

        // Learned toggle
        const learnBtn = document.createElement('button');
        learnBtn.className = 'learn-btn' + (learnedWords.has(key) ? ' active' : '');
        learnBtn.innerHTML = '✓';
        learnBtn.title = 'Mark as learned';
        learnBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLearned(key);
            card.classList.toggle('learned');
            learnBtn.classList.toggle('active');
            updateProgressBar(WORDS.length, learnedKeys);
        });
        card.appendChild(learnBtn);

        grid.appendChild(card);
    });

    container.appendChild(grid);
}

// ─── Render: Phrases ───
function renderPhrases(container) {
    container.innerHTML = '';
    hideProgressBar();

    const header = document.createElement('div');
    header.className = 'content-header';
    header.innerHTML = `<h2>वाक्यांश — Common Phrases</h2>
        <p class="content-subtitle">Click any phrase to hear it spoken.</p>`;
    container.appendChild(header);

    PHRASES.forEach(group => {
        const section = document.createElement('div');
        section.className = 'phrase-section';
        section.innerHTML = `<h3 class="section-title">${group.title}</h3>`;

        const list = document.createElement('div');
        list.className = 'phrase-list';

        group.items.forEach(p => {
            const row = document.createElement('div');
            row.className = 'phrase-row';

            row.addEventListener('mouseenter', () => {
                const vocabBar = document.getElementById('vocab-display');
                vocabBar.innerHTML = `
                    <span class="vocab-np">${p.np}</span>
                    <span class="vocab-roman">${p.roman}</span>
                    <span class="vocab-en">${p.en}</span>
                `;
                row.classList.add('word-active');
            });
            row.addEventListener('mouseleave', () => {
                row.classList.remove('word-active');
            });

            row.innerHTML = `<span class="phrase-np">${p.np}</span>
                <span class="roman-sub" style="${showRoman ? '' : 'display:none'}">${p.roman}</span>`;

            // Speak on click
            row.addEventListener('click', () => speakNepali(p.np));

            // Speak button
            row.appendChild(createSpeakBtn(p.np));

            list.appendChild(row);
        });

        section.appendChild(list);
        container.appendChild(section);
    });
}

// ─── Render: Sentences ───
function renderSentences(container) {
    container.innerHTML = '';
    hideProgressBar();

    const header = document.createElement('div');
    header.className = 'content-header';
    header.innerHTML = `<h2>वाक्य — Simple Sentences</h2>
        <p class="content-subtitle">Hover over words for meaning. Click the speaker to listen.</p>`;
    container.appendChild(header);

    SENTENCES.forEach(group => {
        const section = document.createElement('div');
        section.className = 'sentence-section';
        section.innerHTML = `<h3 class="section-title">${group.title}</h3>`;

        group.items.forEach(s => {
            const block = document.createElement('div');
            block.className = 'sentence-block';

            const sentenceEl = document.createElement('div');
            sentenceEl.className = 'sentence-text';

            s.words.forEach(w => {
                const wordSpan = makeHoverable(w.np, w.en, '');
                sentenceEl.appendChild(wordSpan);
                sentenceEl.appendChild(document.createTextNode(' '));
            });

            // Speaker button for the whole sentence
            sentenceEl.appendChild(createSpeakBtn(s.np));

            block.appendChild(sentenceEl);

            const enEl = document.createElement('div');
            enEl.className = 'sentence-en';
            enEl.textContent = s.en;
            block.appendChild(enEl);

            section.appendChild(block);
        });

        container.appendChild(section);
    });
}

// ─── Render: Paragraphs ───
function renderParagraphs(container) {
    container.innerHTML = '';
    hideProgressBar();
    const header = document.createElement('div');
    header.className = 'content-header';
    header.innerHTML = `<h2>अनुच्छेद — Paragraphs</h2>
        <p class="content-subtitle">Short paragraphs on everyday topics. Hover over words for meaning.</p>`;
    container.appendChild(header);

    // Item selector tabs
    const tabs = document.createElement('div');
    tabs.className = 'item-tabs';
    PARAGRAPHS.forEach((p, i) => {
        const tab = document.createElement('button');
        tab.className = 'item-tab' + (i === currentItemIndex ? ' active' : '');
        tab.textContent = p.title;
        tab.addEventListener('click', () => {
            currentItemIndex = i;
            renderParagraphs(container);
        });
        tabs.appendChild(tab);
    });
    container.appendChild(tabs);

    const para = PARAGRAPHS[currentItemIndex];
    renderLongText(container, para);
}

// ─── Render: Essays ───
function renderEssays(container) {
    container.innerHTML = '';
    hideProgressBar();
    const header = document.createElement('div');
    header.className = 'content-header';
    header.innerHTML = `<h2>निबन्ध — Essays</h2>
        <p class="content-subtitle">Longer connected texts. Hover over words for meaning.</p>`;
    container.appendChild(header);

    const tabs = document.createElement('div');
    tabs.className = 'item-tabs';
    ESSAYS.forEach((e, i) => {
        const tab = document.createElement('button');
        tab.className = 'item-tab' + (i === currentItemIndex ? ' active' : '');
        tab.textContent = e.title;
        tab.addEventListener('click', () => {
            currentItemIndex = i;
            renderEssays(container);
        });
        tabs.appendChild(tab);
    });
    container.appendChild(tabs);

    const essay = ESSAYS[currentItemIndex];
    renderLongText(container, essay);
}

// ─── Shared: Render long text with word-level hover ───
function renderLongText(container, data) {
    const block = document.createElement('div');
    block.className = 'reading-block';

    // Title
    const title = document.createElement('h3');
    title.className = 'reading-title';
    title.textContent = data.title;
    block.appendChild(title);

    // Nepali text with hoverable words
    const textEl = document.createElement('div');
    textEl.className = 'reading-text';

    // Split into paragraphs (by double newline), then words
    const paragraphs = data.text.split('\n\n');
    paragraphs.forEach((paraText, pi) => {
        const pEl = document.createElement('p');
        const words = paraText.trim().split(/\s+/);

        words.forEach(word => {
            const en = data.words[word] || data.words[word.replace(/[।,]$/, '')] || '';
            const span = makeHoverable(word, en, '');
            pEl.appendChild(span);
            pEl.appendChild(document.createTextNode(' '));
        });

        textEl.appendChild(pEl);
    });

    block.appendChild(textEl);

    // Full English translation (collapsible)
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'translation-toggle';
    toggleBtn.textContent = 'Show English Translation';
    const transEl = document.createElement('div');
    transEl.className = 'translation-text hidden';
    transEl.textContent = data.en;

    toggleBtn.addEventListener('click', () => {
        transEl.classList.toggle('hidden');
        toggleBtn.textContent = transEl.classList.contains('hidden')
            ? 'Show English Translation'
            : 'Hide English Translation';
    });

    block.appendChild(toggleBtn);
    block.appendChild(transEl);
    container.appendChild(block);
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('nepali-theme', next);
        });
    }
}
