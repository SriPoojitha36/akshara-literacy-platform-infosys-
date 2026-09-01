const $ = (s) => document.querySelector(s);
const forms = { register: $('#registerForm'), login: $('#loginForm'), forgot: $('#forgotForm'), reset: $('#resetForm') };

// Baseline literacy checks. Labels are intentionally simple; values are stable
// answer keys so the server can score the assessment without trusting the UI.
const baselineChecks = {
  English: { greeting: 'Hello', water: 'Water', home: 'Home', minutes: '5 minutes', story: 'Ravi reads for 5 minutes every morning.', question: 'How long does Ravi read?', wrong: ['15 minutes', '1 hour'] },
  Hindi: { greeting: 'नमस्ते', water: 'पानी', home: 'घर', minutes: '5 मिनट', story: 'रवि हर सुबह 5 मिनट पढ़ता है।', question: 'रवि कितने मिनट पढ़ता है?', wrong: ['10 मिनट', '1 घंटा'] },
  Telugu: { greeting: 'నమస్కారం', water: 'నీరు', home: 'ఇల్లు', minutes: '5 నిమిషాలు', story: 'రవి ప్రతి ఉదయం 5 నిమిషాలు చదువుతాడు.', question: 'రవి ఎన్ని నిమిషాలు చదువుతాడు?', wrong: ['10 నిమిషాలు', '1 గంట'] },
  Tamil: { greeting: 'வணக்கம்', water: 'நீர்', home: 'வீடு', minutes: '5 நிமிடங்கள்', story: 'ரவி தினமும் காலை 5 நிமிடங்கள் படிக்கிறார்.', question: 'ரவி எத்தனை நிமிடங்கள் படிக்கிறார்?', wrong: ['10 நிமிடங்கள்', '1 மணி நேரம்'] },
  Kannada: { greeting: 'ನಮಸ್ಕಾರ', water: 'ನೀರು', home: 'ಮನೆ', minutes: '5 ನಿಮಿಷ', story: 'ರವಿ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ 5 ನಿಮಿಷ ಓದುತ್ತಾನೆ.', question: 'ರವಿ ಎಷ್ಟು ನಿಮಿಷ ಓದುತ್ತಾನೆ?', wrong: ['10 ನಿಮಿಷ', '1 ಗಂಟೆ'] },
  Malayalam: { greeting: 'നമസ്കാരം', water: 'വെള്ളം', home: 'വീട്', minutes: '5 മിനിറ്റ്', story: 'രവി എല്ലാ രാവിലെയും 5 മിനിറ്റ് വായിക്കുന്നു.', question: 'രവി എത്ര മിനിറ്റ് വായിക്കുന്നു?', wrong: ['10 മിനിറ്റ്', '1 മണിക്കൂർ'] },
  Bengali: { greeting: 'নমস্কার', water: 'জল', home: 'ঘর', minutes: '৫ মিনিট', story: 'রবি প্রতিদিন সকালে ৫ মিনিট পড়ে।', question: 'রবি কত মিনিট পড়ে?', wrong: ['১০ মিনিট', '১ ঘণ্টা'] },
  Marathi: { greeting: 'नमस्कार', water: 'पाणी', home: 'घर', minutes: '५ मिनिटे', story: 'रवी रोज सकाळी ५ मिनिटे वाचतो.', question: 'रवी किती मिनिटे वाचतो?', wrong: ['१० मिनिटे', '१ तास'] }
};

function baselineFor(language) {
  return baselineChecks[language] || baselineChecks.English;
}

const questions = [
  {
    key: 'language',
    title: () => 'Which regional language would you like to learn?',
    help: () => 'Select your preferred language. All assessment questions and literacy lessons will adapt to your selection.',
    options: ['Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Marathi']
  },
  {
    key: 'focus',
    title: (lang) => `What would you like to improve in ${lang}?`,
    help: (lang) => `Choose the primary skill you want to focus on for ${lang}.`,
    options: ['Reading', 'Writing', 'Speaking', 'Everyday communication']
  },
  {
    key: 'reading',
    title: (lang) => `How comfortable are you reading in ${lang}?`,
    help: (lang) => `For example, reading signs, labels, or short sentences in ${lang}.`,
    options: ['Not yet', 'A little', 'Comfortable']
  },
  {
    key: 'writing',
    title: (lang) => `How comfortable are you writing in ${lang}?`,
    help: (lang) => `For example, writing your name, messages, or sentences in ${lang}.`,
    options: ['Not yet', 'A little', 'Comfortable']
  },
  {
    key: 'confidence',
    title: (lang) => `How do you feel about learning ${lang}?`,
    help: (lang) => `There is no wrong answer — Akshara supports you at every step.`,
    options: ['I need lots of support', 'I am ready to try', 'I feel confident']
  },
  {
    key: 'daily_time',
    title: (lang) => `How much time can you practice ${lang} each day?`,
    help: (lang) => `Small, regular practice creates real progress in ${lang}.`,
    options: ['5 minutes', '10 minutes', '15 minutes or more']
  },
  {
    key: 'reading_check',
    title: (lang) => `Reading check: choose the greeting in ${lang}`,
    help: () => 'This short activity helps us understand your starting reading level.',
    options: (lang) => {
      const words = baselineFor(lang);
      return [{ label: words.greeting, value: 'correct' }, { label: words.water, value: 'water' }, { label: words.home, value: 'home' }];
    }
  },
  {
    key: 'writing_check',
    kind: 'text',
    title: (lang) => `Writing check in ${lang}`,
    help: (lang) => `Type the greeting word shown here: ${baselineFor(lang).greeting}`,
    placeholder: (lang) => `Type ${baselineFor(lang).greeting}`
  },
  {
    key: 'comprehension_check',
    title: (lang) => baselineFor(lang).question,
    help: (lang) => `Read this short passage in ${lang}, then choose the answer.`,
    passage: (lang) => baselineFor(lang).story,
    options: (lang) => {
      const words = baselineFor(lang);
      return [{ label: words.minutes, value: 'correct' }, { label: words.wrong[0], value: 'wrong-one' }, { label: words.wrong[1], value: 'wrong-two' }];
    }
  }
];

const langCodes = {
  Hindi: 'hi-IN',
  English: 'en-US',
  Telugu: 'te-IN',
  Tamil: 'ta-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Bengali: 'bn-IN',
  Marathi: 'mr-IN'
};

// ----------------------------------------------------
// DYNAMIC QUESTION POOLS FOR ALL REGIONAL LANGUAGES
// ----------------------------------------------------
const rawPuzzleSets = {
  Hindi: [
    { title: 'Word match', prompt: 'Which Hindi word means “Hello / Greetings”?', options: ['नमस्ते', 'किताब', 'घर'], correct: 'नमस्ते', hint: 'Common Indian greeting with folded hands.' },
    { title: 'Letter puzzle', prompt: 'Choose the first letter in “आम” (mango).', options: ['आ', 'म', 'क'], correct: 'आ', hint: 'It is the long "A" vowel sound in Hindi.' },
    { title: 'Object identification', prompt: 'Which word means “Water” in Hindi?', options: ['पानी', 'हवा', 'आग'], correct: 'पानी', hint: 'Essential drink for life.' },
    { title: 'Opposite word', prompt: 'What is the opposite of “दिन” (day)?', options: ['रात', 'सुबह', 'दोपहर'], correct: 'रात', hint: 'When stars appear in the sky.' },
    { title: 'Sentence puzzle', prompt: 'Complete: “यह एक _____ है।” (This is a book).', options: ['किताब', 'पानी', 'आकाश'], correct: 'किताब', hint: 'Item used for reading.' }
  ],
  English: [
    { title: 'Word match', prompt: 'Which word is used to greet someone?', options: ['Hello', 'Book', 'Table'], correct: 'Hello', hint: 'Used when meeting someone.' },
    { title: 'Letter puzzle', prompt: 'Which letter comes after A in English?', options: ['B', 'C', 'D'], correct: 'B', hint: 'Second letter of English alphabet.' },
    { title: 'Object identification', prompt: 'Which word means liquid we drink?', options: ['Water', 'Paper', 'Stone'], correct: 'Water', hint: 'Clear drinking liquid.' },
    { title: 'Opposite word', prompt: 'What is the opposite of “Day”?', options: ['Night', 'Morning', 'Noon'], correct: 'Night', hint: 'When stars shine in sky.' },
    { title: 'Sentence puzzle', prompt: 'Complete: “This is a good _____.”', options: ['Book', 'Water', 'Sky'], correct: 'Book', hint: 'Item used for reading.' }
  ],
  Telugu: [
    { title: 'Word match', prompt: 'Which Telugu word means “Hello / Greetings”?', options: ['నమస్కారం', 'పుస్తకం', 'ఇల్లు'], correct: 'నమస్కారం', hint: 'Respectful Telugu greeting.' },
    { title: 'Letter puzzle', prompt: 'Choose the first letter in “అమ్మ” (mother).', options: ['అ', 'క', 'మ'], correct: 'అ', hint: 'The first vowel in Telugu alphabet.' },
    { title: 'Object identification', prompt: 'Which word means “Water” in Telugu?', options: ['నీరు', 'గాలి', 'నిప్పు'], correct: 'నీరు', hint: 'Essential drinking liquid.' },
    { title: 'Opposite word', prompt: 'What is the opposite of “పగలు” (day)?', options: ['రాత్రి', 'ఉదయం', 'సాయంత్రం'], correct: 'రాత్రి', hint: 'Nighttime in Telugu.' },
    { title: 'Sentence puzzle', prompt: 'Complete: “ఇది నా _____.” (This is my home).', options: ['ఇల్లు', 'నీరు', 'ఆకాశం'], correct: 'ఇల్లు', hint: 'Place where family lives.' }
  ],
  Tamil: [
    { title: 'Word match', prompt: 'Which Tamil word means “Hello / Greetings”?', options: ['வணக்கம்', 'புத்தகம்', 'வீடு'], correct: 'வணக்கம்', hint: 'Classic Tamil greeting.' },
    { title: 'Letter puzzle', prompt: 'Choose the first letter in “அம்மா” (mother).', options: ['அ', 'க', 'ம'], correct: 'அ', hint: 'First vowel sound in Tamil.' },
    { title: 'Object identification', prompt: 'Which word means “Water” in Tamil?', options: ['நீர்', 'காற்று', 'நெருப்பு'], correct: 'நீர்', hint: 'Essential drinking liquid.' },
    { title: 'Opposite word', prompt: 'What is the opposite of “பகல்” (day)?', options: ['இரவு', 'காலை', 'மாலை'], correct: 'இரவு', hint: 'Nighttime in Tamil.' },
    { title: 'Sentence puzzle', prompt: 'Complete: “இது என் _____.” (This is my book).', options: ['புத்தகம்', 'நீர்', 'வானம்'], correct: 'புத்தகம்', hint: 'Used for reading and study.' }
  ],
  Kannada: [
    { title: 'Word match', prompt: 'Which Kannada word means “Hello / Greetings”?', options: ['ನಮಸ್ಕಾರ', 'ಪುಸ್ತಕ', 'ಮನೆ'], correct: 'ನಮಸ್ಕಾರ', hint: 'Traditional Kannada greeting.' },
    { title: 'Letter puzzle', prompt: 'Choose the first letter in “ಅಮ್ಮ” (mother).', options: ['ಅ', 'ಕ', 'ಮ'], correct: 'ಅ', hint: 'First letter sound in Kannada.' },
    { title: 'Object identification', prompt: 'Which word means “Water” in Kannada?', options: ['ನೀರು', 'ಗಾಳಿ', 'ಬೆಂಕಿ'], correct: 'ನೀರು', hint: 'Essential drinking liquid.' },
    { title: 'Opposite word', prompt: 'What is the opposite of “ಹಗಲು” (day)?', options: ['ರಾತ್ರಿ', 'ಬೆಳಿಗ್ಗೆ', 'ಸಂಜೆ'], correct: 'ರಾತ್ರಿ', hint: 'Nighttime in Kannada.' },
    { title: 'Sentence puzzle', prompt: 'Complete: “ಇದು ನನ್ನ _____.” (This is my house).', options: ['ಮನೆ', 'ನೀರು', 'ಆಕಾಶ'], correct: 'ಮನೆ', hint: 'Home where you sleep.' }
  ],
  Malayalam: [
    { title: 'Word match', prompt: 'Which Malayalam word means “Hello / Greetings”?', options: ['നമസ്കാരം', 'പുസ്തകം', 'വീട്'], correct: 'നമസ്കാരം', hint: 'Traditional Malayalam greeting.' },
    { title: 'Letter puzzle', prompt: 'Choose the first letter in “അമ്മ” (mother).', options: ['അ', 'ക', 'മ'], correct: 'അ', hint: 'First letter of Malayalam alphabet.' },
    { title: 'Object identification', prompt: 'Which word means “Water” in Malayalam?', options: ['വെള്ളം', 'കാറ്റ്', 'തീ'], correct: 'വെള്ളം', hint: 'Clear liquid for drinking.' },
    { title: 'Opposite word', prompt: 'What is the opposite of “പകൽ” (day)?', options: ['രാത്രി', 'രാവിലെ', 'വൈകുന്നേരം'], correct: 'രാത്രി', hint: 'Nighttime in Malayalam.' },
    { title: 'Sentence puzzle', prompt: 'Complete: “ഇത് എന്റെ _____ ആണ്.” (This is my house).', options: ['വീട്', 'വെള്ളം', 'ആകാശം'], correct: 'വീട്', hint: 'Place where family lives.' }
  ],
  Bengali: [
    { title: 'Word match', prompt: 'Which Bengali word means “Hello / Greetings”?', options: ['নমস্কার', 'বই', 'ঘর'], correct: 'নমস্কার', hint: 'Bengali greeting phrase.' },
    { title: 'Letter puzzle', prompt: 'Choose the letter in “আম” (mango).', options: ['আ', 'ম', 'ক'], correct: 'আ', hint: 'First vowel in Bengali.' },
    { title: 'Object identification', prompt: 'Which word means “Water” in Bengali?', options: ['জল', 'বাতাস', 'আগুন'], correct: 'জল', hint: 'Essential drink.' },
    { title: 'Opposite word', prompt: 'What is the opposite of “দিন” (day)?', options: ['রাত', 'সকাল', 'দুপুর'], correct: 'রাত', hint: 'Nighttime in Bengali.' },
    { title: 'Sentence puzzle', prompt: 'Complete: “এটি একটি _____।” (This is a book).', options: ['বই', 'জল', 'আকাশ'], correct: 'বই', hint: 'Reading item.' }
  ],
  Marathi: [
    { title: 'Word match', prompt: 'Which Marathi word means “Hello / Greetings”?', options: ['नमस्कार', 'पुस्तक', 'घर'], correct: 'नमस्कार', hint: 'Marathi greeting word.' },
    { title: 'Letter puzzle', prompt: 'Choose the letter in “आंबा” (mango).', options: ['आ', 'म', 'क'], correct: 'आ', hint: 'Vowel letter A.' },
    { title: 'Object identification', prompt: 'Which word means “Water” in Marathi?', options: ['पाणी', 'हवा', 'आग'], correct: 'पाणी', hint: 'Liquid for drinking.' },
    { title: 'Opposite word', prompt: 'What is the opposite of “दिवस” (day)?', options: ['रात्र', 'सकाळ', 'संध्याकाळ'], correct: 'रात्र', hint: 'Nighttime in Marathi.' },
    { title: 'Sentence puzzle', prompt: 'Complete: “हे माझे _____ आहे.” (This is my house).', options: ['घर', 'पाणी', 'आकाश'], correct: 'घर', hint: 'Home place.' }
  ],
  default: [
    { title: 'Word match', prompt: 'Which word is a greeting?', options: ['Hello', 'Book', 'Table'], correct: 'Hello', hint: 'Used when meeting someone.' },
    { title: 'Letter puzzle', prompt: 'Which letter comes after A?', options: ['B', 'C', 'D'], correct: 'B', hint: 'Second letter of alphabet.' },
    { title: 'Object identification', prompt: 'Which word means liquid we drink?', options: ['Water', 'Paper', 'Stone'], correct: 'Water', hint: 'Clear liquid.' },
    { title: 'Opposite word', prompt: 'What is the opposite of “Day”?', options: ['Night', 'Morning', 'Noon'], correct: 'Night', hint: 'When stars shine.' }
  ]
};

