import chalk from "chalk"
import { UI } from "../../lib/logger.js"

export function GET_STARTED() {
    UI.info('\nYou can now use Silk with the following commands:\n')
    UI.info(chalk.cyan('  silk do "create a hello world program"'))
    UI.info(chalk.cyan('  silk chat'))
}