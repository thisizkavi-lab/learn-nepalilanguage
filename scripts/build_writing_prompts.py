# -*- coding: utf-8 -*-
import json
import os

categories_data = [
    {
        "id": 1,
        "titleNep": "व्यक्तिगत विवरण र आत्म-चिन्तन",
        "titleEng": "Personal profile and self-reflection",
        "icon": "user",
        "prompts": [
            {
                "num": 1,
                "nepali": "आफ्नो बारेमा छोटो परिचय लेख्नुहोस्। नयाँ चिनजान भएको व्यक्तिले तपाईंको बारेमा जानोस् भन्ने चाहनुभएका कुराहरू समावेश गर्नुहोस्।",
                "english": "Write a short introduction to yourself. Include the details you would want a new acquaintance to know."
            },
            {
                "num": 2,
                "nepali": "आफ्नो स्वभाव र व्यक्तित्वको वर्णन गर्नुहोस्। तपाईंका सबल पक्षहरू के-के हुन्, तपाईं कुन कमजोरी सुधार्न प्रयास गर्दै हुनुहुन्छ, र त्यसलाई सुधार्न के कुराले मद्दत गर्न सक्छ?",
                "english": "Describe your personality. What are your strengths, what is a weakness you are working on, and what could help you improve?"
            },
            {
                "num": 3,
                "nepali": "आफूलाई एउटा शब्दमा वर्णन गर्नुहोस् र त्यो शब्द किन रोज्नुभयो स्पष्ट पार्नुहोस्।",
                "english": "Describe yourself in one word and explain why you chose it."
            },
            {
                "num": 4,
                "nepali": "अरूले आफूलाई कस्तो व्यक्तिको रूपमा हेरून् भन्ने चाहनुहुन्छ? यो तपाईंले आफूलाई हेर्ने दृष्टिकोणसँग कत्तिको मेल खान्छ?",
                "english": "What kind of person do you want others to see in you? How does that compare with how you see yourself?"
            },
            {
                "num": 5,
                "nepali": "ऐनामा आफ्नो अनुहार हेर्नुहोस् र आफ्नो मुहार तथा भावको वर्णन गर्नुहोस्। तपाईं के देख्नुहुन्छ र त्यसमा कुन भावना झल्किन्छ?",
                "english": "Look at yourself in a mirror and describe your face and expression. What do you notice, and what emotion do you see?"
            },
            {
                "num": 6,
                "nepali": "आफ्नो बारेमा तपाईंलाई सबैभन्दा मन पर्ने कुरा के हो? अरूले प्रशंसा वा सम्मान गर्न सक्ने तपाईंको कुनै एक गुण, उपलब्धि वा काम के हो?",
                "english": "What is something you appreciate about yourself? What is one quality, achievement, or action you think others could admire or respect?"
            },
            {
                "num": 7,
                "nepali": "हालसालै तपाईंले आफ्नो बारेमा के नयाँ कुरा थाहा पाउनुभयो? आफ्नो बारेमा अझै थाहा पाउन बाँकी कुरा के छ?",
                "english": "What is something you have recently discovered about yourself? What is something you still do not know about yourself?"
            },
            {
                "num": 8,
                "nepali": "के तपाईंलाई अरूले के सोच्लान् भन्ने डर वा संकोच लाग्छ? के तपाईं अरूलाई भन्दा आफूलाई बढी कडा रूपमा जाँच्नुहुन्छ? यसले तपाईंलाई कस्तो असर गर्छ वर्णन गर्नुहोस्।",
                "english": "Do you feel self-conscious or afraid of what other people think of you? Do you judge yourself more harshly than you judge other people? Describe how this affects you."
            },
            {
                "num": 9,
                "nepali": "तपाईंका मुख्य जीवन मूल्य र मान्यताहरू के-के हुन्? तपाईंको जीवन कुन सिद्धान्त वा व्यक्तिमा आधारित छ?",
                "english": "What are your core values? Who or what do you base your life on?"
            },
            {
                "num": 10,
                "nepali": "तपाईंलाई सधैं के कुराको डर लागिरहन्छ र किन? आफ्नो बारेमा बारम्बार मनमा आउने शङ्का वा चिन्ता के हो, र के ती डरहरू साँच्चै जायज छन्?",
                "english": "What have you always been afraid of, and why? What recurring doubts or worries do you have about yourself, and are your worst fears warranted?"
            },
            {
                "num": 11,
                "nepali": "तपाईं प्रायः कुन भावना बढी अनुभव गर्नुहुन्छ? तीमध्ये कुनै एक भावना निकै तीव्र भएको क्षणको वर्णन गर्नुहोस्।",
                "english": "What emotions do you experience most often? Describe a time when one of them was especially strong."
            },
            {
                "num": 12,
                "nepali": "तपाईं दिनको कुन समयमा सबैभन्दा बढी सक्रिय र चनाखो महसुस गर्नुहुन्छ (बिहान कि साँझ/राती)? यसले तपाईंको दिनचर्यालाई कसरी प्रभावित गर्छ?",
                "english": "What is your chronotype: when do you tend to feel most alert, and how does that shape your day?"
            },
            {
                "num": 13,
                "nepali": "तपाईं कुन कुरा गोप्य राख्न चाहनुहुन्छ? यदि चाहनुहुन्छ भने, कसैसँग नबाँडेको कुनै भित्री कुरा वा रहस्यको बारेमा लेख्नुहोस्।",
                "english": "What is something you would rather keep private? If you choose, write about an innermost secret you have never shared."
            },
            {
                "num": 14,
                "nepali": "तपाईं आफ्नो जीवनका कुन पक्षहरू बदल्न चाहनुहुन्छ? कुन अनावश्यक कुरा, बानी वा दायित्व हटाउन चाहनुहुन्छ र जीवनमा के कुरा थप्न चाहनुहुन्छ?",
                "english": "What parts of your life would you like to change? What unnecessary things, habits, or commitments would you like to remove, and what would you like more of?"
            },
            {
                "num": 15,
                "nepali": "कुन कामहरूले तपाईंको जीवनलाई सरल बनाउन सक्छन्? कुन नराम्रा बानीले तपाईंको प्रगति रोकिरहेका छन् र त्यसको सट्टा तपाईं के गर्न चाहनुहुन्छ?",
                "english": "What actions could simplify your life? Which bad habits are getting in your way, and what would you like to do instead?"
            },
            {
                "num": 16,
                "nepali": "अहिलेको समयमा कुन शब्दले तपाईंलाई सान्त्वना वा ढाडस दिन सक्छ? ती शब्दहरू आफ्नै लागि एउटा पत्रको रूपमा लेख्नुहोस्।",
                "english": "What words would give you comfort or encouragement right now? Write them as a note to yourself."
            },
            {
                "num": 17,
                "nepali": "हिजोआज तपाईंलाई कुन विषयमा बढी उत्सुकता लाग्छ? तपाईं के कुरा अझ गहिरोसँग बुझ्न चाहनुहुन्छ?",
                "english": "What are you curious about these days? What would you like to understand better?"
            },
            {
                "num": 18,
                "nepali": "तपाईंको अहिलेसम्मको एउटा ठूलो उपलब्धि के हो?",
                "english": "What is one of your greatest accomplishments?"
            },
            {
                "num": 19,
                "nepali": "यो वर्ष तपाईं के उपलब्धि हासिल गर्ने आशा राख्नुहुन्छ?",
                "english": "What do you hope to achieve this year?"
            },
            {
                "num": 20,
                "nepali": "तपाईंले जीवनमा सिकेको सबैभन्दा महत्त्वपूर्ण पाठ के हो?",
                "english": "What is one of the most important lessons you have learned in life?"
            },
            {
                "num": 21,
                "nepali": "तपाईं पछिल्लो पुस्तालाई कुन कुरा सिकाउन चाहनुहुन्छ?",
                "english": "What is something you would like to teach the next generation?"
            },
            {
                "num": 22,
                "nepali": "तपाईं यो संसारमा कसरी सकारात्मक प्रभाव वा परिवर्तन ल्याउने आशा राख्नुहुन्छ?",
                "english": "What is one way you hope to make a difference in the world?"
            }
        ]
    },
    {
        "id": 2,
        "titleNep": "दैनिक जीवन, बानी र रुचिहरू",
        "titleEng": "Everyday life, habits, and interests",
        "icon": "coffee",
        "prompts": [
            {
                "num": 1,
                "nepali": "तपाईंको सामान्य दिन कस्तो हुन्छ वर्णन गर्नुहोस्। बिहानीको दिनचर्या र ब्युँझिनेबित्तिकै तपाईं पहिले के गर्नुहुन्छ समावेश गर्नुहोस्।",
                "english": "Describe a typical day in your life, including your morning routine and the first thing you reach for when you wake up."
            },
            {
                "num": 2,
                "nepali": "तपाईंको सामान्य सप्ताहन्त (शनिबार/आइतबार) कस्तो बित्छ वर्णन गर्नुहोस्। तपाईं प्रायः के गर्नुहुन्छ, तपाईंलाई सबैभन्दा मन पर्ने काम के हो, र यो सप्ताहन्तको योजना के छ?",
                "english": "Describe a typical weekend. What do you usually do, what is your favorite weekend activity, and what are your plans for this weekend?"
            },
            {
                "num": 3,
                "nepali": "तपाईंका रुचि र सोखहरू के-के हुन्? तपाईं फुर्सदको समय कसरी बिताउनुहुन्छ, र एक्लै वा साथीहरूसँग के गर्न मन पराउनुहुन्छ?",
                "english": "What are your hobbies and interests? How do you spend your free time, and what activities do you enjoy doing alone or with a group?"
            },
            {
                "num": 4,
                "nepali": "तपाईं आफ्नो जन्मदिन वा नयाँ वर्ष कसरी मनाउनुहुन्छ? तपाईंलाई उत्सव मनाउने कुन तरिका सबैभन्दा मन पर्छ?",
                "english": "How do you celebrate your birthday or New Year? What is your favorite way to celebrate?"
            },
            {
                "num": 5,
                "nepali": "तपाईं कुन नयाँ सोख सुरु गर्न चाहनुहुन्छ? कुन नयाँ सीप सिक्न चाहनुहुन्छ र किन?",
                "english": "What hobby would you like to try? What skill would you like to learn, and why?"
            },
            {
                "num": 6,
                "nepali": "व्यस्त दिन वा हप्तापछि तपाईं कसरी आराम गर्न मन पराउनुहुन्छ? के कुराले तपाईंलाई शान्त महसुस गराउँछ?",
                "english": "How do you like to relax after a busy day or week? What helps you feel calm?"
            },
            {
                "num": 7,
                "nepali": "यदि तपाईंसँग अझ धेरै फुर्सदको समय हुन्थ्यो भने तपाईं त्यो समय कसरी बिताउनुहुन्थ्यो?",
                "english": "If you had more free time, how would you spend it?"
            },
            {
                "num": 8,
                "nepali": "काममा व्यवस्थित र उत्पादक बन्न तपाईंलाई केले मद्दत गर्छ? तपाईंले अपनाउने कुनै प्रभावकारी प्रणाली वा बानीको वर्णन गर्नुहोस्।",
                "english": "What helps you stay productive and organized? Describe a system or habit that works for you."
            },
            {
                "num": 9,
                "nepali": "तपाईंलाई दिन, हप्ता, महिना वा वर्षको कुन समय सबैभन्दा मन पर्छ? त्यसमा तपाईंलाई के मन पर्छ?",
                "english": "What is your favorite time of day, week, month, or year? What do you like about it?"
            },
            {
                "num": 10,
                "nepali": "तपाईंको मन पर्ने ऋतु कुन हो, र तपाईं कस्तो मौसम बढी मन पराउनुहुन्छ?",
                "english": "What is your favorite season, and what kind of weather do you enjoy most?"
            },
            {
                "num": 11,
                "nepali": "आजको मौसमको वर्णन गर्नुहोस्। यसले तपाईंको आजको योजना वा मनको स्थितिलाई कस्तो प्रभाव पारेको छ?",
                "english": "Describe today's weather. How does it affect your plans or mood?"
            },
            {
                "num": 12,
                "nepali": "तपाईंको सबैभन्दा मन पर्ने पहिरन वा लुगा कुन हो? तपाईं त्यो कहिले लगाउन मन पराउनुहुन्छ?",
                "english": "What is your favorite outfit or piece of clothing? When do you like to wear it?"
            },
            {
                "num": 13,
                "nepali": "तपाईंको मन पर्ने रङ कुन हो, र तपाईं त्यो रङ कहाँ देख्न मन पराउनुहुन्छ?",
                "english": "What is your favorite color, and where do you like seeing it?"
            },
            {
                "num": 14,
                "nepali": "तपाईंको मन पर्ने जनावर वा पाल्तु जनावर कुन हो? तपाईंले चिनेको वा पाल्न चाहेको कुनै जनावरको वर्णन गर्नुहोस्।",
                "english": "What is your favorite animal or pet? Describe an animal you know or would like to have."
            },
            {
                "num": 15,
                "nepali": "तपाईंलाई कस्तो प्रकारको व्यायाम मन पर्छ? व्यायाम गर्नुअघि र गरेपछि तपाईं कस्तो महसुस गर्नुहुन्छ?",
                "english": "What is your favorite type of exercise? How do you feel before and after doing it?"
            },
            {
                "num": 16,
                "nepali": "तपाईंलाई खेल्न वा हेर्न मन पर्ने खेल कुन हो? त्यस खेलमा तपाईंलाई के कुरा रमाइलो लाग्छ?",
                "english": "What is your favorite sport to play or watch? What do you enjoy about it?"
            },
            {
                "num": 17,
                "nepali": "तपाईंको मन पर्ने वा सबैभन्दा धेरै चलाउने मोबाइल एप कुन हो? तपाईं त्यो एप केका लागि प्रयोग गर्नुहुन्छ?",
                "english": "What is your favorite app or the app you use most? What do you use it for?"
            },
            {
                "num": 18,
                "nepali": "तपाईं कुन सामाजिक सञ्जाल सबैभन्दा बढी प्रयोग गर्नुहुन्छ? त्यो प्रयोग गर्दा तपाईंलाई के कुरा मन पर्छ वा मन पर्दैन?",
                "english": "What social media platform do you use most? What do you like or dislike about using it?"
            },
            {
                "num": 19,
                "nepali": "तपाईंलाई कुन प्रविधि वा उपकरण विशेष रूपमा मन पर्छ? यसले तपाईंको दैनिक जीवनमा कसरी मद्दत पुर्‍याउँछ?",
                "english": "What technology or gadget do you especially like? How does it fit into your daily life?"
            },
            {
                "num": 20,
                "nepali": "दैनिक जीवनमा तपाईंलाई आनन्द दिने कुनै सानो कुरा के हो? तपाईं कहिले त्यो आनन्द लिनुहुन्छ?",
                "english": "What is a simple pleasure you indulge in? When do you treat yourself to it?"
            },
            {
                "num": 21,
                "nepali": "हालसालै देखेको कुनै सपना सम्झनुहुन्छ? यदि बारम्बार देख्ने कुनै सपना छ भने, त्यसको वर्णन गर्नुहोस् र त्यसको अर्थ के हुन सक्छ लेख्नुहोस्।",
                "english": "What is a recent dream you remember? If you have a recurring dream, describe it and what you think it may mean to you."
            },
            {
                "num": 22,
                "nepali": "तपाईंको कल्पनाको आदर्श भविष्य वा 'सपनाको जीवन' कस्तो देखिन्छ?",
                "english": "What does your ideal future or “dream life” look like?"
            }
        ]
    },
    {
        "id": 3,
        "titleNep": "परिवार, साथीभाइ र सम्बन्धहरू",
        "titleEng": "Family, friends, and relationships",
        "icon": "heart",
        "prompts": [
            {
                "num": 1,
                "nepali": "आफ्नो परिवार र परिवारका सदस्यहरूबीचको सम्बन्धको वर्णन गर्नुहोस्।",
                "english": "Describe your family and the relationships between its members."
            },
            {
                "num": 2,
                "nepali": "आफ्ना आमाबुवासँग तपाईंको सम्बन्ध कस्तो छ? यदि दाजुभाइ वा दिदीबहिनी छन् भने उनीहरूसँग तपाईंको सम्बन्ध कस्तो छ?",
                "english": "What is your relationship like with your parents? What is your relationship like with your siblings, if you have any?"
            },
            {
                "num": 3,
                "nepali": "परिवारसँग मिलेर गर्न तपाईंलाई सबैभन्दा मन पर्ने क्रियाकलाप के हो?",
                "english": "What is your favorite activity to do with your family?"
            },
            {
                "num": 4,
                "nepali": "आफ्नो मिल्ने साथी (बेस्ट फ्रेन्ड) को वर्णन गर्नुहोस्। तपाईंहरू सँगै के गर्न मन पराउनुहुन्छ?",
                "english": "Describe your best friend. What do you enjoy doing together?"
            },
            {
                "num": 5,
                "nepali": "तपाईंलाई सबैभन्दा राम्रोसँग कसले चिन्छ? अरूले नबुझेका तपाईंका कुन कुराहरू उनीहरूले बुझेका छन्?",
                "english": "Who knows you best? What do they understand about you that other people might not?"
            },
            {
                "num": 6,
                "nepali": "तपाईंको जीवनको सबैभन्दा महत्त्वपूर्ण वा तपाईंले सबैभन्दा बढी विश्वास गर्ने व्यक्ति को हुनुहुन्छ? उहाँलाई विश्वासिलो बनाउने कुरा के हो?",
                "english": "Who is the most important person in your life, or the person you trust most? What makes you trust them?"
            },
            {
                "num": 7,
                "nepali": "तपाईंको जीवनमा कसको ठूलो प्रभाव परेको छ? तपाईंले उहाँबाट के सिक्नुभयो?",
                "english": "Who has had a major impact on your life? What did you learn from them?"
            },
            {
                "num": 8,
                "nepali": "तपाईं कसलाई आदर वा प्रशंसा गर्नुहुन्छ (खेलाडी, चर्चित व्यक्ति, वा टाढैबाट सम्मान गर्ने व्यक्ति)? तपाईं उहाँको कुन गुणको सम्मान गर्नुहुन्छ?",
                "english": "Who do you admire, including an athlete, celebrity, or someone you may admire quietly or from a distance? What do you respect about them?"
            },
            {
                "num": 9,
                "nepali": "माया व्यक्त गर्ने तपाईंको तरिका (love language) के हो? तपाईं अरूप्रति माया कसरी देखाउनुहुन्छ, र कुन कुराले तपाईंलाई माया र सम्मान पाएको महसुस गराउँछ?",
                "english": "What is your love language? How do you show love to other people, and what makes you feel loved and appreciated?"
            },
            {
                "num": 10,
                "nepali": "कुन गुणले कसैलाई राम्रो जीवनसाथी बनाउँछ? तपाईंको विचारमा आदर्श सम्बन्ध कस्तो हुनुपर्छ वर्णन गर्नुहोस्।",
                "english": "What makes someone a good partner? Describe your ideal relationship."
            },
            {
                "num": 11,
                "nepali": "सानो छँदा तपाईं कस्तो जीवनसाथीको कल्पना गर्नुहुन्थ्यो? अहिले तपाईंले महत्त्व दिने कुराहरूसँग त्यो कसरी फरक छ?",
                "english": "What kind of person did you imagine as an ideal partner when you were younger? How is that different from what you value now?"
            },
            {
                "num": 12,
                "nepali": "सम्बन्ध टुट्दा (ब्रेकअप) तपाईं कसरी सम्हाल्नुहुन्छ? अगाडि बढ्न तपाईंलाई केले मद्दत गरेको छ?",
                "english": "How do you deal with a breakup? What has helped you move forward?"
            },
            {
                "num": 13,
                "nepali": "मनमा ठूलो चोट लागेको कुनै क्षणको बारेमा लेख्नुहोस्। के भएको थियो र तपाईं त्यसबाट कसरी सम्हालिनुभयो?",
                "english": "Write about a time you felt heartbroken. What happened, and how did you recover?"
            },
            {
                "num": 14,
                "nepali": "आफ्नो पहिलो आकर्षण वा पहिलोपटक माया बसेको अनुभवको बारेमा लेख्नुहोस्।",
                "english": "Write about your first crush or the first time you fell in love."
            },
            {
                "num": 15,
                "nepali": "कुनै अभिभावक, शिक्षक वा मार्गदर्शकले तपाईंलाई दिएको सबैभन्दा राम्रो सल्लाह के थियो? तपाईंले त्यसलाई जीवनमा कसरी प्रयोग गर्नुभयो?",
                "english": "What is the best advice a parent, teacher, or mentor has given you? How have you used it?"
            },
            {
                "num": 16,
                "nepali": "तपाईंले अरू कसैको लागि गरेको सबैभन्दा निःस्वार्थ काम के हो? अनि आफूले गरेको सबैभन्दा स्वार्थी काम के थियो?",
                "english": "What is the most selfless thing you have done for someone else? What is the most selfish thing you have done?"
            },
            {
                "num": 17,
                "nepali": "तपाईंले बोलेको सबैभन्दा मूर्खतापूर्ण वा पछि पछुतो लागेको कुरा के थियो? त्यसपछि के भयो?",
                "english": "What is the silliest or most regrettable thing you have said? What happened afterward?"
            },
            {
                "num": 18,
                "nepali": "आफ्नो भाइ, बहिनी वा आफूले माया गर्ने कुनै नयाँ पुस्तालाई तपाईं के प्रेरणादायी कुरा भन्न चाहनुहुन्छ?",
                "english": "What is one encouraging thing you would say to a younger brother or sister, or to a young person you care about?"
            }
        ]
    },
    {
        "id": 4,
        "titleNep": "सम्झनाहरू, मुख्य क्षणहरू र व्यक्तिगत चुनौतीहरू",
        "titleEng": "Memories, milestones, and personal challenges",
        "icon": "bookmark",
        "prompts": [
            {
                "num": 1,
                "nepali": "आफ्नो जीवनको कुनै अविस्मरणीय दिन वा ठूलो क्षणको बारेमा लेख्नुहोस्। त्यो दिन किन विशेष बन्यो?",
                "english": "Write about a memorable day or a major moment in your life. What made it stand out?"
            },
            {
                "num": 2,
                "nepali": "बाल्यकाल वा किशोरावस्थाको कुनै यस्तो सम्झना वर्णन गर्नुहोस् जुन अझै पनि ताजै लाग्छ।",
                "english": "Describe a childhood or teenage memory that still feels vivid."
            },
            {
                "num": 3,
                "nepali": "बाल्यकालमा तपाईंलाई कुन काम गर्न सबैभन्दा रमाइलो लाग्थ्यो? एक्लै के गर्न मन पर्थ्यो र अरूसँग के गर्न मन पर्थ्यो?",
                "english": "What activities did you enjoy most as a child? What did you like doing alone, and what did you like doing with other people?"
            },
            {
                "num": 4,
                "nepali": "सानो छँदा तपाईंले गरेको कुनै चकचके, साहसी वा अनौठो काम के थियो? के भएको थियो लेख्नुहोस्।",
                "english": "What is one crazy, naughty, or exciting thing you did when you were younger? What happened?"
            },
            {
                "num": 5,
                "nepali": "हुर्कँदै गर्दाको आफ्नो मन पर्ने खाना, किताब, चलचित्र, गायक वा कुनै आदर्श पात्रको वर्णन गर्नुहोस्। त्यससँग जोडिएको सम्झना के छ?",
                "english": "Describe a favorite food, book, movie, musician, or idol from when you were growing up. What memory do you associate with it?"
            },
            {
                "num": 6,
                "nepali": "पहिलोपटक घर छोडेर हिँडेको वा साँच्चै आत्मनिर्भर महसुस गरेको क्षणको बारेमा लेख्नुहोस्। त्यसले तपाईंमा के परिवर्तन ल्यायो?",
                "english": "Write about the first time you left home or felt truly independent. What changed for you?"
            },
            {
                "num": 7,
                "nepali": "विद्यालयको पहिलो दिनको अनुभव वर्णन गर्नुहोस्। त्यहाँका मानिस, ठाउँ वा भावनाको बारेमा तपाईंलाई के सम्झना छ?",
                "english": "Describe your first experience at school. What do you remember about the people, place, or feeling?"
            },
            {
                "num": 8,
                "nepali": "आफ्नो विगत र वर्तमान रूपको तुलना गर्नुहोस्। तपाईंका बानी, प्राथमिकता वा दृष्टिकोणमा के परिवर्तन आयो, र के कुरा उस्तै रह्यो?",
                "english": "Compare your past and present selves. What has changed in your habits, priorities, or outlook, and what has stayed the same?"
            },
            {
                "num": 9,
                "nepali": "आफूले गरेको कुनै गल्तीको बारेमा लेख्नुहोस्। त्यसबाट तपाईंले के पाठ सिक्नुभयो?",
                "english": "Write about a mistake you made. What did you learn from it?"
            },
            {
                "num": 10,
                "nepali": "आफूले गरेको कुनै कामले लाज लागेको वा अप्ठ्यारो महसुस भएको क्षणको वर्णन गर्नुहोस्। अहिले फर्केर हेर्दा तपाईंलाई कस्तो लाग्छ?",
                "english": "Describe a time you felt embarrassed or cringed at something you did. How do you look back on it now?"
            },
            {
                "num": 11,
                "nepali": "मनमा ठूलो निराशा छाएको कुनै क्षणको बारेमा लेख्नुहोस्। तपाईंले के आशा राख्नुभएको थियो?",
                "english": "Write about a time you felt disappointed. What were you hoping would happen?"
            },
            {
                "num": 12,
                "nepali": "पहिलोपटक असफलता भोगेको वा कुनै महत्त्वपूर्ण पाठ सिकाएको असफलताको वर्णन गर्नुहोस्।",
                "english": "Describe a time you experienced failure for the first time, or a failure that taught you something important."
            },
            {
                "num": 13,
                "nepali": "हरेस खाऊँ वा काम छोडिदिऊँ जस्तो लागेको कुनै क्षणको बारेमा लेख्नुहोस्। त्यसपछि के भयो?",
                "english": "Write about a time you felt like giving up. What happened next?"
            },
            {
                "num": 14,
                "nepali": "डर लागे पनि हिम्मत जुटाएर डरको सामना गरेको कुनै घटनाको वर्णन गर्नुहोस्।",
                "english": "Describe a time you were afraid but managed to face or overcome your fear."
            },
            {
                "num": 15,
                "nepali": "पछिल्लो पाँच वर्षमा तपाईंले भोगेको सबैभन्दा गाह्रो परिस्थिति के थियो? त्यसले तपाईंलाई कस्तो असर गर्‍यो?",
                "english": "What is one of the hardest things that has happened to you in the past five years? How did it affect you?"
            },
            {
                "num": 16,
                "nepali": "तपाईंले कुनै ठूलो जोखिम मोलेको क्षणको बारेमा लेख्नुहोस्। तपाईंले त्यो जोखिम किन मोल्नुभयो र त्यसको परिणाम के आयो?",
                "english": "Write about a time you took a risk. Why did you take it, and what was the result?"
            },
            {
                "num": 17,
                "nepali": "मनैदेखि कृतज्ञ महसुस भएको कुनै क्षणको वर्णन गर्नुहोस्। तपाईं कसको वा कुन कुराप्रति कृतज्ञ हुनुहुन्थ्यो?",
                "english": "Describe a time you felt genuinely grateful. Who or what were you grateful for?"
            },
            {
                "num": 18,
                "nepali": "तपाईंले अहिलेसम्म देखेको सबैभन्दा सुन्दर ठाउँ कुन हो? तपाईं कुन ठाउँ फेरि घुम्न जान चाहनुहुन्छ?",
                "english": "What is the most beautiful place you have seen? What place would you like to visit again?"
            },
            {
                "num": 19,
                "nepali": "हालसालै कसैले तपाईंको गरेको कुनै प्रशंसा के थियो? त्यसले तपाईंलाई कस्तो महसुस गरायो?",
                "english": "What is a compliment you received recently? How did it make you feel?"
            },
            {
                "num": 20,
                "nepali": "तपाईंले पाएको सबैभन्दा राम्रो उपहार के हो? त्यो कसले दिएको थियो र किन अर्थपूर्ण छ?",
                "english": "What is the best gift you have ever received? Who gave it to you, and why is it meaningful?"
            },
            {
                "num": 21,
                "nepali": "कुनै आवाज, गन्ध, स्वाद वा वस्तु जसले तपाईंलाई विगतको सम्झनामा पुर्‍याउँछ, त्यसको वर्णन गर्नुहोस्।",
                "english": "What is a sound, smell, taste, texture, or object that takes you back to an earlier time in your life? Describe the memory it brings back."
            },
            {
                "num": 22,
                "nepali": "आफ्ना सम्झनाहरूको एउटा 'टाइम क्याप्सुल' बनाउनुहोस्। तपाईं त्यसमा कुन-कुन सम्झना, वस्तु, तस्बिर वा सन्देश राख्नुहुन्थ्यो र किन?",
                "english": "Build a written time capsule of your memories. What keepsakes, objects, photographs, or messages would you put in it, and why?"
            },
            {
                "num": 23,
                "nepali": "आफ्नो बाल्यकाल वा किशोरावस्थाको रूपलाई एउटा चिठी लेख्नुहोस्। तपाईं त्यो उमेरको आफूलाई के भन्न चाहनुहुन्छ?",
                "english": "Write a letter to your younger self or your teenage self. What would you want that version of you to know?"
            },
            {
                "num": 24,
                "nepali": "कल्पना गर्नुहोस्, तपाईंको सानो उमेरको रूप आज तपाईंसँग भेट्न आयो। उसलाई कुन कुराले अचम्मित पार्नेछ र तपाईं उसलाई के भन्नुहुन्छ?",
                "english": "Imagine your younger self came to visit you today. What would surprise them, and what would you tell them?"
            },
            {
                "num": 25,
                "nepali": "तपाईंको समाधिमा के लेखियोस् भन्ने चाहनुहुन्छ? तपाईंले बाँचेको जीवनबारे त्यसले के भनोस् भन्ने आशा गर्नुहुन्छ?",
                "english": "What would you want written on your tombstone? Explain what you hope it says about the life you lived."
            },
            {
                "num": 26,
                "nepali": "यदि आज तपाईंको जीवनको अन्तिम दिन हुन्थ्यो भने तपाईं त्यो दिन कसरी बिताउनुहुन्थ्यो? तपाईंको लागि सबैभन्दा महत्त्वपूर्ण कुरा के हुन्थ्यो?",
                "english": "If today were your last day, how would you spend it? Who or what would matter most?"
            }
        ]
    },
    {
        "id": 5,
        "titleNep": "घर, ठाउँहरू, यात्रा र संस्कृति",
        "titleEng": "Home, places, travel, and culture",
        "icon": "map-pin",
        "prompts": [
            {
                "num": 1,
                "nepali": "तपाईं बस्ने ठाउँ वा घरको वर्णन गर्नुहोस्। त्यसमा तपाईंलाई के मन पर्छ वा के मन पर्दैन?",
                "english": "Describe where you live, including your home or apartment and what you like or dislike about it."
            },
            {
                "num": 2,
                "nepali": "आफ्नो टोल वा छिमेकको वर्णन गर्नुहोस्। त्यहाँ वरिपरि के-के छन् र त्यहाँको वातावरण कस्तो छ?",
                "english": "Describe your neighborhood. What is nearby, and what makes it feel the way it does?"
            },
            {
                "num": 3,
                "nepali": "संसारको कुन ठाउँ तपाईंलाई आफ्नै घरजस्तो आत्मीय लाग्छ र किन?",
                "english": "What place in the world feels like home to you? Why?"
            },
            {
                "num": 4,
                "nepali": "तपाईं बस्न मन पराउने कुनै ठाउँको वर्णन गर्नुहोस्। त्यस ठाउँले तपाईंलाई किन आकर्षित गर्छ?",
                "english": "Describe a place you would like to live. What draws you to it?"
            },
            {
                "num": 5,
                "nepali": "तपाईंको सपनाको घर वा आदर्श घर कस्तो हुन्छ वर्णन गर्नुहोस्।",
                "english": "Describe your dream house or ideal home."
            },
            {
                "num": 6,
                "nepali": "कुनै विगतको नराम्रो अनुभवका कारण तपाईं जान नचाहने कुनै ठाउँ छ? अहिले त्यो ठाउँ सम्झँदा कस्तो महसुस हुन्छ लेख्नुहोस्।",
                "english": "What is a place you avoid because of a past experience? You can keep the details private and focus on how the place feels to you now."
            },
            {
                "num": 7,
                "nepali": "तपाईं बारम्बार गइरहने कुनै ठाउँ (क्याफे, पार्क वा पसल) को वर्णन गर्नुहोस्। तपाईंलाई त्यहाँ के कुराले आकर्षित गरिरहन्छ?",
                "english": "Describe a place you visit often, such as a café, shopping mall, park, or local shop. What keeps you coming back?"
            },
            {
                "num": 8,
                "nepali": "तपाईं सबैभन्दा बढी कुन ठाउँ घुम्न जान चाहनुहुन्छ? तपाईंले हेर्न चाहेको कुनै प्रसिद्ध ठाउँ वा स्मारक र त्यसको कारण उल्लेख गर्नुहोस्।",
                "english": "What place would you most like to visit? Include a famous landmark or destination you would like to see and why."
            },
            {
                "num": 9,
                "nepali": "तपाईंले गरेको सबैभन्दा अविस्मरणीय वा उत्कृष्ट भ्रमणको वर्णन गर्नुहोस्। तपाईं कहाँ जानुभएको थियो र के कुरा बढी सम्झना छ?",
                "english": "Describe the most memorable or best vacation you have taken. Where did you go, and what do you remember most?"
            },
            {
                "num": 10,
                "nepali": "आफ्नो सपनाको भ्रमण (भ्याकेसन) को वर्णन गर्नुहोस्। तपाईं कहाँ जानुहुन्थ्यो, कोसँग जानुहुन्थ्यो, र के-के गर्नुहुन्थ्यो?",
                "english": "Describe your dream vacation. Where would you go, who would you go with, and what would you do?"
            },
            {
                "num": 11,
                "nepali": "कुनै नयाँ संस्कृतिसँग पहिलोपटक परिचित हुँदाको अनुभव लेख्नुहोस्। के कुरा नौलो लाग्यो र तपाईंले के सिक्नुभयो?",
                "english": "Write about your first experience with a new culture. What was unfamiliar, and what did you learn?"
            },
            {
                "num": 12,
                "nepali": "प्रकृतिको बारेमा तपाईंलाई के मन पर्छ? तपाईंलाई मन पर्ने कुनै प्राकृतिक ठाउँ, मौसम वा अनुभवको वर्णन गर्नुहोस्।",
                "english": "What is something you love about nature? Describe a natural place, season, or experience that matters to you."
            },
            {
                "num": 13,
                "nepali": "झ्यालबाहिरको संसारलाई अवलोकन गर्नुहोस्। आफ्ना पाँचै इन्द्रियहरू प्रयोग गरेर तपाईं के देख्नुहुन्छ, सुन्नुहुन्छ, छुनुहुन्छ र सुँघ्नुहुन्छ वर्णन गर्नुहोस्।",
                "english": "Observe the world outside. Use all five senses to describe what you see, hear, touch, smell, and, if appropriate, taste."
            }
        ]
    },
    {
        "id": 6,
        "titleNep": "खाना र पेय पदार्थ",
        "titleEng": "Food and drink",
        "icon": "utensils",
        "prompts": [
            {
                "num": 1,
                "nepali": "आफ्नो मन पर्ने खाना, पेय, रेस्टुरेन्ट वा सडकको खाजा (स्ट्रीट फूड) को बारेमा लेख्नुहोस्। तपाईंलाई त्यो किन मन पर्छ?",
                "english": "Write about a favorite food, drink, restaurant, or street-food place. Describe what you like about it and why you return to it."
            },
            {
                "num": 2,
                "nepali": "तपाईंलाई आउने कुनै सजिलो परिकार बनाउने विधिको वर्णन गर्नुहोस्। त्यसमा के-के सामग्री चाहिन्छ, पकाउने तरिका के हो, र तपाईंलाई कसले सिकायो?",
                "english": "Describe a simple recipe you know. What ingredients and steps does it take, and who taught you or where did you learn it?"
            },
            {
                "num": 3,
                "nepali": "आफ्नो देश वा संस्कृतिको कुन परम्परागत परिकार तपाईं अरूलाई सिफारिस गर्नुहुन्छ? त्यो कहिले खाइन्छ र यसको महत्त्व के छ?",
                "english": "What traditional dish or cuisine from your country or culture do you recommend? Describe when people eat it and what it means to you."
            },
            {
                "num": 4,
                "nepali": "तपाईंको विचारमा सबैभन्दा उत्कृष्ट बिहानीको खाजा (ब्रेकफास्ट) कस्तो हुन्थ्यो?",
                "english": "What would your ideal breakfast be?"
            },
            {
                "num": 5,
                "nepali": "कुनै साधारण स्वस्थकर खाना वा आफ्नो मन पर्ने स्वस्थ खाजाको वर्णन गर्नुहोस्।",
                "english": "Describe a simple healthy meal or your favorite healthy snack."
            },
            {
                "num": 6,
                "nepali": "तपाईंलाई कुन खाना मन पर्दैन वा एलर्जी छ? के तपाईंलाई पकाउन नआउने कुनै खाना छ? वर्णन गर्नुहोस्।",
                "english": "What food do you dislike, avoid, or have an allergy to? Is there a food you are not good at cooking? Explain whichever part you choose."
            },
            {
                "num": 7,
                "nepali": "तपाईं कुन नौलो खाना चाख्न उत्सुक हुनुहुन्छ, वा तपाईंले खाएको सबैभन्दा अनौठो खाना के हो? यदि सुनसान टापुमा फस्नुभयो भने कुन खाना लैजानुहुन्थ्यो?",
                "english": "What food are you curious to try, or what is the most unusual food you have tried? If you were stranded on a desert island, what food would you bring?"
            },
            {
                "num": 8,
                "nepali": "सडकको खाना (स्ट्रीट फूड) र पिरो खानाबारे तपाईंको के विचार छ? त्यसमा तपाईंलाई के मन पर्छ वा मन पर्दैन?",
                "english": "What do you think about street food and spicy food? Describe what you enjoy or dislike about them."
            },
            {
                "num": 9,
                "nepali": "कुनै विशेष व्यक्तिका लागि तपाईं के परिकार पकाउन चाहनुहुन्छ र किन?",
                "english": "What would you like to cook for someone special? What would you make, and why did you choose it?"
            }
        ]
    },
    {
        "id": 7,
        "titleNep": "भावनाहरू, स्वास्थ्य र कल्याण",
        "titleEng": "Emotions, health, and well-being",
        "icon": "smile",
        "prompts": [
            {
                "num": 1,
                "nepali": "खुसी हुनु भनेको तपाईंको लागि कस्तो अनुभव हो? तपाईंलाई केले मुस्कुराउन बाध्य बनाउँछ र जीवनमा खुसीको अर्थ के हो?",
                "english": "Describe how happiness feels to you. What makes you smile, and what does happiness mean in your life?"
            },
            {
                "num": 2,
                "nepali": "तपाईं निकै उत्साहित भएको कुनै क्षणको वर्णन गर्नुहोस्। त्यो कस्तो अनुभव थियो र त्यसको कारण के थियो?",
                "english": "Describe a time you felt excited. How did it feel, and what caused it?"
            },
            {
                "num": 3,
                "nepali": "निराशा कस्तो हुन्छ र त्यसले कस्तो महसुस गराउँछ? कुनै घटना सम्झनुहुन्छ भने वर्णन गर्नुहोस्।",
                "english": "What does disappointment look or feel like to you? Describe a specific example if you wish."
            },
            {
                "num": 4,
                "nepali": "तपाईं स्वस्थ वा तन्दुरुस्त रहन के गर्नुहुन्छ? आफ्नो स्वास्थ्य र व्यायाम दिनचर्याको वर्णन गर्नुहोस्।",
                "english": "How do you stay healthy or fit? Describe your usual health and exercise routine."
            },
            {
                "num": 5,
                "nepali": "तपाईं कुन स्वस्थ बानी विकास गर्न चाहनुहुन्छ?",
                "english": "What healthy habit would you like to develop?"
            },
            {
                "num": 6,
                "nepali": "तपाईंको सुत्ने दिनचर्याको वर्णन गर्नुहोस्। तपाईंलाई मीठो निद्रा पर्न केले मद्दत गर्छ र केले निद्रा बिगार्छ?",
                "english": "Describe your sleep routine. What helps you sleep well, and what tends to disrupt it?"
            },
            {
                "num": 7,
                "nepali": "आफ्नो मानसिक स्वास्थ्यको हेरचाह तपाईं कसरी गर्नुहुन्छ? अप्ठ्यारो समयमा तपाईंलाई केले मद्दत पुर्‍याउँछ?",
                "english": "How do you take care of your mental health? What helps you during a difficult period?"
            },
            {
                "num": 8,
                "nepali": "बिरामी पर्दा तपाईं कस्तो महसुस गर्नुहुन्छ र के गर्नुहुन्छ?",
                "english": "How do you feel and what do you do when you are sick?"
            },
            {
                "num": 9,
                "nepali": "चिन्ता वा अनिश्चितताको सामना तपाईं कसरी गर्नुहुन्छ? मनलाई स्थिर र शान्त राख्न केले मद्दत गर्छ?",
                "english": "How do you deal with anxiety or uncertainty? Describe what helps you feel steadier."
            },
            {
                "num": 10,
                "nepali": "थकाइपूर्ण दिन वा तनावपूर्ण समयपछि तनाव कम गर्न तपाईंलाई केले मद्दत गर्छ?",
                "english": "What helps you manage stress after a demanding day or during a difficult time?"
            },
            {
                "num": 11,
                "nepali": "कुन दृश्य, आवाज, परिस्थिति वा सम्झनाले तपाईंको मनमा तीव्र भावनात्मक प्रतिक्रिया पैदा गर्छ? त्यसको पछाडि के कारण हुन सक्छ?",
                "english": "What sights, sounds, situations, or memories trigger a strong emotional reaction in you? Write about the reaction and what may be behind it."
            },
            {
                "num": 12,
                "nepali": "एकछिन आँखा चिम्लनुहोस् र अहिले यो क्षणमा तपाईं कस्तो महसुस गरिरहनुभएको छ लेख्नुहोस्।",
                "english": "Close your eyes for a moment and write about what you are feeling right now."
            },
            {
                "num": 13,
                "nepali": "कुनै प्रश्न वा विचारमा आफ्नो आवाज रेकर्ड गरेर बोल्नुहोस्, अनि सुनेर आफूले के नयाँ कुरा याद गर्नुभयो लेख्नुहोस्।",
                "english": "Record yourself speaking freely: answer a question or comment on something, then listen back and write down what you notice."
            }
        ]
    },
    {
        "id": 8,
        "titleNep": "काम, सिकाइ, पैसा र भविष्य",
        "titleEng": "Work, learning, money, and the future",
        "icon": "briefcase",
        "prompts": [
            {
                "num": 1,
                "nepali": "आफ्नो हालको काम वा जागिरको वर्णन गर्नुहोस्। तपाईं के गर्नुहुन्छ र त्यसका कुन पक्ष रमाइला वा चुनौतीपूर्ण लाग्छन्?",
                "english": "Describe your current job or work. What do you do, and what parts of it do you enjoy or find challenging?"
            },
            {
                "num": 2,
                "nepali": "तपाईंको सपनाको जागिर (dream job) के हुन्थ्यो? त्यस कामले तपाईंलाई किन आकर्षित गर्छ?",
                "english": "What would your dream job be? What attracts you to it?"
            },
            {
                "num": 3,
                "nepali": "तपाईंलाई कस्तो काम गर्न मन पर्छ वा भविष्यमा अझ बढी गर्न चाहनुहुन्छ?",
                "english": "What kind of work do you love or hope to do more of?"
            },
            {
                "num": 4,
                "nepali": "तपाईंले सिकिरहनुभएको भाषा (नेपाली) को बारेमा लेख्नुहोस्। तपाईंले किन सुरु गर्नुभयो, के कुरा गाह्रो छ, र कति प्रगति गर्नुभयो?",
                "english": "Write about the language you are learning. Why did you start, what is challenging, and what progress have you made?"
            },
            {
                "num": 5,
                "nepali": "तपाईं पैसा कसरी कमाउनुहुन्छ, खर्च गर्नुहुन्छ र बचत गर्नुहुन्छ? आफ्नो आर्थिक बानीको वर्णन गर्नुहोस्।",
                "english": "How do you earn, spend, and save money? Describe the choices you make most often."
            },
            {
                "num": 6,
                "nepali": "तपाईं बस्ने सहरमा जीवनयापन खर्च कस्तो छ? कुन-कुन खर्च सबैभन्दा बढी लाग्छन्?",
                "english": "What is the cost of living like in your city? Which expenses feel most significant?"
            },
            {
                "num": 7,
                "nepali": "भविष्यका लागि तपाईंका आर्थिक लक्ष्यहरू के-के हुन्? ती पूरा गर्न तपाईं कसरी अघि बढ्ने योजनामा हुनुहुन्छ?",
                "english": "What are your financial goals for the future? How do you plan to work toward them?"
            },
            {
                "num": 8,
                "nepali": "तपाईंको परिवार वा समाजमा पैसालाई कसरी हेरिन्छ? तपाईंले कस्ता दृष्टिकोण वा बानीहरू सिक्नुभयो?",
                "english": "How is money viewed in your culture or family? What attitudes or habits have you learned?"
            },
            {
                "num": 9,
                "nepali": "यदि तपाईंले चिठ्ठा (लट्री) जित्नुभयो भने त्यो पैसा के गर्नुहुन्थ्यो? के किन्नुहुन्थ्यो, के बचत गर्नुहुन्थ्यो वा के बाँड्नुहुन्थ्यो?",
                "english": "If you won the lottery, what would you do with the money? What would spend, save, share, or change?"
            },
            {
                "num": 10,
                "nepali": "कार्यालयमा गएर काम गर्ने र घरबाटै काम गर्ने (रिमोट वर्क) बारे तपाईंको धारणा के छ? कुन व्यक्ति वा कामका लागि कुन शैली उपयुक्त हुन्छ?",
                "english": "What is your view of remote work compared with working in an office? What works best for different people or jobs?"
            }
        ]
    },
    {
        "id": 9,
        "titleNep": "पुस्तक, चलचित्र, सङ्गीत, मनोरञ्जन र प्रविधि",
        "titleEng": "Books, film, music, entertainment, and technology",
        "icon": "film",
        "prompts": [
            {
                "num": 1,
                "nepali": "आफ्नो मन पर्ने कुनै किताब, चलचित्र, गीत वा वृत्तचित्र छान्नुहोस्। तपाईंलाई त्यो किन मन पर्छ र अरूलाई किन सिफारिस गर्नुहुन्छ?",
                "english": "Choose a favorite book, movie, TV show, song, or documentary. What do you like about it, and why would you recommend it?"
            },
            {
                "num": 2,
                "nepali": "हालसालै तपाईंले कुन चलचित्र हेर्नुभयो? त्यो चलचित्र तपाईंलाई कस्तो लाग्यो?",
                "english": "What movie did you watch most recently? What did you think of it?"
            },
            {
                "num": 3,
                "nepali": "तपाईंलाई सबैभन्दा मन पर्ने टेलिभिजन शृङ्खला वा सिरियल कुन हो, वा लगातार हेरेको कुनै शो के थियो?",
                "english": "What TV show or sitcom do you enjoy most, or what show have you binge-watched? What kept you watching?"
            },
            {
                "num": 4,
                "nepali": "कुन गीत वा सङ्गीत तपाईं बारम्बार सुनिरहन सक्नुहुन्छ? तपाईंको दैनिक जीवनमा सङ्गीतको भूमिका कस्तो छ?",
                "english": "What song or kind of music can you listen to again and again? What role does music play in your daily life?"
            },
            {
                "num": 5,
                "nepali": "कुन पुस्तक वा चलचित्रले तपाईंको सोच्ने तरिका बदल्यो वा हेरिसकेपछि पनि लामो समयसम्म मनमा गहिरो छाप छोड्यो?",
                "english": "What book or movie made you think differently or stayed with you after you finished it?"
            },
            {
                "num": 6,
                "nepali": "तपाईंको विचारमा अति चर्चा पाएको तर सोचेजस्तो नभएको (overrated) पुस्तक वा चलचित्र कुन हो? आफ्नो धारणा स्पष्ट गर्नुहोस्।",
                "english": "What is the most overrated book or movie you have experienced? Explain your view."
            },
            {
                "num": 7,
                "nepali": "किताबमा आधारित बनेको कुन चलचित्र तपाईंलाई सबैभन्दा राम्रो लाग्यो? त्यसमा के कुरा राम्रो वा कमजोर थियो?",
                "english": "What is the best book-to-movie adaptation you have seen? What worked well or poorly?"
            },
            {
                "num": 8,
                "nepali": "तपाईं कुन सङ्गीत कन्सर्ट वा कार्यक्रममा सहभागी हुन सबैभन्दा बढी चाहनुहुन्छ?",
                "english": "What concert or other event would you most like to attend?"
            },
            {
                "num": 9,
                "nepali": "यदि तपाईंको जीवनको साउन्डट्र्याक बनाउने हो भने कुन-कुन गीतहरू समावेश गर्नुहुन्थ्यो? महत्त्वपूर्ण समय र व्यक्तिसँग ती गीत जोडेर व्याख्या गर्नुहोस्।",
                "english": "What would the soundtrack of your life include? Choose songs for important periods, people, or moods and explain your choices."
            },
            {
                "num": 10,
                "nepali": "अनलाइन स्ट्रिमिङ सेवाहरूले मानिसहरूले टिभी हेर्ने तरिकालाई कसरी बदलेका छन्?",
                "english": "How have streaming services changed the way people watch television?"
            },
            {
                "num": 11,
                "nepali": "चलचित्रहरूले समाजमा कस्तो प्रभाव पार्छन्?",
                "english": "What effect do movies have on society?"
            },
            {
                "num": 12,
                "nepali": "संस्कृति निर्माण गर्न पुस्तकहरूको भूमिका कति महत्त्वपूर्ण छ?",
                "english": "How important are books in shaping culture?"
            },
            {
                "num": 13,
                "nepali": "चलचित्र र टिभी कार्यक्रमहरूमा विविधता (diversity) हुनु किन महत्त्वपूर्ण छ? यसले कस्तो फरक पार्छ?",
                "english": "How important is diversity in movies and TV shows? What difference does representation make?"
            },
            {
                "num": 14,
                "nepali": "सुपरहिरो चलचित्रहरूको बढ्दो लोकप्रियता बारे तपाईं के सोच्नुहुन्छ?",
                "english": "What do you think about the rise of superhero movies?"
            },
            {
                "num": 15,
                "nepali": "सेलेब्रिटी संस्कृतिले युवा पुस्तामा कस्तो प्रभाव पार्छ?",
                "english": "How does celebrity culture influence young people?"
            },
            {
                "num": 16,
                "nepali": "विद्यालयमा तपाईंको मन पर्ने विषय कुन थियो र त्यसले तपाईंलाई किन आकर्षित गर्‍यो?",
                "english": "What is your favorite school subject, and what made it interesting to you?"
            },
            {
                "num": 17,
                "nepali": "हालसालै पढ्नुभएको कुनै कथा वा लेखको आफ्नै शब्दमा सारांश लेख्नुहोस् र त्यसबारे आफ्नो धारणा व्यक्त गर्नुहोस्।",
                "english": "What did you read recently—a short story or an article? Summarize it in your own words and say what you thought of it."
            }
        ]
    },
    {
        "id": 10,
        "titleNep": "विचार र सामाजिक सवालहरू",
        "titleEng": "Opinions and social questions",
        "icon": "message-square",
        "prompts": [
            {
                "num": 1,
                "nepali": "जलवायु परिवर्तन (Climate change) विरुद्ध के कदम चालिनुपर्छ? आफ्नो धारणा र उपयोगी उपायहरू प्रस्तुत गर्नुहोस्।",
                "english": "What do you think should be done about climate change? Explain your view and what actions you consider useful."
            },
            {
                "num": 2,
                "nepali": "सामाजिक सञ्जालले समाजमा कस्तो प्रभाव पार्छ र यसले जनमतलाई कसरी प्रभावित गर्छ?",
                "english": "What impact does social media have on society, and how does it influence public opinion?"
            },
            {
                "num": 3,
                "nepali": "चुनावमा मतदान गर्नु किन महत्त्वपूर्ण छ, वा मानिसहरूले भोट हाल्ने वा नहाल्ने निर्णय केका आधारमा गर्छन्?",
                "english": "Why is voting important, or what makes people decide whether to vote?"
            },
            {
                "num": 4,
                "nepali": "प्रविधिले आधुनिक जीवनलाई कसरी आकार दिएको छ? यसका फाइदा, बेफाइदा वा दुवैको चर्चा गर्नुहोस्।",
                "english": "How does technology shape modern life? Describe benefits, drawbacks, or both."
            },
            {
                "num": 5,
                "nepali": "गाँजाको कानुनीकरण बारे तपाईंको धारणा के छ? आफ्नो अडानका कारणहरू स्पष्ट पार्नुहोस्।",
                "english": "What is your view on legalizing marijuana? Explain the reasons behind your position."
            },
            {
                "num": 6,
                "nepali": "मानसिक स्वास्थ्य सम्बन्धी सचेतना किन आवश्यक छ? समुदायले मानिसहरूलाई मद्दत गर्न के गर्न सक्छ?",
                "english": "Why does mental-health awareness matter? What could communities do to support people?"
            },
            {
                "num": 7,
                "nepali": "लैङ्गिक समानता (Gender equality) बारे तपाईं के सोच्नुहुन्छ? तपाईं कहाँ प्रगति वा चुनौती देख्नुहुन्छ?",
                "english": "What do you think about gender equality? Where do you see progress or challenges?"
            }
        ]
    },
    {
        "id": 11,
        "titleNep": "प्रेम सम्बन्ध र विचारहरू",
        "titleEng": "Dating and relationship opinions",
        "icon": "heart",
        "prompts": [
            {
                "num": 1,
                "nepali": "के तपाईं पहिलो हेराइमै प्रेम (love at first sight) हुन्छ भन्ने कुरामा विश्वास गर्नुहुन्छ? किन वा किन होइन?",
                "english": "Do you believe in love at first sight? Why or why not?"
            },
            {
                "num": 2,
                "nepali": "तपाईंको आदर्श डेट (भेटघाट) कस्तो हुन्थ्यो: सामान्य, भव्य वा केही फरक?",
                "english": "What is your ideal date: casual, fancy, or something else?"
            },
            {
                "num": 3,
                "nepali": "के तपाईं आफ्नो मिल्ने साथीसँग प्रेम सम्बन्धमा गाँसिनुहुन्छ? यसका फाइदा वा अप्ठ्यारा के हुन सक्छन्?",
                "english": "Would you date someone who is already your best friend? What might be good or difficult about it?"
            },
            {
                "num": 4,
                "nepali": "सम्बन्धमा तपाईंको लागि कुन कुरा बढी महत्त्वपूर्ण छ: रूप कि स्वभाव?",
                "english": "Which matters more to you in a relationship: looks or personality?"
            },
            {
                "num": 5,
                "nepali": "प्रेममा तपाईं आफैं अघि सर्न रुचाउनुहुन्छ कि अरूले प्रस्ताव राखून् भन्ने चाहनुहुन्छ र किन?",
                "english": "Do you prefer to pursue someone or be pursued? Why?"
            },
            {
                "num": 6,
                "nepali": "टाढाको सम्बन्ध (Long-distance relationship) बारे तपाईंको धारणा के छ?",
                "english": "What is your opinion of long-distance relationships?"
            },
            {
                "num": 7,
                "nepali": "यदि जीवनसाथीले विवाह गर्न वा सन्तान जन्माउन चाहेन भने के त्यो सम्बन्ध तोड्ने कारण बन्न सक्छ?",
                "english": "Would it be a dealbreaker if a partner did not want to get married or have children?"
            },
            {
                "num": 8,
                "nepali": "नयाँ सम्बन्धमा कति छिटो 'म तिमीलाई माया गर्छु' भन्नु अलि हतार गरेको मानिन्छ?",
                "english": "How soon is too soon to say “I love you” in a relationship?"
            },
            {
                "num": 9,
                "nepali": "तपाईंको विचारमा, कुनै महिलाप्रति रुचि देखाउन वा राम्रो प्रभाव पार्न पुरुषले के गर्नु उपयुक्त हुन्छ?",
                "english": "In your view, what is a good way for a man to show interest in or make a good impression on a woman?"
            },
            {
                "num": 10,
                "nepali": "के महिला र पुरुषले धोका (cheating) लाई फरक तरिकाले परिभाषित गर्छन्? सम्बन्धमा के-कस्ता कुरालाई धोका मान्नुपर्छ?",
                "english": "Do you think men and women tend to define cheating differently? What should count as cheating?"
            },
            {
                "num": 11,
                "nepali": "के पहिलो डेटमा सधैं पुरुषले नै बिल तिर्नुपर्छ? किन वा किन होइन?",
                "english": "Should a man always pay on a first date? Why or why not?"
            },
            {
                "num": 12,
                "nepali": "के तपाईं फरक संस्कृति वा पृष्ठभूमिको व्यक्तिसँग सम्बन्ध गाँस्न तयार हुनुहुन्छ? त्यसमा दुवैले के कुरा बुझ्न जरुरी छ?",
                "english": "Would you date someone from a different culture or background? What might each person need to understand?"
            },
            {
                "num": 13,
                "nepali": "जीवनसाथीसँग समान सोख वा रुचि हुनु कत्तिको महत्त्वपूर्ण छ?",
                "english": "How important is it for partners to share hobbies or interests?"
            },
            {
                "num": 14,
                "nepali": "अनलाइन डेटिङ क्षणिक फेसन मात्र हो कि मानिस भेट्ने दिगो माध्यम? आफ्नो दृष्टिकोण स्पष्ट गर्नुहोस्।",
                "english": "Is online dating a passing trend or a lasting way to meet people? Explain your view."
            },
            {
                "num": 15,
                "nepali": "'साथी पनि फाइदा पनि' (Friends with benefits) सम्बन्ध बारे तपाईंको के विचार छ?",
                "english": "What do you think about friends with benefits?"
            },
            {
                "num": 16,
                "nepali": "भेट्नुअघि बारम्बार सन्देश (texting) आदानप्रदान गर्नु राम्रो संकेत हो, नराम्रो, वा सामान्य?",
                "english": "Is frequent texting before a date a good sign, a bad sign, or neither?"
            },
            {
                "num": 17,
                "nepali": "सजिलै नपग्ली भाउ खोज्नु (playing hard to get) साँच्चै आकर्षण हो कि केवल खेल मात्र?",
                "english": "Is “playing hard to get” genuine flirtation or just a game?"
            },
            {
                "num": 18,
                "nepali": "यदि जीवनसाथी आफ्नो पूर्वप्रेमी/प्रेमिका (Ex) सँग सम्पर्कमा रहन्छ भने के तपाईंलाई स्वीकार्य हुन्छ? त्यसमा कुन कुरा महत्त्वपूर्ण हुन्छ?",
                "english": "Would you be comfortable with a partner staying in touch with an ex? What would matter to you?"
            },
            {
                "num": 19,
                "nepali": "कसैसँग प्रेम सम्बन्ध सोच्दा उसको सामाजिक सञ्जालको उपस्थिति कत्तिको महत्त्वपूर्ण हुन्छ?",
                "english": "How important is a person’s social-media presence when you are considering dating them?"
            }
        ]
    },
    {
        "id": 12,
        "titleNep": "पत्रहरू: व्यक्तिगत र औपचारिक",
        "titleEng": "Letters: Personal and formal",
        "icon": "mail",
        "prompts": [
            {
                "num": 1,
                "nepali": "आफ्नो साथीलाई आफ्नो दिनचर्याको वर्णन गर्दै एउटा चिठी लेख्नुहोस्।",
                "english": "Write a letter to a friend describing your day."
            },
            {
                "num": 2,
                "nepali": "आफ्नो भविष्यको रूपलाई एउटा चिठी लेख्नुहोस्।",
                "english": "Write a letter to your future self."
            },
            {
                "num": 3,
                "nepali": "बाल्यकालको कुनै साथीलाई सम्झेर चिठी लेख्नुहोस्।",
                "english": "Write a letter to a childhood friend."
            },
            {
                "num": 4,
                "nepali": "आफ्ना आमाबुवा वा दाजुभाइ-दिदीबहिनी जस्ता परिवारका सदस्यलाई चिठी लेख्नुहोस्।",
                "english": "Write a letter to a family member, such as a parent or sibling."
            },
            {
                "num": 5,
                "nepali": "आफ्नो शिक्षक वा मार्गदर्शकलाई एउटा चिठी लेख्नुहोस्।",
                "english": "Write a letter to a mentor or teacher."
            },
            {
                "num": 6,
                "nepali": "वर्षौंदेखि नभेटेको मिल्ने साथीलाई आफ्नो हालखबर बताउँदै चिठी लेख्नुहोस्।",
                "english": "Write a letter to a best friend you have not seen in years, catching them up on your life."
            },
            {
                "num": 7,
                "nepali": "आफूले माया गर्ने व्यक्तिलाई कृतज्ञता व्यक्त गर्दै चिठी लेख्नुहोस्।",
                "english": "Write a letter to a loved one expressing gratitude."
            },
            {
                "num": 8,
                "nepali": "आफ्नो बाल्यकालको रूपलाई सम्झाउँदै एउटा चिठी लेख्नुहोस्।",
                "english": "Write a letter to your younger self."
            },
            {
                "num": 9,
                "nepali": "आफूले सम्मान गर्ने कुनै व्यक्तिलाई आदरभावसहित चिठी लेख्नुहोस्।",
                "english": "Write a letter to someone you admire."
            },
            {
                "num": 10,
                "nepali": "कुनै गलत बुझाइका लागि साथीसँग माफी माग्दै चिठी लेख्नुहोस्।",
                "english": "Write a letter to a friend apologizing for a misunderstanding."
            },
            {
                "num": 11,
                "nepali": "आफ्नो दाजुभाइ वा दिदीबहिनीलाई आफ्नो जीवनको हालखबर बाँड्दै चिठी लेख्नुहोस्।",
                "english": "Write a letter to a sibling to catch up on your life."
            },
            {
                "num": 12,
                "nepali": "कुनै ऐतिहासिक व्यक्तित्वलाई चिठी लेख्नुहोस्। तपाईं उहाँलाई के सोध्नु वा सुनाउनुहुन्थ्यो?",
                "english": "Write a letter to a historical figure. What would you ask or tell them?"
            },
            {
                "num": 13,
                "nepali": "आफूले चाहेको कुनै पद वा जागिरका लागि निवेदन पत्र (Job application letter) लेख्नुहोस्।",
                "english": "Write a job-application letter for a position you would like."
            },
            {
                "num": 14,
                "nepali": "कुनै सामान वा सेवामा देखिएको खराबीबारे सम्बन्धित कम्पनीलाई उजुरी पत्र (Complaint letter) लेख्नुहोस्।",
                "english": "Write a complaint letter to a company about a problem with a product or service."
            },
            {
                "num": 15,
                "nepali": "आफ्ना प्राध्यापक वा शिक्षकलाई धन्यवाद ज्ञापन गर्दै औपचारिक पत्र लेख्नुहोस्।",
                "english": "Write a thank-you letter to a professor or teacher."
            },
            {
                "num": 16,
                "nepali": "तपाईंले चिनेको कसैको लागि सिफारिस पत्र (Letter of recommendation) लेख्नुहोस्।",
                "english": "Write a letter of recommendation for someone you know."
            },
            {
                "num": 17,
                "nepali": "घरबेटी (Landlord) लाई कुनै समस्या वा मर्मत सम्भारको अनुरोध गर्दै पत्र लेख्नुहोस्।",
                "english": "Write to your landlord about a problem or repair request."
            },
            {
                "num": 18,
                "nepali": "कुनै व्यवसायलाई सामान वा सेवाको उपलब्धता र मूल्यबारे सोधपुछ गर्दै पत्र लेख्नुहोस्।",
                "english": "Write to a business to ask about a product or service, including whether it is available."
            },
            {
                "num": 19,
                "nepali": "आफ्नो समुदायको कुनै समस्याबारे सरकारी अधिकारी वा वडा कार्यालयलाई पत्र लेख्नुहोस्।",
                "english": "Write to a government official about an issue in your community."
            },
            {
                "num": 20,
                "nepali": "कुनै भेटघाट वा बैठकको समय मिलाउन अनुरोध गर्दै औपचारिक पत्र वा इमेल लेख्नुहोस्।",
                "english": "Write a letter or email requesting a meeting or appointment."
            },
            {
                "num": 21,
                "nepali": "कुनै सदस्यता वा सेवा रद्द गर्नका लागि सम्बन्धित संस्थालाई पत्र लेख्नुहोस्।",
                "english": "Write to a company to cancel a subscription."
            }
        ]
    },
    {
        "id": 13,
        "titleNep": "सिर्जनात्मक लेखन विषयहरू",
        "titleEng": "Creative writing prompts",
        "icon": "feather",
        "prompts": [
            {
                "num": 1,
                "nepali": "भूतको दृष्टिकोणबाट एउटा भूतको कथा लेख्नुहोस्।",
                "english": "Tell a ghost story from the ghost’s point of view."
            },
            {
                "num": 2,
                "nepali": "एक दिन तपाईंले अकस्मात् आफू उड्न सक्ने क्षमता भएको थाहा पाउनुभयो। त्यसपछि के हुन्छ लेख्नुहोस्।",
                "english": "One day, you discover by accident that you can fly. Write what happens next."
            },
            {
                "num": 3,
                "nepali": "तपाईं आफ्नो मन पर्ने भिडियो गेम वा धेरै चलाउने मोबाइल एपभित्र अड्किनुभयो। बाहिर निस्कन तपाईं के गर्नुहुन्छ वर्णन गर्नुहोस्।",
                "english": "You are trapped inside your favorite video game or a smartphone app you use often. Describe how you try to get out."
            },
            {
                "num": 4,
                "nepali": "विद्यालयको पुरानो साथीबाट विवाहको निम्तो आयो, तर उसको हुनेवाला जीवनसाथीको नाम तपाईंलाई कुनै गम्भीर कारणले पहिले नै थाहा छ। तपाईं के गर्नुहुन्छ?",
                "english": "You receive a wedding invitation from a former best friend from school. Their future spouse’s name is familiar to you for a troubling reason. What do you do?"
            },
            {
                "num": 5,
                "nepali": "तपाईं एक शिक्षक वा प्रशिक्षक हुनुहुन्छ र तपाईंको सबैभन्दा जेहेन्दार विद्यार्थीले परीक्षामा चिट चोरेको देख्नुभयो। अरू कसैलाई थाहा छैन। तपाईं के गर्नुहुन्छ?",
                "english": "You are a teacher or coach who discovers that your star student has been cheating. No one else knows. What do you do?"
            },
            {
                "num": 6,
                "nepali": "तपाईंलाई आफूले संसारमा सबैभन्दा चाहेको कुरा (जागिर, मान्छे वा शक्ति) प्राप्त हुने अवसर आयो, तर त्यो स्वीकार गर्दा भयानक दुर्घटना हुनेछ। तपाईं के रोज्नुहुन्छ?",
                "english": "You are offered the one thing you want most—a job, a person, or an ability—but accepting it will cause something terrible to happen. What is the consequence, and what do you choose?"
            },
            {
                "num": 7,
                "nepali": "आफूले नगरेको कामको लागि तपाईंलाई ठूलो पुरस्कार दिइयो, तर त्यसको वास्तविक हकदार को हो तपाईंलाई थाहा छ। तपाईं के गर्नुहुन्छ?",
                "english": "You receive an award for something you did not do, and you know who really deserves it. What do you do?"
            },
            {
                "num": 8,
                "nepali": "आज तपाईंको जन्मदिन हो, तर तपाईंको लागि महत्त्वपूर्ण व्यक्तिले बिर्सियो। के भयो र तपाईंले कस्तो प्रतिक्रिया जनाउनुभयो लेख्नुहोस्।",
                "english": "It is your birthday, and someone important to you forgets. Write what happens and how you respond."
            },
            {
                "num": 9,
                "nepali": "टाउको दुखाइ वा चोट बिस्तारै बढ्दै गयो। डाक्टरकहाँ पुग्दा उनले भने, 'तपाईं अलि अगाडि नै आउनुपर्थ्यो।' यो अवस्थासम्म के-कस्ता घटना घटे?",
                "english": "You have a headache, toothache, bruise, or other problem that keeps getting worse. When you finally see a doctor, they say they wish you had come sooner. What led up to this moment?"
            },
            {
                "num": 10,
                "nepali": "तपाईंसँग एउटा अनौठो वा अप्ठ्यारो पार्ने अलौकिक शक्ति (superpower) छ। त्यो के हो र त्यसले तपाईंको सामान्य दिनलाई कसरी उथलपुथल बनाउँछ?",
                "english": "You have an inconvenient or embarrassing superpower. What is it, and how does it disrupt an ordinary day?"
            },
            {
                "num": 11,
                "nepali": "आफ्नो लेटरबक्समा तपाईंले अरू कसैका लागि लेखिएको फिरौती पत्र (ransom note) फेला पार्नुभयो। तपाईं के गर्नुहुन्छ?",
                "english": "You find a ransom note in your mailbox that was meant for someone else. What do you do?"
            },
            {
                "num": 12,
                "nepali": "ब्युँझँदा थाहा पाउनुभयो कि संसारका सबै मानिसहरू गायब भइसकेका छन् र सायद तपाईं एक्लो हुनुहुन्छ। आफ्नो पहिलो दिनको वर्णन गर्नुहोस्।",
                "english": "You wake up to discover that everyone else has disappeared and you may be the only person left in the world. Describe your first day."
            },
            {
                "num": 13,
                "nepali": "पहिलोपटक मृत्युको सामना गरेको कसैको कथा लेख्नुहोस्। उसले के महसुस गर्‍यो र त्यसले उसलाई कसरी बदल्यो?",
                "english": "Write about someone's first experience with death. Focus on what they notice and how it changes them."
            },
            {
                "num": 14,
                "nepali": "तपाईंलाई गर्न मन नभएको काम अह्राइयो र तपाईंले अरू कसैलाई झुक्याएर त्यो काम लगाउन खोज्नुभयो। के भयो?",
                "english": "You are asked to do something you do not want to do, so you try to trick someone else into doing it for you. What happens?"
            },
            {
                "num": 15,
                "nepali": "प्रणय दिवस (Valentine's Day) मा कार्यालयमा एउटा सुन्दर फूलको गुच्छा आयो, जसमा रहस्यमय पत्र थियो। त्यो कसले पठायो र पत्रमा के लेखिएको थियो?",
                "english": "On Valentine's Day, a beautiful bouquet arrives at your office even though you were not expecting anything. It includes a mysterious note. Who sent it, and what does the note say?"
            },
            {
                "num": 16,
                "nepali": "ट्राफिक लाइटमा एउटा स्पोर्ट्स कारले भ्यानलाई ठक्कर दियो। यो दृश्य पहिले स्पोर्ट्स कारको चालकको नजरबाट, त्यसपछि भ्यानभित्रको यात्रुको नजरबाट लेख्नुहोस्।",
                "english": "A sports car hits a minivan at a stoplight. Write the scene first from the sports-car driver's point of view, then from the point of view of someone inside the minivan."
            },
            {
                "num": 17,
                "nepali": "बिहान ब्युँझँदा तपाईंले हातमा लिने पहिलो वस्तु के हो? त्यही सामान्य वस्तुबाट एउटा कथाको सुरुवात गर्नुहोस्।",
                "english": "What is the first thing you pick up in the morning? Turn that ordinary object into the beginning of a story."
            }
        ]
    },
    {
        "id": 14,
        "titleNep": "वर्णनात्मक लेखन अभ्यासहरू",
        "titleEng": "Descriptive writing exercises",
        "icon": "eye",
        "prompts": [
            {
                "num": 1,
                "nepali": "कुनै दैनिक प्रयोगको साधारण वस्तु छान्नुहोस् र त्यसको विस्तृत वर्णन गर्नुहोस्। यसको रङ र आकार कस्तो छ? यसको बनोट (texture) कस्तो छ, के काममा प्रयोग हुन्छ, र तपाईंका इन्द्रियहरूले के अनुभव गर्छन्? (उदाहरणका लागि: स्याउ, कफीको कप, सुन्तला, स्यान्डविच, चकलेट; मैनबत्ती, तौलिया, साबुन, टिभी रिमोट, सिरानी; पानी, फूल, घाँस, हिउँ, बालुवा; वालेट, साँचो, घडी, टोपी; स्मार्टफोन, हेडफोन; वा कुर्सी, टेबल, सोफा)।",
                "english": "Choose an everyday object and describe it in detail. What color and shape is it? What is its texture, what is it used for, and what can you notice through your senses? You could choose an apple, a cup of coffee, an orange, a sandwich, or a chocolate bar; a candle, towel, soap, TV remote, or pillow; rain, flowers, grass, snow, or sand; a wallet, keys, watch, hat, or cap; a smartphone or headphones; or a chair, table, or sofa."
            }
        ]
    }
]