// ----------------------------------------------------
// COMPLETE 5-PILLAR CONTENT FOR ALL 8 LANGUAGES
// ----------------------------------------------------
const pillarData = {
  Hindi: {
    reading: [
      { title: '📖 Passage 1: Greetings & Identity', text: 'नमस्ते! मेरा नाम प्रिया है। मैं रोज़ नया शब्द सीखती हूँ।', help: 'Listen to the passage and practice reading out loud.' },
      { title: '📖 Passage 2: Daily Environment', text: 'सुबह की धूप बहुत अच्छी होती है। पेड़-पौधे ताज़ी हवा देते हैं।', help: 'Listen to the passage and practice reading out loud.' },
      { title: '📖 Passage 3: Learning Journey', text: 'हर नया शब्द एक नया रास्ता खोलता है। पढ़ना-लिखना आसान है।', help: 'Listen to the passage and practice reading out loud.' }
    ],
    writing: [
      { prompt: 'Write the Hindi word for "Hello"', target: 'नमस्ते', help: 'Type the Hindi greeting word.' },
      { prompt: 'Write the Hindi word for "Book"', target: 'किताब', help: 'Type the Hindi word for reading material.' },
      { prompt: 'Write the Hindi word for "Water"', target: 'पानी', help: 'Type the Hindi word for drinking liquid.' }
    ],
    vocab: [
      [
        { word: 'नमस्ते (Namaste)', meaning: 'Hello / Greetings' },
        { word: 'किताब (Kitab)', meaning: 'Book' },
        { word: 'पानी (Paani)', meaning: 'Water' },
        { word: 'घर (Ghar)', meaning: 'Home' }
      ],
      [
        { word: 'सूरज (Suraj)', meaning: 'Sun' },
        { word: 'पेड़ (Ped)', meaning: 'Tree' },
        { word: 'दोस्त (Dost)', meaning: 'Friend' },
        { word: 'समय (Samay)', meaning: 'Time' }
      ]
    ],
    comprehension: [
      { story: 'प्रिया रोज़ सुबह 5 मिनट पढ़ाई करती है। वह नए शब्द लिखती है।', question: 'प्रिया रोज़ कितने मिनट पढ़ाई करती है?', options: ['5 मिनट', '10 मिनट', '1 घंटा'], correct: '5 मिनट' },
      { story: 'अमित रोज़ बाज़ार से ताज़े फल लाता है। उसे सेब बहुत पसंद हैं।', question: 'अमित को कौन सा फल पसंद है?', options: ['सेब', 'आम', 'केला'], correct: 'सेब' }
    ],
    activities: [
      { title: 'Letter Assembly', prompt: 'Form the word for Home: घ + र', options: ['घर', 'मगर', 'कमल'], correct: 'घर' },
      { title: 'Word Choice', prompt: 'Which word means "Water"?', options: ['पानी', 'अग्नि', 'हवा'], correct: 'पानी' }
    ]
  },
  English: {
    reading: [
      { title: '📖 Passage 1: Welcome to Akshara', text: 'Hello! Welcome to Akshara. Learning new words helps us communicate every day.', help: 'Listen to the passage and practice reading out loud.' },
      { title: '📖 Passage 2: Daily Reading Habit', text: 'Reading a short passage every day builds vocabulary and boosts your confidence.', help: 'Listen to the passage and practice reading out loud.' },
      { title: '📖 Passage 3: Power of Knowledge', text: 'Every book opens a doorway to new ideas, opportunities, and essential skills.', help: 'Listen to the passage and practice reading out loud.' }
    ],
    writing: [
      { prompt: 'Write the English word for greeting', target: 'Hello', help: 'Type the word used to greet others.' },
      { prompt: 'Write the English word for reading material', target: 'Book', help: 'Type the word for bound pages.' },
      { prompt: 'Write the English word for drinking liquid', target: 'Water', help: 'Type the essential daily drink.' }
    ],
    vocab: [
      [
        { word: 'Hello', meaning: 'Greeting used to start a conversation' },
        { word: 'Book', meaning: 'Pages bound together for reading' },
        { word: 'Water', meaning: 'Essential clear liquid for drinking' },
        { word: 'Home', meaning: 'The place where one lives with family' }
      ]
    ],
    comprehension: [
      { story: 'Priya reads for 5 minutes every morning. She learns one new word each day.', question: 'How much time does Priya read every morning?', options: ['5 minutes', '15 minutes', '1 hour'], correct: '5 minutes' },
      { story: 'Amit buys fresh apples from the market every afternoon.', question: 'What does Amit buy from the market?', options: ['Apples', 'Bananas', 'Oranges'], correct: 'Apples' }
    ],
    activities: [
      { title: 'Letter Assembly', prompt: 'Select the letter that comes after A', options: ['B', 'C', 'D'], correct: 'B' },
      { title: 'Word Match', prompt: 'Which word is a greeting?', options: ['Hello', 'Table', 'Window'], correct: 'Hello' }
    ]
  },
  Telugu: {
    reading: [
      { title: '📖 Passage 1: Greetings & Identity', text: 'నమస్కారం! నా పేరు ప్రియ. నేను రోజూ క్రొత్త పదం నేర్చుకుంటాను.', help: 'Listen to the Telugu passage and practice reading out loud.' },
      { title: '📖 Passage 2: Learning Habit', text: 'రోజూ కొద్దిగా చదవడం వల్ల జ్ఞానం పెరుగుతుంది.', help: 'Practice reading this Telugu passage.' }
    ],
    writing: [
      { prompt: 'Write the Telugu word for "Hello / Greetings"', target: 'నమస్కారం', help: 'Type the Telugu greeting.' },
      { prompt: 'Write the Telugu word for "Book"', target: 'పుస్తకం', help: 'Type the Telugu word for book.' },
      { prompt: 'Write the Telugu word for "Water"', target: 'నీరు', help: 'Type the Telugu word for water.' }
    ],
    vocab: [
      [
        { word: 'నమస్కారం (Namaskaram)', meaning: 'Hello / Greetings' },
        { word: 'పుస్తకం (Pustakam)', meaning: 'Book' },
        { word: 'నీరు (Neeru)', meaning: 'Water' },
        { word: 'ఇల్లు (Illu)', meaning: 'Home' }
      ]
    ],
    comprehension: [
      { story: 'ప్రియ రోజూ ఉదయం 5 నిమిషాలు చదువుకుంటుంది. ఆమె కొత్త పదాలు రాస్తుంది.', question: 'ప్రియ రోజూ ఎన్ని నిమిషాలు చదువుకుంటుంది?', options: ['5 నిమిషాలు', '10 నిమిషాలు', '1 గంట'], correct: '5 నిమిషాలు' }
    ],
    activities: [
      { title: 'Word Assembly', prompt: 'Select the Telugu word for Water', options: ['నీరు', 'అగ్ని', 'గాలి'], correct: 'నీరు' }
    ]
  },
  Tamil: {
    reading: [
      { title: '📖 Passage 1: Greetings & Identity', text: 'வணக்கம்! என் பெயர் பிரியா. நான் தினமும் புதிய சொற்களைக் கற்கிறேன்.', help: 'Listen to the Tamil passage and practice reading out loud.' },
      { title: '📖 Passage 2: Daily Habit', text: 'தினமும் வாசிப்பது நம் அறிவை வளர்க்கும்.', help: 'Practice reading this Tamil passage.' }
    ],
    writing: [
      { prompt: 'Write the Tamil word for "Hello / Greetings"', target: 'வணக்கம்', help: 'Type the Tamil greeting.' },
      { prompt: 'Write the Tamil word for "Book"', target: 'புத்தகம்', help: 'Type the Tamil word for book.' },
      { prompt: 'Write the Tamil word for "Water"', target: 'நீர்', help: 'Type the Tamil word for water.' }
    ],
    vocab: [
      [
        { word: 'வணக்கம் (Vanakkam)', meaning: 'Hello / Greetings' },
        { word: 'புத்தகம் (Puthagam)', meaning: 'Book' },
        { word: 'நீர் (Neer)', meaning: 'Water' },
        { word: 'வீடு (Veedu)', meaning: 'Home' }
      ]
    ],
    comprehension: [
      { story: 'பிரியா தினமும் 5 நிமிடங்கள் படிக்கிறாள். அவள் புதிய சொற்களை எழுதுகிறாள்.', question: 'பிரியா தினமும் எத்தனை நிமிடங்கள் படிக்கிறாள்?', options: ['5 நிமிடங்கள்', '10 நிமிடங்கள்', '1 மணி நேரம்'], correct: '5 நிமிடங்கள்' }
    ],
    activities: [
      { title: 'Word Assembly', prompt: 'Select the Tamil word for Water', options: ['நீர்', 'நெருப்பு', 'காற்று'], correct: 'நீர்' }
    ]
  },
  Kannada: {
    reading: [
      { title: '📖 Passage 1: Greetings & Identity', text: 'ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಪ್ರಿಯಾ. ನಾನು ಪ್ರತಿದಿನ ಹೊಸ ಪದಗಳನ್ನು ಕಲಿಯುತ್ತೇನೆ.', help: 'Listen to the Kannada passage and practice reading out loud.' },
      { title: '📖 Passage 2: Knowledge', text: 'ಪ್ರತಿದಿನ ಓದುವುದರಿಂದ ಜ್ಞಾನ ಹೆಚ್ಚಾಗುತ್ತದೆ.', help: 'Practice reading this Kannada passage.' }
    ],
    writing: [
      { prompt: 'Write the Kannada word for "Hello / Greetings"', target: 'ನಮಸ್ಕಾರ', help: 'Type the Kannada greeting.' },
      { prompt: 'Write the Kannada word for "Book"', target: 'ಪುಸ್ತಕ', help: 'Type the Kannada word for book.' },
      { prompt: 'Write the Kannada word for "Water"', target: 'ನೀರು', help: 'Type the Kannada word for water.' }
    ],
    vocab: [
      [
        { word: 'ನಮಸ್ಕಾರ (Namaskara)', meaning: 'Hello / Greetings' },
        { word: 'ಪುಸ್ತಕ (Pustaka)', meaning: 'Book' },
        { word: 'ನೀರು (Neeru)', meaning: 'Water' },
        { word: 'ಮನೆ (Mane)', meaning: 'Home' }
      ]
    ],
    comprehension: [
      { story: 'ಪ್ರಿಯಾ ಪ್ರತಿದಿನ 5 ನಿಮಿಷ ಕಲಿಯುತ್ತಾಳೆ. ಅವಳು ಹೊಸ ಪದಗಳನ್ನು ಬರೆಯುತ್ತಾಳೆ.', question: 'ಪ್ರಿಯಾ ಪ್ರತಿದಿನ ಎಷ್ಟು ನಿಮಿಷ ಕಲಿಯುತ್ತಾಳೆ?', options: ['5 ನಿಮಿಷ', '10 ನಿಮಿಷ', '1 ಗಂಟೆ'], correct: '5 ನಿಮಿಷ' }
    ],
    activities: [
      { title: 'Word Assembly', prompt: 'Select the Kannada word for Water', options: ['ನೀರು', 'ಬೆಂಕಿ', 'ಗಾಳಿ'], correct: 'ನೀರು' }
    ]
  },
  Malayalam: {
    reading: [
      { title: '📖 Passage 1: Greetings & Identity', text: 'നമസ്കാരം! എന്റെ പേര് പ്രിയ. ഞാൻ ദിവസവും പുതിയ വാക്കുകൾ പഠിക്കുന്നു.', help: 'Listen to the Malayalam passage and practice reading out loud.' },
      { title: '📖 Passage 2: Daily Reading', text: 'ദിവസവും വായിക്കുന്നത് വിജ്ഞാനം വർദ്ധിപ്പിക്കും.', help: 'Practice reading this Malayalam passage.' }
    ],
    writing: [
      { prompt: 'Write the Malayalam word for "Hello / Greetings"', target: 'നമസ്കാരം', help: 'Type the Malayalam greeting.' },
      { prompt: 'Write the Malayalam word for "Book"', target: 'പുസ്തകം', help: 'Type the Malayalam word for book.' },
      { prompt: 'Write the Malayalam word for "Water"', target: 'വെള്ളം', help: 'Type the Malayalam word for water.' }
    ],
    vocab: [
      [
        { word: 'നമസ്കാരം (Namaskaram)', meaning: 'Hello / Greetings' },
        { word: 'പുസ്തകം (Pusthakam)', meaning: 'Book' },
        { word: 'വെള്ളം (Vellam)', meaning: 'Water' },
        { word: 'വീട് (Veedu)', meaning: 'Home' }
      ]
    ],
    comprehension: [
      { story: 'പ്രിയ ദിവസവും 5 മിനിറ്റ് വായിക്കുന്നു. അവൾ പുതിയ വാക്കുകൾ എഴുതുന്നു.', question: 'പ്രിയ ദിവസവും എത്ര മിനിറ്റ് വായിക്കുന്നു?', options: ['5 മിനിറ്റ്', '10 മിനിറ്റ്', '1 മണിക്കൂർ'], correct: '5 മിനിറ്റ്' }
    ],
    activities: [
      { title: 'Word Assembly', prompt: 'Select the Malayalam word for Water', options: ['വെള്ളം', 'തീ', 'കാറ്റ്'], correct: 'വെള്ളം' }
    ]
  },
  Bengali: {
    reading: [
      { title: '📖 Passage 1: Greetings & Identity', text: 'নমস্কার! আমার নাম প্রিয়া। আমি প্রতিদিন নতুন শব্দ শিখি।', help: 'Listen to the Bengali passage and practice reading out loud.' },
      { title: '📖 Passage 2: Knowledge', text: 'প্রতিদিন অল্প পড়া জ্ঞানের পরিধি বাড়ায়।', help: 'Practice reading this Bengali passage.' }
    ],
    writing: [
      { prompt: 'Write the Bengali word for "Hello / Greetings"', target: 'নমস্কার', help: 'Type the Bengali greeting.' },
      { prompt: 'Write the Bengali word for "Book"', target: 'বই', help: 'Type the Bengali word for book.' },
      { prompt: 'Write the Bengali word for "Water"', target: 'জল', help: 'Type the Bengali word for water.' }
    ],
    vocab: [
      [
        { word: 'নমস্কার (Nomoshkar)', meaning: 'Hello / Greetings' },
        { word: 'বই (Boi)', meaning: 'Book' },
        { word: 'জল (Jol)', meaning: 'Water' },
        { word: 'ঘর (Ghor)', meaning: 'Home' }
      ]
    ],
    comprehension: [
      { story: 'প্রিয়া প্রতিদিন ৫ মিনিট পড়ে। সে নতুন শব্দ লেখে।', question: 'প্রিয়া প্রতিদিন কত মিনিট পড়ে?', options: ['৫ মিনিট', '১০ মিনিট', '১ ঘণ্টা'], correct: '৫ মিনিট' }
    ],
    activities: [
      { title: 'Word Assembly', prompt: 'Select the Bengali word for Water', options: ['জল', 'আগুন', 'বাতাস'], correct: 'জল' }
    ]
  },
  Marathi: {
    reading: [
      { title: '📖 Passage 1: Greetings & Identity', text: 'नमस्कार! माझे नाव प्रिया आहे. मी रोज नवीन शब्द शिकते.', help: 'Listen to the Marathi passage and practice reading out loud.' },
      { title: '📖 Passage 2: Daily Practice', text: 'रोज थोडे वाचल्याने ज्ञान वाढते.', help: 'Practice reading this Marathi passage.' }
    ],
    writing: [
      { prompt: 'Write the Marathi word for "Hello / Greetings"', target: 'नमस्कार', help: 'Type the Marathi greeting.' },
      { prompt: 'Write the Marathi word for "Book"', target: 'पुस्तक', help: 'Type the Marathi word for book.' },
      { prompt: 'Write the Marathi word for "Water"', target: 'पाणी', help: 'Type the Marathi word for water.' }
    ],
    vocab: [
      [
        { word: 'नमस्कार (Namaskar)', meaning: 'Hello / Greetings' },
        { word: 'पुस्तक (Pustak)', meaning: 'Book' },
        { word: 'पाणी (Paani)', meaning: 'Water' },
        { word: 'घर (Ghar)', meaning: 'Home' }
      ]
    ],
    comprehension: [
      { story: 'प्रिया रोज ५ मिनिटे अभ्यास करते. ती नवीन शब्द लिहिते.', question: 'प्रिया रोज किती मिनिटे अभ्यास करते?', options: ['५ मिनिटे', '१० मिनिटे', '१ तास'], correct: '५ मिनिटे' }
    ],
    activities: [
      { title: 'Word Assembly', prompt: 'Select the Marathi word for Water', options: ['पाणी', 'आग', 'हवा'], correct: 'पाणी' }
    ]
  },
  default: {
    reading: [
      { title: '📖 Passage 1: Welcome', text: 'Hello! Welcome to Akshara. Learning new words helps us communicate every day.', help: 'Listen to the passage and practice reading out loud.' }
    ],
    writing: [
      { prompt: 'Write the English word for greeting', target: 'Hello', help: 'Type the word used to greet others.' }
    ],
    vocab: [
      [
        { word: 'Hello', meaning: 'Greeting used to start a conversation' },
        { word: 'Book', meaning: 'Pages bound together for reading' }
      ]
    ],
    comprehension: [
      { story: 'Priya reads for 5 minutes every morning. She learns one new word each day.', question: 'How much time does Priya read every morning?', options: ['5 minutes', '15 minutes', '1 hour'], correct: '5 minutes' }
    ],
    activities: [
      { title: 'Word Match', prompt: 'Which word is a greeting?', options: ['Hello', 'Table', 'Window'], correct: 'Hello' }
    ]
  }
};

