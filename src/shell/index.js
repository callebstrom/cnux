import commands from './commands'
import color, { hex } from './color'

const SHELL = `${hex('cbourne', '#00a9d4')}`

const availableCommands = Object.keys(commands)

let handles = {
  stdout: null,
  stdin: null
}

let location = '~'
let commandBuffer = ''

console.log(commands)

const isCommand = command => availableCommands.indexOf(command) !== -1

const clearCommandBuffer = () => {
  commandBuffer = ''
}

const generateSyntaxTree = () => {
  const syntaxTree = commandBuffer.split(' ').reduce((previous, current) => {
    isCommand(current) // TODO take care of AND and OR as we can't know for sure if arg is a new command or an arg right now
      ? previous.push({
          command: current,
          args: [],
          and: null,
          or: null
        })
      : previous[previous.length - 1].args.push(current)
    return previous
  }, [])
  console.log(syntaxTree)
  // TODO parse syntaxTree and execute the commands

  /*command.cd(syntaxTree.cd.args, updatedLocation => {
    location = updatedLocation
  })*/
}

const executeCommandBuffer = () => {
  const syntaxTree = generateSyntaxTree()

  clearCommandBuffer()
  handles.stdout('\n')
  handles.stdout(`${SHELL} ${location} $ `)
}

const registerHandle = (handleName, handle) => {
  handles[handleName] = handle
}

const init = () => {
  handles.stdout(`${SHELL} ~ $ `)
  setupStdin()
  // TODO require Progress from clui and test stdout setter (see terminal.js for binds)
  // const progressBar = new Progress(20)
}

const setupStdin = () => {
  handles.stdin.on('key', key => {
    if (key.charCodeAt(0) == 13) executeCommandBuffer()
    else {
      commandBuffer += key
      handles.stdout(key)
    }
  })
}

export { registerHandle, init }
