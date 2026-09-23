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
document.querySelectorAll('[data-auth-mode]').forEach(button => button.addEventListener('click', () => {
  playSound('click');
  openAuth(button.dataset.authMode === 'login' ? 'login' : 'register');
}));
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
  renderDailyWord(newLang);
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
  English: { portalLabel: 'AKSHARA', workspaceLabel: 'My learning home', overview: 'Home', learningStructure: 'Learning Structure', microLessons: 'My Learning Path', challengesGames: 'Challenges & Games', quizzes: 'Quizzes', speechEngine: 'Speech Engine', analyticsBadges: 'Analytics & Badges', reading: 'Reading', writing: 'Writing', vocabulary: 'Vocabulary', comprehension: 'Comprehension', practiceActivities: 'Practice activities' },
  Hindi: { portalLabel: 'अक्षरा', workspaceLabel: 'मेरा सीखने का घर', overview: 'होम', learningStructure: 'सीखने की संरचना', microLessons: 'मेरा सीखने का पथ', challengesGames: 'चुनौतियाँ और खेल', quizzes: 'प्रश्नोत्तरी', speechEngine: 'भाषण अभ्यास', analyticsBadges: 'विश्लेषण और बैज', reading: 'पठन', writing: 'लेखन', vocabulary: 'शब्दावली', comprehension: 'समझ', practiceActivities: 'अभ्यास गतिविधियाँ' },
  Telugu: { portalLabel: 'అక్షర', workspaceLabel: 'నా అభ్యాస నిలయం', overview: 'హోమ్', learningStructure: 'అభ్యాస నిర్మాణం', microLessons: 'నా అభ్యాస మార్గం', challengesGames: 'సవాళ్లు మరియు ఆటలు', quizzes: 'క్విజ్‌లు', speechEngine: 'స్పీచ్ అభ్యాసం', analyticsBadges: 'విశ్లేషణ & బ్యాడ్జ్‌లు', reading: 'చదవడం', writing: 'రాయడం', vocabulary: 'పదజాలం', comprehension: 'అవగాహన', practiceActivities: 'అభ్యాస కార్యకలాపాలు' },
  Tamil: { portalLabel: 'அக்ஷரா', workspaceLabel: 'என் கற்றல் முகப்பு', overview: 'முகப்பு', learningStructure: 'கற்றல் அமைப்பு', microLessons: 'என் கற்றல் பாதை', challengesGames: 'சவால்கள் மற்றும் விளையாட்டுகள்', quizzes: 'வினாடி வினாக்கள்', speechEngine: 'பேச்சுப் பயிற்சி', analyticsBadges: 'பகுப்பாய்வு & பதக்கங்கள்', reading: 'வாசித்தல்', writing: 'எழுதுதல்', vocabulary: 'சொற்களஞ்சியம்', comprehension: 'புரிதல்', practiceActivities: 'பயிற்சி செயல்கள்' },
  Kannada: { portalLabel: 'ಅಕ್ಷರ', workspaceLabel: 'ನನ್ನ ಕಲಿಕೆ ಮುಖಪುಟ', overview: 'ಮುಖಪುಟ', learningStructure: 'ಕಲಿಕೆ ರಚನೆ', microLessons: 'ನನ್ನ ಕಲಿಕೆ ಪಥ', challengesGames: 'ಸವಾಲುಗಳು ಮತ್ತು ಆಟಗಳು', quizzes: 'ಪ್ರಶ್ನೋತ್ತರಗಳು', speechEngine: 'ಮಾತಿನ ಅಭ್ಯಾಸ', analyticsBadges: 'ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಬ್ಯಾಡ್ಜ್‌ಗಳು', reading: 'ಓದುವುದು', writing: 'ಬರೆಯುವುದು', vocabulary: 'ಪದಕೋಶ', comprehension: 'ತಿಳುವಳಿಕೆ', practiceActivities: 'ಅಭ್ಯಾಸ ಚಟುವಟಿಕೆಗಳು' }
};

// Main dashboard controls and page headings. Learning content intentionally
// remains in the learner's chosen learning language.
const interfaceExtraCopy = {
  English: { learningLanguage: 'Learning language', interfaceLanguage: 'Interface language', shuffleQuestions: 'Shuffle Questions', certificate: 'Certificate', theme: 'Theme', profile: 'My profile', logout: 'Logout', welcomeHome: 'WELCOME HOME', homeQuestion: 'What would you like to learn today?', homeExplain: 'Choose one small activity. Akshara will guide you step by step, at your own pace.', startNext: 'Start my next lesson', beginActivity: 'Begin activity', todayPlan: "TODAY'S PLAN", smallSteps: 'Three small steps', easyStart: 'Easy start', wordDay: 'WORD OF THE DAY', listenSayRemember: 'Listen. Say. Remember.', listen: 'Listen', newWord: 'New word', practiceBySkill: 'PRACTISE BY SKILL', buildLiteracy: 'Build literacy one skill at a time', skillExplain: 'Choose a pillar and work through short, supportive activities at your own pace.', skillPractice: 'Skill practice', myPath: 'MY LEARNING PATH', pathTitle: 'Your lessons, one small step at a time', pathExplain: 'Begin with familiar pictures and sounds, then explore letters and simple words when you feel ready.', nextSteps: 'Your next steps', speakConfidence: 'SPEAK WITH CONFIDENCE', voiceTitle: 'Listen, repeat, and improve', voiceExplain: 'Use your microphone to receive feedback on the phrase you practised.', voicePractice: 'Voice practice' },
  Hindi: { learningLanguage: 'सीखने की भाषा', interfaceLanguage: 'इंटरफ़ेस भाषा', shuffleQuestions: 'प्रश्न बदलें', certificate: 'प्रमाणपत्र', theme: 'थीम', profile: 'मेरी प्रोफ़ाइल', logout: 'लॉग आउट', welcomeHome: 'होम में आपका स्वागत है', homeQuestion: 'आज आप क्या सीखना चाहेंगे?', homeExplain: 'एक छोटी गतिविधि चुनें। अक्षरा आपको अपनी गति से चरण-दर-चरण सिखाएगा।', startNext: 'अगला पाठ शुरू करें', beginActivity: 'गतिविधि शुरू करें', todayPlan: 'आज की योजना', smallSteps: 'तीन छोटे कदम', easyStart: 'आसान शुरुआत', wordDay: 'आज का शब्द', listenSayRemember: 'सुनें। बोलें। याद रखें।', listen: 'सुनें', newWord: 'नया शब्द', practiceBySkill: 'कौशल के अनुसार अभ्यास', buildLiteracy: 'एक समय में एक कौशल सीखें', skillExplain: 'अपनी गति से छोटे और सहायक अभ्यास चुनें।', skillPractice: 'कौशल अभ्यास', myPath: 'मेरा सीखने का पथ', pathTitle: 'आपके पाठ, एक-एक छोटे कदम में', pathExplain: 'परिचित चित्रों और ध्वनियों से शुरू करें, फिर अक्षर और सरल शब्द सीखें।', nextSteps: 'आपके अगले कदम', speakConfidence: 'आत्मविश्वास से बोलें', voiceTitle: 'सुनें, दोहराएं और सुधारें', voiceExplain: 'जिस वाक्य का अभ्यास किया है उस पर प्रतिक्रिया पाने के लिए माइक्रोफ़ोन का उपयोग करें।', voicePractice: 'बोलने का अभ्यास' },
  Telugu: { learningLanguage: 'నేర్చుకునే భాష', interfaceLanguage: 'ఇంటర్‌ఫేస్ భాష', shuffleQuestions: 'ప్రశ్నలను మార్చండి', certificate: 'సర్టిఫికేట్', theme: 'థీమ్', profile: 'నా ప్రొఫైల్', logout: 'లాగ్ అవుట్', welcomeHome: 'హోమ్‌కు స్వాగతం', homeQuestion: 'ఈ రోజు మీరు ఏమి నేర్చుకోవాలనుకుంటున్నారు?', homeExplain: 'ఒక చిన్న కార్యకలాపాన్ని ఎంచుకోండి. అక్షర మిమ్మల్ని మీ వేగంతో దశలవారీగా నేర్పుతుంది.', startNext: 'తదుపరి పాఠాన్ని ప్రారంభించండి', beginActivity: 'కార్యకలాపం ప్రారంభించండి', todayPlan: 'నేటి ప్రణాళిక', smallSteps: 'మూడు చిన్న అడుగులు', easyStart: 'సులభమైన ప్రారంభం', wordDay: 'నేటి పదం', listenSayRemember: 'వినండి. చెప్పండి. గుర్తుంచుకోండి.', listen: 'వినండి', newWord: 'కొత్త పదం', practiceBySkill: 'నైపుణ్యాన్ని బట్టి అభ్యాసం', buildLiteracy: 'ఒకేసారి ఒక నైపుణ్యాన్ని నేర్చుకోండి', skillExplain: 'మీ వేగంతో చిన్న సహాయక కార్యకలాపాలను ఎంచుకోండి.', skillPractice: 'నైపుణ్య అభ్యాసం', myPath: 'నా అభ్యాస మార్గం', pathTitle: 'మీ పాఠాలు, ఒకేసారి ఒక చిన్న అడుగు', pathExplain: 'తెలిసిన చిత్రాలు మరియు శబ్దాలతో ప్రారంభించి, అక్షరాలు మరియు సరళమైన పదాలను నేర్చుకోండి.', nextSteps: 'మీ తదుపరి అడుగులు', speakConfidence: 'ఆత్మవిశ్వాసంతో మాట్లాడండి', voiceTitle: 'వినండి, పునరావృతం చేయండి మరియు మెరుగుపరచండి', voiceExplain: 'మీరు అభ్యసించిన వాక్యంపై అభిప్రాయం కోసం మైక్రోఫోన్ ఉపయోగించండి.', voicePractice: 'మాట్లాడే అభ్యాసం' },
  Tamil: { learningLanguage: 'கற்கும் மொழி', interfaceLanguage: 'இடைமுக மொழி', shuffleQuestions: 'கேள்விகளை மாற்று', certificate: 'சான்றிதழ்', theme: 'தீம்', profile: 'என் சுயவிவரம்', logout: 'வெளியேறு', welcomeHome: 'முகப்பிற்கு வரவேற்கிறோம்', homeQuestion: 'இன்று நீங்கள் என்ன கற்க விரும்புகிறீர்கள்?', homeExplain: 'ஒரு சிறிய செயல்பாட்டைத் தேர்ந்தெடுக்கவும். அக்ஷரா உங்கள் வேகத்தில் படிப்படியாக வழிகாட்டும்.', startNext: 'அடுத்த பாடத்தைத் தொடங்கு', beginActivity: 'செயல்பாட்டைத் தொடங்கு', todayPlan: 'இன்றைய திட்டம்', smallSteps: 'மூன்று சிறிய படிகள்', easyStart: 'எளிய தொடக்கம்', wordDay: 'இன்றைய சொல்', listenSayRemember: 'கேளுங்கள். சொல்லுங்கள். நினைவில் கொள்ளுங்கள்.', listen: 'கேளுங்கள்', newWord: 'புதிய சொல்', practiceBySkill: 'திறன் அடிப்படையிலான பயிற்சி', buildLiteracy: 'ஒரு நேரத்தில் ஒரு திறனைக் கற்கவும்', skillExplain: 'உங்கள் வேகத்தில் சிறிய உதவும் செயல்பாடுகளைத் தேர்ந்தெடுக்கவும்.', skillPractice: 'திறன் பயிற்சி', myPath: 'என் கற்றல் பாதை', pathTitle: 'உங்கள் பாடங்கள், ஒரு சிறிய படி வீதம்', pathExplain: 'பரிச்சயமான படங்கள் மற்றும் ஒலிகளுடன் தொடங்கி, எழுத்துகளையும் எளிய சொற்களையும் கற்கவும்.', nextSteps: 'உங்கள் அடுத்த படிகள்', speakConfidence: 'நம்பிக்கையுடன் பேசுங்கள்', voiceTitle: 'கேளுங்கள், மீண்டும் சொல்லுங்கள், மேம்படுத்துங்கள்', voiceExplain: 'நீங்கள் பயிற்சி செய்த சொற்றொடருக்கான கருத்தைப் பெற மைக்ரோஃபோனைப் பயன்படுத்தவும்.', voicePractice: 'பேச்சுப் பயிற்சி' },
  Kannada: { learningLanguage: 'ಕಲಿಕೆಯ ಭಾಷೆ', interfaceLanguage: 'ಇಂಟರ್‌ಫೇಸ್ ಭಾಷೆ', shuffleQuestions: 'ಪ್ರಶ್ನೆಗಳನ್ನು ಬದಲಿಸಿ', certificate: 'ಪ್ರಮಾಣಪತ್ರ', theme: 'ಥೀಮ್', profile: 'ನನ್ನ ಪ್ರೊಫೈಲ್', logout: 'ಲಾಗ್ ಔಟ್', welcomeHome: 'ಮುಖಪುಟಕ್ಕೆ ಸ್ವಾಗತ', homeQuestion: 'ಇಂದು ನೀವು ಏನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?', homeExplain: 'ಒಂದು ಸಣ್ಣ ಚಟುವಟಿಕೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಅಕ್ಷರವು ನಿಮ್ಮ ವೇಗದಲ್ಲಿ ಹಂತ ಹಂತವಾಗಿ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ.', startNext: 'ಮುಂದಿನ ಪಾಠ ಆರಂಭಿಸಿ', beginActivity: 'ಚಟುವಟಿಕೆ ಆರಂಭಿಸಿ', todayPlan: 'ಇಂದಿನ ಯೋಜನೆ', smallSteps: 'ಮೂರು ಸಣ್ಣ ಹೆಜ್ಜೆಗಳು', easyStart: 'ಸುಲಭ ಆರಂಭ', wordDay: 'ಇಂದಿನ ಪದ', listenSayRemember: 'ಆಲಿಸಿ. ಹೇಳಿ. ನೆನಪಿಡಿ.', listen: 'ಆಲಿಸಿ', newWord: 'ಹೊಸ ಪದ', practiceBySkill: 'ಕೌಶಲ್ಯದ ಮೂಲಕ ಅಭ್ಯಾಸ', buildLiteracy: 'ಒಮ್ಮೆಗೆ ಒಂದು ಕೌಶಲ್ಯ ಕಲಿಯಿರಿ', skillExplain: 'ನಿಮ್ಮ ವೇಗದಲ್ಲಿ ಸಣ್ಣ ಸಹಾಯಕ ಚಟುವಟಿಕೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.', skillPractice: 'ಕೌಶಲ್ಯ ಅಭ್ಯಾಸ', myPath: 'ನನ್ನ ಕಲಿಕೆ ಪಥ', pathTitle: 'ನಿಮ್ಮ ಪಾಠಗಳು, ಒಂದೊಂದೇ ಸಣ್ಣ ಹೆಜ್ಜೆ', pathExplain: 'ಪರಿಚಿತ ಚಿತ್ರಗಳು ಮತ್ತು ಧ್ವನಿಗಳಿಂದ ಆರಂಭಿಸಿ, ನಂತರ ಅಕ್ಷರಗಳು ಮತ್ತು ಸರಳ ಪದಗಳನ್ನು ಕಲಿಯಿರಿ.', nextSteps: 'ನಿಮ್ಮ ಮುಂದಿನ ಹೆಜ್ಜೆಗಳು', speakConfidence: 'ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಮಾತನಾಡಿ', voiceTitle: 'ಆಲಿಸಿ, ಪುನರಾವರ್ತಿಸಿ ಮತ್ತು ಸುಧಾರಿಸಿ', voiceExplain: 'ನೀವು ಅಭ್ಯಾಸ ಮಾಡಿದ ವಾಕ್ಯದ ಪ್ರತಿಕ್ರಿಯೆಗಾಗಿ ಮೈಕ್ರೊಫೋನ್ ಬಳಸಿ.', voicePractice: 'ಮಾತಿನ ಅಭ್ಯಾಸ' }
};

