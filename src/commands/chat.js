import readline from 'readline';
import chalk from 'chalk';
import { executePrompt } from '../lib/llm.js';
import { CliRenderer } from '../lib/renderers/cli.js';
import { Logger } from '../lib/logger.js';

export async function chatCommand(options) {
  const logger = new Logger({ verbose: options.verbose });
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const renderer = new CliRenderer();
  logger.info('Starting interactive chat mode (type "exit" to quit)');
  
  const askQuestion = () => {
    rl.question('> ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }
      
      try {
        logger.prompt(input);
        process.stdout.write(chalk.blue('Response: '));
        
        await executePrompt(
          input, 
          (chunk) => renderer.render(chunk),
          options
        );
        
        renderer.cleanup();
        process.stdout.write('\n\n');
      } catch (error) {
        logger.error(error.message);
      }
      
      askQuestion();
    });
  };

  askQuestion();
}
