import chalk from 'chalk';
import readline from 'readline';
import { Task } from '../lib/task.js';
import { Logger } from '../lib/logger.js';
import { CliRenderer } from '../lib/renderers/cli.js';

export async function chatCommand(options) {
  const logger = new Logger({ verbose: options.verbose });
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const renderer = new CliRenderer({ 
    raw: options.raw,
    showStats: false 
  });
  
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
        
        const task = new Task({
          prompt: input,
          system: options.system
        });

        renderer.attach(task.toolProcessor);
        
        await task.execute(options);
        process.stdout.write('\n\n');
      } catch (error) {
        logger.error(error.message);
      }
      
      askQuestion();
    });
  };

  askQuestion();
}
