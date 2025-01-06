import inquirer from 'inquirer'

async function useInquirerTool (res = {}) {
  try {
    const questions = JSON.parse(res.content)
    const answers = await inquirer.prompt(questions)
    return { questions, answers }
  } catch (error) {
    console.error('Error parsing questions:', error.message)
  }
  return {}
}

export function inquirerPlugin (settings = {}) {
  return {
    name: 'ask',
    supportedModels: ['silk'],
    setup (ctx, tools) {
      ctx.on('finish', async (res, tools) => {
        // push it to the tools queue
        tools.queue.push(async (ctx) => {
          const { state } = ctx
          const { questions, answers } = await useInquirerTool(res)

          ctx.handlePrompt(answers[questions.name])

          // Push answers to the chat history
          // state.history.push({
          //   role: 'user',
          //   content: answers[questions.name]
          // });
          // @todo And run again
        })
      })
    }
  }
}
