import React, { Component } from 'react';
import R from 'ramda';
import { Grid, Row, Col, PageHeader, Table } from 'react-bootstrap';
import NumberFormat from 'react-number-format';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

function TextCell(props) {
  return (
    <td className="text-left">
      {props.text}
    </td>
  );
}

function RightCell(props) {
  return (
    <td className="text-right">
      {props.children}
    </td>
  );
}

function FormattedNumber(props) {
  return (
    <NumberFormat value={props.number}
                  displayType={'text'}
                  thousandSeparator={true} />
  );
}

function NumberCell(props) {
  return (
    <RightCell>
      <FormattedNumber number={props.number} />
    </RightCell>
  );
}

function CrewAndBunks(props) {
  if (props.crew > 0) {
    return (
      <RightCell>
        <FormattedNumber number={props.crew} />
        {' / '}
        <FormattedNumber number={props.bunks} />
      </RightCell>
    );
  } else {
    return (<RightCell></RightCell>);
  }
}

class App extends Component {
  state = {
    isLoading: true,
    data: {},
    ordering: { columnName: null }
  }

  componentDidMount() {
    fetch('data.json').then(response => {
      return response.json();
    }).then(data => {
      this.setState({ isLoading: false, data: data });
    });
  }

  toggleOrdering = (columnName) => {
    if (this.state.ordering.columnName === columnName) {
      if (this.state.ordering.order === 'asc') {
        this.setState({ ordering: { columnName: columnName, order: 'desc' } });
      } else {
        this.setState({ ordering: { columnName: null } });
      }
    } else {
      this.setState({ ordering: { columnName: columnName, order: 'asc' } });
    }
  }

  renderHeaders() {
    const columns = [
      ['Name', 'name'],
      ['Race'],
      ['Cost', 'cost'],
      ['Category'],
      ['Hull', 'hull'],
      ['Shields', 'shields'],
      ['Mass', 'mass'],
      ['Engine cap.', 'engineCapacity'],
      ['Weapon cap.', 'weaponCapacity'],
      ['Fuel cap.', 'fuelCapacity'],
      ['Outfit sp.', 'outfitSpace'],
      ['Cargo sp.', 'cargoSpace'],
      ['Crew / bunks', 'bunks'],
      ['Licenses']
    ]

    return columns.map(([text, sortBy]) => {
      let title, icon;

      if (sortBy) {
        title = <a className="table-header" onClick={() => this.toggleOrdering(sortBy)}>{text}</a>;

        if (this.state.ordering.columnName === sortBy) {
          if (this.state.ordering.order === 'asc') {
            icon = <span className="glyphicon glyphicon-sort-by-attributes"></span>;
          } else {
            icon = <span className="glyphicon glyphicon-sort-by-attributes-alt"></span>;
          }
        }
      } else {
        title = text;
      }

      return (
        <th className="text-center" key={text}>
          {title}
          {' '}
          {icon}
        </th>
      );
    });
  }

  renderLabel(text) {
    let style;

    switch (text) {
      case 'human':
      case 'Navy':
      case 'Carrier':
      case 'Cruiser':
      case 'Militia Carrier':
        style = 'human';
        break;
      case 'hai':
      case 'Unfettered Militia':
        style = 'hai';
        break;
      case 'quarg':
        style = 'quarg';
        break;
      case 'korath':
        style = 'korath';
        break;
      case 'wanderer':
      case 'Wanderer':
      case 'Wanderer Military':
        style = 'wanderer';
        break;
      case 'coalition':
        style = 'coalition';
        break;
      default:
    }

    return (<span className={'label label-' + style} key={text}>{text}</span>);
  }

  renderLicenses(ship) {
    return ship.licenses.map(
      license => this.renderLabel(license)
    ).reduce(
      (licenses, license) => (licenses === null ? [license] : [...licenses, ' ', license]),
      null
    );
  }

  processedRows() {
    const prop = R.propOr(0, this.state.ordering.columnName);
    const sortedProp = (this.state.ordering.order === 'asc') ? R.ascend(prop) : R.descend(prop);
    const comparator = R.sort(sortedProp);

    return comparator(this.state.data);
  }

  renderRows() {
    return this.processedRows().map(ship => (
      <tr key={ship.name}>
        <TextCell text={ship.name} />
        <TextCell text={this.renderLabel(ship.race)} />
        <NumberCell number={ship.cost} />
        <TextCell text={ship.category} />
        <NumberCell number={ship.hull} />
        <NumberCell number={ship.shields} />
        <NumberCell number={ship.mass} />
        <NumberCell number={ship.engineCapacity} />
        <NumberCell number={ship.weaponCapacity} />
        <NumberCell number={ship.fuelCapacity} />
        <NumberCell number={ship.outfitSpace} />
        <NumberCell number={ship.cargoSpace} />
        <CrewAndBunks crew={ship.requiredCrew} bunks={ship.bunks} />
        <TextCell text={this.renderLicenses(ship)} />
      </tr>
    ));
  }

  renderTable() {
    return (
      <Table striped bordered condensed hover>
        <thead>
          <tr>
            {this.renderHeaders()}
          </tr>
        </thead>
        <tbody>
          {this.renderRows()}
        </tbody>
      </Table>
    );
  }

  render() {
    if (this.state.isLoading) {
      return (<div className="App">Loading...</div>);
    } else {
      return (
        <Grid fluid={true}>
          <Row>
            <Col lg={12}>
              <PageHeader>
                Welcome to Endless Sky encyclopedia!
              </PageHeader>
              {this.renderTable()}
            </Col>
          </Row>
        </Grid>
      );
    }
  }
}

export default App;