Meteor.publish("chessboards", function (options) {
  return Chessboards.find({
    $or:[
      {$and:[
        {white: this.userId},
        {white: {$exists: true}}
      ]},
      {$and:[
        {black: this.userId},
        {black: {$exists: true}}
      ]},
      {challenge: {$exists: true}}

    ]}, options);
});


