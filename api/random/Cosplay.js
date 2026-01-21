const axios = require('axios');

module.exports = {
    name: 'Cosplay',
    desc: 'Random cosplay image',
    category: 'Random',
    async run(req, res) {
        try {
            // Dapatkan URL gambar dari API
            const apiResponse = await axios.get('https://api.nekolabs.web.id/random/cosplay', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });
            
            // Validasi response
            let imageUrl = apiResponse.data;
            
            // Jika response adalah object, cari properti URL
            if (typeof imageUrl === 'object') {
                imageUrl = imageUrl.url || imageUrl.imageUrl || imageUrl.result || imageUrl.data;
            }
            
            // Validasi URL
            if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                console.error('Invalid API response:', apiResponse.data);
                return res.status(500).json({ 
                    status: false, 
                    error: 'Invalid URL from API',
                    response: apiResponse.data 
                });
            }
            
            // Fetch gambar sebagai buffer
            const response = await axios.get(imageUrl, { 
                responseType: 'arraybuffer',
                timeout: 15000
            });
            
            const imageBuffer = Buffer.from(response.data);
            
            // Deteksi content type dari response atau URL
            const contentType = response.headers['content-type'] || 
                               (imageUrl.match(/\.(jpg|jpeg)$/i) ? 'image/jpeg' : 
                                imageUrl.match(/\.png$/i) ? 'image/png' : 
                                imageUrl.match(/\.gif$/i) ? 'image/gif' : 'image/jpeg');
            
            // Serve gambar langsung
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': imageBuffer.length,
            });
            res.end(imageBuffer);
            
        } catch (error) {
            console.error('Cosplay API Error:', error.message);
            res.status(500).json({ 
                status: false, 
                statusCode: 500,
                creator: "robin",
                error: error.message 
            });
        }
    }
};
