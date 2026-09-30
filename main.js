// Starry sky with twinkling stars, gentle parallax, and occasional shooting stars.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
let stars = [], shooting = null, width, height, dpr;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.width = innerWidth * dpr;
  height = canvas.height = innerHeight * dpr;
  const count = Math.round((innerWidth * innerHeight) / 5000);
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width, y: Math.random() * height,
    r: (Math.random() * 1.2 + 0.3) * dpr, depth: Math.random() * 0.8 + 0.2,
    phase: Math.random() * Math.PI * 2, speed: Math.random() * 1.5 + 0.5,
  }));
}

function draw(time) {
  const t = time / 1000;
  const scroll = scrollY * dpr;
  ctx.clearRect(0, 0, width, height);
  for (const s of stars) {
    const twinkle = reduceMotion ? 0.8 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
    const y = ((s.y - scroll * s.depth * 0.25) % height + height) % height;
    ctx.globalAlpha = twinkle * (0.4 + s.depth * 0.6);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, Math.PI * 2); ctx.fill();
  }
  if (!reduceMotion) {
    if (!shooting && Math.random() < 0.004) {
      shooting = { x: Math.random() * width * 0.7 + width * 0.3, y: Math.random() * height * 0.4, life: 0 };
    }
    if (shooting) {
      shooting.life += 0.02;
      const len = 180 * dpr, p = shooting.life;
      const hx = shooting.x - p * 520 * dpr, hy = shooting.y + p * 260 * dpr;
      const grad = ctx.createLinearGradient(hx, hy, hx + len, hy - len / 2);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = Math.max(0, 1 - p);
      ctx.strokeStyle = grad; ctx.lineWidth = 1.6 * dpr;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + len, hy - len / 2); ctx.stroke();
      if (p >= 1) shooting = null;
    }
  }
  ctx.globalAlpha = 1;
  if (!reduceMotion) requestAnimationFrame(draw);
}
addEventListener('resize', resize);
resize();
requestAnimationFrame(draw);

// Frosted header once the page scrolls.
const header = document.querySelector('header.site');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true });

// Fade sections in as they scroll into view.
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) { entry.target.classList.add('shown'); observer.unobserve(entry.target); }
  }
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Tilt the hero phones toward the pointer.
const fan = document.querySelector('.fan');
if (fan && !reduceMotion) {
  addEventListener('pointermove', (e) => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    fan.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 8}deg)`;
  });
}

// Duplicate the gallery so it scrolls seamlessly.
const track = document.querySelector('.track');
if (track) track.innerHTML += track.innerHTML;