// ----------------------------------------------------
// DYNAMIC SESSION SEED & SHUFFLE ENGINE
// ----------------------------------------------------
let assessment = {}, questionIndex = 0, assessmentLanguage = 'Hindi';
let currentLearner = null;

function getSessionSeed() {
  let seed = sessionStorage.getItem('akshara_session_seed');
  if (!seed) {
    seed = String(Date.now() + Math.floor(Math.random() * 100000));
    sessionStorage.setItem('akshara_session_seed', seed);
  }
  return Number(seed);
}

function rotateSessionSeed() {
  const newSeed = String(Date.now() + Math.floor(Math.random() * 100000));
  sessionStorage.setItem('akshara_session_seed', newSeed);
  return Number(newSeed);
}

function shuffleWithSeed(array, seed) {
  let arr = [...array];
  let m = arr.length, t, i;
  let s = seed || getSessionSeed();
  function pseudoRandom() {
    let x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  }
  while (m) {
    i = Math.floor(pseudoRandom() * m--);
    t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }
  return arr;
}

// ----------------------------------------------------
// WEB AUDIO API SOUND EFFECTS SYNTHESIZER
// ----------------------------------------------------
function playSound(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'badge') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {}
}

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

function setMode(mode) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  if (forms.register) forms.register.classList.toggle('hidden', mode !== 'register');
  if (forms.login) forms.login.classList.toggle('hidden', mode !== 'login');
  if (forms.forgot) forms.forgot.classList.toggle('hidden', mode !== 'forgot');
  if (forms.reset) forms.reset.classList.toggle('hidden', mode !== 'reset');

  if (mode === 'forgot') {
    $('#formTitle').textContent = 'Forgot password';
    $('#formSubtitle').textContent = 'Enter your email address to receive a secure password reset link.';
  } else if (mode === 'reset') {
    $('#formTitle').textContent = 'Set new password';
    $('#formSubtitle').textContent = 'Create a strong new password for your account.';
  } else if (mode === 'register') {
    $('#formTitle').textContent = 'Start your learning journey';
    $('#formSubtitle').textContent = 'Create your learner profile in just a few steps.';
  } else {
    $('#formTitle').textContent = 'Welcome back';
    $('#formSubtitle').textContent = 'Sign in to continue learning.';
  }
}

function formData(form) {
  const data = Object.fromEntries(new FormData(form));
  if (data.age) data.age = Number(data.age);
  return data;
}

function hideViews() {
  document.body.classList.remove('dashboard-mode');
  ['#publicHomeView', '#authView', '#assessmentView', '#resultView', '#dashboardView', '#profileView'].forEach(id => {
    const el = $(id);
    if (el) el.classList.add('hidden');
  });
}

function showPublicHome() {
  currentLearner = null;
  hideViews();
  $('#publicHomeView')?.classList.remove('hidden');
  history.replaceState(null, '', window.location.pathname);
}

function openAuth(mode) {
  hideViews();
  $('#authView')?.classList.remove('hidden');
  setMode(mode);
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { playSound('click'); setMode(t.dataset.mode); }));
if ($('#createLink')) $('#createLink').addEventListener('click', () => { playSound('click'); setMode('register'); });
if ($('#welcomeGetStarted')) $('#welcomeGetStarted').addEventListener('click', () => { playSound('click'); openAuth('register'); });
if ($('#welcomeSignIn')) $('#welcomeSignIn').addEventListener('click', () => { playSound('click'); openAuth('login'); });
if ($('#brandHome')) $('#brandHome').addEventListener('click', (event) => { event.preventDefault(); showPublicHome(); });

let pendingSocialProvider = null;
let pendingSocialForm = null;
let selectedSocialAccountType = 'primary';

function updateSocialAccountSelection() {
  const primaryItem = $('#socialAccountPrimary');
  const altItem = $('#socialAccountAlt');
  const primaryCheck = $('#primaryAccountCheck');
  const altCheck = $('#altAccountCheck');
  const altInputBox = $('#altAccountInputBox');
  const confirmBtn = $('#confirmSocialAuthBtn');

  if (!pendingSocialProvider) return;

  if (selectedSocialAccountType === 'primary') {
    if (primaryItem) primaryItem.classList.add('active');
    if (altItem) altItem.classList.remove('active');
    if (primaryCheck) primaryCheck.classList.remove('hidden');
    if (altCheck) altCheck.classList.add('hidden');
    if (altInputBox) altInputBox.classList.add('hidden');
    if (confirmBtn) confirmBtn.textContent = `Continue with ${pendingSocialProvider}`;
  } else {
    if (primaryItem) primaryItem.classList.remove('active');
    if (altItem) altItem.classList.add('active');
    if (primaryCheck) primaryCheck.classList.add('hidden');
    if (altCheck) altCheck.classList.remove('hidden');
    if (altInputBox) altInputBox.classList.remove('hidden');

    const customName = ($('#customSocialName') && $('#customSocialName').value.trim());
    if (confirmBtn) {
      confirmBtn.textContent = customName ? `Continue as ${customName} (${pendingSocialProvider})` : `Sign in with ${pendingSocialProvider}`;
    }
  }
}

function openSocialModal(provider, form) {
  playSound('click');
  pendingSocialProvider = provider;
  pendingSocialForm = form;
  selectedSocialAccountType = 'primary';

  const modal = $('#socialAuthModal');
  const badge = $('#socialModalBrandBadge');
  const title = $('#socialModalTitle');
  const primaryName = $('#socialAccountName');
  const primaryEmail = $('#socialAccountEmail');
  const confirmBtn = $('#confirmSocialAuthBtn');
  const avatar = $('#socialAccountAvatar');

  if (!modal) return;

  if ($('#customSocialName')) $('#customSocialName').value = '';
  if ($('#customSocialEmail')) $('#customSocialEmail').value = '';

  const pLower = provider.toLowerCase();
  badge.className = `social-brand-badge ${pLower}`;
  badge.textContent = provider === 'Google' ? 'G' : provider === 'Facebook' ? 'f' : '●';
  title.textContent = `Sign in with ${provider}`;
  primaryName.textContent = `${provider} Account`;
  primaryEmail.textContent = `user.${pLower}@akshara.ai`;
  avatar.textContent = provider.charAt(0).toUpperCase();
  confirmBtn.className = `social-primary-btn ${pLower}`;
  confirmBtn.disabled = false;

  updateSocialAccountSelection();
  modal.classList.remove('hidden');
}

function closeSocialModal() {
  const modal = $('#socialAuthModal');
  if (modal) modal.classList.add('hidden');
  pendingSocialProvider = null;
  pendingSocialForm = null;
}

if ($('#socialAccountPrimary')) {
  $('#socialAccountPrimary').addEventListener('click', () => {
    selectedSocialAccountType = 'primary';
    updateSocialAccountSelection();
  });
}

if ($('#socialAccountAlt')) {
  $('#socialAccountAlt').addEventListener('click', () => {
    selectedSocialAccountType = 'alt';
    updateSocialAccountSelection();
  });
}

if ($('#customSocialName')) {
  $('#customSocialName').addEventListener('input', () => {
    if (selectedSocialAccountType === 'alt') updateSocialAccountSelection();
  });
}

