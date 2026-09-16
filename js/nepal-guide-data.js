// Short, source-linked introductions. Keep these separate from the language lessons.
const NepalGuideData = (() => {
    const sources = {
        selRoti: ['SBS Food · Sel roti and festival kitchens', 'https://www.sbs.com.au/food/article/feels-like-home-celebrating-nepali-festivals-with-crispy-rice-doughnuts/2ds7fd9jd'],
        gundruk: ['FAO · Gundruk and fermented vegetables', 'https://www.fao.org/4/x0560e/x0560e11.htm'],
        samayBaji: ['The Kathmandu Post · Samay baji and Indra Jatra', 'https://kathmandupost.com/food/2019/09/13/a-feast-fit-for-the-gods'],
        thukpa: ['The Kathmandu Post · A cook’s guide to thukpas', 'https://kathmandupost.com/food/2019/10/04/an-essential-guide-to-thukpas'],
        jujuDhau: ['Eat Your World · Juju dhau in Bhaktapur', 'https://eatyourworld.com/destinations/asia/nepal/kathmandu/what-to-eat/juju-dhau/'],
        chhurpi: ['Wikipedia · Chhurpi', 'https://en.wikipedia.org/wiki/Chhurpi'],
        alooTama: ['Wikipedia · Aloo tama', 'https://en.wikipedia.org/wiki/Aloo_tama'],
        sinja: ['UNESCO · Sinja Valley and Khas history', 'https://whc.unesco.org/en/tentativelists/5263/'],
        culinary: ['Nepal Tourism Board · Food & culinary', 'https://ntb.gov.np/en/things-to-do/food-%26-culinary'],
        recipes: ['Nepal Tourism Board · Heritage cuisine recipe book (PDF)', 'https://trade.ntb.gov.np/wp-content/uploads/2018/05/Experience_Nepal_Globalizing_Nepalese_Heritage_Cuisine_Recipe_Book.pdf'],
        culture: ['Nepal Tourism Board · Culture', 'https://trade.ntb.gov.np/know-nepal/culture/'],
        yomari: ['Nepal Tourism Board · Yomari Punhi', 'https://ntb.gov.np/yomari-punhi'],
        tharuFood: ['Nepal Tourism Board · Chitwan local cuisine', 'https://ntb.gov.np/local-cuisine'],
        people: ['National Statistics Office · 2021 census', 'https://censusresults.nsonepal.gov.np/'],
        constitution: ['Nepal Law Commission · Constitution of Nepal', 'https://lawcommission.gov.np/content/13437/'],
        history: ['Nepal Tourism Board · History', 'https://trade.ntb.gov.np/know-nepal/nepals-history/'],
        peace: ['UN Peacemaker · Comprehensive Peace Agreement, 2006', 'https://peacemaker.un.org/en/node/9215'],
        inclusion: ['UN human-rights experts · Representation and protests (PDF)', 'https://spcommreports.ohchr.org/TMResultsBase/DownLoadPublicCommunicationFile?gId=23097'],
        litti: ['The Kathmandu Post · Recipes from Maithili kitchens', 'https://kathmandupost.com/art-culture/2024/01/27/recipes-from-maithili-kitchens'],
        chatpate: ['Parbati Sapkota · Homemade chana chatpate', 'https://www.parbatisapkota.com.np/2022/07/homemade-chana-chatpate-recipe.html'],
        election: ['Reuters · 27 March 2026: Shah sworn in after election', 'https://www.gmanetwork.com/news/topstories/world/981681/ex-rapper-shah-sworn-in-as-nepal-prime-minister-after-sweeping-election-win/story/'],
        newa: ['NFDIN · Newar community profile (Nepali)', 'https://nfdin.gov.np/pages/newar/'],
        tharu: ['NFDIN · Tharu community profile (Nepali)', 'https://nfdin.gov.np/pages/tharu/'],
        tamang: ['NFDIN · Tamang community profile (Nepali)', 'https://nfdin.gov.np/pages/tamang/'],
        gurung: ['NFDIN · Gurung community profile (Nepali)', 'https://nfdin.gov.np/pages/gurung/'],
        magar: ['NFDIN · Magar community profile (Nepali)', 'https://nfdin.gov.np/pages/magar/'],
        rai: ['NFDIN · Rai community profile (Nepali)', 'https://nfdin.gov.np/pages/rai/'],
        limbu: ['NFDIN · Limbu community profile (Nepali)', 'https://nfdin.gov.np/pages/limbu/'],
        thakali: ['NFDIN · Thakali community profile (Nepali)', 'https://nfdin.gov.np/pages/thakali/'],
        himalaya: ['Nepal Tourism Board · People of Nepal', 'https://ntb.gov.np/en/plan-your-trip/about-nepal/people'],
        kathmandu: ['UNESCO · Kathmandu Valley', 'https://whc.unesco.org/en/list/121/'],
        pokhara: ['Nepal Tourism Board · Pokhara', 'https://ntb.gov.np/pokhara'],
        janakpur: ['Nepal Tourism Board · Janakpur', 'https://ntb.gov.np/janakpur'],
        chitwan: ['Nepal Tourism Board · Chitwan', 'https://ntb.gov.np/chitwan'],
        lumbini: ['UNESCO · Lumbini', 'https://whc.unesco.org/en/list/666/'],
        ilam: ['Nepal Tourism Board · Ilam', 'https://ntb.gov.np/ilam'],
        geography: ['Nepal Tourism Board · Geography', 'https://ntb.gov.np/en/plan-your-trip/about-nepal/geography'],
        homestays: ['Nepal Tourism Board · Homestays', 'https://ntb.gov.np/homestays'],
    };
    const sourceLinks = (ids) => ids.map(id => `<li><a href="${sources[id][1]}" target="_blank" rel="noopener noreferrer">${sources[id][0]}</a></li>`).join('');
    const reading = (ids) => `<details class="guide-sources"><summary>Sources & further reading</summary><ul>${sourceLinks(ids)}</ul></details>`;
    const arrow = '<svg class="guide-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';

    const lessons = [
        {
            id: 'nepal-at-a-glance', title: 'Nepal at a glance', about: true,
            content: `<div class="guide-overview-hero">
                <p class="guide-lead">A little context for the language. A whole country of people, places, and food to get to know.</p>
                <img src="assets/nepal-guide/landscape.webp" width="1536" height="864" alt="An illustrated Nepali courtyard, terraced hills, river and Himalayan peaks" fetchpriority="high">
            </div>
            <div class="guide-intro-links">
                <section><h2>People & cultures</h2><p>Languages, living traditions, and the communities that make Nepal home.</p><a href="#the-people">Meet the communities ${arrow}</a></section>
                <section><h2>Places to explore</h2><p>Wander through a courtyard, pause by a lake, or walk among the tea gardens.</p><a href="#places">Find a place ${arrow}</a></section>
                <section><h2>Food to try</h2><p>Start with a plate of momo. Stay for the many kitchens, flavours, and stories.</p><a href="#food">Start with a dish ${arrow}</a></section>
            </div>
            <section class="guide-geography"><h2>Where is Nepal?</h2>
                <p>Nepal is in South Asia, between India and China. Kathmandu is its capital. From the southern plains to the high Himalaya, the landscape changes quickly—and so do daily life, languages, and food.</p>
                <div class="guide-three-columns">
                    <section><h3>The Terai</h3><p>The lowland plains in the south: farms, forests, growing towns, and places such as Janakpur, Chitwan, and Lumbini.</p></section>
                    <section><h3>The hills</h3><p>Terraced slopes, river valleys, villages, and cities. Kathmandu Valley and Pokhara sit in this broad middle region.</p></section>
                    <section><h3>The Himalaya</h3><p>High valleys and mountains in the north, with communities connected by trade, family, religion, and travel.</p></section>
                </div>
            </section>${reading(['geography', 'homestays'])}`,
        },
        {
            id: 'history', title: 'A short history', about: true,
            content: `<p class="guide-lead">A few turning points to help make sense of Nepal today.</p>
            <p class="guide-editorial-note">Nepal has many local histories. This timeline focuses on changes to the state; community histories reach much further.</p>
            <div class="guide-timeline">
                <section><p class="guide-date">Before 1768</p><div><h2>Many centres of power</h2><p>The Kathmandu Valley was a centre of trade, art, and religious life under rulers including the Licchavis and Mallas. Kathmandu, Patan, and Bhaktapur became separate Malla kingdoms. Elsewhere, other kingdoms and communities had their own political and cultural histories.</p></div></section>
                <section><p class="guide-date">1768–1816</p><div><h2>The Gorkhali state expands</h2><p>Prithvi Narayan Shah’s forces took Kathmandu in 1768 and Bhaktapur in 1769. Later rulers continued expanding the state. The Anglo-Nepalese War of 1814–1816 ended with the Treaty of Sugauli and major territorial losses. Nepal retained its independence.</p></div></section>
                <section><p class="guide-date">1846–1951</p><div><h2>Rana rule</h2><p>Hereditary Rana prime ministers held power while Shah kings remained on the throne. A movement involving political parties and King Tribhuvan ended Rana rule in 1951, opening a new struggle over democratic government.</p></div></section>
                <section><p class="guide-date">1959–1990</p><div><h2>Democracy, then royal rule</h2><p>Nepal held its first parliamentary general election in 1959. King Mahendra dismissed the elected government in 1960; the partyless Panchayat system followed. The 1990 People’s Movement brought multiparty democracy under a constitutional monarchy.</p></div></section>
                <section><p class="guide-date">1996–2006</p><div><h2>Conflict and a peace agreement</h2><p>The Maoist insurgency and the state’s response led to a decade of armed conflict, with killings, disappearances, displacement, and lasting harm. In 2006, a mass movement ended the king’s direct rule. The government and Maoists signed the Comprehensive Peace Agreement that November.</p></div></section>
                <section><p class="guide-date">2008–2017</p><div><h2>A republic and a new constitution</h2><p>The Constituent Assembly abolished the monarchy on 28 May 2008. The constitution adopted on 20 September 2015 established the current federal framework. Its adoption also drew protests over representation and inclusion. Elections in 2017 put the new federal, provincial, and local system into practice.</p></div></section>
                <section><p class="guide-date">2025–2026</p><div><h2>A new political chapter</h2><p>Youth-led protests in September 2025 brought down K. P. Sharma Oli’s government. Sushila Karki led an interim government. After the 5 March 2026 election, Balendra Shah was sworn in as prime minister on 27 March; the Rastriya Swatantra Party won a large parliamentary majority.</p><p class="guide-inline-source"><a href="${sources.election[1]}" target="_blank" rel="noopener noreferrer">Reuters, 27 March 2026</a></p></div></section>
            </div>
            <p class="guide-editorial-note">Recent-history note checked 15 September 2026. The dated events above are a starting point for understanding the present.</p>
            ${reading(['history', 'peace', 'constitution', 'inclusion', 'election'])}`,
        },
        {
            id: 'government-structure', title: 'Government', about: true,
            content: `<p class="guide-lead">How decisions are shared across the country.</p>
            <p>Under the 2015 constitution, Nepal is a secular federal democratic republic with a parliamentary system. The president is head of state; the prime minister leads the government. Courts exercise judicial power.</p>
            <div class="guide-government guide-three-columns">
                <section><span class="guide-number" aria-hidden="true">01</span><h2>Federal</h2><p>The national level includes the president, prime minister and cabinet, and a parliament with two houses: the House of Representatives and National Assembly.</p><p>Its responsibilities include foreign affairs, defence, and national policy.</p></section>
                <section><span class="guide-number" aria-hidden="true">02</span><h2>Provincial</h2><p>Seven provinces each have an assembly and a government led by a chief minister.</p><p>They make decisions on provincial matters and share some responsibilities with the other levels.</p></section>
                <section><span class="guide-number" aria-hidden="true">03</span><h2>Local</h2><p>Municipalities and rural municipalities have elected representatives, including ward representatives.</p><p>This is the level people often meet through local services, basic education, health, and registration.</p></section>
            </div>
            <h2>Institutions and the people in office</h2><p>Election results and cabinets change. The <a href="#history">short history</a> includes the March 2026 transition. For officeholders, follow the <a href="https://www.opmcm.gov.np/en/" target="_blank" rel="noopener noreferrer">Office of the Prime Minister and Council of Ministers</a>.</p>
            ${reading(['constitution', 'election'])}`,
        },
        { id: 'the-people', title: 'People & cultures', about: true, explorer: 'people' },
        { id: 'places', title: 'Places to explore', about: true, explorer: 'places' },
        { id: 'food', title: 'Food to try', about: true, explorer: 'food' },
    ];

    // Art addresses are [atlas filename, column (0–2), row (0–1)].
    const food = (id, name, nepali, groups, art, description, tryThis, where, sourceIds, related) => ({
        id, name, nepali, groups, art, description,
        sections: [['Start with', tryThis], ['Where to try it', where]], sources: sourceIds, related,
    });
    const foods = [
        food('momo', 'Momo', 'मोमो', ['everyday'], ['food-1', 0, 0], 'Little dumplings, many variations. Steamed, fried, or served in a spiced jhol broth.', 'A steamed plate with achar. Ask what the filling is; recipes vary.', 'Neighbourhood momo shops and cafés across Nepal.', ['culture'], ['places/kathmandu']),
        food('dal-bhat', 'Dal bhat', 'दाल भात', ['everyday'], ['food-1', 1, 0], 'Rice, lentils, vegetables, and achar: an everyday meal that changes with the cook and season.', 'A vegetable set, or a Thakali-style meal with several small accompaniments.', 'Home kitchens and bhojanalaya meal houses across Nepal.', ['culture'], ['the-people/thakali']),
        food('sel-roti', 'Sel roti', 'सेल रोटी', ['sweet', 'everyday'], ['food-1', 2, 0], 'Lightly sweet rice-batter rings, fried until golden.', 'One warm ring with tea.', 'Sweet shops and festival kitchens, especially around Tihar.', ['selRoti'], ['food/chiya']),
        food('yomari', 'Yomari', 'योमरी', ['newa', 'sweet'], ['food-1', 0, 1], 'A steamed rice-flour dumpling with a pointed shape and a sweet centre.', 'Chaku (molasses) and sesame filling; khuwa milk filling is another version.', 'Newa eateries, especially around the harvest festival Yomari Punhi.', ['yomari'], ['the-people/newa']),
        food('dhido', 'Dhido', 'ढिँडो', ['everyday', 'himalayan'], ['food-1', 1, 1], 'A thick, smooth staple made by stirring flour into hot water.', 'Millet or buckwheat dhido with lentils or curry.', 'Traditional meal houses; grains and accompaniments vary.', ['recipes', 'culture'], ['food/gundruk']),
        food('chatamari', 'Chatamari', 'चटामरी', ['newa'], ['food-1', 2, 1], 'A thin rice-flour crepe from Newa kitchens.', 'Plain, egg, or minced-meat toppings.', 'Newa eateries in the Kathmandu Valley.', ['recipes'], ['the-people/newa']),
        food('bara', 'Bara / wo', 'बारा / वः', ['newa'], ['food-2', 0, 0], 'Savoury lentil patties with a soft centre.', 'A plain lentil version, or one with egg.', 'Newa snack shops and feast menus.', ['recipes'], ['places/kathmandu']),
        food('samay-baji', 'Samay baji', 'समयबजी', ['newa'], ['food-2', 1, 0], 'A Newa assortment built around beaten rice and small accompaniments.', 'Ask the host to introduce each element.', 'Newa restaurants and celebratory meals; the selection varies.', ['samayBaji'], ['the-people/newa']),
        food('gundruk', 'Gundruk', 'गुन्द्रुक', ['everyday'], ['food-2', 2, 0], 'Fermented leafy greens with a distinctive tang.', 'Gundruk ko jhol, a warming soup.', 'Traditional kitchens and meal houses.', ['gundruk'], ['food/dhido']),
        food('thukpa', 'Thukpa', 'थुक्पा', ['himalayan'], ['food-2', 0, 1], 'A bowl of noodles, broth, and vegetables, sometimes with meat.', 'A vegetable bowl; ask about the broth.', 'Himalayan and Tibetan-style eateries.', ['thukpa'], ['the-people/sherpa']),
        food('dhikri', 'Dhikri', 'ढिक्री', ['terai'], ['food-2', 1, 1], 'Steamed rice-flour dough, shaped in different ways in Tharu kitchens.', 'A serving with chutney or a local curry.', 'Tharu-run eateries and homestays in the Terai.', ['tharuFood'], ['the-people/tharu', 'places/chitwan']),
        food('litti-chokha', 'Litti chokha', 'लिट्टी चोखा', ['terai'], ['food-2', 2, 1], 'Roasted dough balls with a spiced sattu filling, served with mashed roasted vegetables.', 'Break a litti into the chokha.', 'Look for it in the southern plains; the dish is also shared across the border with India.', ['litti'], ['places/janakpur']),
        food('juju-dhau', 'Juju dhau', 'जुजु धौ', ['newa', 'sweet'], ['food-3', 0, 0], 'Bhaktapur’s rich, set yogurt, often served in a clay pot.', 'A small pot to share after a walk.', 'Yogurt shops in Bhaktapur.', ['jujuDhau'], ['places/kathmandu']),
        food('chiya', 'Chiya', 'चिया', ['everyday', 'sweet'], ['food-3', 1, 0], 'Tea can mean a milky, sweet brew or a simple black tea. Every cup is a chance to pause.', 'Dudh chiya for milk tea; kalo chiya for black tea.', 'Tea stalls everywhere. In Ilam, explore locally grown tea.', ['ilam'], ['places/ilam', 'food/sel-roti']),
        food('chhurpi', 'Chhurpi', 'छुर्पी', ['himalayan'], ['food-3', 2, 0], 'Cheese made in soft and hard, dried forms.', 'Ask which type you are buying: their textures are very different.', 'Hill and mountain markets, including eastern Nepal.', ['chhurpi'], ['places/ilam']),
        food('sekuwa', 'Sekuwa', 'सेकुवा', ['everyday', 'terai'], ['food-3', 0, 1], 'Seasoned meat cooked over a fire.', 'Ask which meat is on the grill.', 'Grill stalls and sekuwa restaurants.', ['recipes'], ['food/chatpate']),
        food('aloo-tama', 'Aloo tama', 'आलु तामा', ['everyday', 'newa'], ['food-3', 1, 1], 'Potato and fermented bamboo shoots in a pleasantly sour curry, often with beans.', 'A bowl alongside rice.', 'Traditional Nepali and Newa kitchens.', ['alooTama'], ['food/dal-bhat']),
        food('chatpate', 'Chatpate', 'चटपटे', ['terai', 'everyday'], ['food-3', 2, 1], 'A crunchy, tangy mix of puffed rice, vegetables, and spices.', 'Ask for less chilli if you like it mild.', 'Street-snack stalls in towns across Nepal.', ['chatpate'], ['places/janakpur']),
    ];

    const community = (id, name, nepali, groups, art, description, language, culture, sourceIds, related) => ({
        id, name, nepali, groups, art, description,
        sections: [['Languages & connections', language], ['A way into the culture', culture]], sources: sourceIds, related,
    });
    const people = [
        community('newa', 'Newa / Newar', 'नेवाः / नेवार', ['valley'], ['people-1', 0, 0], 'Communities with deep roots in the Kathmandu Valley and a rich urban heritage of craft, trade, festivals, and food.', 'Nepal Bhasa is also called Newari. Newa identities include varied religious and family traditions.', 'Explore a courtyard, local craft workshop, or community-run eatery. Jatras and guthi associations connect neighbourhood life.', ['newa'], ['food/yomari', 'places/kathmandu']),
        community('tharu', 'Tharu', 'थारू', ['terai'], ['people-1', 1, 0], 'Indigenous communities of the Terai and inner Terai, with substantial regional diversity.', 'Tharu languages and traditions differ across places such as Dang, Chitwan, and the far west.', 'A community-led visit can introduce local knowledge, crafts, food, and festivals in the host’s own words.', ['tharu'], ['food/dhikri', 'places/chitwan']),
        community('tamang', 'Tamang', 'तामाङ', ['hills'], ['people-1', 2, 0], 'Tamang communities have longstanding connections to the hills around Kathmandu and beyond.', 'Tamang languages and oral traditions sit alongside Nepali and other languages in everyday life.', 'Listen for Tamang Selo music and the damphu drum; Sonam Lhosar is an important new-year celebration for many families.', ['tamang'], ['food/thukpa']),
        community('gurung', 'Gurung / Tamu', 'गुरुङ / तमू', ['hills'], ['people-1', 0, 1], 'Gurung communities have historic roots in the central hills, including the Gandaki region, and connections across Nepal and abroad.', 'Tamu Kyi is a Gurung language name. Religious and cultural practice varies across families.', 'A locally run homestay can offer a conversation about Tamu Lhosar, oral traditions, and life today.', ['gurung', 'homestays'], ['places/pokhara']),
        community('limbu', 'Limbu / Yakthung', 'लिम्बू / याक्थुङ', ['hills'], ['people-1', 1, 1], 'Yakthung communities, also known as Limbu, have deep roots in eastern Nepal.', 'Yakthungpan is the Limbu language. Mundhum traditions preserve oral knowledge, belief, and histories.', 'Explore language, textile traditions, and community celebrations through local artists and hosts.', ['limbu'], ['places/ilam']),
        community('sherpa', 'Sherpa', 'शेर्पा', ['himalaya'], ['people-1', 2, 1], 'An ethnic community with a language and history, including strong connections to Solu-Khumbu.', 'Sherpa communities live in mountain settlements, cities, and abroad. Many have Tibetan Buddhist traditions.', 'Learn about monastery life, festivals, food, and family histories from local hosts.', ['himalaya'], ['food/thukpa']),
        community('magar', 'Magar', 'मगर', ['hills'], ['people-2', 0, 0], 'A large and internally diverse Indigenous community with historic roots across the western and central hills.', 'Magar Dhut, Kham, and Kaike reflect distinct language traditions.', 'Explore local music, oral histories, and traditions such as Bhume through the community in the place you visit.', ['magar'], ['food/dhido']),
        community('rai', 'Rai communities', 'राई', ['hills'], ['people-2', 1, 0], 'Rai is an umbrella identity encompassing several communities with roots in eastern Nepal.', 'There are multiple Rai languages, including Bantawa and Chamling; language names matter to their speakers.', 'Learn about Sakela and other local traditions from hosts, while allowing for differences between communities.', ['rai'], ['places/ilam']),
        community('mithila', 'Mithila & Madhesh', 'मिथिला / मधेश', ['terai'], ['people-2', 2, 0], 'Madhesh includes many communities of the southern plains. Mithila is a cultural region spanning Nepal and India.', 'Maithili is strongly connected to Janakpur and Mithila; Bhojpuri, Awadhi, and other languages are spoken elsewhere in the plains.', 'Explore Mithila art and the ponds and temples of Janakpur. These regional identities overlap with many ethnic and religious identities.', ['janakpur', 'people'], ['places/janakpur', 'food/litti-chokha']),
        community('thakali', 'Thakali', 'थकाली', ['himalaya'], ['people-2', 0, 1], 'Thakali communities have historic connections to the Thak Khola area of the Kali Gandaki valley.', 'Thakali language and community traditions continue alongside lives in Nepal’s towns and beyond.', 'A Thakali meal is a welcoming entry point; trade, family networks, and local histories are part of the wider story.', ['thakali', 'culinary'], ['food/dal-bhat']),
        community('khas', 'Khas & Nepali-speaking life', 'खस', ['hills'], ['people-2', 1, 1], 'Khas histories are closely connected to the western hills and the development of the Nepali language.', 'Today Nepali is spoken by people of many backgrounds, as a first or additional language.', 'Family stories, songs, and everyday conversation offer many ways in. Caste identity, ethnicity, and language do not describe the same thing.', ['people', 'sinja'], ['food/sel-roti']),
        community('muslim', 'Muslim communities', 'मुस्लिम समुदाय', ['terai'], ['people-2', 2, 1], 'Muslim Nepalis belong to varied linguistic, regional, and family backgrounds.', 'Communities live in the Terai, Kathmandu, and elsewhere; religious identity overlaps with language and local culture.', 'Learn through local histories, everyday neighbourhood life, and celebrations such as Eid when you are invited.', ['people'], ['places/janakpur']),
    ];

    const place = (id, name, nepali, groups, col, row, description, notice, foodTip, sourceIds, related) => ({
        id, name, nepali, groups, art: ['places', col, row], description,
        sections: [['Take a little time for', notice], ['A taste of the place', foodTip]], sources: sourceIds, related,
    });
    const places = [
        place('kathmandu', 'Kathmandu Valley', 'काठमाडौं उपत्यका', ['heritage'], 0, 0, 'Kathmandu, Patan, and Bhaktapur: a valley of busy streets, brick courtyards, stupas, and living heritage.', 'The everyday life around a heritage square, as well as its temples. Follow local guidance in worship spaces.', 'Newa snacks such as bara and yomari; juju dhau in Bhaktapur.', ['kathmandu', 'jujuDhau', 'yomari'], ['the-people/newa', 'food/juju-dhau']),
        place('pokhara', 'Pokhara', 'पोखरा', ['landscape'], 1, 0, 'A lakeside city with Phewa Lake, surrounding hills, and views towards the Annapurna range when skies are clear.', 'A lakeside walk and the older city, with time to sit and watch daily life.', 'Try a Thakali meal, then stop for tea.', ['pokhara', 'culinary'], ['the-people/gurung', 'food/dal-bhat']),
        place('janakpur', 'Janakpur', 'जनकपुर', ['heritage', 'terai'], 2, 0, 'A centre of Mithila culture, known for Janaki Mandir, sacred ponds, and colourful art.', 'Mithila painting and the streets around the temple. The Ramayana tradition connects the city with Sita.', 'Explore local sweets and snacks from the southern plains.', ['janakpur'], ['the-people/mithila', 'food/litti-chokha']),
        place('chitwan', 'Chitwan', 'चितवन', ['landscape', 'terai'], 0, 1, 'Lowland forests, rivers, and grasslands, alongside towns and Tharu communities.', 'A guided nature walk where permitted, birdlife, and a Tharu-led cultural visit. Give wildlife space.', 'Look for dhikri and other dishes introduced by Tharu cooks.', ['chitwan', 'tharuFood'], ['the-people/tharu', 'food/dhikri']),
        place('lumbini', 'Lumbini', 'लुम्बिनी', ['heritage', 'terai'], 1, 1, 'A Buddhist pilgrimage place recognised by UNESCO as the birthplace of the Buddha.', 'The Maya Devi Temple area, the Ashoka pillar, and a quiet walk through the monastic zone.', 'A simple local meal is a good pause between visits.', ['lumbini'], ['food/dal-bhat']),
        place('ilam', 'Ilam', 'इलाम', ['landscape'], 2, 1, 'Eastern hill landscapes of tea gardens, market towns, and green slopes.', 'A walk near the tea gardens and a conversation with local growers or a tea seller.', 'Taste locally grown tea and look for chhurpi in the market.', ['ilam', 'chhurpi'], ['the-people/limbu', 'food/chiya']),
    ];

    const collections = {
        food: { route: 'food', subtitle: 'A few delicious ways into Nepal’s many kitchens.', search: 'Find a dish…', searchLabel: 'Search dishes and drinks', noun: 'dishes & drinks', items: foods,
            filters: [['all', 'All'], ['everyday', 'Everyday'], ['newa', 'Newa kitchen'], ['himalayan', 'Himalayan'], ['terai', 'Terai'], ['sweet', 'Sweet & sip']],
            note: 'Recipes travel and change. These are starting points; ingredients, fillings, and names vary by cook. Ask about ingredients when ordering.', sources: ['culinary', 'recipes', 'gundruk'] },
        people: { route: 'the-people', subtitle: 'Many communities. Many ways of being Nepali.', search: 'Find a community…', searchLabel: 'Search communities and cultures', noun: 'community introductions', items: people,
            filters: [['all', 'All'], ['valley', 'Valley roots'], ['hills', 'Hill roots'], ['himalaya', 'Himalayan roots'], ['terai', 'Terai roots']],
            note: 'A small, growing collection of ethnic, linguistic, regional, and religious identities. These overlap. People live across Nepal and abroad; traditions vary within every community. Dalit communities, Madhesi caste groups, and many other communities also have distinct histories and voices to explore.', sources: ['people', 'newa', 'tharu'] },
        places: { route: 'places', subtitle: 'Get to know a place, one small discovery at a time.', search: 'Find a place…', searchLabel: 'Search places', noun: 'places to explore', items: places,
            filters: [['all', 'All'], ['heritage', 'Heritage & cities'], ['landscape', 'Lakes & landscapes'], ['terai', 'The Terai']],
            note: 'A first introduction, with links for going further. Local communities, neighbourhoods, and quieter places each have their own stories.', sources: ['homestays', 'kathmandu', 'lumbini'] },
    };
    return { lessons, collections, sources, arrow };
})();
