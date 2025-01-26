import { COLORS } from "./colors.js"
import { formatBytes } from "./renderers/utils.js"
import { LLMStats } from "./stats.js"

export function allDone({ stats = new LLMStats, messages }) {
    const sendBytes = JSON.stringify(messages).length
    const usage = `(${formatBytes(sendBytes)} / ${formatBytes(stats.totalBytes)})`
    return `\nDone in ${stats.elapsedTime}s. ${COLORS.note(usage)}`
}