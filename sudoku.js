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
})

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

display(board);
/*
	var width = getColumnWidth(board);
    var line = _.times('+'.join(['-'*(width*3)]*3)
    for r in rows:
        print ''.join(values[r+c].center(width)+('|' if c in '36' else '')
                      for c in cols)
        if r in 'CF': print line
    print
}

exports.display(board);

console.log(board);
/**/

// Test simple visualization
var input = fs.readFileSync('./puzzles/single.txt')
console.log("input: " + input);



