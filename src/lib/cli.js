import { COLORS } from "./colors.js"
import { formatBytes } from "./renderers/utils.js"
import { LLMStats } from "./stats.js"

/**
 * 
 * @param {*} param0 
 * @returns 
 */
export function allDone({ stats = new LLMStats, messages }) {
    const promptBytes = stats.promptBytes || messages && JSON.stringify(messages).length || '?'
    const usage = `(${formatBytes(promptBytes)} / ${formatBytes(stats.totalBytes)})`
    return `\nDone in ${stats.elapsedTime}s. ${COLORS.note(usage)}`
}