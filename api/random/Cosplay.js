const axios = require('axios');

module.exports = {
    name: 'Cosplay',
    desc: 'Random cosplay image',
    category: 'Random',
    async run(req, res) {
        try {
            // Dapatkan URL gambar dari API
            const { data: imageUrl } = await axios.get('https://api.nekolabs.web.id/random/cosplay');
            
            // Fetch gambar sebagai buffer
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data);
            
            // Serve gambar langsung
            res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Length': imageBuffer.length,
            });
            res.end(imageBuffer);
            
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    }
};
