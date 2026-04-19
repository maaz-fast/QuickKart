require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find all unique categories currently in Products (ignoring types because we haven't changed schema yet or just bypass it)
    const rawProducts = await mongoose.connection.db.collection('products').find({}).toArray();
    const categoriesSet = new Set(rawProducts.map(p => p.category).filter(c => typeof c === 'string'));
    
    console.log(`🔍 Found ${categoriesSet.size} unique categories to migrate:`, Array.from(categoriesSet));

    // 2. Create Category documents
    const categoryMap = {}; // name -> _id
    for (const catName of categoriesSet) {
      let category = await Category.findOne({ name: catName });
      if (!category) {
        category = await Category.create({ name: catName });
        console.log(`✨ Created Category: ${catName}`);
      }
      categoryMap[catName] = category._id;
    }

    // 3. Update Products
    let updatedCount = 0;
    for (const p of rawProducts) {
      if (typeof p.category === 'string') {
        const catId = categoryMap[p.category];
        await mongoose.connection.db.collection('products').updateOne(
          { _id: p._id },
          { $set: { category: catId } }
        );
        updatedCount++;
      }
    }

    console.log(`🚀 Migration complete! Updated ${updatedCount} products.`);
    process.exit();
  } catch (error) {
    console.error('❌ Migration Error:', error);
    process.exit(1);
  }
};

migrate();
