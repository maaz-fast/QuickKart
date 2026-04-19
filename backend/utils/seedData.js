const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    price: 89.99,
    description:
      'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio for an immersive listening experience.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    category: 'Electronics',
    stock: 50,
  },
  {
    name: 'Mechanical Gaming Keyboard',
    price: 59.99,
    description:
      'RGB backlit mechanical keyboard with tactile switches, anti-ghosting technology, and a durable aluminum frame built for hardcore gamers.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
    category: 'Electronics',
    stock: 35,
  },
  {
    name: 'Smart Fitness Watch',
    price: 129.99,
    description:
      'Track your health with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Water-resistant up to 50 meters.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    category: 'Wearables',
    stock: 60,
  },
  {
    name: 'Portable Bluetooth Speaker',
    price: 45.99,
    description:
      '360-degree surround sound with deep bass, waterproof design IPX7, and 12-hour playtime. Perfect for outdoor adventures.',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80',
    category: 'Electronics',
    stock: 80,
  },
  {
    name: 'Ergonomic Office Chair',
    price: 249.99,
    description:
      'Lumbar support, adjustable armrests, and breathable mesh back. Designed for all-day comfort during long working sessions.',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80',
    category: 'Furniture',
    stock: 20,
  },
  {
    name: 'Stainless Steel Water Bottle',
    price: 24.99,
    description:
      'Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof, and eco-friendly.',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80',
    category: 'Lifestyle',
    stock: 120,
  },
  {
    name: 'Minimalist Leather Wallet',
    price: 34.99,
    description:
      'Slim bifold wallet crafted from genuine leather with RFID blocking technology. Holds up to 8 cards and cash securely.',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80',
    category: 'Accessories',
    stock: 90,
  },
  {
    name: 'USB-C Hub Multiport Adapter',
    price: 39.99,
    description:
      '7-in-1 USB-C hub with 4K HDMI, 3 USB 3.0 ports, SD card reader, and 100W power delivery for MacBook and laptops.',
    image: 'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=500&q=80',
    category: 'Electronics',
    stock: 75,
  },
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(sampleProducts);
      console.log(`🌱 Seeded ${sampleProducts.length} sample products into MongoDB`);
    } else {
      console.log(`ℹ️  Products already exist (${count} found) — skipping seed`);
    }
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
};

module.exports = seedProducts;
