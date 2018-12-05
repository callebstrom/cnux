import Draggable from 'react-draggable'
import style from './style.css'

export default ({ children }) => (
  <Draggable handle={`.${style.header}`} grid={[1, 1]}>
    <div className={style.window}>
      <div className={style.header}>
        <div className={style.buttons}>
          <img className={style.icon} src="/static/close.svg" />
          <img className={style.icon} src="/static/maximize.svg" />
          <img className={style.icon} src="/static/minimize.svg" />
        </div>
        <span className={style.handle}>cbourne</span>
      </div>
      <div className={style.content}>{children}</div>
    </div>
  </Draggable>
)
