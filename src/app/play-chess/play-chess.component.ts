import { Component, OnInit } from '@angular/core';

interface Cell {
  basicClasses: string;
  id: string;
}

type Figure = 'wkorol' | 'wferz' | 'woficer' | 'wkon' | 'wtura' | 'wpeska' | 'bkorol' | 'bferz' | 'boficer' | 'bkon' | 'btura' | 'bpeska';

@Component({
  selector: 'play-chess',
  templateUrl: './play-chess.component.html',
  styleUrls: ['./play-chess.component.scss']
})
export class PlayChessComponent implements OnInit {
  selectedCell?: Cell;
  selectedFigure?: Figure;
  color = 'w';
  turn: 'w' | 'b' = 'w';
  message = '';
  marked: string[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  handleCellClick(targetCell: Cell) {
    const figureOnCell: Figure = this.playMap[targetCell.id];
    const isCellTakenByCurrentTurnPlayer = this.isCellTakenByCurrentTurnPlayer(targetCell);
    if (isCellTakenByCurrentTurnPlayer) {
        this.selectCell(targetCell, figureOnCell);
    } 
    if (this.selectedFigure && !isCellTakenByCurrentTurnPlayer) {
      const isLegalGo = this.isLegal(this.selectedFigure as Figure, this.selectedCell as Cell, targetCell);
      if (isLegalGo) {
        this.move(targetCell);
      } else {
        this.clearSelection();
      }
    }
  }

  isLegal(figure: Figure, selectedCell: Cell, targetCell: Cell): boolean {
    const horDiff = this.getCellsHorizontalDifference(selectedCell, targetCell);
    const verDiff = this.getCellsVerticalDifference(selectedCell, targetCell);
    const isOpponentsTurn = this.isOpponentsTurn();
    const isCellTakenByOppositePlayer = this.isCellTakenByOppositePlayer(targetCell);
    const currPos = selectedCell.id;
    const currPosY = +currPos.substr(1);

    if (this.isCellTakenByCurrentTurnPlayer(targetCell) || (figure !== 'bkon' && figure !== 'wkon' && !this.isThePathFree(selectedCell, targetCell)) || this.isGoCompromiseKing()) {
      return false;
    }
    switch (figure) {
      case 'wpeska':
      case 'bpeska':
        const vConstr = currPosY === 7 || currPosY === 2 ? 3 : 2;
        if (Math.abs(horDiff) === 1 && isCellTakenByOppositePlayer) {
          if (verDiff === 1 && isOpponentsTurn || verDiff === -1 && !isOpponentsTurn) {
            return true;
          }
        }
        if (isCellTakenByOppositePlayer) {
          if (horDiff === 0) {
            return false;
          }
        } else {
          if (isOpponentsTurn) {
            return verDiff > 0 && verDiff < vConstr && (horDiff === 0);
          } else {
            return verDiff < 0 && verDiff > -vConstr && (horDiff === 0);
          }
        }
        return false;
        
        break;
      case 'wkon':
      case 'bkon':
        const shiftCode = `${Math.abs(horDiff)}${Math.abs(verDiff)}`;
        return shiftCode === '12' || shiftCode === '21';
        break;
      case 'wtura':
      case 'btura':
        return verDiff === 0 || horDiff === 0;
      case 'woficer':
      case 'boficer':
        return Math.abs(verDiff) === Math.abs(horDiff);
      case 'wferz':
      case 'bferz':
        return verDiff === 0 || horDiff === 0 || Math.abs(verDiff) === Math.abs(horDiff);
      case 'wkorol':
      case 'bkorol':
        return Math.abs(verDiff) < 2 && Math.abs(horDiff) < 2;
      default:
        return false;
    }
  }

  getCellsVerticalDifference(aCell: Cell, bCell: Cell): number {
    return (+aCell.id.substr(1)) - (+bCell.id.substr(1));
  }

  getCellsHorizontalDifference(aCell: Cell, bCell: Cell): number {
    const alphas = 'abcdefgh';
    return alphas.indexOf(aCell.id.substr(0,1)) - alphas.indexOf(bCell.id.substr(0,1));
  }

  isCellTaken(cell: Cell): boolean {
    return !!this.playMap[cell.id];
  }

  isCellTakenByOpponent(cell: Cell) {
    const figure = this.playMap[cell.id];
    return figure && figure.substr(0,1) !== this.color;
  }


  isCellTakenByCurrentTurnPlayer(cell: Cell): boolean {
    const figure = this.playMap[cell.id];
    return figure && figure.substr(0,1) === this.turn; 
  }

  isCellTakenByOppositePlayer(cell: Cell) {
    const figure = this.playMap[cell.id];
    return figure && figure.substr(0,1) !== this.turn; 
  }

  isCellTakenByMe(cell: Cell) {
    const figure = this.playMap[cell.id];
    return figure && figure.substr(0,1) === this.color;
  }

  isOpponentsTurn(): boolean {
    return this.color !== this.turn;
  }

  selectCell(cell: Cell, figure: Figure) {
    this.selectedFigure = figure;
    this.selectedCell = cell;
  }

  move(cell: Cell) {
    if (['wpeska', 'bpeska'].includes(this.selectedFigure as Figure) && ['1', '8'].includes(cell.id.split('')[1])) {
      this.playMap[cell.id] = this.selectedFigure?.replace('peska', 'ferz') as Figure;
    } else {
      this.playMap[cell.id] = this.selectedFigure as Figure;
    }
    delete this.playMap[(this.selectedCell as Cell).id];
    this.clearSelection();
    this.turn = this.turn === 'w' ? 'b' : 'w';

    setTimeout(this.turnOver.bind(this), 1000);
  }

  clearSelection() {
    this.selectedFigure = undefined;
    this.selectedCell = undefined;
  }

  isThePathFree(aCell: Cell, bCell: Cell): boolean {
    let iteratorConstraint = 0;
    let kingStep = this.stepLikeAKing(aCell, bCell);
    while (kingStep !== bCell && !this.playMap[kingStep.id] && iteratorConstraint <= 8) {
      kingStep = this.stepLikeAKing(kingStep, bCell);
      iteratorConstraint++;
    }

    return kingStep === bCell;
  }

  stepLikeAKing(aCell: Cell, bCell: Cell): Cell {
    const axy = aCell.id.split('').map(it => {
      return 'abcdefgh'.includes(it) ? 'abcdefgh'.indexOf(it) : +it;
    });
    const bxy = bCell.id.split('').map(it => {
      return 'abcdefgh'.includes(it) ? 'abcdefgh'.indexOf(it) : +it;
    });
    const cxy = bCell.id.split('');

    if (axy[0] < bxy[0]) {
      cxy[0] = 'abcdefgh'.charAt(axy[0] + 1);
    }
    if (axy[0] > bxy[0]) {
      cxy[0] = 'abcdefgh'.charAt(axy[0] - 1);
    }
    if (+axy[1] < +bxy[1]) {
      cxy[1] = `${+axy[1] + 1}`;
    }
    if (+axy[1] > +bxy[1]) {
      cxy[1] = `${+axy[1] - 1}`;
    }

    return this.cells.find(item => item.id === cxy[0] + cxy[1]) as Cell;
  }

  isGoCompromiseKing(): boolean {
    return false;
  }

  playMap: {[key: string]: Figure} = {
    "a8": "btura",
    b8: 'bkon',
    c8: 'boficer',
    d8: 'bferz',
    e8: 'bkorol',
    f8: 'boficer',
    g8: 'bkon',
    h8: 'btura',

    a7: 'bpeska',
    b7: 'bpeska',
    c7: 'bpeska',
    d7: 'bpeska',
    e7: 'bpeska',
    f7: 'bpeska',
    g7: 'bpeska',
    h7: 'bpeska',

    a2: 'wpeska',
    b2: 'wpeska',
    c2: 'wpeska',
    d2: 'wpeska',
    e2: 'wpeska',
    f2: 'wpeska',
    g2: 'wpeska',
    h2: 'wpeska',

    a1: 'wtura',
    b1: 'wkon',
    c1: 'woficer',
    d1: 'wferz',
    e1: 'wkorol',
    f1: 'woficer',
    g1: 'wkon',
    h1: 'wtura',
  };

  turnOver() {
    const turned = [];
    let counter = this.cells.length;
    while (counter--) {
      turned.push(this.cells[counter]);
    }
    this.cells = turned;
  }

  cells: Cell[] = [
    { basicClasses: 'cell w ', id: 'a8' },
    { basicClasses: 'cell b ', id: 'b8' },
    { basicClasses: 'cell w ', id: 'c8' },
    { basicClasses: 'cell b ', id: 'd8' },
    { basicClasses: 'cell w ', id: 'e8' },
    { basicClasses: 'cell b ', id: 'f8' },
    { basicClasses: 'cell w ', id: 'g8' },
    { basicClasses: 'cell b ', id: 'h8' },

    { basicClasses: 'cell b ', id: 'a7' },
    { basicClasses: 'cell w ', id: 'b7' },
    { basicClasses: 'cell b ', id: 'c7' },
    { basicClasses: 'cell w ', id: 'd7' },
    { basicClasses: 'cell b ', id: 'e7' },
    { basicClasses: 'cell w ', id: 'f7' },
    { basicClasses: 'cell b ', id: 'g7' },
    { basicClasses: 'cell w ', id: 'h7' },

    { basicClasses: 'cell w ', id: 'a6' },
    { basicClasses: 'cell b ', id: 'b6' },
    { basicClasses: 'cell w ', id: 'c6' },
    { basicClasses: 'cell b ', id: 'd6' },
    { basicClasses: 'cell w ', id: 'e6' },
    { basicClasses: 'cell b ', id: 'f6' },
    { basicClasses: 'cell w ', id: 'g6' },
    { basicClasses: 'cell b ', id: 'h6' },

    { basicClasses: 'cell b ', id: 'a5' },
    { basicClasses: 'cell w ', id: 'b5' },
    { basicClasses: 'cell b ', id: 'c5' },
    { basicClasses: 'cell w ', id: 'd5' },
    { basicClasses: 'cell b ', id: 'e5' },
    { basicClasses: 'cell w ', id: 'f5' },
    { basicClasses: 'cell b ', id: 'g5' },
    { basicClasses: 'cell w ', id: 'h5' },

    { basicClasses: 'cell w ', id: 'a4' },
    { basicClasses: 'cell b ', id: 'b4' },
    { basicClasses: 'cell w ', id: 'c4' },
    { basicClasses: 'cell b ', id: 'd4' },
    { basicClasses: 'cell w ', id: 'e4' },
    { basicClasses: 'cell b ', id: 'f4' },
    { basicClasses: 'cell w ', id: 'g4' },
    { basicClasses: 'cell b ', id: 'h4' },

    { basicClasses: 'cell b ', id: 'a3' },
    { basicClasses: 'cell w ', id: 'b3' },
    { basicClasses: 'cell b ', id: 'c3' },
    { basicClasses: 'cell w ', id: 'd3' },
    { basicClasses: 'cell b ', id: 'e3' },
    { basicClasses: 'cell w ', id: 'f3' },
    { basicClasses: 'cell b ', id: 'g3' },
    { basicClasses: 'cell w ', id: 'h3' },

    { basicClasses: 'cell w ', id: 'a2' },
    { basicClasses: 'cell b ', id: 'b2' },
    { basicClasses: 'cell w ', id: 'c2' },
    { basicClasses: 'cell b ', id: 'd2' },
    { basicClasses: 'cell w ', id: 'e2' },
    { basicClasses: 'cell b ', id: 'f2' },
    { basicClasses: 'cell w ', id: 'g2' },
    { basicClasses: 'cell b ', id: 'h2' },

    { basicClasses: 'cell b ', id: 'a1' },
    { basicClasses: 'cell w ', id: 'b1' },
    { basicClasses: 'cell b ', id: 'c1' },
    { basicClasses: 'cell w ', id: 'd1' },
    { basicClasses: 'cell b ', id: 'e1' },
    { basicClasses: 'cell w ', id: 'f1' },
    { basicClasses: 'cell b ', id: 'g1' },
    { basicClasses: 'cell w ', id: 'h1' },
  ];

}
