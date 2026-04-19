require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  {
    name: 'Wireless Bose Headphones',
    price: 299.99,
    description: 'Noise cancelling premium headphones with stunning sound quality.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    stock: 15
  },
  {
    name: 'Logitech G Pro Mouse',
    price: 129.99,
    description: 'Winning precision for gaming professionals.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80',
    stock: 25
  },
  {
    name: 'Mechanical RGB Keyboard',
    price: 89.99,
    description: 'Tactile blue switches with beautiful RGB backlighting.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80',
    stock: 12
  },
  {
    name: '4K Ultra HD Monitor',
    price: 450.00,
    description: '27-inch IPS panel with 144Hz refresh rate.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80',
    stock: 8
  },
  {
    name: 'Smart Home Hub',
    price: 59.99,
    description: 'Control all your devices with just your voice.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1558002038-1037906d998b?w=500&q=80',
    stock: 30
  },
  {
    name: 'Leather Executive Chair',
    price: 199.99,
    description: 'Ergonomic design for long working hours.',
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1505797149-35ebcb00a54e?w=500&q=80',
    stock: 10
  },
  {
    name: 'Modern Desk Lamp',
    price: 34.50,
    description: 'Adjustable brightness and color temperature.',
    category: 'Home & Decor',
    image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500&q=80',
    stock: 45
  },
  {
    name: 'Cotton Polo Shirt',
    price: 25.00,
    description: 'Breathable and classic style polo in navy blue.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80',
    stock: 50
  },
  {
    name: 'Running Shoes X-1',
    price: 75.99,
    description: 'Lightweight and durable shoes for professional runners.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    stock: 20
  },
  {
    name: 'Stainless Steel Watch',
    price: 150.00,
    description: 'Timeless elegance with a water-resistant design.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    stock: 18
  },
  {
    name: 'Designer Sunglasses',
    price: 120.00,
    description: 'Polarized lenses for maximum UV protection.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80',
    stock: 22
  },
  {
    name: 'Yoga Mat Premium',
    price: 45.00,
    description: 'Non-slip surface with perfect cushioning.',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1592432678891-3848b6bc3c21?w=500&q=80',
    stock: 35
  },
  {
    name: 'Adjustable Dumbbells',
    price: 89.00,
    description: 'Space-saving design for your home gym.',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa207381?w=500&q=80',
    stock: 15
  },
  {
    name: 'Ceramic Coffee Mug',
    price: 12.99,
    description: 'Hand-painted minimalist mug for your morning drink.',
    category: 'Home & Decor',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80',
    stock: 60
  },
  {
    name: 'Electric Toaster',
    price: 40.00,
    description: 'Wide slots for bagels and gourmet bread.',
    category: 'Appliances',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80',
    stock: 20
  },
  {
    name: 'Bluetooth Speaker Portable',
    price: 49.99,
    description: 'Rich bass and 20-hour battery life.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608156639585-b3a034ef9199?w=500&q=80',
    stock: 40
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Optional: Clear existing products
    // await Product.deleteMany({});
    // console.log('🗑️ Existing products removed');

    await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${products.length} products!`);
    
    process.exit();
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
