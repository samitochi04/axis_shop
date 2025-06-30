const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS for local dev
app.use(cors());

// Serve static files (for HTML)
app.use(express.static(path.join(__dirname, '../'))); // Serve parent folder (where your HTML is)

// Multer for file uploads
const upload = multer({ 
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    storage: multer.memoryStorage()
});

// API endpoint (renamed and updated for separation)
app.post('/api/registration', upload.single('contractFile'), async (req, res) => {
    try {
        const {
            vendorName, shopName, phone, email, socialLinks,
            location, sector, acceptCommission, acceptContract
        } = req.body;

        // Compose email
        let html = `
            <h2>Nouvelle inscription vendeur AXIS Shop</h2>
            <ul>
                <li><b>Nom du vendeur:</b> ${vendorName}</li>
                <li><b>Nom de la boutique:</b> ${shopName}</li>
                <li><b>Email:</b> ${email}</li>
                <li><b>Téléphone:</b> ${phone}</li>
                <li><b>Réseaux sociaux/boutique:</b> ${socialLinks || '-'}</li>
                <li><b>Localisation:</b> ${location}</li>
                <li><b>Secteur:</b> ${sector}</li>
                <li><b>Commission acceptée:</b> ${acceptCommission ? 'Oui' : 'Non'}</li>
                <li><b>Contrat accepté:</b> ${acceptContract ? 'Oui' : 'Non'}</li>
            </ul>
        `;

        // Setup nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Prepare attachments if file
        let attachments = [];
        if (req.file) {
            attachments.push({
                filename: req.file.originalname,
                content: req.file.buffer
            });
        }

        // Send email to the requested address
        await transporter.sendMail({
            from: `"AXIS Shop" <${process.env.SMTP_USER}>`,
            to: 'axis.company.org@gmail.com',
            subject: 'Nouvelle inscription vendeur AXIS Shop',
            html,
            attachments
        });

        res.json({ success: true, message: 'Inscription envoyée avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
