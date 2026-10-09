# Cdreviews Revival

Build a React + Vite + Tailwind app for cdreviews — a music review publication coming back online after launching in 1995. Use the three files below as the exact source of truth. Don't simplify, don't substitute fonts, don't change colors. Keep Fraunces, Geist, and JetBrains Mono. Implement everything as written, then we'll iterate from here.

Project setup:

React + Vite + Tailwind (TypeScript or JavaScript both fine — code below is JSX)
Replace the default starter App component with src/App.jsx
Replace the default src/index.css with the CSS below
Replace tailwind.config.js with the config below
Make sure the index.css is imported in main.jsx/main.tsx

=== FILE 1: tailwind.config.js ===

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bone:        '#f1ecdf',
        'bone-2':    '#e8e1d0',
        'bone-warm': '#ede5d2',
        ink:         '#14110f',
        'ink-2':     '#2a2622',
        mute:        '#807870',
        rule:        'rgba(20,17,15,0.1)',
        vermil:      '#ff3b14',
        ultra:       '#2b3bff',
        acid:        '#d8ff00',
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans:  ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

=== FILE 2: src/index.css ===

@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100&family=JetBrains+Mono:wght@400;500;700&family=Geist:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    background: #f1ecdf;
    color: #14110f;
  }
  body {
    font-family: 'Geist', sans-serif;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    position: relative;
  }
  /* page-wide grain overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 999;
    opacity: 0.35;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  }
}

@layer components {
  /* ─── Fraunces variable axis presets ─── */
  .fr-display       { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 144, "wght" 500, "SOFT" 30; letter-spacing: -0.02em; line-height: 0.95; }
  .fr-display-soft  { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 144, "wght" 400, "SOFT" 60; letter-spacing: -0.02em; line-height: 0.95; }
  .fr-display-bold  { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 144, "wght" 700, "SOFT" 0;  letter-spacing: -0.05em; line-height: 0.82; }
  .fr-display-italic{ font-family: 'Fraunces', serif; font-style: italic; font-variation-settings: "opsz" 144, "wght" 400, "SOFT" 100; }
  .fr-score         { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 144, "wght" 400, "SOFT" 0;  letter-spacing: -0.06em; line-height: 0.85; }
  .fr-score-card    { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 144, "wght" 500, "SOFT" 20; letter-spacing: -0.04em; line-height: 0.9;  }
  .fr-card-title    { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 48,  "wght" 500, "SOFT" 40; line-height: 1.05; }
  .fr-row-title     { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 36,  "wght" 500, "SOFT" 30; line-height: 1.1; }
  .fr-mini-title    { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 36,  "wght" 500, "SOFT" 30; line-height: 1.05; }
  .fr-pull          { font-family: 'Fraunces', serif; font-style: italic; font-variation-settings: "opsz" 144, "wght" 300, "SOFT" 100; line-height: 1.45; }
  .fr-dek           { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 144, "wght" 300; line-height: 1.4; }
  .fr-excerpt       { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 36,  "wght" 350; line-height: 1.55; }
  .fr-archive-h     { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 144, "wght" 400, "SOFT" 80; font-style: italic; line-height: 1.05; }
  .fr-blurb         { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 36,  "wght" 300; line-height: 1.4; }

  /* ─── animations ─── */
  .animate-marquee  { animation: scroll-marquee 60s linear infinite; }
  .animate-pulse-dot{ animation: pulse-dot 1.6s infinite; }

  /* ─── album art (CSS-only compositions) ─── */
  .art {
    width: 100%;
    aspect-ratio: 1;
    position: relative;
    overflow: hidden;
    transition: transform .4s cubic-bezier(.2,.7,.3,1);
  }

  .art-hero {
    background: linear-gradient(135deg, #ff3b14 0%, #ff3b14 50%, #14110f 50%, #14110f 100%);
  }
  .art-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 70% 30%, rgba(255,255,255,0.18) 0%, transparent 40%),
      repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 8px, rgba(0,0,0,0.08) 8px, rgba(0,0,0,0.08) 9px);
  }
  .art-hero::after {
    content: '';
    position: absolute;
    inset: 12% 12% auto auto;
    width: 35%;
    aspect-ratio: 1;
    border-radius: 50%;
    background: #f1ecdf;
    box-shadow:
      inset 0 0 0 1px rgba(0,0,0,0.1),
      inset 0 0 0 8px rgba(255,255,255,0.6),
      inset 0 0 0 9px rgba(0,0,0,0.1);
  }

  .art-1 { background: linear-gradient(180deg, #d8ff00 50%, #14110f 50%); }
  .art-1::after {
    content: '';
    position: absolute;
    inset: 25% 25%;
    border-radius: 50%;
    background: #ff3b14;
    mix-blend-mode: difference;
  }

  .art-2 {
    background: #2b3bff;
    background-image: repeating-linear-gradient(90deg, transparent 0, transparent 12px, rgba(255,255,255,0.18) 12px, rgba(255,255,255,0.18) 13px);
  }

  .art-3 {
    background: #e8e1d0;
    background-image:
      radial-gradient(circle at 50% 50%, transparent 18%, #14110f 18%, #14110f 19%, transparent 19%),
      radial-gradient(circle at 50% 50%, transparent 28%, #14110f 28%, #14110f 29%, transparent 29%),
      radial-gradient(circle at 50% 50%, transparent 38%, #14110f 38%, #14110f 39%, transparent 39%),
      radial-gradient(circle at 50% 50%, transparent 48%, #14110f 48%, #14110f 49%, transparent 49%);
  }

  .art-4 {
    background: #14110f;
    background-image:
      linear-gradient(45deg, transparent 47%, #ff3b14 47%, #ff3b14 53%, transparent 53%),
      linear-gradient(-45deg, transparent 47%, #ff3b14 47%, #ff3b14 53%, transparent 53%);
  }

  .art-5 { background: linear-gradient(180deg, #ff8a4a 0%, #ff3b14 60%, #6b1d0a 100%); }
  .art-5::after {
    content: '';
    position: absolute;
    inset: 60% 0 0 0;
    background: repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(0,0,0,0.25) 3px, rgba(0,0,0,0.25) 4px);
  }

  .art-6 {
    background: #f1ecdf;
    border: 1px solid #14110f;
  }
  .art-6::after {
    content: '';
    position: absolute;
    inset: 12%;
    background: conic-gradient(from 0deg, #14110f 0 25%, transparent 25% 50%, #14110f 50% 75%, transparent 75% 100%);
    border-radius: 50%;
  }

  .art-7 {
    background: #0a3d2e;
    background-image: repeating-linear-gradient(135deg, transparent 0, transparent 10px, rgba(216,255,0,0.4) 10px, rgba(216,255,0,0.4) 11px);
  }

  .art-8 { background: #14110f; }
  .art-8::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 25%),
      radial-gradient(ellipse at 70% 65%, rgba(255,59,20,0.6) 0%, transparent 30%);
  }

  /* archive feature album art */
  .art-archive {
    background:
      radial-gradient(ellipse at 30% 75%, #c89868 0%, transparent 55%),
      radial-gradient(ellipse at 75% 25%, #8a3818 0%, transparent 50%),
      linear-gradient(180deg, #2a1810 0%, #14110f 100%);
  }
  .art-archive::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 3px);
  }
  .art-archive::after {
    content: 'V/VI';
    position: absolute;
    bottom: 12%;
    left: 10%;
    right: 10%;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.4em;
    color: rgba(212,184,150,0.7);
    border-top: 1px solid rgba(212,184,150,0.4);
    padding-top: 8px;
  }

  /* mini album art */
  .art-mini {
    width: 84px;
    height: 84px;
    position: relative;
    overflow: hidden;
  }
  .art-mini-1 {
    background: #2c4a3a;
    background-image: repeating-linear-gradient(45deg, transparent 0, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px);
  }
  .art-mini-1::after {
    content: '';
    position: absolute;
    inset: 30%;
    background: #c89868;
    border-radius: 50%;
  }
  .art-mini-2 { background: linear-gradient(180deg, #d4b896 50%, #6b1d0a 50%); }
  .art-mini-2::after {
    content: '';
    position: absolute;
    inset: 35% 20%;
    background: #14110f;
  }
  .art-mini-3 { background: #14110f; }
  .art-mini-3::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 50% 50%, transparent 25%, #c89868 25%, #c89868 26%, transparent 26%),
      radial-gradient(circle at 50% 50%, transparent 40%, #c89868 40%, #c89868 41%, transparent 41%);
  }

  /* row art */
  .art-row { width: 48px; height: 48px; position: relative; overflow: hidden; }

  /* drop cap on archive excerpt */
  .dropcap::first-letter {
    font-family: 'Fraunces', serif;
    font-variation-settings: "opsz" 144, "wght" 700, "SOFT" 0;
    font-size: 4.6em;
    float: left;
    line-height: 0.85;
    margin: 4px 10px 0 -2px;
    color: #ff3b14;
  }

  /* manifesto giant ghost quote marks */
  .manifesto-quote { position: relative; overflow: hidden; }
  .manifesto-quote::before, .manifesto-quote::after {
    position: absolute;
    font-family: 'Fraunces', serif;
    font-size: 320px;
    line-height: 1;
    color: #14110f;
    opacity: 0.04;
    font-weight: 800;
  }
  .manifesto-quote::before { content: '“'; top: -40px; left: 40px; }
  .manifesto-quote::after  { content: '”'; bottom: -180px; right: 40px; }

  /* archive section warm paper grain */
  .archive-paper { position: relative; }
  .archive-paper::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.5;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n2'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 0.16 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n2)'/></svg>");
  }

  /* live dot */
  .live-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #ff3b14;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
    animation: pulse-dot 1.6s infinite;
  }
}

@keyframes scroll-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}

=== FILE 3: src/App.jsx ===

import React from 'react'

// ────────────────────────────────────────────────────────────────
// DATA  (edit these arrays to change content)
// ────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  { tag: 'NEW', artist: 'Lia Thrum',       title: 'Glass Engine', score: '8.7' },
  { tag: 'NEW', artist: 'Marcia Velour',   title: 'Plain Songs',  score: '7.9' },
  { tag: 'BNM', artist: 'Kosmo Gardens',   title: 'Reentry',      score: '9.1' },
  { tag: 'NEW', artist: 'Field Pulse',     title: 'Antenna',      score: '6.8' },
  { tag: 'NEW', artist: 'The Hours After', title: 'Kin',          score: '8.2' },
  { tag: 'BNR', artist: 'Tamarind State',  title: 'Ovum',         score: '8.9' },
  { tag: 'NEW', artist: 'Halflit',         title: 'Wading',       score: '7.4' },
  { tag: 'NEW', artist: 'Moss & Wire',     title: 'Atlas Tape',   score: '8.0' },
]

const NAV_LINKS = [
  { label: 'Today', current: true },
  { label: 'Reviews' },
  { label: 'Best New' },
  { label: 'Features' },
  { label: 'Lists' },
  { label: 'Archive' },
  { label: 'Radio' },
]

const REVIEWS = [
  { art: 'art-1', genre: 'Electronic',   date: '05.04.26', title: 'Glass Engine', artist: 'Lia Thrum',       score: '8.7', label: 'Selo Mint',     format: 'LP · 9 tr',  badge: 'BEST NEW MUSIC',   hi: true  },
  { art: 'art-2', genre: 'Folk',         date: '05.03.26', title: 'Plain Songs',  artist: 'Marcia Velour',   score: '7.9', label: 'Hardly Quiet',  format: 'EP · 6 tr'                                          },
  { art: 'art-3', genre: 'Ambient',      date: '05.02.26', title: 'Wading',       artist: 'Halflit',         score: '7.4', label: 'Constellation', format: 'LP · 7 tr'                                          },
  { art: 'art-4', genre: 'Post-Punk',    date: '05.01.26', title: 'Ovum',         artist: 'Tamarind State',  score: '8.9', label: 'Numero',        format: '2xLP · 14 tr', badge: 'BEST NEW REISSUE', hi: true  },
  { art: 'art-5', genre: 'Pop',          date: '04.30.26', title: 'Antenna',      artist: 'Field Pulse',     score: '6.8', label: 'Dirty Hit',     format: 'LP · 11 tr'                                         },
  { art: 'art-6', genre: 'Jazz',         date: '04.29.26', title: 'Kin',          artist: 'The Hours After', score: '8.2', label: 'Verve',         format: 'LP · 8 tr'                                          },
  { art: 'art-7', genre: 'Hip-Hop',      date: '04.28.26', title: 'Atlas Tape',   artist: 'Moss & Wire',     score: '8.0', label: 'Self-Released', format: 'LP · 13 tr'                                         },
  { art: 'art-8', genre: 'Experimental', date: '04.27.26', title: 'Reentry',      artist: 'Kosmo Gardens',   score: '9.1', label: 'Bow Hill',      format: 'LP · 11 tr',                              hi: true  },
]

const ARCHIVE_MINIS = [
  { art: 'art-mini-1', title: 'Northing',     artist: 'Bantam Year',  label: 'Trabant',  score: '7.6' },
  { art: 'art-mini-2', title: 'Heel-and-Toe', artist: 'Cordwainer',   label: 'Heavenly', score: '6.9' },
  { art: 'art-mini-3', title: 'Veridia',      artist: 'Marisol Tien', label: "Mo'Wax",   score: '8.1' },
]

const DECADES = [
  { years: '1995 — 1999', count: '2,103', label: 'The Founding'        },
  { years: '2000 — 2004', count: '3,847', label: 'Burned CDs'          },
  { years: '2005 — 2009', count: '5,221', label: 'Blogs & MP3s'        },
  { years: '2010 — 2014', count: '5,894', label: 'The Stream Era'      },
  { years: '2015 — 2019', count: '6,402', label: 'Playlist Logic'      },
  { years: '2020 — 2024', count: '7,118', label: 'The Pandemic Albums' },
  { years: '2025 — 2026', count: '3,084', label: 'Return of the Sleeve'},
  { years: '2027 →',      count: '∞',     label: 'The Next Chapter', current: true },
]

const LATEST = [
  { num: '001', title: 'Glass Engine',     artist: 'Lia Thrum',        label: 'Selo Mint',     genre: 'Electronic / Ambient', date: '05.04.2026', score: '8.7', tone: 'hi' },
  { num: '002', title: 'Plain Songs',      artist: 'Marcia Velour',    label: 'Hardly Quiet',  genre: 'Folk',                 date: '05.03.2026', score: '7.9' },
  { num: '003', title: 'Reentry',          artist: 'Kosmo Gardens',    label: 'Bow Hill',      genre: 'Experimental',         date: '05.02.2026', score: '9.1', tone: 'hi' },
  { num: '004', title: 'Wading',           artist: 'Halflit',          label: 'Constellation', genre: 'Ambient',              date: '05.02.2026', score: '7.4' },
  { num: '005', title: 'Antenna',          artist: 'Field Pulse',      label: 'Dirty Hit',     genre: 'Pop',                  date: '04.30.2026', score: '6.8', tone: 'lo' },
  { num: '006', title: 'Ovum (Reissue)',   artist: 'Tamarind State',   label: 'Numero',        genre: 'Post-Punk',            date: '04.28.2026', score: '8.9', tone: 'hi' },
  { num: '007', title: 'Kin',              artist: 'The Hours After',  label: 'Verve',         genre: 'Jazz',                 date: '04.27.2026', score: '8.2' },
  { num: '008', title: 'Atlas Tape',       artist: 'Moss & Wire',      label: 'Self-Released', genre: 'Hip-Hop',              date: '04.26.2026', score: '8.0' },
]

const FOOTER_COLS = [
  { heading: 'Read',   links: ['Reviews', 'Best New', 'Features', 'Interviews', 'Lists'] },
  { heading: 'Listen', links: ['CDR Radio', 'The 9.0+ Mix', "Editor's Picks", 'From the Archive'] },
  { heading: 'About',  links: ['Masthead', 'Contact', 'Submissions', 'Ethics policy', 'Advertising'] },
]

// ────────────────────────────────────────────────────────────────
// SHARED BITS
// ────────────────────────────────────────────────────────────────

function Kicker({ children, color = 'vermil' }) {
  const colorClass = color === 'acid' ? 'text-acid' : 'text-vermil'
  const lineColor  = color === 'acid' ? 'bg-acid'   : 'bg-vermil'
  return (
    


      
      {children}
    


  )
}

// ────────────────────────────────────────────────────────────────
// SECTIONS
// ────────────────────────────────────────────────────────────────

function UtilityBar() {
  return (
    


      

LIVE · 14,892 readers


      

WED · 06 MAY 2026 · 14:32 EST · CYCLE 31


      


        Account
        Subscribe
        Search ⌘K
      


    


  )
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS] // duplicate for seamless loop
  return (
    


      


        {items.map((it, i) => (
          
            {it.tag}{' '}
            {it.artist} — {it.title} · {it.score}
          
        ))}
      


    


  )
}

function Masthead() {
  return (
    


      


        cdreviews.
        EST. 1995
      


      
        {NAV_LINKS.map(l => (
          
            {l.label}
          
        ))}
      
      
        VOL · 31
      
    


  )
}

function Hero() {
  return (
    


      


        


          Best New Music · Featured Review
          


            The patient hum of a second life.
          


          


            Three decades after their first transmission, Kosmo Gardens return with Reentry: a record that refuses the familiar comforts of the comeback, opting instead for something stranger, slower, and more luminous. It is the kind of album that rewires the room around it.
          


        


        


          Maren Okafor
          05.06.2026
          12 min read
          → Read review
        


      



      


        ↳ Album of the Week
        


        


          


            


              9.1/10
            


            


              KOSMO GARDENS
              Reentry — Bow Hill Records

              Released 04.18.2026 · 11 tracks · 47:22
            


          


          


            "It listens back. That is the whole trick of it — every note feels like the album is paying attention to you."
          


        


      


    


  )
}

function SectionHeader({ num, title, right }) {
  return (
    


      {num}
      

{title}


      


        {right}
      


    


  )
}

function ReviewCard({ r }) {
  return (
    


      


      


        {r.genre}
        {r.date}
      


      


        {r.badge && (
          
            {r.badge}
          
        )}
        

{r.title}


        

{r.artist}


      


      


        


          {r.score}/10
        


        


          {r.label}
          {r.format}
        


      


    


  )
}

function ReviewsGrid() {
  return (
    


      {REVIEWS.map((r, i) => )}
    


  )
}

function Manifesto() {
  return (
    


      


        Thirty years on, we still believe a record is a place — and a review is the postcard home.
      


      
        — Editorial, Spring 2026
      
    


  )
}

function FromTheArchive() {
  return (
    


      {/* head */}
      


        § 03
        


          From the archive — thirty years ago this week.
        


        


          ISSUE № 011

          Filed 05.06.1996

          Volume I · No. 11

          Originally in print
        


      



      {/* body */}
      


        {/* art column */}
        


          


            


              From the stacks

              SPRING / 1996
            


          


          


            VESPERTINE SIX — Sleeve & Sleeve

            Tigerhand Recordings · CD/LP · 38:14

            Released April 1996 · 9 tracks
          


        



        {/* text column */}
        


          On this day · 30 years ago
          


            "A debut that knew exactly what it was."
          


          


            Reviewed by B. Solène Marquet
            Filed 05.06.1996
            Genre Post-rock / Slowcore
          


          


            


              For most of its 38 minutes Sleeve & Sleeve refuses to raise its voice. The Brooklyn quartet's debut is built from quiet asymmetries — a guitar line that won't quite resolve, a snare that arrives a fraction late on purpose, a singer who treats every word as if it might break in her hands.
            


            


              The record knows it could be louder. It refuses the offer. By the closing track, an eight-minute exhalation called "Sleeve, Reprise," you understand exactly why: this is a band more interested in the room after the song ends than in the song itself.
            


          


          


            


              8.4/10
            


            


              Originally rated
              Score system unchanged

              since November 1995
            


            


              
                → Read in full · 6 min
              
            


          


        


      



      {/* also from this week */}
      


        


          
          Also this week in '96 — the original three-album round-up
        


        


          {ARCHIVE_MINIS.map((m, i) => (
            


              


              


                

{m.title}


                


                  {m.artist} · {m.label}
                


              


              


                {m.score}
              


            


          ))}
        


      


    


  )
}

function ArchiveTimeline() {
  return (
    


      


        


          Three decades, one obsession.
        


        


          An archive of 38,412 reviews, going back to the first issue, October 1995. Browse by year, decade, label, or score.
        


      


      


        {DECADES.map((d, i) => (
          


            


              {d.years}
            


            


              {d.count}
            


            


              {d.label}
            


          


        ))}
      


    


  )
}

function LatestList() {
  return (
    


      


        Latest reviews, all of them.
      


      


        {LATEST.map((row, i) => (
          


            

{row.num}


            


              

{row.title}


              

{row.artist} · {row.label}


            


            

{row.genre}


            

{row.date}


            


              {row.score}
            


          


        ))}
      


    


  )
}

function Footer() {
  return (
    


      


        


          


            cdreviews.
          


          


            A music review publication of record. Independent since 1995. Reading rooms in Brooklyn, Berlin & Tokyo.
          


        



        {FOOTER_COLS.map((col, i) => (
          


            


              {col.heading}
            


            


              {col.links.map(link => (
                


                  {link}
                


              ))}
            


          


        ))}

        


          

The Mailer


          


            A weekly letter from the editor. Reviews, dispatches, the occasional argument.
          


          


            @email"
              className="flex-1 bg-transparent border-0 px-3 py-2.5 text-bone font-mono text-[11px] outline-none placeholder:text-bone/40"
            />
            
              Send →
            
          
        
      

      


        

© 1995 — 2026 cdreviews


        

All rights reserved · Print ISSN 1095‑3814


        

A publication of the third floor.


      


    
  )
}

// ────────────────────────────────────────────────────────────────
// APP
// ────────────────────────────────────────────────────────────────

export default function App() {
  return (
    


      
      
      
      
      Sorted by score · View all 47 →}
      />
      
      
      
      
      
      


    


  )
}

After scaffolding, the page should render with:

A live ticker at the top (vermillion + acid green on black)
A massive serif wordmark "cdreviews."
A featured review hero with score 9.1 in giant Fraunces serif
An 8-card grid of "Best New" reviews
A manifesto pull-quote
A "From the Archive" section in warm cream paper tone with a 1996 review
An 8-cell decade timeline ending in a vermillion "2027" cell
A latest reviews list
A dark footer with email signup

If anything is missing or off, the source of truth is the files above — re-check rather than improvising replacements.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cdreviews.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1dc32c85-a464-48ab-a9f0-3595e4dda54e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
