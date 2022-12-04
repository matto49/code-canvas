function debounce(fn, wait) {
  var timer = null;
  return function () {
    var context = this;
    var args = arguments;

    if (timer !== null) {
      clearTimeout(timer);
    }

    timer = setTimeout(function () {
      fn.apply(context, args);
    }, wait);
  };
}
