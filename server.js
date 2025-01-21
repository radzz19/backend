const express = require('express');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;

const logRequestDetails = (req, res, next) => {
    const logDetails = {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        url: req.originalUrl,
        protocol: req.protocol,
        method: req.method,
        hostname: req.hostname,
        query: req.query,
        headers: req.headers,
        userAgent: req.get('User-Agent'),
    };

    const logLine = JSON.stringify(logDetails) + '\n';
    const logFilePath = path.join(__dirname, 'requests.log');

    fs.stat(logFilePath, (err, stats) => {
        if (!err && stats.size > 1_000_000) {
            const archivePath = path.join(__dirname, `requests-${Date.now()}.log`);
            fs.move(logFilePath, archivePath, (moveErr) => {
                if (moveErr) console.error('Error archiving log file:', moveErr);
            });
        }

        fs.appendFile(logFilePath, logLine, (writeErr) => {
            if (writeErr) console.error('Error writing to log file:', writeErr);
        });
    });

    next();
};

app.use(logRequestDetails);

app.get('/', (req, res) => res.send('Server is running!'));
app.get('/test', (req, res) => res.send('Test endpoint!'));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
