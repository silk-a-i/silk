import chalk from 'chalk';
import readline from 'readline';
import path from 'path';
import { Task } from '../lib/task.js';
import { Logger } from '../lib/logger.js';
import { CliRenderer } from '../lib/renderers/cli.js';
import { createBasicTools } from '../lib/tools/basicTools.js';

export async function chatCommand(root, options) {
  const logger = new Logger({ verbose: options.verbose });
  
  // If root is provided, change working directory
  if (root) {
    process.chdir(root);
    options.output = options.output ? path.join(root, options.output) : root;
  }

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
        
        // Create tools with output directory
        const tools = createBasicTools({ output: options.output });
        
        const task = new Task({
          prompt: input,
          system: options.system,
          tools
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
