import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Order from './models/Order.js';
import Cart from './models/Cart.js';
import Review from './models/Review.js';
import Coupon from './models/Coupon.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();
    await Review.deleteMany();
    await Coupon.deleteMany();

    console.log('Database cleared...');

    // Create default users
    const salt = 10;
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123', // auto-hashed via pre-save hook
      role: 'admin',
      phone: '9999999999',
      addresses: [
        {
          name: 'Admin Office',
          phone: '9999999999',
          street: '123 Business Park',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          isDefault: true
        }
      ]
    });

    const regularUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
      phone: '8888888888',
      addresses: [
        {
          name: 'Home Address',
          phone: '8888888888',
          street: '456 Residential Ave',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          isDefault: true
        }
      ]
    });

    // Create empty carts
    await Cart.create({ user: adminUser._id, items: [] });
    await Cart.create({ user: regularUser._id, items: [] });

    console.log('Users seeded...');

    // Create Categories
    const categories = await Category.insertMany([
      { name: 'Electronics', description: 'Gadgets, devices, and accessories' },
      { name: 'Fashion', description: 'Clothing, footwear, and styling gear' },
      { name: 'Home Decor', description: 'Furniture, lights, and home design' },
      { name: 'Books', description: 'Educational and literature reads' }
    ]);

    const [electronics, fashion, decor, books] = categories;
    console.log('Categories seeded...');

    // Create Products
    const productsList = [
      {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Experience premium high-fidelity audio with smart noise-cancellation, 40-hour battery life, and ultra-comfortable ergonomic ear cups.',
        price: 14999,
        discountPrice: 12999,
        category: electronics._id,
        images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', publicId: '' }],
        inventory: 15,
        rating: 4.8,
        numReviews: 0,
        specifications: [
          { name: 'Battery Life', value: '40 Hours' },
          { name: 'Connectivity', value: 'Bluetooth 5.2' },
          { name: 'Warranty', value: '1 Year' }
        ],
        isFeatured: true
      },
      {
        name: 'Minimalist Smart Watch V2',
        description: 'Track your health, workouts, and notifications in style with this slim-profile smartwatch featuring an AMOLED display and 7-day battery life.',
        price: 8999,
        discountPrice: 6499,
        category: electronics._id,
        images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', publicId: '' }],
        inventory: 20,
        rating: 4.5,
        numReviews: 0,
        specifications: [
          { name: 'Display', value: 'AMOLED 1.4 inches' },
          { name: 'Waterproof', value: '5 ATM' },
          { name: 'Sensors', value: 'Heart Rate, SpO2, Sleep Tracking' }
        ],
        isFeatured: true
      },
      {
        name: 'Ergonomic Mechanical Keyboard',
        description: 'Tackle your typing sessions with hot-swappable mechanical switches, custom RGB backlighting, and a premium aluminium top frame.',
        price: 5999,
        category: electronics._id,
        images: [{ url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800', publicId: '' }],
        inventory: 8,
        rating: 4.2,
        numReviews: 0,
        specifications: [
          { name: 'Layout', value: '75% Layout' },
          { name: 'Switches', value: 'Gateron Brown' },
          { name: 'Backlight', value: '16.8M Color RGB' }
        ],
        isFeatured: false
      },
      {
        name: 'Classic Leather Jacket',
        description: 'Handcrafted from 100% genuine full-grain leather, this classic double-rider jacket brings vintage style to modern fashion.',
        price: 12999,
        discountPrice: 9999,
        category: fashion._id,
        images: [{ url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', publicId: '' }],
        inventory: 5,
        rating: 4.7,
        numReviews: 0,
        specifications: [
          { name: 'Material', value: '100% Full-grain Leather' },
          { name: 'FitType', value: 'Regular Fit' },
          { name: 'Care', value: 'Professional Dry Clean Only' }
        ],
        isFeatured: true
      },
      {
        name: 'Retro Canvas Sneakers',
        description: 'Versatile low-top canvas sneakers with vulcanized rubber soles and supportive cushioning for all-day comfort.',
        price: 2999,
        category: fashion._id,
        images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', publicId: '' }],
        inventory: 25,
        rating: 4.0,
        numReviews: 0,
        specifications: [
          { name: 'Upper Material', value: 'Canvas' },
          { name: 'Sole', value: 'Vulcanized Rubber' }
        ],
        isFeatured: false
      },
      {
        name: 'Minimalist Ceramic Vase Set',
        description: 'Set of three matte-finished ceramic vases in neutral tones. Perfect for pampas grass, dried flowers, or as standalone decor.',
        price: 2499,
        discountPrice: 1999,
        category: decor._id,
        images: [{ url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800', publicId: '' }],
        inventory: 12,
        rating: 4.6,
        numReviews: 0,
        specifications: [
          { name: 'Material', value: 'Ceramic' },
          { name: 'Quantity', value: 'Set of 3' }
        ],
        isFeatured: true
      },
      {
        name: 'Dimmable Warm Bedside Lamp',
        description: 'Add a warm, cozy glow to your bedroom with this solid wood base bedside lamp featuring step-less rotary dimming controls.',
        price: 1899,
        category: decor._id,
        images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', publicId: '' }],
        inventory: 3,
        rating: 4.3,
        numReviews: 0,
        specifications: [
          { name: 'Bulb Type', value: 'LED E27 (Included)' },
          { name: 'Base Material', value: 'Solid Oak Wood' }
        ],
        isFeatured: false
      },
      {
        name: 'The Art of Deep Work',
        description: 'A masterpiece book discussing cognitive concentration, distraction elimination, and how to train your brain to achieve peak performance.',
        price: 599,
        discountPrice: 449,
        category: books._id,
        images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', publicId: '' }],
        inventory: 50,
        rating: 4.9,
        numReviews: 0,
        specifications: [
          { name: 'Format', value: 'Paperback' },
          { name: 'Pages', value: '304' },
          { name: 'Language', value: 'English' }
        ],
        isFeatured: false
      }
    ];

    await Product.insertMany(productsList);
    console.log('Products seeded...');

    // Create default coupon
    await Coupon.create({
      code: 'WELCOME10',
      discount: 10,
      discountType: 'percentage',
      minPurchase: 1000,
      maxDiscount: 500,
      expiryDate: new Date('2028-12-31'),
      isActive: true
    });

    console.log('Coupons seeded...');
    console.log('Database Seeding Successful!');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
