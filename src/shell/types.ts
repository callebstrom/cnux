export enum Operators {
  AND = '&&',
  OR = '||'
}
export interface CommandOutput {
  stdout?: string
  stderr?: string
  exitCode: number
}

export interface SyntaxTreeNode {
  command: string
  args: CommandArguments
  and?: SyntaxTreeNode
  or?: SyntaxTreeNode
}

export interface SubscribableFileDescriptor {
  on: (event: string, callback: Function) => void
}

export interface FileDescriptorRegistry {
  stdout: Function
  stdin: SubscribableFileDescriptor
  stderr: Function
}

export type CommandArguments = Array<string>
export type FileDescriptorName = keyof FileDescriptorRegistry
export type CommandBuffer = Array<string>
export type InputBuffer = string
