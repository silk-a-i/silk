import inquirer from 'inquirer'

async function useInquirerTool(res = {}) {
  try {
    const questions = JSON.parse(res.content)
    const answers = await inquirer.prompt(questions)
    return { questions, answers }
  } catch (error) {
    console.error('Error parsing questions:', error.message)
  }
  return {}
}

export function inquirerPlugin(settings = {}) {
  const tool = {
    name: 'inquirer',
    setup(ctx, tools) {
      ctx.on("finish", async (res, tools) => {
        tools.queue.push(async (ctx) => {
          const { questions, answers } = await useInquirerTool(res)

          // Push answers to the chat history
          const { state } = ctx;
          const answer = answers && answers[questions.name]
          state.history.push({
            role: 'user',
            content: `${questions.message} ${answer}`
          });
          // @issue user now still needs to press enter to submit
        })
      })
    }
  }

  settings.tools.push(tool)
}
