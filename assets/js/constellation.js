(function () {
  var root = document.querySelector('[data-constellation]');
  if (!root) return;

  var canvas = root.querySelector('.constellation-canvas');
  var context = canvas.getContext('2d');
  var stage = root.querySelector('.constellation-stage');
  var title = root.querySelector('[data-constellation-title]');
  var copy = root.querySelector('[data-constellation-copy]');
  var filters = root.querySelectorAll('[data-constellation-filter]');
  var controls = root.querySelectorAll('[data-constellation-node]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var activeFilter = 'all';
  var activeNode = null;
  var frame;
  var width;
  var height;
  var pixelRatio;
  var startTime = Date.now();

  var nodes = [
    { id: 'llms', label: 'LLMs', group: 'research', angle: -1.12, orbit: 0.31, color: '#6ee7d4', description: 'Grounded reasoning, retrieval-augmented generation, and planning for dependable language-model behavior.' },
    { id: 'knowledge', label: 'Knowledge graphs', group: 'research', angle: -0.1, orbit: 0.42, color: '#6ee7d4', description: 'Structured knowledge grounding and retrieval for systems that can trace how they arrive at an answer.' },
    { id: 'graphs', label: 'Graph ML', group: 'research', angle: 0.92, orbit: 0.31, color: '#6ee7d4', description: 'Graph neural networks, graph condensation, and representation learning for connected data.' },
    { id: 'data', label: 'Data-centric AI', group: 'research', angle: 2.22, orbit: 0.42, color: '#6ee7d4', description: 'Dataset diagnosis and benchmark design that make model evaluation more reliable and useful.' },
    { id: 'drawing', label: 'Drawing', group: 'curiosity', angle: -2.56, orbit: 0.45, color: '#f9d878', description: 'Drawing trains close observation: notice structure, reduce complexity, and make an idea legible.' },
    { id: 'reading', label: 'Reading', group: 'curiosity', angle: 2.96, orbit: 0.58, color: '#f9d878', description: 'Reading keeps a steady habit of learning across ideas, disciplines, and stories.' },
    { id: 'film', label: 'New movies', group: 'curiosity', angle: -2.02, orbit: 0.62, color: '#f9d878', description: 'New movies are a favorite way to follow visual storytelling, fresh perspectives, and culture in motion.' },
    { id: 'tennis', label: 'Tennis', group: 'curiosity', angle: 1.72, orbit: 0.6, color: '#f9d878', description: 'Tennis brings focus, patience, and the pleasure of improving one point at a time.' }
  ];

  function visible(node) {
    return activeFilter === 'all' || node.group === activeFilter;
  }

  function position(node, time) {
    var centerX = width * 0.58;
    var centerY = height * 0.54;
    var radius = Math.min(width, height) * node.orbit;
    var drift = reduceMotion ? 0 : Math.sin(time / 2600 + node.angle) * 0.055;
    return {
      x: centerX + Math.cos(node.angle + drift) * radius,
      y: centerY + Math.sin(node.angle + drift) * radius * 0.62
    };
  }

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

    nodes.forEach(function (node) {
      if (!visible(node)) return;
      var point = position(node, time);
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.lineTo(point.x, point.y);
      context.strokeStyle = node.group === 'research' ? 'rgba(110, 231, 212, 0.3)' : 'rgba(249, 216, 120, 0.26)';
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
      if (!visible(node)) return;
      var point = position(node, time);
      var selected = activeNode && activeNode.id === node.id;
      var radius = selected ? 10 : 7;
      context.beginPath();
      context.arc(point.x, point.y, radius + 5, 0, Math.PI * 2);
      context.fillStyle = node.group === 'research' ? 'rgba(110, 231, 212, 0.14)' : 'rgba(249, 216, 120, 0.14)';
      context.fill();
      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.fillStyle = node.color;
      context.fill();
      context.fillStyle = '#f8fafc';
      context.font = (selected ? '700 ' : '600 ') + '12px Muli, sans-serif';
      context.textAlign = point.x > centerX ? 'left' : 'right';
      context.fillText(node.label, point.x + (point.x > centerX ? 15 : -15), point.y + 4);
    });

    if (!reduceMotion) frame = window.requestAnimationFrame(draw);
  }

  function select(node) {
    activeNode = node;
    title.textContent = node.label;
    copy.textContent = node.description;
    controls.forEach(function (control) {
      control.classList.toggle('is-active', control.getAttribute('data-constellation-node') === node.id);
    });
    if (reduceMotion) draw(Date.now() - startTime);
  }

  function setFilter(nextFilter) {
    activeFilter = nextFilter;
    if (activeNode && !visible(activeNode)) {
      activeNode = null;
      title.textContent = 'Reliable AI';
      copy.textContent = 'Grounded reasoning and rigorous evaluation are the common thread across my research.';
      controls.forEach(function (control) {
        control.classList.remove('is-active');
      });
    }
    filters.forEach(function (item) {
      var selected = item.getAttribute('data-constellation-filter') === activeFilter;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    if (reduceMotion) draw(Date.now() - startTime);
  }

  function findNode(event) {
    var rect = canvas.getBoundingClientRect();
    var pointerX = event.clientX - rect.left;
    var pointerY = event.clientY - rect.top;
    var time = Date.now() - startTime;
    return nodes.find(function (node) {
      if (!visible(node)) return false;
      var point = position(node, time);
      return Math.hypot(pointerX - point.x, pointerY - point.y) < 24;
    });
  }

  canvas.addEventListener('pointermove', function (event) {
    canvas.style.cursor = findNode(event) ? 'pointer' : 'default';
  });

  canvas.addEventListener('click', function (event) {
    var node = findNode(event);
    if (node) select(node);
  });

  filters.forEach(function (filter) {
    filter.addEventListener('click', function () {
      setFilter(filter.getAttribute('data-constellation-filter'));
    });
  });

  controls.forEach(function (control) {
    control.addEventListener('click', function () {
      var node = nodes.find(function (item) {
        return item.id === control.getAttribute('data-constellation-node');
      });
      if (!node) return;
      if (!visible(node)) setFilter(node.group);
      select(node);
    });
  });

  window.addEventListener('resize', resize);
  resize();
  draw(0);
}());
