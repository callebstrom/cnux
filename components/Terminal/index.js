import { Terminal } from 'xterm'
import * as attach from 'xterm/lib/addons/attach/attach'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as fullscreen from 'xterm/lib/addons/fullscreen/fullscreen'
import * as search from 'xterm/lib/addons/search/search'
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'
import * as winptyCompat from 'xterm/lib/addons/winptyCompat/winptyCompat'
import style from './style.css'
import { withStateHandlers } from 'recompose'
import { init as startShell, registerHandle } from '../../src/shell'

import { lifecycle as withLifecycle, compose } from 'recompose'

process = {}

process = Object.defineProperty(process, 'stdout', {
  set: test => {
    console.log(test)
  },
  get: () => ({ getWindowSize: () => [1920, 1080] })
})

process.stdout = Terminal.applyAddon(attach)
Terminal.applyAddon(fit)
Terminal.applyAddon(fullscreen)
Terminal.applyAddon(search)
Terminal.applyAddon(webLinks)
Terminal.applyAddon(winptyCompat)

const lifecycle = withLifecycle({
  componentDidMount() {
    const { terminal } = this.props
    registerHandle('stdout', this.props.stdout)
    registerHandle('stdin', terminal)

    terminal.open(document.getElementById('terminal'))
    terminal.toggleFullScreen()

    startShell()
  }
})

const stateHandlers = withStateHandlers(
  {
    output: '',
    terminal: new Terminal()
  },
  {
    stdout: ({ terminal }) => updatedStdout => {
      if (updatedStdout.indexOf('\n') !== -1)
        terminal.writeln(updatedStdout.replace('\n', ''))
      else terminal.write(updatedStdout)
      return { stdout: updatedStdout }
    },
    stdin: () => updatedStdin => ({ stdin: updatedStdin })
  }
)

const component = () => <div className={style.terminal} id="terminal" />

export default compose(
  stateHandlers,
  lifecycle
)(component)