let activeSocialProvider = 'Google';

function openGoogleOauthModal(provider = 'Google') {
  activeSocialProvider = provider;
  playSound('click');
  const modal = $('#googleOauthModal');
  const title = $('#googleOauthTitle');
  const errEl = $('#googleOauthError');

  if (errEl) errEl.textContent = '';
  if (title) title.textContent = `Sign in with ${provider}`;

  if (modal) modal.classList.remove('hidden');
}

function closeGoogleOauthModal() {
  const modal = $('#googleOauthModal');
  if (modal) modal.classList.add('hidden');
}

document.querySelectorAll('.social').forEach(button => button.addEventListener('click', () => {
  openGoogleOauthModal(button.dataset.provider || 'Google');
}));

if ($('#closeGoogleOauthBtn')) $('#closeGoogleOauthBtn').addEventListener('click', closeGoogleOauthModal);
if ($('#cancelGoogleOauth')) $('#cancelGoogleOauth').addEventListener('click', closeGoogleOauthModal);
if ($('#googleOauthModal')) {
  $('#googleOauthModal').addEventListener('click', (e) => {
    if (e.target === $('#googleOauthModal')) closeGoogleOauthModal();
  });
}

if ($('#googleEmailForm')) {
  $('#googleEmailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = $('#googleUserName');
    const emailInput = $('#googleUserEmail');
    const errEl = $('#googleOauthError');
    const nextBtn = $('#googleNextBtn');

    if (errEl) errEl.textContent = '';

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';

    if (!nameVal || !emailVal) {
      if (errEl) errEl.textContent = 'Please enter your full name and email address.';
      return;
    }

    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = 'Signing in...';
    }

    try {
      rotateSessionSeed();
      const res = await api(`/api/auth/social/${activeSocialProvider.toLowerCase()}`, {
        method: 'POST',
        body: JSON.stringify({ name: nameVal, email: emailVal })
      });

      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.textContent = 'Next';
      }
      closeGoogleOauthModal();

      if (res && res.learner) {
        currentLearner = res.learner;
        if (res.learner.assessmentCompleted) showDashboard(res.learner);
        else startAssessment(res.learner);
      }
    } catch (err) {
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.textContent = 'Next';
      }
      if (errEl) errEl.textContent = err.message || 'Failed to authenticate. Please try again.';
    }
  });
}

forms.register.addEventListener('submit', async (event) => {
  event.preventDefault();
  const error = $('#registerError');
  error.textContent = '';
  if (!event.target.checkValidity()) {
    error.textContent = 'Please complete all fields correctly.';
    event.target.reportValidity();
    return;
  }
  try {
    rotateSessionSeed();
    const { learner } = await api('/api/auth/register', { method: 'POST', body: JSON.stringify(formData(event.target)) });
    startAssessment(learner);
  } catch (err) { error.textContent = err.message; }
});

forms.login.addEventListener('submit', async (event) => {
  event.preventDefault();
  const error = $('#loginError');
  error.textContent = '';
  if (!event.target.checkValidity()) {
    event.target.reportValidity();
    return;
  }
  try {
    rotateSessionSeed();
    const { learner } = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(formData(event.target)) });
    showDashboard(learner);
  } catch (err) { error.textContent = err.message; }
});

if ($('#forgotPasswordLink')) {
  $('#forgotPasswordLink').addEventListener('click', () => setMode('forgot'));
}

if ($('#backToLoginLink')) {
  $('#backToLoginLink').addEventListener('click', () => setMode('login'));
}

if (forms.forgot) {
  forms.forgot.addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = $('#forgotError');
    const success = $('#forgotSuccess');
    const banner = $('#resetLinkBanner');
    const demoLink = $('#demoResetLink');
    if (error) error.textContent = '';
    if (success) success.textContent = '';
    if (banner) banner.classList.add('hidden');

    if (!event.target.checkValidity()) {
      if (error) error.textContent = 'Please provide a valid email address.';
      event.target.reportValidity();
      return;
    }

    try {
      const res = await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(formData(event.target)) });
      if (success) success.textContent = res.message || 'Password reset link sent to your email!';
      if (res.reset_url && banner && demoLink) {
        demoLink.href = res.reset_url;
        banner.classList.remove('hidden');
      }
    } catch (err) { if (error) error.textContent = err.message; }
  });
}

if (forms.reset) {
  forms.reset.addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = $('#resetError');
    const success = $('#resetSuccess');
    if (error) error.textContent = '';
    if (success) success.textContent = '';

    if (!event.target.checkValidity()) {
      if (error) error.textContent = 'Password must contain at least 6 characters.';
      event.target.reportValidity();
      return;
    }

    try {
      const res = await api('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(formData(event.target)) });
      if (success) success.textContent = res.message || 'Password updated successfully!';
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        setMode('login');
      }, 1800);
    } catch (err) { if (error) error.textContent = err.message; }
  });
}

if ($('#backToLoginFromReset')) {
  $('#backToLoginFromReset').addEventListener('click', () => setMode('login'));
}

function checkUrlResetToken() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('reset_token');
  const email = params.get('email');
  if (token && email) {
    setMode('reset');
    if ($('#resetEmailInput')) $('#resetEmailInput').value = email;
    if ($('#resetTokenInput')) $('#resetTokenInput').value = token;
  }
}
checkUrlResetToken();

function startAssessment(user = {}) {
  currentLearner = user;
  assessmentLanguage = user.language || 'Hindi';
  assessment = { language: assessmentLanguage };
  questionIndex = 0;
  hideViews();
  $('#assessmentView').classList.remove('hidden');
  renderQuestion();
}

function renderQuestion() {
  const q = questions[questionIndex];
  const title = typeof q.title === 'function' ? q.title(assessmentLanguage) : q.title;
  const help = typeof q.help === 'function' ? q.help(assessmentLanguage) : q.help;
  const options = typeof q.options === 'function' ? q.options(assessmentLanguage) : q.options;

  $('#assessmentStep').textContent = questionIndex + 1;
  if ($('#assessmentTotal')) $('#assessmentTotal').textContent = questions.length;
  $('#progressFill').style.width = `${((questionIndex + 1) / questions.length) * 100}%`;

  const selectedValue = assessment[q.key] || (q.key === 'language' ? assessmentLanguage : '');

  const answerMarkup = q.kind === 'text'
    ? `<input id="assessmentTextAnswer" class="assessment-text-answer" type="text" value="${String(selectedValue).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" placeholder="${(typeof q.placeholder === 'function' ? q.placeholder(assessmentLanguage) : q.placeholder) || 'Type your answer'}" autocomplete="off" />`
    : `<div class="answer-list">
      ${(options || []).map(option => {
        const item = typeof option === 'string' ? { label: option, value: option } : option;
        return `<button class="answer ${selectedValue === item.value ? 'selected' : ''}" data-answer="${item.value}" type="button">
          <span>${item.label}</span><span class="opt-check">${selectedValue === item.value ? '✓' : ''}</span>
        </button>`;
      }).join('')}
    </div>`;

  $('#questionCard').innerHTML = `
    <h3>${title}</h3>
    <p>${help}</p>
    ${q.passage ? `<div class="assessment-passage">${q.passage(assessmentLanguage)}</div>` : ''}
    ${answerMarkup}
  `;

  document.querySelectorAll('.answer').forEach(button => button.addEventListener('click', () => {
    playSound('click');
    const val = button.dataset.answer;
    assessment[q.key] = val;
    if (q.key === 'language') {
      assessmentLanguage = val;
      if (currentLearner) currentLearner.language = val;
    }
    renderQuestion();
  }));

  if (q.kind === 'text' && $('#assessmentTextAnswer')) {
    $('#assessmentTextAnswer').addEventListener('input', (event) => { assessment[q.key] = event.target.value; });
  }

  $('#backQuestion').disabled = questionIndex === 0;
  $('#nextQuestion').innerHTML = questionIndex === questions.length - 1 ? 'See my learning path <span>→</span>' : 'Continue <span>→</span>';
}

if ($('#backQuestion')) $('#backQuestion').addEventListener('click', () => { playSound('click'); if (questionIndex) { questionIndex--; renderQuestion(); } });
if ($('#nextQuestion')) $('#nextQuestion').addEventListener('click', async () => {
  playSound('click');
  const q = questions[questionIndex];
  if (q.kind === 'text' && $('#assessmentTextAnswer')) assessment[q.key] = $('#assessmentTextAnswer').value.trim();
  const selectedValue = assessment[q.key] || (q.key === 'language' ? assessmentLanguage : '');
  if (!selectedValue) { $('#assessmentError').textContent = 'Choose an answer to continue.'; playSound('error'); return; }
  assessment[q.key] = selectedValue;
  $('#assessmentError').textContent = '';

  if (questionIndex < questions.length - 1) {
    questionIndex++;
    renderQuestion();
    return;
  }

  try {
    if (assessment.language && currentLearner && currentLearner.name) {
      try {
        await api('/api/learners/me', {
          method: 'PUT',
          body: JSON.stringify({
            name: currentLearner.name,
            age: currentLearner.age || 24,
            language: assessment.language,
            proficiency: currentLearner.proficiency || 'Beginner',
            goal: currentLearner.goal || 'Everyday communication'
          })
        });
      } catch (e) {}
    }

    const { learner, recommendation } = await api('/api/learners/me/assessment', {
      method: 'POST',
      body: JSON.stringify({
        focus: assessment.focus,
        reading: assessment.reading,
        writing: assessment.writing,
        confidence: assessment.confidence,
        daily_time: assessment.daily_time,
        reading_check: assessment.reading_check,
        writing_check: assessment.writing_check,
        comprehension_check: assessment.comprehension_check
      })
    });
    playSound('success');
    showResult(learner, recommendation);
  } catch (err) { $('#assessmentError').textContent = err.message; playSound('error'); }
});

function showResult(learner, recommendation) {
  currentLearner = learner;
  hideViews();
  $('#resultView').classList.remove('hidden');
  $('#resultLevel').textContent = `Recommended starting level: ${recommendation.level}`;
  $('#resultCopy').textContent = `Based on your answers, we’ll begin with short ${recommendation.focus.toLowerCase()} activities in ${learner.language}. You can always learn at your own pace.`;
  if ($('#continueProfile')) {
    $('#continueProfile').onclick = () => showDashboard(learner);
  }
}

function showProfile(user) {
  if (!user) return;
  currentLearner = user;
  hideViews();
  $('#profileView').classList.remove('hidden');
  const namePart = (user.name || 'Learner').trim().split(' ')[0];
  if ($('#learnerName')) $('#learnerName').textContent = namePart;
  if ($('#avatar')) $('#avatar').textContent = (user.name || 'L').trim()[0].toUpperCase();
  for (const [key, value] of Object.entries(user)) {
    const input = $('#profileForm [name="' + key + '"]');
    if (input) {
      if (key === 'goal' && (!value || value === 'General literacy')) {
        input.value = 'Everyday communication';
      } else {
        input.value = value;
      }
    }
  }
}

// ----------------------------------------------------
// CENTRAL PREFERRED LANGUAGE SWITCHER ENGINE
// ----------------------------------------------------
async function updateLanguage(newLang, saveToDb = true) {
  if (!newLang) return;
  playSound('click');

  if (currentLearner) currentLearner.language = newLang;
  assessmentLanguage = newLang;

  // Sync header dropdown
  if ($('#dashLangSelect')) $('#dashLangSelect').value = newLang;

  // Persist to database if logged in
  if (saveToDb && currentLearner && currentLearner.id) {
    try {
      const updatedRes = await api('/api/learners/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: currentLearner.name,
          age: currentLearner.age || 24,
          language: newLang,
          proficiency: currentLearner.proficiency || 'Beginner',
          goal: currentLearner.goal || 'Everyday communication'
        })
      });
      if (updatedRes && updatedRes.learner) currentLearner = updatedRes.learner;
    } catch (e) {
      console.error('Failed to update learner language in DB:', e);
    }
  }

  // Re-render language-specific content for the newly selected language
  renderPuzzles(newLang);
  setupVoiceCoach(newLang);
  renderPillarContent(currentPillar, newLang);
  renderFlashcards(newLang);
  beginnerMicroStep = 0;
  renderBeginnerMicroLesson(newLang);
  filterAndRenderCourses(newLang);

  if ($('#certLang')) $('#certLang').textContent = newLang;
  if ($('#aiCoachHintText')) $('#aiCoachHintText').textContent = `Now learning in ${newLang}! Ask me for hints or practice tips anytime as you work through lessons.`;

  // Show Toast Notification
  const toast = document.createElement('div');
  toast.className = 'shuffle-toast';
  toast.textContent = `🌐 Preferred language set to ${newLang}!`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Attach listener to Header Dropdown
if ($('#dashLangSelect')) {
  $('#dashLangSelect').addEventListener('change', (e) => {
    updateLanguage(e.target.value, true);
  });
}

