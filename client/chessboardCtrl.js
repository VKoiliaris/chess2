angular.module('chess2').controller('ChessboardCtrl', ['$scope', '$meteor',
	function($scope, $meteor){
    	$scope.boards = $meteor.collection(Chessboards);
        $scope.rows = [0, 1, 2, 3, 4, 5, 6, 7];
        $scope.columns = [0, 1, 2, 3, 4, 5, 6, 7];
        $scope.moveFromTo = [];
        $scope.appReady = false;
        $scope.whitePawnPromotion = false;
        $scope.blackPawnPromotion = false;


        	// --- whiteShort, whiteLong, blackShort, blackLong ---
        $scope.piecesImages = {
		  	'wr': '\u2656',
		  	'wn': '\u2658',
	  		'wb': '\u2657',
	  		'wq': '\u2655',
	  		'wk': '\u2654',
	  		'wp': '\u2659',
	  		'bp': '\u265F',
	  		'br': '\u265C',
	  		'bn': '\u265E',
	  		'bb': '\u265D',
	  		'bq': '\u265B',
	  		'bk': '\u265A',
	  		'': ' ',
	  		'g': ' '
	  	};
	  	// --- View Methods ---
	  	$scope.init = function(){
	  		$scope.currentBoard = _.last($scope.boards).board;
	  		$scope.castling = _.last($scope.boards).castlingStatus;
	  		$scope.appReady = true;
	  	};

	  	$scope.promote = function(promotedTo){
	  		$scope.board =  _.last($scope.boards).board;
	  		if (promotedTo[0] === 'w'){
	  			$scope.board[7][_.indexOf($scope.board[7], 'wp')] = promotedTo;
	  			$scope.whitePawnPromotion = false;
	  		} else if (promotedTo[0] === 'b'){
	  			$scope.board[0][_.indexOf($scope.board[0], 'bp')] = promotedTo;
	  			$scope.blackPawnPromotion = false;
	  		}
	  		$scope.currentBoard = $scope.board;
	  	};

	  	$scope.images = function(row, column){
	  		if ($scope.appReady){
	  			return $scope.piecesImages[$scope.currentBoard[row][column]];
	  		}
	  	};

	  	$scope.newGame = function(){
	  		Meteor.call('restart' );
	  		$scope.currentBoard = _.last($scope.boards).board;
	  		$scope.castling = _.last($scope.boards).castlingStatus;
	  	};

	  	$scope.unDo = function(){
	  		Meteor.call('unDo', _.last($scope.boards)._id );
	  		$scope.currentBoard = _.last($scope.boards).board;
	  		$scope.castling = _.last($scope.boards).castlingStatus;
	  	};

	  	$scope.whiteTurn = function(pieceSide){
       		return ((((($scope.boards.length-1) % 2) === 0) && (pieceSide === 'w')) || (((($scope.boards.length-1) % 2) !== 0) && (pieceSide === 'b')));
       	};

		$scope.interactWithBoard = function(row, column){
			$scope.currentBoard = $scope.removeGhosts($scope.currentBoard[2], $scope.currentBoard[5], $scope.currentBoard);
			$scope.moveFromTo.push({square:$scope.currentBoard[row][column], row: row, column: column });
	  		if (!$scope.moveFromTo[0].square.length){
	  			$scope.moveFromTo = [];
	  			return;
	  		}
	  		$scope.chosen = true;
	  		$scope.chosenRow = row;
	  		$scope.chosenColumn = column;
	  		if ($scope.moveFromTo.length === 2){
	  			if (($scope.moveFromTo[0] === $scope.moveFromTo[1]) || ($scope.moveFromTo[0].square[0] === $scope.moveFromTo[1].square[0])){
	  				$scope.moveFromTo = [];
		  			$scope.chosen = false;
		  			return;
	  			}
	  			if($scope.whiteTurn($scope.moveFromTo[0].square[0])){
		  			$scope.newMove = $scope.updateTemporaryBoard($scope.moveFromTo[0].square, $scope.moveFromTo[0].row,  $scope.moveFromTo[0].column, $scope.moveFromTo[1].square, $scope.moveFromTo[1].row,  $scope.moveFromTo[1].column, $scope.currentBoard);
		  			if (($scope.move($scope.moveFromTo[0].square, $scope.moveFromTo[0].row,  $scope.moveFromTo[0].column, $scope.moveFromTo[1].square, $scope.moveFromTo[1].row,  $scope.moveFromTo[1].column, $scope.currentBoard))
		  				&& (!$scope.kThreatened($scope.moveFromTo[0].square, $scope.newMove, $scope.currentBoard))) {
		  				if (($scope.moveFromTo[0].square === 'wp') && ($scope.moveFromTo[1].row === 7)){
			  				$scope.whitePawnPromotion = true;
			  			}else if (($scope.moveFromTo[0].square === 'bp') && ($scope.moveFromTo[1].row === 0)){
			  				$scope.blackPawnPromotion = true;
			  			}
		  				$scope.cstl = $scope.specialMoves.castlingUpdate($scope.castling, $scope.moveFromTo[0].square, $scope.moveFromTo[0].column);
		  				$scope.newMove = $scope.removeGhosts($scope.newMove[2], $scope.newMove[5], $scope.newMove);
		  				$scope.boards.push({board:$scope.newMove, castlingStatus:$scope.cstl });
		  			}
	  			}
	  			$scope.currentBoard = _.last($scope.boards).board;
	  			$scope.castling = _.last($scope.boards).castlingStatus;
	  			$scope.moveFromTo = [];
	  			$scope.chosen = false;
	  			return;
	  		}
	  	};

	  	$scope.updateTemporaryBoard = function(squareFrom, startingRow, startingColumn, squareTo, endingRow, endingColumn, board){
	  		$scope.temporaryBoard = _.map(board, _.clone);
	  		$scope.temporaryBoard[endingRow][endingColumn] = $scope.temporaryBoard[startingRow][startingColumn];
	  		$scope.temporaryBoard[startingRow][startingColumn] = '';
	  		if ((squareFrom === 'wp') && (squareTo[1] === 'g')){
	  			$scope.temporaryBoard[4][endingColumn] = '';
	  		}else if ((squareFrom === 'bp') && (squareTo[1] === 'g')){
	  			$scope.temporaryBoard[3][endingColumn] = '';
	  		}
	  		if ((squareFrom[1] === 'k') &&  (endingColumn === startingColumn +2) && (endingRow === startingRow) ){
	  			if (squareFrom === 'wk'){
	  				$scope.temporaryBoard[0][7] = '';
	  				$scope.temporaryBoard[0][5] = 'wr';
	  			} else if (squareFrom === 'bk'){
	  				$scope.temporaryBoard[7][7] = '';
	  				$scope.temporaryBoard[7][5] = 'br';
	  			}
	  		} else if ((squareFrom[1] === 'k') &&  (endingColumn === startingColumn -2) && (endingRow === startingRow) ){
	  			if (squareFrom === 'wk'){
	  				$scope.temporaryBoard[0][0] = '';
	  				$scope.temporaryBoard[0][3] = 'wr';
	  			} else if (squareFrom === 'bk'){
	  				$scope.temporaryBoard[7][0] = '';
	  				$scope.temporaryBoard[7][3] = 'br';
	  			}
	  		}
	  		return $scope.temporaryBoard;
	  	};

	  	$scope.removeGhosts = function(whiteRow, blackRow, board){
	  		board[2][_.indexOf(whiteRow, 'wg' + ($scope.boards.length-1))] = '';
	  		board[5][_.indexOf(blackRow, 'bg' + ($scope.boards.length-1))] = '';
	  		return board;
		};

	  	$scope.move = function(squareFrom, startingRow, startingColumn, squareTo, endingRow, endingColumn, board, getLine){
	  		$scope.legalOrLine = false;
	  		if(squareFrom[0] === squareTo[0]){
	  			return $scope.legalOrLine;
	  		}

		//--- KNight moves ---
	  		if(_.last(squareFrom) === 'n'){
				$scope.legalOrLine = ((Math.abs(startingColumn - endingColumn) + Math.abs(startingRow - endingRow) === 3) && (Math.abs(startingColumn - endingColumn) < 3) && (Math.abs(startingRow - endingRow) < 3));
			  	return $scope.legalOrLine;
			}
		//--- Pawn moves ---
			if(_.last(squareFrom) === 'p'){
			  $scope.increament = 1;
			  if (squareFrom === 'bp'){$scope.increament = -1;}
			  if ((squareTo === '') && (startingColumn === endingColumn)){// if the new position is empty
			  	$scope.legalOrLine = ((endingRow === (startingRow + $scope.increament)) || ($scope.specialMoves.pawns(squareFrom, startingColumn, startingRow, endingRow, board)));
			  }else if ((squareTo[0] !== squareFrom[0]) && (squareTo !== '')){// if the square is occupied by a back piece
			  	$scope.legalOrLine = ((endingRow === (startingRow + $scope.increament)) && ((endingColumn === (startingColumn +1)) || (endingColumn ===(startingColumn -1))));
			  }
			  return $scope.legalOrLine;
			}
		// --- Rook moves ---
			if(_.last(squareFrom) === 'r'){
				if (startingRow === endingRow){
					$scope.legalOrLine = $scope.blockedMoves(0, false, startingRow, startingColumn, endingColumn, board, getLine);
				}else if (startingColumn === endingColumn){
					$scope.legalOrLine = $scope.blockedMoves(0, true, startingRow, startingColumn, endingRow, board, getLine);
				}
				return $scope.legalOrLine;
			}
		// --- Bishop moves ---
			if(_.last(squareFrom) === 'b'){
				if ((startingColumn - startingRow) === (endingColumn - endingRow)){
					$scope.legalOrLine = $scope.blockedMoves(1, undefined, startingRow, startingColumn, endingRow, board, getLine);
				}else if ((startingColumn + startingRow) === (endingColumn + endingRow)){
					$scope.legalOrLine = $scope.blockedMoves(-1, undefined, startingRow, startingColumn, endingRow, board, getLine);
			  	}
			    return $scope.legalOrLine;
			}
		// --- Queen moves ---
			if(_.last(squareFrom) === 'q'){
				if (startingRow === endingRow){
					$scope.legalOrLine = $scope.blockedMoves(0, false, startingRow, startingColumn, endingColumn, board, getLine);
				}else if (startingColumn === endingColumn){
					$scope.legalOrLine = $scope.blockedMoves(0, true, startingRow, startingColumn, endingRow, board, getLine);
				}else if ((startingColumn - startingRow) === (endingColumn - endingRow)){
					$scope.legalOrLine = $scope.blockedMoves(1, undefined, startingRow, startingColumn, endingRow, board, getLine);
				}else if ((startingColumn + startingRow) === (endingColumn + endingRow)){
			  		$scope.legalOrLine = $scope.blockedMoves(-1, undefined, startingRow, startingColumn, endingRow, board, getLine);
			  	}
			  	return $scope.legalOrLine;
			}
		// --- King moves ---
			if(_.last(squareFrom) === 'k'){
    			$scope.legalOrLine = ((Math.abs(endingColumn - startingColumn) <= 1) && (Math.abs(endingRow - startingRow) <= 1) || $scope.specialMoves.castling(squareFrom, startingRow, startingColumn, squareTo, endingRow, endingColumn, board));
    			return $scope.legalOrLine;
			}
	  	};
		    $scope.blockedMoves = function(index, verticalOrHorizontal, startingRow, startingColumn, finish, board, getLine){
	  		$scope.start = startingRow;
	  		$scope.line = [];
	  		if (verticalOrHorizontal === false){
	  			$scope.start = startingColumn;
	  		}
		    while (Math.abs($scope.start - finish) > 1) {
			    if ($scope.start > finish){
			        $scope.start--;
			        startingColumn = startingColumn - index;
			    }else{
			        $scope.start++;
			        startingColumn = startingColumn + index;
			    }
			    if (verticalOrHorizontal === false){
			    	$scope.line.push({piece: board[startingRow][$scope.start], row: startingRow, column: $scope.start});
			    }else {
			    	$scope.line.push({piece: board[$scope.start][startingColumn], row: $scope.start, column: startingColumn});
			    }
		    }
		    if (getLine){
				return $scope.line;
			}
			$scope.line = _.reject($scope.line, function(square){ return ((square.piece.length > 2) || (square.piece === ''));});
		//	console.log ($scope.line);
			return ($scope.line.length === 0);
	    };
			$scope.specialMoves = {
		  	pawns: function(pawn, startingColumn, startingRow, endingRow, board){
		  		if (pawn === 'wp'){
		  			if ((startingRow === 1) && (endingRow === 3) && ($scope.blockedMoves(0, true, startingRow, startingColumn, endingRow, board))){
		  				$scope.newMove[startingRow + 1][startingColumn] = 'wg' + ($scope.boards.length+1);
		  				return true;
		  			}
		  		}
		  		if (pawn === 'bp'){
		  			if ((startingRow === 6) && (endingRow === 4) && ($scope.blockedMoves(0, true, startingRow, startingColumn, endingRow, board))){
		  				$scope.newMove[startingRow - 1][startingColumn] = 'bg' + ($scope.boards.length+1);
		  				return true;
		  			}
		  		}
		  	},
		  	castlingUpdate: function(castlingStatus, piece, column){
		  		$scope.castlingCopy = _.clone(castlingStatus);
		  		if (piece === 'wk'){
		  			$scope.castlingCopy[0] = false;
		  			$scope.castlingCopy[1] = false;
		  		}else if ((piece === 'wr') && (column === 0)){
		  			$scope.castlingCopy[0] = false;
		  		}else if ((piece === 'wr') && (column === 7)){
		  			$scope.castlingCopy[1] = false;
		  		} else if (piece === 'bk'){
		  			$scope.castlingCopy[2] = false;
		  			$scope.castlingCopy[3] = false;
		  		}else if ((piece === 'br') && (column === 0)){
		  			$scope.castlingCopy[2] = false;
		  		}else if ((piece === 'br') && (column === 7)){
		  			$scope.castlingCopy[3] = false;
		  		}
		  		return $scope.castlingCopy;
		  	},
		  	castling: function(squareFrom, startingRow, startingColumn, squareTo, endingRow, endingColumn, board) {
		  		if ((endingRow === startingRow) && (Math.abs(endingColumn - startingColumn) === 2)){
		  			if((endingColumn > startingColumn) && (squareFrom === 'wk') && (squareTo === '') && !$scope.kThreatened(squareFrom, $scope.currentBoard) &&
		  			!$scope.kThreatened(squareFrom, $scope.updateTemporaryBoard(squareFrom, startingRow, startingColumn, squareTo, endingRow, (startingColumn+1), board) ) && !$scope.blockedMoves(0, false, startingRow, startingColumn, 7, board) ){
		  				return true;
		  			}else if((endingColumn < startingColumn) && (squareFrom === 'wk') && (squareTo === '') && !$scope.kThreatened(squareFrom, $scope.currentBoard) &&
		  			!$scope.kThreatened(squareFrom, $scope.updateTemporaryBoard(squareFrom, startingRow, startingColumn, squareTo, endingRow, (startingColumn-1), board) ) && !$scope.blockedMoves(0, false, startingRow, startingColumn, 0, board) ){
		  				return true;
		  			}else if((endingColumn > startingColumn) && (squareFrom === 'bk') && (squareTo === '') && !$scope.kThreatened(squareFrom, $scope.currentBoard) &&
		  			!$scope.kThreatened(squareFrom, $scope.updateTemporaryBoard(squareFrom, startingRow, startingColumn, squareTo, endingRow, (startingColumn+1), board) ) && !$scope.blockedMoves(0, false, startingRow, startingColumn, 7, board) ){
		  				return true;
		  			}else if((endingColumn < startingColumn) && (squareFrom === 'bk') && (squareTo === '') && !$scope.kThreatened(squareFrom, $scope.currentBoard) &&
		  			!$scope.kThreatened(squareFrom, $scope.updateTemporaryBoard(squareFrom, startingRow, startingColumn, squareTo, endingRow, (startingColumn-1), board) ) && !$scope.blockedMoves(0, false, startingRow, startingColumn, 0, board) ){
		  				return true;
		  			}else{
		  				return false;
		  			}
		  		}
			  	}
		};
		$scope.kThreatened = function(squareFrom, newBoard, board, row, column){
			$scope.white = (squareFrom[0] === 'w');
			$scope.threateningPieces = [];
			$scope.returnArray = false;
			if ($scope.white){
		    	$scope.king = 'wk';
		    	$scope.enemyKing = 'bk';
			    $scope.enemyBishop = 'bb';
			    $scope.enemyRook = 'br';
			    $scope.enemyQueen = 'bq';
			    $scope.enemyKnight = 'bn';
			    $scope.enemyPawn = 'bp';
			}else{
			    $scope.king = 'bk';
			    $scope.enemyKing = 'wk';
			    $scope.enemyBishop = 'wb';
			    $scope.enemyRook = 'wr';
			    $scope.enemyQueen = 'wq';
			    $scope.enemyKnight = 'wn';
			    $scope.enemyPawn = 'wp';
			}

			if (_.isUndefined(row) ){
			  // first we find the king
			    for (var i = 0; i < 8; i ++){
			    	for (var j = 0; j < 8; j ++){
			        	if (newBoard[i][j] === $scope.king){
			        		row = i;
			        		column = j;
			        	}
			    	}
			    }
			}else {
				$scope.king = newBoard[row][column];
			  	$scope.returnArray = true;
			}
			// and then we search for the enemy pieces and call their movements to check if they threaten the king
			for (var i = 0; i < 8; i ++){
			    for (var j = 0; j < 8; j ++){
			    	if ((newBoard[i][j] === $scope.enemyKing) && ($scope.move($scope.enemyKing, i, j, $scope.king, row, column, newBoard)) && (!$scope.returnArray)){
			        	$scope.threateningPieces.push({piece: $scope.enemyKing, row : i, column: j});
			    	}else if ((newBoard[i][j] === $scope.enemyQueen) && ($scope.move($scope.enemyQueen, i, j, $scope.king, row, column, newBoard))){
			    		$scope.threateningPieces.push({piece : $scope.enemyQueen, row : i, column: j});
			    	}else if ((newBoard[i][j] === $scope.enemyKnight) && ($scope.move($scope.enemyKnight, i, j, $scope.king, row, column, newBoard))){
			    		$scope.threateningPieces.push({piece : $scope.enemyKnight , row : i, column: j});
			    	}else if ((newBoard[i][j] === $scope.enemyRook) && ($scope.move($scope.enemyRook, i, j, $scope.king, row, column, newBoard))){
			     		$scope.threateningPieces.push({piece : $scope.enemyRook, row : i, column: j});
			    	}else if ((newBoard[i][j] === $scope.enemyBishop) && ($scope.move($scope.enemyBishop, i, j, $scope.king, row, column, newBoard))){
			      		$scope.threateningPieces.push({piece : $scope.enemyBishop, row : i, column: j});
			    	}else if ((newBoard[i][j] === $scope.enemyPawn) && ($scope.move($scope.enemyPawn, i, j, $scope.king, row, column, newBoard))){
			      		$scope.threateningPieces.push({piece : $scope.enemyPawn, row : i, column: j});
			    	}
			    }
			}
			if ($scope.returnArray){
			  	return $scope.threateningPieces;
			}
			if (($scope.threateningPieces.length > 0) && (board !== undefined)){
			  	return $scope.checkMate($scope.king, board, row, column, $scope.threateningPieces);
			}
				return ($scope.threateningPieces.length > 0);
		};

		$scope.checkMate = function (squareFrom, board, kingRow, kingColumn, enemyThreats){
			$scope.line = [];
			$scope.kingCanMove = false;
			$scope.kingCanBeProtected = false;
			for (var i = -1; i < 2; i++){
				for (var j = -1; j < 2; j++){
					if((kingRow+i > -1) && (kingRow+i < 8) && (kingColumn+i > -1) && (kingColumn+i < 8)){
						$scope.newBoard = $scope.updateTemporaryBoard(squareFrom, kingRow, kingColumn, board[kingRow+i][kingColumn+j], kingRow+i, kingColumn+j, board);
						if (($scope.move(squareFrom, kingRow, kingColumn, board[kingRow+i][kingColumn+j], kingRow+i, kingColumn+j, board)) && (!$scope.kThreatened(squareFrom, $scope.newBoard ))){
							$scope.kingCanMove = true;
						}
					}
				}
			}
			for (var i = 0; i < enemyThreats.length; i++){
				$scope.threateningEnemyInfo = enemyThreats[i];
				$scope.line = $scope.move($scope.threateningEnemyInfo.piece, $scope.threateningEnemyInfo.row, $scope.threateningEnemyInfo.column, board[kingRow][kingColumn], kingRow, kingColumn, board, true);
				$scope.line.push($scope.threateningEnemyInfo);
				$scope.squares = _.clone($scope.line);
				for (var j = 0; j < $scope.squares.length; j++){
					$scope.square = $scope.squares[j];
					$scope.piecesThatCanProtect = $scope.kThreatened($scope.threateningEnemyInfo.piece, board, undefined, $scope.square.row, $scope.square.column);
					console.log("pieces that can move to protect the king: ", $scope.piecesThatCanProtect);
					for (var k = 0; k < $scope.piecesThatCanProtect.length; k++){
						$scope.pieceThatCanProtect = $scope.piecesThatCanProtect[k];
						if (!$scope.kThreatened($scope.pieceThatCanProtect.piece, $scope.updateTemporaryBoard($scope.pieceThatCanProtect.piece, $scope.pieceThatCanProtect.row, $scope.pieceThatCanProtect.column, $scope.square.piece, $scope.square.row, $scope.square.column, board) )){
							$scope.kingCanBeProtected = true;
						}
					}
				}
			}
			console.log($scope.kingCanMove, $scope.kingCanBeProtected);
			if (!$scope.kingCanMove && !$scope.kingCanBeProtected){
				console.log("The king is checked");
				return $scope.kThreatened(squareFrom, board);
			}else{
				console.log("The king is not checked");
				return $scope.kThreatened(squareFrom, board);
			}

		};
	}]);