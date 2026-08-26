(function () {
  var root = document.querySelector('[data-constellation]');
  if (!root) return;

  var canvas = root.querySelector('.constellation-canvas');
  var context = canvas.getContext('2d');
  var stage = root.querySelector('.constellation-stage');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var width;
  var height;
  var pixelRatio;

  var nodes = [
    { label: 'Large language models', angle: -1.1, orbit: 0.31, color: '#6ee7d4' },
    { label: 'Knowledge graphs', angle: -0.1, orbit: 0.42, color: '#6ee7d4' },
    { label: 'Graph ML', angle: 0.92, orbit: 0.31, color: '#6ee7d4' },
    { label: 'Data-centric AI', angle: 2.22, orbit: 0.42, color: '#6ee7d4' },
    { label: 'Drawing', angle: -2.55, orbit: 0.52, color: '#f9d878' },
    { label: 'Reading', angle: 2.95, orbit: 0.58, color: '#f9d878' },
    { label: 'Film', angle: -2.02, orbit: 0.62, color: '#f9d878' },
    { label: 'Tennis', angle: 1.72, orbit: 0.6, color: '#f9d878' }
  ];

  function resize() {
    var rect = stage.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function draw(time) {
    context.clearRect(0, 0, width, height);
    var centerX = width * 0.58;
    var centerY = height * 0.54;
    var base = Math.min(width, height);
    var glow = context.createRadialGradient(centerX, centerY, 4, centerX, centerY, base * 0.55);
    glow.addColorStop(0, 'rgba(110, 231, 212, 0.20)');
    glow.addColorStop(1, 'rgba(9, 42, 50, 0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    [0.31, 0.42, 0.58, 0.62].forEach(function (orbit) {
      context.beginPath();
      context.ellipse(centerX, centerY, base * orbit, base * orbit * 0.62, 0, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(226, 232, 240, 0.12)';
      context.lineWidth = 1;
      context.stroke();
    });

    context.beginPath();
    context.arc(centerX, centerY, 31, 0, Math.PI * 2);
    context.fillStyle = '#f8fafc';
    context.fill();
    context.fillStyle = '#092a32';
    context.font = '700 11px Muli, sans-serif';
    context.textAlign = 'center';
    context.fillText('RELIABLE', centerX, centerY - 3);
    context.fillText('AI', centerX, centerY + 11);

    nodes.forEach(function (node) {
      var drift = reduceMotion ? 0 : Math.sin(time / 2600 + node.angle) * 0.045;
      var radius = base * node.orbit;
      var x = centerX + Math.cos(node.angle + drift) * radius;
      var y = centerY + Math.sin(node.angle + drift) * radius * 0.62;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.lineTo(x, y);
      context.strokeStyle = node.color === '#6ee7d4' ? 'rgba(110, 231, 212, 0.3)' : 'rgba(249, 216, 120, 0.26)';
      context.stroke();
      context.beginPath();
      context.arc(x, y, 11, 0, Math.PI * 2);
      context.fillStyle = node.color === '#6ee7d4' ? 'rgba(110, 231, 212, 0.14)' : 'rgba(249, 216, 120, 0.14)';
      context.fill();
      context.beginPath();
      context.arc(x, y, 7, 0, Math.PI * 2);
      context.fillStyle = node.color;
      context.fill();
      context.fillStyle = '#f8fafc';
      context.font = '600 12px Muli, sans-serif';
      context.textAlign = x > centerX ? 'left' : 'right';
      context.fillText(node.label, x + (x > centerX ? 15 : -15), y + 4);
    });

    if (!reduceMotion) window.requestAnimationFrame(draw);
  }

  window.addEventListener('resize', function () {
    resize();
    if (reduceMotion) draw(0);
  });
  resize();
  draw(0);
}());
