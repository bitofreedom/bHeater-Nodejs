const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const Client = require('ssh2-sftp-client');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// SSH Configuration
const SSH_USERNAME = "root";
const SSH_KEY_PATH = path.join(process.env.HOME, '.ssh', 'id_rsa');

// Named commands
const NAMED_COMMANDS = {
    "start": "/etc/init.d/bosminer start",
    "stop": "/etc/init.d/bosminer stop"
};

// Path to the heaters JSON file
const HEATERS_JSON_PATH = "./heaters.json";

// Function to execute a remote command
async function executeRemoteCommand(host, command) {
    const ssh = new Client();
    try {
        await ssh.connect({
            host: host,
            username: SSH_USERNAME,
            privateKey: fs.readFileSync(SSH_KEY_PATH)
        });

        const result = await ssh.execCommand(command);

        return {
            host: host,
            command: command,
            exit_code: result.code,
            output: result.stdout,
            error: result.stderr
        };
    } catch (error) {
        return {
            host: host,
            command: command,
            exit_code: 1,
            output: '',
            error: error.message
        };
    } finally {
        ssh.end();
    }
}

// Add this route to handle GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Welcome to bHeater-Nodejs!');
});

// API endpoint to execute a command on a remote host
app.post('/execute', async (req, res) => {
    const { host, command } = req.body;

    if (!host || !command) {
        return res.status(400).json({ error: "Missing 'host' or 'command' in request body" });
    }

    if (!NAMED_COMMANDS[command]) {
        return res.status(400).json({ error: `Invalid command. Available commands: ${Object.keys(NAMED_COMMANDS)}` });
    }

    try {
        const result = await executeRemoteCommand(host, NAMED_COMMANDS[command]);
        if (result.error) {
            return res.status(500).json(result);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to list available named commands
app.get('/commands', (req, res) => {
    res.status(200).json({ available_commands: NAMED_COMMANDS });
});

// API endpoint to list available heaters from the JSON file
app.get('/heaters', (req, res) => {
    try {
        const heaters = JSON.parse(fs.readFileSync(HEATERS_JSON_PATH, 'utf8'));
        res.status(200).json(heaters);
    } catch (error) {
        res.status(500).json({ error: "Error reading heaters data" });
    }
});

// API endpoint to set the heater configuration
app.post('/set_heater', async (req, res) => {
    const { heaterName, action } = req.body;

    if (!heaterName || !action) {
        return res.status(400).json({ error: "Missing 'heaterName' or 'action' in request body" });
    }

    try {
        const heaters = JSON.parse(fs.readFileSync(HEATERS_JSON_PATH, 'utf8'));
        const selectedHeater = heaters.find(heater => heater.heaterName === heaterName);

        if (!selectedHeater) {
            return res.status(404).json({ error: `Heater '${heaterName}' not found` });
        }

        const minerType = selectedHeater.type || 'default';
        let localFilePath;

        switch (action) {
            case 'low':
                localFilePath = `bosminerConfig/bosminer-${minerType}-low.toml`;
                break;
            case 'medium':
                localFilePath = `bosminerConfig/bosminer-${minerType}-medium.toml`;
                break;
            case 'high':
                localFilePath = `bosminerConfig/bosminer-${minerType}-high.toml`;
                break;
            default:
                return res.status(400).json({ error: "Invalid action. Valid actions are 'low', 'medium', 'high'" });
        }

        const remoteFilePath = "/etc/bosminer.toml";
        const sftp = new Client();

        await sftp.connect({
            host: selectedHeater.ipAddress,
            username: SSH_USERNAME,
            privateKey: fs.readFileSync(SSH_KEY_PATH)
        });

        await sftp.put(localFilePath, remoteFilePath);
        sftp.end();

        res.status(200).json({ message: `Heater '${heaterName}' configuration updated to '${action}' mode for type '${minerType}'` });
    } catch (error) {
        res.status(500).json({ error: `Failed to update heater configuration: ${error.message}` });
    }
});

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = { app, server };