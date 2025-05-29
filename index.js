const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const crypto = require('crypto');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let keysData = {};
const keysFile = 'keys.json';

function loadKeys() {
    if (fs.existsSync(keysFile)) {
        const data = fs.readFileSync(keysFile);
        keysData = JSON.parse(data);
    }
}

function saveKeys() {
    fs.writeFileSync(keysFile, JSON.stringify(keysData, null, 4));
}

client.login('bot token here');

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    loadKeys(); 
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content.startsWith('!createkey')) {
        const args = message.content.split(' ');
        if (args.length !== 2) {
            return message.reply('Please provide your HWID, e.g., `!createkey 200670655405245`');
        }

        const hwid = args[1];
        const currentDate = new Date().toISOString().split('T')[0]; 

        if (keysData[hwid]) {
            if (keysData[hwid].date === currentDate) {
                return message.reply('You have already generated a key today!');
            }
        }

        const hash = crypto.createHash('sha512');
        hash.update(hwid);
        const hashedBuffer = hash.digest();
        let hexKey = hashedBuffer.toString('hex');

        if (hexKey.length < 512) {
            const additionalHash = crypto.createHash('sha512').update(hexKey).digest('hex');
            hexKey = hexKey + additionalHash;
        }
        hexKey = "key-" + hexKey.substring(0, 512);

        keysData[hwid] = { key: hexKey, date: currentDate };
        saveKeys();

        message.reply(`Your new key is: ${hexKey}`);
    }
});