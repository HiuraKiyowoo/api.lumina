const axios = require('axios');

module.exports = {
    name: "AnimeNSFW",
    desc: "Generate Anime NSFW Image",
    category: "Image",
    params: ["prompt", "ratio"],

    async run(req, res) {
        const prompt = req.query.prompt;
        const ratio = req.query.ratio || "1:1"; // Default ke 1:1 kalau tidak diisi

        if (!prompt) {
            return res.status(400).json({
                status: false,
                error: "Masukkan parameter prompt!"
            });
        }

        try {
            const response = await axios.get('https://api.nekolabs.web.id/image.gen/wai-anime-nsfw', {
                params: { prompt, ratio },
                timeout: 120000 // Menunggu sampai 2 menit
            });

            // Langsung kirim hasil dari API NekoLabs ke user
            res.status(200).json(response.data);

        } catch (error) {
            res.status(500).json({
                status: false,
                error: "Terjadi kesalahan pada server API atau Timeout.",
                message: error.message
            });
        }
    }
};
