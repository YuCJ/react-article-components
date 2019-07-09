import Holwer from 'howler'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'

const createEmptyFunction = (funcName) => () => {
  console.warn('An empty method that should be overwritten in `ControlContext.Provider` is invoked. The mehtod name is', funcName)
}

const isShallowEqual = (obj1, obj2) =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(key => obj1[key] === obj2[key])

export const TimeControlContext = React.createContext({
  current: 0,
  duration: 0,
  setCurrent: createEmptyFunction('setCurrent'),
})

export const StatusControlContext = React.createContext({
  isPlaying: false,
  isMute: false,
  play: createEmptyFunction('play'),
  stop: createEmptyFunction('stop'),
  pause: createEmptyFunction('pause'),
  toggleMute: createEmptyFunction('toggleMute'),
})

export class ControlProvider extends PureComponent {
  static propTypes = {
    src: PropTypes.string.isRequired,
    children: PropTypes.node,
    updateUpstreamPlayingState: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      // The `current`, `duration`, `isPlaying`, and `isMute` in state are just the snapshot of status in `this._sound`.
      // In the other words, setting state won't affect `this._sound`.
      current: 0,
      duration: 0,
      isPlaying: false,
      isMute: false,
    }
    this._cachedStatusControl = {}
    this.stop = this.stop.bind(this)
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
    this.setCurrent = this.setCurrent.bind(this)
    this.setDuration = this.setDuration.bind(this)
    this._sound = new Holwer({
      src: this.props.src,
      autoplay: false,
      loop: false,
      onload: () => {
        this.setDuration()
      },
    })
  }

  setCurrent(to) {
    const sound = this._sound
    if (sound && typeof sound.seek === 'function') {
      const toNum = parseFloat(to)
      // If param `to` is given, set current seek to it and update state with it.
      // If `to` is undefined, just get the position of playback and update state with it.
      this.setState({
        current: (toNum >= 0 && to !== Infinity) ? sound.seek(toNum).seek() : sound.seek()
      })
    }
  }

  setDuration(to) {
    const sound = this._sound
    if (sound && typeof sound.duration === 'function') {
      const toNum = parseFloat(to)
      this.setState({
        duration: (toNum >= 0 && to !== Infinity) ? toNum : sound.duration(), // Get the duration of the audio source (secs)
      })
    }
  }

  setPlaying(isPlaying, cb) {
    this.setState({
      isPlaying,
    }, cb)
    const { updateUpstreamPlayingState } = this.props
    if (typeof updateUpstreamPlayingState === 'function') {
      updateUpstreamPlayingState(isPlaying)
    }
  }

  play() {
    this.setPlaying(true, () => { this._sound.play() })
  }

  stop() {
    this.setPlaying(false, () => { this._sound.stop() })
  }

  pause() {
    this.setPlaying(false, () => { this._sound.pause() })
  }

  toggleMute() {
    this.setState((prevState) => ({
      isMute: !prevState.isMute,
    }))
  }

  componentWillUnmount() {
    this._sound = null
  }

  render() {
    const { current, duration, isPlaying, isMute } = this.state
    const nextStatusControl = {
      play: this.play,
      stop: this.stop,
      pause: this.pause,
      toggleMute: this.toggleMute,
      isPlaying,
      isMute,
    }
    const nextTimeControl = {
      current,
      duration,
      setCurrent: this.setCurrent,
    }
    // Cache the control values to prevent unnecessary re-rendering of Context.Consumer
    this._cachedStatusControl = isShallowEqual(this._cachedStatusControl, nextStatusControl) ? this._cachedStatusControl : nextStatusControl
    this._cachedTimeControl = isShallowEqual(this._cachedTimeControl, nextTimeControl) ? this._cachedTimeControl : nextTimeControl
    return (
      <StatusControlContext.Provider value={this._cachedStatusControl}>
        <TimeControlContext.Provider value={this._cachedTimeControl}>
          {this.props.children}
        </TimeControlContext.Provider>
      </StatusControlContext.Provider>
    )
  }
}
