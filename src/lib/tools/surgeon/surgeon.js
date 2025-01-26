import { Tool } from '../../Tool.js'
import * as fs from 'node:fs'
import { file } from '../../File.js'

export const NAME = 'surgeon'

/**
 * Represents a tool for editing files by inserting or replacing text at specific locations.
 * @class
 */
export const surgeon = new Tool({
    version: '0.0.0beta',
    name: NAME,
    description: 'Paste a piece of text into a file at a specific location',
    examples: `
/**
 * Gets the start and end indices in the source string based on line and column positions.
 * @param {string} source - The original source string.
 * @param {string} start - The start position in line:column format. First line and column are 1:1.
 * @param {string} [end] - The end position in line:column format. First line and column are 1:1.
 */

> IMPORTANT never return the expected result
> IMPORTANT order of start should be descending

# Examples

## Example 1

${file("index.html",`<html>
<head>
    <title>My Awesome Projecte</title>
</head>
<body>
    <header>
        <h1>Welcome to the Project</h1>
    </header>
    <main>
        <p>Content coming soon...</p>
    </main>
    <footer>
        <p>&copy; 2023 Project Name</p>
    </footer>
</body>
</html>`)}

<silk.action tool="${NAME}" path="index.html" start="3:12" end="3:31" startcheck="M" hint="change title">Hello World</silk.action>
<silk.action tool="${NAME}" path="index.html" start="6:5" end="8:14" startcheck="<" hint="remove header"></silk.action>
<silk.action tool="${NAME}" path="index.html" start="12:5" end="14:14" startcheck="<" hint="remove footer"></silk.action>
`,
    onFinish(ctx, tools) {
        // Create a map to group edits by file path
        if (!tools.surgeonEdits) {
            tools.surgeonEdits = new Map();
        }

        // Add this edit to the map
        if (!tools.surgeonEdits.has(ctx.path)) {
            tools.surgeonEdits.set(ctx.path, []);
        }
        tools.surgeonEdits.get(ctx.path).push(ctx);

        tools.queue.push(async (ctx) => {
            // Apply all edits for each file, sorted in descending order to prevent index shifting
            for (const [filePath, edits] of tools.surgeonEdits.entries()) {
                // Sort edits in descending order of start position
                const sortedEdits = edits.sort(sortReplacementsDesc);

                // Apply edits in order
                let fileContent = fs.readFileSync(filePath, 'utf8');
                fileContent = applyReplacements(fileContent, sortedEdits);

                // Write final content
                fs.writeFileSync(filePath, fileContent);
            }

            // Clear the edits after applying
            tools.surgeonEdits.clear();
        });
    }
})

/**
 * Sorts replacements in descending order based on their start position.
 * @param {Object} a - The first replacement object.
 * @param {Object} b - The second replacement object.
 * @returns {number} - The comparison result.
 */
function sortReplacementsDesc(a, b) {
    const startA = Number(a.start.replace(':', '.'))
    const startB = Number(b.start.replace(':', '.'))
    return startB - startA
}

/**
 * Applies a series of replacements to the source string.
 * @param {string} source - The original source string.
 * @param {Array} replacements - The array of replacement objects.
 * @returns {string} - The updated source string.
 */
function applyReplacements(source, replacements) {
    if (replacements.length === 0) {
        return source;
    }
    const [{ start, end, content }, ...rest] = replacements;
    const updatedSource = insertAtLineColumn(source, { start, end, content });
    return applyReplacements(updatedSource, rest);
}

/**
 * Applies a single replacement to a file.
 * @param {Object} ctx - The context object containing file path and replacement details.
 */
function applyToFile(ctx) {
    const fileContent = fs.readFileSync(ctx.path, 'utf8')
    const { path, start = "0:0", end, content } = ctx

    const resp = insertAtLineColumn(fileContent, { start, end, content })
    fs.writeFileSync(path, resp)
}

/**
 * Installs the surgeon tool into the provided settings.
 * @param {Object} settings - The settings object to install the tool into.
 * @returns {Object} - The updated settings object.
 */
export function installSurgeonAction(settings = {}) {
    settings.tools.push(surgeon)
    return settings
}

/**
 * Parses a line:column string into an object with line and column properties.
 * @param {string} lineColumn - The line:column string to parse.
 * @returns {Object} - An object with line and column properties.
 */
export function parseLineColumn(lineColumn) {
    const [line, column] = lineColumn.split(':').map(Number)
    return { line: line, column: column }
}

/**
 * Inserts content at a specific line and column in the source string.
 * @param {string} source - The original source string.
 * @param {Object} options - The options object containing start, end, and content.
 * @returns {string} - The updated source string.
 */
export function insertAtLineColumn(source = "", { start, end, content }) {
    const { startIndex, endIndex } = getIndex(source, start, end)

    return source.slice(0, startIndex) + content + source.slice(endIndex)
}

/**
 * Gets the start and end indices in the source string based on line and column positions.
 * @param {string} source - The original source string.
 * @param {string} start - The start position in line:column format. First line and column are 1:1.
 * @param {string} [end] - The end position in line:column format. First line and column are 1:1.
 * @returns {Object} - An object with startIndex and endIndex properties.
 */
function getIndex(source, start = "1:1", end) {
    const startPos = parseLineColumn(start)
    const endPos = end ? parseLineColumn(end) : startPos

    const lines = source.split('\n')

    const startIndex = lines.slice(0, startPos.line - 1).reduce((acc, line) => acc + line.length + 1, 0) + startPos.column - 1
    const endIndex = end ? lines.slice(0, endPos.line - 1).reduce((acc, line) => acc + line.length + 1, 0) + endPos.column - 1 : startIndex

    return { startIndex, endIndex }
}

/**
 * Inserts markers at specific line and column positions in the source string.
 * @param {string} source - The original source string.
 * @param {Object} options - The options object containing start, end, and content.
 * @returns {string} - The updated source string with markers.
 */
export function insertMarkerAtLineColumn(source = "", { start, end, content }) {
    const { startIndex, endIndex } = getIndex(source, start, end)

    // Add a marker
    const marker = '|'
    // Inject marker at startIndex
    let newSource = source.slice(0, startIndex) + marker + source.slice(startIndex)
    // Inject marker at endIndex
    newSource = newSource.slice(0, endIndex + 2) + marker + newSource.slice(endIndex + 2)
    return newSource
}
