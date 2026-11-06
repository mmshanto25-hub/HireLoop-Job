import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.STORAGE_BUCKET || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.STORAGE_ACCESS_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.STORAGE_SECRET_KEY || process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
export { cloudinary };
