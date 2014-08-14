var _ = require('mori');
var m = require('./machine');
var commands = ['vbox', 'hbox', 'up', 'pad', '"'];

var mk_machine = function(env, tape) {
  return _.hash_map(
      "env", env,
      "tape", tape,
      "from", null);
}
var interpret = function(machine) {
  var tape = _.get(machine, "tape");
  if (_.count(tape) === 0) {
    return machine;
  }
  var env = _.get(machine, "env");
  var op = _.first(tape);
  
  switch(op) {
    case 'vbox':
      var e2 = m.push_frame(env, m.vertical);
      break;
    case 'hbox':
      var e2 = m.push_frame(env, m.horizontal);
      break;
    case 'up':
      var e2 = m.pop_frame(env);
      break;
    case 'pad':
      // TODO
      var e2 = env;
      break;
    default:
      var e2 = m.append_primitive(m.char_prim(op), env);
      break;
  }
  return _.hash_map(
      "env", e2,
      "tape", _.rest(tape),
      "from", machine);
}
var reduce = function(machine) {
  if (_.count(_.get(machine, 'tape')) === 0) {
    return machine;
  }
  return reduce(interpret(machine));
}

var t1 = [
    'vbox',
      'hbox',
        'vbox', 'h', 'i', 'up',
        'hbox', 't', 'h', 'e', 'r', 'e', 'up',
      'up',
      'hbox', 'F', 'O', 'O', 'up',
    'up',
    ];

var init = function() {
  m.init_canvas();

  var s = m.init_stack;
  var m1 = mk_machine(s, t1);
  m1 = reduce(m1);
  var cs = _.get_in(m1, ['env']);
  console.log('cs: ', _.into_array(_.get(cs, "out")));
  m.draw_chars(cs);
}


module.exports = {
  interpret: interpret,
  reduce: reduce,
  init: init,
}

