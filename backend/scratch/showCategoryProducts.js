require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const cat = await Category.findOne({ name: 'Home & Decor' });
    if (cat) {
      const products = await Product.find({ category: cat._id });
      console.log('Products in Home & Decor:');
      products.forEach(p => console.log(`- ${p.name} ($${p.price})`));
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
