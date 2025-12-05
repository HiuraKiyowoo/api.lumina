const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  name: "GoogleImageSearch",
  desc: "Scrape simple image URLs from Google Images (HTML only, no JS)",
  category: "Scraper",
  params: ["query", "max", "safe"],

  async run(req, res) {
    try {
      const { query, max, safe } = req.query;

      if (!query) {
        return res.status(400).json({
          status: false,
          error: 'Parameter "query" wajib diisi',
        });
      }

      // batas aman default
      const MAX = Math.min(parseInt(max || "20", 10) || 20, 100);

      // safe: "on" | "off" (default on)
      const safeSearch = safe === "off" ? "off" : "active";

      const response = await axios.get("https://www.google.com/search", {
        params: {
          tbm: "isch",
          q: query,
          safe: safeSearch,
        },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      const $ = cheerio.load(response.data);
      const s = new Set();

      $("img").each((_, e) => {
        const src = $(e).attr("src");
        if (src && src.startsWith("http")) {
          s.add(src);
        }
      });

      const imgs = [...s].slice(0, MAX);

      return res.status(200).json({
        status: true,
        statusCode: response.status,
        query,
        count: imgs.length,
        safeSearch: safeSearch !== "off",
        images: imgs,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        statusCode: 500,
        error: err.message || String(err),
      });
    }
  },
};
