/**
 * TruthCart AI - Grounded Retail Catalogue
 * Real structured products with explicit specs, verified reviews, and inventory state
 */
import { Product } from '../types';

export const CATALOGUE: Product[] = [
  {
    id: 'prod-001',
    sku: 'SNY-WH1000XM5-BLK',
    title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
    brand: 'Sony',
    category: 'Audio',
    subcategory: 'Over-Ear Headphones',
    price: 399.99,
    originalPrice: 449.99,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 1420,
    inStock: true,
    stockCount: 18,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    specs: {
      batteryLifeHours: 30,
      quickCharge: '3 min charge gives 3 hours playback',
      weightGrams: 250,
      ancTechnology: 'Dual Processors V1 and QN1, 8 microphones',
      driverSizeMm: 30,
      bluetoothVersion: '5.2',
      codecsSupported: 'LDAC, AAC, SBC',
      multipointConnection: true,
      has35mmJack: true,
      waterResistance: 'None (Do not expose to heavy rain or water)',
      chargingPort: 'USB-C',
      voiceAssistant: 'Google Assistant & Alexa built-in'
    },
    keyFeatures: [
      'Industry-leading active noise cancellation with 8 microphones',
      '30-hour battery life with ANC enabled (40 hours without)',
      'Ultra-comfortable lightweight design with soft fit leather',
      'Speak-to-Chat auto pause and Crystal Clear hands-free calls',
      'Multipoint pairing to two devices simultaneously'
    ],
    reviews: [
      {
        id: 'rev-001',
        author: 'Marcus Vance',
        rating: 5,
        date: '2026-08-12',
        title: 'Superb ANC for long flights',
        text: 'The noise cancellation completely wiped out engine hum on a 10-hour flight to Tokyo. The battery lasted the entire round trip without recharging.',
        verifiedPurchase: true,
        helpfulCount: 42
      },
      {
        id: 'rev-002',
        author: 'Sarah Jenkins',
        rating: 4,
        date: '2026-09-03',
        title: 'Great sound, but does not fold like the XM4',
        text: 'Audio profile is neutral and detailed. The only downside is the headband does not fold down compactly, making the carrying case a bit bulkier.',
        verifiedPurchase: true,
        helpfulCount: 29
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Standard Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' },
      { id: 'shp-exp', name: 'Express 2-Day Air', daysMin: 1, daysMax: 2, cost: 14.99, carrier: 'FedEx' },
      { id: 'shp-pri', name: 'Priority Overnight', daysMin: 1, daysMax: 1, cost: 29.99, carrier: 'FedEx' }
    ],
    tags: ['headphones', 'anc', 'wireless', 'bluetooth', 'sony', 'premium audio', 'commute', 'travel']
  },
  {
    id: 'prod-002',
    sku: 'BOS-QCULTRA-WHT',
    title: 'Bose QuietComfort Ultra Wireless Noise-Cancelling Headphones',
    brand: 'Bose',
    category: 'Audio',
    subcategory: 'Over-Ear Headphones',
    price: 429.00,
    originalPrice: 429.00,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 960,
    inStock: true,
    stockCount: 12,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    specs: {
      batteryLifeHours: 24,
      immersiveAudioModeBattery: 18,
      weightGrams: 254,
      ancTechnology: 'CustomTune acoustic calibration with Quiet and Aware modes',
      bluetoothVersion: '5.3 with Snapdragon Sound aptX Adaptive',
      multipointConnection: true,
      has35mmJack: true,
      foldingDesign: true,
      chargingPort: 'USB-C',
      waterResistance: 'IPX4 splash-resistant'
    },
    keyFeatures: [
      'Bose Immersive Audio provides spatialized acoustic soundstage',
      'World-class noise cancellation tuned to your personal ear shape',
      '24 hours playback on standard ANC mode, 18 hours in spatial audio',
      'Foldable aluminum hinges fit into a compact hardshell case'
    ],
    reviews: [
      {
        id: 'rev-003',
        author: 'Elena Rostova',
        rating: 5,
        date: '2026-07-28',
        title: 'Unmatched comfort and spatial mode',
        text: 'The earcups are like pillows. Immersive audio mode makes acoustic tracks sound like you are sitting in the front row of a concert hall.',
        verifiedPurchase: true,
        helpfulCount: 38
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Standard Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' },
      { id: 'shp-exp', name: 'Express 2-Day Air', daysMin: 1, daysMax: 2, cost: 14.99, carrier: 'FedEx' }
    ],
    tags: ['headphones', 'bose', 'anc', 'spatial audio', 'over-ear', 'travel']
  },
  {
    id: 'prod-003',
    sku: 'APL-APP2-USBC',
    title: 'Apple AirPods Pro (2nd Generation) with USB-C MagSafe Case',
    brand: 'Apple',
    category: 'Audio',
    subcategory: 'In-Ear Earbuds',
    price: 249.00,
    originalPrice: 249.00,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 3840,
    inStock: true,
    stockCount: 35,
    leadTimeDays: 1,
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    specs: {
      batteryLifeHours: 6,
      caseBatteryLifeHours: 30,
      chipset: 'Apple H2 chip',
      waterResistance: 'IP54 dust, sweat, and water resistant for earbuds and case',
      chargingPort: 'USB-C and MagSafe Qi wireless',
      losslessAudio: '20-bit 48kHz lossless audio with Apple Vision Pro',
      weightGramsPerEarbud: 5.3,
      transparencyMode: 'Adaptive Audio with Conversation Awareness'
    },
    keyFeatures: [
      'Up to 2x more Active Noise Cancellation than 1st generation',
      'Adaptive Audio intelligently blends Transparency and ANC',
      'Precision Finding speaker in MagSafe case with lanyard loop',
      'Sweat and water resistant (IP54) for intense workouts'
    ],
    reviews: [
      {
        id: 'rev-004',
        author: 'David Chen',
        rating: 5,
        date: '2026-09-14',
        title: 'The daily driver for iPhone & Mac users',
        text: 'The seamless device switching across iPhone, iPad, and MacBook makes these the easiest earbuds to live with. Conversation awareness is magical.',
        verifiedPurchase: true,
        helpfulCount: 51
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14, // Note: In-ear earbuds subject to opened hygiene clause
    shippingOptions: [
      { id: 'shp-std', name: 'Standard Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' },
      { id: 'shp-exp', name: 'Express 2-Day Air', daysMin: 1, daysMax: 2, cost: 14.99, carrier: 'FedEx' }
    ],
    tags: ['earbuds', 'apple', 'airpods', 'anc', 'ip54', 'h2', 'usb-c', 'in-ear']
  },
  {
    id: 'prod-004',
    sku: 'ANK-SND-Q45-BLK',
    title: 'Anker Soundcore Space Q45 Adaptive Noise-Cancelling Headphones',
    brand: 'Anker',
    category: 'Audio',
    subcategory: 'Over-Ear Headphones',
    price: 149.99,
    originalPrice: 149.99,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 2150,
    inStock: true,
    stockCount: 45,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80',
    specs: {
      batteryLifeHours: 50,
      batteryLifeWithoutAncHours: 65,
      quickCharge: '5 min charge provides 4 hours playback',
      weightGrams: 292,
      bluetoothVersion: '5.3 with LDAC support',
      multipointConnection: true,
      has35mmJack: true,
      chargingPort: 'USB-C',
      waterResistance: 'None'
    },
    keyFeatures: [
      'Up to 98% noise reduction with 3-stage adaptive noise cancelling',
      'Ultra-long 50-hour playtime in ANC mode (65 hours normal)',
      'LDAC Hi-Res Wireless audio transmission for rich detail',
      'Unbeatable budget performance under $150'
    ],
    reviews: [
      {
        id: 'rev-005',
        author: 'Jordan Miller',
        rating: 5,
        date: '2026-08-01',
        title: 'Best value ANC headphone by a mile',
        text: 'I could not justify $400 for Sony, and these Anker Q45s give 85% of the performance at a third of the price. The 50h battery is unbelievable.',
        verifiedPurchase: true,
        helpfulCount: 64
      }
    ],
    warrantyMonths: 18,
    returnWindowDays: 30,
    shippingOptions: [
      { id: 'shp-std', name: 'Standard Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['budget', 'headphones', 'anker', 'long battery', 'anc', 'ldac', 'under 150']
  },
  {
    id: 'prod-005',
    sku: 'APL-MBA-M3-13-SLV',
    title: 'Apple MacBook Air 13-inch (M3 Chip, 16GB RAM, 512GB SSD)',
    brand: 'Apple',
    category: 'Laptops',
    subcategory: 'Ultrabooks',
    price: 1299.00,
    originalPrice: 1499.00,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 1820,
    inStock: true,
    stockCount: 9,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    specs: {
      processor: 'Apple M3 8-core CPU with 10-core GPU',
      neuralEngine: '16-core Neural Engine for AI acceleration',
      ramGb: 16,
      storageGb: 512,
      displaySizeInches: 13.6,
      displayResolution: '2560x1664 Liquid Retina at 500 nits brightness',
      batteryLifeHours: 18,
      weightLbs: 2.7,
      weightKg: 1.24,
      ports: 'MagSafe 3, 2x Thunderbolt / USB 4, 3.5mm headphone jack',
      externalDisplays: 'Supports up to two external displays with laptop lid closed',
      coolingSystem: 'Fanless, completely silent thermal architecture',
      operatingSystem: 'macOS Sequoia'
    },
    keyFeatures: [
      'Strikingly thin 11.3mm fanless aluminum unibody enclosure',
      'M3 silicon delivers up to 60% faster speed than M1 MacBook Air',
      'Liquid Retina display supporting 1 billion colors and True Tone',
      '1080p FaceTime HD camera with 3-mic array and Spatial Audio speakers'
    ],
    reviews: [
      {
        id: 'rev-006',
        author: 'Alex Thorne',
        rating: 5,
        date: '2026-06-20',
        title: 'Perfect developer and travel laptop',
        text: 'Silent under heavy Docker loads, builds TypeScript in seconds, and battery easily lasts 14 hours away from an outlet. 16GB is the sweet spot.',
        verifiedPurchase: true,
        helpfulCount: 78
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Insured Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' },
      { id: 'shp-exp', name: 'Express 2-Day Air', daysMin: 1, daysMax: 2, cost: 19.99, carrier: 'FedEx' }
    ],
    tags: ['laptop', 'apple', 'macbook', 'm3', 'ultrabook', 'fanless', 'portable', '16gb ram']
  },
  {
    id: 'prod-006',
    sku: 'DEL-XPS14-9440',
    title: 'Dell XPS 14 (Intel Core Ultra 7 155H, 32GB RAM, 1TB SSD, RTX 4050)',
    brand: 'Dell',
    category: 'Laptops',
    subcategory: 'Creator Laptops',
    price: 1999.00,
    originalPrice: 2249.00,
    currency: 'USD',
    rating: 4.5,
    reviewCount: 420,
    inStock: true,
    stockCount: 6,
    leadTimeDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80',
    specs: {
      processor: 'Intel Core Ultra 7 155H (16 cores, up to 4.8 GHz) with Intel AI Boost NPU',
      gpu: 'NVIDIA GeForce RTX 4050 6GB GDDR6 (30W TDP)',
      ramGb: 32,
      ramType: 'LPDDR5x 7467 MT/s dual-channel',
      storageGb: 1024,
      displaySizeInches: 14.5,
      displayResolution: '3.2K (3200x2000) OLED Touch 120Hz at 400 nits',
      batteryCapacityWh: 69.5,
      batteryLifeHours: 9.5,
      weightLbs: 3.8,
      ports: '3x Thunderbolt 4 USB-C, microSD card reader, 3.5mm combo jack',
      keyboard: 'Zero-lattice keyboard with capacitive touch function row',
      operatingSystem: 'Windows 11 Pro'
    },
    keyFeatures: [
      'Stunning 3.2K OLED 120Hz InfinityEdge touch display with 100% DCI-P3',
      'Discrete NVIDIA RTX 4050 graphics for video editing and 3D rendering',
      'Seamless glass trackpad with subtle haptic feedback',
      'Machined CNC aluminum chassis with Gorilla Glass 3 palm rest'
    ],
    reviews: [
      {
        id: 'rev-007',
        author: 'Kavita Sundaram',
        rating: 4,
        date: '2026-08-30',
        title: 'Gorgeous display, touch row takes getting used to',
        text: 'The 3.2K OLED screen is one of the best creator panels on the market. Color accuracy is spot on for Premiere and DaVinci. Capacitive escape key requires muscle memory.',
        verifiedPurchase: true,
        helpfulCount: 31
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Insured Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['laptop', 'dell', 'xps', 'oled', 'creator', 'rtx 4050', '32gb ram', 'windows']
  },
  {
    id: 'prod-007',
    sku: 'LEN-X1CARB-G12',
    title: 'Lenovo ThinkPad X1 Carbon Gen 12 (Intel Core Ultra 7, 16GB, 512GB)',
    brand: 'Lenovo',
    category: 'Laptops',
    subcategory: 'Business Ultrabooks',
    price: 1649.00,
    originalPrice: 1899.00,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 680,
    inStock: true,
    stockCount: 14,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
    specs: {
      processor: 'Intel Core Ultra 7 155U (12 cores, up to 4.8 GHz)',
      ramGb: 16,
      storageGb: 512,
      displaySizeInches: 14.0,
      displayResolution: '1920x1200 IPS Anti-Glare 400 nits, low power',
      weightLbs: 2.42,
      weightKg: 1.09,
      batteryLifeHours: 14.5,
      ports: '2x Thunderbolt 4, 2x USB-A 3.2 Gen 1, 1x HDMI 2.1, 3.5mm audio jack, Nano-SIM slot',
      milSpecRating: 'MIL-STD-810H military durability tested',
      keyboard: 'Spill-resistant legendary ThinkPad keyboard with TrackPoint and glass trackpad',
      security: 'dTPM 2.0, fingerprint reader in keyboard, IR facial login with human presence detection'
    },
    keyFeatures: [
      'Featherlight 2.42 lbs carbon fiber and magnesium chassis',
      'Deep 1.5mm key travel keyboard beloved by business executives and writers',
      'Extensive legacy port selection: 2x USB-A and full-size HDMI 2.1 without dongles',
      'Enterprise security suite with physical webcam privacy shutter'
    ],
    reviews: [
      {
        id: 'rev-008',
        author: 'Robert Sterling',
        rating: 5,
        date: '2026-09-02',
        title: 'Still the undisputed king of business travel',
        text: 'Typing on this keyboard is unmatched. Weighs practically nothing in a briefcase, has HDMI and USB-A so I do not need adapters in client conference rooms.',
        verifiedPurchase: true,
        helpfulCount: 45
      }
    ],
    warrantyMonths: 36, // 3-year premier business warranty
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Insured Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['laptop', 'lenovo', 'thinkpad', 'business', 'ultralight', 'hdmi', 'usb-a', '3-year warranty']
  },
  {
    id: 'prod-008',
    sku: 'ASU-ZEPH-G14-OLED',
    title: 'ASUS ROG Zephyrus G14 Gaming Laptop (Ryzen 9 8945HS, RTX 4070, 32GB)',
    brand: 'ASUS',
    category: 'Laptops',
    subcategory: 'Gaming Laptops',
    price: 1899.99,
    originalPrice: 2099.99,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 890,
    inStock: true,
    stockCount: 8,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
    specs: {
      processor: 'AMD Ryzen 9 8945HS (8 cores, 16 threads, up to 5.2 GHz) with Ryzen AI',
      gpu: 'NVIDIA GeForce RTX 4070 8GB GDDR6 (90W TGP with Dynamic Boost)',
      ramGb: 32,
      ramType: 'LPDDR5X 6400 MHz onboard',
      storageGb: 1024,
      displaySizeInches: 14.0,
      displayResolution: '3K (2880x1800) OLED 120Hz 0.2ms response, G-SYNC',
      weightLbs: 3.31,
      ports: '1x USB4 Type-C (DisplayPort/PD), 1x USB 3.2 Gen 2 Type-C, 2x USB 3.2 Gen 2 Type-A, HDMI 2.1 FRL, UHS-II SD card reader',
      chassis: 'CNC aluminum unibody with Slash Lighting LED array on lid',
      operatingSystem: 'Windows 11 Home'
    },
    keyFeatures: [
      'First gaming laptop with ROG Nebula 3K OLED 120Hz display with 0.2ms response',
      'Full CNC-machined aluminum unibody that weighs only 3.31 lbs',
      'Potent RTX 4070 runs AAA games above 80 FPS at high settings',
      'Quad-speaker audio system with dual force-cancelling woofers'
    ],
    reviews: [
      {
        id: 'rev-009',
        author: 'Derrick Wu',
        rating: 5,
        date: '2026-08-19',
        title: 'The MacBook Pro of gaming laptops',
        text: 'The CNC aluminum chassis and OLED panel are unbelievable. Battery lasts 8 hours doing productivity tasks, and it plays Cyberpunk on ultra settings with DLSS smoothly.',
        verifiedPurchase: true,
        helpfulCount: 52
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Ground Shipping', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['laptop', 'asus', 'rog', 'gaming', 'rtx 4070', 'oled', 'ryzen 9', 'lightweight']
  },
  {
    id: 'prod-009',
    sku: 'ACR-SWIFT-GO14',
    title: 'Acer Swift Go 14 (Intel Core Ultra 5 125H, 16GB RAM, 512GB SSD)',
    brand: 'Acer',
    category: 'Laptops',
    subcategory: 'Budget Ultrabooks',
    price: 649.99,
    originalPrice: 799.99,
    currency: 'USD',
    rating: 4.4,
    reviewCount: 340,
    inStock: true,
    stockCount: 22,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
    specs: {
      processor: 'Intel Core Ultra 5 125H (14 cores, up to 4.5 GHz)',
      ramGb: 16,
      storageGb: 512,
      displaySizeInches: 14.0,
      displayResolution: '1920x1200 IPS 60Hz 100% sRGB',
      weightLbs: 2.9,
      batteryLifeHours: 11,
      ports: '2x Thunderbolt 4 USB-C, 2x USB 3.2 Gen 1 Type-A, HDMI 2.1, microSD slot, headphone jack',
      operatingSystem: 'Windows 11 Home'
    },
    keyFeatures: [
      'Sub-$700 laptop featuring latest Intel Meteor Lake Core Ultra processor with NPU',
      'Dual Thunderbolt 4 ports allow full docking and dual monitor support',
      'Lightweight aluminum top cover under 3 lbs',
      '1440p QHD webcam with background blur and automatic framing'
    ],
    reviews: [
      {
        id: 'rev-010',
        author: 'Emily Watson',
        rating: 5,
        date: '2026-09-01',
        title: 'Unbeatable laptop under $700',
        text: 'Handles college coursework, statistical software, and dozens of browser tabs with zero stutter. The 1440p webcam is sharper than my roommate MacBook.',
        verifiedPurchase: true,
        helpfulCount: 28
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Ground Shipping', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['laptop', 'acer', 'budget', 'under 700', 'student', 'thunderbolt 4', '16gb ram']
  },
  {
    id: 'prod-010',
    sku: 'APL-IP16P-256-BLK',
    title: 'Apple iPhone 16 Pro (256GB, Black Titanium)',
    brand: 'Apple',
    category: 'Smartphones',
    subcategory: 'Flagship Phones',
    price: 1099.00,
    originalPrice: 1099.00,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 1640,
    inStock: true,
    stockCount: 15,
    leadTimeDays: 1,
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
    specs: {
      processor: 'A18 Pro chip with 6-core GPU and hardware ray tracing',
      storageGb: 256,
      displaySizeInches: 6.3,
      displayResolution: 'Super Retina XDR OLED ProMotion 120Hz, Always-On, 2000 nits peak',
      cameraSystem: '48MP Fusion main, 48MP Ultra Wide with macro, 12MP 5x Telephoto with tetraprism',
      cameraControl: 'Dedicated capacitive Camera Control touch button with haptic feedback',
      waterResistance: 'IP68 (maximum depth of 6 meters up to 30 minutes under IEC standard 60529)',
      chargingPort: 'USB-C supporting USB 3 transfer speeds up to 10Gbps',
      chassis: 'Grade 5 Titanium with microblasted finish'
    },
    keyFeatures: [
      'Grade 5 Titanium frame with thinnest borders ever on any Apple product',
      'New Camera Control provides instant tactile control of zoom, focus, and depth of field',
      'A18 Pro silicon powers generative Apple Intelligence features on device',
      '4K 120 fps Dolby Vision video recording in ProRes or Log format'
    ],
    reviews: [
      {
        id: 'rev-011',
        author: 'Carlos Santana',
        rating: 5,
        date: '2026-09-22',
        title: '5x zoom and 4K 120fps video are insane',
        text: 'The 5x optical telephoto lens on the smaller 6.3-inch Pro model makes this the best compact camera phone available. USB 3 transfer speeds dump files to SSDs instantly.',
        verifiedPurchase: true,
        helpfulCount: 49
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Insured Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' },
      { id: 'shp-pri', name: 'Priority Overnight', daysMin: 1, daysMax: 1, cost: 24.99, carrier: 'FedEx' }
    ],
    tags: ['smartphone', 'apple', 'iphone 16 pro', '5x optical zoom', 'titanium', 'ip68', 'a18 pro']
  },
  {
    id: 'prod-011',
    sku: 'SAM-S24U-512-TGY',
    title: 'Samsung Galaxy S24 Ultra (512GB, Titanium Gray, Unlocked)',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Flagship Phones',
    price: 1399.99,
    originalPrice: 1419.99,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 2280,
    inStock: true,
    stockCount: 11,
    leadTimeDays: 1,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80',
    specs: {
      processor: 'Snapdragon 8 Gen 3 for Galaxy (4nm)',
      storageGb: 512,
      ramGb: 12,
      displaySizeInches: 6.8,
      displayResolution: 'Dynamic AMOLED 2X, QHD+, 1-120Hz, Corning Gorilla Armor anti-reflective (2600 nits)',
      cameraSystem: '200MP wide, 50MP 5x periscope, 10MP 3x telephoto, 12MP ultra-wide, 100x Space Zoom',
      sPenBuiltIn: true,
      batteryCapacityMah: 5000,
      chargingWattage: '45W wired, 15W wireless',
      waterResistance: 'IP68 (1.5 meters freshwater for 30 minutes)',
      operatingSystem: 'Android 14 with One UI 6.1 (7 years OS updates promised)'
    },
    keyFeatures: [
      'Corning Gorilla Armor significantly reduces glare and reflections up to 75%',
      'Integrated S Pen stylus tucked into titanium frame for notes and sketching',
      'Quad Telephoto System with 200MP main sensor and AI Nightography zoom',
      'Guaranteed 7 full years of Android operating system and security updates'
    ],
    reviews: [
      {
        id: 'rev-012',
        author: 'Brett Collins',
        rating: 5,
        date: '2026-08-04',
        title: 'The anti-reflective glass is revolutionary',
        text: 'You do not realize how reflective standard phones are until you view this screen in direct sunlight. S Pen is great for signing PDF contracts on the fly.',
        verifiedPurchase: true,
        helpfulCount: 57
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Insured Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['smartphone', 'samsung', 'galaxy s24 ultra', 's-pen', '200mp', 'anti-glare', 'ip68', '512gb']
  },
  {
    id: 'prod-012',
    sku: 'GGL-PX9P-128-OBS',
    title: 'Google Pixel 9 Pro (128GB, Obsidian, Unlocked)',
    brand: 'Google',
    category: 'Smartphones',
    subcategory: 'Flagship Phones',
    price: 999.00,
    originalPrice: 999.00,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 910,
    inStock: true,
    stockCount: 16,
    leadTimeDays: 1,
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
    specs: {
      processor: 'Google Tensor G4 with Titan M2 security coprocessor',
      ramGb: 16,
      storageGb: 128,
      displaySizeInches: 6.3,
      displayResolution: 'Super Actua OLED 1-120Hz LTPO (up to 3000 nits peak)',
      cameraSystem: '50MP Octa PD wide, 48MP Quad PD ultra-wide with Macro Focus, 48MP 5x telephoto, 42MP selfie camera',
      batteryCapacityMah: 4700,
      chargingWattage: '27W wired, 21W wireless with Pixel Stand',
      waterResistance: 'IP68',
      operatingSystem: 'Android 15 (7 years Pixel Drops and OS updates)'
    },
    keyFeatures: [
      'Flagship triple pro camera array packed into a comfortable 6.3-inch hand-friendly size',
      '16GB RAM standard enables multi-modal Gemini Nano on-device AI model',
      'Ultra-bright 3000-nit Super Actua display easily readable in direct sunlight',
      'Call Assist features: Call Screen, Hold for Me, and Clear Calling with AI denoising'
    ],
    reviews: [
      {
        id: 'rev-013',
        author: 'Maya Lin',
        rating: 5,
        date: '2026-09-18',
        title: 'Finally a compact pro camera phone',
        text: 'Google finally put the exact same telephoto camera in the standard size as the XL model. Photos of kids and pets in low light look natural without oversaturation.',
        verifiedPurchase: true,
        helpfulCount: 36
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Ground Shipping', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['smartphone', 'google', 'pixel 9 pro', 'tensor g4', 'gemini nano', 'camera', 'compact pro']
  },
  {
    id: 'prod-013',
    sku: 'APL-WAT-ULT2-BLK',
    title: 'Apple Watch Ultra 2 (GPS + Cellular, 49mm Black Titanium with Trail Loop)',
    brand: 'Apple',
    category: 'Wearables',
    subcategory: 'Smartwatches',
    price: 799.00,
    originalPrice: 799.00,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 1120,
    inStock: true,
    stockCount: 10,
    leadTimeDays: 1,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    specs: {
      caseSizeMm: 49,
      caseMaterial: 'Aerospace-grade Grade 5 titanium with black DLC coating',
      displayBrightnessNits: 3000,
      batteryLifeHours: 36,
      lowPowerModeBatteryHours: 72,
      waterResistance: '100m water resistant (WR100), EN13319 dive computer certified up to 40 meters',
      gpsTechnology: 'Precision dual-frequency GPS (L1 and L5) with route backtracking',
      sirenDecibels: '86 dB emergency siren audible up to 600 feet (180 meters)',
      operatingTempRange: '-20°C to 55°C (-4°F to 130°F)'
    },
    keyFeatures: [
      'Rugged 49mm aerospace titanium case with raised sapphire crystal bezel',
      '3000 nits display brightness with automatic Night Mode via ambient light sensor',
      'Dual-frequency GPS delivers pinpoint accuracy in dense cities and deep woods',
      'Certified dive computer with depth gauge and water temperature sensor'
    ],
    reviews: [
      {
        id: 'rev-014',
        author: 'Nathan Cole',
        rating: 5,
        date: '2026-07-15',
        title: 'Survived a 50-mile ultramarathon with battery to spare',
        text: 'GPS tracked every mile through mountain ravines where standard watches lose signal. Battery had 42% left after 12 hours of continuous active workout tracking.',
        verifiedPurchase: true,
        helpfulCount: 63
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Insured Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['smartwatch', 'apple', 'apple watch ultra', 'gps', 'cellular', 'scuba', 'titanium', 'outdoor']
  },
  {
    id: 'prod-014',
    sku: 'GAR-FOR-965-BLK',
    title: 'Garmin Forerunner 965 GPS Running & Triathlon Smartwatch',
    brand: 'Garmin',
    category: 'Wearables',
    subcategory: 'Fitness Watches',
    price: 599.99,
    originalPrice: 599.99,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 750,
    inStock: true,
    stockCount: 14,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
    specs: {
      displayType: '1.4-inch AMOLED touchscreen with traditional 5-button control',
      bezelMaterial: 'Titanium',
      batteryLifeSmartwatchDays: 23,
      batteryLifeGpsHours: 31,
      waterResistance: '5 ATM (50 meters)',
      navigation: 'Full-color onboard topographic maps with turn-by-turn routing',
      weightGrams: 53,
      connectivity: 'Bluetooth, ANT+, Wi-Fi',
      compatibility: 'iOS and Android smartphones'
    },
    keyFeatures: [
      'Brilliant 1.4-inch AMOLED display with up to 23 days of battery life in smartwatch mode',
      'Built-in full-color topographical maps with SatIQ multi-band GPS',
      'Training Readiness score combines sleep history, HRV status, recovery time, and acute load',
      'Comprehensive running dynamics: stride length, ground contact time balance, running power'
    ],
    reviews: [
      {
        id: 'rev-015',
        author: 'Claire Thibault',
        rating: 5,
        date: '2026-08-11',
        title: 'The ultimate endurance training watch',
        text: 'Coming from an Apple Watch that needed charging every day, charging this Garmin once every 3 weeks while doing 5 runs a week is life-altering.',
        verifiedPurchase: true,
        helpfulCount: 48
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Ground Shipping', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['fitness', 'garmin', 'running', 'triathlon', 'marathon', 'amoled', '23 day battery', 'maps']
  },
  {
    id: 'prod-015',
    sku: 'WHO-STR-40-ONYX',
    title: 'WHOOP 4.0 Fitness and Health Tracker (Includes 12-Month Membership)',
    brand: 'WHOOP',
    category: 'Wearables',
    subcategory: 'Screenless Health Trackers',
    price: 239.00,
    originalPrice: 239.00,
    currency: 'USD',
    rating: 4.4,
    reviewCount: 840,
    inStock: false, // CRITICAL: Intentionally OUT OF STOCK for adversarial out-of-stock tests!
    stockCount: 0,
    leadTimeDays: 0,
    imageUrl: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=600&q=80',
    specs: {
      display: 'Screenless design (No screen or distraction)',
      batteryLifeDays: 5,
      chargingMethod: 'Slide-on wireless waterproof battery pack (charges on body)',
      sensors: '5 LEDs (3 green, 1 red, 1 infrared), 4 photodiodes, skin temp sensor, pulse oximeter',
      waterResistance: 'IP68 (Dustproof and water-resistant up to 10 meters for 2 hours)',
      membershipIncluded: '12 months pre-paid membership included in purchase'
    },
    keyFeatures: [
      'Screen-free continuous 24/7 physiological data tracking for recovery, strain, and sleep',
      'Wearable anywhere: wrist, bicep, or inside WHOOP Body compression apparel',
      'Waterproof battery pack slides onto the band so you never take it off to charge',
      'Includes 12-month full WHOOP membership access'
    ],
    reviews: [
      {
        id: 'rev-016',
        author: 'Danielle Harris',
        rating: 4,
        date: '2026-06-30',
        title: 'Deep insights into alcohol and sleep recovery',
        text: 'It completely changed how I approach sleep and recovery. Having no screen is actually refreshing because there are no notifications interrupting my day.',
        verifiedPurchase: true,
        helpfulCount: 22
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 30,
    shippingOptions: [
      { id: 'shp-std', name: 'Standard Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['whoop', 'recovery', 'sleep tracker', 'screenless', 'hrv', 'out of stock']
  },
  {
    id: 'prod-016',
    sku: 'ROB-S8PRO-ULT-WHT',
    title: 'Roborock S8 Pro Ultra Robot Vacuum and Mop with RockDock Ultra',
    brand: 'Roborock',
    category: 'Home Appliances',
    subcategory: 'Smart Cleaning',
    price: 1199.99,
    originalPrice: 1599.99,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 920,
    inStock: true,
    stockCount: 7,
    leadTimeDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    specs: {
      suctionPowerPa: 6000,
      mopVibrationFrequency: 'VibraRise 2.0 dual vibration modules at 3000 times/min',
      autoMopLiftingMm: 5,
      dockFeatures: 'Self-washing, self-drying with warm air, self-emptying (up to 7 weeks), self-refilling water',
      navigation: 'PreciSense LiDAR with Reactive 3D Obstacle Avoidance',
      dustbagCapacityLiters: 2.5,
      cleanWaterTankLiters: 3.5,
      dirtyWaterTankLiters: 2.9,
      batteryCapacityMah: 5200,
      runTimeMinutes: 180
    },
    keyFeatures: [
      'All-in-one RockDock Ultra washes, dries with warm air, empties dust, and refills water tank',
      'Dual rubber DuoRoller Riser brushes resist hair tangles and boost carpet cleaning',
      '6000 Pa extreme suction pulls deep debris from hardwood crevices and high-pile carpets',
      'Automatic mop lifting detects carpets and lifts mop head 5mm to keep rugs dry'
    ],
    reviews: [
      {
        id: 'rev-017',
        author: 'Greg Halpert',
        rating: 5,
        date: '2026-08-27',
        title: 'Has kept my floors spotless with 2 golden retrievers',
        text: 'The warm air mop drying prevents that gross sour smell completely. The dual rollers never get choked with pet hair like older bristle brushes did.',
        verifiedPurchase: true,
        helpfulCount: 44
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Heavy Item Ground', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS Freight' }
    ],
    tags: ['robot vacuum', 'mop', 'roborock', 'self emptying', 'pet hair', 'lidar', 'smart home']
  },
  {
    id: 'prod-017',
    sku: 'DYS-V15-DET-YEL',
    title: 'Dyson V15 Detect Cordless Stick Vacuum Cleaner',
    brand: 'Dyson',
    category: 'Home Appliances',
    subcategory: 'Cordless Vacuums',
    price: 649.99,
    originalPrice: 749.99,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 2430,
    inStock: true,
    stockCount: 17,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80',
    specs: {
      suctionPowerAirWatts: 230,
      runTimeMinutes: 60,
      filtration: 'Whole-machine HEPA filtration traps 99.99% of microscopic particles down to 0.3 microns',
      laserIllumination: 'Fluffy Optic cleaner head reveals invisible dust on hard floors',
      acousticPiezoSensor: 'Counts and measures microscopic dust particles, showing proof on LCD screen',
      binVolumeLiters: 0.77,
      weightLbs: 6.83,
      chargeTimeHours: 4.5
    },
    keyFeatures: [
      'Precisely angled green optical illumination reveals twice as much invisible dust on bare floors',
      'Piezo sensor automatically ramps up motor suction when high dust concentrations are detected',
      'Digital Motorbar cleaner head de-tangles wrapped hair automatically as you clean',
      'LCD screen displays scientific proof of deep clean and remaining runtime in real time'
    ],
    reviews: [
      {
        id: 'rev-018',
        author: 'Victoria Vance',
        rating: 5,
        date: '2026-07-19',
        title: 'The laser headlight will shock you',
        text: 'I thought my floors were clean until I turned on the Fluffy Optic light in a dim room. It is both satisfying and horrifying how much invisible dust it reveals.',
        verifiedPurchase: true,
        helpfulCount: 55
      }
    ],
    warrantyMonths: 24, // Dyson 2-year warranty
    returnWindowDays: 30,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Ground Shipping', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['dyson', 'vacuum', 'cordless', 'laser', 'hepa', 'pet hair', 'cleaner']
  },
  {
    id: 'prod-018',
    sku: 'BRV-BES881-SST',
    title: 'Breville Barista Touch Impress Espresso Machine (Brushed Stainless Steel)',
    brand: 'Breville',
    category: 'Home Appliances',
    subcategory: 'Coffee & Espresso',
    price: 1499.95,
    originalPrice: 1499.95,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 610,
    inStock: true,
    stockCount: 5,
    leadTimeDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
    specs: {
      heatingSystem: 'ThermoJet heating system reaches optimal extraction temp in 3 seconds',
      pumpPressureBars: 15,
      waterTankCapacityLiters: 2.0,
      beanHopperCapacityGrams: 340,
      tampingSystem: 'Impress Puck System with 22 lbs calibrated tamp and 7-degree barista twist',
      autoMilking: 'Auto MilQ steam wand with alternative milk settings (Oat, Almond, Soy, Dairy)',
      display: 'Full color touchscreen with step-by-step 3D barista guidance',
      materials: 'Brushed Stainless Steel',
      weightLbs: 23
    },
    keyFeatures: [
      'ThermoJet heating system reaches 93°C extraction temperature in just 3 seconds',
      'Impress Puck System delivers precise dose and assisted 10kg tamp without coffee mess',
      'Auto MilQ hands-free steam wand creates silky microfoam calibrated for oat, almond, and dairy milks',
      'Touchscreen interface with pre-programmed café drinks: Flat White, Latte, Cappuccino, Long Black'
    ],
    reviews: [
      {
        id: 'rev-019',
        author: 'Julian Croft',
        rating: 5,
        date: '2026-09-08',
        title: 'Café quality flat whites without the learning curve',
        text: 'The assisted tamp eliminates channeling errors completely. The Auto MilQ oat milk setting produces latte art foam that rivals my neighborhood barista.',
        verifiedPurchase: true,
        helpfulCount: 39
      }
    ],
    warrantyMonths: 24,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Insured Heavy Shipping', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['coffee', 'espresso', 'breville', 'latte', 'steamer', 'oat milk', 'stainless steel']
  },
  {
    id: 'prod-019',
    sku: 'LGE-27GR95UM-4K',
    title: 'LG UltraFine 27-inch 4K OLED Pro Display with USB-C 90W PD',
    brand: 'LG',
    category: 'Displays',
    subcategory: 'Professional Monitors',
    price: 899.99,
    originalPrice: 999.99,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 310,
    inStock: true,
    stockCount: 8,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
    specs: {
      screenSizeInches: 27,
      panelType: 'OLED with true 1,500,000:1 contrast ratio',
      resolution: '4K UHD (3840 x 2160)',
      colorGamut: 'DCI-P3 99%, Adobe RGB 99% hardware calibrated',
      refreshRateHz: 120,
      responseTimeMs: 0.1,
      peakBrightnessNits: 600,
      hdrSupport: 'VESA DisplayHDR True Black 400',
      connectivity: '1x USB-C (90W Power Delivery, DisplayPort Alt Mode), 2x HDMI 2.1, 1x DisplayPort 1.4, 2x USB 3.0 downstream',
      standAdjustability: 'Height (130mm), Tilt (-5° to +20°), Pivot 90° portrait'
    },
    keyFeatures: [
      'Self-lit OLED pixels deliver pure blacks and infinite contrast for color grading',
      'Single USB-C cable powers a MacBook or laptop with 90W PD while transmitting 4K 120Hz signal',
      'Factory hardware color calibration certificate included in box',
      'Smooth 120Hz refresh rate and 0.1ms response eliminate blur'
    ],
    reviews: [
      {
        id: 'rev-020',
        author: 'Trevor Belmont',
        rating: 5,
        date: '2026-08-16',
        title: 'The monitor Apple should have made',
        text: 'Deepest blacks I have ever seen on a desktop monitor. USB-C 90W fast charges my MacBook Pro 14 with a single cable.',
        verifiedPurchase: true,
        helpfulCount: 27
      }
    ],
    warrantyMonths: 36, // 3-year OLED warranty including burn-in protection
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Ground Shipping', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['monitor', 'lg', '4k', 'oled', '120hz', 'usb-c 90w', 'color grading', 'display']
  },
  {
    id: 'prod-020',
    sku: 'LOG-MXM3S-GRY',
    title: 'Logitech MX Master 3S Wireless Performance Mouse',
    brand: 'Logitech',
    category: 'Accessories',
    subcategory: 'Ergonomic Peripherals',
    price: 99.99,
    originalPrice: 99.99,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 4890,
    inStock: true,
    stockCount: 60,
    leadTimeDays: 1,
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    specs: {
      sensorDpi: '8000 DPI Darkfield glass sensor (tracks on glass surfaces >4mm)',
      clicks: 'Quiet Click technology with 90% less click noise than MX Master 3',
      scrollWheel: 'MagSpeed electromagnetic scrolling (1,000 lines per second)',
      batteryLifeDays: 70,
      quickCharge: '1 minute charge yields 3 hours use',
      connectivity: 'Bluetooth Low Energy and Logi Bolt USB Receiver',
      devicePairing: 'Easy-Switch across 3 computers with Logitech Flow copy-paste',
      weightGrams: 141
    },
    keyFeatures: [
      'MagSpeed electromagnetic scroll wheel scrolls 1,000 lines in 1 second with precision stops',
      '8,000 DPI sensor tracks on any surface, including transparent glass conference tables',
      'Quiet Clicks feel satisfying while reducing acoustic click noise by 90%',
      'Thumb wheel and gesture button customized for productivity workflows'
    ],
    reviews: [
      {
        id: 'rev-021',
        author: 'Hannah Lee',
        rating: 5,
        date: '2026-09-10',
        title: 'Essential for spreadsheet and timeline work',
        text: 'The horizontal thumb scroll wheel makes scrubbing horizontal Excel spreadsheets and video timelines effortless. Quiet clicks keep zoom meetings silent.',
        verifiedPurchase: true,
        helpfulCount: 71
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 30,
    shippingOptions: [
      { id: 'shp-std', name: 'Standard Shipping', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'USPS' }
    ],
    tags: ['mouse', 'logitech', 'mx master', 'ergonomic', 'silent clicks', 'bluetooth', 'under 100']
  },
  {
    id: 'prod-021',
    sku: 'HER-AER-B-GRY',
    title: 'Herman Miller Aeron Ergonomic Office Chair (Size B, Fully Loaded)',
    brand: 'Herman Miller',
    category: 'Furniture',
    subcategory: 'Ergonomic Seating',
    price: 1395.00,
    originalPrice: 1545.00,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 1580,
    inStock: true,
    stockCount: 4,
    leadTimeDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c94386915a77?auto=format&fit=crop&w=600&q=80',
    specs: {
      size: 'Size B (Medium - Fits heights 5 ft 3 in to 6 ft 6 in, weight 130 to 325 lbs)',
      suspension: 'Pellicle 8Z breathable elastomeric suspension with 8 latitudinal zones of varying tension',
      postureSupport: 'Adjustable PostureFit SL sacral and lumbar dual-pad stabilization',
      adjustability: 'Fully adjustable arms (height, depth, pivot), forward tilt lock, tilt limiter, pneumatic height',
      weightCapacityLbs: 350,
      warrantyYears: 12, // 12-year 24/7 commercial use warranty
      materials: 'Recycled ocean-bound plastic components, die-cast aluminum base'
    },
    keyFeatures: [
      'Pellicle 8Z breathable mesh allows air, body heat, and moisture to pass through seat and back',
      'PostureFit SL pads stabilize the sacrum and support the lumbar region to mimic standing posture',
      'Fully loaded configuration includes forward tilt for active typing posture',
      'Backed by Herman Miller legendary 12-year, 3-shift warranty including parts and labor'
    ],
    reviews: [
      {
        id: 'rev-022',
        author: 'Dr. Arthur Pendelton',
        rating: 5,
        date: '2026-07-02',
        title: 'Cured my chronic lower back fatigue',
        text: 'As a radiologist sitting 10 hours a day reading scans, this chair is a medical necessity. The PostureFit SL keeps the spine neutral without pressure points.',
        verifiedPurchase: true,
        helpfulCount: 89
      }
    ],
    warrantyMonths: 144, // 12 years!
    returnWindowDays: 30,
    shippingOptions: [
      { id: 'shp-frt', name: 'White Glove Freight Delivery & Unboxing', daysMin: 4, daysMax: 7, cost: 49.0, carrier: 'Herman Miller Logistics' }
    ],
    tags: ['chair', 'herman miller', 'aeron', 'ergonomic', 'lumbar support', '12 year warranty', 'mesh']
  },
  {
    id: 'prod-022',
    sku: 'GOP-HER12-BLK',
    title: 'GoPro HERO12 Black Waterproof Action Camera with HDR Video',
    brand: 'GoPro',
    category: 'Cameras',
    subcategory: 'Action Cameras',
    price: 349.99,
    originalPrice: 399.99,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 880,
    inStock: true,
    stockCount: 19,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=600&q=80',
    specs: {
      videoResolution: '5.3K at 60fps, 4K at 120fps, 2.7K at 240fps (8x slo-mo)',
      photoResolutionMegapixels: 27,
      stabilization: 'HyperSmooth 6.0 with 360-degree Horizon Lock',
      waterproofDepthMeters: 10, // 33 feet without housing
      battery: 'Enduro 1720mAh cold-weather battery included (up to 70 mins at 5.3K60)',
      bluetoothAudio: 'Supports wireless earbuds and AirPods for audio recording and voice commands',
      mounting: 'Dual folding fingers plus standard 1/4-20 tripod thread'
    },
    keyFeatures: [
      'High Dynamic Range (HDR) video captures vivid sky details and deep shadow highlights',
      'HyperSmooth 6.0 Emmy-award-winning stabilization with 360 Horizon Lock keeps footage level even if flipped upside down',
      'Rugged and waterproof down to 33 feet (10 meters) straight out of the box',
      'Timecode sync allows seamless multicam editing across multiple HERO12 cameras'
    ],
    reviews: [
      {
        id: 'rev-023',
        author: 'Soren Lind',
        rating: 5,
        date: '2026-08-14',
        title: 'HyperSmooth 6.0 is virtually a gimbal',
        text: 'Mounted this to my downhill mountain bike handlebars. Rocky trail footage looked as buttery smooth as if it were shot on a mechanical steadicam.',
        verifiedPurchase: true,
        helpfulCount: 41
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Ground Shipping', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['camera', 'gopro', 'action camera', '5.3k', 'waterproof', 'hypersmooth', 'sports']
  },
  {
    id: 'prod-023',
    sku: 'SNY-ILCE-7M4-BLK',
    title: 'Sony Alpha 7 IV Full-Frame Mirrorless Hybrid Camera (Body Only)',
    brand: 'Sony',
    category: 'Cameras',
    subcategory: 'Mirrorless Cameras',
    price: 2298.00,
    originalPrice: 2498.00,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 940,
    inStock: true,
    stockCount: 5,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    specs: {
      sensor: '33MP full-frame Exmor R back-illuminated CMOS sensor',
      imageProcessor: 'BIONZ XR processor (8x more processing power than A7 III)',
      autofocusPoints: '759 phase-detection AF points covering 94% of image area',
      eyeAfTracking: 'Real-time Eye AF for Humans, Animals, and Birds in stills and video',
      videoSpecs: '4K 60p (Super 35) and 4K 30p (oversampled 7K full-frame) 10-bit 4:2:2 All-Intra',
      stabilization: '5-axis in-body optical image stabilization (5.5-step compensation)',
      viewfinder: '3.68 million-dot Quad-VGA OLED EVF with 120fps refresh',
      cardSlots: 'Dual card slots (Slot 1: CFexpress Type A / SD UHS-II, Slot 2: SD UHS-II)'
    },
    keyFeatures: [
      '33MP sensor balances extreme resolution with superb low-light ISO sensitivity',
      'Advanced 4K 10-bit 4:2:2 video with S-Cinetone color profile borrowed from cinema line',
      'Vari-angle side-opening LCD screen for flexible framing and vlogging',
      'Live streaming directly via USB-C at 4K 15p or 1080p 60p without capture cards'
    ],
    reviews: [
      {
        id: 'rev-024',
        author: 'Clara Oswald',
        rating: 5,
        date: '2026-07-29',
        title: 'The perfect workhorse for hybrid photo and video shooters',
        text: 'The 33MP resolution allows generous cropping for portrait client sessions, while the 10-bit 4:2:2 S-Log3 footage grades beautifully without color banding.',
        verifiedPurchase: true,
        helpfulCount: 61
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 14,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Insured Priority Air', daysMin: 2, daysMax: 3, cost: 0.0, carrier: 'FedEx' }
    ],
    tags: ['camera', 'sony', 'full-frame', 'mirrorless', '33mp', '4k 60p', 'bionz xr', 'professional']
  },
  {
    id: 'prod-024',
    sku: 'KIN-OAS-32-GRA',
    title: 'Amazon Kindle Oasis (32GB, Graphite, Free Cellular Connectivity)',
    brand: 'Amazon',
    category: 'Electronics',
    subcategory: 'E-Readers',
    price: 349.99,
    originalPrice: 349.99,
    currency: 'USD',
    rating: 4.6,
    reviewCount: 3120,
    inStock: false, // Intentionally OUT OF STOCK for adversarial tests
    stockCount: 0,
    leadTimeDays: 0,
    imageUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=600&q=80',
    specs: {
      screenSizeInches: 7.0,
      displayTechnology: '300 ppi Paperwhite flush-front glare-free display',
      pageTurnButtons: 'Physical ergonomic page turn buttons',
      lighting: 'Adjustable warm light (amber tone shift) with 25 LEDs and auto-adjusting light sensors',
      waterproofing: 'IPX8 (Submersion in 2 meters of fresh water for up to 60 minutes)',
      storageGb: 32,
      connectivity: 'Wi-Fi + Free 4G Cellular (no monthly contract required)',
      hasEspressoMaker: false, // Grounded explicit negative spec for hallucination probe!
      has5gCellular: false,
      hasProjector: false
    },
    keyFeatures: [
      'Ergonomic asymmetrical grip with physical page-turn buttons',
      'Flush-front 7-inch 300 ppi glare-free Paperwhite display reads like real paper in sunlight',
      'IPX8 waterproof rating lets you read comfortably in the bathtub or by the pool',
      'Free built-in cellular allows downloading books anywhere worldwide without Wi-Fi passwords'
    ],
    reviews: [
      {
        id: 'rev-025',
        author: 'Miriam Vance',
        rating: 5,
        date: '2026-06-15',
        title: 'Physical buttons make all the difference',
        text: 'The aluminum wedge balances naturally in one hand. Physical page click buttons mean you never smudge the reading surface.',
        verifiedPurchase: true,
        helpfulCount: 34
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 30,
    shippingOptions: [
      { id: 'shp-std', name: 'Standard Shipping', daysMin: 3, daysMax: 5, cost: 0.0, carrier: 'UPS' }
    ],
    tags: ['kindle', 'ereader', 'e-ink', 'oasis', 'waterproof', 'page turn buttons', 'out of stock']
  },
  {
    id: 'prod-025',
    sku: 'PUM-VELNIT-1899',
    title: "Puma Velocity Nitro 3 Men's Running Shoes",
    brand: 'Puma',
    category: 'Footwear',
    subcategory: 'Running Shoes',
    price: 1899.00,
    originalPrice: 2499.00,
    currency: 'INR',
    rating: 4.6,
    reviewCount: 520,
    inStock: true,
    stockCount: 22,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    specs: {
      cushioning: 'NITRO FOAM advanced nitrogen-infused lightweight midsole',
      outsole: 'PUMAGRIP all-surface high-traction durable rubber',
      weightGrams: 260,
      dropMm: 8,
      closure: 'Lace-up engineered stability cage',
      terrain: 'Road and paved trail running',
      upperMaterial: 'Engineered breathable multi-layer mesh'
    },
    keyFeatures: [
      'NITRO FOAM nitrogen-injected midsole delivers superior responsiveness and featherlight cushioning',
      'PUMAGRIP high-durability rubber compound provides multi-surface traction in wet and dry conditions',
      'Engineered mesh upper keeps feet cool during high-mileage morning runs',
      'TPU heel clip stabilizes the foot through natural gait transitions'
    ],
    reviews: [
      {
        id: 'rev-026',
        author: 'Rohan Sharma',
        rating: 5,
        date: '2026-08-22',
        title: 'Outstanding value for 10K road training',
        text: 'Responsive cushioning without being overly mushy. Fits true to size and grip on wet asphalt is rock solid. Incredible quality under ₹2,000.',
        verifiedPurchase: true,
        helpfulCount: 48
      }
    ],
    warrantyMonths: 6,
    returnWindowDays: 30,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Standard Ground', daysMin: 2, daysMax: 4, cost: 0.0, carrier: 'BlueDart' },
      { id: 'shp-exp', name: 'Express Air Courier', daysMin: 1, daysMax: 2, cost: 149.0, carrier: 'BlueDart Air' }
    ],
    tags: ['shoes', 'running shoes', 'footwear', 'puma', 'under 2000', 'nitro', 'mens running']
  },
  {
    id: 'prod-026',
    sku: 'SPX-HYPGRP-1299',
    title: "Sparx Hyper-Grip Lightweight Mesh Running Shoes",
    brand: 'Sparx',
    category: 'Footwear',
    subcategory: 'Running Shoes',
    price: 1299.00,
    originalPrice: 1599.00,
    currency: 'INR',
    rating: 4.4,
    reviewCount: 840,
    inStock: true,
    stockCount: 35,
    leadTimeDays: 2,
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    specs: {
      soleMaterial: 'Compression-molded EVA shock-absorbing foam',
      upperMaterial: 'Breathable honeycomb knitted mesh',
      weightGrams: 235,
      closure: 'Reinforced eyelet lacing',
      insole: 'Cushioned removable memory-foam footbed'
    },
    keyFeatures: [
      'Ultra-lightweight EVA sole absorbs repetitive road impacts during daily jogs',
      'Breathable knitted honeycomb upper prevents heat accumulation in warm climates',
      'Textured slip-resistant traction pattern provides reliable grip on concrete tracks'
    ],
    reviews: [
      {
        id: 'rev-027',
        author: 'Arun Patel',
        rating: 4,
        date: '2026-09-05',
        title: 'Very light and comfortable for everyday running',
        text: 'Great daily training shoe for morning park runs. Extremely lightweight and durable for the price.',
        verifiedPurchase: true,
        helpfulCount: 31
      }
    ],
    warrantyMonths: 3,
    returnWindowDays: 30,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Standard Ground', daysMin: 2, daysMax: 4, cost: 0.0, carrier: 'Delhivery' }
    ],
    tags: ['shoes', 'running shoes', 'footwear', 'sparx', 'budget', 'under 1500', 'under 2000', 'lightweight']
  },
  {
    id: 'prod-027',
    sku: 'NIK-PEG40-3499',
    title: 'Nike Air Zoom Pegasus 40 Road Running Shoes',
    brand: 'Nike',
    category: 'Footwear',
    subcategory: 'Running Shoes',
    price: 3499.00,
    originalPrice: 3999.00,
    currency: 'INR',
    rating: 4.8,
    reviewCount: 1650,
    inStock: true,
    stockCount: 14,
    leadTimeDays: 3,
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
    specs: {
      cushioning: 'Dual Zoom Air units (forefoot and heel) with Nike React foam',
      dropMm: 10,
      weightGrams: 285,
      upper: 'Single-layer engineered circular mesh with midfoot band lockdown',
      outsole: 'Waffle-inspired carbon rubber outsole'
    },
    keyFeatures: [
      'Dual Zoom Air units deliver springy energetic toe-off and balanced heel cushioning',
      'Nike React lightweight foam offers resilient longevity across marathon distances',
      'Redesigned midfoot strap provides secure customized arch lockdown'
    ],
    reviews: [
      {
        id: 'rev-028',
        author: 'Vikas Mehra',
        rating: 5,
        date: '2026-07-14',
        title: 'The gold standard marathon workhorse',
        text: 'Clocked over 300km on these Pegasus 40s. The dual Zoom Air units provide the best energy return on long tempo runs.',
        verifiedPurchase: true,
        helpfulCount: 65
      }
    ],
    warrantyMonths: 12,
    returnWindowDays: 30,
    shippingOptions: [
      { id: 'shp-std', name: 'Free Insured Express', daysMin: 2, daysMax: 3, cost: 0.0, carrier: 'BlueDart Air' }
    ],
    tags: ['shoes', 'running shoes', 'footwear', 'nike', 'pegasus', 'premium', 'marathon']
  }
];