const interfaceSectionCopy = {
  English: { coreCurriculum: 'CORE CURRICULUM', learningContent: 'Learning Content Structure', pillarsActive: '5 Pillars Active', pillarHelper: 'Select a learning pillar to practise with instant feedback. Use Next anytime for continuous, fresh practice.', firstStep: 'TODAY’S FIRST STEP', seeHearSay: 'See it. Hear it. Say it.', noReading: 'No reading needed', whenReady: 'WHEN YOU FEEL READY', nextPath: 'Your next learning path', smartLab: 'SMART LESSON LAB', personalLesson: 'A lesson made for you', adaptive: 'Adaptive', gameLearning: 'GAMIFIED LEARNING', practiceCorner: 'Practice Corner (Dynamic Session Pool)', aiSpeech: 'AI SPEECH ENGINE', voiceCoach: 'Voice Learning & Pronunciation Coach', trackGrowth: 'TRACK YOUR GROWTH', learningProgress: 'Your learning progress', reportHelp: 'Review completed lessons, voice practice, and the badges you have earned.', viewCertificate: 'View certificate', performanceReport: 'Learner Performance & Progress Report', unlockedBadges: 'Unlocked Achievement Badges', badgesTrophies: 'Badges & Trophies' },
  Hindi: { coreCurriculum: 'मुख्य पाठ्यक्रम', learningContent: 'सीखने की सामग्री संरचना', pillarsActive: '5 कौशल सक्रिय', firstStep: 'आज का पहला कदम', seeHearSay: 'देखें। सुनें। बोलें।', noReading: 'पढ़ना जरूरी नहीं', whenReady: 'जब आप तैयार हों', nextPath: 'आपका अगला सीखने का पथ', smartLab: 'स्मार्ट पाठ प्रयोगशाला', personalLesson: 'आपके लिए बना पाठ', adaptive: 'अनुकूलित', gameLearning: 'खेल-आधारित सीखना', practiceCorner: 'अभ्यास कोना', aiSpeech: 'एआई स्पीच इंजन', voiceCoach: 'वॉइस लर्निंग और उच्चारण कोच', trackGrowth: 'अपनी प्रगति देखें', learningProgress: 'आपकी सीखने की प्रगति', reportHelp: 'पूरे पाठ, वॉइस अभ्यास और अर्जित बैज देखें।', viewCertificate: 'प्रमाणपत्र देखें', performanceReport: 'सीखने के प्रदर्शन और प्रगति की रिपोर्ट', unlockedBadges: 'अनलॉक किए गए उपलब्धि बैज', badgesTrophies: 'बैज और ट्रॉफियां' },
  Telugu: { coreCurriculum: 'ప్రధాన పాఠ్యక్రమం', learningContent: 'అభ్యాస కంటెంట్ నిర్మాణం', pillarsActive: '5 నైపుణ్యాలు సక్రియం', firstStep: 'నేటి మొదటి అడుగు', seeHearSay: 'చూడండి. వినండి. చెప్పండి.', noReading: 'చదవాల్సిన అవసరం లేదు', whenReady: 'మీరు సిద్ధంగా ఉన్నప్పుడు', nextPath: 'మీ తదుపరి అభ్యాస మార్గం', smartLab: 'స్మార్ట్ పాఠ ప్రయోగశాల', personalLesson: 'మీ కోసం రూపొందించిన పాఠం', adaptive: 'అనుకూలమైనది', gameLearning: 'ఆటల ద్వారా అభ్యాసం', practiceCorner: 'అభ్యాస మూల', aiSpeech: 'ఏఐ స్పీచ్ ఇంజిన్', voiceCoach: 'వాయిస్ అభ్యాసం మరియు ఉచ్చారణ కోచ్', trackGrowth: 'మీ ఎదుగుదలను గమనించండి', learningProgress: 'మీ అభ్యాస పురోగతి', reportHelp: 'పూర్తయిన పాఠాలు, వాయిస్ అభ్యాసం మరియు మీ బ్యాడ్జ్‌లను చూడండి.', viewCertificate: 'సర్టిఫికేట్ చూడండి', performanceReport: 'అభ్యాస పనితీరు మరియు పురోగతి నివేదిక', unlockedBadges: 'అన్‌లాక్ చేసిన సాధన బ్యాడ్జ్‌లు', badgesTrophies: 'బ్యాడ్జ్‌లు మరియు ట్రోఫీలు' },
  Tamil: { coreCurriculum: 'முக்கிய பாடத்திட்டம்', learningContent: 'கற்றல் உள்ளடக்க அமைப்பு', pillarsActive: '5 திறன்கள் செயல்பாட்டில்', firstStep: 'இன்றைய முதல் படி', seeHearSay: 'பாருங்கள். கேளுங்கள். சொல்லுங்கள்.', noReading: 'வாசிக்கத் தேவையில்லை', whenReady: 'நீங்கள் தயாராக இருக்கும்போது', nextPath: 'உங்கள் அடுத்த கற்றல் பாதை', smartLab: 'ஸ்மார்ட் பாட ஆய்வகம்', personalLesson: 'உங்களுக்காக உருவாக்கிய பாடம்', adaptive: 'தனிப்பயனாக்கப்பட்டது', gameLearning: 'விளையாட்டு வழிக் கற்றல்', practiceCorner: 'பயிற்சி பகுதி', aiSpeech: 'ஏஐ பேச்சு இயந்திரம்', voiceCoach: 'குரல் கற்றல் மற்றும் உச்சரிப்பு பயிற்சியாளர்', trackGrowth: 'உங்கள் வளர்ச்சியைக் கண்காணிக்கவும்', learningProgress: 'உங்கள் கற்றல் முன்னேற்றம்', reportHelp: 'முடித்த பாடங்கள், குரல் பயிற்சி மற்றும் பெற்ற பதக்கங்களைக் காணுங்கள்.', viewCertificate: 'சான்றிதழைப் பார்க்கவும்', performanceReport: 'கற்றல் செயல்திறன் மற்றும் முன்னேற்ற அறிக்கை', unlockedBadges: 'திறக்கப்பட்ட சாதனை பதக்கங்கள்', badgesTrophies: 'பதக்கங்கள் மற்றும் கோப்பைகள்' },
  Kannada: { coreCurriculum: 'ಮುಖ್ಯ ಪಠ್ಯಕ್ರಮ', learningContent: 'ಕಲಿಕಾ ವಿಷಯ ರಚನೆ', pillarsActive: '5 ಕೌಶಲ್ಯಗಳು ಸಕ್ರಿಯ', firstStep: 'ಇಂದಿನ ಮೊದಲ ಹೆಜ್ಜೆ', seeHearSay: 'ನೋಡಿ. ಆಲಿಸಿ. ಹೇಳಿ.', noReading: 'ಓದುವ ಅಗತ್ಯವಿಲ್ಲ', whenReady: 'ನೀವು ಸಿದ್ಧರಾದಾಗ', nextPath: 'ನಿಮ್ಮ ಮುಂದಿನ ಕಲಿಕೆ ಪಥ', smartLab: 'ಸ್ಮಾರ್ಟ್ ಪಾಠ ಪ್ರಯೋಗಾಲಯ', personalLesson: 'ನಿಮಗಾಗಿ ತಯಾರಿಸಿದ ಪಾಠ', adaptive: 'ಹೊಂದಿಕೊಳ್ಳುವ', gameLearning: 'ಆಟದ ಮೂಲಕ ಕಲಿಕೆ', practiceCorner: 'ಅಭ್ಯಾಸ ಮೂಲೆ', aiSpeech: 'ಎಐ ಸ್ಪೀಚ್ ಎಂಜಿನ್', voiceCoach: 'ಧ್ವನಿ ಕಲಿಕೆ ಮತ್ತು ಉಚ್ಚಾರಣೆ ಕೋಚ್', trackGrowth: 'ನಿಮ್ಮ ಬೆಳವಣಿಗೆಯನ್ನು ಗಮನಿಸಿ', learningProgress: 'ನಿಮ್ಮ ಕಲಿಕೆ ಪ್ರಗತಿ', reportHelp: 'ಪೂರ್ಣಗೊಂಡ ಪಾಠಗಳು, ಧ್ವನಿ ಅಭ್ಯಾಸ ಮತ್ತು ಪಡೆದ ಬ್ಯಾಡ್ಜ್‌ಗಳನ್ನು ನೋಡಿ.', viewCertificate: 'ಪ್ರಮಾಣಪತ್ರ ನೋಡಿ', performanceReport: 'ಕಲಿಕಾ ಕಾರ್ಯಕ್ಷಮತೆ ಮತ್ತು ಪ್ರಗತಿ ವರದಿ', unlockedBadges: 'ಅನ್‌ಲಾಕ್ ಮಾಡಿದ ಸಾಧನೆ ಬ್ಯಾಡ್ಜ್‌ಗಳು', badgesTrophies: 'ಬ್ಯಾಡ್ಜ್‌ಗಳು ಮತ್ತು ಟ್ರೋಫಿಗಳು' }
};

