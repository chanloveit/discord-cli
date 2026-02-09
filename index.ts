import 'dotenv/config';
import { Client, GatewayIntentBits, Events, ChannelType, TextChannel } from 'discord.js';
import { commands } from './command.js';
import * as readline from 'readline';

const client: Client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	]
});


const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: '',
	terminal: false
});

let currentChannel: TextChannel | null = null;
let currentInput = '';

client.once(Events.ClientReady, (readyClient) => {
	console.log(`✓ Logged in as ${readyClient.user?.tag}\n`);
	commands();
})

client.on('messageCreate', (message) => {
  if (currentChannel && message.channel.id === currentChannel.id){
    console.log(`[${message.author.username}]: ${message.content}`);
  }
});

rl.on('line', async (input: string) => {
	const trimmed = input.trim();
	const [command, ...args] = trimmed.split(' ');

	if(!trimmed){
		return;
	}
	
	if(trimmed.startsWith('/')){
		if(command == '/servers'){
			console.log(`\n${client.guilds.cache.size} Servers.`);
			
			client.guilds.cache.forEach(guild => {
				console.log(`${guild.name} (ID: ${guild.id})`);
			});
		}
	
		else if(command == '/channels'){
			if(!args[0]){
				console.log('Usage: /channels <Server ID>');
				return;
			}
	
			const guild = client.guilds.cache.get(args[0]);
			if(!guild){
				console.log('Server not found');
				return;
			}
			
			const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText);
			console.log(`\n${textChannels.size} text channels in ${guild.name}\n`);
			
			textChannels.forEach(channel => {
				console.log(`#${channel.name} (ID: ${channel.id})\n`);
			});
		}
	
		else if(command == '/join'){
			if(!args[0]){
				console.log('Usage: /join <Channel ID>');
				return;
			}
	
			const channel = client.channels.cache.get(args[0]);
			
			if(!(channel && channel.type === ChannelType.GuildText)){
				console.log('Channel not found.');
				return;
			}
	
			currentChannel = channel;
			console.log(`✓ Joined #${channel.name}`);
			
			const messages = await channel.messages.fetch({ limit: 10 });
	          console.log('\nRecent messages:');
	          messages.reverse().forEach(message => {
	            console.log(`[${message.author.username}]: ${message.content}`);
	          });
		}
	
		else if(command == '/leave'){
			if(!currentChannel){
				console.log('Not in a channel');
				return;
			}
	
			console.log(`✓ Left #${currentChannel.name}`);
			currentChannel = null;
		}
	
		else if(command == '/help'){
			console.log('\n');
			commands();
			
		}
			
		else if(command == '/quit'){
			console.log('GoodBye!');
			process.exit(0);
		}

		else {
			console.log('Unknown command. Type /help for list of commands.');
		}
	}

	else{
		if(currentChannel){
			try{
				process.stdout.write('\u001b[1A\u001b[2K');
				await currentChannel.send(trimmed);
			}

			catch(error){
				console.log('Error');
			}
		}

		else{
			console.log('Join a channel first to chat');
		}
	}
});

client.login(process.env.DISCORD_TOKEN);