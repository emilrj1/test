import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Advanced single-file React component for a "Space Vibes" hero section
// Uses Tailwind CSS classes, Framer Motion for UI animation, and an HTML canvas for an interactive starfield.
// Drop this component into a React app (Vite/Next) with Tailwind + Framer Motion installed.

export default function SpaceVibesHero() {
  const canvasRef = useRef(null);
  const planetsRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  // Starfield configuration
  const STAR_COUNT = 300;
  const layers = [0.2, 0.5, 0.9]; // parallax depth multipliers

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let raf = null;
    let stars = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 0.9; // hero height
      setWidth(canvas.width);
      setHeight(canvas.height);
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        const layer = layers[i % layers.length];
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: rand(0.2, 1),
          size: rand(0.3, 1.6) * layer * 1.2,
          baseAlpha: rand(0.2, 1),
          twinkle: Math.random() * Math.PI * 2,
          layer,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // soft nebula gradient
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      g.addColorStop(0, "rgba(10,12,30,0.9)");
      g.addColorStop(0.3, "rgba(20,18,50,0.6)");
      g.addColorStop(0.6, "rgba(40,18,70,0.45)");
      g.addColorStop(1, "rgba(5,10,25,0.95)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // subtle moving noise layer (small transparent circles)
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        const rx = (i * 97) % canvas.width + Math.sin(Date.now() / 4000 + i) * 30;
        const ry = (i * 53) % canvas.height + Math.cos(Date.now() / 3000 + i) * 20;
        ctx.fillStyle = `rgba(120, 80, 200, 0.02)`;
        ctx.arc(rx, ry, 200, 0, Math.PI * 2);
        ctx.fill();
      }

      // draw stars
      for (let s of stars) {
        // twinkle effect
        const t = (Math.sin(Date.now() / 500 + s.twinkle) + 1) / 2;
        const alpha = s.baseAlpha * (0.6 + 0.6 * t);
        const mx = (mouse.x - canvas.width / 2) * 0.0006 * (1 - s.layer);
        const my = (mouse.y - canvas.height / 2) * 0.0006 * (1 - s.layer);
        const x = s.x + mx * 200;
        const y = s.y + my * 120;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // soft glow
        ctx.beginPath();
        ctx.fillStyle = `rgba(150,180,255,${alpha * 0.08})`;
        ctx.arc(x, y, s.size * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // small shooting star occasionally
      if (Math.random() > 0.995) {
        const sx = Math.random() * canvas.width;
        const sy = Math.random() * canvas.height * 0.6;
        for (let i = 0; i < 20; i++) {
          const lx = sx + i * 20;
          const ly = sy + i * 10;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${1 - i / 22})`;
          ctx.arc(lx, ly, Math.max(0, 3 - i * 0.12), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function animate() {
      cancelAnimationFrame(raf);
      resize();
      initStars();
      draw();
    }

    window.addEventListener("resize", animate);
    animate();

    return () => {
      window.removeEventListener("resize", animate);
      cancelAnimationFrame(raf);
    };
  }, [mouse.x, mouse.y]);

  // Mouse parallax for planets and subtle parallax on text
  useEffect(() => {
    function onMove(e) {
      setMouse({ x: e.clientX, y: e.clientY });
      const planets = planetsRef.current;
      if (!planets) return;

      const rect = planets.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      // move each planet layer with different multipliers
      const items = planets.querySelectorAll("[data-depth]");
      items.forEach((it) => {
        const depth = parseFloat(it.getAttribute("data-depth"));
        const tx = px * depth * 30; // translate
        const ty = py * depth * 20;
        it.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${depth * 30}deg)`;
      });
    }

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // small helper for gradient badges
  const Badge = ({ children }) => (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500/30 via-sky-400/20 to-purple-500/20 backdrop-blur-sm border border-white/5">
      {children}
    </div>
  );

  return (
    <section className="relative w-full overflow-hidden bg-[#050618] text-white">
      {/* Canvas starfield */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-[90vh] pointer-events-none"
        aria-hidden
      />

      {/* Top nav */}
      <nav className="relative z-30 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-xl shadow-2xl flex items-center justify-center text-black font-bold">SV</div>
          <div className="text-sm font-semibold tracking-wide">Space Vibes</div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a className="text-sm hover:underline" href="#features">Features</a>
          <a className="text-sm hover:underline" href="#gallery">Galaxy</a>
          <a className="text-sm hover:underline" href="#contact">Contact</a>
          <button className="ml-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 text-sm font-semibold shadow-md">Join Beta</button>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 pb-16 pt-12 flex flex-col-reverse md:flex-row items-center gap-8">
        <div className="w-full md:w-6/12 lg:w-5/12">
          <Badge>Immersive • Interactive • Responsive</Badge>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="mt-6 text-4xl md:text-6xl leading-tight font-extrabold"
          >
            Space Vibes — <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-400">A living galaxy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.9 }}
            className="mt-4 text-gray-300 max-w-xl"
          >
            En interaktiv landing page med parallax-planeter, twinkling starfield og dynamiske nebula-effekter. Perfekt til portfolios, launches eller et drømmende brand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 flex items-center gap-4"
          >
            <a
              href="#gallery"
              className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 shadow-lg text-sm font-semibold"
            >
              Explore the Galaxy
n            </a>
            <a href="#features" className="text-sm text-gray-300 hover:underline">See features</a>
          </motion.div>

          {/* Stats / small cards */}
          <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm">
            <div className="p-3 rounded-2xl bg-white/3 backdrop-blur-sm border border-white/6">
              <div className="text-xs text-gray-300">Stars</div>
              <div className="text-xl font-semibold">~{STAR_COUNT}</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/3 backdrop-blur-sm border border-white/6">
              <div className="text-xs text-gray-300">Planets</div>
              <div className="text-xl font-semibold">3</div>
            </div>
          </div>
        </div>

        {/* Right: planets + orbiting elements */}
        <div className="w-full md:w-6/12 lg:w-7/12 relative flex justify-center items-center" ref={planetsRef}>
          <div className="relative w-[520px] h-[420px] md:w-[650px] md:h-[520px] pointer-events-auto">
            {/* distant gas giant */}
            <div
              data-depth="0.15"
              className="absolute -left-24 -top-12 w-72 h-72 rounded-full bg-gradient-to-tr from-purple-700/40 to-pink-500/20 shadow-[0_30px_80px_rgba(120,80,200,0.12)] blur-[8px]"
              aria-hidden
            />

            {/* main planet */}
            <div
              data-depth="0.6"
              className="absolute right-6 top-8 w-56 h-56 md:w-72 md:h-72 rounded-full bg-[conic-gradient(at_20%_30%,#ff8bd8, #7aa7ff, #5ee7df)] shadow-2xl flex items-center justify-center"
              role="img"
              aria-label="Planet"
            >
              <div className="w-40 h-40 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.06),transparent)] border border-white/6 shadow-inner transform rotate-6" />
            </div>

            {/* small moon */}
            <div
              data-depth="0.85"
              className="absolute left-24 bottom-12 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300/70 to-orange-400/40 shadow-md"
            />

            {/* orbit ring */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden>
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0%" stopColor="#6ee7ff" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <ellipse cx="420" cy="260" rx="240" ry="110" fill="none" stroke="url(#g1)" strokeWidth="1" className="opacity-70" />
            </svg>

            {/* floating UI card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="absolute left-8 bottom-6 w-56 p-3 rounded-2xl bg-white/4 backdrop-blur-md border border-white/6 shadow-lg"
            >
              <div className="text-xs text-gray-300">Live Readout</div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-2xl font-semibold">0.42c</div>
                <div className="text-xs text-gray-300">(simulated)</div>
              </div>
            </motion.div>

            {/* subtle particle field overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${width || 800} ${height || 520}`}>
                {[...Array(30).keys()].map((i) => (
                  <circle
                    key={i}
                    cx={20 + (i * 97) % (width || 800)}
                    cy={30 + (i * 53) % (height || 520)}
                    r={Math.max(1, (i % 6) / 2)}
                    fill="white"
                    opacity={0.03}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Features strip */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/4 backdrop-blur-md border border-white/6">
            <h3 className="font-semibold">Parallax Planets</h3>
            <p className="mt-2 text-sm text-gray-300">Responsive 3-layer parallax that reacts to pointer movement and scroll.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/4 backdrop-blur-md border border-white/6">
            <h3 className="font-semibold">Dynamic Starfield</h3>
            <p className="mt-2 text-sm text-gray-300">Canvas-based starfield with twinkling, glow and occasional shooting stars.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/4 backdrop-blur-md border border-white/6">
            <h3 className="font-semibold">Nebula & Gradients</h3>
            <p className="mt-2 text-sm text-gray-300">Layered gradients and soft noise add depth to the scene.</p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <footer id="contact" className="relative z-20 border-t border-white/6 mt-8 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Space Vibes</div>
            <div className="text-xs text-gray-400">Built with ❤️ — drop me a line for the full template</div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="text-sm hover:underline">Docs</a>
            <a href="#" className="text-sm hover:underline">GitHub</a>
            <a href="#" className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 text-sm font-semibold">Get Template</a>
          </div>
        </div>
      </footer>
    </section>
  );
}
