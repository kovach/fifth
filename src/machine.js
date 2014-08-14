var _ = require('mori');

var pt = function(x, y) {
  return {x: x, y: y};
}
var zero = pt(0,0);
var vp = function(p1, p2) {
  return pt(p1.x+p2.x, p1.y+p2.y);
}

var horizontal = 'h';
var vertical   = 'v';

var new_frame = function(base, mode) {
  return _.hash_map(
      "base", base,
      "offset", zero,
      "w", 0,
      "h", 0,
      "mode", mode);
}
var init_stack = _.hash_map(
    "stack", _.list(new_frame(zero, horizontal)),
    "out", _.list());

var top = function(stack) {
  return _.first(stack);
}
var loc = function(stack) {
  var fr = top(stack);
  return vp(
      _.get(fr, "base"),
      _.get(fr, "offset"));
}
var push_frame = function(env, mode) {
  if (mode === null) {
    mode = horizontal;
  }
  return _.update_in(env, ["stack"], function(stack) {
    var fr = new_frame(loc(stack), mode);
    return _.cons(fr, stack);
  });
}
var append_primitive = function(prim, env) {
  var stack = _.get(env, "stack");
  var fr = top(stack);
  var pos = loc(stack);

  var offset = _.get(fr, "offset");
  var mode = _.get(fr, "mode");
  if (mode === horizontal) {
    var offset2 = vp(offset, pt(prim.w, 0));
  } else if (mode === vertical) {
    var offset2 = vp(offset, pt(0, prim.h));
  } else {
    console.log('ERROR mode:', fr.mode);
    return env;
  }

  var fr2 = _.hash_map(
    "base", _.get(fr, "base"),
    "offset", offset2,
    "w", Math.max(_.get(fr, "w"), offset.x + prim.w),
    "h", Math.max(_.get(fr, "h"), offset.y + prim.h),
    "mode", mode);

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
  var w3 = Math.max(_.get(fr2, "w"), _.get(fr, "base").x - _.get(fr2, "base").x + _.get(fr, "w"));
  var h3 = Math.max(_.get(fr2, "h"), _.get(fr, "base").y - _.get(fr2, "base").y + _.get(fr, "h"));
  var mode = _.get(fr2, "mode");
  var offset = _.get(fr2, "offset");
  console.log('off: ', offset);
  if (mode === horizontal) {
    offset = vp(offset, pt(_.get(fr, "w"), 0));
    console.log('hoff: ', offset);
  } else if (mode === vertical) {
    offset = vp(offset, pt(0, _.get(fr, "h")));
    console.log('voff: ', offset);
  } else {
    console.log('ERROR mode:', mode);
    return env;
  }
  console.log('off: ', offset);
  var fr3 = _.hash_map(
    "base", _.get(fr2, "base"),
    "offset", offset,
    "w", w3,
    "h", h3,
    "mode", mode);
  return _.assoc(env, "stack", _.cons(fr3, _.rest(stack2)));
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

var init_canvas = function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = "#fff";
  ctx.font = '20pt monospace';
}
var init = function() {
  init_canvas();

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
  horizontal: horizontal,
  vertical: vertical,

  init_stack: init_stack,
  push_frame: push_frame,
  append_primitive: append_primitive,
  pop_frame: pop_frame,
  top: top,

  char_prim: char_prim,
  draw_chars: draw_chars,

  init_canvas: init_canvas,
  init: init,
};
