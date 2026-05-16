const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يرجى تحميل ملف صورة (JPEG, PNG, WebP)'));
  }
};

// تهيئة Cloudinary مرة واحدة عند الاستيراد
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

/**
 * يُنشئ multer middleware يستخدم memory storage.
 * استخدم uploadToCloudinary() بعد ذلك لرفع الملفات يدويًا.
 */
function createMulterUpload({ folder } = {}) {
  const limits = { fileSize: 50 * 1024 * 1024 };
  return multer({
    storage: multer.memoryStorage(),
    limits,
    fileFilter: imageFileFilter
  });
}

/**
 * يرفع Buffer واحد إلى Cloudinary ويُرجع { secure_url, public_id, url }
 * @param {Buffer} buffer - محتوى الملف
 * @param {object} options - خيارات Cloudinary (folder, resource_type...)
 * @returns {Promise<{secure_url: string, public_id: string, url: string}>}
 */
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/**
 * يرفع مصفوفة من ملفات multer (req.files) إلى Cloudinary.
 * يُرجع مصفوفة من { url, secure_url, public_id, original_filename }
 * @param {Express.Multer.File[]} files
 * @param {string} folder - مجلد Cloudinary
 * @returns {Promise<Array>}
 */
async function uploadFilesToCloudinary(files, folder = 'uploads') {
  if (!files || files.length === 0) return [];
  const results = await Promise.all(
    files.map((file) =>
      uploadBufferToCloudinary(file.buffer, {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
      })
    )
  );
  return results;
}

module.exports = { createMulterUpload, uploadBufferToCloudinary, uploadFilesToCloudinary };
