import { COLORS } from "./colors.js"
import { formatBytes } from "./renderers/utils.js"

export function allDone({ renderer, messages }) {
    const sendBytes = JSON.stringify(messages).length
    const usage = `(${formatBytes(sendBytes)} / ${formatBytes(renderer.stats.totalBytes)})`
    return `\nDone in ${renderer.elapsedTime}s. ${COLORS.note(usage)}`
}