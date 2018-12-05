import { CommandArguments, CommandOutput } from '../types'

export default (args: CommandArguments, updateLocation): CommandOutput => {
  updateLocation(args)
  return {
    exitCode: 0,
    stderr: '',
    stdout: ''
  }
}
