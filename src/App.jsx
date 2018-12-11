//  @flow
import React from 'react';
import ReactTable from 'react-table';

type State = {
    listItems: []
}

export default
class App extends React.Component<Props, State> {

  // state = {
  //   listItems: []
  // }

  componentDidMount() {

    fetch('https://northeurope.api.cognitive.microsoft.com/face/v1.0/largefacelists/10', {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': '91c9316d38044714b15eb630c1b6738a'
        }
    })
    .then( res => res.json() )
    .then( json => {
      console.log(json);
      setState({
        listItems: [{
          "one"
        }, {
          "two"
        }]
      })
    })


  }

  render() {
    return <React.Fragment>
      <ReactTable
        className="-striped -highlight tableInCard col col-12"
        data={this.state.listItems}
        columns={[{
          Header: 'Picture'
        }, {
          Header: 'faceID'
        }
        ]}
          />
    </React.Fragment>
  }

};
