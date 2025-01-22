import { exec, spawn } from 'child_process'

export default function install(program) {
    program
        .command('shell')
        .alias('/')
        .argument('[command]', 'command')
        .description('Run a shell script (experimental)')
        .action(shell)
}

export const installShellCommand = install

export function shell(command = "") {
    // exec(command, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`exec error: ${error}`)
    //         return
    //     }
    //     console.log(stdout)
    // })
    console.log(`Executing command: ${command}`)
    try {
        execStream(command)
    } catch (error) {
        console.error(`Error executing command: ${error.message}`)
    }
}

export function execStream(command = "") {
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
