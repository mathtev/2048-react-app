import React from 'react';
import ReactDOM from 'react-dom';
import './style/main.scss';
import Board from './board';



class TileView extends React.Component {
	render(){
		let classArray = ['tile'];
		classArray.push('position-'+this.props.positionRow+'-'+this.props.positionColumn);
		classArray.push('tile-'+this.props.value);
		if (this.props.hasMoved) {
			classArray.push('from-to-row-'+this.props.positionOldRow+'-'+this.props.positionRow);
			classArray.push('from-to-column-'+this.props.positionOldColumn+'-'+this.props.positionColumn);
			classArray.push('has-moved');
		}
		if (this.props.isNew === true) {
			classArray.push('new-tile');
		}
		if (this.props.justUpdated === true) {
			classArray.push('upper-tile');
		}
		let classnames = classArray.join(' ');
		return (
			<div className={classnames}>
				<p>{this.props.value}</p>
			</div>
		);
	}
}

class ScoreView extends React.Component {
	render(){
		return(
			<div className='score'>
				<div><h2>BEST</h2><h1>{this.props.bestscore}</h1></div>
				<div><h2>SCORE</h2><h1>{this.props.score}</h1></div>
			</div>
		 );
	}
}

function Restart(props) {
	if(props.board.hasLost){
		return(
			<div className='lost'>
				<h3>Game Over!</h3>
				<p>Score {props.board.score}</p>
				<button type='button' className='tryagainBtn' onClick={props.onClick}>Try Again</button>
			</div>
		);
	} else {
		return null;
	}
}

class BoardView extends React.Component {

	makeRow(size){
		var row = [];
		for (var i = 0; i < size; i++) {
			row.push(<div className='cell' key={i}></div>);
		}
		return row;
	}

	makeBoard(dim){
		var theBoard = [];
		for (var i = 0; i < dim; i++) {
			theBoard.push(<div className='board-row' key={i}>{this.makeRow(dim)}</div>);
		}
		return theBoard;
	}

	render(){
		let tiles = this.props.board.tiles
					.filter(tile => tile.value !==0)
					.map(tile => <TileView value={tile.value} 
											key={tile.id} 
											positionRow={tile.row} 
											positionColumn={tile.column} 
											positionOldRow={tile.oldrow} 
											positionOldColumn={tile.oldcolumn} 
											hasMoved={tile.hasMoved()}
											isNew={tile.isNew}
											justUpdated={tile.justUpdated}/>);
		return(
			<div className='game-board'>
				{this.makeBoard(this.props.board.dim)}
				{tiles}
			</div>
		);
	}
}
 
class Game extends React.Component {
	constructor(props){
		super(props);
		this.state = {board: new Board(),
					  bestscore: 0};

		this.inputDim = this.state.board.dim;

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	restartGame(){
		this.setState({board: new Board(this.inputDim)});
	}

	handleKeyDown(event){
		 if(this.state.board.hasLost){
			return;
		}
		//37left 38up 39right 40down
		if(event.keyCode >= 37 && event.keyCode <= 40){
			event.preventDefault();
			let direction = event.keyCode - 37;
			this.setState({board: this.state.board.move(direction)});
		}
		if(this.state.board.score > this.state.bestscore){
			this.setState({bestscore: this.state.board.score});
		}
	}
	componentDidMount(){
		window.addEventListener('keydown', this.handleKeyDown.bind(this));
	}
	componentWillUnmount(){
		window.removeEventListener('keydown', this.handleKeyDown.bind(this));
	}

	handleChange(event) {
		this.inputDim = event.target.value;
		if (this.inputDim > this.state.board.maxDim || this.inputDim < this.state.board.minDim || !Number.isInteger(+this.inputDim))
			this.inputDim = 4;
	}

	handleSubmit(event) {
		event.preventDefault();
		this.setState({board: new Board(this.inputDim)});
	}

	render(){
		return(
			<div className='game'>
				<div className="change-dim">
					<p>In order to change board dimension:</p>
					<ul>
						<li>go to _config.scss and change $board-dim variable (min 2 max 30) and save file</li>
						<li>Write dimension in form and press submit</li>
						<li>You can also change $board-size variable</li>
					</ul>
					<form onSubmit={this.handleSubmit}>
						<label>
							Board dimension:
							<input type='text' onChange={this.handleChange} />
						</label><br />
						<input type="submit" value="Submit" />
					</form>
				</div>
				<div className="score-and-logo">
					<div className='logo'><h1>2048</h1></div>
					<ScoreView score={this.state.board.score} bestscore={this.state.bestscore}/>
				</div>
				<button className='restartBtn' type='button' onClick={this.restartGame.bind(this)}>Restart</button>
				<p>Use the <b>arrow keys</b> to move the tiles and get a <b>2048</b>!</p>
				<BoardView board={this.state.board}/>
				<Restart board={this.state.board} onClick={this.restartGame.bind(this)} />
				<footer>
					<hr></hr>
					<p>Created by <b><i>Mateusz Rychlik</i></b></p>
					<p>Source code: <i></i></p>
				</footer>
			</div>
		);
	}
}

export default Game;