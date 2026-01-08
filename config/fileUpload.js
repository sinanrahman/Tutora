const cloudinary = require('./cloudinary')

const fileUploadToCloudinary = async (file) => {
    try {
        if (!file) throw new Error("No file provided for upload")

        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "TUTORA"
        })

        console.log("Upload result:", result)
        return { url: result.secure_url, public_id: result.public_id }
    } catch (error) {
        console.error("Image upload failed!", error)
        throw error
    }
};

module.exports = fileUploadToCloudinary
