var express = require("express"); //import express ด้วยการใช้ require
var app = express(); //set express ไว้เป็นตัวแปร app
const multer = require('multer');
const port = 3001; //set ตัวแปร port เท่ากับ 3000
const cors = require('cors'); // import cors module

app.use(cors());
app.use('/uploads', express.static(__dirname + '/uploads'));

//ใช้ get เพื่อเรียกไฟล์ index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

//ใช้ post เพื่อรองรับการ upload
app.post('/upload', (req, res) => {
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

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // ส่ง URL ของไฟล์ภาพกลับไปยังเว็บไซต์ผ่าน API
        res.json({ imageUrl: imageUrl });
    });
})

// ใช้ listen เพื่อระบุว่า website จะทำงานที่ port อะไร เราใช้ให้เรียกตัวแปร port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})