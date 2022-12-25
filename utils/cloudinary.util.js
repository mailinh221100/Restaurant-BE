const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
   secure: true
});

const uploadImage = async (imagePath) => {
    try {
        // upload image to cloudinary
        const result = await cloudinary.uploader.upload(imagePath);
        // delete file on dish
        fs.unlinkSync(imagePath);
        return result;
    } catch (error) {
        console.log(error);
    }
};

module.exports = { uploadImage };