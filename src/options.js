export function addSharedOptions (command) {
  return command
    .option('-o, --output <dir>', 'Output directory for generated files', '')
    .option('-c, --context [glob]', 'File glob pattern to process')
    .option('-i, --include [glob]', 'File glob pattern to process')
    .option('-v, --verbose', 'Show additional information including the used prompt', false)
    .option('-r, --raw', 'Show raw LLM output without formatting', false)
    .option('-d, --dry', 'Run the command without any processing', false)
    .option('--root <dir>', 'Specify root', undefined)
    .option('-s, --stats', 'Show stats', false)
    .option('--config <path>', 'Path to config file')
}
