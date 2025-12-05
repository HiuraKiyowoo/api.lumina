const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  name: "RemoveBGUpload",
  desc: "Remove background menggunakan removebg.one dengan upload file",
  category: "AI-Image",
  params: ["file"],

  async run(req, res) {
    try {
      const file = req.files?.file;

      if (!file) {
        return res.json({
          status: false,
          error: "Parameter 'file' wajib (upload file form-data)",
        });
      }

      // Buat form upload ke removebg.one
      const form = new FormData();
      form.append("file", file.data, {
        filename: file.name || "image.jpg",
        contentType: file.mimetype || "image/jpeg",
      });

      const { data } = await axios.post(
        "https://removebg.one/api/predict/v2",
        form,
        {
          headers: {
            ...form.getHeaders(),
            "user-agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
            accept: "application/json, text/plain, */*",
            "sec-ch-ua": '"Chromium";v="139", "Not;A=Brand";v="99"',
            platform: "PC",
            "sec-ch-ua-platform": '"Android"',
            origin: "https://removebg.one",
            referer: "https://removebg.one/upload",
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      // Cek apakah API memberikan image base64
      const base64 = data?.data?.image_base64;
      if (!base64) {
        return res.json({
          status: false,
          error: "Gagal memproses gambar, response kosong.",
          response: data,
        });
      }

      // Convert base64 → buffer
      const imgBuffer = Buffer.from(base64, "base64");

      // Output langsung sebagai PNG
      res.set("Content-Type", "image/png");
      return res.send(imgBuffer);

    } catch (err) {
      return res.json({
        status: false,
        error: err.response?.data || err.message,
      });
    }
  },
};
