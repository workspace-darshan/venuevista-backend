const multer = require("multer");
const fs = require("fs");
const sharp = require('sharp');

const multerStorage = (uploadPath) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            console.log("🚀 from multer", file)
            let finalPath = "uploads/";

            if (file.fieldname === "uploadFile") {
                finalPath += `excel/${uploadPath}`;
            } else {
                finalPath += `image/${uploadPath}`;
            }
            fs.mkdirSync(finalPath, { recursive: true });

            cb(null, finalPath);
        },

        filename: (req, file, cb) => {
            const ext = file.originalname.split(".").pop();
            cb(
                null,
                Date.now() +
                "_" +
                Math.random().toString(36).substring(2, 6) +
                "." +
                ext
            );
        },
    });

const fileFilter = (req, file, cb) => {
    const allowedExcelTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
    ];

    const allowedImageTypes = [
        'image/jpeg',  // .jpg, .jpeg
        'image/png',   // .png
        'image/gif',   // .gif
        'image/webp',  // .webp (modern, smaller file sizes)
        'image/tiff',  // .tiff, .tif (high quality)
        'image/bmp',   // .bmp
        'image/svg+xml' // .svg (vector graphics)
    ];

    if (file.fieldname === "uploadFile" && !allowedExcelTypes.includes(file.mimetype)) {
        cb(new Error("Only Excel files are allowed"), false);
    } else if (file.fieldname !== "uploadFile" && !allowedImageTypes.includes(file.mimetype)) {
        cb(new Error("Only image files are allowed"), false);
    } else {
        cb(null, true);
    }
};

const optimizeImages = async (req, res, next) => {
    try {
        if (!req.file && !req.files) {
            return next();
        }

        const files = req.files || [req.file];

        for (const file of files) {
            if (file.fieldname !== "uploadFile" && file.mimetype.startsWith('image/')) {
                const inputPath = file.path;

                const metadata = await sharp(inputPath).metadata();
                const hasTransparency = metadata.hasAlpha;

                let sharpInstance = sharp(inputPath).resize(1200, 800, { fit: 'inside', withoutEnlargement: true });

                if (hasTransparency) {
                    if (file.mimetype === 'image/webp') {
                        sharpInstance = sharpInstance.webp({ quality: 85 });
                    } else {
                        sharpInstance = sharpInstance.png({ quality: 85 });
                    }
                } else {
                    sharpInstance = sharpInstance.jpeg({ quality: 85 });
                }

                await sharpInstance.toFile(inputPath + '_optimized');

                fs.unlinkSync(inputPath);
                fs.renameSync(inputPath + '_optimized', inputPath);
            }
        }

        next();
    } catch (error) {
        console.error('Image optimization error:', error);
        next(error);
    }
};

exports.upload = (uploadPath) => {
    const multerUpload = multer({
        storage: multerStorage(uploadPath),
        fileFilter: fileFilter,
        limits: { fileSize: 10 * 1024 * 1024 },
    });

    return {
        single: (fieldname) => [
            multerUpload.single(fieldname),
            optimizeImages
        ],
        array: (fieldname, maxCount) => [
            multerUpload.array(fieldname, maxCount),
            optimizeImages
        ],
        fields: (fieldsArray) => [
            multerUpload.fields(fieldsArray),
            optimizeImages
        ],
        any: () => [
            multerUpload.any(),
            optimizeImages
        ]
    };
};