# Assign global unique IDs (1..215) and category-specific numbers (1..N)
global_counter = 1
for cat in categories_data:
    for cat_idx, p in enumerate(cat["prompts"], start=1):
        p["id"] = global_counter
        p["num"] = global_counter
        p["categoryNum"] = cat_idx
        global_counter += 1

total_prompts = sum(len(c["prompts"]) for c in categories_data)
print(f"Total categories: {len(categories_data)}")
print(f"Total canonical prompts: {total_prompts}")

output_path = "/Users/kavi/Documents/kyoto/learn-nepalilanguage/js/writing-prompts-data.js"

export_data = {
    "meta": {
        "title": "Canonical Writing Prompts — द्विभाषी लेखन विषयहरू",
        "totalCategories": len(categories_data),
        "totalPrompts": total_prompts,
        "format": "first nepali then english"
    },
    "categories": categories_data
}

with open(output_path, "w", encoding="utf-8") as f:
    f.write("/* Canonical Writing Prompts — Bilingual Data */\n")
    f.write("/* Format: First Nepali (Devanagari), then English */\n")
    f.write("var WRITING_PROMPTS_DATA = ")
    json.dump(export_data, f, ensure_ascii=False, indent=2)
    f.write(";\n\n")
    f.write("if (typeof window !== 'undefined') {\n")
    f.write("    window.WRITING_PROMPTS_DATA = WRITING_PROMPTS_DATA;\n")
    f.write("}\n\n")
    f.write("if (typeof module !== 'undefined' && module.exports) {\n")
    f.write("    module.exports = { WRITING_PROMPTS_DATA };\n")
    f.write("}\n")

print(f"Written to {output_path} ({os.path.getsize(output_path)} bytes).")
