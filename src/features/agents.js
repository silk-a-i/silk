
export async function install(program, chatInstance) {
    program
        .command('agents')
        // .argument('[name]', 'name')
        .description('List all available agents')
        .action(() => {
            console.log('in progress')
        })
}
