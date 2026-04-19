require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Get Category ID
    const cat = await Category.findOne({ name: 'Home & Decor' });
    if (!cat) {
      console.log('Category "Home & Decor" not found in DB.');
      process.exit();
    }
    console.log(`Category: ${cat.name}, ID: ${cat._id}`);

    // 2. Count products
    const count = await Product.countDocuments({ category: cat._id });
    console.log(`Product count for this category: ${count}`);

    // 3. Check for any products with STRING 'Home & Decor' (old format)
    const rawCount = await mongoose.connection.db.collection('products').countDocuments({ category: 'Home & Decor' });
    console.log(`Raw product count (old string format): ${rawCount}`);
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
