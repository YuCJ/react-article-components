import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

export const Rail = styled.div`
  width: 100%;
  height: 100%;
  background: #ccc;
  position: relative;
`

export const Progress = styled.div.attrs({
  style: ({ w }) => ({
    width: w ? `${w}px` : 0,
  }),
})`
  background: white;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`

export const Indicator = styled.div.attrs({
  style: ({ x }) => ({
    left: x ? `${x}px` : 0,
  }),
})`
  width: 10px;
  height: 100%;
  background: black;
  position: absolute;
  top: 0;
  cursor: pointer;
`

function getMouseXRelaToDocument(mouseEvent) {
  try {
    return (
      mouseEvent.pageX ||
      mouseEvent.clientX +
        (document.documentElement.scrollLeft || document.body.scrollLeft)
    )
  } catch (err) {
    console.warn('Error on `getMouseXRelaToDocument`', err)
  }
}

function getViewportXRelaToDocument() {
  try {
    return window.pageXOffset !== undefined
      ? window.pageXOffset
      : (document.documentElement || document.body.parentNode || document.body)
          .scrollLeft
  } catch (err) {
    console.warn('Error on `getViewportXRelaToDocument`', err)
  }
}

function getElementEdgeRelaToDocument(element) {
  const viewportX = getViewportXRelaToDocument()
  try {
    const elementEdgeRelaToViewport = element.getBoundingClientRect()
    return {
      left: elementEdgeRelaToViewport.left + viewportX,
      right: elementEdgeRelaToViewport.right + viewportX,
    }
  } catch (err) {
    console.warn('Error on `getElementEdgeRelaToDocument`', err)
    return {}
  }
}

function getElementOutBoundWidth(element) {
  if (element && typeof element.getBoundingClientRect === 'function') {
    const bound = element.getBoundingClientRect()
    return bound.right - bound.left
  }
  return 0
}

function convert(source, sourceMin, sourceMax, targetMin, targetMax) {
  return (
    ((targetMax - targetMin) * source) / (sourceMax - sourceMin) + targetMin
  )
}

export default class Slider extends React.Component {
  static propTypes = {
    // The `defaultValue`, `value`, `min`, and `max` share the same unit given by the consumer of this component.
    defaultValue: PropTypes.number, // The initial represented value of the indicator. Will be translate to its position.
    value: PropTypes.number, // The value that will be translate to indicator position.
    min: PropTypes.number, // The value represented by the indicator the when it be moved to the start (left).
    max: PropTypes.number, // The value represented by the indicator the when it be moved to the end (right).
    // `onSeekEnd` will be invoked when user change the position of indicator. (By drag and drop the indicator or click the slider)
    // It will be invoked with `params.value` represented by the location of indicator.
    onSeekEnd: PropTypes.func,
    // `onSeekStart` will be invoked when user start draggin the indicator
    onSeekStart: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      isIndicatorHeld: false, // Is the user dragging the indicator or not
      indicatorX: 0, // The distance between the left edge of indicator and the left edge of slider
      indicatorXMax: 0, // The distance between the left edge of indicator at start and the left edge of it at end
      grabOffsetX: 0, // The distance between where mousedown invoked and the left edge of indicator
    }
    this._rail = React.createRef()
    this._indicator = React.createRef()
    this.handleIndicatorReleased = this._handleIndicatorReleased.bind(this)
    this.handleIndicatorPressed = this._handleIndicatorPressed.bind(this)
    this.handleMouseMove = this._handleMouseMove.bind(this)
    this.handleResize = this._handleResize.bind(this)
  }

  componentDidMount() {
    this._setIndicatorXMaxToStateIfChanged()
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnMount() {
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('mouseup', this.handleIndicatorReleased)
    document.removeEventListener('mousemove', this.handleMouseMove)
  }

  _convertValueToX() {
    const { value, min, max } = this.props
    const { indicatorXMax } = this.state
    return convert(value, min, max, 0, indicatorXMax)
  }

  _convertXToValue() {
    const { indicatorX, indicatorXMax } = this.state
    const { min, max } = this.props
    return convert(indicatorX, 0, indicatorXMax, min, max)
  }

  _handleResize() {
    this._setIndicatorXMaxToStateIfChanged()
  }

  _setIndicatorXMaxToStateIfChanged() {
    const railRect = this._rail.current.getBoundingClientRect()
    const currentMax =
      railRect.right -
      railRect.left -
      getElementOutBoundWidth(this._indicator.current)
    if (currentMax !== this.state.indicatorXMax) {
      this.setState({
        indicatorXMax: currentMax,
      })
    }
  }

  _handleIndicatorReleased(e) {
    this.setState({
      isIndicatorHeld: false,
      grabOffsetX: 0,
    })
    document.removeEventListener('mouseup', this.handleIndicatorReleased)
    document.removeEventListener('mousemove', this.handleMouseMove)
    console.log(this._convertXToValue())
  }

  _handleMouseMove(e) {
    const { indicatorXMax, grabOffsetX } = this.state
    const mouseXRelaToDocument = getMouseXRelaToDocument(e)
    const indicatorX =
      mouseXRelaToDocument -
      grabOffsetX -
      getElementEdgeRelaToDocument(this._rail.current).left
    if (indicatorX > indicatorXMax) {
      return this.setState({
        indicatorX: indicatorXMax,
      })
    }
    if (indicatorX < 0) {
      return this.setState({
        indicatorX: 0,
      })
    }
    return this.setState({
      indicatorX,
    })
  }

  _handleIndicatorPressed(e) {
    this.setState({
      isIndicatorHeld: true,
      grabOffsetX:
        getMouseXRelaToDocument(e) -
        getElementEdgeRelaToDocument(this._indicator.current).left,
    })
    document.addEventListener('mouseup', this.handleIndicatorReleased)
    document.addEventListener('mousemove', this.handleMouseMove)
  }

  render() {
    const { indicatorX } = this.state
    return (
      <Rail ref={this._rail}>
        <Progress
          w={indicatorX + getElementOutBoundWidth(this._indicator.current) / 2}
        />
        <Indicator
          ref={this._indicator}
          onMouseDown={this.handleIndicatorPressed}
          x={indicatorX}
        />
      </Rail>
    )
  }
}
