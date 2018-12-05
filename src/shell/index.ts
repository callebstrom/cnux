import { pipe } from 'rambda'
import * as commands from './commands'
import { hex } from '../utils/color'
import {
  CommandBuffer,
  CommandOutput,
  FileDescriptorName,
  FileDescriptorRegistry,
  InputBuffer,
  Operators,
  SyntaxTreeNode,
  SubscribableFileDescriptor
} from './types'

const SHELL = `${hex('cbourne', '#00a9d4')}`

const availableCommands = Object.keys(commands)

const fileDescriptorRegistry: FileDescriptorRegistry = {
  stdout: () => {},
  stdin: {} as SubscribableFileDescriptor,
  stderr: () => {}
}

let location = '~'
let inputBuffer: InputBuffer = ''

const isCommand = (command: string) => availableCommands.indexOf(command) !== -1

const clearInputBuffer = () => {
  inputBuffer = ''
}

const generateSyntaxTree = (
  commandBuffer: CommandBuffer,
  node: SyntaxTreeNode = {
    command: '',
    args: []
  }
): SyntaxTreeNode => {
  const currentCommand = commandBuffer.shift()

  if (!currentCommand) return node

  if (isCommand(currentCommand) && !node.command)
    return generateSyntaxTree(commandBuffer, {
      ...node,
      command: currentCommand
    })
  else if (Object.values(Operators).includes(currentCommand))
    return generateSyntaxTree(commandBuffer, {
      ...node,
      and: generateSyntaxTree(commandBuffer, {
        command: '',
        args: []
      })
    })
  else if (node.command)
    return generateSyntaxTree(commandBuffer, {
      ...node,
      args: [...node.args, currentCommand]
    })
  else throw new Error(`cbourne: command not found: ${currentCommand}`)
}

const toCommandBuffer = (inputBuffer: InputBuffer): CommandBuffer =>
  inputBuffer.split(' ')

const executeSyntaxTreeNode = ({
  command,
  args,
  and,
  or
}: SyntaxTreeNode): CommandOutput => {
  const output: CommandOutput = commands[command](
    args,
    (updatedLocation: string) => (location = updatedLocation)
  )

  let operatorOutput: CommandOutput = {
    stdout: '',
    stderr: '',
    exitCode: 0
  }

  if (output.exitCode === 0 && and) {
    operatorOutput = executeSyntaxTreeNode(and)
  } else if (output.exitCode !== 0 && or) {
    operatorOutput = executeSyntaxTreeNode(or)
  }

  return {
    exitCode: operatorOutput.exitCode,
    stderr: `${output.stderr}${operatorOutput.stderr}`,
    stdout: `${output.stdout}${operatorOutput.stdout}`
  }
}

const newline = () => fileDescriptorRegistry.stdout('\n')

const reset = (output: CommandOutput) => {
  clearInputBuffer()

  if (output.stdout) {
    newline()
    fileDescriptorRegistry.stdout(output.stdout)
  }

  if (output.stderr) {
    newline()
    fileDescriptorRegistry.stderr(output.stderr)
  }

  newline()
  fileDescriptorRegistry.stdout(`${SHELL} ${location} $ `)
}

const onEnterPress = pipe(
  toCommandBuffer,
  generateSyntaxTree,
  executeSyntaxTreeNode,
  reset
)

const registerFileDescriptor = (
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
    if (key.charCodeAt(0) == 13) onEnterPress(inputBuffer)
    else {
      inputBuffer += key
      fileDescriptorRegistry.stdout(key)
    }
  })
}

export { registerFileDescriptor, init }
