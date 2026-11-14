// Gra zawsze w poziomie w przeglądarce telefonu.
// Gdy telefon jest pionowy, płótno Godota jest obrócone o 90 stopni (CSS), a dotyk jest przeliczany
// z powrotem na współrzędne gry. Na zwykłym ekranie nic się nie zmienia (tylko rozmiar płótna).
(function () {
  var canvas = document.getElementById('canvas');
  var st = null; // {cw, ch, left, top} gdy obrócone

  function fit() {
    var dpr = window.devicePixelRatio || 1;
    var W = window.innerWidth, H = window.innerHeight;
    canvas.style.position = 'fixed';
    if (H > W) {
      var cw = H, ch = W;
      var left = W / 2 - cw / 2, top = H / 2 - ch / 2;
      canvas.style.left = left + 'px';
      canvas.style.top = top + 'px';
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      canvas.style.transform = 'rotate(90deg)';
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      st = { cw: cw, ch: ch, left: left, top: top };
    } else {
      canvas.style.left = '0px';
      canvas.style.top = '0px';
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      canvas.style.transform = 'none';
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      st = null;
    }
  }

  // Ekran -> współrzędne nieobróconego płótna, w tym samym układzie co getBoundingClientRect.
  function map(x, y) {
    var rect = canvas.getBoundingClientRect();
    var dx = x - (st.left + st.cw / 2);
    var dy = y - (st.top + st.ch / 2);
    // Odwrotność obrotu CW o 90 stopni: ux = dy, uy = -dx.
    var gx = dy + st.cw / 2;
    var gy = -dx + st.ch / 2;
    return [rect.left + gx * rect.width / st.cw, rect.top + gy * rect.height / st.ch];
  }

  ['mousedown', 'mouseup', 'mousemove'].forEach(function (type) {
    window.addEventListener(type, function (e) {
      if (!st) return;
      var p = map(e.clientX, e.clientY);
      Object.defineProperty(e, 'clientX', { value: p[0] });
      Object.defineProperty(e, 'clientY', { value: p[1] });
    }, true);
  });

  ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(function (type) {
    window.addEventListener(type, function (e) {
      if (!st) return;
      var list = [];
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        var p = map(t.clientX, t.clientY);
        list.push({ identifier: t.identifier, clientX: p[0], clientY: p[1] });
      }
      Object.defineProperty(e, 'changedTouches', { value: list });
    }, true);
  });

  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', function () { setTimeout(fit, 300); });
  fit();
})();
