import { ControlProvider } from './control-context'
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ControlButton from './control-button'

export default class AudioPlayer extends PureComponent {
  static propTypes = {
    content: PropTypes.shape({
      coverPhoto: PropTypes.object,
      description: PropTypes.string,
      filetype: PropTypes.string,
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  }

  render() {
    const { content } = this.props
    return (
      <ControlProvider
        src={content.url}
      >
        <ControlButton />
      </ControlProvider>
    )
  }
}
