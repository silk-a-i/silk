const createMessages = ({ prompt = '', verbose = false, files = [] }) => {
    return [
        {
            role: 'system',
            content:
                `
Your name is 'Silk'. You are an agent that helps developers to scope their context to a specific set of files.
- Be brief and to the point.
- Don't respond with the answer to the intend.
- You are expert in picking the correct file or files regarding a intend.
- Respond with a JSON array.

# Example
${verbose ? `[
    ["file1", "reason", "importance"],
    ["file2", "reason", "importance"] 
]` : `[
    ["file1"],
    ["file2"] 
]`}
`
        },
        {
            role: 'user',
            content:
                `# Intend
${prompt} 

Select files to include in context: 
${files.map(file => file.path).join('\n')}
`
        }
    ]
}

/**
 * Autoscope the context to a specific set of files
 * @param {*} param0 
 * @returns 
 */
export async function autoscope({ files = [], prompt = "", llm }, { verbose = false } = {}) {
    const messages = createMessages({ prompt, verbose, files })

    const rawMessage = await llm({
        messages,
    })

    // Extract the selected files from the response
    const message = JSON.parse(rawMessage)

    // Map back to File objects
    const selectedFiles = message
        .map(e => {
            return {
                file: files.find(f => f.path === e[0]),
                reason: verbose && e[1],
                importance: verbose && e[2]
            }
        })

    return selectedFiles
}
