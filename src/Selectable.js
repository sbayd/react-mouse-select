import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
var _ = require('lodash');

const styles = {
  position: 'relative',
  width: '150px',
  height: '150px',
  border: '3px solid black',
  margin: '20px',
  textAlign: 'left',
  padding: '30px',
  backgroundColor: 'lightgray'
};


export default class Selectable extends Component {


  constructor(props) {
    super(props);
    this.state = {
      isSelecting: false,
      mousedown: false,
      startPoint: null,
      endPoint: null,
      selectionBox: null,
      selectedItems: {}
    };
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.makeBox = this.makeBox.bind(this);
    this.renderBox = this.renderBox.bind(this);
  }
  componentWillMount() {
    this.selectedChildren = {};
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this).addEventListener('mousedown', this.onMouseDown);
  }

  componentWillReceiveProps(nextProps) {
    const nextState = {};
    if (!nextProps.enabled) {
      nextState.selectedItems = {};
    }
    this.setState(nextState);
  }

  componentDidUpdate() {
    if (this.state.mousedown && !_.isNull(this.state.selectionBox)) {
      this.updateCollisions(this.state.selectionBox);
    }
  }
  // componentWillUnmount() {
  //   ReactDOM.findDOMNode(this).removeEventListener('mousedown', this.onMouseDown);
  // }

  onMouseDown(event) {
    if (!this.props.enabled || event.button === 2) {
      return;
    }
    const nextState = {};

    nextState.mousedown = true;
    nextState.startPoint = {
      x: event.pageX,
      y: event.pageY
    };
    event.preventDefault();
    this.setState(nextState);

    ReactDOM.findDOMNode(this).addEventListener('mousemove', this.onMouseMove);
    ReactDOM.findDOMNode(this).addEventListener('mouseup', this.onMouseUp);
    // console.log('clicked');
  }

  onMouseMove(event) {
    event.preventDefault();

    if (this.state.mousedown) {
      const point = {
        x: event.pageX,
        y: event.pageY
      };

      this.setState({
        endPoint: point,
        selectionBox: this.makeBox(this.state.startPoint, point)
      });
    }
  }

  onMouseUp() {
    ReactDOM.findDOMNode(this).removeEventListener('mousemove', this.onMouseMove);
    ReactDOM.findDOMNode(this).removeEventListener('mouseup', this.onMouseUp);
    this.setState({
      mousedown: false,
      startPoint: null,
      endPoint: null,
      selectionBox: null,
      isSelecting: false,

    });
    this.props.onSelection.call(null, _.keys(this.selectedChildren));

  //  console.log('lifted');
  }

  getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement;
  }

  makeBox(startPoint, endPoint) {

    const parentNode = ReactDOM.findDOMNode(this.refs.selectionBox);
    const left = Math.min(startPoint.x, endPoint.x) - parentNode.offsetLeft;
    const top = Math.min(startPoint.y, endPoint.y) - parentNode.offsetTop;
    const height = Math.abs(startPoint.y - endPoint.y);
    const width = Math.abs(startPoint.x - endPoint.x);
  //  console.log('he', left, top, height, width);
    return (
    {
      left: left,
      top: top,
      width: width,
      height: height,
      position: 'absolute',
      backgroundColor: 'red',
      opacity: '0.5',
      border: '1px dashed',
      zIndex: 9000
    }
    );
  }

  doesIntersect(a, b) {
    if (a.left <= b.left + b.width &&
        a.left + a.width >= b.left &&
        a.top <= b.top + b.height &&
        a.top + a.height >= b.top) {
      return true;
    }
    return false;
  }

  updateCollisions(selectionBox) {
    let tempNode = null;
    let tempBox = null;

    _.each(this.refs, (ref, key) => {
      if (key !== 'selectionBox') {
        tempNode = ReactDOM.findDOMNode(ref);

        tempBox = {
          top: tempNode.offsetTop,
          left: tempNode.offsetLeft,
          width: tempNode.clientWidth,
          height: tempNode.clientHeight
        };

        if (this.doesIntersect(selectionBox, tempBox)) {
          this.selectedChildren[key] = true;
        }
        else {
          if (!this.state.isSelecting) {
            delete this.selectedChildren[key];
          }
        }
      }
    });
  }

  selectItem(key, isSelected) {
    if (isSelected) {
      this.selectedChildren[key] = isSelected;
    }

    else {
      delete this.selectedChildren[key];
    }
    this.props.onSelection.call(null, _.keys(this.selectedChildren));
    this.forceUpdate();
  }

  selectAll() {
    _.each(this.refs, (ref, key) => {
      if (key !== 'selectionBox') {
        this.selectedChildren[key] = true;
      }
    });
  }

  clearSelection() {
    this.selectedChildren = {};
    this.props.onSelection.call(null, []);
    this.forceUpdate();
  }

  renderItems() {
    let index = 0;
    const _this = this;
    let tmpChild;
    return React.Children.map(this.props.children, (child) => {
      const tmpKey = _.isNull(child.key) ? index++ : child.key;

      const isSelected = _.has(_this.selectedChildren, tmpKey);

      tmpChild = React.cloneElement(child, {
        ref: tmpKey,
        selectionParent: _this,
        isSelected: isSelected

      });

      return React.DOM.div({
        className: 'select-box' + (isSelected ? ' selected' : ''),
        onClickCapture: function (e) {
          if ((e.ctrlKey || e.altKey || e.shiftKey) && _this.props.enabled) {
            e.preventDefault();
            e.stopPropagation();
            this.selectItem(tmpKey, !_.has(_this.selectedChildren, tmpKey));
          }
        }
      }, tmpChild);
    });
  }


  renderBox() {
    return (
      <div className="selection-border" style={this.state.selectionBox} />
    );
  }

  render() {
  //  console.log(this.props);

    const className = 'selection ' + (this.state.mousedown ? 'dragging' : '');
    return (
      <div className={className} ref="selectionBox" onMouseDown={this.onMouseDown}>
        {this.renderItems()}
        {this.renderBox()}
      </div>
    );
  }

}

Selectable.propTypes = {
  enabled: React.PropTypes.bool,
  onSelection: React.PropTypes.func
};

Selectable.defaultProps = {
  enabled: true,
  onSelection: _.noop
};
