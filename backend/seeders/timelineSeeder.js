const { PrismaClient } = require('../prisma/generated/client');
const dotenv = require('dotenv');
dotenv.config({ override: true });
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Timeline periods and events, sourced from backend/sample/history data.txt
// (English: "Journey of the Kangyur" in the Golden Lineage foreword;
//  Tibetan: the "འཕེལ་རྒྱས་བྱུང་ཚུལ།" history of Kangyur manuscripts, prints,
//  stone-carved and modern editions).
// Tibetan titles reuse the section headings of that history where one exists.
// The Tibetan text has no passage for these events, so their Tibetan
// descriptions are AI-written and should be reviewed by a Tibetan editor:
// 910, 1000, 1270, 1737, 1977, 1989, 2016.
const ev = (year, is_approximate, category, significance, title_english, title_tibetan, description_english, description_tibetan = null) => ({
  title_english,
  description_english,
  title_tibetan,
  description_tibetan,
  year,
  is_approximate,
  category,
  significance,
});

const withOrder = (events) => events.map((e, i) => ({ ...e, order_index: i + 1 }));

const timelineData = [
  {
    id_slug: 'early-translation',
    name_english: 'Early Translation Period',
    name_tibetan: 'བསྟན་པ་སྔ་དར།',
    start_year: 620,
    end_year: 842,
    events: withOrder([
      ev(640, true, 'translation', 'major',
        "Thönmi Sambhota begins translating the Buddha's word into Tibetan",
        'ཐོན་མི་སམྦྷོ་ཊས་རྒྱལ་བའི་བཀའ་བོད་དུ་བསྒྱུར་བའི་སྲོལ་བཏོད་པ།',
        "During the reign of the Dharma King Songtsen Gampo, the minister Thönmi Sambhota established the great tradition of translating the Buddha's word and treatises into Tibetan, beginning with sūtras and tantras of Avalokiteśvara.",
        'ཆོས་སྐྱོང་བའི་རྒྱལ་པོ་སྲོང་བཙན་སྒམ་པོའི་སྐུ་དུས་སུ་བློན་ཆེན་ཐོན་མི་མཆོག་གིས་སྤྱན་རས་གཟིགས་ཀྱི་མདོ་རྒྱུད་དག་གིས་མཚོན་བཀའ་དང་བསྟན་བཅོས་བོད་དུ་བསྒྱུར་བའི་སྲོལ་ཆེན་བཏོད་དོ།།'),
      ev(779, true, 'translation', 'major',
        'Khenpo, Lopön and Chögyal (Khen Lob Chö Sum) bring the Dharma to Tibet',
        'མཁན་སློབ་ཆོས་གསུམ་གྱིས་བོད་དུ་དམ་ཆོས་དར་བར་མཛད་པ།',
        "Under King Trisong Detsen, Abbot Śāntarakṣita, Guru Padmasambhava and the Dharma King gathered together; through their guidance and patronage, emanated translators and paṇḍitas translated, revised and finalized the Buddha's word and its treatises.",
        'ཁྲི་སྲོང་ལྡེ་བཙན་གྱི་སྐུ་དུས་སུ། མཁན་སློབ་ཆོས་གསུམ་གདན་འཛོམས་ཏེ་གཙོ་བོ་དེ་དག་གི་ཞལ་བཀོད་དང་། བདག་རྐྱེན། ནུས་མཐུ་བསམ་གྱིས་མི་ཁྱབ་པ་སོགས་ལ་བརྟེན་ནས། སྤྲུལ་པའི་ལོ་པཎ་དག་གིས་བཀའ་དང་བསྟན་བཅོས་རྣམས་བསྒྱུར་ཞུས་གཏན་ལ་ཕབ་པར་མཛད་དོ།།'),
      ev(812, true, 'compilation', 'major',
        'Denkarma and Phangthangma catalogues compiled',
        'དཀར་ཆག་ལྡན་དཀར་མ་དང་འཕང་ཐང་མ་བསྒྲིགས་པ།',
        'Two famous karchags were compiled in the time of the Dharma Kings: the Denkarma, containing some 737 titles, and the Phangthangma, containing around 960 titles, prepared by translators such as Paltsek at the Phangthang Kamé temple.',
        'བསྟན་པ་སྔ་དར་གྱི་དུས་སུ་ཆོས་ཀྱི་རྒྱལ་པོ་སད་ན་ལེགས་མཇིང་ཡོན་གྱི་སྐུ་རིང་ལ། ལོ་ཙཱ་བ་བནྡེ་དཔལ་བརྩེགས་རཀྵི་ཏ་དང་། ཆོས་ཀྱི་སྙིང་པོ། དེ་ཝེནྡྲ། དཔལ་གྱི་ལྷུན་པོ་སོགས་ཀྱིས་འཕང་ཐང་ཀ་མེད་ཀྱི་གཙུག་ལག་ཁང་དུ་བཞུགས་པའི་གསུང་རབ་རྣམས་ཀྱི་དཀར་ཆག་འཕང་ཐང་མ་བཀོད་ཅིང་། དཀར་ཆག་ལྡན་དཀར་མ་ཡང་བྱུང་ངོ་།།'),
      ev(814, true, 'translation', 'major',
        'Two-Volume Lexicon (Madhyavyutpatti) sets the rules of translation',
        'སྒྲ་སྦྱོར་བམ་པོ་གཉིས་པས་བསྒྱུར་ཐབས་གཏན་ལ་ཕབ་པ།',
        'Under Tride Songtsen (Senalek), many earlier translations were revised and the methods for all future translation were standardized in the Two-Volume Lexicon (sgra sbyor bam po gnyis pa), a standard that qualified Tibetan translators follow to the present day.',
        'བཙན་པོ་ཁྲི་ལྡེ་སྲོང་བཙན་གྱི་སྐབས་སུ་སྔར་བསྒྱུར་བའི་གསུང་རབ་དུ་མ་འགྱུར་བཅོས་གནང་བ་མ་ཟད་ཕྱིན་ཆད་བསྒྱུར་ཐབས་གྱི་རིམ་པ་དག་གཏན་འབེབ་མཛད་དེ་སྒྲ་སྦྱོར་བམ་པོ་གཉིས་པ་ཞེས་པའི་བསྟན་བཅོས་ཁྱད་དུ་འཕགས་པ་དེ་ཉིད་བསྒྲིགས་པར་མཛད་ལ། དེ་ནས་དུས་ད་ལྟའི་བར་ཚད་ལྡན་གྱི་རང་རེའི་ལོ་ཙྪ་བ་དག་རྒྱ་དེ་ལས་མི་འདའ་བར་མཛད་བཞིན་པའོ།།'),
    ]),
  },
  {
    id_slug: 'dark-age',
    name_english: 'Dark Age and Revival',
    name_tibetan: 'བསྟན་པ་ཉམས་པ་དང་ཡང་སྐྱེས།',
    start_year: 842,
    end_year: 1040,
    events: withOrder([
      ev(910, true, 'transmission', 'important',
        'Period of fragmentation following the collapse of the Tibetan Empire',
        'བོད་ཀྱི་རྒྱལ་ཁམས་སིལ་བུར་གྱུར་པའི་དུས་སྐབས།',
        'Period of fragmentation with limited translation activity following the collapse of the Tibetan Empire.',
        'བཙན་པོ་གླང་དར་མའི་རྗེས་སུ་བོད་ཀྱི་རྒྱལ་ཁམས་སིལ་བུར་གྱུར་ཏེ། ལོ་ངོ་མང་པོའི་རིང་བཀའ་བསྟན་བསྒྱུར་བའི་བྱ་བ་ཉུང་ཉུང་ཙམ་ལས་མ་བྱུང་ངོ་།།'),
      ev(1000, true, 'translation', 'major',
        'Later Diffusion (phyi dar) begins; Rinchen Zangpo, "the great morning star"',
        'བསྟན་པ་ཕྱི་དར་གྱི་འགོ་ཚུགས་པ། ལོ་ཆེན་རིན་ཆེན་བཟང་པོ།',
        'The Later Diffusion of the teachings begins with renewed translation efforts in Western Tibet, led by the great translator Rinchen Zangpo (958–1055).',
        'བོད་སྟོད་མངའ་རིས་སུ་ལོ་ཆེན་རིན་ཆེན་བཟང་པོ་(༩༥༨-༡༠༥༥)གཙོས་པའི་ལོ་ཙཱ་བ་རྣམས་ཀྱིས་གསུང་རབ་བསྒྱུར་བའི་བྱ་བ་བསྐྱར་གསོ་མཛད་དེ་བསྟན་པ་ཕྱི་དར་གྱི་འགོ་ཚུགས་སོ།།'),
    ]),
  },
  {
    id_slug: 'proto-kangyur',
    name_english: 'Proto-Kangyur Formation',
    name_tibetan: 'བཀའ་འགྱུར་ཆགས་པའི་སྔ་རིམ།',
    start_year: 1040,
    end_year: 1300,
    events: withOrder([
      ev(1170, true, 'compilation', 'important',
        'Kathok manuscript Kangyur',
        'ཀཿཐོག་བཀའ་འགྱུར་བྲིས་མ།',
        'Although it is hard to say which was the first Kangyur produced in the Later Diffusion, the biography of Kadampa Deshek records that he commissioned 90 volumes of the Buddha’s word written in gold, along with 120 volumes of the four classes of tantra and a thousand volumes of treatises.',
        'བསྟན་པ་ཕྱི་དར་སྐབས་བཀའ་འགྱུར་རིན་པོ་ཆེ་བཞེངས་པའི་ཐོག་མ་གང་ཡིན་བཤད་དཀའ་ཙམ་ཡིན་ཡང་། ཀ་དམ་པའི་རྣམ་ཐར་ལས། “གསེར་གྱིས་རྒྱལ་བཀའ་རིན་པོ་ཆེ་པོད་དགུ་བཅུ། གསེར་འབུམ་ལྔ། དངུལ་འབུམ་བཅུ། གསེར་སྡུད་ཆ་བརྒྱ། རྒྱུད་སྡེ་ཆ་བཞི་ལ་པོད་བརྒྱ་དང་ཉི་ཤུ། བསྟན་བཅོས་པོད་སྟོང་རྣམས་བཞེངས་པར་གནང་།”ཞེས་གསལ་ལོ།།'),
      ev(1270, true, 'compilation', 'major',
        "Chomden Rigrel surveys the textual inheritance (2,000+ texts)",
        'བཅོམ་ལྡན་རིག་རལ་གྱིས་གསུང་རབ་ཀྱི་དཀར་ཆག་བསྒྲིགས་པ།',
        'By the early 1270s, Chomden Rigrel (1227–1305) had completed a survey of the textual inheritance brought to Tibet from India and elsewhere, listing more than 2,000 texts that would eventually fill the Kangyur and Tengyur, drawing on earlier karchags such as the Denkarma and Phangthangma.',
        'ཕྱི་ལོ་ ༡༢༧༠ ཡས་མས་སུ་བཅོམ་ལྡན་རིག་རལ་(༡༢༢༧-༡༣༠༥)གྱིས་ལྡན་དཀར་མ་དང་འཕང་ཐང་མ་སོགས་སྔོན་གྱི་དཀར་ཆག་རྣམས་ལ་གཞི་བཅོལ་ནས། རྒྱ་གར་སོགས་ནས་བོད་དུ་འགྱུར་བའི་གསུང་རབ་ཆོས་ཚན་ཉིས་སྟོང་ལྷག་གི་དཀར་ཆག་བསྟན་པ་རྒྱན་གྱི་ཉི་འོད་མཛད་དེ། ཕྱིས་ཀྱི་བཀའ་འགྱུར་དང་བསྟན་འགྱུར་གྱི་གཞི་བཏིང་ངོ་།།'),
      ev(1278, false, 'compilation', 'important',
        'Gold Kangyur of Chögyal Phakpa’s time',
        'འགྲོ་མགོན་ཆོས་རྒྱལ་འཕགས་པའི་སྐབས་ཀྱི་བཀའ་འགྱུར་གསེར་བྲིས་མ།',
        'At Chumakhar on the Sino-Tibetan border, Jimgim, son of the Mongol emperor Kublai Khan, sponsored and ordered a Kangyur written in gold; Drogön Chögyal Phakpa (1235–1280) composed its catalogue, which survives in his collected works.',
        'ཕྱི་ལོ་ ༡༢༧༨ ལོར་རྒྱ་བོད་ཀྱི་ས་མཚམས་ཆུ་མ་མཁར་དུ་ཧོར་གྱི་རྒྱལ་པོ་གོ་པ་ལ་ཀན་གྱི་སྲས་རྒྱལ་པོ་ཇིམ་གྱིམ་གྱིས་རྒྱུ་སྦྱོར་དང་བཀའ་ལུང་བསྩལ་པ་བཞིན་བཀའ་འགྱུར་གསེར་བྲིས་གཅིག་བཞེངས་ཤིང་། འདི་ལ་དཀར་ཆག་འགྲོ་མགོན་ཆོས་འཕགས་ཀྱིས་མཛད་པ་ད་ལྟའང་གསུང་འབུམ་དུ་བཞུགས་སོ།།'),
    ]),
  },
  {
    id_slug: 'first-structured',
    name_english: 'First Structured Kangyurs',
    name_tibetan: 'བཀའ་འགྱུར་གྱི་རིམ་པ་དང་པོ།',
    start_year: 1300,
    end_year: 1400,
    events: withOrder([
      ev(1310, true, 'compilation', 'major',
        'Old Narthang Kangyur — archetype of the Tibetan Canon',
        'སྣར་ཐང་བཀའ་འགྱུར་བྲིས་མ།',
        "Around 1310, Chomden Rigrel's disciples compiled the Old Narthang Kangyur and Tengyur at Narthang Monastery, regarded by many as the archetype of the Tibetan Buddhist Canon as it appears today. It served as the source for both the Tshalpa and the Thempangma lines. Butön Rinchen Drub (1290–1364) later edited and expanded these collections at Zhalu.",
        'དབུས་པ་བློ་གསལ་རྩོད་པའི་སེང་གེ་དང་། ལོ་ཙྪ་བ་བསོད་ནམས་འོད་ཟེར། རྒྱང་རོ་བྱང་ཆུབ་འབུམ་སོགས་ཀྱིས་དཔལ་སྣར་ཐང་གི་གཙུག་ལག་ཁང་ན་བཞུགས་པའི་བཀའ་བསྟན་ཁག་དང་། གཞན་ཡང་འབད་པ་ཆེན་པོས་ཕྱོགས་ཀུན་ནས་གསུང་རབ་ཀྱི་དཔེ་དུ་མ་བཙལ་ཞིང་། སྐབས་དེར་གང་རྙེད་པའི་རྒྱལ་བའི་གསུང་རབ་རྣམས་ཕྱོགས་གཅིག་ཏུ་སྡེ་ཚན་དང་གོ་རིམ་བསྒྲིགས་ཏེ་བཞེངས་པ་ལ་སྣར་ཐང་བཀའ་འགྱུར་བྲིས་མའམ། སྣར་ཐང་བཀའ་འགྱུར་སྔ་མ་ཞེས་གྲགས་སོ། །བཀའ་འགྱུར་འདི་ཚལ་བའི་བཀའ་འགྱུར་དང་། རྒྱལ་རྩེ་ཐེམ་སྤང་མ་གཉིས་ཀྱི་མ་དཔེ་ཡིན་འདུག་པས་ཕྱིས་ཀྱི་བཀའ་འགྱུར་ཕལ་མོ་ཆེའི་བརྒྱུད་པའི་ཕྱི་མོ་རུ་བཞུགས་སོ།།'),
      ev(1349, false, 'compilation', 'major',
        'Tshalpa Kangyur — source of the eastern lineage',
        'ཚལ་པའི་བཀའ་འགྱུར་བྲིས་མ།',
        'Produced at Tshal Gungthang between 1347 and 1349 by Tshalpa Kunga Dorje, based mainly on the Old Narthang Kangyur, and consecrated by Butön in 1351. It is the source of the eastern "Tshalpa" line of Kangyurs.',
        'ཚལ་པ་ཀུན་དགའ་རྡོ་རྗེས་བོད་ཀྱི་སྲིད་དབང་བཟུང་སྐབས་ཡབ་དྲུང་ཆེན་སྨོན་ལམ་རྡོ་རྗེའི་དགོངས་རྫོགས་སོགས་ཀྱི་ཆེད་ཚལ་གུང་ཐང་དུ་སྣར་ཐང་བཀའ་འགྱུར་མ་ཕྱི་གཙོ་བོར་བྱས་ཏེ་ཕྱི་ལོ་ ༡༣༤༧-༡༣༤༩ ལོའི་བར་བཙུན་པ་ཐང་ཆེན་པ་ཀུན་དགའ་འབུམ་སོགས་དགེ་བའི་བཤེས་གཉེན་དུ་མས་ཞུ་དག་གནང་ནས་བཀའ་འགྱུར་ཞིག་བཞེངས་པ་ལ་ཚལ་པ་བཀའ་འགྱུར་ཞེས་གྲགས་སོ།།'),
      ev(1395, false, 'compilation', 'important',
        'Drigung gold-and-silver manuscript Kangyur (1395–1405)',
        'འབྲི་གུང་བཀའ་འགྱུར་བྲིས་མ།',
        'At the great seat of Drigung Thil, many Kangyurs were produced over time; among them, a Kangyur in mixed gold and silver was begun in 1395 and completed in 1405.',
        'འབྲི་གུང་ཐེལ་དགོན་པར་སྔ་ཕྱི་དུ་མར་བཀའ་འགྱུར་ཤིན་ཏུ་མང་པོ་ཞིག་བཞེངས་པ་ལས། འབྲི་གུང་ཆོས་ཀྱི་རྒྱལ་པོས་ཕྱི་ལོ་ ༡༣༩༥ ལོ་ལ་བཞེངས་མགོ་བརྩམས་ནས་ཕྱི་ལོ་ ༡༤༠༥ ལོར་བཞེངས་གྲུབ་པའི་གསེར་དངུལ་འདྲེས་མའི་བཀའ་འགྱུར་བཞུགས་སོ།།'),
    ]),
  },
  {
    id_slug: 'classic-manuscript',
    name_english: 'Classic Manuscript Kangyurs',
    name_tibetan: 'བཀའ་འགྱུར་བྲིས་མ།',
    start_year: 1400,
    end_year: 1860,
    events: withOrder([
      ev(1410, true, 'compilation', 'important',
        'Pangthok stone-carved Kangyur — earliest stone Kangyur',
        'སྤང་ཐོག་བཀའ་འགྱུར་རྡོ་བརྐོས་མ།',
        'In the early fifteenth century, more than sixty stone carvers worked for over nine years at Pangthok Monastery in Dzamthang to carve two sets of the Kangyur in stone; it is said to be the earliest stone-carved Kangyur in Tibetan history.',
        'དུས་རབས་བཅོ་ལྔ་པའི་མགོ་སྟོད་ཡས་མས་སུ་ཤར་འཛམ་ཐང་གི་སྤང་ཐོག་དགོན་པར་རྡོ་རྐོ་པ་དྲུག་ཅུ་ལྷག་གིས་ལོ་ངོ་དགུ་ལྷག་ལ་འབད་པ་བྱས་ནས་བཀའ་འགྱུར་ཚར་གཉིས་དང་། མཚན་སྔགས་སོགས་གཞན་དུ་མ་བཞེངས་པར་མཛད་ཅིང་། དེ་ནི་བོད་ཀྱི་ལོ་རྒྱུས་སྟེང་ཆེས་སྔ་ཤོས་ཀྱི་བཀའ་འགྱུར་རྡོ་བརྐོས་དེ་ཡིན་པར་བཤད།'),
      ev(1431, false, 'compilation', 'major',
        'Gyantse Thempangma — source of the western lineage',
        'རྒྱལ་རྩེའི་ཐེམ་སྤང་མ།',
        "Sponsored by Gyantse's ruler Rabten Kunzang Phak, a well-edited manuscript produced in 1431, based on the Old Narthang Kangyur; from 1436 a 111-volume gold manuscript was also produced. It is the source of the western \"Thempangma\" line.",
        'རྒྱལ་རྩེ་སྡེ་སྲིད་རབ་བརྟན་ཀུན་བཟང་འཕགས་ཀྱིས། ཕྱི་ལོ་ ༡༤༣༡ ལོར་བདེ་བར་གཤེགས་པའི་གསུང་རབ་རྣམས་སྐྱ་བྲིས་ཀྱིས་ཚར་གཅིག་བཞེངས་ཤིང་། ཕྱི་ལོ་ ༡༤༣༦ ལོ་ནས་གསེར་བྲིས་ཀྱི་བཀའ་འགྱུར་བཞེངས་པའི་རྒྱུན་བཙུགས་ནས། ལོ་ཆེན་ཐུགས་རྗེ་དཔལ་དང་། མཁས་པའི་དབང་པོ་དགེ་སློང་བཀྲ་ཤིས་རྒྱ་མཚོ་རྣམས་ཀྱིས་ཞུ་སྒྲིག་བྱས་ཤིང་། སྣར་ཐང་བཀའ་འགྱུར་མ་ཕྱི་བྱས་ཏེ་བཀའ་འགྱུར་གསེར་བྲིས་མ་པོད་ ༡༡༡ ཅན་ཞིག་བཞེངས་སོ།།'),
      ev(1446, true, 'compilation', 'important',
        'Lo (Mustang) manuscript Kangyur',
        'གློ་བོ་བཀའ་འགྱུར་བྲིས་མ།',
        'Around 1446, Ngorchen Kunga Zangpo visited Lo at the invitation of the ruler of Ngari, who gathered the available texts of the region and produced a manuscript Kangyur; Ngorchen composed its catalogue.',
        'ཕྱི་ལོ་ ༡༤༤༦ ཡས་མས་སུ་ངོར་ཆེན་ཀུན་དགའ་བཟང་པོ་མངའ་རིས་དཔོན་པོ་ཨ་ལ་རྒྱལ་མཚན་གྱིས་གདན་ཞུས་ལྟར་གློ་བོ་ལ་ཕེབས་ཤིང་། དེ་ནས་དཔོན་པོས་རེ་འདུན་ལྟར་བཀའ་བསྟན་གསར་བཞེངས་ཀྱི་གཙོ་འགན་བཞེས་ཏེ་མངའ་རིས་ཕྱོགས་སུ་ཡོད་པའི་བཀའ་བསྟན་གྱི་དཔེ་ཅི་རག་པ་རྣམས་བསྡུ་སྒྲིག་བྱས་ནས་བཀའ་འགྱུར་བྲིས་མ་ཚར་གཅིག་བཞེངས་པ་དེ་ལ་གློ་བོ་བཀའ་འགྱུར་ཞེས་གྲགས་སོ།།'),
      ev(1505, true, 'compilation', 'important',
        'Gold-and-silver Kangyur of Queen Sangye Paldzom',
        'བཙུན་མོ་སངས་རྒྱས་དཔལ་འཛོམས་ཀྱི་བཀའ་འགྱུར་གསེར་བྲིས་མ།',
        'In the early sixteenth century, Sangye Paldzom, queen of the ninth Phakmodru ruler Ngawang Tashi Drakpa Gyaltsen, produced a Kangyur in gold and silver on dark blue paper — thought to be the first Kangyur in Tibet sponsored by a woman.',
        'འདི་ནི་དུས་རབས་བཅུ་དྲུག་པའི་མགོ་སྟོད་དུ་ཕག་གྲུའི་ཁྲི་རབས་དགུ་པ་ངག་དབང་བཀྲ་ཤིས་གྲགས་པ་རྒྱལ་མཚན་གྱི་བཙུན་མོ་སངས་རྒྱས་དཔལ་འཛོམས་ཞེས་བྱ་བས་མཐིང་ཤོག་ལ་གསེར་དངུལ་གྱི་བཀའ་འགྱུར་གཅིག་བཞེངས་པ་དེའོ། །འདི་ནི་བོད་དུ་བུད་མེད་ཀྱིས་ཡོན་བདག་གནང་སྟེ་བཀའ་འགྱུར་བཞེངས་པ་ཐེངས་དང་པོ་ཡིན་པར་སྙམ་མོ།།'),
      ev(1513, false, 'compilation', 'important',
        'Yangpachen gold Kangyur (103 volumes)',
        'ཡངས་ཅན་བཀའ་འགྱུར་བྲིས་མ།',
        'In 1513 the Fourth Shamarpa, Chödrak Yeshe, produced a 103-volume Kangyur written in gold at Yangpachen, known as the Yangchen Kangyur.',
        'ཕྱི་ལོ་ ༡༥༡༣ ལོར་ཞྭ་དམར་སྐུ་ཕྲེང་བཞི་པ་ཆོས་གྲགས་ཡེ་ཤེས་ཀྱིས་ཡངས་པ་ཅན་དུ་གསེར་བྲིས་ཀྱི་བཀའ་འགྱུར་པོད་ ༡༠༣ ཅན་ཞིག་བཞེངས་པ་དེ་ལ་ཡངས་ཅན་བཀའ་འགྱུར་ཞེས་གྲགས་སོ།།'),
      ev(1650, true, 'compilation', 'important',
        'Lhodzong manuscript Kangyur',
        'ལྷོ་རྫོང་བཀའ་འགྱུར་བྲིས་མ།',
        'In the seventeenth century, Desi Sönam Chöphel produced a manuscript Kangyur at Palthang Poche temple, based on the Gyantse Thempangma, and installed it at Lhodzong in Upper Dokham.',
        'དུས་རབས་བཅུ་བདུན་པའི་ནང་སྡེ་སྲིད་བསོད་ནམས་ཆོས་འཕེལ་གྱིས་དཔལ་ཐང་པོ་ཆེའི་གཙུག་ལག་ཁང་དུ་བཀའ་འགྱུར་བྲིས་མ་ཚར་གཅིག་བཞེངས་ནས་མདོ་སྟོད་ལྷོ་རྫོང་དུ་བཞུགས་སུ་བཅུག་པ་ལ་ལྷོ་རྫོང་བཀའ་འགྱུར་ཞེས་གྲགས་སོ། །འདིའི་མ་དཔེ་རྒྱལ་རྩེ་ཐེམ་སྤང་མ་བྱས་ཤིང་། གཞན་དག་ལའང་ཟུར་ལྟ་བྱས་པར་གསལ་ལོ།།'),
      ev(1671, false, 'compilation', 'important',
        'Drepung gold Kangyur and the Ulan Bator Thempangma (114 volumes)',
        'འབྲས་སྤུངས་བཀའ་འགྱུར་གསེར་བྲིས་མ།',
        'In 1671, at the command of the Great Fifth Dalai Lama, a 114-volume gold manuscript Kangyur based on the Gyantse Thempangma was produced at Drepung; a 114-volume Thempangma copy offered to the Mongols in the same year is known today as the Ulan Bator Kangyur.',
        'ཕྱི་ལོ་ ༡༦༧༡ ལོར་རྒྱལ་དབང་ལྔ་པ་ཆེན་པོ་ངག་དབང་བློ་བཟང་རྒྱ་མཚོས་བཀའ་ལྟར་སྡེ་སྲིད་བློ་བཟང་མཐུ་སྟོབས་ཀྱིས་གཙོ་སྐྱོང་འོག །དཔལ་ལྡན་འབྲས་སྤུངས་སུ་རྒྱལ་རྩེ་ཐེམ་སྤང་མ་གཞིར་བཟུང་ནས་གསེར་བྲིས་ཀྱི་བཀའ་འགྱུར་པོད་ ༡༡༤ ཅན་ཞིག་བཞེངས་པ་དེ་ལ་འབྲས་སྤུངས་བཀའ་འགྱུར་གསེར་བྲིས་མ་ཞེས་ཟེར་རོ།།'),
      ev(1700, false, 'compilation', 'important',
        'Tawang Kangyur, with some sixty Nyingma tantras',
        'རྟ་དབང་བཀའ་འགྱུར།',
        'The 1699–1700 Tawang Kangyur was found at Orgyen Ling, the family temple and birthplace of the Sixth Dalai Lama; it contains some sixty Nyingma tantras not found in other Kangyurs.',
        'ཨོ་རྒྱན་གླིང་དུ་བཞུགས་པའི་རྟ་དབང་བཀའ་འགྱུར་བྲིས་མ་འདི་ལ་བཀའ་འགྱུར་དུ་མ་བཞུགས་པའི་རྙིང་རྒྱུད་སྐོར་དཔེ་ཚན་དྲུག་ཅུ་ཙམ་བཞུགས་པ་ལ་སོགས་པའི་ཁྱད་ཆོས་ཡོད་དོ།།'),
      ev(1706, false, 'compilation', 'important',
        'Phugdrak Kangyur (119 volumes), Ngari',
        'ཕུག་བྲག་བཀའ་འགྱུར་བྲིས་མ།',
        'The independent 119-volume Phugdrak Kangyur, completed in 1706 at Phugdrak Monastery in Ngari, western Tibet; its catalogue was completed in 1708.',
        'བོད་ནུབ་ཕྱོགས་མངའ་རིས་ཀྱི་ཕུག་བྲག་དགོན་དུ་ཕུག་བྲག་མཁན་པོ་ངག་དབང་ཆོས་གྲགས་དང་། ཡུལ་གྱི་འགོ་དཔོན་བློ་བཟང་འབུམ་ཐར། ཁྲོ་བོ་རྣམ་རྒྱལ། ཚེ་བརྟན་རྣམ་རྒྱལ་ལ་སོགས་པ་རྣམས་ནས་མཐུན་རྐྱེན་སྦྱར་ཏེ་ཕྱི་ལོ་ ༡༦༩༦ ནས་ ༡༧༠༦ བར་བཀའ་འགྱུར་བྲིས་མ་བཞེངས་ཤིང་། དེའི་དཀར་ཆག་<<དཀར་ཆག་གསལ་བའི་མེ་ལོང་>>ཕྱི་ལོ་ ༡༧༠༨ ལོར་ལེགས་པར་གྲུབ། བཀའ་འགྱུར་དངོས་ལ་པོད་བརྒྱ་དང་བཅུ་དགུ་དཀར་ཆག་པོད་ཆུང་གཅིག་བཅས་པོད་བརྒྱ་དང་ཉི་ཤུ་བཞུགས་སོ།།'),
      ev(1712, false, 'compilation', 'important',
        'Shelkar Chöde Kangyur (105 volumes)',
        'ཤེལ་དཀར་ཆོས་སྡེའི་བཀའ་འགྱུར།',
        'A 105-volume copy made in 1712 of a Thempangma manuscript held in Dingri, belonging to the western Kangyur lineage.',
        'ཕྱི་ལོ་ ༡༧༡༢ ལོར་ལ་སྟོད་ཤེལ་དཀར་དགོན་གྱི་མཁན་ཐོག་དྲུག་པ་ངག་དབང་དགེ་འདུན་གྱི་སྐབས། བསྟན་པའི་སྦྱིན་བདག་རྡོར་ལེགས་རྣམ་རྒྱལ་སོགས་ནས་ཆོས་སྡེ་དེར་བཞེངས་པའི་བཀའ་འགྱུར་ཕྱི་ལོ་ ༡༩༠༤ ལོར་དབྱིན་དམག་ལྷ་སར་སླེབས་སྐབས་དབྱིན་ཡུལ་དུ་ཁྱེར་བ་དེང་དབྱིན་ཇིའི་རྒྱལ་ས་ལོན་ཊོན་གྱི་དཔེ་མཛོད་ཁང་དུ་བཞུགས་སོ།།'),
      ev(1729, false, 'compilation', 'important',
        'Ladakh Tog Palace Kangyur (109 volumes)',
        'ལ་དྭགས་ཏོག་རྒྱལ་མཁར་གྱི་བཀའ་འགྱུར།',
        'The 109-volume Tog Palace Kangyur of 1729, based on a Bhutanese manuscript copy of the Thempangma, produced at the Tog Palace in Leh during the reign of Nyima Namgyel.',
        'དུས་རབས་བཅོ་བརྒྱད་པའི་སྟོད་ཙམ་དུ་ལ་དྭགས་རྒྱལ་པོ་ཉི་མ་རྣམ་རྒྱལ་གྱིས་བཞེངས་པའི་བཀའ་འགྱུར་ད་ལྟ་ལ་དྭགས་ཏོག་རྒྱལ་མཁར་དུ་བཞུགས་ཤིང་། ཕྱི་ལོ་ ༡༩༨༠ ལོར་ལ་དྭགས་པ་ཏ་རུ་ཚེ་བརྟན་རྣམ་རྒྱལ་ནས་བཀའ་འགྱུར་དེ་བརྙན་པར་བྱས་ཏེ་ཡུལ་གྲུ་དུ་མར་འགྲེམ་སྤེལ་གནང་ངོ་།།'),
      ev(1730, true, 'compilation', 'important',
        "Polhané's gold manuscript Kangyur",
        'ཕོ་ལྷ་བའི་བཀའ་འགྱུར་གསེར་བྲིས་མ།',
        'In the early twelfth rabjung, Polhané Sönam Topgye sponsored a gold manuscript Kangyur based on the Tshalpa Kangyur, gathering many skilled scribes of Ü-Tsang.',
        'བོད་རབ་བྱུང་བཅུ་གཉིས་པའི་སྟོད་ཙམ་ལ་མི་དབང་ཕོ་ལྷ་བ་བསོད་ནམས་སྟོབས་རྒྱལ་གྱིས་སྦྱིན་བདག་གནང་སྟེ། དབུས་གཙང་ཁུལ་གྱི་ཡིག་མཁན་མཁས་པ་མང་པོ་བསྡུས་ཤིང་། ཚལ་པ་བཀའ་འགྱུར་མ་དཔེ་བྱས་ནས་བཀའ་འགྱུར་གསེར་བྲིས་འཛམ་གླིང་གཡས་བཞག་ཏུ་གྲགས་པ་དེ་བཞེངས་སོ།།'),
      ev(1858, false, 'compilation', 'minor',
        'Tōyō Bunko Kangyur',
        'ཏོ་ཡོ་བུན་ཀོའི་བཀའ་འགྱུར།',
        'A copy of the Thempangma produced in 1858 and now held in Japan, known as the Tōyō Bunko Kangyur.',
        'དེ་མོ་བློ་བཟང་ཐུབ་བསྟན་འཇིགས་མེད་རྒྱ་མཚོ་དང་། ངག་དབང་བློ་བཟང་ཕྲིན་ལས་རྣམས་ཀྱི་ཞལ་བཀོད་ལ་བརྟེན་ནས་ཕྱི་ལོ་ ༡༨༥༨ ནས་ ༡༨༧༨ ཙམ་གྱི་བར་བཞེངས་པའི་བཀའ་འགྱུར་ཕྱི་ལོ་ ༡༩༡༣ ལོར་ཉི་ཧོང་པ་ཨེ་ཀའི་ཀ་ཝ་གུ་ཅི་ལགས་ཀྱིས་ཉི་ཧོང་དུ་གདན་དྲངས་པ་དེང་སང་ཉི་ཧོང་གི་ཏོ་ཡོ་བུན་ཀོ་དཔེ་མཛོད་ཁང་དུ་བཞུགས་སོ།།'),
    ]),
  },
  {
    id_slug: 'block-printed',
    name_english: 'Block-Printed Editions',
    name_tibetan: 'བཀའ་འགྱུར་པར་མ།',
    start_year: 1410,
    end_year: 1910,
    events: withOrder([
      ev(1410, false, 'publication', 'major',
        'Yongle Kangyur — the first printed Kangyur (105 volumes)',
        'གཡུང་ལོའི་པར་མ།',
        'The first xylographic Kangyur, the 105-volume Yongle, emerged from the eastern Tshalpa line. Sponsored by the Yongle Emperor, third emperor of the Ming dynasty, it was carved in Nanjing in 1410.',
        'ཕྱི་ལོ་༡༤༡༠ཡས་མས་ཞིག་ལ། ཏཱ་མིང་རྒྱལ་རབས་གསུམ་པ་གོང་མ་གཡུང་ལོས་ནུབ་ཕྱོགས་བོད་ཡུལ་ནས་བཀའ་འགྱུར་ཞིག་གདན་དྲངས་ཤིང་དེ་ཕྱི་མོར་བཟུང་སྟེ། རྒྱལ་ས་ནན་ཅིན་གྱི་ལིང་ཀོ་དགོན་པར་བཀའ་འགྱུར་གྱི་པར་ཤིང་ཆ་ཚང་ཞིག་བཞེངས་སོ། །དེ་ནི་བོད་ཡིག་གི་བཀའ་འགྱུར་པར་ཏུ་བརྐོས་པ་ཐོག་མ་ཡིན་པར་ཀུན་གྱིས་བཞེད། དེ་ནས་པར་ཏུ་བཏབ་པ་རྣམས་ལ་གཡུང་ལོའི་བཀའ་འགྱུར་ཞེས་གྲགས་ཤིང་པར་མ་འདིར་ཁྱོན་པོད་གྲངས་ ༡༠༥ ཡོད་དོ།།'),
      ev(1605, false, 'publication', 'important',
        'Wanli Kangyur (105 + 42 volumes)',
        'དབན་ལི་བཀའ་འགྱུར།',
        'Sponsored by the Wanli Emperor Shenzong, thirteenth emperor of the Ming dynasty, printed from the blocks of the Yongle with 42 supplementary volumes.',
        'ཕྱི་ལོ་ ༡༦༠༥ ཡས་མས་སུ་མིང་རྒྱལ་རབས་ཀྱི་གོང་མ་དབན་ལིས་བཀའ་ལྟར་མདོ་རྒྱུད་ཀྱི་ཆོས་ཚན་འགའ་ཞིག་ཁ་སྐོང་བྱས་ཤིང་གཙོ་བོ་གཡུང་ལོའི་པར་ཤིང་རྣམས་གཙང་སེལ་བྱས་ཐོག །གཡུང་ལོའི་པར་མ་རྣམས་མཚལ་པར་ཡིན་པ་ལ་པར་གཞི་དེ་སྣག་པར་དུ་བསྒྱུར་བ་ཙམ་ཞིག་ཡིན་པར་སྣང་ལ། དེ་ནས་པར་དུ་བསྐྲུན་པ་དག་ལ་དབན་ལི་བཀའ་འགྱུར་ཞེས་གྲགས་སོ།།'),
      ev(1614, false, 'publication', 'major',
        'Lithang / Jang Satham Kangyur — first block print made in Tibet (109 volumes)',
        'ལི་ཐང་ངམ་འཇང་བཀའ་འགྱུར།',
        'Edited by the Sixth Shamarpa, Mipham Chökyi Wangchuk, and sponsored by the King of Jang, the 109-volume Lithang or Jang Satham Kangyur of 1609–1614 was the first block-print Kangyur produced within Tibet. It traces its origin to the Chingwa Taktse manuscript, believed to be based on the Tshalpa.',
        'ཕྱི་ལོ་ ༡༦༠༨ ལོར་ཞྭ་དམར་སྐུ་ཕྲེང་དྲུག་པ་གར་དབང་ཆོས་ཀྱི་དབང་ཕྱུག་གིས་འཇང་རྒྱལ་པོ་ལ་རྒྱལ་བའི་བཀའ་འགྱུར་ཞིག་པར་དུ་བཞེངས་ཐུབ་ན་ལེགས་ཚུལ་ཀྱི་བཀས་བསྐུལ་བ་དང་། འཇང་རྒྱལ་པོ་ཀརྨ་མི་ཕམ་ཚེ་དབང་བསོད་ནམས་རབ་བརྟན་གྱིས་བཀའ་འགྱུར་པར་དུ་བཞེངས་ཏེ། ཕྱི་ལོ་༡༦༡༤ལོར་རྗེ་ཞྭ་དམར་པ་ཉིད་ཀྱིས་འཇང་བཀའ་འགྱུར་གྱི་པར་བྱང་མཛད་དོ།།'),
      ev(1684, false, 'publication', 'important',
        'Kangxi Kangyur (105 volumes)',
        'ཁང་ཤིས་སམ་པེ་ཅིན་བཀའ་འགྱུར།',
        'Produced between 1684 and 1692 under the Kangxi Emperor, with new blocks that duplicated those of the Yongle; according to the Tibetan account, carving at Songzhu Monastery in Beijing, based on the Yongle and Wanli prints, was begun in 1682 and completed with proofreading in 1700.',
        'ཕྱི་ལོ་ ༡༦༨༢ ལོར་ཆིང་རྒྱལ་རབས་ཀྱི་གོང་མ་གཉིས་པ་ཁང་ཤིས་སམ་བདེ་སྐྱིད་གོང་མས་བཀའ་འགྱུར་གྱི་པར་ཤིང་བཞེངས་དགོས་པའི་བཀའ་ཕེབས་པ་ལྟར། པེ་ཅིན་སུང་ཀྲུའུ་དགོན་པར་གཡུང་ལོ་དང་དབན་ལི་པར་མ་ཕྱི་མོར་བཟུང་ནས་པར་ཤིང་བཞེངས་པའི་དབུ་བརྩམས་ཏེ། མཐར་ཕྱི་ལོ་ ༡༧༠༠ ལོར་པར་ཤིང་ཞུ་དག་དང་བཅས་པ་ལེགས་པར་གྲུབ་ཅིང་། པར་ཤིང་དེ་ནས་པར་དུ་བསྐྲུན་པ་དག་ལ་ཁང་ཤིས་སམ་པེ་ཅིན་བཀའ་འགྱུར་ཞེས་བརྗོད་དོ།།'),
      ev(1731, false, 'publication', 'important',
        'Choné Kangyur (108 volumes)',
        'ཅོ་ནེའི་བཀའ་འགྱུར།',
        'Based on the Lithang Kangyur, the 108-volume Choné Kangyur was carved in the Choné region of Amdo with the sponsorship of the Choné leader Makzor Gönpo, who began preparations in 1716.',
        'ཕྱི་ལོ་ ༡༧༡༦ ལོར་ཅོ་ནེ་རྒྱལ་རབས་བཅུ་གཅིག་པ་དམག་ཟོར་མགོན་པོས་རང་གི་ཡབ་ཡུམ་དང་བཙུན་མོ་རྣམས་ཀྱི་ཐུགས་སྨོན་ལྟར་རྒྱལ་བའི་བཀའ་འགྱུར་རིན་པོ་ཆེ་ཤིང་པར་དུ་བསྒྲུབ་པའི་ཉེར་བསྡོགས་བརྩམས་སོ།།'),
      ev(1732, false, 'publication', 'important',
        'Narthang printed Kangyur (101 volumes)',
        'སྣར་ཐང་བཀའ་འགྱུར་པར་མ།',
        'Initially sponsored by Desi Sangye Gyatso, regent of the Great Fifth Dalai Lama, at the command of the Sixth Dalai Lama and based on the Tshalpa Kangyur; the work was resumed in 1730 by Polhané Sönam Topgye and completed in about two years at Narthang Monastery.',
        'སླར་ཡང་ཕྱི་ལོ་ ༡༧༣༠ ལོར་ཕོ་ལྷ་བ་བསོད་ནམས་སྟོབས་རྒྱལ་གྱིས་འཕྲོ་མཐུད་དེ་ལོ་གཉིས་ཙམ་གྱི་རིང་པར་གཞི་ཡོངས་རྫོགས་གྲུབ། དེ་ནས་པར་ཤིང་རྣམས་པཎ་ཆེན་སྐུ་ཕྲེང་ལྔ་པ་བློ་བཟང་ཡེ་ཤེས་ལ་ཕུལ་ཞིང་། དཔལ་སྣར་ཐང་གི་གཙུག་ལག་ཁང་དུ་བཞུགས་སུ་གསོལ་པས་དེ་ནས་པར་ཏུ་བཏབ་པ་རྣམས་ལ་སྣར་ཐང་པར་མའི་བཀའ་འགྱུར་ཞེས་སམ། སྣར་ཐང་བཀའ་འགྱུར་གསར་མ་ཞེས་གྲགས་སོ།།'),
      ev(1733, false, 'publication', 'major',
        'Derge Kangyur (103 volumes)',
        'སྡེ་དགེའི་བཀའ་འགྱུར།',
        'Edited by the great Situ Paṇchen Chökyi Jungné (1699–1774) after careful study of the Lhodzong Thempangma manuscript and the Jang block print of the Tshalpa lineage, and sponsored by Tenpa Tsering, King of Derge. Carving began in 1729 and was completed in 1733 at the Derge Parkhang; this highly regarded edition became widespread throughout Tibet.',
        'ཕྱི་ལོ་ ༡༧༢༩ ལོར་སྡེ་དགེའི་རྒྱལ་རབས་ཞེ་གཉིས་པ་ཆོས་རྒྱལ་བསྟན་པ་ཚེ་རིང་གིས་སྦྱིན་བདག་དང་། སི་ཏུ་པཎ་ཆེན་ཆོས་ཀྱི་འབྱུང་གནས་ཞུ་ཆེན་པར་གདན་དྲངས་ནས། བགྲང་བྱ་ལྔ་ཙམ་གྱི་རིང་བཀའ་འགྱུར་གྱི་པར་རྐོའི་ལས་གཞི་ཡོངས་སུ་གྲུབ་སྟེ། པར་ཤིང་རྣམས་སྡེ་དགེའི་པར་ཁང་ཆོས་མཛོད་ཆེན་མོར་བཞུགས་སུ་གསོལ་ཞིང་། ད་ལྟའང་འགྲོ་བའི་བསོད་ནམས་ཀྱི་བགོ་སྐལ་དུ་མཆིས་ལ་པར་ཤིང་དེ་ནས་པར་དུ་བསྐྲུན་པ་རྣམས་ལ་སྡེ་དགེའི་བཀའ་འགྱུར་ཞེས་གྲགས་སོ།།'),
      ev(1737, false, 'publication', 'important',
        'Peking-Qianlong Kangyur (107 volumes)',
        'པེ་ཅིན་ཆན་ལུང་བཀའ་འགྱུར།',
        'The 107-volume Peking-Qianlong Kangyur of 1737, produced during the reign of the Qianlong Emperor in the lineage descending from the Yongle.',
        'ཕྱི་ལོ་ ༡༧༣༧ ལོར་ཆིང་གོང་མ་ཆན་ལུང་གི་སྐུ་རིང་ལ་གཡུང་ལོའི་པར་མའི་བརྒྱུད་པ་ལས་བྱུང་བའི་པེ་ཅིན་ཆན་ལུང་བཀའ་འགྱུར་པོད་ ༡༠༧ ཅན་ཞིག་པར་དུ་བསྐྲུན་ནོ།།'),
      ev(1820, false, 'publication', 'important',
        'Ragya Kangyur — reproduction of the Derge',
        'རྭ་རྒྱ་བཀའ་འགྱུར།',
        'A reproduction of the Derge Kangyur carved in Amdo: carving began in 1814, one hundred volumes were complete by the summer of 1819, and the full 103 volumes were finished in 1820.',
        'ཕྱི་ལོ་ ༡༨༡༩ ལོའི་དབྱར་ཐོག་པོད་ལྔ་གྲུབ་ནས་ཁྱོན་པོད་བརྒྱ་ཕྲག་གཅིག་གྲུབ་ཅིང་། ཡང་གསར་དུ་སྡེ་དགེ་ནས་པར་རྐོ་བ་མི་བཅུ་དྲུག་འབྱོར་བར་རྙིང་རྒྱུད་པོ་ཏི་གསུམ་བརྐོར་བཅུག་པ་ཡང་འབྲུག་ལོ་སྟེ་ཕྱི་ལོ་ ༡༨༢༠ ལོའི་དབྱར་ཐོག་ཏུ་གྲུབ་པས་ཁྱོན་པོད་བརྒྱ་དང་གསུམ་ལེགས་པར་གྲུབ་པར་གསུངས་སོ།།'),
      ev(1910, false, 'publication', 'important',
        'Sog Khuré (Urga) Kangyur, Mongolia',
        'སོག་ཁུ་རེའི་བཀའ་འགྱུར།',
        'Based mainly on the Derge Kangyur, carving at the great Mongolian monastery of Khuré (Riwo Gegyé Ganden Shedrub Ling) resumed in 1908 at the command of the Eighth Jetsun Dampa and was completed in 1910.',
        'སོག་པོའི་ཆོས་སྡེ་ཆེན་པོ་ཏཱ་ཁེ་རེ་ཡེ་ཆེན་མོའམ་རི་བོ་དགེ་རྒྱས་དགའ་ལྡན་བཤད་སྒྲུབ་གླིང་དུ་སྡེ་དགེའི་བཀའ་འགྱུར་ལ་གཙོ་བོ་གཞིར་བཞག་སྟེ། སླར་ཡང་ཕྱི་ལོ་ ༡༩༠༨ ལོར་ལས་འཕྲོ་མཐུད་དེ་སེར་སྐྱ་མང་པོས་འབད་བརྩོན་གྱིས་ཕྱི་ལོ་༡༩༡༠ ལོར་པར་བཞེངས་ལེགས་པར་གྲུབ་ཅིང་། དེ་ནས་པར་དུ་བསྐྲུན་པ་རྣམས་ལ་སོག་ཁེ་རེའི་བཀའ་འགྱུར་རམ། ཨུརྒ་བཀའ་འགྱུར་དུ་གྲགས་སོ།།'),
    ]),
  },
  {
    id_slug: 'twentieth-century',
    name_english: '20th Century Editions',
    name_tibetan: 'དུས་རབས་ཉི་ཤུ་པའི་པར་མ།',
    start_year: 1920,
    end_year: 2000,
    events: withOrder([
      ev(1930, true, 'publication', 'minor',
        'Wara Kangyur (206 short volumes)',
        'ཝ་རའི་བཀའ་འགྱུར།',
        'Wara Lama Damchö Tenpa, a disciple of Jamyang Loter Wangpo, produced a 206-volume short-format edition based on the Derge Kangyur at Wara hermitage in Derge.',
        'མདོ་ཁམས་སྡེ་དགེའི་ཝ་ར་རི་ཁྲོད་དུ་འཇམ་དབྱངས་བློ་གཏེར་དབང་པོའི་ཞལ་སློབ་ཝ་ར་བླ་མ་དམ་ཆོས་བསྟན་པ་མཆོག་གིས་སྡེ་དགེའི་བཀའ་འགྱུར་ཕྱི་མོར་བྱས་ཏེ། དེའི་པོད་ཆེན་གཅིག་དུམ་བུ་གཉིས་སུ་བྱས་ནས་དཔེ་ཐུང་པོད་གྲངས་ཉིས་བརྒྱ་དྲུག་གི་པར་གཞི་ཕྱི་ལོ་༡༩༣༠ཡས་མས་སུ་བཞེངས་གྲུབ་ནས་ཝ་ར་རི་ཁྲོད་དུ་བཞུགས་སུ་གསོལ་ཞིང་། དེའི་པར་མ་དག་ལ་ཝ་ར་བཀའ་འགྱུར་ཞེས་གྲགས་སོ།།'),
      ev(1934, false, 'publication', 'important',
        'Zhol / Lhasa Kangyur — the last Kangyur of Old Tibet (100 volumes)',
        'ལྷ་སའམ་ཞོལ་བཀའ་འགྱུར།',
        'Requested of the Thirteenth Dalai Lama in 1920, the 100-volume Zhol or Lhasa Kangyur was completed in 1934, its blocks kept at the Zhol printing house below the Potala.',
        'ཕྱི་ལོ་ ༡༩༢༠ ལོར་འབྲི་གུང་སྒོ་ལྕོག་སྤྲུལ་སྐུ་ངེས་དོན་བསྟན་འཛིན་ཆོས་ཀྱི་དབང་པོས་རྒྱལ་དབང་སྐུ་ཕྲེང་བཅུ་གསུམ་པ་མཆོག་ལ་ལྷ་ལྡན་དུ་རྒྱལ་བའི་བཀའ་འགྱུར་རིན་པོ་ཆེའི་པར་ཤིང་གསར་དུ་བཞེངས་རྒྱུ་བསྐུལ་མ་ཞུས་ཤིང་། ཕྱི་ལོ་ ༡༩༣༤ ལོར་པར་གཞི་རྣམས་ལེགས་པར་བཞེངས་གྲུབ་སྟེ། པར་ཤིང་རྣམས་ཕོ་བྲང་པོ་ཏ་ལའི་འདབས་ཞོལ་གྱི་པར་ཁང་དུ་བཞུགས་སུ་གསོལ་ཞིང་། དེ་ནས་པར་དུ་བཏབ་པའི་བཀའ་འགྱུར་རྣམས་ལ་ཞོལ་བཀའ་འགྱུར་རམ་ལྷ་ས་བཀའ་འགྱུར་ཞེས་གྲགས་སོ།།'),
      ev(1937, false, 'compilation', 'minor',
        'Tsekhok stone-carved Kangyur',
        'རྩེ་ཁོག་གི་བཀའ་འགྱུར་རྡོ་བརྐོས་མ།',
        'In 1937, at the direction of Jigme Yeshe Nyingpo, the faithful of the region began carving the Kangyur and Tengyur in stone at Tsekhok; after more than fifteen years, two sets of the stone-carved Kangyur were completed.',
        'ཕྱི་ལོ་ ༡༩༣༧ ལོར་རྗེ་འཇིགས་མེད་ཡེ་ཤེས་སྙིང་པོས་རྩེ་ཁོག་གཏེར་སྟོན་ཆོས་སྒར་གྱི་གདན་ས་སྐྱོང་སྐབས། རྗེ་ཉིད་ཀྱི་ཞལ་བཀོད་ལྟར་དད་ལྡན་རྣམས་ཀྱིས་མཐུན་རྐྱེན་སྦྱར་བ་ལ་བརྟེན་ནས། རྡོ་བརྐོས་ཀྱི་བཀའ་བསྟན་བཞེངས་མགོ་བརྩམས་ནས་བགྲང་བྱ་བཅོ་ལྔ་ལྷག་ཙམ་ལ་འབད་བརྩོན་གནང་མཐར་རྡོ་བརྐོས་ཀྱི་བཀའ་འགྱུར་ཚར་གཉིས་གྲུབ་བོ།།'),
      ev(1950, false, 'publication', 'minor',
        'Chamdo Yabtsang Kangyur',
        'ཆབ་མདོ་ཡབ་ཚང་བཀའ་འགྱུར།',
        'At the command of Drakyab Tokden Jamyang Lodrö Zangpo, a new edition reproducing the Zhol Kangyur was begun in 1937 by Chamdo Yabtsang Lobzang Könchog and Dechen Drolma; printing began in 1941 and was completed in 1950.',
        'ཕྱི་ལོ་ ༡༩༣༧ ལོར་ཆབ་མདོ་ཡབ་ཚང་བློ་བཟང་དཀོན་མཆོག་དང་། བཙུན་མོ་བདེ་ཆེན་སྒྲོལ་མ་རྣམ་གཉིས་ཀྱིས་མཐུན་འགྱུར་མཛད་ཐོག་ཞོལ་བཀའ་འགྱུར་པར་སློག་བགྱིས་ཏེ་པར་གཞི་གསར་དུ་བསྐྲུན་ཞིང་། ཕྱི་ལོ་ ༡༩༤༡ ལོར་པར་གཞི་དངོས་ཀྱི་དབུ་བཙུགས་ནས་མཐར་ཕྱི་ལོ་ ༡༩༥༠ ལོར་མཇུག་ལེགས་པར་གྲུབ་སྟེ། ཆབ་མདོ་དགོན་ཆེན་བྱམས་པ་གླིང་གི་ཡབ་ཚང་བཀའ་འགྱུར་དུ་བཞུགས་སུ་གསོལ་ལོ།།'),
      ev(1967, false, 'compilation', 'minor',
        'Restoration of the Bhutanese gold Kangyur',
        'འབྲུག་པ་བཀའ་འགྱུར་གསེར་བྲིས་མ་ཉམས་གསོ།',
        'After fire destroyed most of the gold Kangyur kept at Tashichö Dzong, its restoration was begun in 1966 at the command of the Third King of Bhutan, Jigme Dorji Wangchuck, and completed in 1967.',
        'ཕྱི་ལོ་ ༡༩༦༦ ལོར་འབྲུག་རྒྱལ་རབས་གསུམ་པ་ཆོས་རྒྱལ་འཇིགས་མེད་རྡོ་རྗེ་དབང་ཕྱུག་གིས་བཀའ་ལྟར། བཀའ་འགྱུར་གསེར་བྲིས་མ་ཉམས་གསོའི་ལས་ཀ་དབུ་བརྩམས་ཏེ་ཕྱི་ལོ་ ༡༩༦༧ ལ་ལེགས་པར་གྲུབ། དེ་ད་ལྟ་བཀྲིས་ཆོས་རྫོང་དུ་བཞུགས་སུ་གསོལ་ཞིང་འབྲུག་གི་བཀའ་འགྱུར་གསེར་བྲིས་མ་ཞེས་ཟེར་རོ།།'),
      ev(1977, true, 'publication', 'important',
        "Sixteenth Karmapa's Delhi reprint of the Derge 'first fruits' edition",
        'ཀརྨ་པ་བཅུ་དྲུག་པས་སྡེ་དགེ་བཀའ་འགྱུར་པར་ཕུད་མ་ལྡི་ལིར་པར་སློག་གནང་བ།',
        "In the late 1970s, His Holiness the Sixteenth Karmapa sponsored a special reprint, carried out in Delhi, of a 'par phud' or 'first fruits' edition of the Derge Kangyur that had been a treasure of the Thirteenth Karmapa.",
        'ཕྱི་ལོ་ ༡༩༧༠ ལོའི་མཇུག་ཙམ་ལ་རྒྱལ་དབང་ཀརྨ་པ་སྐུ་ཕྲེང་བཅུ་དྲུག་པ་མཆོག་གིས་ཀརྨ་པ་སྐུ་ཕྲེང་བཅུ་གསུམ་པའི་ཐུགས་དམ་རྟེན་དུ་གྱུར་པའི་སྡེ་དགེ་བཀའ་འགྱུར་པར་ཕུད་མ་ཞིག་ལྡི་ལིར་པར་སློག་བྱེད་པའི་སྦྱིན་བདག་གནང་ངོ་།།'),
      ev(1981, false, 'publication', 'major',
        'Nyingma Edition of the Kangyur and Tengyur (Dharma Publishing)',
        'བཀའ་འགྱུར་བསྟན་འགྱུར་རྙིང་མའི་པར་གཞི། (དྷརྨ་པར་ཁང་།)',
        'Created by Tarthang Rinpoche and his students in Berkeley, CA as a backstop against the Canon’s disappearance: an augmented facsimile of the Derge block print that added to its 1,141 titles numerous texts not found in that edition, in 36 atlas-sized volumes. Sets were offered to libraries in Japan, Mongolia, Australia, India, Bhutan, China, Nepal and elsewhere — fourteen countries in all.',
        'ཕྱི་ལོ་༡༩༨༠ལོར་སྡེ་དགེ་བཀའ་འགྱུར་ཚར་གྲངས་བརྒྱ་དང་བརྒྱད་པར་སློག་བགྱིས་ནས་དེབ་ཆེན་པོད་གྲངས་སུམ་ཅུ་སོ་དྲུག་གི་རྣམ་པར་བཞེངས་ཏེ། རྒྱལ་ཁབ་བཅུ་བཞིའི་ནང་དུ། ས་གནས་དང་དཔེ་མཛོད་ཁང་དང་ཆོས་ཚོགས་དགོན་སྡེ་བཅས་ལ་རིག་གཞུང་སྲུང་སྐྱོབ་སོགས་ཀྱི་ཆེད་ཕྱི་ལོ་ ༡༩༨༠ ནས་དབུ་བཙུགས་ཏེ་ཕུལ་ཡོད།'),
      ev(1989, false, 'publication', 'important',
        'Nyingma Monlam Chenmo and free distribution of sacred texts',
        'རྙིང་མ་སྨོན་ལམ་ཆེན་མོ་དང་གསུང་རབ་རིན་མེད་འགྲེམས་སྤེལ།',
        'Founded in Bodh Gaya in 1989, the Nyingma Monlam Chenmo became a key site for the free distribution of more than 20,000 individual sacred texts compiled and printed by the Yeshe De Project — about five and a half million books reaching more than three thousand monasteries, nunneries, retreat places and Dharma centers.',
        'ཕྱི་ལོ་ ༡༩༨༩ ལོར་རྡོ་རྗེ་གདན་དུ་རྙིང་མ་སྨོན་ལམ་ཆེན་མོ་དབུ་བཙུགས་ཤིང་། ཡེ་ཤེས་སྡེ་ལས་གཞིས་བསྒྲིགས་པའི་གསུང་རབ་ཆོས་ཚན་ཁྲི་ཕྲག་གཉིས་ལྷག་ལས་གྲུབ་པའི་དཔེ་དེབ་ས་ཡ་ལྔ་དང་ཕྱེད་ཙམ་དགོན་སྡེ་དང་། བཙུན་དགོན། སྒྲུབ་སྡེ། ཆོས་ཚོགས་སུམ་སྟོང་ལྷག་ལ་རིན་མེད་དུ་འགྲེམས་སྤེལ་བྱས་སོ།།'),
      ev(1998, false, 'compilation', 'important',
        'Pedurma comparative Kangyur project begins',
        'བཀའ་འགྱུར་དཔེ་བསྡུར་མའི་ལས་གཞི་དབུ་བརྩམས་པ།',
        'At the end of 1998, work began on the comparative edition (dpe bsdur ma) of the Kangyur, using the Derge as base text and collating it against other block-print editions such as the Yongle, Lithang and Peking.',
        'སྤྱི་ལོ་༡༩༩༨ ལོའི་ལོ་མཇུག་ནས་བཀའ་འགྱུར་དཔེ་བསྡུར་གྱི་དབུ་བརྩམས་སོ།།'),
    ]),
  },
  {
    id_slug: 'twenty-first-century',
    name_english: '21st Century Digital Editions',
    name_tibetan: 'བཀའ་འགྱུར་འཕྲུལ་པར་མ།',
    start_year: 2000,
    end_year: 2025,
    events: withOrder([
      ev(2002, false, 'publication', 'important',
        'Typeset Derge Kangyur — 5,000 sets offered (2000–2011)',
        'སྡེ་དགེ་བཀའ་འགྱུར་འཕྲུལ་པར་མ། ཚར་ལྔ་སྟོང་ཆོས་སྦྱིན། (༢༠༠༠–༢༠༡༡)',
        'Between 2000 and 2011, Tarthang Rinpoche produced and freely offered 5,000 sets of a typeset Kangyur based on the Derge block print, in 120 pothi-format volumes following the Derge arrangement.',
        'སྐྱབས་རྗེ་དར་ཐང་རིན་པོ་ཆེ་མཆོག་གིས་ཕྱི་ལོ་ ༢༠༠༠ ལོ་ནས་ ༢༠༡༡ བར་སྡེ་དགེའི་པར་མ་ཕྱི་མོར་བྱས་པའི་བཀའ་འགྱུར་ཚར་ལྔ་སྟོང་བཞེངས་ནས་ཆོས་སྦྱིན་གནང་ཞིང་། འདི་དཔེ་རིང་གི་རྣམ་པར་བཞེངས་ཤིང་པོད་གྲངས་བརྒྱ་དང་ཉི་ཤུ་མཆིས་ལ་ཆོས་ཚན་བཞུགས་རིམ་དག་སྡེ་དགེ་ཇི་བཞིན་ནོ།།'),
      ev(2009, false, 'publication', 'major',
        'Pedurma Comparative Kangyur (108 volumes)',
        'བཀའ་འགྱུར་དཔེ་བསྡུར་མ། (པོད་ ༡༠༨)',
        'Produced between 2006 and 2009 and printed in Chengdu, this Derge-lineage edition lists text variants from eight distinct block-print recensions of the Kangyur.',
        'བཀའ་འགྱུར་དཔེ་བསྡུར་མ་ནི། བོད་ཡིག་གི་བཀའ་འགྱུར་ཤིང་པར་མ་དཔེ་ཁག་བརྒྱད་ལས། སྡེ་དགེའི་བཀའ་འགྱུར་ནི་ཡིག་གཟུགས་ལེགས་ཤིང་ཡིག་སྐྱོན་ཉུང་བ། གྲགས་ཆེ་ཞིང་ཀུན་གྱིས་ཁས་ལེན་པ་སོགས་རྒྱུ་མཚན་དུ་མས་འདིར་བསྡུར་གཞིའམ་མ་ཕྱིར་བཟུང་བ་དང་། གཞན་པར་མ་ཁག་བདུན་ནི་སྡུར་བྱེད་པར་མར་བྱས་ནས་དཔེ་བསྡུར་བྱས་པ་ཡིན་ནོ།།'),
      ev(2010, false, 'compilation', 'minor',
        'Chakpori stone-carved Kangyur, Lhasa (1995–2010)',
        'ལྕགས་པོ་རིའི་བཀའ་འགྱུར་རྡོ་བརྐོས་མ།',
        'Beginning in 1995, Lama Tokden Dawa undertook the carving of a stone Kangyur on Chakpori hill in Lhasa, completed in 2010.',
        'ཕྱི་ལོ་ ༡༩༩༥ ལོའི་ས་ག་ཟླ་བའི་ཚེས་ ༡༠ ནས་བླ་མ་རྟོགས་ལྡན་ཟླ་བས་ལྷ་ས་ལྕགས་པོ་རི་ལ་རྒྱལ་བ་སྲས་དང་བཅས་པ་ཐམས་ཅད་ཀྱི་གསུང་གི་རྟེན་རྡོ་བརྐོས་བཀའ་འགྱུར་རིན་པོ་ཆེ་བཞེང་རྒྱུའི་འགན་བཞེས་ཏེ་དབུ་བརྩམས་ནས་ཕྱི་ལོ་ ༢༠༡༠ ལ་འགྲུབ་པར་སྣང་ངོ་།།'),
      ev(2011, false, 'publication', 'minor',
        'Reprints of the Narthang and Tog Palace Kangyurs distributed',
        'སྣར་ཐང་དང་ཏོག་པར་མའི་བཀའ་འགྱུར་པར་སློག་ཆོས་སྦྱིན།',
        'In 2010, 900 sets of the Narthang Kangyur were reprinted, and in 2012, 1,000 sets of the Tog Palace Kangyur, offered freely to monasteries and study centers of all traditions.',
        'ཕྱི་ལོ་ ༢༠༡༠ ལོར་སྣར་ཐང་པར་མ་ཚར་གྲངས་དགུ་བརྒྱ་དང་། ཕྱི་ལོ་ ༢༠༡༢ ལོར་ཏོག་པར་མ་ཚར་གྲངས་གཅིག་སྟོང་རྣམས་པར་སློག་བགྱིས་ནས་རིས་མེད་ཀྱི་ཆོས་སྒར་ཁག་དང་། སློབ་གཉེར་ཁང་སོགས་ལ་ཆོས་སྦྱིན་གནང་ངོ་།།'),
      ev(2012, false, 'publication', 'major',
        'Yeshe De Yidzhin Norbu Kangyur (133 volumes)',
        'བཀའ་འགྱུར་ཡིད་བཞིན་ནོར་བུ། (པོད་ ༡༣༣)',
        'A new typeset augmented Derge Kangyur in 133 Western-style volumes, supplemented from the Peking, Narthang and Pedurma editions, including sixteen historic karchags and the reu mik comparative tables drawn from sixteen canonical collections. 3,000 sets were printed and distributed.',
        'སྐྱབས་རྗེ་དར་ཐང་རིན་པོ་ཆེ་ཀུན་དགའ་དགེ་ལེགས་ཡེ་ཤེས་རྡོ་རྗེ་མཆོག་གིས་ཕྱི་ལོ་ ༢༠༡༣ ལོར་སྡེ་དགེ་བཀའ་འགྱུར་མ་ཕྱི་བྱས་ཤིང་། པེ་ཅིན་དང་། སྣར་ཐང་། དཔེ་བསྡུར་མ་སོགས་ནས་ཁ་བསྐངས་ཏེ་མཚན་ལ་བཀའ་འགྱུར་ཡིད་བཞིན་ནོར་བུ་ཞེས་གསོལ་པའི་དེབ་གཟུགས་སྤུས་ལེགས་ཀྱི་རྣམ་པར་བཀའ་འགྱུར་ཚར་སུམ་སྟོང་པར་བསྐྲུན་གནང་ནས་རིས་སུ་མ་ཆད་པའི་ཆོས་སྒར་སོགས་ལ་ཆོས་སྦྱིན་རྒྱ་ཆེར་གནང་ངོ་།།'),
      ev(2016, false, 'publication', 'important',
        "Seventeenth Karmapa's digital edition of the Lithang/Jang Kangyur",
        'ཀརྨ་པ་བཅུ་བདུན་པས་ལི་ཐང་བཀའ་འགྱུར་གློག་རྡུལ་པར་མ་བསྐྲུན་པ།',
        'In 2016, continuing the work of his predecessor, His Holiness the Seventeenth Karmapa published a digital edition of the Lithang/Jang Kangyur.',
        'ཕྱི་ལོ་ ༢༠༡༦ ལོར་རྒྱལ་དབང་ཀརྨ་པ་སྐུ་ཕྲེང་བཅུ་བདུན་པ་མཆོག་གིས་སྐུ་ཕྲེང་སྔ་མའི་མཛད་རྗེས་མུ་མཐུད་དེ་ལི་ཐང་ངམ་འཇང་བཀའ་འགྱུར་གྱི་གློག་རྡུལ་པར་མ་ཞིག་པར་དུ་བསྐྲུན་ནོ།།'),
      ev(2023, false, 'publication', 'important',
        'Yidzhin Norbu Kangyur re-released in pothi format',
        'བཀའ་འགྱུར་ཡིད་བཞིན་ནོར་བུ་དཔེ་རིང་རྣམ་པར་བསྐྱར་བཞེངས།',
        'The Yidzhin Norbu Kangyur was re-released in a traditional loose-leaf (pothi) version, with 1,000 sets produced and offered freely.',
        'ཕྱི་ལོ་ ༢༠༢༣ ལོར་བཀའ་འགྱུར་དེ་ཉིད་དཔེ་རིང་གི་རྣམ་པར་ཚར་གཅིག་སྟོང་ཐམ་པ་བཞེངས་ནས་ཆོས་སྦྱིན་གནང་ཞིང་། སྡེ་ཚན་བཞུགས་རིམ་སྔ་མ་བཞིན་ལ་པོད་གྲངས་བརྒྱ་དང་ཉི་ཤུ་མཆིས་སོ།།'),
      ev(2025, false, 'publication', 'major',
        '14,008 Kangyur sets offered worldwide (1980–2025)',
        'བཀའ་འགྱུར་ཚར་ ༡༤༠༠༨ འཛམ་གླིང་ཡོངས་སུ་ཆོས་སྦྱིན། (༡༩༨༠–༢༠༢༥)',
        'From 1980 to 2025, through reprints of the Derge, Tog and Narthang editions and the Yeshe De typeset editions, 14,008 sets of the Kangyur were offered free of charge throughout the world.',
        'ཕྱི་ལོ་ ༡༩༨༠ ནས་ ༢༠༢༥ བར། སྡེ་དགེ་དང་། ཏོག །སྣར་ཐང་པར་མ་རྣམས་པར་སློག་དང་། ཡེ་ཤེས་སྡེ་འཕྲུལ་པར་བཅས་བཀའ་འགྱུར་ཚར་༡༤༠༠༨འཛམ་གླིང་ས་ཕྱོགས་གང་སར་རིན་མེད་དུ་ཆོས་སྦྱིན་གནང་ངོ་།།'),
    ]),
  },
];

async function seedTimeline() {
  try {
    console.log('Starting timeline seed...');

    // Clear existing timeline data
    console.log('Clearing existing timeline data...');
    await prisma.timelineEvent.deleteMany({});
    await prisma.timelinePeriod.deleteMany({});

    // Create periods and events
    for (const periodData of timelineData) {
      const { events, ...periodFields } = periodData;
      
      console.log(`Creating period: ${periodFields.name_english}`);
      const period = await prisma.timelinePeriod.create({
        data: periodFields
      });

      // Create events for this period
      for (const eventData of events) {
        await prisma.timelineEvent.create({
          data: {
            ...eventData,
            period_id: period.id,
            era: 'CE'
          }
        });
      }

      console.log(`  Created ${events.length} events for ${periodFields.name_english}`);
    }

    console.log('Timeline seed completed successfully!');
    console.log(`Created ${timelineData.length} periods`);
    const totalEvents = timelineData.reduce((sum, p) => sum + p.events.length, 0);
    console.log(`Created ${totalEvents} events`);
  } catch (error) {
    console.error('Error seeding timeline:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  seedTimeline()
    .then(() => {
      console.log('Seeder completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeder failed:', error);
      process.exit(1);
    });
}

module.exports = { seedTimeline };
