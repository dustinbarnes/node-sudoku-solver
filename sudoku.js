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

// Let's create a virtual board with all cells open and available
var board = Object.extended({});
cells.each(function(cell) {
	board[cell] = digits;
});

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

// Now let's create a map of cell -> peers for elimination purposes
var peers = Object.extended({});
cells.each(function(cell) {
	var has = function(n) { return n.indexOf(cell) !== -1 };

	peers[cell] = [columnBlocks.findAll(has), 
		rowBlocks.findAll(has), 
		squareBlocks.findAll(has)
	].flatten().exclude(cell);
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

function join(list, sep) {
	var result = '';

	list.each(function (item) {
		if ( result != '' ) result += sep;
		result += item;
	});

	return result;
}

function display(b) {
	var width = getColumnWidth(b);
	var rowSeparator = getRowSeparator(b) + "\n";
	var displayed = "";

	rows.each(function (row) {
		cols.each( function(col) {
			displayed += join(b[row + col], "").pad(width);

			if ( col.has(/[36]/) ) displayed += '|';
		});
		displayed += "\n";
		
		if ( row.has(/[CF]/) ) displayed += rowSeparator;
	});

	console.log(displayed);
}

function set(b, cellKey, value) {
	var cell = board[cellKey];
	var remaining = .exclude(value);
	console.log(cellKey, value, cell);

}

function populate(b, input) {
	cells.zip(input.split('')).each(function(known) {
		var cell = known[0], value = known[1];
		if ( value !== '.' ) {
			set(b, cell, value);	
		}
	});
	return b;
}

display(board);

// Test simple visualization
var input = fs.readFileSync('./puzzles/single.txt', 'utf8');
console.log("Input: " + input);

display(populate(board, input));



