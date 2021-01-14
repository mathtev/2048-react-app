import React from 'react';
import ReactDOM from 'react-dom';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import { shallow } from 'enzyme';
import { render, cleanup } from '@testing-library/react'

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
  let testBoard;

  //initial board
  beforeEach(() => {
    testGame = shallow(<Game />);
    testBoard = testGame.state('board');
    testBoard.cells = testBoard.createEmptyMatrix();
    testBoard.insertTile(1, 1, 2);
  });


  it('initially bestscore equals 0', () => {
    expect(testGame.state('bestscore')).toEqual(0);
  });

  it('state board is a Board object', () => {
    expect(testGame.state('board').constructor.name).toEqual('Board');
  });

  it('initially board has only one tile', () => {
    let expected = [...Array(4)].map(x => Array(4).fill(0));
    let index;
    let testCells = testBoard.cells.map(function (subarray, row) {
      return subarray.map(function (tile, col) {
        if (tile.value !== 0) {
          index = [row, col, tile.value];
        }
        return tile.value;
      })
    })

    expected[index[0]][index[1]] = index[2];

    expect(testCells).toEqual(expected);
  });

  describe('board move', () => {
    beforeEach(() => {
      testGame = shallow(<Game />);
      testBoard = testGame.state('board');
      testBoard.cells = testBoard.createEmptyMatrix();

      testBoard.insertRow(0, [0, 2, 2, 4]);
      testBoard.insertRow(1, [2, 2, 2, 2]);
      testBoard.insertRow(2, [2, 8, 4, 16]);
      testBoard.insertRow(3, [0, 0, 0, 2]);
    });

    it('move left', () => {
      testBoard.cells = testBoard.moveLeft(testBoard.cells)[0];
      let testCells = testBoard.cells.map(function (subarray) {
        return subarray.map(function (tile) {
          return tile.value;
        })
      })
      expect(testCells).toEqual([[4, 4, 0, 0], [4, 4, 0, 0], [2, 8, 4, 16], [2, 0, 0, 0]]);
    });

    it('move up', () => {
      testBoard.cells = testBoard.rotateLeft(testBoard.cells);
      testBoard.cells = testBoard.moveLeft(testBoard.cells)[0];
      let testCells = testBoard.cells.map(function (subarray) {
        return subarray.map(function (tile) {
          return tile.value;
        })
      })
      expect(testCells).toEqual([[4, 2, 16, 2], [4, 4, 0, 0], [4, 8, 0, 0], [4, 0, 0, 0]]);
    });

    it('move right', () => {
      testBoard.cells = testBoard.rotateLeft(testBoard.cells);
      testBoard.cells = testBoard.rotateLeft(testBoard.cells);
      testBoard.cells = testBoard.moveLeft(testBoard.cells)[0];
      let testCells = testBoard.cells.map(function (subarray) {
        return subarray.map(function (tile) {
          return tile.value;
        })
      })
      expect(testCells).toEqual([[2, 0, 0, 0], [16, 4, 8, 2], [4, 4, 0, 0], [4, 4, 0, 0]]);
    });

    it('move down', () => {
      testBoard.cells = testBoard.rotateLeft(testBoard.cells);
      testBoard.cells = testBoard.rotateLeft(testBoard.cells);
      testBoard.cells = testBoard.rotateLeft(testBoard.cells);
      testBoard.cells = testBoard.moveLeft(testBoard.cells)[0];
      let testCells = testBoard.cells.map(function (subarray) {
        return subarray.map(function (tile) {
          return tile.value;
        })
      })
      expect(testCells).toEqual([[4, 0, 0, 0], [8, 4, 0, 0], [4, 4, 0, 0], [2, 16, 2, 4]]);
    });
  });

  it('cannot move, game is over', () => {
    testBoard.insertRow(0, [2, 4, 2, 4]);
    testBoard.insertRow(1, [4, 2, 4, 2]);
    testBoard.insertRow(2, [2, 8, 32, 16]);
    testBoard.insertRow(3, [16, 2, 4, 8]);

    testBoard.move(0);
    expect(testBoard.hasLost).toEqual(true);
  });
})
 