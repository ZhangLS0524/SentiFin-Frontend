import React from 'react';
import { Table, Button, Form } from 'react-bootstrap';

const TickerTable = () => (
  <Table bordered hover responsive>
    <thead>
      <tr>
        <th>TICKER</th>
        <th>NAME</th>
        <th>3 DAY</th>
        <th>5 DAY</th>
        <th>10 DAY</th>
        <th>DETAILS</th>
      </tr>
      <tr>
        <th><Form.Control size="sm" placeholder="SEARCH" /></th>
        <th><Form.Control size="sm" placeholder="SEARCH" /></th>
        <th colSpan={4}></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>APPL</td>
        <td>Apple Inc.</td>
        <td className="text-success">+0.15%</td>
        <td className="text-success">+0.09%</td>
        <td className="text-danger">-0.25%</td>
        <td><Button size="sm" variant="outline-primary">DETAILS</Button></td>
      </tr>
      <tr>
        <td>EUR - USD</td>
        <td>Euro - United State</td>
        <td className="text-danger">-0.32%</td>
        <td className="text-danger">-0.36%</td>
        <td className="text-danger">-0.79%</td>
        <td><Button size="sm" variant="outline-primary">DETAILS</Button></td>
      </tr>
    </tbody>
  </Table>
);

export default TickerTable; 