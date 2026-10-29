'use client';

import Reveal from './Reveal';
import TiltCard from './TiltCard';
import RoleCycler from './RoleCycler';

const NAME = 'MURODULLA';

function Chapter({ label }) {
  return (
    <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.4em] text-white/40">
      <span className="h-px w-10 bg-gradient-to-r from-[#7cf6ff] to-transparent" />
      {label}
    </div>
  );
}

// Big heading used across the worlds.
function Heading({ children, className = '' }) {
  return (
    <h2
      className={`font-display text-[13vw] font-light leading-[0.9] tracking-tightest md:text-[7.5vw] ${className}`}
    >
      {children}
    </h2>
  );
}

export default function Overlay() {
  return (
    <div className="relative z-30 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_textarea]:pointer-events-auto pointer-events-none">
      {/* ---------- 01 · HERO ---------- */}
      <section className="flex min-h-[180vh] flex-col items-center justify-start px-6 pt-[38vh] text-center">
        <Reveal>
          <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.5em] text-white/45">
            The Journey of a Software Engineer
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="font-display text-[16vw] font-extralight leading-none tracking-tightest md:text-[11vw]">
            ODYSSEY
          </h1>
        </Reveal>
        <Reveal delay={0.25}>
          <p className="mt-8 max-w-xl text-sm text-white/50 md:text-base">
            An interactive universe rendered in real time. Scroll to travel
            through the worlds a developer is made of.
          </p>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="mt-14 flex flex-col items-center gap-2 text-white/40">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em]">
              scroll
            </span>
            <span className="block h-14 w-px animate-pulse bg-gradient-to-b from-white/60 to-transparent" />
          </div>
        </Reveal>
      </section>

      {/* ---------- 02 · FOREST ---------- */}
      <section className="flex min-h-[230vh] items-center px-8 md:px-24">
        <div className="max-w-2xl">
          <Reveal>
            <Chapter label="Chapter 02 — Forest of Logic" />
          </Reveal>
          <Reveal delay={0.1}>
            <Heading>
              The Forest
              <br />
              of Logic
            </Heading>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-lg text-white/55 md:text-lg">
              Every idea starts as a seed. Functions bloom into flowers, syntax
              branches into trees, and glowing variables drift like fireflies
              through a forest that compiles itself as you move.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- 03 · OCEAN ---------- */}
      <section className="flex min-h-[230vh] items-center justify-end px-8 text-right md:px-24">
        <div className="max-w-2xl">
          <Reveal>
            <Chapter label="Chapter 03 — Ocean of Data" />
          </Reveal>
          <Reveal delay={0.1}>
            <Heading>
              The Ocean
              <br />
              of Data
            </Heading>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="ml-auto mt-8 max-w-lg text-white/55 md:text-lg">
              Dive beneath the surface. APIs swim past like fish, JSON objects
              rise as bubbles, SQL queries grow into coral, and rivers of packets
              connect an entire living ecosystem of information.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- 04 · MOUNTAINS ---------- */}
      <section className="flex min-h-[210vh] items-center px-8 md:px-24">
        <div className="max-w-2xl">
          <Reveal>
            <Chapter label="Chapter 04 — Mountains of Challenges" />
          </Reveal>
          <Reveal delay={0.1}>
            <Heading>
              Mountains
              <br />
              of Challenges
            </Heading>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-lg text-white/55 md:text-lg">
              Algorithms climb the cliffs. Pull requests streak across the sky,
              CI/CD pipelines fall like waterfalls, and every deployment launches
              another peak into the clouds.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- 05 · COSMIC AI ---------- */}
      <section className="flex min-h-[170vh] items-center justify-center px-8 text-center">
        <div className="max-w-3xl">
          <Reveal>
            <Chapter label="Chapter 05 — Cosmic AI" />
          </Reveal>
          <Reveal delay={0.1}>
            <Heading className="!text-[12vw] md:!text-[8vw]">
              The Cosmic
              <br />
              AI World
            </Heading>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-8 max-w-xl text-white/55 md:text-lg">
              Beyond Earth, neural networks become galaxies, models become stars,
              and a single glowing core dreams the future into existence.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- 06 · THE DEVELOPER ---------- */}
      <section className="flex min-h-[150vh] items-center px-8 md:px-24">
        <div>
          <Reveal>
            <Chapter label="Chapter 06 — The Developer" />
          </Reveal>
          <Reveal delay={0.05}>
            <div className="font-mono text-xs uppercase tracking-[0.4em] text-white/40">
              Hello, I am
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 className="mt-3 font-display text-[15vw] font-light leading-none tracking-tightest md:text-[9vw]">
              {NAME}
            </h2>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-6 font-display text-3xl font-light md:text-5xl">
              <RoleCycler />
            </div>
          </Reveal>
          <Reveal delay={0.35}>
            <p className="mt-8 max-w-lg text-white/55 md:text-lg">
              I build backends that scale, AI that thinks, and interfaces that
              feel alive — turning hard problems into experiences people
              remember.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- 07 · WORK (3D holographic cubes live in the canvas) ---------- */}
      <section className="flex min-h-[210vh] flex-col items-center px-6 pt-[14vh] text-center">
        <Reveal>
          <Chapter label="Chapter 07 — Selected Work" />
        </Reveal>
        <Reveal delay={0.1}>
          <Heading className="mb-6">Worlds I built</Heading>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="max-w-md text-sm text-white/45 md:text-base">
            Four holographic cores float ahead. Hover to feel their weight —
            click one to step inside its world.
          </p>
        </Reveal>
      </section>

      {/* ---------- 08 · SKILLS ---------- */}
      <section className="flex min-h-[140vh] items-end px-8 pb-[16vh] md:px-24">
        <div>
          <Reveal>
            <Chapter label="Chapter 08 — Skills" />
          </Reveal>
          <Reveal delay={0.1}>
            <Heading>
              A galaxy
              <br />
              of tools
            </Heading>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-lg text-white/55 md:text-lg">
              Each technology is a planet with its own gravity. Together they form
              the system I orbit every day.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- 09 · CONTACT ---------- */}
      <section className="flex min-h-[160vh] items-center justify-center px-6 pb-[10vh]">
        <div className="w-full max-w-xl">
          <Reveal>
            <div className="mb-6 text-center font-mono text-[11px] uppercase tracking-[0.5em] text-white/40">
              Chapter 09 — Transmission
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-center font-display text-[13vw] font-light leading-none tracking-tightest md:text-[6vw]">
              Let&apos;s build
              <br />
              the future
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <TiltCard className="mt-12 p-8" max={6}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  window.location.href = `mailto:hello@example.com?subject=${encodeURIComponent(
                    'Odyssey — ' + (data.get('name') || '')
                  )}&body=${encodeURIComponent(data.get('message') || '')}`;
                }}
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field name="name" label="Your name" placeholder="Ada Lovelace" />
                  <Field name="email" label="Email" placeholder="you@space.dev" type="email" />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Tell me about the world you want to build…"
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#7cf6ff]/50"
                  />
                </div>
                <button
                  data-hover
                  type="submit"
                  className="group relative mt-2 overflow-hidden rounded-full border border-white/15 py-4 font-mono text-xs uppercase tracking-[0.4em] text-white transition-colors"
                >
                  <span className="relative z-10">Send transmission →</span>
                  <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-[#7cf6ff]/25 via-[#a78bfa]/25 to-[#ff8a5c]/25 transition-transform duration-500 group-hover:translate-y-0" />
                </button>
              </form>
            </TiltCard>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex items-center justify-center gap-8 font-mono text-[11px] uppercase tracking-[0.3em] text-white/35">
              <a data-hover href="#" className="transition-colors hover:text-white">GitHub</a>
              <a data-hover href="#" className="transition-colors hover:text-white">LinkedIn</a>
              <a data-hover href="#" className="transition-colors hover:text-white">Telegram</a>
            </div>
          </Reveal>
          <div className="mt-16 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/20">
            © {new Date().getFullYear()} {NAME} — rendered in a browser
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ name, label, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#7cf6ff]/50"
      />
    </div>
  );
}