// Interface language is independent from the preferred learning language.
// Learning content remains in dashLangSelect; this dictionary translates the
// persistent navigation so a learner can use the portal comfortably.
const interfaceCopy = {
  English: { portalLabel: 'AKSHARA', workspaceLabel: 'My learning home', overview: 'Home', learningStructure: 'Learning Structure', microLessons: 'Micro-Lessons', speechEngine: 'Speech Engine', analyticsBadges: 'Analytics & Badges', reading: 'Reading', writing: 'Writing', vocabulary: 'Vocabulary', comprehension: 'Comprehension', practiceActivities: 'Practice activities' },
  Hindi: { portalLabel: 'अक्षरा', workspaceLabel: 'मेरा सीखने का घर', overview: 'होम', learningStructure: 'सीखने की संरचना', microLessons: 'सूक्ष्म पाठ', speechEngine: 'भाषण अभ्यास', analyticsBadges: 'विश्लेषण और बैज', reading: 'पठन', writing: 'लेखन', vocabulary: 'शब्दावली', comprehension: 'समझ', practiceActivities: 'अभ्यास गतिविधियाँ' },
  Telugu: { portalLabel: 'అక్షర', workspaceLabel: 'నా అభ్యాస నిలయం', overview: 'హోమ్', learningStructure: 'అభ్యాస నిర్మాణం', microLessons: 'చిన్న పాఠాలు', speechEngine: 'స్పీచ్ అభ్యాసం', analyticsBadges: 'విశ్లేషణ & బ్యాడ్జ్‌లు', reading: 'చదవడం', writing: 'రాయడం', vocabulary: 'పదజాలం', comprehension: 'అవగాహన', practiceActivities: 'అభ్యాస కార్యకలాపాలు' },
  Tamil: { portalLabel: 'அக்ஷரா', workspaceLabel: 'என் கற்றல் முகப்பு', overview: 'முகப்பு', learningStructure: 'கற்றல் அமைப்பு', microLessons: 'சிறு பாடங்கள்', speechEngine: 'பேச்சுப் பயிற்சி', analyticsBadges: 'பகுப்பாய்வு & பதக்கங்கள்', reading: 'வாசித்தல்', writing: 'எழுதுதல்', vocabulary: 'சொற்களஞ்சியம்', comprehension: 'புரிதல்', practiceActivities: 'பயிற்சி செயல்கள்' },
  Kannada: { portalLabel: 'ಅಕ್ಷರ', workspaceLabel: 'ನನ್ನ ಕಲಿಕೆ ಮುಖಪುಟ', overview: 'ಮುಖಪುಟ', learningStructure: 'ಕಲಿಕೆ ರಚನೆ', microLessons: 'ಸಣ್ಣ ಪಾಠಗಳು', speechEngine: 'ಮಾತಿನ ಅಭ್ಯಾಸ', analyticsBadges: 'ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಬ್ಯಾಡ್ಜ್‌ಗಳು', reading: 'ಓದುವುದು', writing: 'ಬರೆಯುವುದು', vocabulary: 'ಪದಕೋಶ', comprehension: 'ತಿಳುವಳಿಕೆ', practiceActivities: 'ಅಭ್ಯಾಸ ಚಟುವಟಿಕೆಗಳು' }
};

function updateInterfaceLanguage(language) {
  const copy = interfaceCopy[language] || interfaceCopy.English;
  document.documentElement.lang = { Hindi: 'hi', Telugu: 'te', Tamil: 'ta', Kannada: 'kn' }[language] || 'en';
  document.querySelectorAll('[data-ui]').forEach(element => {
    const key = element.dataset.ui;
    if (copy[key]) element.textContent = copy[key];
  });
  if ($('#interfaceLangSelect')) $('#interfaceLangSelect').value = language;
  localStorage.setItem('akshara_interface_language', language);
}

if ($('#interfaceLangSelect')) {
  $('#interfaceLangSelect').addEventListener('change', (event) => {
    playSound('click');
    updateInterfaceLanguage(event.target.value);
  });
  updateInterfaceLanguage(localStorage.getItem('akshara_interface_language') || 'English');
}

// ----------------------------------------------------
// MAIN DASHBOARD INITIALIZATION & DYNAMIC CONTENT
// ----------------------------------------------------
async function showDashboard(user) {
  if (!user) return;
  currentLearner = user;
  hideViews();
  document.body.classList.add('dashboard-mode');
  $('#dashboardView').classList.remove('hidden');
  const hashPage = `page-${window.location.hash.slice(1)}`;
  showDashboardPage(document.getElementById(hashPage) ? hashPage : 'page-home', false);

  const namePart = (user.name || 'Learner').trim().split(' ')[0];
  if ($('#dashboardName')) $('#dashboardName').textContent = namePart;
  if ($('#dashAvatar')) $('#dashAvatar').textContent = (user.name || 'L').trim()[0].toUpperCase();
  if ($('#dashLevelBadge')) $('#dashLevelBadge').textContent = user.proficiency || 'Beginner';
  if ($('#pathBadgeLevel')) $('#pathBadgeLevel').textContent = user.proficiency || 'Beginner';
  if ($('#dashStreakVal')) $('#dashStreakVal').textContent = `${user.streakDays || 1} Days Active`;
  if ($('#dashXpVal')) $('#dashXpVal').textContent = `${user.totalXp || 0} XP Earned`;

  const userLang = user.language || 'Hindi';
  if ($('#dashLangSelect')) $('#dashLangSelect').value = userLang;

  // Fetch streak & achievements from backend
  try {
    const streakRes = await api('/api/learners/me/streak', { method: 'POST' });
    if (streakRes && streakRes.learner) {
      currentLearner = streakRes.learner;
      if ($('#dashStreakVal')) $('#dashStreakVal').textContent = `${streakRes.learner.streakDays || 1} Days Active`;
    }
    if (streakRes && streakRes.achievements) {
      renderAchievements(streakRes.achievements);
    }
  } catch (e) {}

  filterAndRenderCourses(userLang);

  // Render language-specific randomized content
  renderPuzzles(userLang);
  loadLivePracticeQuestion();
  setupVoiceCoach(userLang);
  renderPillarContent('reading', userLang);
  renderFlashcards(userLang);
  beginnerMicroStep = 0;
  renderBeginnerMicroLesson(userLang);
}

