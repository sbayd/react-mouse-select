import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Selectable from './Selectable';

// const styles = {
//   color:'red',
//   textAlign: 'left'
// }

export default class Index extends Component {


  onSelect() {

  }

  onItemRender() {

    // Custom single item render method here
  }

  onListRender() {

    // Custom render method here
  }

  render() {
    let className = 'item noselect';
    className += (this.props.isSelected ? ' selected' : '');

    return (
      <div className={className}>
        Item {this.props.data + 1 }
      </div>
    );
  }
}

const data = [];
for (let i = 0; i < 65; i++) {
  data.push(
    <Index key={i} data={i} />
  );
}

ReactDOM.render(
  <Selectable>
    {data}
  </Selectable>,
  global.document.getElementById('root')
);
