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
      // ── PERFUMES - MEN 50ml ──
      { name: '50ml perfume', price: 200, category: 'perfumes', size: '50ml', gender: 'men', image: 'perfumeBoy.jpeg',
        scents: ['Lacoste White','Issey Miyake','Voyage','1 Million Lucky','Invictus','Versace Eros','Creed Silver','3G','Black L\'exces','Legend Blue MB'] },
      { name: '50ml perfume', price: 250, category: 'perfumes', size: '50ml', gender: 'men', image: 'perfumeBoy.jpeg',
        scents: ['Sauvage','Stronger With You','Dunhill Desire','Sculpture','212 VIP','Blue de Chanel','Ultra Male','Strong Me','Y Saint Laurent','Jimmy Choo','Khamra','Black Phantom','Tom Ford Tobacco','Vanilla'] },
      { name: '50ml perfume', price: 300, category: 'perfumes', size: '50ml', gender: 'men', image: 'perfumeBoy.jpeg',
        scents: ['Hugo','Baccarat Rouge','Azzaro Wanted','Bainco Latte','Angel\'s Share','Enigma','Zara for Him'] },
      { name: '50ml perfume', price: 350, category: 'perfumes', size: '50ml', gender: 'men', image: 'perfumeBoy.jpeg',
        scents: ['Imagination','Erba Pura','Oud Madawy','Layton de Marly','Le Male Elixir','Valentino Rome'] },
      { name: '50ml perfume', price: 400, category: 'perfumes', size: '50ml', gender: 'men', image: 'perfumeBoy.jpeg',
        scents: ['Tom Ford Oud','Black Afgano','Pacific Chill'] },

      // ── PERFUMES - MEN 100ml ──
      { name: '100ml perfume', price: 350, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfumeBoyLarge.jpeg',
        scents: ['Lacoste White','Issey Miyake','Voyage','1 Million Lucky','Invictus','Versace Eros','Creed Silver','3G','Black L\'exces','Legend Blue MB'] },
      { name: '100ml perfume', price: 400, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfumeBoyLarge.jpeg',
        scents: ['Sauvage','Stronger With You','Dunhill Desire','Sculpture','212 VIP','Blue de Chanel','Ultra Male','Strong Me','Y Saint Laurent','Jimmy Choo','Khamra','Black Phantom','Tom Ford Tobacco','Vanilla'] },
      { name: '100ml perfume', price: 450, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfumeBoyLarge.jpeg',
        scents: ['Hugo','Baccarat Rouge','Azzaro Wanted','Bainco Latte','Angel\'s Share','Enigma','Zara for Him'] },
      { name: '100ml perfume', price: 550, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfumeBoyLarge.jpeg',
        scents: ['Imagination','Erba Pura','Oud Madawy','Layton de Marly','Le Male Elixir','Valentino Rome'] },
      { name: '100ml perfume', price: 600, category: 'perfumes', size: '100ml', gender: 'men', image: 'perfumeBoyLarge.jpeg',
        scents: ['Tom Ford Oud','Black Afgano','Pacific Chill'] },

      // ── PERFUMES - WOMEN 50ml ──
      { name: '50ml perfume', price: 200, category: 'perfumes', size: '50ml', gender: 'women', image: 'perfumeGirl.jpeg',
        scents: ['Good Girl','Versace Crystal Noir','Si Passione','Pink Sugar','Coco Chanel'] },
      { name: '50ml perfume', price: 250, category: 'perfumes', size: '50ml', gender: 'women', image: 'perfumeGirl.jpeg',
        scents: ['Love is Healthy','Burberry Her','Black Option','Olympea','Yara Pink','Libre','Roses Vanilla','Scandal','Kenzo Flower','Into the Night','In the Stars','Dark Kiss','V.C Bombshell'] },
      { name: '50ml perfume', price: 300, category: 'perfumes', size: '50ml', gender: 'women', image: 'perfumeGirl.jpeg',
        scents: ['Pomegranate Musk','Oud Bouquet','Oud Jassim','Delina de Marly','La Belle Le Parfum'] },

      // ── PERFUMES - WOMEN 100ml ──
      { name: '100ml perfume', price: 350, category: 'perfumes', size: '100ml', gender: 'women', image: 'PerfumeGirlLarge.jpeg',
        scents: ['Good Girl','Versace Crystal Noir','Si Passione','Pink Sugar','Coco Chanel'] },
      { name: '100ml perfume', price: 400, category: 'perfumes', size: '100ml', gender: 'women', image: 'PerfumeGirlLarge.jpeg',
        scents: ['Love is Healthy','Burberry Her','Black Option','Olympea','Yara Pink','Libre','Roses Vanilla','Scandal','Kenzo Flower','Into the Night','In the Stars','Dark Kiss','V.C Bombshell'] },
      { name: '100ml perfume', price: 450, category: 'perfumes', size: '100ml', gender: 'women', image: 'PerfumeGirlLarge.jpeg',
        scents: ['Pomegranate Musk','Oud Bouquet','Oud Jassim','Delina de Marly','La Belle Le Parfum'] },

      // ── BODY SPLASH ──
      { name: 'AMWAJ',  price: 220, category: 'bodysplash', size: '220ml', image: 'amwaj.jpeg',  description: 'Top  notes are Sea water, Lavender, Mint, Green Notes, Rosemary, Calone and Coriander; middle notes are Sandalwood, Neroli, Geranium and Jasmine; base notes are Musk, Oakmoss, Cedar, Tobacco and Ambergris.' },
      { name: 'DAHAB',  price: 300, category: 'bodysplash', size: '220ml', image: 'dahab.jpeg',  description: 'Top notes are Sicilian Orange, Calabrian bergamot and Sicilian Lemon; middle note is Fruits; base notes are White Musk, Madagascar Vanilla and Amber.' },
      { name: 'LEIL',   price: 220, category: 'bodysplash', size: '220ml', image: 'Leil.jpeg',   description: 'Top note is Tangerine; middle notes are Sandalwood and Starflower; base notes are White Oud, Amber and Musk.' },
      { name: 'ZAHRAA', price: 250, category: 'bodysplash', size: '220ml', image: 'zahraa.jpeg', description: 'Top notes are Strawberry, Raspberry, Blackberry, Sour Cherry, Black Currant, Mandarin Orange and Lemon; middle notes are Violet and Jasmine; base notes are Musk, Vanilla, Cashmeran, Woody Notes, Amber, Oakmoss and Patchouli.' },

      // ── NATURAL OILS ──
      { name: 'NAQAA OIL | زيت نقاء ', price: 99, category: 'naturaloils', volume: '30ml', image: 'zeit.jpeg',
        description: 'Premium Zeit oil for ultimate relaxation', purpose: 'aromatherapy' },
    ];

    await Product.insertMany(products);
    res.json({ message: `Seeded ${products.length} products successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllProducts, getProductById, seedProducts };