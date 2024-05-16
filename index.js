var express = require("express"); //import express ด้วยการใช้ require
var app = express(); //set express ไว้เป็นตัวแปร app
const multer = require('multer');
const port = 3001; //set ตัวแปร port เท่ากับ 3000
const cors = require('cors'); // import cors module
const fs = require('fs');

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(__dirname + '/uploads'));

//ใช้ get เพื่อเรียกไฟล์ index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/document.html')
})

app.post('/upload/document/QF-ITC-0001', (req, res) => {
    const storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, __dirname + '/uploads/documents/QF-ITC-0001') // folder ที่เราต้องการเก็บไฟล์
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname) //ให้ใช้ชื่อไฟล์ original เป็นชื่อหลังอัพโหลด
        },
    })

    const upload = multer({ storage })
    upload.single('document')(req, res, function (err) {
        if (err) {
            // หากเกิดข้อผิดพลาดในการอัพโหลด
            return res.status(500).send(err);
        }
        // เมื่ออัพโหลดสำเร็จ สร้าง URL ของไฟล์ภาพ
        const document = `${req.protocol}://${req.get('host')}/uploads/documents/QF-ITC-0001/${req.file.originalname}`;

        // ส่ง URL ของไฟล์ภาพกลับไปยังเว็บไซต์ผ่าน API
        res.json({ document: document });
    });
})


//ใช้ post เพื่อรองรับการ upload
app.post('/upload/userProfile', (req, res) => {
    const storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, __dirname + '/uploads/userProfiles') // folder ที่เราต้องการเก็บไฟล์
        },
        filename: function (req, file, callback) {
            // ตรวจสอบชนิดของไฟล์ก่อนที่จะบันทึก
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                // ถ้าไฟล์ไม่ได้เป็นภาพ ก็สร้าง error และไม่บันทึกไฟล์
                return callback(new Error('Only image files are allowed!'), false);
            }

            const username = req.body.username; // ดึงค่า username จากข้อมูลที่ส่งมา
            const originalName = file.originalname; // ชื่อเดิมของไฟล์
            const fileExtension = originalName.split('.').pop(); // นามสกุลของไฟล์

            // สร้างชื่อไฟล์ใหม่โดยใช้ username และนามสกุลของไฟล์
            const newFileName = `${username}.${fileExtension}`;

            // ส่งชื่อไฟล์ใหม่กลับไปให้ multer ดำเนินการบันทึกไฟล์
            callback(null, newFileName);
        },
    })

    const upload = multer({ storage })
    upload.single('image')(req, res, function (err) {
        if (err) {
            // หากเกิดข้อผิดพลาดในการอัพโหลด
            return res.status(500).send(err);
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/userProfiles/${req.file.filename}`;

        // ส่ง URL ของไฟล์ภาพกลับไปยังเว็บไซต์ผ่าน API
        res.json({ imageUrl: imageUrl });
    });
})

app.delete('/delete/userProfile', (req, res) => {
    const image = req.body.image; // เก็บ URL ของรูปภาพที่จะลบ

    // ตรวจสอบว่า URL ถูกส่งมาหรือไม่
    if (!image) {
        return res.status(400).send("Missing image URL");
    }

    // ดึงชื่อไฟล์จาก URL ด้วยการแยกส่วนที่มีชื่อไฟล์ตั้งแต่ /uploads/userProfiles/ ไปจนถึงสิ้นสุด
    const fileName = image.split('/').pop();

    // เส้นทางไฟล์ที่ต้องการลบ
    const filePath = __dirname + '/uploads/userProfiles/' + fileName;

    // ลบไฟล์โดยใช้ fs.unlink
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Failed to delete image");
        }

        res.status(200).send("Image deleted successfully");
    });
});



// ใช้ listen เพื่อระบุว่า website จะทำงานที่ port อะไร เราใช้ให้เรียกตัวแปร port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})