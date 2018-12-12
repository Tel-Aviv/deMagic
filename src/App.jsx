//  @flow
import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import { Button, Card, CardBody, Row, Col,
         InputGroup, Input,
         Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

type State = {
    listItems: Array<>,
    modal: Boolean,
    addURL: String,
    addName: String,
    addPhone: String
}

const baseUrl = 'https://northeurope.api.cognitive.microsoft.com/face/v1.0/'

export default
class App extends React.Component<Props, State> {

  state = {
    listItems: [],
    modal: false,
    addURL: '',
    addName: '',
    addPhone: ''
  }

  componentDidMount() {

    fetch(baseUrl + 'largefacelists/10/persistedfaces?start=0&top=1000', {
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': '91c9316d38044714b15eb630c1b6738a'
        }
    })
    .then( res => res.json() )
    .then( json => {
      const listItems = [];
      json.map( item => {
        const userData = JSON.parse(item.userData);
        listItems.push({
          id: item.persistedFaceId,
          url: userData.url,
          phoneNumber: userData.phoneNumber,
          name: userData.name
        })
      });

      this.setState({
        listItems: listItems
      });
    })

  }

  async deleteItem(itemId: String) {

    try {
      const resp = await fetch(`${baseUrl}largefacelists/10/persistedfaces/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Ocp-Apim-Subscription-Key': '91c9316d38044714b15eb630c1b6738a',
        }
      });
      
      const filtered = this.state.listItems.filter( item => {
        return item.id != itemId
      });

      this.setState({
        listItems: filtered
      });
    } catch( err ) {
      console.error(err);
    }
  }

  async addItem() {

    const { addURL, addName, addPhone  } = this.state;

    const pictureURL = 'https://sslcdn.proz.com/profile_resources/601304_r452f11e81a21e.jpg';

    const body = {
      url: pictureURL
    };

    const userData = {
      phoneNumber: '0543307026',
      name: 'Oleg Kleiman',
      url: pictureURL
    };

    try {
      const rawResponse =
        await fetch(`${baseUrl}largefacelists/10/persistedfaces?userData=${JSON.stringify(userData)}`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': '91c9316d38044714b15eb630c1b6738a',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const content = await rawResponse.json();
    } catch( err ) {
      console.error(err);
    }

    this.toggleModal();

  }

  updateName(event) {
    console.log(event.target.value);

    this.setState({
      addName: event.target.value
    });
  }

  updateURL(event) {
    this.setState({
      addURL: event.target.value
    });
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal,
      addURL: '',
      addName: '',
      addPhone: ''
    });
  }

  render() {
    return (
      <React.Fragment>
        <Row>
          <Col md='12'>
            <Button color='primary'
              onClick={::this.toggleModal}>
              <span>Add</span>
            </Button>

            <Modal isOpen={this.state.modal}>
              <ModalHeader>
                Add New Face
              </ModalHeader>
              <ModalBody>
                <InputGroup>
                  <Input placeholder="url" onChange={::this.updateURL}/>
                </InputGroup>
                <br />
                <InputGroup>
                  <Input placeholder="name" onChange={::this.updateName}/>
                </InputGroup>
                <br />
                <InputGroup>
                  <Input placeholder="phone number" />
                </InputGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={::this.addItem}>Add</Button>{' '}
                <Button color="secondary" onClick={::this.toggleModal}>Cancel</Button>
              </ModalFooter>

            </Modal>
          </Col>
        </Row>
        <Card>
          <ReactTable
              className="-striped -highlight tableInCard col col-12"
              data={this.state.listItems}
              columns={[{
                Header: 'Picture URL',
                accessor: 'url'
              }, {
                Header: 'FaceID',
                accessor: 'id'
              }, {
                Header: 'Phone Number',
                accessor: 'phoneNumber'
              },
              {
                Header: 'Name',
                accessor: 'name'
              }, {
                Header: '',
                Cell: row => {
                        const itemId = row.original.id;
                        return (<Button
                                onClick={ () => ::this.deleteItem(itemId) }>
                                Delete
                              </Button>)
                      }
              }]}
              />
        </Card>
      </React.Fragment>)
  }

};
