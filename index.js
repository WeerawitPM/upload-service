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
            callback(null, __dirname + '/uploads') // folder ที่เราต้องการเก็บไฟล์
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname) //ให้ใช้ชื่อไฟล์ original เป็นชื่อหลังอัพโหลด
        },
    })

    const upload = multer({ storage })
    upload.single('image')(req, res, function (err) {
        if (err) {
            // หากเกิดข้อผิดพลาดในการอัพโหลด
            return res.status(500).send(err);
        }
        // res.send('File uploaded successfully');
        // res.send(req.file)
        // เมื่ออัพโหลดสำเร็จ สร้าง URL ของไฟล์ภาพ
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.originalname}`;

        // ส่ง URL ของไฟล์ภาพกลับไปยังเว็บไซต์ผ่าน API
        res.json({ imageUrl: imageUrl });
    });
})


// ใช้ listen เพื่อระบุว่า website จะทำงานที่ port อะไร เราใช้ให้เรียกตัวแปร port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})