export const ACTION_TAG = 'silk.action';

/**
 * 
 * @param {*} tool 
 * @param {*} content 
 * @returns 
 */
export function action(tool = "", content = "") {
    const _content = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    return `<${ACTION_TAG} tool="${tool}">\n${_content}\n</${ACTION_TAG}>`
}

export const SYSTEM = `
You are 'Silk' a helpful AI assistant that helps with coding tasks. 
> IMPORTANT Be brief in your requests.
> IMPORTANT Respond to regular questions with a short answer in plain text.
> IMPORTANT use the tools provided to help you with your tasks.
`;