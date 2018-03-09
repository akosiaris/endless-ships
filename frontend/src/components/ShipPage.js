import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Panel, Image, Nav, NavItem } from 'react-bootstrap';
import R from 'ramda';
import { FormattedNumber, kebabCase, OutfitLink } from '../common';
import './ShipPage.css';

const intersperse = (arr, sep) => {
  if (arr.length === 0) {
    return [];
  } else {
    return arr.slice(1).reduce((xs, x, idx) => xs.concat([sep(idx), x]), [arr[0]]);
  }
};

const ShipLicenses = ({ licenses }) => {
  if (licenses.length === 2) {
    return <p className="licenses">This ship requires {licenses[0]} and {licenses[1]} licenses.</p>;
  } else {
    return <p className="licenses">This ship requires a {licenses[0]} license.</p>;
  }
};

const imageURL = (ship) => {
  var filename;

  if (ship.name === "Shuttle") {
    // for some crazy reason Shuttle has different sprite filenames
    filename = "ship/shuttle=0.png";
  } else if (ship.sprite[1]) {
    filename = window.encodeURI(ship.sprite[0]) + "-0.png";
  } else {
    filename = window.encodeURI(ship.sprite[0]) + ".png";
  }

  // probably not a good idea to hotlink to github to the master branch
  return "https://raw.githubusercontent.com/endless-sky/endless-sky/master/images/" + filename;
};

const FormattedPercentage = ({ coefficient }) => (
  <span><FormattedNumber number={coefficient * 100}/>%</span>
);

const OutfitItem = ({ name, quantity }) => {
  if (quantity === 1) {
    return <li className="list-group-item"><OutfitLink outfitName={name} /></li>;
  } else {
    return (
      <li className="list-group-item">
        <span className="badge">{quantity}</span>
        <OutfitLink outfitName={name} />
      </li>
    );
  }
};

const ShipDescription = ({ description }) => (
  <Row>
    <Col md={12}>
      <div className="well">
        {intersperse(description, (index) => <span key={index}><br/><br/></span>)}
      </div>
    </Col>
  </Row>
);

const modificationLink = (name, path) => (
  <NavItem componentClass={Link}
           key={name}
           eventKey={kebabCase(name)}
           href={path}
           to={path}>
    {name}
  </NavItem>
);

const ShipModifications = ({ ship, selectedModification }) => {
  const items = ship.modifications.map(modification => {
    return modificationLink(
      modification.name,
      `/ships/${kebabCase(ship.name)}/${kebabCase(modification.name)}`
    );
  });

  return (
    <Panel>
      <Panel.Heading>Modifications</Panel.Heading>

      <Panel.Body>
        <Nav bsStyle="pills" stacked={true} activeKey={selectedModification || kebabCase(ship.name)}>
          {modificationLink(ship.name, `/ships/${kebabCase(ship.name)}`)}
          {items}
        </Nav>
      </Panel.Body>
    </Panel>
  );
};

const ShipOutfits = ({ ship, selectedModification }) => {
  let outfits;

  if (selectedModification) {
    outfits = ship.modifications.find(
      modification => kebabCase(modification.name) === selectedModification
    ).outfits;
  } else {
    outfits = ship.outfits;
  }

  return (
    <Panel>
      <Panel.Heading>Default outfits</Panel.Heading>

      <Panel.Body>
        <ul className="list-group">
          {outfits.map(outfit => <OutfitItem key={outfit.name} {...outfit} />)}
        </ul>
      </Panel.Body>
    </Panel>
  );
};

const ShipPage = ({ ship, selectedModification }) => (
  <div className="app">
    <Row>
      <Col md={6}>
        <Panel>
          <Panel.Heading>{ship.name}</Panel.Heading>

          <Panel.Body>
            <div className="media">
              <div className="media-body">
                <ul>
                  <li>cost: <FormattedNumber number={ship.cost} /></li>
                  <li>shields: <FormattedNumber number={ship.shields} /></li>
                  <li>hull: <FormattedNumber number={ship.hull} /></li>
                  <li>mass: <FormattedNumber number={ship.mass} /></li>
                  <li>cargo space: <FormattedNumber number={ship.cargoSpace} /></li>
                  <li>required crew: <FormattedNumber number={ship.requiredCrew} /></li>
                  <li>bunks: <FormattedNumber number={ship.bunks} /></li>
                  <li>fuel capacity: <FormattedNumber number={ship.fuelCapacity} /></li>
                  <li>outfit space: <FormattedNumber number={ship.outfitSpace} /></li>
                  <li>weapon capacity: <FormattedNumber number={ship.weaponCapacity} /></li>
                  <li>engine capacity: <FormattedNumber number={ship.engineCapacity} /></li>
                  <li>guns: <FormattedNumber number={ship.guns} /></li>
                  <li>turrets: <FormattedNumber number={ship.turrets} /></li>
                  {ship.drones > 0 && <li>drones: <FormattedNumber number={ship.drones} /></li>}
                  {ship.fighters > 0 && <li>fighters: <FormattedNumber number={ship.fighters} /></li>}
                  {R.has('selfDestruct', ship) && <li>self-destruct: <FormattedPercentage coefficient={ship.selfDestruct}/></li>}
                </ul>

                {ship.licenses.length > 0 && <ShipLicenses licenses={ship.licenses} />}
              </div>

              <div className="media-right">
                <Image src={imageURL(ship)} className="ship-sprite" />
              </div>
            </div>
          </Panel.Body>
        </Panel>

        {ship.modifications.length > 0 && <ShipModifications ship={ship} selectedModification={selectedModification} />}
      </Col>

      <Col md={6}>
        <ShipOutfits ship={ship} selectedModification={selectedModification}/>
      </Col>
    </Row>

    {ship.description.length > 0 && <ShipDescription description={ship.description}/>}
  </div>
);

const mapStateToProps = (state, { match: { params: { shipName, modification } } }) => {
  const ship = state.ships.find(ship => kebabCase(ship.name) === shipName);
  const modifications = state.shipModifications.filter(modification => modification.original === ship.name);

  return { ship: { modifications, ...ship }, selectedModification: modification };
};

export default connect(mapStateToProps)(ShipPage);
