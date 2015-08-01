Chessboards = new Mongo.Collection('chessboards');

Chessboards.allow({
  insert: function (userId, board) {
    return userId;
  },
  update: function (userId, board, fields, modifier) {
    return userId;
  },
  remove: function (userId, board) {
    return userId;
  }
});

Meteor.methods({
	restart: function(){
		Chessboards.remove({first: { $ne: true }});
	},

	unDo: function(id){
		if ((Chessboards.find().count() !== 1) ){
			Chessboards.remove({_id: id});
		}
	},

	delete: function(user, practice){
		if(!user){
			Chessboards.remove({});
//		}else if((user) && (practice)){
//			Chessboards.remove({
//				$and:[
//					{white:user},
//					{white: {$exists: true}},
//					{black: user},
//   			    	{black: {$exists: true}}
//				]});
		}else {//if (user && !practice){
			Chessboards.remove({
				$or:[
			    	{$and:[
			        	{white: user},
			        	{white: {$exists: true}}
			    	]},
			      	{$and:[
			        	{black: user},
			        	{black: {$exists: true}}
			      	]}
				]});
		}
	}


});
