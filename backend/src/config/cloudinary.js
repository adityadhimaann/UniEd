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

const uploadToCloudinary = async (filePathOrBuffer, folder = 'unied') => {
  try {
    // Verify Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    }

    let uploadOptions = {
      folder,
      resource_type: 'auto',
      access_mode: 'public',
      type: 'upload',
      flags: 'attachment',
    };

    let result;
    
    // Check if input is a buffer (from memory storage) or file path
    if (Buffer.isBuffer(filePathOrBuffer)) {
      // Upload from buffer using upload_stream
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload_stream error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(filePathOrBuffer);
      });
    } else {
      // Upload from file path (for backward compatibility)
      result = await cloudinary.uploader.upload(filePathOrBuffer, uploadOptions);
    }

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
    console.error('Cloudinary upload error details:', error);
    throw new Error(`Cloudinary upload failed: ${error.message || error}`);
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
