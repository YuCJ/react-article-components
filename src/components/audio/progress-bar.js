
import { TimeControlContext } from './control-context'
import React, { useState } from 'react'
import styled from 'styled-components'

const ProgressBackground = styled.div`
  width: 100%;
  height: 100%;
  background: #d8d8d8;
  position: absolute;
  top: 0;
  left: 0;
`
const ProgressIndicator = styled.div.attrs({
  style: ({ percent }) => ({
    width: `${percent}%`,
  }),
})`
  height: 100%;
  background: #ef7ede;
  position: absolute;
  top: 0;
  left: 0;
`

const Circle = styled.div`
  width: 8px;
  height: 8px;
  background: #ef7ede;
  position: absolute;
`


export default function ProgressBar() {
  const [isBarPressed, setBarPressed] = useState(false)
  const [circlePosition, setCirclePosition] = useState(0)
  return (
    <TimeControlContext.Consumer>
      {({ duration, current }) => (
        <ProgressBackground onMouseDown={() => {
          setBarPressed(true)
          document.addEventListener('mousemove', (e) => {
            e.movementX()
          })
        }}>
          <ProgressIndicator percent={duration / current * 100} />
          <Circle />
        </ProgressBackground>
      )}
    </TimeControlContext.Consumer>
  )
}
