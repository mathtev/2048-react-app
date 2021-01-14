class Board {
  constructor(dim) {
    this.dim = dim || 4;
    this.maxDim = 30;
    this.minDim = 2;
    this.tiles = [];
    this.cells = this.createEmptyMatrix();
    this.fourProbability = 0.1;
    this.hasLost = false;
    this.score = 0;

    this.addNewTile();
  }

  setDim(val) {
    this.dim = val;
  }

  createTile(value, row, column) {
    let tile = !arguments.length ? new Tile(0, -1, -1) : new Tile(value, row, column);
    this.tiles.push(tile);
    return tile;
  }

  addNewTile() {
    let emptyCells = [];
    for (let i = 0; i < this.dim; ++i) {
      for (let j = 0; j < this.dim; ++j) {
        if (this.cells[i][j].value === 0) {
          emptyCells.push({
            r: i,
            c: j
          });
        }
      }
    }
    let randomIndex = Math.floor(Math.random() * emptyCells.length);
    let cell = emptyCells[randomIndex];
    let value = Math.random() < this.fourProbability ? 4 : 2;
    this.cells[cell.r][cell.c] = this.createTile(value, cell.r + 1, cell.c + 1);
  }

  //for tests only
  insertTile(row, col, value) {
    this.cells[row][col] = this.createTile(value, row + 1, col + 1);
  }
  //for tests only
  insertRow(idx, arr) {
    for (let i = 0; i < this.dim; i++) {
      this.cells[idx][i] = this.createTile(arr[i], idx + 1, i + 1);
    }
  }

  createEmptyRow() {
    let newRow = []
    for (let i = 0; i < this.dim; ++i) {
      newRow[i] = this.createTile();
    }
    return newRow;
  }

  createEmptyMatrix() {
    let newMatrix = []
    for (let i = 0; i < this.dim; ++i) {
      newMatrix[i] = this.createEmptyRow();
    }
    return newMatrix;
  }

  fillRowWithEmptyTiles(row, onBoard) {
    let toFill = this.dim - onBoard;
    for (let i = 0; i < toFill; i++) {
      row.push(this.createTile());
    }
    return row;
  }

  mergeTiles(tileStay, tileBye) {
    tileStay.value = tileStay.value * 2;
    tileStay.justUpdated = true;
    this.score += tileStay.value;
    tileBye.toBeRemoved = true;
    tileBye.justUpdated = false;
  }

  rotateLeft(matrix) {
    let rows = matrix.length;
    let columns = matrix[0].length;
    let newMatrix = [];

    for (let i = 0; i < rows; i++) {
      newMatrix[i] = [];
    }
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        newMatrix[rows - j - 1][i] = matrix[i][j];
      }
    }
    return newMatrix;
  }

  moveLeft(matrix) {
    let rows = matrix.length;
    let rowIndex = 0;
    let newMatrix = [];
    let removedTiles = [];

    for (let i = 0; i < rows; i++) {
      newMatrix[i] = [];
      removedTiles[i] = [];
    }

    for (let row of matrix) {
      row = row.filter(tile => tile.value !== 0);
      let noCells = row.length;
      if (noCells === 0) {
        row = this.createEmptyRow();
        newMatrix[rowIndex] = row;
        rowIndex++;
      } else if (noCells === 1) {
        row[0].column = 1;
        row[0].justUpdated = false;
        this.fillRowWithEmptyTiles(row, noCells);
        newMatrix[rowIndex] = row;
        rowIndex++;
      } else {
        let removeCount = 0;
        for (let i = 0; i < noCells - 1; i++) {
          if ((row[i].value === row[i + 1].value) && row[i].toBeRemoved === false) {
            this.mergeTiles(row[i], row[i + 1]);
            removedTiles[rowIndex][i - removeCount] = row[i + 1];
            removeCount++;
            i++;
          }
        }
        row = row.filter(tile => tile.toBeRemoved === false);
        this.fillRowWithEmptyTiles(row, noCells - removeCount);

        newMatrix[rowIndex] = row;
        rowIndex++;
      }
    }
    for (let i = 0; i < this.dim; i++) {
      for (let j = 0; j < this.dim; j++) {
        removedTiles[i][j] = removedTiles[i][j] || this.createTile();
      }
    }
    return [newMatrix, removedTiles];
  }

  updateOldPosition(matrix) {
    for (let row of matrix) {
      for (let tile of row) {
        if (tile.value !== 0) {
          tile.oldrow = tile.row;
          tile.oldcolumn = tile.column;
          tile.isNew = false;
        }
      }
    }
  }

  updatePosition(matrix) {
    for (let row of matrix) {
      for (let tile of row) {
        if (tile.value !== 0) {
          tile.row = matrix.indexOf(row) + 1;
          tile.column = row.indexOf(tile) + 1;
        }
      }
    }
  }

  removeOldTiles(tiles) {
    this.tiles = this.tiles.filter(tile => tile.value !== 0)
      .filter(tile => tile.toBeRemoved === false);
  }

  canMoveLeft(newTiles) {
    for (let row of newTiles) {
      for (let i = 0; i < this.dim - 1; i++) {
        if ((row[i].value === 0 && row[i + 1].value !== 0) ||
          ((row[i].value === row[i + 1].value) && (row[i].value !== 0))) {
          return true;
        }
      }
    }
    return false;
  }

  move(direction) {
    //0-left 1-up 2-right 3-down
    let removedTiles;
    this.hasLost = true;
    this.removeOldTiles();
    this.updateOldPosition(this.cells);

    for (let i = 0; i < direction; i++) {
      this.cells = this.rotateLeft(this.cells);
      if (this.canMoveLeft(this.cells)) {
        this.hasLost = false;
      }
    }
    let canMove = this.canMoveLeft(this.cells);
    if (canMove) {
      [this.cells, removedTiles] = [...this.moveLeft(this.cells)];
    }
    for (let i = 0; i < 4 - direction; i++) {
      this.cells = this.rotateLeft(this.cells);
      if (canMove) {
        removedTiles = this.rotateLeft(removedTiles);
      }
      if (this.canMoveLeft(this.cells)) {
        this.hasLost = false;
      }
    }
    if (canMove) {
      this.addNewTile();
      this.updatePosition(this.cells);
      this.updatePosition(removedTiles);
    }
    return this;
  }
}

let id = 0;
class Tile {
  constructor(value, row, column) {
    this.id = id++;
    this.value = value;
    this.row = row;
    this.column = column;
    this.oldrow = -1;
    this.oldcolumn = -1;
    this.isNew = true;
    this.toBeRemoved = false;
    this.justUpdated = false;
  }

  hasMoved() {
    return (this.oldrow !== -1) && ((this.oldrow !== this.row) || (this.oldcolumn !== this.column));
  }
}

export default Board;