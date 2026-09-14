import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Ensure environment variables are loaded
if (!process.env.MONGODB_URI || !process.env.CLOUDINARY_URL) {
  console.error('Missing MONGODB_URI or CLOUDINARY_URL in .env.local');
  process.exit(1);
}

const PostSchema = new mongoose.Schema({
  slug: String,
  title: String,
  coverImage: String,
  backImage: String,
}, { strict: false });

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

async function uploadToCloudinary(localPath, folderName) {
  try {
    const fullPath = path.join(process.cwd(), 'public', localPath);
    if (!fs.existsSync(fullPath)) {
      console.warn('File not found locally:', fullPath);
      return null;
    }
    const fileName = path.basename(localPath).split('.')[0];
    
    // Check if it's already a Cloudinary URL
    if (localPath.startsWith('http')) return localPath;

    const result = await cloudinary.uploader.upload(fullPath, {
      folder: folderName,
      public_id: fileName,
      resource_type: 'image',
      overwrite: true,
    });
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading', localPath, error);
    return null;
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const posts = await Post.find({
    $or: [
      { coverImage: { $regex: '^/images/' } },
      { backImage: { $regex: '^/images/' } }
    ]
  });

  console.log(`Found ${posts.length} posts with local images to migrate.`);

  let count = 0;
  for (const post of posts) {
    let updated = false;

    if (post.coverImage && post.coverImage.startsWith('/images/')) {
      console.log(`[${post.slug}] Uploading coverImage...`);
      const newUrl = await uploadToCloudinary(post.coverImage, 'postcards-blog/postcards');
      if (newUrl) {
        post.coverImage = newUrl;
        updated = true;
      }
    }

    if (post.backImage && post.backImage.startsWith('/images/')) {
      console.log(`[${post.slug}] Uploading backImage...`);
      const newUrl = await uploadToCloudinary(post.backImage, 'postcards-blog/postcards');
      if (newUrl) {
        post.backImage = newUrl;
        updated = true;
      }
    }

    if (updated) {
      await post.save();
      count++;
      console.log(`[${post.slug}] Updated in database.`);
    }
  }

  console.log(`Migration completed! Updated ${count} posts.`);
  mongoose.connection.close();
}

run().catch(console.error);
