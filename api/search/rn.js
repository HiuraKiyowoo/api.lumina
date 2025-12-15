const axios = require('axios')

module.exports = {
  name: "RednoteDownloader",
  desc: "Extract direct MP4 from Rednote / Xiaohongshu",
  category: "Downloader",
  params: ["url"],

  async run(req, res) {
    const url = req.query.url
    if (!url) {
      return res.json({
        status: false,
        error: "url is required"
      })
    }

    try {
      const { data: html } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10)',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      })

      // ambil JSON dari script
      const match = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/s)
      if (!match) {
        return res.json({
          status: false,
          error: "Failed to extract data"
        })
      }

      const json = JSON.parse(match[1])

      // cari video url
      const note =
        Object.values(json.note?.noteDetailMap || {})[0]

      const video =
        note?.note?.video?.media?.stream?.h264 ||
        note?.note?.video?.media?.stream?.h265

      if (!video) {
        return res.json({
          status: false,
          error: "Video not found"
        })
      }

      const urls = Object.values(video)
        .map(v => v?.masterUrl)
        .filter(Boolean)

      res.json({
        status: true,
        title: note.note.title,
        author: note.note.user.nickname,
        video: urls[0],
        all_quality: urls
      })

    } catch (e) {
      res.json({
        status: false,
        error: e.message
      })
    }
  }
}
