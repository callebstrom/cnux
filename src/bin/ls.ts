import { CommandArguments, CommandOutput } from '../types'

export default (args: CommandArguments): CommandOutput => {
  return {
    exitCode: 0,
    stderr: '',
    stdout: '-w---xrwx cbes cbes'
  }
}
