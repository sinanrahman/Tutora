const cloudinary = require('cloudinary').v2

const fileUploadToCloudinary = async (file) => {
  try {
    const image = await cloudinary.uploader.upload(
      file.tempFilePath,
      { folder: "teachers" }
    )

    return {
      url: image.secure_url,
      public_id: image.public_id
    }
  } catch (error) {
    console.log("image upload failed!!!!!")
    console.log(error)
    throw error
  }
}

module.exports = fileUploadToCloudinary