const interfacePracticeCopy = {
  English: { learnerProfile: 'YOUR LEARNER PROFILE', hello: 'Hello', profileHelp: 'Keep these details up to date so we can personalise your learning.', fullName: 'Full name', age: 'Age', emailAddress: 'Email address', preferredLanguage: 'Preferred language', currentLevel: 'Current level', learningGoal: 'Learning goal', goHome: 'Go to my learning home', retakeAssessment: 'Retake starting assessment', saveChanges: 'Save changes', passage: 'Passage', listenReading: 'Listen to reading', nextPassage: 'Next passage', writingPractice: 'Writing practice', writingHint: 'Choose your keyboard, listen carefully, then type the word.', typeAnswer: 'Type answer here...', listenWord: 'Listen to word', checkAnswer: 'Check answer', nextQuestion: 'Next question', vocabularyBuilder: 'Essential vocabulary builder', nextVocabulary: 'Next vocabulary set', comprehensionPractice: 'Comprehension practice', correctAnswer: 'Correct! Great comprehension.', tryAgain: 'Try again!' },
  Hindi: { learnerProfile: 'आपकी शिक्षार्थी प्रोफ़ाइल', hello: 'नमस्ते', profileHelp: 'अपने सीखने को व्यक्तिगत बनाने के लिए इन विवरणों को अपडेट रखें।', fullName: 'पूरा नाम', age: 'उम्र', emailAddress: 'ईमेल पता', preferredLanguage: 'पसंदीदा भाषा', currentLevel: 'वर्तमान स्तर', learningGoal: 'सीखने का लक्ष्य', goHome: 'मेरे सीखने के होम पर जाएं', retakeAssessment: 'शुरुआती मूल्यांकन फिर से लें', saveChanges: 'बदलाव सहेजें', passage: 'पाठ', listenReading: 'पठन सुनें', nextPassage: 'अगला पाठ', writingPractice: 'लेखन अभ्यास', writingHint: 'अपना कीबोर्ड चुनें, ध्यान से सुनें और शब्द टाइप करें।', typeAnswer: 'यहाँ उत्तर लिखें...', listenWord: 'शब्द सुनें', checkAnswer: 'उत्तर जांचें', nextQuestion: 'अगला प्रश्न', vocabularyBuilder: 'आवश्यक शब्दावली', nextVocabulary: 'अगला शब्द समूह', comprehensionPractice: 'समझ अभ्यास', correctAnswer: 'सही! बहुत अच्छा।', tryAgain: 'फिर से कोशिश करें!' },
  Telugu: { learnerProfile: 'మీ అభ్యాస ప్రొఫైల్', hello: 'నమస్కారం', profileHelp: 'మీ అభ్యాసాన్ని వ్యక్తిగతంగా చేయడానికి ఈ వివరాలను నవీకరించండి.', fullName: 'పూర్తి పేరు', age: 'వయస్సు', emailAddress: 'ఇమెయిల్ చిరునామా', preferredLanguage: 'ఇష్టమైన భాష', currentLevel: 'ప్రస్తుత స్థాయి', learningGoal: 'అభ్యాస లక్ష్యం', goHome: 'నా అభ్యాస హోమ్‌కు వెళ్ళండి', retakeAssessment: 'ప్రారంభ మూల్యాంకనాన్ని మళ్లీ చేయండి', saveChanges: 'మార్పులను సేవ్ చేయండి', passage: 'పాఠం', listenReading: 'చదవడం వినండి', nextPassage: 'తదుపరి పాఠం', writingPractice: 'రచన అభ్యాసం', writingHint: 'మీ కీబోర్డ్ ఎంచుకుని, జాగ్రత్తగా విని పదాన్ని టైప్ చేయండి.', typeAnswer: 'ఇక్కడ సమాధానం టైప్ చేయండి...', listenWord: 'పదం వినండి', checkAnswer: 'సమాధానం తనిఖీ చేయండి', nextQuestion: 'తదుపరి ప్రశ్న', vocabularyBuilder: 'అవసరమైన పదజాలం', nextVocabulary: 'తదుపరి పదాల సమూహం', comprehensionPractice: 'అవగాహన అభ్యాసం', correctAnswer: 'సరైంది! చాలా బాగా చేశారు।', tryAgain: 'మళ్లీ ప్రయత్నించండి!' },
  Tamil: { learnerProfile: 'உங்கள் கற்றல் சுயவிவரம்', hello: 'வணக்கம்', profileHelp: 'உங்கள் கற்றலை தனிப்பயனாக்க இந்த விவரங்களைப் புதுப்பிக்கவும்.', fullName: 'முழுப் பெயர்', age: 'வயது', emailAddress: 'மின்னஞ்சல் முகவரி', preferredLanguage: 'விருப்ப மொழி', currentLevel: 'தற்போதைய நிலை', learningGoal: 'கற்றல் இலக்கு', goHome: 'என் கற்றல் முகப்பிற்குச் செல்லவும்', retakeAssessment: 'தொடக்க மதிப்பீட்டை மீண்டும் எடுக்கவும்', saveChanges: 'மாற்றங்களைச் சேமிக்கவும்', passage: 'பகுதி', listenReading: 'வாசிப்பைக் கேளுங்கள்', nextPassage: 'அடுத்த பகுதி', writingPractice: 'எழுதும் பயிற்சி', writingHint: 'உங்கள் விசைப்பலகையைத் தேர்ந்தெடுத்து, கவனமாகக் கேட்டு சொல்லைத் தட்டச்சு செய்யுங்கள்.', typeAnswer: 'இங்கே பதிலைத் தட்டச்சு செய்யவும்...', listenWord: 'சொல்லைக் கேளுங்கள்', checkAnswer: 'பதிலைச் சரிபார்க்கவும்', nextQuestion: 'அடுத்த கேள்வி', vocabularyBuilder: 'முக்கிய சொற்களஞ்சியம்', nextVocabulary: 'அடுத்த சொல் தொகுப்பு', comprehensionPractice: 'புரிதல் பயிற்சி', correctAnswer: 'சரி! மிகவும் நன்று।', tryAgain: 'மீண்டும் முயற்சிக்கவும்!' },
  Kannada: { learnerProfile: 'ನಿಮ್ಮ ಕಲಿಕಾ ಪ್ರೊಫೈಲ್', hello: 'ನಮಸ್ಕಾರ', profileHelp: 'ನಿಮ್ಮ ಕಲಿಕೆಯನ್ನು ವೈಯಕ್ತಿಕಗೊಳಿಸಲು ಈ ವಿವರಗಳನ್ನು ನವೀಕರಿಸಿ.', fullName: 'ಪೂರ್ಣ ಹೆಸರು', age: 'ವಯಸ್ಸು', emailAddress: 'ಇಮೇಲ್ ವಿಳಾಸ', preferredLanguage: 'ಆದ್ಯತೆಯ ಭಾಷೆ', currentLevel: 'ಪ್ರಸ್ತುತ ಹಂತ', learningGoal: 'ಕಲಿಕೆಯ ಗುರಿ', goHome: 'ನನ್ನ ಕಲಿಕೆ ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ', retakeAssessment: 'ಆರಂಭಿಕ ಮೌಲ್ಯಮಾಪನವನ್ನು ಮತ್ತೆ ತೆಗೆದುಕೊಳ್ಳಿ', saveChanges: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ', passage: 'ಪಾಠ', listenReading: 'ಓದುವುದನ್ನು ಆಲಿಸಿ', nextPassage: 'ಮುಂದಿನ ಪಾಠ', writingPractice: 'ಬರವಣಿಗೆ ಅಭ್ಯಾಸ', writingHint: 'ನಿಮ್ಮ ಕೀಬೋರ್ಡ್ ಆಯ್ಕೆಮಾಡಿ, ಎಚ್ಚರಿಕೆಯಿಂದ ಆಲಿಸಿ ಮತ್ತು ಪದವನ್ನು ಟೈಪ್ ಮಾಡಿ.', typeAnswer: 'ಇಲ್ಲಿ ಉತ್ತರ ಟೈಪ್ ಮಾಡಿ...', listenWord: 'ಪದವನ್ನು ಆಲಿಸಿ', checkAnswer: 'ಉತ್ತರ ಪರಿಶೀಲಿಸಿ', nextQuestion: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ', vocabularyBuilder: 'ಅಗತ್ಯ ಪದಕೋಶ', nextVocabulary: 'ಮುಂದಿನ ಪದಗಳ ಗುಂಪು', comprehensionPractice: 'ತಿಳುವಳಿಕೆ ಅಭ್ಯಾಸ', correctAnswer: 'ಸರಿಯಾಗಿದೆ! ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ।', tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ!' }
};

// Labels used inside interactive cards and games. The words being learned stay
// in the learning language; these instructions follow the interface language.
const interfaceActivityCopy = {
  English: { flipLearn: 'FLIP & LEARN', interactiveFlashcards: 'Interactive Vocabulary Flashcards', flipCards: '3D Flip Cards', languageWord: 'WORD', cardTap: 'Tap card to flip ↺', meaning: 'MEANING', pictureMatch: 'Everyday decision', listenChoose: 'Audio response', wordChallenge: 'Word composer', letterHunt: 'Context reader', quickQuiz: 'Meaning check', newGameQuestion: 'New mission ↻', hearAgain: 'Play audio again', mission: 'Read the situation carefully and select the most accurate response.', points: '+10 XP', greatRound: 'Correct. Your progress has been recorded. +10 XP', missionComplete: 'Completed', niceTryGame: 'Not quite. Re-read the situation or play the audio again, then choose another answer.', tryNewQuestion: 'Continue with a new mission.' },
  Hindi: { flipLearn: 'पलटकर सीखें', interactiveFlashcards: 'इंटरैक्टिव शब्दावली कार्ड', flipCards: '3D फ्लिप कार्ड', languageWord: 'शब्द', cardTap: 'कार्ड पलटने के लिए टैप करें ↺', meaning: 'अर्थ', pictureMatch: 'रोज़मर्रा का निर्णय', listenChoose: 'ऑडियो उत्तर', wordChallenge: 'शब्द रचना', letterHunt: 'संदर्भ पठन', quickQuiz: 'अर्थ जांच', newGameQuestion: 'नया कार्य ↻', hearAgain: 'ऑडियो फिर चलाएं', mission: 'स्थिति को ध्यान से पढ़ें और सबसे सही उत्तर चुनें।', points: '+10 अंक', greatRound: 'सही। आपकी प्रगति दर्ज हो गई है। +10 अंक', missionComplete: 'पूर्ण हुआ', niceTryGame: 'अभी नहीं। स्थिति फिर पढ़ें या ऑडियो फिर सुनें।', tryNewQuestion: 'नया कार्य जारी रखें।' },
  Telugu: { flipLearn: 'తిప్పి నేర్చుకోండి', interactiveFlashcards: 'ఇంటరాక్టివ్ పదజాల కార్డులు', flipCards: '3D ఫ్లిప్ కార్డులు', languageWord: 'పదం', cardTap: 'కార్డును తిప్పడానికి నొక్కండి ↺', meaning: 'అర్థం', pictureMatch: 'రోజువారీ నిర్ణయం', listenChoose: 'ఆడియో స్పందన', wordChallenge: 'పద నిర్మాణం', letterHunt: 'సందర్భ పఠనం', quickQuiz: 'అర్థ తనిఖీ', newGameQuestion: 'కొత్త మిషన్ ↻', hearAgain: 'ఆడియోను మళ్లీ వినండి', mission: 'పరిస్థితిని జాగ్రత్తగా చదివి, సరైన సమాధానాన్ని ఎంచుకోండి।', points: '+10 పాయింట్లు', greatRound: 'సరైనది. మీ పురోగతి నమోదు అయింది। +10 పాయింట్లు', missionComplete: 'పూర్తయింది', niceTryGame: 'ఇంకా కాదు. పరిస్థితిని మళ్లీ చదవండి లేదా ఆడియోను మళ్లీ వినండి।', tryNewQuestion: 'కొత్త మిషన్ కొనసాగించండి।' },
  Tamil: { flipLearn: 'திருப்பிக் கற்கவும்', interactiveFlashcards: 'ஊடாடும் சொற்களஞ்சிய அட்டைகள்', flipCards: '3D திருப்பு அட்டைகள்', languageWord: 'சொல்', cardTap: 'அட்டையைத் திருப்ப தட்டவும் ↺', meaning: 'பொருள்', pictureMatch: 'அன்றாட முடிவு', listenChoose: 'ஒலிப் பதில்', wordChallenge: 'சொல் அமைப்பு', letterHunt: 'சூழல் வாசிப்பு', quickQuiz: 'பொருள் சோதனை', newGameQuestion: 'புதிய பணி ↻', hearAgain: 'ஒலியை மீண்டும் இயக்கவும்', mission: 'சூழலைக் கவனமாகப் படித்து, மிகச் சரியான பதிலைத் தேர்ந்தெடுக்கவும்.', points: '+10 புள்ளிகள்', greatRound: 'சரி. உங்கள் முன்னேற்றம் பதிவு செய்யப்பட்டது. +10 புள்ளிகள்', missionComplete: 'முடிந்தது', niceTryGame: 'இன்னும் இல்லை. சூழலை மீண்டும் படிக்கவும் அல்லது ஒலியைக் கேட்கவும்.', tryNewQuestion: 'புதிய பணியைத் தொடரவும்.' },
  Kannada: { flipLearn: 'ತಿರುಗಿಸಿ ಕಲಿಯಿರಿ', interactiveFlashcards: 'ಸಂವಾದಾತ್ಮಕ ಪದಕೋಶ ಕಾರ್ಡ್‌ಗಳು', flipCards: '3D ಫ್ಲಿಪ್ ಕಾರ್ಡ್‌ಗಳು', languageWord: 'ಪದ', cardTap: 'ಕಾರ್ಡ್ ತಿರುಗಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ ↺', meaning: 'ಅರ್ಥ', pictureMatch: 'ದೈನಂದಿನ ನಿರ್ಧಾರ', listenChoose: 'ಆಡಿಯೊ ಪ್ರತಿಕ್ರಿಯೆ', wordChallenge: 'ಪದ ರಚನೆ', letterHunt: 'ಸಂದರ್ಭ ಓದು', quickQuiz: 'ಅರ್ಥ ಪರಿಶೀಲನೆ', newGameQuestion: 'ಹೊಸ ಮಿಷನ್ ↻', hearAgain: 'ಆಡಿಯೊವನ್ನು ಮತ್ತೆ ಆಲಿಸಿ', mission: 'ಸಂದರ್ಭವನ್ನು ಗಮನದಿಂದ ಓದಿ, ಅತ್ಯಂತ ಸರಿಯಾದ ಉತ್ತರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.', points: '+10 ಅಂಕಗಳು', greatRound: 'ಸರಿಯಾಗಿದೆ. ನಿಮ್ಮ ಪ್ರಗತಿ ದಾಖಲಿಸಲಾಗಿದೆ. +10 ಅಂಕಗಳು', missionComplete: 'ಪೂರ್ಣಗೊಂಡಿದೆ', niceTryGame: 'ಇನ್ನೂ ಅಲ್ಲ. ಸಂದರ್ಭವನ್ನು ಮತ್ತೆ ಓದಿ ಅಥವಾ ಆಡಿಯೊವನ್ನು ಮತ್ತೆ ಆಲಿಸಿ.', tryNewQuestion: 'ಹೊಸ ಮಿಷನ್ ಮುಂದುವರಿಸಿ.' }
};

const interfaceChallengePageCopy = {
  English: { practicalChallenges: 'PRACTICAL CHALLENGES', everydaySkills: 'Use your skills in everyday situations', challengeExplain: 'Choose a challenge that matches your current level. Each one uses familiar words, listening, and reading.', levelPractice: 'Level-based practice', challengeStudio: 'CHALLENGE STUDIO', purposeActivities: 'Short activities with a real purpose', challengeHelp: 'Try as many questions as you need. Akshara adjusts choices for your learning level.', knowledgeCheck: 'KNOWLEDGE CHECK', shortQuizzes: 'Short quizzes for your current level', quizExplain: 'Answer one question at a time. Each quiz is generated from your selected language and learning level.', independentPractice: 'Independent practice', adaptiveQuiz: 'ADAPTIVE QUIZ', checkKnowledge: 'Check what you know', newQuizQuestion: 'Get a new question', quizHelp: 'There is no timer. Read, listen, and answer at your own pace.', preparingQuestion: 'Preparing a new quiz question…', freshQuestion: 'New practice question', nextQuizQuestion: 'Next question →', signInQuiz: 'Sign in to receive a new quiz question.' },
  Hindi: { practicalChallenges: 'व्यावहारिक चुनौतियाँ', everydaySkills: 'रोज़मर्रा की स्थितियों में अपने कौशल का उपयोग करें', challengeExplain: 'अपने स्तर के अनुसार चुनौती चुनें। हर गतिविधि परिचित शब्दों, सुनने और पढ़ने का उपयोग करती है।', levelPractice: 'स्तर आधारित अभ्यास', challengeStudio: 'चुनौती केंद्र', purposeActivities: 'उद्देश्यपूर्ण छोटी गतिविधियाँ', challengeHelp: 'जितने प्रश्न चाहिए उतने आज़माएं। अक्षरा आपके स्तर के अनुसार विकल्प देता है।', knowledgeCheck: 'ज्ञान जांच', shortQuizzes: 'आपके वर्तमान स्तर के छोटे क्विज़', quizExplain: 'एक समय में एक प्रश्न का उत्तर दें। हर क्विज़ आपकी भाषा और स्तर के अनुसार बनाया जाता है।', independentPractice: 'स्वतंत्र अभ्यास', adaptiveQuiz: 'अनुकूलित क्विज़', checkKnowledge: 'जो आप जानते हैं उसे जांचें', newQuizQuestion: 'नया प्रश्न लें', quizHelp: 'कोई समय सीमा नहीं है। अपनी गति से पढ़ें, सुनें और उत्तर दें।', preparingQuestion: 'नया क्विज़ प्रश्न तैयार हो रहा है…', freshQuestion: 'नया अभ्यास प्रश्न', nextQuizQuestion: 'अगला प्रश्न →', signInQuiz: 'नया क्विज़ प्रश्न पाने के लिए साइन इन करें।' },
  Telugu: { practicalChallenges: 'ఆచరణాత్మక సవాళ్లు', everydaySkills: 'రోజువారీ పరిస్థితుల్లో మీ నైపుణ్యాలను ఉపయోగించండి', challengeExplain: 'మీ స్థాయికి సరిపోయే సవాలును ఎంచుకోండి. ప్రతి కార్యకలాపం తెలిసిన పదాలు, వినడం మరియు చదవడం ఉపయోగిస్తుంది।', levelPractice: 'స్థాయి ఆధారిత అభ్యాసం', challengeStudio: 'సవాళ్ల కేంద్రం', purposeActivities: 'లక్ష్యంతో కూడిన చిన్న కార్యకలాపాలు', challengeHelp: 'అవసరమైనన్ని ప్రశ్నలు ప్రయత్నించండి. అక్షర మీ స్థాయికి అనుగుణంగా ఎంపికలను మార్చుతుంది।', knowledgeCheck: 'జ్ఞాన తనిఖీ', shortQuizzes: 'మీ ప్రస్తుత స్థాయికి చిన్న క్విజ్‌లు', quizExplain: 'ఒక్కో ప్రశ్నకు ఒక్కోసారి సమాధానం ఇవ్వండి. ప్రతి క్విజ్ మీ భాష మరియు స్థాయికి అనుగుణంగా రూపొందించబడుతుంది।', independentPractice: 'స్వతంత్ర అభ్యాసం', adaptiveQuiz: 'అనుకూల క్విజ్', checkKnowledge: 'మీకు తెలిసినది తనిఖీ చేయండి', newQuizQuestion: 'కొత్త ప్రశ్న పొందండి', quizHelp: 'సమయ పరిమితి లేదు. మీ వేగంతో చదవండి, వినండి మరియు సమాధానం ఇవ్వండి।', preparingQuestion: 'కొత్త క్విజ్ ప్రశ్న సిద్ధమవుతోంది…', freshQuestion: 'కొత్త అభ్యాస ప్రశ్న', nextQuizQuestion: 'తదుపరి ప్రశ్న →', signInQuiz: 'కొత్త క్విజ్ ప్రశ్న కోసం సైన్ ఇన్ చేయండి।' },
  Tamil: { practicalChallenges: 'நடைமுறை சவால்கள்', everydaySkills: 'அன்றாட சூழலில் உங்கள் திறன்களைப் பயன்படுத்துங்கள்', challengeExplain: 'உங்கள் நிலைக்கு ஏற்ற சவாலைத் தேர்ந்தெடுக்கவும். ஒவ்வொரு செயலிலும் அறிமுகமான சொற்கள், கேட்டல் மற்றும் வாசித்தல் உள்ளன.', levelPractice: 'நிலை அடிப்படையிலான பயிற்சி', challengeStudio: 'சவால் மையம்', purposeActivities: 'நோக்கமுள்ள குறும் செயல்பாடுகள்', challengeHelp: 'தேவையான அளவு கேள்விகளை முயற்சிக்கலாம். அக்ஷரா உங்கள் நிலைக்கு ஏற்ப தேர்வுகளை மாற்றும்.', knowledgeCheck: 'அறிவு சோதனை', shortQuizzes: 'உங்கள் தற்போதைய நிலைக்கான குறும் வினாடி வினாக்கள்', quizExplain: 'ஒரு நேரத்தில் ஒரு கேள்விக்கு பதிலளிக்கவும். ஒவ்வொரு வினாடி வினாவும் உங்கள் மொழி மற்றும் நிலைக்கு ஏற்ப உருவாகும்.', independentPractice: 'சுய பயிற்சி', adaptiveQuiz: 'தகவமைப்பு வினாடி வினா', checkKnowledge: 'உங்களுக்குத் தெரிந்ததைச் சரிபார்க்கவும்', newQuizQuestion: 'புதிய கேள்வியைப் பெறவும்', quizHelp: 'நேர வரம்பு இல்லை. உங்கள் வேகத்தில் படித்து, கேட்டு, பதிலளிக்கவும்.', preparingQuestion: 'புதிய வினாடி வினா கேள்வி தயாராகிறது…', freshQuestion: 'புதிய பயிற்சிக் கேள்வி', nextQuizQuestion: 'அடுத்த கேள்வி →', signInQuiz: 'புதிய வினாடி வினா கேள்விக்கு உள்நுழையவும்.' },
  Kannada: { practicalChallenges: 'ಪ್ರಾಯೋಗಿಕ ಸವಾಲುಗಳು', everydaySkills: 'ದೈನಂದಿನ ಸಂದರ್ಭಗಳಲ್ಲಿ ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳನ್ನು ಬಳಸಿ', challengeExplain: 'ನಿಮ್ಮ ಹಂತಕ್ಕೆ ಸರಿಹೊಂದುವ ಸವಾಲನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಪ್ರತಿಯೊಂದು ಚಟುವಟಿಕೆಯಲ್ಲಿ ಪರಿಚಿತ ಪದಗಳು, ಆಲಿಸುವಿಕೆ ಮತ್ತು ಓದುವಿಕೆ ಇವೆ.', levelPractice: 'ಹಂತ ಆಧಾರಿತ ಅಭ್ಯಾಸ', challengeStudio: 'ಸವಾಲು ಕೇಂದ್ರ', purposeActivities: 'ಉದ್ದೇಶಪೂರ್ಣ ಸಣ್ಣ ಚಟುವಟಿಕೆಗಳು', challengeHelp: 'ಬೇಕಾದಷ್ಟು ಪ್ರಶ್ನೆಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ. ಅಕ್ಷರವು ನಿಮ್ಮ ಹಂತಕ್ಕೆ ತಕ್ಕಂತೆ ಆಯ್ಕೆಗಳನ್ನು ಬದಲಾಯಿಸುತ್ತದೆ.', knowledgeCheck: 'ಜ್ಞಾನ ಪರಿಶೀಲನೆ', shortQuizzes: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಹಂತಕ್ಕೆ ಸಣ್ಣ ಪ್ರಶ್ನೋತ್ತರಗಳು', quizExplain: 'ಒಂದು ಸಮಯದಲ್ಲಿ ಒಂದು ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಿ. ಪ್ರತಿಯೊಂದು ಪ್ರಶ್ನೋತ್ತರವು ನಿಮ್ಮ ಭಾಷೆ ಮತ್ತು ಹಂತಕ್ಕೆ ತಕ್ಕಂತೆ ರಚಿಸಲಾಗಿದೆ.', independentPractice: 'ಸ್ವತಂತ್ರ ಅಭ್ಯಾಸ', adaptiveQuiz: 'ಹೊಂದಿಕೊಳ್ಳುವ ಪ್ರಶ್ನೋತ್ತರ', checkKnowledge: 'ನಿಮಗೆ ತಿಳಿದಿರುವುದನ್ನು ಪರಿಶೀಲಿಸಿ', newQuizQuestion: 'ಹೊಸ ಪ್ರಶ್ನೆ ಪಡೆಯಿರಿ', quizHelp: 'ಸಮಯ ಮಿತಿ ಇಲ್ಲ. ನಿಮ್ಮ ವೇಗದಲ್ಲಿ ಓದಿ, ಆಲಿಸಿ ಮತ್ತು ಉತ್ತರಿಸಿ.', preparingQuestion: 'ಹೊಸ ಪ್ರಶ್ನೋತ್ತರ ಪ್ರಶ್ನೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ…', freshQuestion: 'ಹೊಸ ಅಭ್ಯಾಸ ಪ್ರಶ್ನೆ', nextQuizQuestion: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ →', signInQuiz: 'ಹೊಸ ಪ್ರಶ್ನೋತ್ತರ ಪ್ರಶ್ನೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.' }
};

const interfaceChallengeControlCopy = {
  English: { ready: 'Ready', clear: 'Clear', check: 'Check' },
  Hindi: { ready: 'तैयार', clear: 'साफ़ करें', check: 'जांचें' },
  Telugu: { ready: 'సిద్ధం', clear: 'తొలగించండి', check: 'తనిఖీ చేయండి' },
  Tamil: { ready: 'தயார்', clear: 'அழி', check: 'சரிபார்க்கவும்' },
  Kannada: { ready: 'ಸಿದ್ಧ', clear: 'ತೆರವುಗೊಳಿಸಿ', check: 'ಪರಿಶೀಲಿಸಿ' }
};

const interfaceHomeAnalyticsCopy = {
  English: { journeyReady: 'READY WHEN YOU ARE', guidedPractice: 'Easy, guided practice', chooseActivity: 'Choose one activity now. You can return whenever you are ready.', learnLetter: 'Learn one letter or word', guidedLesson: 'Guided micro-lesson', wordActivity: 'Try a quick word activity', vocabPractice: 'Vocabulary practice', listenPhrase: 'Listen and say a phrase', speechPractice: 'Speech practice', todaysStep: "TODAY'S STEP", myLevel: 'MY LEVEL', practicePoints: 'PRACTICE POINTS', learningDays: 'LEARNING DAYS', skillSnapshot: 'SKILL SNAPSHOT', learningStrengths: 'Your learning strengths', liveProfile: 'Live profile', executiveAnalytics: 'EXECUTIVE ANALYTICS', lessonsCompleted: 'LESSONS COMPLETED', voiceAccuracy: 'VOICE ACCURACY', benchmarkTier: 'BENCHMARK TIER', gamification: 'GAMIFICATION' },
  Hindi: { journeyReady: 'जब आप तैयार हों', guidedPractice: 'सरल मार्गदर्शित अभ्यास', chooseActivity: 'अभी एक गतिविधि चुनें। जब चाहें वापस आ सकते हैं।', learnLetter: 'एक अक्षर या शब्द सीखें', guidedLesson: 'मार्गदर्शित छोटा पाठ', wordActivity: 'त्वरित शब्द गतिविधि आज़माएं', vocabPractice: 'शब्दावली अभ्यास', listenPhrase: 'वाक्य सुनें और बोलें', speechPractice: 'बोलने का अभ्यास', todaysStep: 'आज का कदम', myLevel: 'मेरा स्तर', practicePoints: 'अभ्यास अंक', learningDays: 'सीखने के दिन', skillSnapshot: 'कौशल झलक', learningStrengths: 'आपकी सीखने की ताकत', liveProfile: 'लाइव प्रोफ़ाइल', executiveAnalytics: 'प्रदर्शन विश्लेषण', lessonsCompleted: 'पूरे किए गए पाठ', voiceAccuracy: 'वाणी सटीकता', benchmarkTier: 'स्तर श्रेणी', gamification: 'खेल आधारित प्रगति' },
  Telugu: { journeyReady: 'మీరు సిద్ధమైనప్పుడు', guidedPractice: 'సులభ మార్గదర్శిత అభ్యాసం', chooseActivity: 'ఇప్పుడు ఒక కార్యకలాపాన్ని ఎంచుకోండి. మీరు సిద్ధమైనప్పుడు తిరిగి రావచ్చు.', learnLetter: 'ఒక అక్షరం లేదా పదం నేర్చుకోండి', guidedLesson: 'మార్గదర్శిత చిన్న పాఠం', wordActivity: 'త్వరిత పద కార్యకలాపాన్ని ప్రయత్నించండి', vocabPractice: 'పదజాల అభ్యాసం', listenPhrase: 'వాక్యాన్ని విని చెప్పండి', speechPractice: 'మాట్లాడే అభ్యాసం', todaysStep: 'నేటి అడుగు', myLevel: 'నా స్థాయి', practicePoints: 'అభ్యాస పాయింట్లు', learningDays: 'అభ్యాస దినాలు', skillSnapshot: 'నైపుణ్య సారాంశం', learningStrengths: 'మీ అభ్యాస బలాలు', liveProfile: 'ప్రస్తుత ప్రొఫైల్', executiveAnalytics: 'పనితీరు విశ్లేషణ', lessonsCompleted: 'పూర్తయిన పాఠాలు', voiceAccuracy: 'వాయిస్ ఖచ్చితత్వం', benchmarkTier: 'స్థాయి శ్రేణి', gamification: 'ఆటల ద్వారా పురోగతి' },
  Tamil: { journeyReady: 'நீங்கள் தயாரானபோது', guidedPractice: 'எளிய வழிகாட்டப்பட்ட பயிற்சி', chooseActivity: 'இப்போது ஒரு செயல்பாட்டைத் தேர்ந்தெடுக்கவும். தயாரானபோது திரும்பி வரலாம்.', learnLetter: 'ஒரு எழுத்து அல்லது சொல்லைக் கற்கவும்', guidedLesson: 'வழிகாட்டப்பட்ட சிறு பாடம்', wordActivity: 'விரைவு சொல் செயல்பாட்டை முயற்சிக்கவும்', vocabPractice: 'சொற்களஞ்சிய பயிற்சி', listenPhrase: 'வாக்கியத்தைக் கேட்டு சொல்லுங்கள்', speechPractice: 'பேச்சுப் பயிற்சி', todaysStep: 'இன்றைய படி', myLevel: 'என் நிலை', practicePoints: 'பயிற்சிப் புள்ளிகள்', learningDays: 'கற்றல் நாட்கள்', skillSnapshot: 'திறன் சுருக்கம்', learningStrengths: 'உங்கள் கற்றல் பலங்கள்', liveProfile: 'நேரடி சுயவிவரம்', executiveAnalytics: 'செயல்திறன் பகுப்பாய்வு', lessonsCompleted: 'முடித்த பாடங்கள்', voiceAccuracy: 'குரல் துல்லியம்', benchmarkTier: 'நிலை வரிசை', gamification: 'விளையாட்டு வழி முன்னேற்றம்' },
  Kannada: { journeyReady: 'ನೀವು ಸಿದ್ಧರಾದಾಗ', guidedPractice: 'ಸರಳ ಮಾರ್ಗದರ್ಶಿತ ಅಭ್ಯಾಸ', chooseActivity: 'ಈಗ ಒಂದು ಚಟುವಟಿಕೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ನೀವು ಸಿದ್ಧರಾದಾಗ ಮರಳಿ ಬರಬಹುದು.', learnLetter: 'ಒಂದು ಅಕ್ಷರ ಅಥವಾ ಪದ ಕಲಿಯಿರಿ', guidedLesson: 'ಮಾರ್ಗದರ್ಶಿತ ಸೂಕ್ಷ್ಮ ಪಾಠ', wordActivity: 'ತ್ವರಿತ ಪದ ಚಟುವಟಿಕೆ ಪ್ರಯತ್ನಿಸಿ', vocabPractice: 'ಪದಕೋಶ ಅಭ್ಯಾಸ', listenPhrase: 'ವಾಕ್ಯವನ್ನು ಆಲಿಸಿ ಮತ್ತು ಹೇಳಿ', speechPractice: 'ಮಾತಿನ ಅಭ್ಯಾಸ', todaysStep: 'ಇಂದಿನ ಹೆಜ್ಜೆ', myLevel: 'ನನ್ನ ಹಂತ', practicePoints: 'ಅಭ್ಯಾಸ ಅಂಕಗಳು', learningDays: 'ಕಲಿಕೆಯ ದಿನಗಳು', skillSnapshot: 'ಕೌಶಲ್ಯದ ಚಿತ್ರಣ', learningStrengths: 'ನಿಮ್ಮ ಕಲಿಕೆಯ ಶಕ್ತಿಗಳು', liveProfile: 'ನೇರ ಪ್ರೊಫೈಲ್', executiveAnalytics: 'ಕಾರ್ಯಕ್ಷಮತೆ ವಿಶ್ಲೇಷಣೆ', lessonsCompleted: 'ಪೂರ್ಣಗೊಂಡ ಪಾಠಗಳು', voiceAccuracy: 'ಧ್ವನಿ ನಿಖರತೆ', benchmarkTier: 'ಮಟ್ಟದ ಶ್ರೇಣಿ', gamification: 'ಆಟೀಕರಣ' }
};

const interfaceHomeDetailCopy = {
  English: { personalLearningHome: 'Your personal Akshara learning home', strengthHelp: 'Your practice results help Akshara choose what to recommend next.', quickPractice: 'QUICK PRACTICE', nextActivity: 'Choose your next activity', reviewVocab: 'Review vocabulary', buildWords: 'Build useful words', practiceSpeaking: 'Practise speaking', improvePronunciation: 'Improve pronunciation', viewReport: 'View your report', seeProgress: 'See your progress', weeklyCheckin: 'WEEKLY CHECK-IN', learningHabit: 'Keep your learning habit going', consistency: 'Consistency matters', weeklyHelp: 'Small, regular practice makes new words easier to remember.', benchmarkFramework: 'BENCHMARK FRAMEWORK', proficiencyLevels: 'Defined Proficiency Levels', proficiencyTiers: 'Proficiency Tiers' },
  Hindi: { pillarHelper: 'तुरंत प्रतिक्रिया के साथ अभ्यास के लिए एक सीखने का कौशल चुनें। नए अभ्यास के लिए कभी भी अगला दबाएं।', quickPractice: 'त्वरित अभ्यास', nextActivity: 'अपनी अगली गतिविधि चुनें', reviewVocab: 'शब्दावली दोहराएं', buildWords: 'उपयोगी शब्द सीखें', practiceSpeaking: 'बोलने का अभ्यास', improvePronunciation: 'उच्चारण सुधारें', viewReport: 'अपनी रिपोर्ट देखें', seeProgress: 'अपनी प्रगति देखें', weeklyCheckin: 'साप्ताहिक जांच', learningHabit: 'अपनी सीखने की आदत बनाए रखें', consistency: 'निरंतरता महत्वपूर्ण है', benchmarkFramework: 'स्तर रूपरेखा', proficiencyLevels: 'निर्धारित दक्षता स्तर', proficiencyTiers: 'दक्षता स्तर' },
  Telugu: { pillarHelper: 'తక్షణ సూచనలతో అభ్యాసం చేయడానికి ఒక నైపుణ్యాన్ని ఎంచుకోండి. కొత్త అభ్యాసం కోసం ఎప్పుడైనా తదుపరి నొక్కండి.', quickPractice: 'త్వరిత అభ్యాసం', nextActivity: 'మీ తదుపరి కార్యకలాపాన్ని ఎంచుకోండి', reviewVocab: 'పదజాలాన్ని పునఃసమీక్షించండి', buildWords: 'ఉపయోగకరమైన పదాలు నేర్చుకోండి', practiceSpeaking: 'మాట్లాడే అభ్యాసం', improvePronunciation: 'ఉచ్చారణను మెరుగుపరచండి', viewReport: 'మీ నివేదికను చూడండి', seeProgress: 'మీ పురోగతిని చూడండి', weeklyCheckin: 'వారపు తనిఖీ', learningHabit: 'మీ అభ్యాస అలవాటును కొనసాగించండి', consistency: 'నిరంతరత ముఖ్యం', benchmarkFramework: 'స్థాయి చట్రం', proficiencyLevels: 'నిర్దేశిత నైపుణ్య స్థాయిలు', proficiencyTiers: 'నైపుణ్య స్థాయిలు' },
  Tamil: { pillarHelper: 'உடனடி கருத்துடன் பயிற்சி செய்ய ஒரு கற்றல் திறனைத் தேர்ந்தெடுக்கவும். புதிய பயிற்சிக்கு எப்போது வேண்டுமானாலும் அடுத்து அழுத்தவும்.', quickPractice: 'விரைவு பயிற்சி', nextActivity: 'உங்கள் அடுத்த செயல்பாட்டைத் தேர்ந்தெடுக்கவும்', reviewVocab: 'சொற்களஞ்சியத்தை மீள்பார்க்கவும்', buildWords: 'பயனுள்ள சொற்களைக் கற்கவும்', practiceSpeaking: 'பேச்சுப் பயிற்சி', improvePronunciation: 'உச்சரிப்பை மேம்படுத்தவும்', viewReport: 'உங்கள் அறிக்கையைப் பார்க்கவும்', seeProgress: 'உங்கள் முன்னேற்றத்தைப் பார்க்கவும்', weeklyCheckin: 'வாராந்திர சரிபார்ப்பு', learningHabit: 'உங்கள் கற்றல் பழக்கத்தைத் தொடருங்கள்', consistency: 'தொடர்ச்சி முக்கியம்', benchmarkFramework: 'நிலை அமைப்பு', proficiencyLevels: 'வரையறுக்கப்பட்ட திறன் நிலைகள்', proficiencyTiers: 'திறன் நிலைகள்' },
  Kannada: { personalLearningHome: 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಅಕ್ಷರ ಕಲಿಕಾ ಮುಖಪುಟ', pillarHelper: 'ತಕ್ಷಣದ ಪ್ರತಿಕ್ರಿಯೆಯೊಂದಿಗೆ ಅಭ್ಯಾಸ ಮಾಡಲು ಕಲಿಕೆಯ ಕೌಶಲ್ಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಹೊಸ ಅಭ್ಯಾಸಕ್ಕಾಗಿ ಯಾವಾಗ ಬೇಕಾದರೂ ಮುಂದಕ್ಕೆ ಒತ್ತಿರಿ.', strengthHelp: 'ನಿಮ್ಮ ಅಭ್ಯಾಸದ ಫಲಿತಾಂಶಗಳು ಮುಂದೇನು ಶಿಫಾರಸು ಮಾಡಬೇಕೆಂದು ಅಕ್ಷರಕ್ಕೆ ಸಹಾಯ ಮಾಡುತ್ತವೆ.', quickPractice: 'ತ್ವರಿತ ಅಭ್ಯಾಸ', nextActivity: 'ನಿಮ್ಮ ಮುಂದಿನ ಚಟುವಟಿಕೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ', reviewVocab: 'ಪದಕೋಶ ಪುನರವಲೋಕನ', buildWords: 'ಉಪಯುಕ್ತ ಪದಗಳನ್ನು ಕಲಿಯಿರಿ', practiceSpeaking: 'ಮಾತನಾಡುವ ಅಭ್ಯಾಸ', improvePronunciation: 'ಉಚ್ಚಾರಣೆ ಸುಧಾರಿಸಿ', viewReport: 'ನಿಮ್ಮ ವರದಿ ನೋಡಿ', seeProgress: 'ನಿಮ್ಮ ಪ್ರಗತಿ ನೋಡಿ', weeklyCheckin: 'ವಾರದ ಪರಿಶೀಲನೆ', learningHabit: 'ನಿಮ್ಮ ಕಲಿಕೆಯ ಅಭ್ಯಾಸವನ್ನು ಮುಂದುವರಿಸಿ', consistency: 'ನಿರಂತರತೆ ಮುಖ್ಯ', weeklyHelp: 'ಸಣ್ಣ, ನಿಯಮಿತ ಅಭ್ಯಾಸವು ಹೊಸ ಪದಗಳನ್ನು ಸುಲಭವಾಗಿ ನೆನಪಿಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.', benchmarkFramework: 'ಮಟ್ಟದ ಚೌಕಟ್ಟು', proficiencyLevels: 'ನಿರ್ದಿಷ್ಟ ಪ್ರಾವೀಣ್ಯ ಹಂತಗಳು', proficiencyTiers: 'ಪ್ರಾವೀಣ್ಯ ಹಂತಗಳು' }
};

const interfaceLevelCopy = {
  English: { foundationalTier: 'Foundational Tier', gamifiedProgress: 'Learning progress', consistentLearner: 'Consistent learner', levelBeginner: 'Beginner', levelBeginnerDesc: 'Letter recognition, sound decoding, & ~50 basic words.', levelElementary: 'Elementary', levelElementaryDesc: 'Reading short sentences, signs, & writing a name.', levelIntermediate: 'Intermediate', levelIntermediateDesc: 'Paragraph comprehension & everyday message writing.', levelAdvanced: 'Advanced', levelAdvancedDesc: 'Fluent story reading, form filling, & communication.' },
  Hindi: { foundationalTier: 'बुनियादी स्तर', gamifiedProgress: 'सीखने की प्रगति', consistentLearner: 'नियमित शिक्षार्थी', levelBeginner: 'आरंभिक', levelBeginnerDesc: 'अक्षर पहचान, ध्वनि समझना और लगभग 50 बुनियादी शब्द।', levelElementary: 'प्रारंभिक', levelElementaryDesc: 'छोटे वाक्य, संकेत पढ़ना और नाम लिखना।', levelIntermediate: 'मध्यवर्ती', levelIntermediateDesc: 'अनुच्छेद समझना और रोज़मर्रा के संदेश लिखना।', levelAdvanced: 'उन्नत', levelAdvancedDesc: 'धाराप्रवाह पढ़ना, फॉर्म भरना और संवाद।' },
  Telugu: { foundationalTier: 'ప్రాథమిక స్థాయి', gamifiedProgress: 'అభ్యాస పురోగతి', consistentLearner: 'నిరంతర అభ్యాసకుడు', levelBeginner: 'ప్రారంభ స్థాయి', levelBeginnerDesc: 'అక్షర గుర్తింపు, శబ్ద అవగాహన మరియు సుమారు 50 ప్రాథమిక పదాలు.', levelElementary: 'ప్రాథమిక', levelElementaryDesc: 'చిన్న వాక్యాలు, సంకేతాలు చదవడం మరియు పేరు రాయడం.', levelIntermediate: 'మధ్యస్థ', levelIntermediateDesc: 'పేరా అవగాహన మరియు రోజువారీ సందేశ రచన.', levelAdvanced: 'ఉన్నత', levelAdvancedDesc: 'సరళమైన కథా పఠనం, ఫారమ్ నింపడం మరియు సంభాషణ.' },
  Tamil: { foundationalTier: 'அடிப்படை நிலை', gamifiedProgress: 'கற்றல் முன்னேற்றம்', consistentLearner: 'தொடர்ந்து கற்பவர்', levelBeginner: 'தொடக்க நிலை', levelBeginnerDesc: 'எழுத்து அறிதல், ஒலி புரிதல் மற்றும் சுமார் 50 அடிப்படைச் சொற்கள்.', levelElementary: 'அடிப்படை', levelElementaryDesc: 'சிறு வாக்கியங்கள், அடையாளங்கள் வாசித்தல் மற்றும் பெயர் எழுதுதல்.', levelIntermediate: 'இடைநிலை', levelIntermediateDesc: 'பத்தி புரிதல் மற்றும் அன்றாட செய்தி எழுதுதல்.', levelAdvanced: 'மேம்பட்ட', levelAdvancedDesc: 'சரளமான கதை வாசிப்பு, படிவம் நிரப்புதல் மற்றும் தொடர்பு.' },
  Kannada: { foundationalTier: 'ಮೂಲ ಹಂತ', gamifiedProgress: 'ಕಲಿಕೆಯ ಪ್ರಗತಿ', consistentLearner: 'ನಿರಂತರ ಕಲಿಕೆಗಾರ', levelBeginner: 'ಆರಂಭಿಕ', levelBeginnerDesc: 'ಅಕ್ಷರ ಗುರುತಿಸುವಿಕೆ, ಧ್ವನಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವಿಕೆ ಮತ್ತು ಸುಮಾರು 50 ಮೂಲ ಪದಗಳು.', levelElementary: 'ಪ್ರಾಥಮಿಕ', levelElementaryDesc: 'ಸಣ್ಣ ವಾಕ್ಯಗಳು, ಫಲಕಗಳನ್ನು ಓದುವುದು ಮತ್ತು ಹೆಸರು ಬರೆಯುವುದು.', levelIntermediate: 'ಮಧ್ಯಮ', levelIntermediateDesc: 'ಪ್ಯಾರಾಗ್ರಾಫ್ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು ಮತ್ತು ದೈನಂದಿನ ಸಂದೇಶ ಬರೆಯುವುದು.', levelAdvanced: 'ಮುನ್ನಡೆದ', levelAdvancedDesc: 'ಸರಾಗ ಕಥೆ ಓದುವುದು, ನಮೂನೆ ತುಂಬುವುದು ಮತ್ತು ಸಂವಹನ.' }
};

function currentInterfaceCopy() {
  const language = localStorage.getItem('akshara_interface_language') || 'English';
  return { ...interfaceCopy.English, ...(interfaceCopy[language] || {}), ...interfaceExtraCopy.English, ...(interfaceExtraCopy[language] || {}), ...interfaceSectionCopy.English, ...(interfaceSectionCopy[language] || {}), ...interfacePracticeCopy.English, ...(interfacePracticeCopy[language] || {}), ...interfaceActivityCopy.English, ...(interfaceActivityCopy[language] || {}), ...interfaceChallengePageCopy.English, ...(interfaceChallengePageCopy[language] || {}), ...interfaceChallengeControlCopy.English, ...(interfaceChallengeControlCopy[language] || {}), ...interfaceHomeAnalyticsCopy.English, ...(interfaceHomeAnalyticsCopy[language] || {}), ...interfaceHomeDetailCopy.English, ...(interfaceHomeDetailCopy[language] || {}), ...interfaceLevelCopy.English, ...(interfaceLevelCopy[language] || {}) };
}

function uiText(key) { return currentInterfaceCopy()[key] || key; }

function dashboardText(key, fallback) {
  const language = localStorage.getItem('akshara_interface_language') || 'English';
  const copy = {
    Hindi: { unlocked: 'अनलॉक ✓', locked: 'लॉक 🔒', badgeFirst: 'नव-शिक्षार्थी अग्रणी', badgeFirstDesc: 'अक्षरा पोर्टल पर पंजीकृत', badgeStreak: '3-दिन सीखने का क्रम', badgeStreakDesc: 'लगातार 3 दिन सीखा', badgePuzzle: 'पहेली विशेषज्ञ', badgePuzzleDesc: 'साक्षरता पहेलियाँ पूरी कीं', badgeVoice: 'वॉइस स्टार', badgeVoiceDesc: '85% से अधिक उच्चारण स्कोर', badgeLesson: 'पाठ विद्वान', badgeLessonDesc: 'एक सूक्ष्म पाठ पूरा किया' },
    Telugu: { unlocked: 'అన్‌లాక్ ✓', locked: 'లాక్ 🔒', badgeFirst: 'కొత్త అభ్యాసకుడి మార్గదర్శి', badgeFirstDesc: 'అక్షర పోర్టల్‌లో నమోదు చేశారు', badgeStreak: '3-రోజుల అభ్యాస పరంపర', badgeStreakDesc: 'వరుసగా 3 రోజులు నేర్చుకున్నారు', badgePuzzle: 'పజిల్ నిపుణుడు', badgePuzzleDesc: 'అక్షరాస్యత పజిల్స్ పూర్తి చేశారు', badgeVoice: 'వాయిస్ స్టార్', badgeVoiceDesc: '85% కంటే ఎక్కువ ఉచ్చారణ స్కోర్', badgeLesson: 'పాఠ పండితుడు', badgeLessonDesc: 'ఒక సూక్ష్మ పాఠం పూర్తి చేశారు' },
    Tamil: { unlocked: 'திறக்கப்பட்டது ✓', locked: 'பூட்டப்பட்டது 🔒', badgeFirst: 'புதிய கற்பவர் முன்னோடி', badgeFirstDesc: 'அக்ஷரா தளத்தில் பதிவு செய்தார்', badgeStreak: '3 நாள் கற்றல் தொடர்', badgeStreakDesc: 'தொடர்ந்து 3 நாட்கள் கற்றார்', badgePuzzle: 'புதிர் நிபுணர்', badgePuzzleDesc: 'எழுத்தறிவு புதிர்களை முடித்தார்', badgeVoice: 'குரல் நட்சத்திரம்', badgeVoiceDesc: '85% க்கும் மேற்பட்ட உச்சரிப்பு மதிப்பெண்', badgeLesson: 'பாட அறிஞர்', badgeLessonDesc: 'ஒரு சிறு பாடத்தை முடித்தார்' },
    Kannada: { dailyLesson: 'ದೈನಂದಿನ ಸೂಕ್ಷ್ಮ ಪಾಠ', dailyTarget: 'ದೈನಂದಿನ ಗುರಿ ಸಕ್ರಿಯ', foundational: 'ಮೂಲ ಹಂತ', xpEarned: 'XP ಗಳಿಸಲಾಗಿದೆ', progress: 'ಅಭ್ಯಾಸ ಪ್ರಗತಿ', daysActive: 'ದಿನಗಳು ಸಕ್ರಿಯ', consistent: 'ನಿರಂತರ ಕಲಿಕೆಗಾರ', unlocked: 'ಅನ್‌ಲಾಕ್ ಆಗಿದೆ ✓', locked: 'ಲಾಕ್ ಆಗಿದೆ 🔒', badgeFirst: 'ಹೊಸ ಕಲಿಕೆಗಾರ ಮುಂಚೂಣಿ', badgeFirstDesc: 'ಅಕ್ಷರ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ', badgeStreak: '3 ದಿನಗಳ ನಿರಂತರ ಕಲಿಕೆ', badgeStreakDesc: '3 ದಿನ ನಿರಂತರವಾಗಿ ಕಲಿತಿದ್ದೀರಿ', badgePuzzle: 'ಒಗಟು ತಜ್ಞ', badgePuzzleDesc: 'ಸಾಕ್ಷರತಾ ಒಗಟುಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಲಾಗಿದೆ', badgeVoice: 'ಧ್ವನಿ ತಾರೆ', badgeVoiceDesc: '85% ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಉಚ್ಚಾರಣೆ ಅಂಕ', badgeLesson: 'ಪಾಠ ವಿದ್ವಾಂಸ', badgeLessonDesc: 'ಒಂದು ಸೂಕ್ಷ್ಮ ಪಾಠವನ್ನು ಪೂರ್ಣಗೊಳಿಸಲಾಗಿದೆ' }
  };
  return (copy[language] && copy[language][key]) || fallback;
}

const gameQuestionCopy = {
  English: { scenario: 'Everyday situation: identify the word for “{meaning}”.', listen: 'Listen to the word, then select the accurate response.', build: 'Compose the word for “{meaning}” by placing its letters in order.', context: 'Read the short situation and choose the most accurate answer.', meaning: 'In this context, what does “{word}” mean?', tray: 'Select letters in order' },
  Hindi: { scenario: 'रोज़मर्रा की स्थिति: “{meaning}” के लिए शब्द पहचानें।', listen: 'शब्द सुनें, फिर सही उत्तर चुनें।', build: '“{meaning}” के शब्द के अक्षरों को सही क्रम में रखें।', context: 'छोटी स्थिति पढ़ें और सबसे सही उत्तर चुनें।', meaning: 'इस संदर्भ में “{word}” का क्या अर्थ है?', tray: 'अक्षरों को क्रम से चुनें' },
  Telugu: { scenario: 'రోజువారీ పరిస్థితి: “{meaning}” కోసం పదాన్ని గుర్తించండి।', listen: 'పదాన్ని విని, సరైన సమాధానాన్ని ఎంచుకోండి।', build: '“{meaning}” పదంలోని అక్షరాలను సరైన క్రమంలో అమర్చండి।', context: 'చిన్న పరిస్థితిని చదివి, సరైన సమాధానాన్ని ఎంచుకోండి।', meaning: 'ఈ సందర్భంలో “{word}” అంటే ఏమిటి?', tray: 'అక్షరాలను క్రమంలో ఎంచుకోండి' },
  Tamil: { scenario: 'அன்றாடச் சூழல்: “{meaning}” என்பதற்கான சொல்லை அடையாளம் காணவும்.', listen: 'சொல்லைக் கேட்டு, சரியான பதிலைத் தேர்ந்தெடுக்கவும்.', build: '“{meaning}” என்பதற்கான சொல்லின் எழுத்துகளைச் சரியான வரிசையில் அமைக்கவும்.', context: 'குறுகிய சூழலைப் படித்து, சரியான பதிலைத் தேர்ந்தெடுக்கவும்.', meaning: 'இந்தச் சூழலில் “{word}” என்பதன் பொருள் என்ன?', tray: 'எழுத்துகளை வரிசையாகத் தேர்ந்தெடுக்கவும்' },
  Kannada: { scenario: 'ದೈನಂದಿನ ಸಂದರ್ಭ: “{meaning}” ಪದವನ್ನು ಗುರುತಿಸಿ.', listen: 'ಪದವನ್ನು ಆಲಿಸಿ, ಸರಿಯಾದ ಉತ್ತರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.', build: '“{meaning}” ಪದದ ಅಕ್ಷರಗಳನ್ನು ಸರಿಯಾದ ಕ್ರಮದಲ್ಲಿ ಜೋಡಿಸಿ.', context: 'ಸಣ್ಣ ಸಂದರ್ಭವನ್ನು ಓದಿ, ಸರಿಯಾದ ಉತ್ತರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.', meaning: 'ಈ ಸಂದರ್ಭದಲ್ಲಿ “{word}” ಎಂದರೇನು?', tray: 'ಅಕ್ಷರಗಳನ್ನು ಕ್ರಮವಾಗಿ ಆಯ್ಕೆಮಾಡಿ' }
};

function gameQuestionText(key, values = {}) {
  const interfaceLanguage = localStorage.getItem('akshara_interface_language') || 'English';
  let text = (gameQuestionCopy[interfaceLanguage] || gameQuestionCopy.English)[key] || '';
  Object.entries(values).forEach(([name, value]) => { text = text.replace(`{${name}}`, value); });
  return text;
}

function updateInterfaceLanguage(language) {
  const copy = { ...currentInterfaceCopy(), ...interfaceCopy.English, ...(interfaceCopy[language] || {}), ...interfaceExtraCopy.English, ...(interfaceExtraCopy[language] || {}), ...interfaceSectionCopy.English, ...(interfaceSectionCopy[language] || {}), ...interfacePracticeCopy.English, ...(interfacePracticeCopy[language] || {}), ...interfaceActivityCopy.English, ...(interfaceActivityCopy[language] || {}), ...interfaceChallengePageCopy.English, ...(interfaceChallengePageCopy[language] || {}), ...interfaceChallengeControlCopy.English, ...(interfaceChallengeControlCopy[language] || {}), ...interfaceHomeAnalyticsCopy.English, ...(interfaceHomeAnalyticsCopy[language] || {}), ...interfaceHomeDetailCopy.English, ...(interfaceHomeDetailCopy[language] || {}), ...interfaceLevelCopy.English, ...(interfaceLevelCopy[language] || {}) };
  document.documentElement.lang = { Hindi: 'hi', Telugu: 'te', Tamil: 'ta', Kannada: 'kn' }[language] || 'en';
  document.querySelectorAll('[data-ui]').forEach(element => {
    const key = element.dataset.ui;
    if (copy[key]) element.textContent = copy[key];
  });
  if ($('#interfaceLangSelect')) $('#interfaceLangSelect').value = language;
  localStorage.setItem('akshara_interface_language', language);
  if (currentLearner) {
    const learningLanguage = currentLearner.language || 'English';
    renderPillarContent(currentPillar, learningLanguage);
    renderFlashcards(learningLanguage);
  }
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
  if ($('#rptLevel')) $('#rptLevel').textContent = user.proficiency || 'Beginner';
  if ($('#dashStreakVal')) $('#dashStreakVal').textContent = `${user.streakDays || 1} ${dashboardText('daysActive', 'Days Active')}`;
  if ($('#dashXpVal')) $('#dashXpVal').textContent = `${user.totalXp || 0} ${dashboardText('xpEarned', 'XP Earned')}`;
  if ($('#goalStatusTitle')) $('#goalStatusTitle').textContent = dashboardText('dailyLesson', 'Daily Micro-Lesson');
  if ($('#goalText')) $('#goalText').textContent = dashboardText('dailyTarget', 'Daily target active');

  const userLang = user.language || 'Hindi';
  if ($('#dashLangSelect')) $('#dashLangSelect').value = userLang;

  // Fetch streak & achievements from backend
  try {
    const streakRes = await api('/api/learners/me/streak', { method: 'POST' });
    if (streakRes && streakRes.learner) {
      currentLearner = streakRes.learner;
      if ($('#dashStreakVal')) $('#dashStreakVal').textContent = `${streakRes.learner.streakDays || 1} ${dashboardText('daysActive', 'Days Active')}`;
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
  renderDailyWord(userLang);
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

      // Micro-Lessons must stay focused: show only the learner's preferred language.
      const preferredCourses = courseData.courses.filter(course => course.language === language);
      if (!preferredCourses.length) {
        list.innerHTML = `<p class="path-helper">Your ${language} lessons are being prepared. Please choose another preferred language or try again shortly.</p>`;
      }

      for (const course of preferredCourses) {
        try {
          const topics = (await api(`/api/courses/${course.id}/topics`)).topics;
          const topicContent = await Promise.all(topics.map(async topic => ({ topic, lessons: (await api(`/api/topics/${topic.id}/lessons`)).lessons })));
          const isPreferred = course.language === language;
          const card = document.createElement('article');
          const allLessons = topicContent.flatMap(({ lessons }) => lessons);
          let activeLessonFound = false;
          const lessonState = lesson => {
            if (Number(lesson.completion_percent) >= 100) return 'completed';
            if (!activeLessonFound) { activeLessonFound = true; return 'active'; }
            return 'locked';
          };
          card.className = `course-card learning-path-card ${isPreferred ? 'preferred-course' : ''}`;
          card.innerHTML = `
            <div class="learning-path-topbar">
              <div><p class="eyebrow">${course.language} · ${course.proficiency_level}</p><h3>${course.title}</h3><p>${course.description}</p></div>
              <div class="path-summary"><span>🧭</span><b>${allLessons.filter(lesson => Number(lesson.completion_percent) >= 100).length}/${allLessons.length}</b><small>Lessons</small></div>
            </div>
            <div class="learning-path-map">
              ${topicContent.map(({topic, lessons}, topicIndex) => `
                <section class="path-map-topic">
                  <div class="path-section-banner"><span>SECTION ${topicIndex + 1}</span><h4>${topic.title}</h4></div>
                  <div class="path-steps">
                    ${lessons.map((lesson, lessonIndex) => {
                      const state = lessonState(lesson);
                      const side = lessonIndex % 2 === 0 ? 'path-left' : 'path-right';
                      const icon = state === 'completed' ? '✓' : state === 'active' ? '▶' : '🔒';
                      const action = state === 'completed' ? 'Completed ✓' : state === 'active' ? 'Start lesson' : 'Locked';
                      return `<div class="path-step ${side} ${state}">
                        <span class="path-node" aria-label="${state} lesson">${icon}</span>
                        <article class="path-lesson-card"><p>${state === 'active' ? 'YOUR NEXT STEP' : state === 'completed' ? 'COMPLETED' : 'UP NEXT'}</p><strong>${lesson.title}</strong><small>Guided practice · ${lesson.estimated_minutes} min</small>
                        <button ${state === 'locked' ? 'disabled' : ''} data-lesson="${lesson.id}" data-lesson-title="${lesson.title}" data-lesson-kind="${topicIndex === 0 ? (lessonIndex === 0 ? 'letter' : 'word') : (lessonIndex === 0 ? 'greeting' : 'everyday')}">${action}</button></article>
                      </div>`;
                    }).join('')}
                  </div>
                </section>`).join('')}
            </div>
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
  if (pageId === 'page-challenges') {
    const language = (currentLearner && currentLearner.language) || 'English';
    if ($('#challengeLevel') && currentLearner) $('#challengeLevel').textContent = currentLearner.proficiency || 'Beginner';
    renderPillarContent('activities', language);
  }
  if (pageId === 'page-quizzes') {
    const language = (currentLearner && currentLearner.language) || 'English';
    renderPuzzles(language);
    loadLivePracticeQuestion();
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

// Core letters are shown directly in Micro-Lessons so absolute beginners can
// explore the writing system before they are asked to read words.
const alphabetLetters = {
  English: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' '),
  Hindi: 'अ आ इ ई उ ऊ ऋ ए ऐ ओ औ क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह'.split(' '),
  Telugu: 'అ ఆ ఇ ఈ ఉ ఊ ఋ ఎ ఏ ఐ ఒ ఓ ఔ క ఖ గ ఘ ఙ చ ఛ జ ఝ ఞ ట ఠ డ ఢ ణ త థ ద ధ న ప ఫ బ భ మ య ర ల వ శ ష స హ'.split(' '),
  Tamil: 'அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ க ங ச ஞ ட ண த ந ப ம ய ர ல வ ழ ள ற ன'.split(' '),
  Kannada: 'ಅ ಆ ಇ ಈ ಉ ಊ ಋ ಎ ಏ ಐ ಒ ಓ ಔ ಕ ಖ ಗ ಘ ಙ ಚ ಛ ಜ ಝ ಞ ಟ ಠ ಡ ಢ ಣ ತ ಥ ದ ಧ ನ ಪ ಫ ಬ ಭ ಮ ಯ ರ ಲ ವ ಶ ಷ ಸ ಹ'.split(' '),
  Malayalam: 'അ ആ ഇ ഈ ഉ ഊ ഋ എ ഏ ഐ ഒ ഓ ഔ ക ഖ ഗ ഘ ങ ച ഛ ജ ഝ ഞ ട ഠ ഡ ഢ ണ ത ഥ ദ ധ ന പ ഫ ബ ഭ മ യ ര ല വ ശ ഷ സ ഹ'.split(' '),
  Bengali: 'অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ'.split(' '),
  Marathi: 'अ आ इ ई उ ऊ ऋ ए ऐ ओ औ क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह'.split(' ')
};
let selectedAlphabetLetter = {};

function renderAlphabetGuidedLesson(card, language) {
  const letters = alphabetLetters[language] || alphabetLetters.English;
  const selectedIndex = Number.isInteger(selectedAlphabetLetter[language]) ? selectedAlphabetLetter[language] : 0;
  const selected = letters[selectedIndex] || letters[0];
  card.innerHTML = `
    <p class="beginner-step">${activeGuidedLessonTitle || 'LETTER KNOWLEDGE'} · GUIDED PRACTICE</p>
    <h4>Learn ${language} letters</h4>
    <p>Choose any letter below. Look at its shape, listen to it, and repeat it slowly.</p>
    <div class="alphabet-focus">
      <div id="alphabetFocusLetter" class="alphabet-focus-letter">${selected}</div>
      <div><p class="beginner-step">TAP LISTEN AND REPEAT</p><h4>Letter: ${selected}</h4><p>Look at this shape. Tap Listen, then say the sound slowly.</p><button id="alphabetListenBtn" type="button" class="secondary">🔊 Listen to this letter</button></div>
    </div>
    <div class="alphabet-grid" role="list" aria-label="${language} letters">
      ${letters.map((letter, index) => `<button type="button" class="alphabet-letter ${index === selectedIndex ? 'active' : ''}" data-alphabet-index="${index}" aria-label="Learn letter ${letter}">${letter}</button>`).join('')}
    </div>
    <div class="beginner-actions"><button type="button" id="alphabetRestartBtn" class="secondary">Start with first letter</button><button type="button" id="alphabetFinishBtn" class="primary">I practised letters <span>✓</span></button></div>
    <p id="alphabetFeedback" class="beginner-feedback"></p>`;
  if ($('#alphabetListenBtn')) $('#alphabetListenBtn').onclick = () => { playSound('click'); playSpeech(selected, language); };
  card.querySelectorAll('[data-alphabet-index]').forEach(button => button.addEventListener('click', () => {
    selectedAlphabetLetter[language] = Number(button.dataset.alphabetIndex);
    playSound('click');
    renderAlphabetGuidedLesson(card, language);
  }));
  if ($('#alphabetRestartBtn')) $('#alphabetRestartBtn').onclick = () => { selectedAlphabetLetter[language] = 0; renderAlphabetGuidedLesson(card, language); };
  if ($('#alphabetFinishBtn')) $('#alphabetFinishBtn').onclick = async () => {
    const finish = $('#alphabetFinishBtn');
    const feedback = $('#alphabetFeedback');
    finish.disabled = true;
    finish.textContent = 'Saving…';
    try {
      if (activeGuidedLessonId) await api(`/api/lessons/${activeGuidedLessonId}/progress`, { method: 'PUT', body: JSON.stringify({ completion_percent: 100 }) });
      await api('/api/practice/submit', { method: 'POST', body: JSON.stringify({ points: 10 }) });
      feedback.textContent = `Excellent! You explored the ${language} letters.`;
      feedback.style.color = '#287257';
      finish.textContent = 'Completed ✓';
      playSound('success');
      filterAndRenderCourses(language);
      activeGuidedLessonId = null;
      activeGuidedLessonTitle = '';
    } catch (error) {
      finish.disabled = false;
      finish.textContent = 'I practised letters ✓';
      feedback.textContent = error.message;
      feedback.style.color = '#b05d43';
    }
  };
}

const dailyWordBank = {
  English: [['👋', 'Hello', 'A friendly greeting'], ['💧', 'Water', 'Something we drink'], ['📖', 'Book', 'Something we read']],
  Hindi: [['👋', 'नमस्ते', 'A friendly greeting'], ['💧', 'पानी', 'Something we drink'], ['📖', 'किताब', 'Something we read']],
  Telugu: [['👋', 'నమస్కారం', 'A friendly greeting'], ['💧', 'నీరు', 'Something we drink'], ['📖', 'పుస్తకం', 'Something we read']],
  Tamil: [['👋', 'வணக்கம்', 'A friendly greeting'], ['💧', 'நீர்', 'Something we drink'], ['📖', 'புத்தகம்', 'Something we read']],
  Kannada: [['👋', 'ನಮಸ್ಕಾರ', 'A friendly greeting'], ['💧', 'ನೀರು', 'Something we drink'], ['📖', 'ಪುಸ್ತಕ', 'Something we read']],
  Malayalam: [['👋', 'നമസ്കാരം', 'A friendly greeting'], ['💧', 'വെള്ളം', 'Something we drink'], ['📖', 'പുസ്തകം', 'Something we read']],
  Bengali: [['👋', 'নমস্কার', 'A friendly greeting'], ['💧', 'জল', 'Something we drink'], ['📖', 'বই', 'Something we read']],
  Marathi: [['👋', 'नमस्कार', 'A friendly greeting'], ['💧', 'पाणी', 'Something we drink'], ['📖', 'पुस्तक', 'Something we read']]
};

function renderDailyWord(language, moveNext = false) {
  const words = dailyWordBank[language] || dailyWordBank.English;
  const key = `akshara_daily_word_${language}`;
  const today = new Date().toDateString();
  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  const defaultIndex = new Date().getDate() % words.length;
  const index = moveNext ? ((Number(saved.index) || 0) + 1) % words.length : (saved.day === today ? Number(saved.index) : defaultIndex);
  localStorage.setItem(key, JSON.stringify({ day: today, index }));
  const [icon, word, meaning] = words[index];
  if ($('#dailyWordIcon')) $('#dailyWordIcon').textContent = icon;
  if ($('#dailyWordText')) $('#dailyWordText').textContent = word;
  if ($('#dailyWordMeaning')) $('#dailyWordMeaning').textContent = meaning;
  if ($('#dailyWordLanguage')) $('#dailyWordLanguage').textContent = language;
  if ($('#dailyWordStatus')) $('#dailyWordStatus').textContent = '';
  if ($('#playDailyWord')) $('#playDailyWord').onclick = () => speakText(word, language, message => { if ($('#dailyWordStatus')) $('#dailyWordStatus').textContent = message; });
  if ($('#nextDailyWord')) $('#nextDailyWord').onclick = () => renderDailyWord(language, true);
}
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
  if (activeGuidedLessonKind === 'letter') {
    renderAlphabetGuidedLesson(card, language);
    return;
  }
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
document.querySelectorAll('[data-challenge-quiz]').forEach(button => {
  button.addEventListener('click', () => {
    selectedPracticeGame = Number(button.dataset.challengeQuiz);
    playSound('click');
    showDashboardPage('page-challenges');
    $('#challengeDisplay')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
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
  card.innerHTML = `<p>${uiText('preparingQuestion')}</p>`;
  try {
    const skills = ['vocab', 'reading', 'writing', 'comprehension'];
    const skill = skills[Math.floor(Math.random() * skills.length)];
    const interfaceLanguage = localStorage.getItem('akshara_interface_language') || 'English';
    const data = await api(`/api/v1/practice/questions?skill=${skill}&count=1&interface_language=${encodeURIComponent(interfaceLanguage)}`);
    const question = data.questions[0];
    card.innerHTML = `<h4>✨ ${uiText('freshQuestion')}</h4><p>${question.question_text}</p><div class="live-question-options">${question.choices.map(choice => `<button type="button" data-live-answer="${choice}">${choice}</button>`).join('')}</div><p class="live-question-feedback"></p>`;
    card.querySelectorAll('[data-live-answer]').forEach(button => button.addEventListener('click', async () => {
      const feedback = card.querySelector('.live-question-feedback');
      card.querySelectorAll('button').forEach(item => item.disabled = true);
      try {
        const result = await api(`/api/v1/practice/questions/${question.token}/answer`, { method: 'POST', body: JSON.stringify({ answer: button.dataset.liveAnswer }) });
        feedback.textContent = result.correct ? uiText('correctAnswer') : uiText('tryAgain');
        feedback.style.color = result.correct ? '#287257' : '#b05d43';
        if (result.correct) playSound('success'); else playSound('error');
        const next = document.createElement('button'); next.type = 'button'; next.textContent = uiText('nextQuizQuestion'); next.className = 'btn-executive'; next.style.marginTop = '10px'; next.onclick = loadLivePracticeQuestion; card.append(next);
      } catch (error) { feedback.textContent = error.message; feedback.style.color = '#b05d43'; }
    }));
  } catch (error) { card.innerHTML = `<p>${uiText('signInQuiz')}</p>`; }
}

// ----------------------------------------------------
// PILLAR CONTENT & FLASHCARDS
// ----------------------------------------------------
let currentPillar = 'reading';
let pillarIndices = { reading: 0, writing: 0, vocab: 0, comprehension: 0, activities: 0 };
let selectedPracticeGame = 0;

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

function learningVisual(item) {
  const text = `${item.word || ''} ${item.meaning || ''}`.toLowerCase();
  if (text.includes('hello') || text.includes('greeting') || text.includes('नमस्ते') || text.includes('నమస్కారం')) return '👋';
  if (text.includes('water') || text.includes('पानी') || text.includes('నీరు')) return '💧';
  if (text.includes('book') || text.includes('किताब') || text.includes('పుస్తకం')) return '📚';
  if (text.includes('home') || text.includes('घर') || text.includes('ఇల్లు')) return '🏠';
  if (text.includes('sun') || text.includes('सूरज')) return '☀️';
  if (text.includes('tree') || text.includes('पेड़')) return '🌳';
  return '✨';
}

function gameOptions(words, target, index) {
  const options = rotatePracticeItems(words.filter(item => item.word !== target.word), index).slice(0, 2);
  return shuffleWithSeed([target, ...options], getSessionSeed() + index * 31).map(item => item.word);
}

function renderPillarContent(pillar, language) {
  currentPillar = pillar || 'reading';
  const flashcardsSection = $('#flashcardsSection');
  if (flashcardsSection) flashcardsSection.classList.toggle('hidden', currentPillar !== 'vocab');
  const rawData = (pillarData[language] || pillarData.default);
  const container = currentPillar === 'activities' ? $('#challengeDisplay') : $('#pillarDisplay');
  if (!container) return;
  document.querySelectorAll('.pillar-tab-pro, .pillar-tab').forEach(t => t.classList.toggle('active', t.dataset.pillar === currentPillar));

  const idx = pillarIndices[currentPillar] || 0;

  if (currentPillar === 'reading') {
    const list = rawData.reading;
    const item = list[idx] || createContinuousPractice('reading', rawData, idx, language) || list[idx % list.length];
    container.innerHTML = `
      <h4>📖 ${uiText('passage')} ${idx + 1}</h4>
      <p style="font-size:18px; font-weight:600; color:#1e5149; margin:8px 0;">"${item.text}"</p>
      <p style="font-size:13px; color:var(--muted);">${uiText('listenReading')}</p>
      <div style="display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;">
        <button id="readAudioBtn" type="button" class="secondary" style="font-size:13px;">🔊 ${uiText('listenReading')}</button>
        <button id="nextReadingBtn" type="button" class="btn-executive" style="font-size:13px;">${uiText('nextPassage')} ➔</button>
      </div>`;
    if ($('#readAudioBtn')) $('#readAudioBtn').onclick = () => { playSound('click'); playSpeech(item.text, language); };
    if ($('#nextReadingBtn')) $('#nextReadingBtn').onclick = () => { playSound('click'); pillarIndices.reading++; renderPillarContent('reading', language); };
  } else if (currentPillar === 'writing') {
    const list = rawData.writing;
    const item = list[idx] || createContinuousPractice('writing', rawData, idx, language) || list[idx % list.length];
    container.innerHTML = `
      <h4>✍️ ${uiText('writingPractice')}</h4>
      <p style="font-size:14px; font-weight:600; margin:4px 0 10px; color:#1e5149;">${item.prompt}</p>
      <p class="writing-help">${uiText('writingHint')}</p>
      <input id="writeInput" type="text" lang="${(langCodes[language] || 'en').split('-')[0]}" spellcheck="false" autocapitalize="off" placeholder="${uiText('typeAnswer')}" />
      <div style="display:flex; gap:10px; margin-top:8px;">
        <button id="listenWriteBtn" type="button" class="secondary" style="font-size:13px;">🔊 ${uiText('listenWord')}</button>
        <button id="checkWriteBtn" type="button" class="primary" style="font-size:13px; padding:10px 16px;">${uiText('checkAnswer')} ✓</button>
        <button id="nextWriteBtn" type="button" class="btn-executive" style="font-size:13px;">${uiText('nextQuestion')} ➔</button>
      </div>
      <p id="writeFeedback" class="exercise-feedback"></p>`;
    if ($('#listenWriteBtn')) $('#listenWriteBtn').onclick = () => { speakText(item.target, language, message => { const fb = $('#writeFeedback'); if (fb) { fb.textContent = message; fb.style.color = '#52675f'; } }); };
    if ($('#checkWriteBtn')) $('#checkWriteBtn').onclick = () => {
      const val = $('#writeInput').value.trim();
      const fb = $('#writeFeedback');
      if (val.toLowerCase() === item.target.toLowerCase()) {
        playSound('success');
        fb.textContent = 'Awesome job! Correct answer. ✓ (+15 XP)';
        fb.style.color = '#287257';
        api('/api/practice/submit', { method: 'POST', body: JSON.stringify({ points: 15 }) }).catch(() => {});
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
      <h4>🔤 ${uiText('vocabularyBuilder')}</h4>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-top:10px;">
        ${list.map(v => `
          <div style="background:#f4f9f7; padding:10px 12px; border-radius:8px; border:1px solid #d4e3dc; cursor:pointer;" onclick="playSpeech('${v.word}', '${language}')">
            <p style="font-weight:700; color:#1e5149; margin:0; font-size:15px;">${v.word} 🔊</p>
            <p style="font-size:12px; color:var(--muted); margin:4px 0 0 0;">${v.meaning}</p>
          </div>
        `).join('')}
      </div>
      <button id="nextVocabBtn" type="button" class="btn-executive" style="margin-top:12px; font-size:13px;">${uiText('nextVocabulary')} ➔</button>`;
    if ($('#nextVocabBtn')) $('#nextVocabBtn').onclick = () => { playSound('click'); pillarIndices.vocab++; renderPillarContent('vocab', language); };
  } else if (currentPillar === 'comprehension') {
    const list = rawData.comprehension;
    const item = list[idx] || createContinuousPractice('comprehension', rawData, idx, language) || list[idx % list.length];
    container.innerHTML = `
      <h4>🧩 ${uiText('comprehensionPractice')}</h4>
      <p style="background:#edf7df; padding:12px; border-radius:8px; font-size:14px; color:#234d44; margin:8px 0;">${item.story}</p>
      <p style="font-weight:600; font-size:14px; margin:10px 0 6px;">${item.question}</p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        ${item.options.map(opt => `<button class="comp-opt secondary" style="font-size:13px; padding:8px 12px;">${opt}</button>`).join('')}
      </div>
      <p id="compFeedback" class="exercise-feedback"></p>
      <button id="nextCompBtn" type="button" class="btn-executive" style="margin-top:12px; font-size:13px;">${uiText('nextQuestion')} ➔</button>`;
    document.querySelectorAll('.comp-opt').forEach(btn => btn.onclick = () => {
      const fb = $('#compFeedback');
      if (btn.textContent === item.correct) {
        playSound('success');
        fb.textContent = `${uiText('correctAnswer')} ✓`;
        fb.style.color = '#287257';
      } else {
        playSound('error');
        fb.textContent = uiText('tryAgain');
        fb.style.color = '#b05d43';
      }
    });
    if ($('#nextCompBtn')) $('#nextCompBtn').onclick = () => { playSound('click'); pillarIndices.comprehension++; renderPillarContent('comprehension', language); };
  } else if (currentPillar === 'activities') {
    const words = (rawData.vocab || []).flat();
    const gameType = selectedPracticeGame;
    // Each game starts on a different vocabulary item. Advancing to the next
    // challenge changes all five exercises instead of repeating one question.
    const activityIndex = idx * 5 + gameType;
    const target = words[activityIndex % words.length] || { word: 'Hello', meaning: 'Greeting' };
    const options = gameOptions(words.length ? words : [target], target, activityIndex);
    const authored = rawData.activities && rawData.activities[activityIndex % rawData.activities.length];
    const learnerLevel = (currentLearner && currentLearner.proficiency) || 'Beginner';
    const choiceCount = learnerLevel === 'Beginner' ? 2 : 3;
    const allMeaningChoices = Array.from(new Set(rotatePracticeItems(words, activityIndex + 2).map(item => item.meaning).filter(meaning => meaning && meaning !== target.meaning)));
    const meaningChoices = shuffleWithSeed([target.meaning, ...shuffleWithSeed(allMeaningChoices, getSessionSeed() + activityIndex * 19).slice(0, 2)], getSessionSeed() + activityIndex * 29);
    const comprehensionItem = (rawData.comprehension || [])[activityIndex % (rawData.comprehension || []).length];
    const levelWordOptions = options.slice(0, choiceCount);
    const levelMeaningChoices = meaningChoices.slice(0, choiceCount);
    const game = gameType === 0 ? {
      label: 'EVERYDAY DECISION', title: 'Choose the useful word',
      prompt: gameQuestionText('scenario', { meaning: target.meaning }), choices: levelWordOptions, correct: target.word
    } : gameType === 1 ? {
      label: 'AUDIO RESPONSE', title: 'Identify what you hear',
      prompt: gameQuestionText('listen'), choices: levelWordOptions, correct: target.word, audio: target.word
    } : gameType === 2 ? {
      label: 'WORD COMPOSER', title: 'Arrange the word accurately', mode: 'build',
      prompt: gameQuestionText('build', { meaning: target.meaning }), correct: target.word
    } : gameType === 3 && comprehensionItem ? {
      label: 'CONTEXT READER', title: 'Respond to the situation', story: comprehensionItem.story,
      prompt: gameQuestionText('context'), choices: comprehensionItem.options, correct: comprehensionItem.correct
    } : {
      label: 'MEANING CHECK', title: 'Use the context clue',
      prompt: gameQuestionText('meaning', { word: target.word }), choices: levelMeaningChoices, correct: target.meaning
    };
    if (gameType === 4 && (learnerLevel === 'Intermediate' || learnerLevel === 'Advanced') && comprehensionItem) {
      game.label = 'READING DECISION';
      game.title = 'Choose the best response';
      game.story = comprehensionItem.story;
      game.prompt = gameQuestionText('context');
      game.choices = comprehensionItem.options;
      game.correct = comprehensionItem.correct;
    }
    const gameNameKeys = ['pictureMatch', 'listenChoose', 'wordChallenge', 'letterHunt', 'quickQuiz'];
    game.label = uiText(gameNameKeys[gameType]);
    game.title = uiText(gameNameKeys[gameType]);
    const wordLetters = Array.from(cleanPracticeWord(target.word)).filter(letter => letter.trim()).slice(0, 8);
    const missingAt = wordLetters.length > 1 ? 0 : -1;
    const shuffledLetters = shuffleWithSeed(wordLetters, getSessionSeed() + activityIndex * 37);
    container.innerHTML = `
      <div class="game-picker" aria-label="Choose a game">
        ${['pictureMatch', 'listenChoose', 'wordChallenge', 'letterHunt', 'quickQuiz'].map((name, index) => `<button type="button" class="game-picker-button ${index === gameType ? 'active' : ''}" data-game-type="${index}">${uiText(name)}</button>`).join('')}
      </div>
      <section class="game-play-area">
        <div class="game-heading"><div><p class="section-eyebrow">${game.label}</p><h4>${game.title}</h4></div><div class="game-level-badges"><span class="status-pill green">${learnerLevel}</span><span class="status-pill lime">${uiText('points')}</span></div></div>
        <div class="game-status-bar"><span class="challenge-marker" aria-hidden="true">●</span><span>${uiText('mission')}</span><strong id="gameStatus">${uiText('ready')}</strong></div>
        ${game.story ? `<p class="game-story">${game.story}</p>` : ''}
        <p class="game-prompt">${game.prompt}</p>
        ${game.audio ? `<button id="gameListenBtn" type="button" class="secondary game-listen">🔊 ${uiText('hearAgain')}</button>` : ''}
        ${game.mode === 'build' ? `
          <div id="wordBuildTray" class="word-build-tray" aria-label="Your answer"></div>
          <div class="game-options letter-options">${shuffledLetters.map((letter, position) => `<button class="game-option" type="button" data-build-letter="${letter}" data-letter-position="${position}">${letter}</button>`).join('')}</div>
          <div class="game-action-row"><button id="clearBuildBtn" type="button" class="secondary">${uiText('clear')}</button><button id="checkBuildBtn" type="button" class="primary">${uiText('check')}</button></div>`
          : `<div class="game-options">${game.choices.map(option => `<button class="game-option" type="button" data-game-answer="${option === game.correct ? 'correct' : 'wrong'}">${option}</button>`).join('')}</div>`}
        <p id="gameFeedback" class="exercise-feedback"></p>
      </section>
      <button id="nextActBtn" type="button" class="btn-executive" style="margin-top:12px; font-size:13px;">${uiText('newGameQuestion')}</button>`;
    document.querySelectorAll('[data-game-type]').forEach(button => button.onclick = () => {
      selectedPracticeGame = Number(button.dataset.gameType);
      playSound('click');
      renderPillarContent('activities', language);
    });
    if ($('#gameListenBtn')) $('#gameListenBtn').onclick = () => { speakText(game.audio, language, message => { const feedback = $('#gameFeedback'); if (feedback) { feedback.textContent = message; feedback.style.color = '#52675f'; } }); };
    if (game.mode === 'build') {
      const builtLetters = [];
      const tray = $('#wordBuildTray');
      const drawBuiltWord = () => { if (tray) tray.textContent = builtLetters.length ? builtLetters.join('') : gameQuestionText('tray'); };
      drawBuiltWord();
      document.querySelectorAll('[data-build-letter]').forEach(btn => btn.onclick = () => {
        builtLetters.push(btn.dataset.buildLetter);
        btn.disabled = true;
        drawBuiltWord();
        playSound('click');
      });
      if ($('#clearBuildBtn')) $('#clearBuildBtn').onclick = () => {
        builtLetters.length = 0;
        document.querySelectorAll('[data-build-letter]').forEach(btn => { btn.disabled = false; });
        drawBuiltWord();
      };
      if ($('#checkBuildBtn')) $('#checkBuildBtn').onclick = () => {
        const feedback = $('#gameFeedback');
        if (builtLetters.join('') === cleanPracticeWord(game.correct)) {
          playSound('success'); feedback.textContent = uiText('greatRound'); feedback.style.color = '#287257';
          $('#gameStatus').textContent = uiText('missionComplete'); $('.game-play-area')?.classList.add('game-won');
          document.querySelectorAll('[data-build-letter]').forEach(btn => { btn.disabled = true; });
          api('/api/practice/submit', { method: 'POST', body: JSON.stringify({ points: 10 }) }).catch(() => {});
        } else { playSound('error'); feedback.textContent = uiText('niceTryGame'); feedback.style.color = '#b05d43'; }
      };
    }
    document.querySelectorAll('[data-game-answer], [data-missing-answer]').forEach(btn => btn.onclick = () => {
      const fb = $('#gameFeedback');
      if ((btn.dataset.gameAnswer || btn.dataset.missingAnswer) === 'correct') {
        playSound('success');
        fb.textContent = uiText('greatRound');
        fb.style.color = '#287257';
        $('#gameStatus').textContent = uiText('missionComplete');
        $('.game-play-area')?.classList.add('game-won');
        document.querySelectorAll('[data-game-answer]').forEach(option => option.disabled = true);
        api('/api/practice/submit', { method: 'POST', body: JSON.stringify({ points: 10 }) }).catch(() => {});
      } else {
        playSound('error');
        fb.textContent = uiText('niceTryGame');
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
          <span class="fc-badge">${language.toUpperCase()} ${uiText('languageWord')} ${idx + 1}</span>
          <h3>${item.word}</h3>
          <p class="fc-hint">${uiText('cardTap')}</p>
        </div>
        <div class="flashcard-back">
          <span class="fc-badge">${uiText('meaning')}</span>
          <h4>${item.meaning}</h4>
          <button type="button" class="btn-executive" style="margin-top:8px; font-size:11px;" onclick="event.stopPropagation(); playSpeech('${item.word}', '${language}')">🔊 ${uiText('listen')}</button>
        </div>
      </div>
    </div>
  `).join('');
}

let activeSpeechAudio = null;
const speechAudioCache = new Map();
let speechRequestSequence = 0;

function stopActiveSpeech() {
  speechRequestSequence += 1;
  if (activeSpeechAudio) {
    activeSpeechAudio.pause();
    activeSpeechAudio.currentTime = 0;
    activeSpeechAudio = null;
  }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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
  // One learner action should produce one pronunciation only. Stop a previous
  // Sarvam/browser utterance before beginning the next one.
  stopActiveSpeech();
  const requestSequence = speechRequestSequence;
  const cacheKey = `${language}|${text}`;
  const cachedAudio = speechAudioCache.get(cacheKey);
  if (cachedAudio) {
    const audio = new Audio(`data:${cachedAudio.mimeType};base64,${cachedAudio.audioBase64}`);
    activeSpeechAudio = audio;
    audio.onplay = () => { if (onStatus) onStatus('🔊 Playing pronunciation...'); };
    audio.onended = () => { if (activeSpeechAudio === audio) activeSpeechAudio = null; };
    await audio.play();
    return true;
  }
  if (onStatus) onStatus('Preparing pronunciation…');
  try {
    const result = await api('/api/voice/synthesize', { method: 'POST', body: JSON.stringify({ text, language }) });
    // Ignore a slow response if the learner has already clicked another phrase.
    if (requestSequence !== speechRequestSequence) return false;
    if (result.audio_base64) {
      const mimeType = result.mime_type || 'audio/wav';
      speechAudioCache.set(cacheKey, { audioBase64: result.audio_base64, mimeType });
      const audio = new Audio(`data:${mimeType};base64,${result.audio_base64}`);
      activeSpeechAudio = audio;
      audio.onplay = () => { if (onStatus) onStatus('🔊 Playing Sarvam AI pronunciation...'); };
      audio.onended = () => { if (activeSpeechAudio === audio) activeSpeechAudio = null; };
      audio.onerror = () => { if (activeSpeechAudio === audio) activeSpeechAudio = null; if (onStatus) onStatus('Sarvam audio could not play. Trying browser speech…'); speakWithBrowser(text, language, onStatus); };
      await audio.play();
      return true;
    }
  } catch (error) {
    if (requestSequence !== speechRequestSequence) return false;
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
    { badge_key: 'first_step', icon: '🌟', name: 'badgeFirst', desc_key: 'badgeFirstDesc', fallback_name: 'Neo-Learner Pioneer', fallback_desc: 'Registered on Akshara Portal' },
    { badge_key: 'streak_3', icon: '🔥', name: 'badgeStreak', desc_key: 'badgeStreakDesc', fallback_name: '3-Day Streak Master', fallback_desc: 'Learned 3 days continuously' },
    { badge_key: 'puzzle_master', icon: '🧩', name: 'badgePuzzle', desc_key: 'badgePuzzleDesc', fallback_name: 'Puzzle Master', fallback_desc: 'Completed literacy puzzles' },
    { badge_key: 'voice_star', icon: '🎙️', name: 'badgeVoice', desc_key: 'badgeVoiceDesc', fallback_name: 'Voice Star', fallback_desc: 'Achieved 85%+ pronunciation score' },
    { badge_key: 'lesson_1', icon: '📚', name: 'badgeLesson', desc_key: 'badgeLessonDesc', fallback_name: 'Module Scholar', fallback_desc: 'Completed a micro-lesson module' }
  ];

  const unlockedKeys = new Set((achievements || []).map(a => a.badge_key));

  container.innerHTML = defaultBadges.map(b => {
    const isUnlocked = unlockedKeys.has(b.badge_key);
    return `
      <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="badge-icon">${b.icon}</div>
        <h5>${dashboardText(b.name, b.fallback_name)}</h5>
        <p>${dashboardText(b.desc_key, b.fallback_desc)}</p>
        <span class="badge-status">${isUnlocked ? dashboardText('unlocked', 'Unlocked ✓') : dashboardText('locked', 'Locked 🔒')}</span>
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
// Register the offline shell only in browsers that support service workers.
// API data is deliberately not cached, so learners always receive fresh data.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // The app must remain usable even if offline installation is unavailable.
    });
  });
}
