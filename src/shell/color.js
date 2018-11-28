import ansiStyle from 'ansi-styles'

const colorize = (text, color) =>
  `${ansiStyle[color].open}${text}${ansiStyle[color].close}`

const hex = (text, hex) =>
  `${ansiStyle.color.ansi16m.hex(hex)}${text}${ansiStyle.color.close}`

const exports = Object.keys(ansiStyle).reduce(
  (prev, cur) => ({ ...prev, [`${cur}`]: text => colorize(text, cur) }),
  {}
)

export default exports
export { hex }
