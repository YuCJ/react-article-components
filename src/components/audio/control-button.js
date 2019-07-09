import { StatusControlContext } from './control-context'
import mq from '../../utils/media-query'
import PauseIcon from '../../assets/body/audio/pause.svg'
import PlayIcon from '../../assets/body/audio/play.svg'
import React from 'react'
import styled from 'styled-components'

const IconWrapper = styled.button`
  ${mq.tabletAndBelow`
    width: 48px;
    height: 48px;
  `}
  ${mq.desktopAndAbove`
    width: 65px;
    height: 65px;
  `}
  background-color: #fff;
  border: 1px solid #d8d8d8;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  user-select: none;
  outline: none;
  >svg {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    path {
      stroke: ${props => props.isPlaying ? '#ef7ede' : 'none'};
      fill: ${props => props.isPlaying ? 'none' : '#ef7ede'};
    }
  }
`

export default function ControlButton() {
  return (
    <StatusControlContext.Consumer>
      {({ isPlaying, play, pause }) => (
        <IconWrapper
          isPlaying={isPlaying}
          onClick={isPlaying ? pause : play}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </IconWrapper>
      )}
    </StatusControlContext.Consumer>
  )
}
