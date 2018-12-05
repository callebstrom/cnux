import dynamic from 'next/dynamic'
import Draggable from 'react-draggable'
import style from './style.css'

const Window = dynamic(() => import('../src/components/Window'), { ssr: false })
const Terminal = dynamic(() => import('../src/components/Terminal'), {
  ssr: false
})

export default () => (
  <div className={style.screen}>
    <Window>
      <Terminal />
    </Window>
  </div>
)
