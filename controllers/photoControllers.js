const Photo = require('../models/photo');
const fs= require('fs');


exports.getAllPhotos = async (req, res) => {

  const page = req.query.page || 1; 
  const photosPerPage = 2;  

  const totalPhotos = await Photo.find().countDocuments();

  const photos = await Photo.find({})
  .sort('-dateCreated')
  .skip((page-1)*photosPerPage)
  .limit(photosPerPage)

  res.render('index', {
    photos : photos,
    current: page,
    pages: Math.ceil(totalPhotos/photosPerPage)
  });

};

exports.getPhoto = async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  res.render('photo', {
    photo,
  });
};

exports.createPhoto = async (req, res) => {
   
    const uploadDir = 'public/uploads';
  
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
  
    let uploadedImage = req.files.image;
    let uploadedPath = __dirname + '/../public/uploads/' + uploadedImage.name;
  
    uploadedImage.mv(uploadedPath, async () => {
      await Photo.create({
        ...req.body,
        image: '/uploads/' + uploadedImage.name,
      });
      res.redirect('/');
    });
  }

  exports.updatePhoto = async (req, res) => {
    const photo = await Photo.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      description: req.body.description,
    });
  
    res.redirect(`/photos/${req.params.id}`);
  }

  exports.deletePhoto = async (req, res) => {
    try {
      const photo = await Photo.findOne({ _id: req.params.id });
  
      if (!photo) {
        console.log("Photo bulunamadı:", req.params.id);
        return res.status(404).send("Foto bulunamadı");
      }
  
      let deletedImage = __dirname + '/../public' + photo.image;
      console.log("Silinmeye çalışılan dosya:", deletedImage);
  
      if (fs.existsSync(deletedImage)) {
        fs.unlinkSync(deletedImage);
        console.log("Dosya silindi:", deletedImage);
      } else {
        console.log("Dosya bulunamadı:", deletedImage);
      }
  
      await Photo.findByIdAndDelete(req.params.id);
      console.log("Photo DB'den silindi:", req.params.id);
  
      res.redirect('/');
    } catch (err) {
      console.error("Silme hatası:", err);
      res.status(500).send("Fotoğraf silinirken hata oluştu");
    }
  }