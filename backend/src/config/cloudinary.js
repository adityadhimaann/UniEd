import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log('✅ Cloudinary configured');
};

const uploadToCloudinary = async (filePath, folder = 'unied') => {
  try {
    // Determine resource type based on file
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      access_mode: 'public',
      type: 'upload',
      flags: 'attachment',
    });

    // For PDFs and documents, create a direct download URL
    let url = result.secure_url;
    
    // If it's a PDF or document, modify URL to force inline display
    if (result.format === 'pdf' || result.resource_type === 'raw') {
      // Use fl_attachment flag to allow direct viewing
      url = url.replace('/upload/', '/upload/fl_attachment/');
    }

    return {
      url: url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

export { configureCloudinary, uploadToCloudinary, deleteFromCloudinary };
export default cloudinary;
