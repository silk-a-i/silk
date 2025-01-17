import { spawn } from 'child_process'

export async function cliHook({ trimmedInput }) {
    const command = trimmedInput.substring(1)
    console.log(`Executing command: ${command}`)
    try {
        execStream(command)
    } catch (error) {
        console.error(`Error executing command: ${error.message}`)
    }
    return
}

function execStream(command) {
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = command.split(' ')
        const child = spawn(cmd, args, { shell: true })

        child.stdout.on('data', (data) => {
            process.stdout.write(data)
        })

        child.stderr.on('data', (data) => {
            process.stderr.write(data)
        })

        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed with exit code ${code}`))
                return
            }
            resolve()
        })

        child.on('error', (error) => {
            reject(error)
        })
    })
}
