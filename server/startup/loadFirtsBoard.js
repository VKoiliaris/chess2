
Meteor.startup(function(){

	if ((Chessboards.find().count() === 0) ){
//--- white pieces are capital---
		Chessboards.insert({board:[
			['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
			['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
			['', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', '', ''],
			['', '', '', '', '', '', '', ''],
			['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
			['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br']
			], castlingStatus: [true, true, true, true], first: true} );
	}
});
