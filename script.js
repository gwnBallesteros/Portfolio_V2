// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Contact form
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Sending…';

  const data = Object.fromEntries(new FormData(form).entries());
  if (data.website) { statusEl.textContent = 'Thanks!'; return; }

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const out = await res.json();
    if (res.ok) { statusEl.textContent = 'Message sent. I’ll reply shortly.'; form.reset(); }
    else { statusEl.textContent = out?.error || 'Something went wrong. Please email gballesteros.info@gmail.com directly.'; }
  } catch (err) {
    statusEl.textContent = 'Network error. Please email gballesteros.info@gmail.com.';
  }
});

// D3 US map
const mountMap = async () => {
  const el = document.getElementById('us-map');
  if (!el) return;

  const width = el.clientWidth;
  const height = el.clientHeight;

  const svg = d3.select(el).append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`);

  const defs = svg.append('defs');
  const grad = defs.append('linearGradient').attr('id','gradAccent').attr('x1','0%').attr('x2','100%');
  grad.append('stop').attr('offset','0%').attr('stop-color','#10b981');
  grad.append('stop').attr('offset','100%').attr('stop-color','#22d3ee');

  const projection = d3.geoAlbersUsa().fitExtent([[16, 16], [width-16, height-16]], {type: 'Sphere'});
  const path = d3.geoPath(projection);

  const res = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json');
  const topo = await res.json();
  const states = topojson.feature(topo, topo.objects.states).features;

  const active = new Set([2, 32, 6, 48, 4, 8]);

  svg.append('g')
    .selectAll('path')
    .data(states).join('path')
    .attr('class', d => active.has(d.id) ? 'state active' : 'state')
    .attr('d', path)
    .append('title')
    .text(d => d.properties.name);

  svg.append('path')
    .datum(topojson.mesh(topo, topo.objects.states, (a, b) => a !== b))
    .attr('fill', 'none')
    .attr('stroke', '#152235')
    .attr('stroke-width', .6)
    .attr('d', path);
};

window.addEventListener('load', mountMap);
