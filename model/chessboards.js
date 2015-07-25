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
	}


});