function UnicUsers(arr, delay) { //delay in ms 60000 == 1min; 600000 == 10min;
  this.delay = delay;

  var result = [];

  arr.forEach(function(el) {
    var from = el.from;
    if (result.indexOf(from) == -1) {
      result.push(from);
    }
  });

  this.unicUsersQuantity = function() {
    return result.length;
  };

  this.unicUsersList = function() {
    return result;
  };

  this.getFlooders = function() {

    var flooders = {};

    arr.forEach(function(el) {
      if (el.from in flooders) {
        flooders[el.from] += 1;
      } else {
        flooders[el.from] = 1;
      }

    });
    var sortable = [];
    for (var user in flooders) {
      sortable.push([user, flooders[user]]);
    }
    sortable.sort(function(a, b) {
      return b[1] - a[1]
    })
    return sortable;
    /*var obj = {};
    for (var i = 0; i < sortable.length; i++){
       obj[sortable[i][0]] = sortable[i][1];
    }
    return obj;*/
  };

  (function clearOldMessages(delay) { //clear messages over delay
    var timeNow = Date.now();
    arr.forEach(function(el, idx) {
      if (el.timestamp + delay < timeNow) {
        arr.splice(idx, 1);
      };
    });
  }(delay));

}

var allChatEntries = [];

setInterval(function() { // TIMER

  $('.ember-view.message-line.chat-line').not('.jerk_checked').each(function(idx, el) {

    var msg = {};

    msg.id = $(this).attr('id');
    msg.timestamp = Date.now(); //$(this).children('.timestamp').text();
    msg.from = $(this).children('.from').text();
    msg.message = $(this).children('.message').text();

    allChatEntries.push(msg);

    $(this).addClass('jerk_checked');

  });

  var getUsers = new UnicUsers(allChatEntries, 6000);

  var unicUsersSpan = '<span>' + getUsers.unicUsersQuantity() + ' users in last ' + getUsers.delay / 1000 + ' seconds</span>';
  //var floodersSpan = '<span>' + getUsers.getFlooders()[0][0] + ': ' + getUsers.getFlooders()[0][1] + ' messages</span>';

  
$('#status').html(unicUsersSpan/* + '<br>' + floodersSpan*/);

}, 1000);