import { App, setIcon, MarkdownView, Modal, Notice, Plugin } from 'obsidian';

export default class MyPlugin extends Plugin {

	getRandomLine(text: string): string {
		const lines = text.split('\n').filter(line => line.trim() !== '');
		if (lines.length === 0) {
			return '';
		}
		const randomIndex = Math.floor(Math.random() * lines.length);
		return lines[randomIndex];
	}

	async onload() {

		await this.checkAndCreatePromptsLibrary();

		this.addRibbonIcon('lightbulb', 'Get Journal Prompt', () => {
			new RandomPromptModal(this.app, this).open();
		});

		this.addCommand({
			id: 'open-journal-prompt-modal',
			name: 'Get Journal Prompt',
			callback: () => {
				new RandomPromptModal(this.app, this).open();
			}
		});

	}

	onunload() {

	}

	async checkAndCreatePromptsLibrary() {
		const { vault } = this.app;
		const promptsFileName = 'Journal Prompts Library.md';
		let promptsFile = vault.getAbstractFileByPath(promptsFileName);

		if (!promptsFile) {
			try {
				promptsFile = await vault.create(promptsFileName, this.getDefaultPrompts());
				new Notice('Created Journal Prompts Library');
			} catch (error) {
				console.error('Failed to create Journal Prompts Library', error);
				new Notice('Failed to create Journal Prompts Library');
			}
		}
	}

	getDefaultPrompts(): string {
		return `
Are you taking enough risks in your life? Would you like to change your relationship to risk? If so, how?

At what point in your life have you had the highest self-esteem?

Consider and reflect on what might be your “favorite failure.”

Draw 25 circles on a page (5x5 grid of circles). Now set a timer for 3 minutes and try to turn each one into something unique. Could be a ball, hand cuffs, a logo, or an eye for instance.

Draw a small scribble on the page then use your imagination to turn that scribble into a full drawing.

Find two unrelated objects near you and think of a clever way they might be used together.

How can you reframe one of your biggest regrets in life?

How did you bond with one of the best friends you’ve ever had?

How did your parents or caregivers try to influence or control your behavior when you were growing up?

How do the opinions of others affect you?

How do you feel about asking for help?

How much do your current goals reflect your desires vs someone else’s?

If you could eliminate any one disease or illness from the world, what would you choose and why?

Imagine that you have arrived at a closed door. What does it look like and what’s on the other side?

In what ways are you currently self-sabotaging or holding yourself back?

Invent your own planet. Draw a rough sketch of the planet and its inhabitants. How is it different than Earth?

React to the following quote from Anaïs Nin: “We don't see things as they are, we see them as we are.”

React to the following quote from We All Looked Up by Tommy Wallach: “Do you think it is better to fail at something worthwhile, or to succeed at something meaningless?”

Take a task that you’ve been dreading and break it up into the smallest possible steps.

Talk about a time that you are proud to have told someone “no.”

The world would be a lot better if…

Think about a “what if?” or worst-case scenario and work your way through the problem, identifying your options to get through it if it were to happen.

Think about the last time you cried. If those tears could talk, what would they have said?

What are some small things that other people have done that really make your day?

What are some things that frustrate you? Can you find any values that explain why they bug you so much?

What are some things that you could invest more money in to make life smoother and easier for yourself?

What biases do you need to work on?

What could you do to make your life more meaningful?

What did you learn from your last relationship? If you haven’t had one, what could you learn from a relationship that you’ve observed?

What do you need to give yourself more credit for?

What do you wish you could do more quickly? What do you wish you could do more slowly?

What does “ready” feel like to you? How did you know you were ready for a major step that you have taken in your life?

What happens when you are angry?

What is a boundary that you need to draw in your life?

What is a made-up rule about your life that you are applying to yourself? How has this held you back and how might you change it?

What is a positive habit that you would really like to cultivate? Why and how could you get started?

What is a question that you are really scared to know the answer to?

What is a reminder that you would like to tell yourself next time you are in a downward spiral?

What is a view about the world that has changed for you as you’ve gotten older?

What is holding you back from being more productive at the moment? What can you do about that?

What is something that you grew out of that meant a lot to you at the time?

What is something that you have a hard time being honest about, even to those you trust the most? Why?

What life lessons, advice, or habits have you picked up from fiction books?

What made you feel most alive when you were young?

What part of your work do you most enjoy? What part do you least enjoy? Why?

What pet peeves do you have? Any idea why they drive you so crazy?

What sensations or experience do you tend to avoid in your life? Why?

What was a seemingly inconsequential decision that made a big impact in your life?

What would you do if you could stop time for two months?

When was the last time you had to hold your tongue? What would you have said if you didn't have to?

Which emotions in others do you have a difficult time being around? Why?

Which quotes or pieces of advice do you have committed to memory? Why have those stuck with you?

Which songs have vivid memories for you?

Who has been your greatest teacher?

Who is somebody that you miss? Why?

Who is the most difficult person in your life and why?

Why do you dress the way that you do?

Write a complete story with just six words. For example: Turns out the pain was temporary.

Write a letter to someone you miss dearly.

Write a letter to your own body, thanking it for something amazing it has done.

Write a thank you note to someone. Sending is optional.

Write about a mistake that taught you something about yourself.

Write about an aspect of your personality that you appreciate in other people as well.

Write about something (or someone) that is currently tempting you.

Write about something that you would like to let go of.

Write an apology to yourself for a time you treated yourself poorly. Remember, a good apology should feature an acknowledgment of what happened, how it made the person feel, and how you will do better in the future.

You have been temporarily blinded by a bright light. When your vision clears, what do you see?`;
	}
}


