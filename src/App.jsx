//  @flow
import React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import { Button, Card, CardBody, Row, Col,
         InputGroup, Input, InputGroupAddon, InputGroupText,
         Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import classNames from 'classnames';

type State = {
    error: String,
    listItems: Array<>,
    modal: Boolean,
    editModal: Boolean,
    findModal: Boolean,
    findUrl: String,

    foundUrl: String,
    foundName: String,

    itemId: String,
    itemName: String,
    itemPhoneNumber: String,
    itemURL: String
}

const baseUrl = 'https://northeurope.api.cognitive.microsoft.com/face/v1.0/'
const largeFaceListId = 10;

export default
class App extends React.Component<Props, State> {

  state = {
    error: '',
    listItems: [],
    modal: false,
    editModal: false,
    findModal: false,
    findUrl: '',
    foundUrl: '',

    itemId: '',
    itemName: '',
    itemURL: '',
    itemPhoneNumber: ''
  }

  componentDidMount() {

    this.updateData();

  }

  updateData() {

    fetch(`${baseUrl}largefacelists/${largeFaceListId}/persistedfaces?start=0&top=1000`, {
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
    .catch( err => {
      this.setState({
        error: err
      });
    })
  }

  async editItem(itemId: String) {

  }

  async deleteItem(itemId: String) {

    try {
      const resp = await fetch(`${baseUrl}largefacelists/${largeFaceListId}/persistedfaces/${itemId}`, {
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

    const { itemURL, itemName, itemPhoneNumber  } = this.state;
    const body = {
      url: itemURL
    };

    const userData = {
      phoneNumber: itemPhoneNumber,
      name: itemName,
      url: itemURL
    };

    try {
      const rawResponse =
        await fetch(`${baseUrl}largefacelists/${largeFaceListId}/persistedfaces?userData=${JSON.stringify(userData)}`, {
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
    this.updateData();
  }

  async updateItem() {

    try {

      const userData = {
        phoneNumber: this.state.itemPhoneNumber,
        name: this.state.itemName,
        url: this.state.itemURL
      };

      const body = {
        userData: JSON.stringify(userData)
      };

      const response = await fetch(`${baseUrl}largefacelists/${largeFaceListId}/persistedfaces/${this.state.itemId}`, {
        method: 'PATCH',
        headers: {
          'Ocp-Apim-Subscription-Key': '91c9316d38044714b15eb630c1b6738a',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      console.log(response);
    } catch( err ) {
      console.error(err);
    }

    this.toggleEditModal('');
    this.updateData();
  }

  updateName(event) {
    this.setState({
      itemName: event.target.value
    });
  }

  updateURL(event) {
    this.setState({
      itemURL: event.target.value
    });
  }

  updatePhoneNumber(event) {
    this.setState({
      itemPhoneNumber: event.target.value
    });
  }

  updateFindUrl(event) {
    this.setState({
      findUrl: event.target.value
    })
  }

  toggleEditModal(item) {
    this.setState({
      editModal: !this.state.editModal,
      itemId: item.id,
      itemName: item.name,
      itemURL: item.url,
      itemPhoneNumber: item.phoneNumber
    });
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal,
      itemId: '',
      itemURL: '',
      itemName: '',
      itemPhoneNumber: ''
    });
  }

  async findSimilar() {

    this.setState({
      foundName: '',
      foundUrl: ''
    })

    let body = {
      url: this.state.findUrl
    };
    try {
      let resp = await fetch(`${baseUrl}detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,headPose`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': '91c9316d38044714b15eb630c1b6738a',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      let json = await resp.json();
      if( json.length > 0 ) {

        const faceId = json[0].faceId;
        body = {
          faceId: faceId,
          largeFaceListId: largeFaceListId,
          maxNumOfCandidatesReturned: 10,
          mode: "matchPerson"
        };

        let resp = await fetch(`${baseUrl}findsimilars`, {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': '91c9316d38044714b15eb630c1b6738a',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        json = await resp.json();
        if( json && json.length > 0 ) {
          const found =  this.state.listItems.find( item => {
            return  item.id == json[0].persistedFaceId
          });
          this.setState({
            foundUrl: found.url,
            foundName: found.name
          })

        }


      }

    } catch( err ) {
      console.error(err);
    }
  }

  toggleFindModal() {
    this.setState({
      findModal: !this.state.findModal
    })
  }

  async train() {
    try {
      const response = await fetch(`${baseUrl}largefacelists/10/train`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': '91c9316d38044714b15eb630c1b6738a'
        }
      });
      console.log(response);
    } catch( err ) {
      console.error(err);
    }
  }

  render() {

    const foundPanel = this.state.foundName ?
                    <Row>
                      <div>{this.state.foundName}</div>
                      <img src={this.state.foundUrl} width='100' height='100' />
                    </Row> :
                    null;


    // const foundPanelClass = classNames({
    //   'visible' : this.state.foundName
    // })

    return (
      <React.Fragment>
        <Row>
          <Col md='12'>
            <Button color='primary'
              onClick={::this.toggleModal}>
              <span>Add</span>
            </Button>
            &nbsp;
            <Button color='primary'
              onClick={::this.train}>
              Train
            </Button>
            &nbsp;
            <Button color="warning"
              onClick={::this.toggleFindModal}>
              Find
            </Button>

            <Modal isOpen={this.state.findModal}>
              <ModalHeader>
                Find Similar Face
              </ModalHeader>
              <ModalBody>
                <InputGroup>
                  <Input placeholder='url'
                    onChange={::this.updateFindUrl}/>
                </InputGroup>
                <br />
                {foundPanel}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={::this.findSimilar}>Find</Button>{' '}
                &nbsp;
                <Button color="secondary"
                        onClick={::this.toggleFindModal}>Cancel</Button>
              </ModalFooter>
            </Modal>

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
                  <Input placeholder="phone number" onChange={::this.updatePhoneNumber} />
                </InputGroup>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onClick={::this.addItem}>Add</Button>{' '}
                <Button color="secondary" onClick={::this.toggleModal}>Cancel</Button>
              </ModalFooter>
            </Modal>
            <Modal isOpen={this.state.editModal}>
              <ModalHeader>
                <div>ItemId: {this.state.itemId}</div>
              </ModalHeader>
              <ModalBody>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>Name</InputGroupText>
                  </InputGroupAddon>
                  <Input defaultValue={this.state.itemName}
                         onChange={::this.updateName} />
                </InputGroup>
                <br />
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>Phone Number</InputGroupText>
                  </InputGroupAddon>
                  <Input defaultValue={this.state.itemPhoneNumber}
                         onChange={::this.updatePhoneNumber} />
                </InputGroup>

              </ModalBody>
              <ModalFooter>
                <Button color="primary"
                        onClick={::this.updateItem}>Update</Button>
                &nbsp;
                <Button color="secondary"
                        onClick={ () => ::this.toggleEditModal('')}>Cancel</Button>
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
                accessor: 'url',
                Cell: row => {
                  return <img style={{
                                      display: 'block',
                                      marginLeft: 'auto',
                                      marginRight: 'auto'
                              }}
                              src={row.original.url} width='200'/>
                }
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
                        const editItem = {
                          id: itemId,
                          name: row.original.name,
                          phoneNumber: row.original.phoneNumber,
                          url: row.original.url
                        };

                        return (<div>
                                  <Button color="danger"
                                    onClick={ () => ::this.deleteItem(itemId) }>
                                    Delete
                                  </Button>
                                  &nbsp;
                                  <Button color="success"
                                    onClick={ () => this.toggleEditModal(editItem) }>
                                    Edit
                                  </Button>
                                </div>)
                      }
              }]}
              />
        </Card>
      </React.Fragment>)
  }

};
