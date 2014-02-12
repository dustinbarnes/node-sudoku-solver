var fs = require("fs");

require("sugar");

function permute(a, b) {
	var result = [];
	a.each(function(a1) {
		b.each(function(b1) {
			result.push("" + a1 + b1);
		});
	});
	return result;
}

var length = function(a) { return a.length };

var digits = Number.range(1, 9).every();
var rows = String.range('A', 'I').every();
var cols = String.range('1', '9').every();
var cells = permute(rows, cols);

var columnBlocks = [];
rows.each(function(row) { 
	columnBlocks.push(permute([row], cols));
});	

var rowBlocks = [];
cols.each(function(col) {
	rowBlocks.push(permute(rows, [col]));
});

var squareBlocks = [];
cols.inGroupsOf(3).each(function(colBlock) {
	rows.inGroupsOf(3).each(function(rowBlock) {
		squareBlocks.push(permute(rowBlock, colBlock));
	});
});

// Track the map of cell -> list(block) for inspecting group conditions
var groups = Object.extended({});

// Now let's create a map of cell -> peers for elimination purposes
var peers = Object.extended({});


cells.each(function(cell) {
	var has = function(n) { return n.indexOf(cell) !== -1 };

	groups[cell] = [columnBlocks.findAll(has).flatten(), 
		rowBlocks.findAll(has).flatten(), 
		squareBlocks.findAll(has).flatten()
	];

	peers[cell] = groups[cell].flatten().exclude(cell);
});

function getColumnWidth(b) {
	return 1 + b.values().map('length').max();
}

function getRowSeparator(b) {
	var width = getColumnWidth(b);
	var segment = '-'.repeat(width * 3);
	var line = segment + '+' + segment + '+' + segment;
	return line;
}

function display(b) {
	var width = getColumnWidth(b);
	var rowSeparator = getRowSeparator(b) + "\n";
	var displayed = "";

	rows.each(function (row) {
		cols.each( function(col) {
			displayed += b[row + col].join("").pad(width);

			if ( col.has(/[36]/) ) displayed += '|';
		});
		displayed += "\n";
		
		if ( row.has(/[CF]/) ) displayed += rowSeparator;
	});

	console.log(displayed);
}

function eliminate(b, cellKey, value) {
	// If it's not there, we've already eliminated it.
	if ( b[cellKey].indexOf(value) === -1 ) return true;

	var val = b[cellKey] = b[cellKey].exclude(value);

	// If length == 0, then this puzzle is invalid.
	if ( val.length === 0 ) return false;

	// If length == 1, then this is the last value,
	// so we remove it from all the peers of this cell
	var response = [];

	if ( val.length === 1 ) {
		peers[cellKey].each(function(it) {
			response.push(eliminate(b, it, val[0]));
		});
	}

	if ( !response.all(function(it) {return it !== false}) )
		return false;

	for ( group in groups[cellKey] ) {
		var places = groups[cellKey][group].filter(function(it){ return b[it].indexOf(value) !== -1});
		if ( places.length == 0 )
			return false;
		else if ( places.length === 1 )
			if ( !set(b, places[0], value) )
				return false;
	}

	return true;
}

function set(b, cellKey, value) {
	var others = b[cellKey].exclude(value);
	var results = []

	others.each(function(it) {
		results.push(eliminate(b, cellKey, it));
	});

	return results.all(function(it) {return it !== false});
}

function createBoard() {
	var board = Object.extended({});
	cells.each(function(cell) {
		board[cell] = digits;
	});
	return board;
}

function populate(input) {
	var board = createBoard();

	cells.zip(input.split('')).each(function(known) {
		var cell = known[0], value = known[1];
		if ( value !== '.' ) {
			set(board, cell, parseInt(value));	
		}
	});

	return board;
}


function copy(obj) {
	// Surprisingly, this is one of the fastest methods of deep-cloning an object.
	return Object.extended(JSON.parse(JSON.stringify(obj)));
}

function solve(board, i) {
	// Check if puzzle is invalid
	if ( !board )
		return false;

	// See if puzzle has invalid (empty) spots
	if ( !board.all(function(it) {return board[it].length > 0}) )
		return false;

	// See if puzzle is solved?
	if ( board.all(function(it) {return board[it].length == 1}) )
		return board;

	// Let's find any cell with the fewest options.
	var cell = Object.extended(board.map(function(a, b) { return b.length == 1 ? 99 : b.length })).min();

	var results = [];

	// Try them all! :)
	for ( var iCell = 0; iCell < board[cell].length; iCell++ )
	{
		var _board = copy(board);
		if ( set(_board, cell, board[cell][iCell]) !== false ) {
			var result = solve(_board, i+1);
			if ( result )
				return result;	
		}
	}

	return false;
}

function run(line) {
	console.log("Puzzle: " + line);	
		
	var board = populate(line);
	console.log("After placement, before solving: ");
	display(board);
	
	board = solve(board, 0);
	console.log("Solved: ");
	display(board);

	console.log("");	
}

function runFile(name) {
	console.log("Running File: " + name);
	var input = fs.readFileSync('./puzzles/' + name + '.txt', 'utf8');
	input.lines(function(line) {
		run(line);
	});
}

['easy', 'hard', 'hardest'].each(runFile);