class RandomPromptModal extends Modal {
	plugin: MyPlugin;
	randomPrompt: string;

	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;
	}

	async onOpen() {
		await this.refreshPrompt();
		this.display();
	}

	async refreshPrompt() {
		const { vault } = this.app;
		const promptsFile = vault.getFileByPath('Journal Prompts Library.md');
		if (promptsFile) {
			const prompts = await vault.cachedRead(promptsFile);
			this.randomPrompt = this.plugin.getRandomLine(prompts);
		} else {
			this.randomPrompt = 'Cannot find prompts library';
		}
	}

	display() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Journal Prompt' });

		const promptContainer = contentEl.createDiv('prompt-container');
		const promptEl = promptContainer.createEl('p', { text: this.randomPrompt });

		const buttonContainer = contentEl.createDiv('button-container');

		if (this.randomPrompt === 'Cannot find prompts library') {
			const createLibraryButton = buttonContainer.createEl('button', { text: 'Create Default Library' });
			createLibraryButton.addEventListener('click', async () => {
				await this.plugin.checkAndCreatePromptsLibrary();
				await this.refreshPrompt();
				this.display();
			});
		} else {
			const refreshButton = promptContainer.createEl('button', { cls: 'clickable-icon' });
			setIcon(refreshButton, 'refresh-cw');
			refreshButton.addEventListener('click', async () => {
				await this.refreshPrompt();
				promptEl.setText(this.randomPrompt);
			});

			const copyButton = buttonContainer.createEl('button', { text: 'Copy' });
			copyButton.addEventListener('click', () => {
				const textToCopy = `> [!tip] ${this.randomPrompt}` + `\n\n`;
				navigator.clipboard.writeText(textToCopy).then(() => {
					new Notice('Prompt copied.');
					this.close();
				}).catch(err => {
					console.error('Failed to copy: ', err);
				});
			});

			const insertButton = buttonContainer.createEl('button', { text: 'Insert' });
			insertButton.addEventListener('click', async () => {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					const editor = activeView.editor;
					const cursor = editor.getCursor();
					const textToInsert = `> [!tip] ${this.randomPrompt}` + `\n\n`;
					editor.replaceRange(textToInsert, cursor);
					editor.setCursor({
						line: cursor.line + 2,
						ch: 0
					});
				} else {
					// 创建新笔记
					const timestamp = Date.now();
					const newNoteName = `${new Date().toISOString().split('T')[0]} - ${timestamp}`;
					const newNoteContent = `> [!tip] ${this.randomPrompt}\n\n`;
					const newFile = await this.app.vault.create(`${newNoteName}.md`, newNoteContent);
					
					// 打开新创建的笔记
					await this.app.workspace.getLeaf().openFile(newFile);

					setTimeout(() => {
						const newView = this.app.workspace.getActiveViewOfType(MarkdownView);
						if (newView) {
							const editor = newView.editor;
							const lastLine = editor.lastLine();
							editor.setCursor(lastLine, editor.getLine(lastLine).length);
						}
					}, 100);
				}
				this.close();
			});
		}
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
