import chalk from 'chalk'
import ora from 'ora'
import { ToolProcessor } from '../ToolProcessor.js'
import { formatBytes } from './utils.js'

class Stats {
  totalBytes = 0
  textBytes = 0
  actions = 0
  startTime = Date.now()
}

export class CliRenderer {
  toolProcessor = new ToolProcessor()
  raw = false
  showStats = false
  spinners = new Map()
  stats = new Stats()

  constructor (options = {}) {
    this.raw = options.raw || false
    this.showStats = options.stats !== false
  }

  reset() {
    this.stats = new Stats()
  }

  attach (toolProcessor) {
    this.toolProcessor = toolProcessor

    toolProcessor.on('text', text => {
      this.stats.textBytes += Buffer.from(text).length
    })

    toolProcessor.on('chunk', text => {
      this.stats.totalBytes += Buffer.from(text).length
    })

    if (this.raw) {
      toolProcessor.on('chunk', text => {
        process.stdout.write(text)
      })

      return this
    }

    toolProcessor.on('chunk', (text, partialLine) => {
      const { currentState } = toolProcessor
      if (partialLine.startsWith('<')) {
        return
      }
      if (currentState.inAction) { return }
      if (currentState.inFileBlock) return

      process.stdout.write(text)
    })

    toolProcessor.on('tool:start', ({ tool, path }) => {
      const spinner = ora({
        text: `${tool.name}: ${chalk.cyan(path || '')}...`,
        color: 'yellow'
      }).start()

      this.spinners.set(path, spinner)
      this.stats.actions++
    })

    toolProcessor.on('tool:progress', (context) => {
      const { tool, args, blockContent } = context
      const { path } = args
      const spinner = this.spinners.get(path)

      if (spinner && tool) {
        const bytes = Buffer.from(blockContent).length
        spinner.text = `${tool.name}: ${chalk.cyan(path || '')}... (${formatBytes(bytes)})`
      }
    })

    toolProcessor.on('tool:finish', (context) => {
      const { tool, args, blockContent } = context
      // @todo use similar api as `tool:progress`
      const { path } = context

      const spinner = this.spinners.get(path)
      if (spinner) {
        spinner.succeed()
        this.spinners.delete(path)
      }
    })

    return this
  }

  cleanup () {
    if (this.raw) {
      return
    }

    for (const spinner of this.spinners.values()) {
      spinner.stop()
    }
    this.spinners.clear()

    // if (!this.raw) {
    //   this.displayStats()
    // }
  }

  get elapsedTime() {
    return ((Date.now() - this.stats.startTime) / 1000).toFixed(1)
  }

  displayStats () {
    console.log(`\nDone in ${this.elapsedTime}s`)
  }
}
