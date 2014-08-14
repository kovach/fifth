var _ = require('mori');

var commands =
  ['vbox', 'hbox', 'close', 'pad', '"'];

var pt = function(x, y) {
  return {x: x, y: y};
}
var vp = function(p1, p2) {
  return pt(p1.x+p2.x, p1.y+p2.y);
}

var horizontal = 'h';
var vertical   = 'v';

var new_frame = function() {
  return {
    base: pt(0,0),
    offset: pt(0,0),
    w: 0,
    h: 0,
    mode: horizontal,
  };
}
var init_stack = _.hash_map(
    "stack", _.list(new_frame()),
    "out", _.list());

var top = function(stack) {
  return _.first(stack);
}
var loc = function(stack) {
  var fr = top(stack);
  return vp(fr.base, fr.offset);
}
var push_frame = function(env, mode) {
  var fr = new_frame();
  if (mode) {
    fr.mode = mode;
  }
  return _.update_in(env, ["stack"], function(stack) {
    var l = loc(stack);
    fr.base = loc(stack);
    return _.cons(fr, stack);
  });
}
var append_primitive = function(prim, env) {
  var stack = _.get(env, "stack");
  var fr = top(stack);
  var pos = loc(stack);

  var offset;
  if (fr.mode === horizontal) {
    offset = vp(fr.offset, pt(prim.w, 0));
  } else if (fr.mode === vertical) {
    offset = vp(fr.offset, pt(0, prim.h));
  } else {
    console.log('ERROR mode:', fr.mode);
    return env;
  }

  var fr2 = {
    base: fr.base,
    offset: offset,
    w: Math.max(fr.w, offset.x + prim.w),
    h: Math.max(fr.h, offset.y + prim.h),
    mode: fr.mode,
  };

  var new_out = prim.fn(pos);

  return _.assoc(env,
      "stack", _.cons(fr2, _.rest(stack)),
      "out",   _.cons(new_out, _.get(env, "out"))
      );
}

var pop_frame = function(env) {
  var stack = _.get(env, "stack");
  var fr = top(stack);
  var stack2 = _.rest(stack);
  var fr2 = top(stack2);
  fr2.w = Math.max(fr2.w, fr.base.x - fr2.base.x + fr.w);
  fr2.h = Math.max(fr2.h, fr.base.y - fr2.base.y + fr.h);
  var offset;
  if (fr2.mode === horizontal) {
    offset = vp(fr2.offset, pt(fr.w, 0));
  } else if (fr2.mode === vertical) {
    offset = vp(fr2.offset, pt(0, fr.h));
  } else {
    console.log('ERROR mode:', fr2.mode);
    return env;
  }
  fr2.offset = offset;
  return _.assoc(env, "stack", stack2)
}

// TODO
var charW = 15;
var charH = 22;
var char_prim = function(c) {
  var fn = function(pos) {
    return {
      x: pos.x,
      y: pos.y,
      char: c
    };
  }
  return {w: charW, h: charH, fn: fn};
}

var canvas = document.getElementById('canvas0');
var ctx = canvas.getContext('2d');

var draw_chars = function(env) {
  var chars = _.get(env, "out");
  _.each(chars, function(c) {
    ctx.fillText(c.char, c.x, c.y + charH);
  });

}

var init = function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = "#fff";
  ctx.font = '20pt monospace';

  var s = init_stack;
  var str1 = "abcdefghijklmn";
  var str2 = "ABCDEFGHIJKLMN";
  s = push_frame(s, vertical);
  s = push_frame(s, horizontal);
  s = push_frame(s, vertical);
  _.each(str1, function(c) {
    s = append_primitive(char_prim(c), s);
  });
  s = pop_frame(s);
  s = push_frame(s, horizontal);
  _.each(str2, function(c) {
    s = append_primitive(char_prim(c), s);
  });
  s = pop_frame(s);
  s = push_frame(s, vertical);
  _.each(str1, function(c) {
    s = append_primitive(char_prim(c), s);
  });
  s = push_frame(s, horizontal);
  _.each(str2, function(c) {
    s = append_primitive(char_prim(c), s);
  });
  s = pop_frame(s);
  s = pop_frame(s);
  s = push_frame(s, horizontal);
  _.each(str2, function(c) {
    s = append_primitive(char_prim(c), s);
  });
  s = pop_frame(s);
  s = pop_frame(s);
  s = push_frame(s, horizontal);
  _.each(str2, function(c) {
    s = append_primitive(char_prim(c), s);
  });
  s = pop_frame(s);
  _.each(str2, function(c) {
    s = append_primitive(char_prim(c), s);
  });

  draw_chars(s);
  return s;
  // canvas?
}

module.exports = {
  init: init,
  init_stack: init_stack,
  push_frame: push_frame,
  append_primitive: append_primitive,
  pop_frame: pop_frame,
  top: top,

  draw_chars: draw_chars,
};
