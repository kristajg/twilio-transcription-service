// 3rd party & proprietary libraries
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledButton = styled.div`
  cursor: pointer;
  width: ${props => props.styles.width ? props.styles.width : 'default'};
  max-width: 90%;
  text-align: center;
  padding: 10px;
  margin-right: ${props => props.styles.marginRight ? props.styles.marginRight : ''};
  background: rgb(255,137,117);
  background: linear-gradient(90deg, rgba(255,137,117,1) 0%, rgba(239,13,80,1) 80%);
  color: #fff;
  font-weight: 600;
  font-size: ${props => props.styles.fontSize ? props.styles.fontSize : '14px'};
  border-radius: 4px;
  box-shadow: 5px 5px 15px 1px rgb(66 86 100 / 10%);
  opacity: ${props => props.disabled ? '.75': '1'};
`;

export default class Button extends Component {
  render() {
    return (
      <StyledButton
        onClick={this.props.onClick}
        disabled={this.props.disabled}
        styles={this.props.styles}
      >
        {this.props.children}
      </StyledButton>
    );
  }
}

Button.defaultProps = {
  disabled: false,
  onClick: () => {},
  styles: {},
};

Button.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  styles: PropTypes.object,
};