async function filterAndRenderCourses(language) {
  try {
    const [courseData, recommendationData, learningPathData] = await Promise.all([
      api('/api/courses').catch(() => ({ courses: [] })),
      api('/api/learners/me/recommendations').catch(() => ({ recommendations: [] })),
      api('/api/v1/learning-path').catch(() => api('/api/learners/me/learning-path').catch(() => ({ path: null })))
    ]);

    const latest = recommendationData.recommendations && recommendationData.recommendations[0];
    const recommendation = learningPathData.adaptive ? learningPathData.adaptive.message : (learningPathData.path ? learningPathData.path.message : latest && latest.content);
    if ($('#recommendationCard')) $('#recommendationCard').classList.toggle('hidden', !recommendation);
    if (recommendation && $('#recommendationText')) $('#recommendationText').textContent = recommendation;
    const path = learningPathData.path;
    if (path) {
      if ($('#journeyNextLesson')) $('#journeyNextLesson').textContent = path.next_lesson ? path.next_lesson.title : 'Learning path complete!';
      if ($('#journeyProgressText')) $('#journeyProgressText').textContent = path.next_lesson
        ? `A short ${path.next_lesson.estimated_minutes}-minute practice is ready for you.`
        : 'Wonderful work — you have completed your current learning path.';
      if ($('#journeyMinutes')) $('#journeyMinutes').textContent = path.next_lesson ? `${path.next_lesson.estimated_minutes} min` : 'Great work';
      if ($('#journeyProgressFill')) $('#journeyProgressFill').style.width = `${path.progress_percent || 0}%`;
      if ($('#rptLessons')) $('#rptLessons').textContent = `${path.completed_lessons}/${path.total_lessons}`;
    }
    if (learningPathData.adaptive) {
      const profile = learningPathData.adaptive.profile;
      const pronunciation = profile.skill_scores.pronunciation;
      if ($('#rptLevel')) $('#rptLevel').textContent = profile.proficiency_tier;
      if ($('#rptVoice')) $('#rptVoice').textContent = pronunciation ? `${Math.round(pronunciation.mastery_score)}%` : 'Start practising';
      const skillElements = {
        reading: ['#skillReading', '#skillReadingValue'],
        writing: ['#skillWriting', '#skillWritingValue'],
        comprehension: ['#skillComprehension', '#skillComprehensionValue'],
        pronunciation: ['#skillPronunciation', '#skillPronunciationValue']
      };
      Object.entries(skillElements).forEach(([skill, selectors]) => {
        const score = profile.skill_scores[skill] ? Math.round(profile.skill_scores[skill].mastery_score) : 0;
        if ($(selectors[0])) $(selectors[0]).style.width = `${score}%`;
        if ($(selectors[1])) $(selectors[1]).textContent = profile.skill_scores[skill] ? `${score}%` : 'New';
      });
    }
    const streak = Math.min(7, Math.max(1, Number(currentLearner && currentLearner.streakDays) || 1));
    document.querySelectorAll('.streak-day').forEach((day, index, days) => day.classList.toggle('active', index >= days.length - streak));

    const list = $('#courseList');
    if (list && courseData.courses) {
      list.innerHTML = '';

      // Prioritize learner's preferred language courses first!
      const sortedCourses = [...courseData.courses].sort((a, b) => {
        if (a.language === language) return -1;
        if (b.language === language) return 1;
        return 0;
      });

      for (const course of sortedCourses) {
        try {
          const topics = (await api(`/api/courses/${course.id}/topics`)).topics;
          const topicContent = await Promise.all(topics.map(async topic => ({ topic, lessons: (await api(`/api/topics/${topic.id}/lessons`)).lessons })));
          const isPreferred = course.language === language;
          const card = document.createElement('article');
          card.className = `course-card ${isPreferred ? 'preferred-course' : ''}`;
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <p class="eyebrow">${course.language} · ${course.proficiency_level}</p>
              ${isPreferred ? '<span class="status-pill green">Preferred Language</span>' : ''}
            </div>
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            ${topicContent.map(({topic, lessons}, topicIndex) => `
              <div class="topic-block">
                <h4><span class="topic-icon">✦</span>${topic.title}</h4>
                <div class="lesson-path">
                  ${lessons.map((lesson, lessonIndex) => `<div class="lesson-row">
                    <span class="lesson-node" aria-hidden="true">${lessonIndex === 0 ? '★' : '✦'}</span>
                    <span class="lesson-details"><strong>${lesson.title}</strong><small>Guided practice · ${lesson.estimated_minutes} min</small></span>
                    <button data-lesson="${lesson.id}" data-lesson-title="${lesson.title}" data-lesson-kind="${topicIndex === 0 ? (lessonIndex === 0 ? 'letter' : 'word') : (lessonIndex === 0 ? 'greeting' : 'everyday')}">Start activity</button>
                  </div>`).join('')}
                </div>
              </div>
            `).join('')}
          `;
          list.append(card);
        } catch (err) {}
      }

      document.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', async () => {
        playSound('click');
        openGuidedLesson(Number(button.dataset.lesson), button.dataset.lessonTitle || 'Your guided activity', button.dataset.lessonKind || 'greeting', language);
      }));
    }
  } catch (err) {
    console.error('Error fetching dashboard content:', err);
  }
}

function showDashboardPage(pageId, updateUrl = true) {
  const page = $('#' + pageId);
  const tab = document.querySelector(`.main-portal-nav .nav-tab[data-page="${pageId}"]`);
  if (!page || !tab) return;

  document.querySelectorAll('.main-portal-nav .nav-tab').forEach(item => {
    item.classList.toggle('active', item === tab);
    item.setAttribute('aria-selected', String(item === tab));
  });
  document.querySelectorAll('.dash-page').forEach(item => item.classList.toggle('active', item === page));
  const isCurriculumPage = pageId === 'page-curriculum';
  if ($('#curriculumSubnav')) $('#curriculumSubnav').classList.toggle('hidden', !isCurriculumPage);
  if ($('#curriculumNavButton')) $('#curriculumNavButton').setAttribute('aria-expanded', String(isCurriculumPage));
  if (updateUrl) history.replaceState(null, '', `#${pageId.replace('page-', '')}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (pageId === 'page-lessons') {
    // Continue Learning should land on the learner's actual lesson choices.
    window.setTimeout(() => $('#courseList')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }
}

// Absolute-beginner micro lessons: build meaning with image and sound first.
const beginnerMicroContent = {
  English: { greeting: 'Hello', letter: 'A', letterChoices: ['A', 'B', 'C'], word: 'Book', everyday: 'I need water' },
  Hindi: { greeting: 'नमस्ते', letter: 'अ', letterChoices: ['अ', 'क', 'म'], word: 'किताब', everyday: 'मुझे पानी चाहिए' },
  Telugu: { greeting: 'నమస్కారం', letter: 'అ', letterChoices: ['అ', 'క', 'మ'], word: 'పుస్తకం', everyday: 'నాకు నీరు కావాలి' },
  Tamil: { greeting: 'வணக்கம்', letter: 'அ', letterChoices: ['அ', 'க', 'ம'], word: 'புத்தகம்', everyday: 'எனக்கு தண்ணீர் வேண்டும்' },
  Kannada: { greeting: 'ನಮಸ್ಕಾರ', letter: 'ಅ', letterChoices: ['ಅ', 'ಕ', 'ಮ'], word: 'ಪುಸ್ತಕ', everyday: 'ನನಗೆ ನೀರು ಬೇಕು' },
  Malayalam: { greeting: 'നമസ്കാരം', letter: 'അ', letterChoices: ['അ', 'ക', 'മ'], word: 'പുസ്തകം', everyday: 'എനിക്ക് വെള്ളം വേണം' },
  Bengali: { greeting: 'নমস্কার', letter: 'অ', letterChoices: ['অ', 'ক', 'ম'], word: 'বই', everyday: 'আমার জল চাই' },
  Marathi: { greeting: 'नमस्कार', letter: 'अ', letterChoices: ['अ', 'क', 'म'], word: 'पुस्तक', everyday: 'मला पाणी हवे आहे' }
};
let beginnerMicroStep = 0;
let activeGuidedLessonId = null;
let activeGuidedLessonTitle = '';
let activeGuidedLessonKind = 'greeting';

function openGuidedLesson(lessonId, lessonTitle, lessonKind, language) {
  activeGuidedLessonId = lessonId;
  activeGuidedLessonTitle = lessonTitle;
  activeGuidedLessonKind = lessonKind;
  beginnerMicroStep = 0;
  renderBeginnerMicroLesson(language);
  $('#beginnerLessonCard')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderBeginnerMicroLesson(language) {
  const card = $('#beginnerLessonCard');
  if (!card) return;
  const content = beginnerMicroContent[language] || beginnerMicroContent.English;
  const dots = [0, 1, 2, 3].map(step => `<i class="${step <= beginnerMicroStep ? 'active' : ''}"></i>`).join('');
  const nextButton = '<button type="button" id="beginnerNext" class="primary">Next small step <span>→</span></button>';
  const modes = {
    letter: { visual: content.letter, sound: content.letter, title: 'Meet a new letter shape', intro: 'You do not need to know its name yet. Just look at its shape.', question: 'Can you find the same shape?', choices: content.letterChoices, correct: content.letter, final: content.letter, finalTitle: 'You noticed a letter shape', finalHelp: 'Later, this shape will help you read simple words.' },
    word: { visual: '📚', sound: content.word, title: 'Look at a familiar thing', intro: 'This is something used for reading. Look at the picture first.', question: 'Which picture is used for reading?', choices: ['📚', '💧', '🏠'], correct: '📚', final: content.word, finalTitle: 'This is the word for the picture', finalHelp: 'You heard the word and saw the object. You can notice its shape now.' },
    greeting: { visual: '👋', sound: content.greeting, title: 'Someone is saying hello', intro: 'Look at the picture. You do not need to read anything yet.', question: 'Which picture means hello?', choices: ['👋', '📚', '💧'], correct: '👋', final: content.letter, finalTitle: 'You heard a greeting sound', finalHelp: 'You saw the meaning first. The letter is only for noticing today.' },
    everyday: { visual: '💧', sound: content.everyday, title: 'A useful everyday message', intro: 'This picture shows water. First hear the useful message.', question: 'Which picture shows water?', choices: ['💧', '📚', '🏠'], correct: '💧', final: content.word, finalTitle: 'You practised an everyday message', finalHelp: 'You can listen and say this message whenever you need help.' }
  };
  const mode = modes[activeGuidedLessonKind] || modes.greeting;
  if (beginnerMicroStep === 0) {
    card.innerHTML = `<div class="beginner-progress">${dots}</div><p class="beginner-step">STEP 1 · LOOK</p><div class="beginner-visual">${mode.visual}</div><h4>${mode.title}</h4><p>${mode.intro}</p><div class="beginner-actions"><button type="button" id="beginnerListen" class="secondary">🔊 Hear the sound</button>${nextButton}</div>`;
  } else if (beginnerMicroStep === 1) {
    card.innerHTML = `<div class="beginner-progress">${dots}</div><p class="beginner-step">STEP 2 · HEAR & SAY</p><div class="beginner-visual">${mode.visual}</div><h4>Listen, then say it with me</h4><p>Tap the speaker as many times as you want. Speaking slowly is perfect.</p><div class="beginner-actions"><button type="button" id="beginnerListen" class="secondary">🔊 Listen again</button>${nextButton}</div>`;
  } else if (beginnerMicroStep === 2) {
    card.innerHTML = `<div class="beginner-progress">${dots}</div><p class="beginner-step">STEP 3 · CHOOSE</p><h4>${mode.question}</h4><p>Take your time. Choose the matching picture or shape.</p><div class="beginner-actions">${mode.choices.map(choice => `<button class="picture-choice" data-beginner-answer="${choice === mode.correct ? 'yes' : 'no'}" type="button">${choice}</button>`).join('')}</div><p id="beginnerFeedback" class="beginner-feedback"></p></div>`;
  } else {
    card.innerHTML = `<div class="beginner-progress">${dots}</div><p class="beginner-step">STEP 4 · NOTICE</p><div class="beginner-letter">${mode.final}</div><h4>${mode.finalTitle}</h4><p>${mode.finalHelp}</p><div class="beginner-actions"><button type="button" id="beginnerRestart" class="secondary">Start again</button><button type="button" id="beginnerFinish" class="primary">I did it! <span>✓</span></button></div><p id="beginnerFeedback" class="beginner-feedback"></p>`;
  }
  const listen = $('#beginnerListen');
  if (listen) listen.onclick = () => { playSound('click'); playSpeech(mode.sound, language); };
  const next = $('#beginnerNext');
  if (next) next.onclick = () => { beginnerMicroStep += 1; renderBeginnerMicroLesson(language); };
  document.querySelectorAll('[data-beginner-answer]').forEach(button => button.onclick = () => {
    const feedback = $('#beginnerFeedback');
    if (button.dataset.beginnerAnswer === 'yes') { feedback.textContent = 'Wonderful! That is correct. ✓'; feedback.style.color = '#287257'; playSound('success'); window.setTimeout(() => { beginnerMicroStep = 3; renderBeginnerMicroLesson(language); }, 700); }
    else { feedback.textContent = 'Nice try. Listen again and look carefully.'; feedback.style.color = '#b05d43'; playSound('error'); }
  });
  const restart = $('#beginnerRestart'); if (restart) restart.onclick = () => { beginnerMicroStep = 0; renderBeginnerMicroLesson(language); };
  const finish = $('#beginnerFinish'); if (finish) finish.onclick = async () => {
    const feedback = $('#beginnerFeedback'); finish.disabled = true; finish.textContent = 'Saving…';
    try {
      if (activeGuidedLessonId) await api(`/api/lessons/${activeGuidedLessonId}/progress`, { method: 'PUT', body: JSON.stringify({ completion_percent: 100 }) });
      await api('/api/practice/submit', { method: 'POST', body: JSON.stringify({ points: 10 }) });
      feedback.textContent = 'Excellent first step! Your lesson is complete.'; feedback.style.color = '#287257'; finish.textContent = 'Completed ✓'; playSound('success');
      filterAndRenderCourses(language); activeGuidedLessonId = null; activeGuidedLessonTitle = '';
    } catch (error) { finish.disabled = false; finish.textContent = 'I did it! ✓'; feedback.textContent = error.message; feedback.style.color = '#b05d43'; }
  };
}

document.querySelectorAll('.main-portal-nav .nav-tab').forEach(tab => {
  tab.addEventListener('click', () => { playSound('click'); showDashboardPage(tab.dataset.page); });
});
document.querySelectorAll('[data-go-page]').forEach(button => {
  button.addEventListener('click', () => {
    playSound('click');
    showDashboardPage(button.dataset.goPage);
    if (button.dataset.openPillar) renderPillarContent(button.dataset.openPillar, (currentLearner && currentLearner.language) || 'Hindi');
  });
});
if ($('#pageCertificateBtn')) $('#pageCertificateBtn').addEventListener('click', openCertificateModal);

async function generateSmartLesson() {
  const button = $('#generateLessonBtn');
  const card = $('#generatedLessonCard');
  if (!button || !card) return;
  button.disabled = true;
  button.textContent = 'Creating your activity…';
  const skill = $('#smartLessonSkill') ? $('#smartLessonSkill').value : '';
  try {
    const response = await api('/api/v1/learning-path/lessons', {
      method: 'POST',
      body: JSON.stringify(skill ? { skill } : {})
    });
    const lesson = response.lesson;
    card.innerHTML = `
      <div class="generated-lesson-heading"><span class="generated-lesson-icon">✨</span><div><p class="eyebrow">${lesson.language} · ${lesson.level}</p><h4>${lesson.title}</h4></div><span class="status-pill green">${lesson.skill}</span></div>
      <p class="generated-lesson-prompt">${lesson.prompt}</p>
      <p class="generated-lesson-tip">💡 ${lesson.coach_tip}</p>
      <div class="generated-lesson-footer"><span>⏱ ${lesson.estimated_minutes} minutes</span><button id="completeGeneratedLesson" class="primary" type="button">Mark complete ✓</button></div>
      <p id="generatedLessonStatus" class="success" aria-live="polite"></p>`;
    card.classList.remove('hidden');
    const completeButton = $('#completeGeneratedLesson');
    if (completeButton) completeButton.addEventListener('click', async () => {
      completeButton.disabled = true;
      completeButton.textContent = 'Saving…';
      try {
        await api(`/api/v1/learning-path/lessons/${encodeURIComponent(lesson.id)}`, { method: 'PUT', body: JSON.stringify({ status: 'completed', score: 85, duration_seconds: Number(lesson.estimated_minutes || 5) * 60 }) });
        completeButton.textContent = 'Completed ✓';
        if ($('#generatedLessonStatus')) $('#generatedLessonStatus').textContent = 'Great work! Your skill profile has been updated.';
        playSound('success');
        filterAndRenderCourses((currentLearner && currentLearner.language) || 'Hindi');
      } catch (error) {
        completeButton.disabled = false;
        completeButton.textContent = 'Mark complete ✓';
        if ($('#generatedLessonStatus')) { $('#generatedLessonStatus').className = 'error'; $('#generatedLessonStatus').textContent = error.message; }
      }
    });
  } catch (error) {
    card.classList.remove('hidden');
    card.innerHTML = `<p class="error">${error.message}</p>`;
  } finally {
    button.disabled = false;
    button.textContent = '✨ Generate another lesson';
  }
}

if ($('#generateLessonBtn')) $('#generateLessonBtn').addEventListener('click', generateSmartLesson);
document.querySelectorAll('[data-recommendation-feedback]').forEach(button => button.addEventListener('click', async () => {
  try {
    await api('/api/v1/recommendations/feedback', { method: 'POST', body: JSON.stringify({ helpful: button.dataset.recommendationFeedback === 'true' }) });
    const feedback = button.parentElement;
    if (feedback) feedback.textContent = 'Thanks — we’ll use that to improve your next recommendation.';
  } catch (error) {}
}));

window.addEventListener('hashchange', () => {
  const pageId = `page-${window.location.hash.slice(1)}`;
  showDashboardPage(pageId, false);
});

document.querySelectorAll('.pillar-tab-pro, .pillar-tab').forEach(tab => tab.addEventListener('click', () => {
  playSound('click');
  renderPillarContent(tab.dataset.pillar, (currentLearner && currentLearner.language) || 'Hindi');
}));
document.querySelectorAll('.portal-subnav [data-pillar]').forEach(button => button.addEventListener('click', () => {
  playSound('click');
  showDashboardPage('page-curriculum');
  renderPillarContent(button.dataset.pillar, (currentLearner && currentLearner.language) || 'Hindi');
}));

// ----------------------------------------------------
// DYNAMIC RENDERER FOR PRACTICE CORNER & PUZZLES
// ----------------------------------------------------
function renderPuzzles(language) {
  const pool = rawPuzzleSets[language] || rawPuzzleSets.default;
  const shuffledPuzzles = shuffleWithSeed(pool, getSessionSeed());
  const list = $('#puzzleList');
  if (!list) return;

  list.innerHTML = shuffledPuzzles.map((puzzle, index) => `
    <article class="puzzle-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4>${puzzle.title}</h4>
        <button class="hint-btn text-button" data-hint="${puzzle.hint || ''}" type="button" style="font-size:12px;">💡 Hint</button>
      </div>
      <p>${puzzle.prompt}</p>
      <div class="puzzle-options">
        ${puzzle.options.map(option => `<button class="puzzle-option" data-puzzle="${index}" data-answer="${option}">${option}</button>`).join('')}
      </div>
      <p class="puzzle-feedback" id="puzzleFeedback${index}"></p>
    </article>
  `).join('');

  document.querySelectorAll('.puzzle-option').forEach(button => button.addEventListener('click', async () => {
    const puzzleIndex = Number(button.dataset.puzzle);
    const puzzle = shuffledPuzzles[puzzleIndex];
    const feedback = $(`#puzzleFeedback${puzzleIndex}`);
    if (button.dataset.answer === puzzle.correct) {
      playSound('success');
      feedback.textContent = 'Wonderful! That is correct. ✓ (+10 XP)';
      feedback.className = 'puzzle-feedback good';
      try {
        await api('/api/practice/submit', { method: 'POST', body: JSON.stringify({ points: 10, badge: { key: 'puzzle_master', name: '🧩 Puzzle Master' } }) });
      } catch(e) {}
    } else {
      playSound('error');
      feedback.textContent = 'Nice try — choose another answer.';
      feedback.className = 'puzzle-feedback try';
    }
  }));

  document.querySelectorAll('.hint-btn').forEach(btn => btn.addEventListener('click', () => {
    playSound('click');
    openAiCoachHint(btn.dataset.hint || 'Focus on letter sounds and word structure!');
  }));
}

// Global Refresh Button ("✨ Refresh Questions / Daily Shuffle")
function refreshSessionQuestions() {
  playSound('badge');
  rotateSessionSeed();
  const lang = (currentLearner && currentLearner.language) || 'Hindi';
  renderPuzzles(lang);
  renderPillarContent(currentPillar, lang);
  renderFlashcards(lang);
  loadLivePracticeQuestion();
  
  const banner = document.createElement('div');
  banner.className = 'shuffle-toast';
  banner.textContent = '✨ Session questions shuffled & refreshed!';
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 2500);
}

// Requests a fresh server-generated item. The database keeps the answer key
// private, so a learner cannot reveal it from the browser before responding.
async function loadLivePracticeQuestion() {
  const card = $('#liveQuestionCard');
  if (!card || !currentLearner) return;
  card.innerHTML = '<p>Preparing a new practice question…</p>';
  try {
    const skills = ['vocab', 'reading', 'writing', 'comprehension'];
    const skill = skills[Math.floor(Math.random() * skills.length)];
    const data = await api(`/api/v1/practice/questions?skill=${skill}&count=1`);
    const question = data.questions[0];
    card.innerHTML = `<h4>✨ Fresh ${skill} challenge</h4><p>${question.question_text}</p><div class="live-question-options">${question.choices.map(choice => `<button type="button" data-live-answer="${choice}">${choice}</button>`).join('')}</div><p class="live-question-feedback"></p>`;
    card.querySelectorAll('[data-live-answer]').forEach(button => button.addEventListener('click', async () => {
      const feedback = card.querySelector('.live-question-feedback');
      card.querySelectorAll('button').forEach(item => item.disabled = true);
      try {
        const result = await api(`/api/v1/practice/questions/${question.token}/answer`, { method: 'POST', body: JSON.stringify({ answer: button.dataset.liveAnswer }) });
        feedback.textContent = result.message;
        feedback.style.color = result.correct ? '#287257' : '#b05d43';
        if (result.correct) playSound('success'); else playSound('error');
        const next = document.createElement('button'); next.type = 'button'; next.textContent = 'Next fresh question →'; next.className = 'btn-executive'; next.style.marginTop = '10px'; next.onclick = loadLivePracticeQuestion; card.append(next);
      } catch (error) { feedback.textContent = error.message; feedback.style.color = '#b05d43'; }
    }));
  } catch (error) { card.innerHTML = '<p>Sign in to receive a fresh practice question.</p>'; }
}

// ----------------------------------------------------
// PILLAR CONTENT & FLASHCARDS
// ----------------------------------------------------
let currentPillar = 'reading';
let pillarIndices = { reading: 0, writing: 0, vocab: 0, comprehension: 0, activities: 0 };

function rotatePracticeItems(items, offset) {
  if (!items.length) return [];
  const start = offset % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

function cleanPracticeWord(word) {
  return String(word).replace(/\s*\([^)]*\)/g, '').trim();
}

function createContinuousPractice(pillar, rawData, index, language) {
  // Once the authored examples are complete, use the language vocabulary to
  // generate another valid practice variation. The counter is unbounded.
  const words = (rawData.vocab || []).flat();
  if (!words.length) return null;
  const [chosen, second = chosen, third = chosen] = rotatePracticeItems(words, index);
  const options = rotatePracticeItems([chosen, second, third], index + 1);

  if (pillar === 'reading') {
    return {
      title: '📖 Read these words aloud',
      text: `${chosen.word} · ${second.word} · ${third.word}`,
      help: `Read each ${language} word slowly, then use the Listen button to hear it again.`
    };
  }
  if (pillar === 'writing') {
    return {
      prompt: `Write the ${language} word for “${chosen.meaning}”.`,
      target: cleanPracticeWord(chosen.word),
      help: 'Type the word carefully, then check your answer.'
    };
  }
  if (pillar === 'vocab') return rotatePracticeItems(words, index).slice(0, Math.min(4, words.length));
  if (pillar === 'comprehension') {
    return {
      story: `${chosen.word} means “${chosen.meaning}”. ${second.word} means “${second.meaning}”.`,
      question: `Which word means “${chosen.meaning}”?`,
      options: options.map(item => item.word),
      correct: chosen.word
    };
  }
  return {
    title: 'Word meaning practice',
    prompt: `Choose the ${language} word for “${chosen.meaning}”.`,
    options: options.map(item => item.word),
    correct: chosen.word
  };
}

function renderPillarContent(pillar, language) {
  currentPillar = pillar || 'reading';
  const flashcardsSection = $('#flashcardsSection');
  if (flashcardsSection) flashcardsSection.classList.toggle('hidden', currentPillar !== 'vocab');
  const rawData = (pillarData[language] || pillarData.default);
  const container = $('#pillarDisplay');
  if (!container) return;
  document.querySelectorAll('.pillar-tab-pro, .pillar-tab').forEach(t => t.classList.toggle('active', t.dataset.pillar === currentPillar));

  const idx = pillarIndices[currentPillar] || 0;

  if (currentPillar === 'reading') {
    const list = rawData.reading;
    const item = list[idx] || createContinuousPractice('reading', rawData, idx, language) || list[idx % list.length];
    container.innerHTML = `
      <h4>${item.title}</h4>
      <p style="font-size:18px; font-weight:600; color:#1e5149; margin:8px 0;">"${item.text}"</p>
      <p style="font-size:13px; color:var(--muted);">${item.help}</p>
      <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
        <button id="readAudioBtn" type="button" class="secondary" style="font-size:13px;">🔊 Listen to Reading</button>
        <button id="nextReadingBtn" type="button" class="btn-executive" style="font-size:13px;">Next Passage ➔</button>
      </div>`;
    if ($('#readAudioBtn')) $('#readAudioBtn').onclick = () => { playSound('click'); playSpeech(item.text, language); };
    if ($('#nextReadingBtn')) $('#nextReadingBtn').onclick = () => { playSound('click'); pillarIndices.reading++; renderPillarContent('reading', language); };
  } else if (currentPillar === 'writing') {
    const list = rawData.writing;
    const item = list[idx] || createContinuousPractice('writing', rawData, idx, language) || list[idx % list.length];
    container.innerHTML = `
      <h4>✍️ Writing practice</h4>
      <p style="font-size:14px; font-weight:600; margin:4px 0 10px; color:#1e5149;">${item.prompt}</p>
      <input id="writeInput" type="text" placeholder="Type answer here..." />
      <div style="display:flex; gap:10px; margin-top:8px;">
        <button id="checkWriteBtn" type="button" class="primary" style="font-size:13px; padding:10px 16px;">Check Answer ✓</button>
        <button id="nextWriteBtn" type="button" class="btn-executive" style="font-size:13px;">Next Question ➔</button>
      </div>
      <p id="writeFeedback" class="exercise-feedback"></p>`;
    if ($('#checkWriteBtn')) $('#checkWriteBtn').onclick = () => {
      const val = $('#writeInput').value.trim();
      const fb = $('#writeFeedback');
      if (val.toLowerCase() === item.target.toLowerCase()) {
        playSound('success');
        fb.textContent = 'Awesome job! Correct answer. ✓ (+15 XP)';
        fb.style.color = '#287257';
      } else {
        playSound('error');
        fb.textContent = 'Try again! Double check spelling.';
        fb.style.color = '#b05d43';
      }
    };
    if ($('#nextWriteBtn')) $('#nextWriteBtn').onclick = () => { playSound('click'); pillarIndices.writing++; renderPillarContent('writing', language); };
  } else if (currentPillar === 'vocab') {
    const sets = rawData.vocab;
    const list = sets[idx] || createContinuousPractice('vocab', rawData, idx, language) || sets[idx % sets.length];
    container.innerHTML = `
      <h4>🔤 Essential vocabulary builder</h4>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-top:10px;">
        ${list.map(v => `
          <div style="background:#f4f9f7; padding:10px 12px; border-radius:8px; border:1px solid #d4e3dc; cursor:pointer;" onclick="playSpeech('${v.word}', '${language}')">
            <p style="font-weight:700; color:#1e5149; margin:0; font-size:15px;">${v.word} 🔊</p>
            <p style="font-size:12px; color:var(--muted); margin:4px 0 0 0;">${v.meaning}</p>
          </div>
        `).join('')}
      </div>
      <button id="nextVocabBtn" type="button" class="btn-executive" style="margin-top:12px; font-size:13px;">Next Vocabulary Set ➔</button>`;
    if ($('#nextVocabBtn')) $('#nextVocabBtn').onclick = () => { playSound('click'); pillarIndices.vocab++; renderPillarContent('vocab', language); };
  } else if (currentPillar === 'comprehension') {
    const list = rawData.comprehension;
    const item = list[idx] || createContinuousPractice('comprehension', rawData, idx, language) || list[idx % list.length];
    container.innerHTML = `
      <h4>🧩 Comprehension practice</h4>
      <p style="background:#edf7df; padding:12px; border-radius:8px; font-size:14px; color:#234d44; margin:8px 0;">${item.story}</p>
      <p style="font-weight:600; font-size:14px; margin:10px 0 6px;">${item.question}</p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        ${item.options.map(opt => `<button class="comp-opt secondary" style="font-size:13px; padding:8px 12px;">${opt}</button>`).join('')}
      </div>
      <p id="compFeedback" class="exercise-feedback"></p>
      <button id="nextCompBtn" type="button" class="btn-executive" style="margin-top:12px; font-size:13px;">Next Question ➔</button>`;
    document.querySelectorAll('.comp-opt').forEach(btn => btn.onclick = () => {
      const fb = $('#compFeedback');
      if (btn.textContent === item.correct) {
        playSound('success');
        fb.textContent = 'Correct! Great comprehension. ✓';
        fb.style.color = '#287257';
      } else {
        playSound('error');
        fb.textContent = 'Not quite — review the passage.';
        fb.style.color = '#b05d43';
      }
    });
    if ($('#nextCompBtn')) $('#nextCompBtn').onclick = () => { playSound('click'); pillarIndices.comprehension++; renderPillarContent('comprehension', language); };
  } else if (currentPillar === 'activities') {
    const list = rawData.activities;
    const act = list[idx] || createContinuousPractice('activities', rawData, idx, language) || list[idx % list.length];
    container.innerHTML = `
      <h4>🎯 Interactive practice</h4>
      <p style="font-size:14px; margin:6px 0;"><strong>${act.title}:</strong> ${act.prompt}</p>
      <div style="display:flex; gap:8px;">${act.options.map(o => `<button class="act-opt secondary" style="padding:8px 14px; font-size:13px;">${o}</button>`).join('')}</div>
      <p id="actFeedback" class="exercise-feedback"></p>
      <button id="nextActBtn" type="button" class="btn-executive" style="margin-top:12px; font-size:13px;">Next Activity ➔</button>`;
    document.querySelectorAll('.act-opt').forEach(btn => btn.onclick = () => {
      const fb = $('#actFeedback');
      if (btn.textContent === act.correct) {
        playSound('success');
        fb.textContent = 'Excellent activity completion! ✓';
        fb.style.color = '#287257';
      } else {
        playSound('error');
        fb.textContent = 'Try another option!';
        fb.style.color = '#b05d43';
      }
    });
    if ($('#nextActBtn')) $('#nextActBtn').onclick = () => { playSound('click'); pillarIndices.activities++; renderPillarContent('activities', language); };
  }
}

// Render Flashcards Mode
function renderFlashcards(language) {
  const flashcardBox = $('#flashcardsContainer');
  if (!flashcardBox) return;
  const vocabItems = (pillarData[language] || pillarData.default).vocab[0] || [];

  flashcardBox.innerHTML = vocabItems.map((item, idx) => `
    <div class="flashcard-item" onclick="this.classList.toggle('flipped'); playSound('click');">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <span class="fc-badge">${language.toUpperCase()} WORD ${idx + 1}</span>
          <h3>${item.word}</h3>
          <p class="fc-hint">Click card to flip ↺</p>
        </div>
        <div class="flashcard-back">
          <span class="fc-badge">MEANING</span>
          <h4>${item.meaning}</h4>
          <button type="button" class="btn-executive" style="margin-top:8px; font-size:11px;" onclick="event.stopPropagation(); playSpeech('${item.word}', '${language}')">🔊 Listen</button>
        </div>
      </div>
    </div>
  `).join('');
}

function speakWithBrowser(text, language, onStatus) {
  if (!('speechSynthesis' in window)) {
    if (onStatus) onStatus('Text-to-speech is not supported in this browser. Try Chrome.');
    return false;
  }
  const locale = langCodes[language] || 'en-US';
  const languageCode = locale.split('-')[0].toLowerCase();
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(voice => voice.lang.toLowerCase() === locale.toLowerCase()) || voices.find(voice => voice.lang.toLowerCase().startsWith(languageCode));
  if (voices.length && !matchingVoice && language !== 'English') {
    if (onStatus) onStatus(`No ${language} voice is installed in this browser. Add a ${language} voice in macOS Spoken Content settings, then refresh.`);
    return false;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = matchingVoice ? matchingVoice.lang : locale;
  if (matchingVoice) utterance.voice = matchingVoice;
  utterance.rate = 0.82;
  utterance.onstart = () => { if (onStatus) onStatus('🔊 Playing audio pronunciation...'); };
  utterance.onerror = () => { if (onStatus) onStatus(`Audio could not play. Check that a ${language} system voice is installed.`); };
  window.speechSynthesis.speak(utterance);
  return true;
}

async function speakText(text, language, onStatus) {
  try {
    const result = await api('/api/voice/synthesize', { method: 'POST', body: JSON.stringify({ text, language }) });
    if (result.audio_base64) {
      const audio = new Audio(`data:${result.mime_type || 'audio/wav'};base64,${result.audio_base64}`);
      audio.onplay = () => { if (onStatus) onStatus('🔊 Playing Sarvam AI pronunciation...'); };
      audio.onerror = () => { if (onStatus) onStatus('Sarvam audio could not play. Trying browser speech…'); speakWithBrowser(text, language, onStatus); };
      await audio.play();
      return true;
    }
  } catch (error) {
    if (onStatus) onStatus(`${error.message} Trying browser speech…`);
  }
  return speakWithBrowser(text, language, onStatus);
}

function playSpeech(text, language) {
  speakText(text, language);
}

// Chrome loads system voices asynchronously on some macOS installations.
if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

// ----------------------------------------------------
// SPEECH ENGINE & AUDIO VISUALIZER
// ----------------------------------------------------
const voicePromptBank = {
  Hindi: ['नमस्ते', 'मेरा नाम रवि है', 'मुझे पानी चाहिए', 'यह मेरी किताब है', 'धन्यवाद', 'मैं आज पढ़ाई करूंगा', 'मुझे लिखना पसंद है', 'मेरा घर पास में है', 'कृपया धीरे बोलिए', 'मुझे मदद चाहिए', 'आज मौसम अच्छा है', 'मैं नया शब्द सीख रहा हूँ'],
  English: ['Hello', 'My name is Ravi', 'I need water', 'This is my book', 'Thank you', 'I will study today', 'I like to write', 'My home is nearby', 'Please speak slowly', 'I need help', 'The weather is good today', 'I am learning a new word'],
  Telugu: ['నమస్కారం', 'నా పేరు రవి', 'నాకు నీరు కావాలి', 'ఇది నా పుస్తకం', 'ధన్యవాదాలు', 'నేను ఈరోజు చదువుతాను', 'నాకు రాయడం ఇష్టం', 'నా ఇల్లు దగ్గరలో ఉంది', 'దయచేసి నెమ్మదిగా మాట్లాడండి', 'నాకు సహాయం కావాలి', 'ఈరోజు వాతావరణం బాగుంది', 'నేను కొత్త పదం నేర్చుకుంటున్నాను'],
  Tamil: ['வணக்கம்', 'என் பெயர் ரவி', 'எனக்கு தண்ணீர் வேண்டும்', 'இது என் புத்தகம்', 'நன்றி', 'நான் இன்று படிப்பேன்', 'எனக்கு எழுத பிடிக்கும்', 'என் வீடு அருகில் உள்ளது', 'தயவு செய்து மெதுவாக பேசுங்கள்', 'எனக்கு உதவி வேண்டும்'],
  Kannada: ['ನಮಸ್ಕಾರ', 'ನನ್ನ ಹೆಸರು ರವಿ', 'ನನಗೆ ನೀರು ಬೇಕು', 'ಇದು ನನ್ನ ಪುಸ್ತಕ', 'ಧನ್ಯವಾದಗಳು', 'ನಾನು ಇಂದು ಓದುತ್ತೇನೆ', 'ನನಗೆ ಬರೆಯಲು ಇಷ್ಟ', 'ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ', 'ನನಗೆ ಸಹಾಯ ಬೇಕು'],
  Malayalam: ['നമസ്കാരം', 'എന്റെ പേര് രവി', 'എനിക്ക് വെള്ളം വേണം', 'ഇത് എന്റെ പുസ്തകമാണ്', 'നന്ദി', 'ഞാൻ ഇന്ന് പഠിക്കും', 'എനിക്ക് എഴുതാൻ ഇഷ്ടമാണ്', 'ദയവായി പതുക്കെ സംസാരിക്കുക', 'എനിക്ക് സഹായം വേണം'],
  Bengali: ['নমস্কার', 'আমার নাম রবি', 'আমার জল চাই', 'এটি আমার বই', 'ধন্যবাদ', 'আমি আজ পড়ব', 'আমি লিখতে পছন্দ করি', 'দয়া করে ধীরে বলুন', 'আমার সাহায্য চাই'],
  Marathi: ['नमस्कार', 'माझे नाव रवी आहे', 'मला पाणी हवे आहे', 'हे माझे पुस्तक आहे', 'धन्यवाद', 'मी आज अभ्यास करेन', 'मला लिहायला आवडते', 'कृपया हळू बोला', 'मला मदत हवी आहे']
};
let currentLang = 'Hindi';
let recentVoicePrompts = [];

function setVoicePrompt() {
  const prompts = voicePromptBank[currentLang] || voicePromptBank.English;
  const available = prompts.filter(prompt => !recentVoicePrompts.includes(prompt));
  const choices = available.length ? available : prompts;
  const target = choices[Math.floor(Math.random() * choices.length)];
  recentVoicePrompts = [...recentVoicePrompts.slice(-(prompts.length - 1)), target];
  if ($('#voiceTargetText')) $('#voiceTargetText').textContent = target;
  if ($('#voiceStatus')) $('#voiceStatus').textContent = 'Listen, then repeat the phrase clearly.';
  if ($('#voiceResult')) $('#voiceResult').classList.add('hidden');
}

function normalizeSpeechText(text) {
  return text
    .normalize('NFKD')
    .replace(/\([^)]*\)/g, '')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

function pronunciationScore(spoken, target) {
  const actual = normalizeSpeechText(spoken);
  const expected = normalizeSpeechText(target);
  if (!actual || !expected) return 0;
  const row = Array.from({ length: expected.length + 1 }, (_, index) => index);
  for (let i = 1; i <= actual.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= expected.length; j += 1) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (actual[i - 1] === expected[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return Math.round(Math.max(0, 1 - row[expected.length] / Math.max(actual.length, expected.length)) * 100);
}

function showVoiceUnavailable(message) {
  drawAudioVisualizer(false);
  if ($('#voiceStatus')) $('#voiceStatus').textContent = message;
  if ($('#voiceResult')) $('#voiceResult').classList.add('hidden');
}

function setupVoiceCoach(language) {
  currentLang = language || 'Hindi';
  recentVoicePrompts = [];
  setVoicePrompt();
}

let visualizerAnimFrame = null;
function drawAudioVisualizer(active) {
  const canvas = $('#voiceVisualizerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!active) {
    if (visualizerAnimFrame) cancelAnimationFrame(visualizerAnimFrame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  let step = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#10b981';
    for (let i = 0; i < 24; i++) {
      const h = Math.sin(step + i * 0.4) * 18 + 22;
      ctx.fillRect(i * 12 + 10, canvas.height / 2 - h / 2, 6, h);
    }
    step += 0.15;
    visualizerAnimFrame = requestAnimationFrame(animate);
  }
  animate();
}

if ($('#listenBtn')) {
  $('#listenBtn').addEventListener('click', () => {
    playSound('click');
    const text = $('#voiceTargetText') ? $('#voiceTargetText').textContent : '';
    speakText(text, currentLang, message => { if ($('#voiceStatus')) $('#voiceStatus').textContent = message; });
  });
}

if ($('#nextVoiceQuestion')) {
  $('#nextVoiceQuestion').addEventListener('click', () => {
    playSound('click');
    setVoicePrompt();
  });
}

if ($('#speakBtn')) {
  $('#speakBtn').addEventListener('click', () => {
    playSound('click');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const target = $('#voiceTargetText') ? $('#voiceTargetText').textContent.trim() : '';
    drawAudioVisualizer(true);
    if (!SpeechRecognition) {
      showVoiceUnavailable('Speech recognition is not available in this browser. Try Chrome or use the Listen button to practise.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = langCodes[currentLang] || 'en-US';
      if ($('#voiceStatus')) $('#voiceStatus').textContent = '🎙️ Listening... Speak now.';
      recognition.start();
      recognition.onresult = async (event) => {
        drawAudioVisualizer(false);
        const spoken = event.results[0][0].transcript;
        const score = pronunciationScore(spoken, target);
        await showVoiceResult(spoken, score, target);
      };
      recognition.onerror = () => showVoiceUnavailable('We could not hear that. Please allow microphone access and try again.');
    } catch (err) { showVoiceUnavailable('Unable to start voice practice. Please check microphone access and try again.'); }
  });
}

async function showVoiceResult(spoken, score, target) {
  playSound(score >= 80 ? 'success' : 'error');
  if ($('#voiceStatus')) $('#voiceStatus').textContent = '✓ Evaluation complete!';
  if ($('#voiceResult')) $('#voiceResult').classList.remove('hidden');
  if ($('#voiceSpoken')) $('#voiceSpoken').textContent = spoken;
  if ($('#voiceScore')) $('#voiceScore').textContent = `${score}% Match (${score >= 80 ? 'Excellent pronunciation!' : 'Keep practicing'})`;
  try {
    await api('/api/voice/assess', { method: 'POST', body: JSON.stringify({ target_text: target, spoken_text: spoken, match_score: score }) });
    const badge = score >= 85 ? { key: 'voice_star', name: '🎙️ Voice Pronunciation Star' } : null;
    await api('/api/practice/submit', { method: 'POST', body: JSON.stringify({ points: 20, badge }) });
  } catch (err) {}
}

// ----------------------------------------------------
// ACHIEVEMENTS & BADGES RENDERER
// ----------------------------------------------------
function renderAchievements(achievements) {
  const container = $('#achievementsGrid');
  if (!container) return;

  const defaultBadges = [
    { badge_key: 'first_step', badge_name: '🌟 Neo-Learner Pioneer', desc: 'Registered on Akshara Portal' },
    { badge_key: 'streak_3', badge_name: '🔥 3-Day Streak Master', desc: 'Learned 3 days continuously' },
    { badge_key: 'puzzle_master', badge_name: '🧩 Puzzle Master', desc: 'Completed literacy puzzles' },
    { badge_key: 'voice_star', badge_name: '🎙️ Voice Star', desc: 'Achieved 85%+ pronunciation score' },
    { badge_key: 'lesson_1', badge_name: '📚 Module Scholar', desc: 'Completed a micro-lesson module' }
  ];

  const unlockedKeys = new Set((achievements || []).map(a => a.badge_key));

  container.innerHTML = defaultBadges.map(b => {
    const isUnlocked = unlockedKeys.has(b.badge_key);
    return `
      <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="badge-icon">${b.badge_name.split(' ')[0]}</div>
        <h5>${b.badge_name}</h5>
        <p>${b.desc}</p>
        <span class="badge-status">${isUnlocked ? 'Unlocked ✓' : 'Locked 🔒'}</span>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// AI TUTOR ASSISTANT DRAWER & HINT SYSTEM
// ----------------------------------------------------
function openAiCoachHint(customHint) {
  const drawer = $('#aiCoachDrawer');
  const text = $('#aiCoachHintText');
  if (drawer && text) {
    text.textContent = customHint || `Keep practicing reading and speaking daily in ${currentLearner ? currentLearner.language : 'your language'}! Small steps lead to fluency.`;
    drawer.classList.remove('hidden');
    playSound('badge');
  }
}

if ($('#toggleAiCoachBtn')) {
  $('#toggleAiCoachBtn').addEventListener('click', () => {
    playSound('click');
    openAiCoachHint();
  });
}
if ($('#closeAiCoachBtn')) {
  $('#closeAiCoachBtn').addEventListener('click', () => {
    playSound('click');
    if ($('#aiCoachDrawer')) $('#aiCoachDrawer').classList.add('hidden');
  });
}

// ----------------------------------------------------
// CERTIFICATE GENERATOR MODAL
// ----------------------------------------------------
function openCertificateModal() {
  playSound('badge');
  const modal = $('#certificateModal');
  if (!modal || !currentLearner) return;

  $('#certName').textContent = currentLearner.name || 'Learner';
  $('#certLang').textContent = currentLearner.language || 'Hindi';
  $('#certLevel').textContent = currentLearner.proficiency || 'Beginner';
  $('#certDate').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  modal.classList.remove('hidden');
}

if ($('#viewCertBtn')) $('#viewCertBtn').addEventListener('click', openCertificateModal);
if ($('#closeCertModal')) $('#closeCertModal').addEventListener('click', () => $('#certificateModal').classList.add('hidden'));
if ($('#printCertBtn')) $('#printCertBtn').addEventListener('click', () => window.print());

// ----------------------------------------------------
// THEME SWITCHER (DARK / LIGHT MODE)
// ----------------------------------------------------
function initTheme() {
  const saved = localStorage.getItem('akshara_theme') || 'light';
  if (saved === 'dark') document.body.classList.add('dark-theme');
  else document.body.classList.remove('dark-theme');
}

if ($('#themeToggleBtn')) {
  $('#themeToggleBtn').addEventListener('click', () => {
    playSound('click');
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('akshara_theme', isDark ? 'dark' : 'light');
  });
}
initTheme();

// ----------------------------------------------------
// PROFILE & AUTH HANDLERS
// ----------------------------------------------------
$('#profileForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = $('#profileMessage');
  message.textContent = '';
  message.className = 'success';
  try {
    const data = formData(event.target);
    const { learner } = await api('/api/learners/me', { method: 'PUT', body: JSON.stringify(data) });
    playSound('success');
    showProfile(learner);
    message.textContent = 'Your profile has been updated.';
    if (data.language) {
      updateLanguage(data.language, false);
    }
  } catch (err) {
    playSound('error');
    message.textContent = err.message;
    message.className = 'error';
  }
});

async function logout() {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    showPublicHome();
    if (forms.login) forms.login.reset();
    if (forms.register) forms.register.reset();
  }
}

async function fetchAndShowProfile() {
  try {
    const res = await api('/api/learners/me');
    if (res && res.learner) {
      showProfile(res.learner);
      return;
    }
  } catch (err) {}
  if (currentLearner) showProfile(currentLearner);
}

async function fetchAndShowDashboard() {
  try {
    const res = await api('/api/learners/me');
    if (res && res.learner) {
      showDashboard(res.learner);
      return;
    }
  } catch (err) {}
  if (currentLearner) showDashboard(currentLearner);
}

if ($('#retakeAssessment')) {
  $('#retakeAssessment').addEventListener('click', async () => {
    try {
      const res = await api('/api/learners/me');
      if (res && res.learner) startAssessment(res.learner);
      else if (currentLearner) startAssessment(currentLearner);
    } catch (err) {
      if (currentLearner) startAssessment(currentLearner);
    }
  });
}

if ($('#openDashboard')) $('#openDashboard').addEventListener('click', fetchAndShowDashboard);
if ($('#dashboardProfile')) $('#dashboardProfile').addEventListener('click', fetchAndShowProfile);
if ($('#logout')) $('#logout').addEventListener('click', logout);
if ($('#dashboardLogout')) $('#dashboardLogout').addEventListener('click', logout);
if ($('#assessmentLogout')) $('#assessmentLogout').addEventListener('click', logout);

if ($('#globalRefreshBtn')) $('#globalRefreshBtn').addEventListener('click', refreshSessionQuestions);

// Initial session check
api('/api/learners/me')
  .then(({ learner }) => {
    currentLearner = learner;
    if (learner.assessmentCompleted) showDashboard(learner);
    else startAssessment(learner);
  })
  .catch(() => {});
