const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'hostelmeal/general';
    if (file.fieldname === 'avatar') folder = 'hostelmeal/avatars';
    if (file.fieldname === 'menuPhoto') folder = 'hostelmeal/menus';
    if (file.fieldname === 'kitchenPhoto') folder = 'hostelmeal/kitchens';
    if (file.fieldname === 'license') folder = 'hostelmeal/licenses';
    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
      transformation: [{ width: 1000, crop: 'limit', quality: 'auto' }],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images and videos are allowed'), false);
  },
});

module.exports = { cloudinary, upload };
