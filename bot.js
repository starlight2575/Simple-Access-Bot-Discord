<!--
Hey, thanks for using my code bot.  
If you have any enhancements, then fork this project and create a pull request
or just open an issue with the label "enhancement".

Don't forget to give this project a star for additional support ;)

Credit: Starlight2575
-->
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, GuildMemberRoleManager, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});
const config = {
    token: ' ', 
    keyFile: 'keys.txt',
    whitelistFile: 'whitelist.json',
    roleId: ' ',
    ownerId: ' ', 
    serverId: ' ' 
};
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await client.application.commands.create(
        new SlashCommandBuilder()
            .setName('genkey')
            .setDescription('Generate a new key')
    );
    await client.application.commands.create(
        new SlashCommandBuilder()
            .setName('start')
            .setDescription('Start the key entry process')
    );
});
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isModalSubmit()) return; 
    if (interaction.guildId !== config.serverId || interaction.user.id !== config.ownerId) {
        await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        return; 
    }
    const { commandName } = interaction;
    if (commandName === 'genkey') {
        const key = generateKey();
        fs.appendFileSync(config.keyFile, key + '\n');
        await interaction.reply({ content: `Your new key is: **${key}**`, ephemeral: true });
    } else if (commandName === 'start') {
        const embed = new EmbedBuilder()
            .setColor(0x0099FF) 
            .setTitle('🗝️ Key Required for Access') 
            .setDescription('Welcome! To gain access to this server, please enter the provided key. Click the button below to begin.')
            .setThumbnail('https://i.ibb.co/bRHhh1x/Snaptik-app-74051000764539732552.jpg') 
            .setFooter({ text: 'This server is protected by a key system.' }); 
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('enter_key_button')
                    .setLabel('Enter Key')
                    .setStyle(ButtonStyle.Success) 
                    .setEmoji('🔑') 
        );
        await interaction.reply({ embeds: [embed], components: [row] });
    } else if (interaction.isButton()) { 
        if (interaction.customId === 'enter_key_button') {
            const modal = new ModalBuilder()
                .setCustomId('key_input_modal')
                .setTitle('Enter Key');
            const keyInput = new TextInputBuilder()
                .setCustomId('key_input')
                .setLabel('Enter your key:')
                .setStyle(TextInputStyle.Short);
            const firstActionRow = new ActionRowBuilder().addComponents(keyInput);
            modal.addComponents(firstActionRow);
            await interaction.showModal(modal);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'key_input_modal') {
            const enteredKey = interaction.fields.getTextInputValue('key_input');
            fs.readFile(config.keyFile, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading key file:', err);
                    return interaction.reply({ content: 'An error occurred while processing the key.', ephemeral: true });
                }
                const keys = data.split('\n').filter(key => key.trim() !== '');
                if (keys.includes(enteredKey)) {
                    const updatedKeys = keys.filter(key => key !== enteredKey);
                    fs.writeFileSync(config.keyFile, updatedKeys.join('\n'));
                    let whitelist = {};
                    try {
                        const data = fs.readFileSync(config.whitelistFile, 'utf8');
                        whitelist = JSON.parse(data);
                    } catch (err) {
                    }
                    whitelist[interaction.user.id] = true;
                    fs.writeFileSync(config.whitelistFile, JSON.stringify(whitelist));
                    interaction.reply({ content: 'Valid key! You have been added to the whitelist.', ephemeral: true });
                } else {
                    interaction.reply({ content: 'Invalid key. Please try again.', ephemeral: true });
                }
            });
        }
    }
});
setInterval(async () => {
    try {
        let whitelist = {};
        try {
            const data = fs.readFileSync(config.whitelistFile, 'utf8');
            whitelist = JSON.parse(data);
        } catch (err) {
            console.error('Error reading or parsing whitelist file:', err);
            return;
        }
        const guild = client.guilds.cache.get(config.serverId);

        if (!guild) {
            console.error('Bot has not joined the specified server.');
            return;
        }
        const members = await guild.members.fetch();
        for (const memberId in whitelist) {
            const member = members.get(memberId);
            if (member) {
                const role = guild.roles.cache.get(config.roleId);
                if (role && !member.roles.cache.has(config.roleId)) {
                    await member.roles.add(role);
                }
            }
        }
    } catch (err) {
        console.error('Error checking and granting roles:', err);
    }
}, 5000);
function generateKey(prefix = 'STARLIGHT_') {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 7; i++) {
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return prefix + key;
}
client.login(config.token);
<!--
Hey, thanks for using my code bot.  
If you have any enhancements, then fork this project and create a pull request
or just open an issue with the label "enhancement".

Don't forget to give this project a star for additional support ;)

Credit: Starlight2575
-->