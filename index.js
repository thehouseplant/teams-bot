const restify = require('restify');
const path = require('path');

// Load local environment variables
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Import required bot services
const {
  CloudAdapter,
  ConversationState,
  MemoryStorage,
  UserState,
  ConfigurationBotFrameworkAuthentication
} = require('botbuilder');

// Create the bot adapter
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(process.env);
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch adapter errors
adapter.onTurnError = async (context, error) => {
  // Write errors to console log
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity for the Bot Emulator
  await context.sendTraceActivity(
    'OnTurnError Trace',
    `${ error }`,
    'https://www.botframework.com/schemas/error',
    'TurnError'
  );

  // Send a message to the user
  await context.sendActivity('The bot encountered an error or bug.');
  await context.sendActivity('To continue to run this bot, please fix the bot source code.');

  // Clear out the state
  await conversationState.delete(context);
}

// Define the state store for the bot
const memoryStorage = new MemoryStorage();

// Create a conversation state with your storage
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create the main dialog
const dialog = new UserProfileDialog(userState);
const bot = new DialogBot(conversationState, userState, dialog);

// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.PORT || 3978, () => {
  console.log(`\n${server.name} listening to ${server.url}.`);
  console.log(`\nTo talk to your bot, open the emulator select "Open Bot"`);
});

// Listen for incoming requests
server.post('/api/messages', async (req, res) => {
  // Route a received request to the adapter for processing
  await adapter.process(req, res, (context) => {
    bot.run(context);
  });
});
