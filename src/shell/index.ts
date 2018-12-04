import commands from './commands'
import color, { hex } from './color'

const SHELL = `${hex('cbourne', '#00a9d4')}`

const availableCommands = Object.keys(commands)

interface FileDescriptorRegistry {
  stdout: Function
  stdin: Function
  stderr: Function
}

let fileDescriptorRegistry: FileDescriptorRegistry = {
  stdout: () => {},
  stdin: () => {},
  stderr: () => {}
}

type FileDescriptorName = keyof FileDescriptorRegistry

let location = '~'
let commandBuffer = ''

console.log(commands)

const isCommand = (command: string) => availableCommands.indexOf(command) !== -1

const clearCommandBuffer = () => {
  commandBuffer = ''
}

enum Operators {
  AND = '&&',
  OR = '||'
}

interface SyntaxTreeNode {
  command: string
  args: Array<string>
  and: SyntaxTreeNode | null
  or: SyntaxTreeNode | null
}

const generateSyntaxTree = (
  command: Array<string>,
  node: SyntaxTreeNode = {
    command: '',
    args: [],
    and: null,
    or: null
  }
): SyntaxTreeNode => {
  const currentCommand = command.shift()

  if (!currentCommand) return node

  if (isCommand(currentCommand) && !node.command)
    return generateSyntaxTree(command, { ...node, command: currentCommand })
  else if (Object.values(Operators).includes(currentCommand))
    return generateSyntaxTree(
      {
        ...node,
        and: generateSyntaxTree(command, {} as SyntaxTreeNode)
      },
      command
    )
  else
    return generateSyntaxTree(command, {
      ...node,
      args: [...node.args, currentCommand]
    })
}

const executeCommandBuffer = () => {
  const syntaxTree = generateSyntaxTree(commandBuffer.split(' '))
  console.log(syntaxTree)

  clearCommandBuffer()
  fileDescriptorRegistry.stdout('\n')
  fileDescriptorRegistry.stdout(`${SHELL} ${location} $ `)
}

const registerHandle = (
  fileDescriptorName: FileDescriptorName,
  stream: Function
) => {
  fileDescriptorRegistry[fileDescriptorName] = stream
}

const init = () => {
  fileDescriptorRegistry.stdout(`${SHELL} ~ $ `)
  setupStdin()
  // TODO require Progress from clui and test stdout setter (see terminal.js for binds)
  // const progressBar = new Progress(20)
}

const setupStdin = () => {
  fileDescriptorRegistry.stdin.on('key', key => {
    if (key.charCodeAt(0) == 13) executeCommandBuffer()
    else {
      commandBuffer += key
      fileDescriptorRegistry.stdout(key)
    }
  })
}

export { registerHandle, init }
