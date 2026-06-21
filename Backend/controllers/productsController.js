const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
  try {
    const { category, size, gender, volume, purpose } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (size)     filter.size = size;
    if (gender)   filter.gender = gender;
    if (volume)   filter.volume = volume;
    if (purpose)  filter.purpose = purpose;

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({});

    const products = [
      // ── PERFUMES - MEN 60ml ──
      { name: '60ml perfume', price: 300, category: 'perfumes', size: '60ml', gender: 'men', image: 'perfume_300_men.jpeg',
        scents: ['Black Phantom','Creed Silver','3G','Y Saint Laurent','Legend Blue MONTBLANC'] },

      { name: '60ml perfume', price: 350, category: 'perfumes', size: '60ml', gender: 'men', image: 'perfume_350_men.jpeg',
        scents: ['Sauvage','Stronger With You','Dunhill Desire','Sculpture','212 VIP','Blue de Chanel','Ultra Male','Strong Me','Karizma','Lacoste White','Issey Miyake','Voyage','1Million Lucky','Invictus','Black Phantom','Black Phantom','Versace eros',"Black L'EXCES"] },

      { name: '60ml perfume', price: 370, category: 'perfumes', size: '60ml', gender: 'men', image: 'perfume_370_men.jpeg',
        scents: ['Khamra','Jimmy Choo','Tom Ford Tobacco Vanille','Asad','Blonde Amber','Zara Gold','Midnight Blue','BMW']},

      { name: '60ml perfume', price: 420, category: 'perfumes', size: '60ml', gender: 'men', image: 'perfume_420_men.jpeg',
        scents: ['HUGO','Baccarat Rouge','Azzaro Wanted','Bianco Latte',"Angel's Share",'Enigma','ZARA For Him','Romance','Shaghaf']},

      { name: '60ml perfume', price: 470, category: 'perfumes', size: '60ml', gender: 'men', image: 'perfume_470_men.jpeg',
        scents: ['Imagination','Erba Pura','Oud Madawy','Layton De Marly','Le Male Elixir','Valentino Born In Rome','Nishane Hacivat','Ana Abiyedh'] },

        { name: '60ml perfume', price: 530, category: 'perfumes', size: '60ml', gender: 'men', image: 'perfume_530_men.jpeg',
        scents: ['Black Afgano','Pacific Chill','TOM FORD Oud Wood'] },

        { name: '60ml perfume', price: 650, category: 'perfumes', size: '60ml', gender: 'men', image: 'perfume_650_men.jpeg',
        scents: ['1001 Nights'] },

      // ── PERFUMES - MEN 100ml ──
      { name: '100ml perfume', price: 470, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfume_470_men_lagre.jpeg',
        scents: ['Black Phantom','Creed Silver','3G','Y Saint Laurent','Legend Blue MONTBLANC'] },

     { name: '100ml perfume', price: 520, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfume_520_men.jpeg',
        scents: ['Sauvage','Stronger With You','Dunhill Desire','Sculpture','212 VIP','Blue de Chanel','Ultra Male','Strong Me','Karizma','Lacoste White','Issey Miyake','Voyage','1Million Lucky','Invictus','Black Phantom','Black Phantom','Versace eros',"Black L'EXCES"] },

      { name: '100ml perfume', price: 580, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfume_580_men.jpeg',
        scents: ['Khamra','Jimmy Choo','Tom Ford Tobacco Vanille','Asad','Blonde Amber','Zara Gold','Midnight Blue','BMW']},

      { name: '100ml perfume', price: 680, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfume_680_men.jpeg',
        scents: ['HUGO','Baccarat Rouge','Azzaro Wanted','Bianco Latte',"Angel's Share",'Enigma','ZARA For Him','Romance','Shaghaf']},

      { name: '100ml perfume', price: 780, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfume_780_men.jpeg',
        scents: ['Imagination','Erba Pura','Oud Madawy','Layton De Marly','Le Male Elixir','Valentino Born In Rome','Nishane Hacivat','Ana Abiyedh'] },

        { name: '100ml perfume', price: 890, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfume_890_men.jpeg',
        scents: ['Black Afgano','Pacific Chill','TOM FORD Oud Wood'] },

        { name: '100ml perfume', price: 1150, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfuem_1150_men.jpeg',
        scents: ['1001 Nights'] },

      // ── PERFUMES - WOMEN 60ml ──
      { name: '60ml perfume', price: 300, category: 'perfumes', size: '60ml', gender: 'women', image: 'perfume_300_wemen.jpeg',
        scents: ['Good Girl','Versace Crystal Noir','Si Passione','Pink Sugar','Coco Chanel'] },

      { name: '60ml perfume', price: 350, category: 'perfumes', size: '60ml', gender: 'women', image: 'perfume_350_wemen.jpeg',
        scents: ['Love is Healthy','Burberry Her','Victoria Secret Bombshell','Black Opium','Olympea','Libre','Mancera Roses Vanille','Scandal','Yara Pink','Kenzo Flower','Into the Night','In the Stars','Dark Kiss','Mancera Coco Vanille'] },

      { name: '60ml perfume', price: 370, category: 'perfumes', size: '60ml', gender: 'women', image: 'perfume_370_wemen.jpeg',
        scents: ['Khamra','Pomegranate Musk','Oud Bouquet','Oud Jassim','Delina de Marly'] },

      // ── PERFUMES - WOMEN 100ml ──
      { name: '100ml perfume', price: 470, category: 'perfumes', size: '100ml', gender: 'women', image: 'perfume_470_wemen.jpeg',
        scents: ['Good Girl','Versace Crystal Noir','Si Passione','Pink Sugar','Coco Chanel'] },

      { name: '100ml perfume', price: 520, category: 'perfumes', size: '100ml', gender: 'women', image: 'perfume_520_wemen.jpeg',
        scents: ['Love is Healthy','Burberry Her','Victoria Secret Bombshell','Black Opium','Olympea','Libre','Mancera Roses Vanille','Scandal','Yara Pink','Kenzo Flower','Into the Night','In the Stars','Dark Kiss','Mancera Coco Vanille']},

      { name: '100ml perfume', price: 580, category: 'perfumes', size: '100ml', gender: 'women', image: 'perfume_580_wemen.jpeg',
        scents: ['Khamra','Pomegranate Musk','Oud Bouquet','Oud Jassim','Delina de Marly'] },

      // ── BODY SPLASH ──
      { name: 'AMWAJ | أمواچ',  price: 250, category: 'bodysplash', size: '220ml', image: 'amwaj.jpeg',  description: 'Top notes are Sea water, Lavender, Mint, Green Notes, Rosemary, Calone and Coriander; middle notes are Sandalwood, Neroli, Geranium and Jasmine; base notes are Musk, Oakmoss, Cedar, Tobacco and Ambergris. | **المقدمة العطرية:** ماء البحر، اللافندر، النعناع، النوتات الخضراء، إكليل الجبل، الكالون، والكزبرة.**قلب العطر:** خشب الصندل، زهر النيرولي، إبرة الراعي (الجرانيوم)، والياسمين.**القاعدة العطرية:** المسك، طحلب السنديان، الأرز، التبغ، والعنبر الرمادي' },
      { name: 'DAHAB | دهب',  price: 300, category: 'bodysplash', size: '220ml', image: 'dahab.jpeg',  description: 'Top notes are Sicilian Orange, Calabrian bergamot and Sicilian Lemon; middle note is Fruits; base notes are White Musk, Madagascar Vanilla and Amber. | **المقدمة العطرية:** البرتقال الصقلي، البرغموت القادم من كالابريا، والليمون الصقلي.**قلب العطر:** الفواكه.**الروائح القاعدية:** المسك الأبيض، فانيليا مدغشقر، والعنبر' },
      { name: 'LEIL | ليل',   price: 250, category: 'bodysplash', size: '220ml', image: 'Leil.jpeg',   description: 'Top note is Tangerine; middle notes are Sandalwood and Starflower; base notes are White Oud, Amber and Musk. | **المقدمة العطرية:** اليوسفي.**قلب العطر:** خشب الصندل وزهرة النجمة.**القاعدة العطرية:** العود الأبيض، والعنبر، والمسك' },
      { name: 'ZAHRAA | زهرة', price: 250, category: 'bodysplash', size: '220ml', image: 'zahraa.jpeg', description: "Top notes are Strawberry, Raspberry, Blackberry, Sour Cherry, Black Currant, Mandarin Orange and Lemon; middle notes are Violet and Jasmine; base notes are Musk, Vanilla, Cashmeran, Woody Notes, Amber, Oakmoss and Patchouli. | **المقدمة العطرية:** الفراولة، التوت الأحمر، التوت الأسود، الكرز الحامض، الكشمش الأسود، البرتقال المندرين، والليمون.**قلب العطر:** البنفسج والياسمين.**القاعدة العطرية:** المسك، الفانيليا، الكاشميران، النوتات الخشبية، العنبر، طحلب السنديان، والباتشولي" },

      // ── NATURAL OILS ──
      { name: 'NAQAA OIL | زيت نقاء ', price: 99, category: 'naturaloils', volume: '30ml', image: 'zeit.jpeg',
        description: 'Premium Zeit oil for ultimate relaxation | زيت فاخر للاسترخاء التام', purpose: 'aromatherapy' },
    ];

    await Product.insertMany(products);
    res.json({ message: `Seeded ${products.length} products successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllProducts, getProductById, seedProducts };