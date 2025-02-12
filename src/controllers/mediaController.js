const ImageKit = require('imagekit')


const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });


  const tournamentImage = async(req,res)=>{
    try{

        if(!req.file){
            return res.status(400).json({
                error:"no file recieved"
            })
        }

        const fileBase64 = req.file.buffer.toString("base64");

        const result = await imagekit.upload({
          file: fileBase64, 
          fileName: req.file.originalname,
          folder: "uploads", 
        });
    
        res.json({ url: result.url });

    }catch(error){
        console.log(error)
        res.status(500).json({ error: "Upload failed" });
    }
  }

  module.exports = {
    tournamentImage
  }