const { ActivityHandler } = require('botbuilder');

class DialogBot extends ActivityHandler {
  constructor(conversationState, userState, dialog) {
    if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
    if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
    if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

    this.conversationState = conversationState;
    this.userState = userState;
    this.dialog = dialog;
    this.dialogState = this.conversationState.createProperty('DialogState');

    this.onMessage(async (context, next) => {
      console.log(`Running dialog with Message Activity.`);

      // Run the dialog with the new message Activity
      await this.dialog.run(context, this.dialogState);

      await next();
    });
  }

  // Override the ActivityHandler.run() method to save stat changes after bot logic completes
  async run(context) {
    await super.run(context);

    // Save state changes
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }
}

module.exports.DialogBot = DialogBot;
