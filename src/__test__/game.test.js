import React from 'react';
import ReactDOM from 'react-dom';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { shallow } from 'enzyme';
import {render, cleanup} from '@testing-library/react'

import Board from '../board';
import Game from '../game';


Enzyme.configure({ adapter: new Adapter() });

afterEach(cleanup);
it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Game />, div);
})

describe("tast Game component", () => {
  let testGame;

  beforeEach(() => {
    testGame = shallow(<Game />);
  });


  it('initially bestscore equals 0', () => {
     expect(testGame.state('bestscore')).toEqual(0);
  });
  
  it('state board is a Board object', () => {
     expect(testGame.state('board').constructor.name).toEqual('Board');
  });

  it('initially board has only one tile', () => {
    let testBoard = testGame.state('board');
    let expected = [...Array(4)].map(x=>Array(4).fill(0));
    let index;
    let testCells = testBoard.cells.map(function(subarray, row) {
      return subarray.map(function(tile, col) {
        if(tile.value !== 0){
          index = [row, col, tile.value];
        }
        return tile.value;
      })
    })

    expected[index[0]][index[1]] = index[2];

    expect(testCells).toEqual(expected);
 });
})