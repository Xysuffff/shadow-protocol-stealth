// Shadow Protocol - Main Entry Point
// Top-down stealth infiltration game

import { Game } from './game.js';
import { Input } from './input.js';
import { Audio } from './audio.js';
import { Renderer } from './renderer.js';
import { LevelManager } from './levels.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let game = null;
let lastTime = 0;
let animationId = null;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  if (game) game.resize(canvas.width, canvas.height, dpr);
}

function gameLoop(time) {
  const dt = Math.min((time - lastTime) / 1000, 1/30);
  lastTime = time;
  
  if (game) {
    game.update(dt);
    game.render();
  }
  
  animationId = requestAnimationFrame(gameLoop);
}

async function init() {
  resize();
  window.addEventListener('resize', resize);
  
  const input = new Input();
  const audio = new Audio();
  await audio.init();
  
  const renderer = new Renderer(canvas, ctx);
  const levelManager = new LevelManager();
  
  game = new Game(canvas, ctx, input, audio, renderer, levelManager);
  game.resize(canvas.width, canvas.height, window.devicePixelRatio || 1);
  
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
  
  // Start audio on first user interaction
  function startAudio() {
    audio.resume();
    document.removeEventListener('click', startAudio);
    document.removeEventListener('keydown', startAudio);
  }
  document.addEventListener('click', startAudio);
  document.addEventListener('keydown', startAudio);
}

init();