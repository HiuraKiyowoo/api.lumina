const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const IMAGE_PATH = path.join(__dirname, 'foto.jpg');   // bisa kamu ganti
const TEMP_FILE  = path.join(__dirname, 'result.jpg'); // file hasil sementara

async function createJob(prompt) {
    const form = new FormData();
    form.append('model_name', 'seedream');
    form.append('edit_type', 'style_transfer');
    form.append('prompt', prompt || 'Turn this photo into a Ghibli-style illustration');
    form.append('target_images', fs.createReadStream(IMAGE_PATH));

    const res = await axios.post(
        'https://api.photoeditorai.io/pe/photo-editor/create-job',
        form,
        {
            headers: {
                ...form.getHeaders(),
                'Product-Code': '067003',
                'Product-Serial': 'vj6o8n'
            }
        }
    );
    return res.data.result.job_id;
}

async function getJobStatus(jobId) {
    const res = await axios.get(
        `https://api.photoeditorai.io/pe/photo-editor/get-job/${jobId}`,
        {
            headers: {
                'Product-Code': '067003',
                'Product-Serial': 'vj6o8n'
            }
        }
    );
    return res.data.result;
}

async function downloadFile(url, filePath) {
    const writer = fs.createWriteStream(filePath);
    const response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function uploadToJees2(filePath) {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    const res = await axios.post(
        'https://server-jees2.vercel.app/upload',
        form,
        { headers: form.getHeaders() }
    );
    return res.data;
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

module.exports = {
    name: 'PhotoEditorGhibli',
    desc: 'Transform local foto.jpg using PhotoEditorAI (seedream) and upload result to Jees2',
    category: 'AI-Image',
    params: ['prompt'],

    async run(req, res) {
        try {
            const { prompt } = req.query;

            // 1. Buat job
            const jobId = await createJob(prompt);

            // 2. Polling status
            let result;
            while (true) {
                result = await getJobStatus(jobId);
                // status === 2 -> selesai
                if (result.status === 2 && result.output && result.output.length > 0) break;
                // status === 3 / error bisa kamu handle kalau mau
                await sleep(3000);
            }

            // 3. Download gambar hasil
            await downloadFile(result.output[0], TEMP_FILE);

            // 4. Upload ke Jees2
            const uploadRes = await uploadToJees2(TEMP_FILE);

            return res.status(200).json({
                success: true,
                job_id: jobId,
                url: uploadRes.url,
                size: uploadRes.size,
                prompt: prompt || 'Turn this photo into a Ghibli-style illustration'
            });

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.response?.data || err.message
            });
        }
    }
};
