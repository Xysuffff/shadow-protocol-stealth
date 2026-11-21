// Shadow Protocol - Core Game Logic

import { LEVELS } from './levels.js';

export class Game {
  constructor(canvas, ctx, input, audio, renderer, levelManager) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.input = input;
    this.audio = audio;
    this.renderer = renderer;
    this.levelManager = levelManager;
    
    this.state = 'title'; // title, playing, levelComplete, gameOver, paused
    this.level = null;
    this.player = null;
    this.guards = [];
    this.particles = [];
    this.exit = null;
    
    // Game constants
    this.PLAYER_SPEED = 180;
    this.PLAYER_SNEAK_SPEED = 90;
    this.PLAYER_RADIUS = 16;
    this.GUARD_RADIUS = 18;
    
    // UI elements
    this.uiLevel = document.getElementById('ui-level');
    this.uiAlert = document.getElementById('ui-alert');
    this.uiStealth = document.getElementById('ui-stealth');
    this.msgEl = document.getElementById('msg');
    this.titleScreen = document.getElementById('title-screen');
    this.levelCompleteEl = document.getElementById('level-complete');
    this.gameOverEl = document.getElementById('game-over');
    this.nextLevelBtn = document.getElementById('next-level-btn');
    this.retryBtn = document.getElementById('retry-btn');
    this.startBtn = document.getElementById('start-btn');
    
    this._bindUI();
    this._initLevel(0);
  }
  
  _bindUI() {
    this.startBtn.addEventListener('click', () => this._startGame());
    this.nextLevelBtn.addEventListener('click', () => this._nextLevel());
    this.retryBtn.addEventListener('click', () => this._retryLevel());
    
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.state === 'playing') this._pause();
        else if (this.state === 'paused') this._resume();
      }
    });
  }
  
  _startGame() {
    this.titleScreen.classList.remove('show');
    this.state = 'playing';
    this.audio.playMusic();
    this._showMessage('INFILTRATION BEGINS', 2000);
  }
  
  _pause() {
    this.state = 'paused';
    this.audio.stopMusic();
    this._showMessage('PAUSED - PRESS ESC TO RESUME', 0);
  }
  
  _resume() {
    this.state = 'playing';
    this.audio.playMusic();
    this.msgEl.classList.remove('show');
  }
  
  _nextLevel() {
    this.levelCompleteEl.classList.remove('show');
    const next = this.levelManager.nextLevel();
    if (this.levelManager.isLastLevel() && this.levelManager.getLevelIndex() === this.levelManager.getTotalLevels() - 1) {
      // Game complete
      this._showMessage('ALL SECTORS CLEARED - MISSION ACCOMPLISHED', 4000);
      this.state = 'title';
      this.levelManager.reset();
      this._initLevel(0);
      this.titleScreen.classList.add('show');
      this.audio.stopMusic();
    } else {
      this._initLevel(this.levelManager.getLevelIndex());
      this._showMessage(`ENTERING ${next.name}`, 2000);
    }
  }
  
  _retryLevel() {
    this.gameOverEl.classList.remove('show');
    this._initLevel(this.levelManager.getLevelIndex());
    this._showMessage('RETRYING SECTOR...', 1500);
  }
  
  _initLevel(index) {
    const levelData = LEVELS[index];
    this.level = { ...levelData };
    
    // Initialize player
    this.player = {
      x: levelData.playerStart.x,
      y: levelData.playerStart.y,
      radius: this.PLAYER_RADIUS,
      direction: { x: 1, y: 0 },
      stealth: 1.0,
      maxStealth: 1.0,
      footstepTimer: 0,
      lastSafePos: { x: levelData.playerStart.x, y: levelData.playerStart.y }
    };
    
    // Initialize guards
    this.guards = levelData.guards.map((g, i) => ({
      ...g,
      id: i,
      radius: this.GUARD_RADIUS,
      currentPatrolIndex: 0,
      patrolProgress: 0,
      direction: { x: 1, y: 0 },
      alertLevel: 0, // 0 = calm, 1 = suspicious, 2 = investigating, 3 = alerted
      alertTimer: 0,
      lastKnownPlayerPos: null,
      investigationTarget: null,
      returnTarget: null,
      seenPlayer: false,
      detectionAccumulator: 0,
      footstepTimer: 0
    }));
    
    // Initialize exit
    this.exit = {
      ...levelData.exit,
      active: false,
      progress: 0,
      interactionTimer: 0
    };
    
    // Particles
    this.particles = [];
    
    // Camera
    this.renderer.setCamera(
      levelData.playerStart.x,
      levelData.playerStart.y,
      this._calculateZoom()
    );
    
    // UI
    this.uiLevel.textContent = index + 1;
    this.uiAlert.style.width = '0%';
    this.uiAlert.className = 'bar';
    this.uiStealth.style.width = '100%';
    this.uiStealth.className = 'bar';
  }
  
  _calculateZoom() {
    const level = this.level;
    const canvasW = this.canvas.width / this.renderer.dpr;
    const canvasH = this.canvas.height / this.renderer.dpr;
    const scaleX = canvasW / level.width;
    const scaleY = canvasH / level.height;
    return Math.min(scaleX, scaleY) * 0.9;
  }
  
  resize(width, height, dpr) {
    this.renderer.resize(width, height, dpr);
    if (this.level) {
      this.renderer.setCamera(
        this.player.x, this.player.y,
        this._calculateZoom()
      );
    }
  }
  
  update(dt) {
    if (this.state !== 'playing') return;
    
    this.input.clear();
    
    // Update camera smoothly
    this._updateCamera(dt);
    
    // Update player
    this._updatePlayer(dt);
    
    // Update guards
    this._updateGuards(dt);
    
    // Update exit
    this._updateExit(dt);
    
    // Update particles
    this._updateParticles(dt);
    
    // Check win/lose conditions
    this._checkConditions();
    
    // Update UI
    this._updateUI();
  }
  
  _updateCamera(dt) {
    const targetX = this.player.x;
    const targetY = this.player.y;
    const currentX = this.renderer.camera.x;
    const currentY = this.renderer.camera.y;
    
    const lerp = 0.08;
    this.renderer.setCamera(
      currentX + (targetX - currentX) * lerp,
      currentY + (targetY - currentY) * lerp,
      this._calculateZoom()
    );
  }
  
  _updatePlayer(dt) {
    const move = this.input.getMoveVector();
    const sneaking = this.input.isSneaking();
    const speed = sneaking ? this.PLAYER_SNEAK_SPEED : this.PLAYER_SPEED;
    
    // Calculate intended movement
    let newX = this.player.x + move.x * speed * dt;
    let newY = this.player.y + move.y * speed * dt;
    
    // Wall collision
    const radius = this.player.radius;
    for (const wall of this.level.walls) {
      // Check collision with expanded wall
      const wx1 = wall.x - radius;
      const wy1 = wall.y - radius;
      const wx2 = wall.x + wall.w + radius;
      const wy2 = wall.y + wall.h + radius;
      
      if (newX > wx1 && newX < wx2 && newY > wy1 && newY < wy2) {
        // Collision - try sliding along walls
        const prevX = this.player.x;
        const prevY = this.player.y;
        
        // Try X only
        if (prevX > wx1 && prevX < wx2) {
          newX = prevX;
        } else if (newX > wx1 && newX < wx2) {
          // X is fine
        } else {
          newX = prevX;
        }
        
        // Try Y only
        if (prevY > wy1 && prevY < wy2) {
          newY = prevY;
        } else if (newY > wy1 && newY < wy2) {
          // Y is fine
        } else {
          newY = prevY;
        }
        
        // Final check
        let colliding = false;
        for (const w of this.level.walls) {
          const wwx1 = w.x - radius;
          const wwy1 = w.y - radius;
          const wwx2 = w.x + w.w + radius;
          const wwy2 = w.y + w.h + radius;
          if (newX > wwx1 && newX < wwx2 && newY > wwy1 && newY < wwy2) {
            colliding = true;
            break;
          }
        }
        if (colliding) {
          newX = prevX;
          newY = prevY;
        }
        break;
      }
    }
    
    // Cover collision (can hide behind)
    for (const cover of this.level.covers) {
      const dx = newX - cover.x;
      const dy = newY - cover.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = radius + cover.radius;
      if (dist < minDist && dist > 0.1) {
        const pushX = (dx / dist) * (minDist - dist);
        const pushY = (dy / dist) * (minDist - dist);
        newX += pushX;
        newY += pushY;
      }
    }
    
    // Guard collision
    for (const guard of this.guards) {
      const dx = newX - guard.x;
      const dy = newY - guard.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = radius + guard.radius;
      if (dist < minDist && dist > 0.1) {
        const pushX = (dx / dist) * (minDist - dist) * 0.5;
        const pushY = (dy / dist) * (minDist - dist) * 0.5;
        newX += pushX;
        newY += pushY;
        
        // Guard pushes back
        guard.x -= pushX;
        guard.y -= pushY;
      }
    }
    
    // Boundary check
    newX = Math.max(radius, Math.min(this.level.width - radius, newX));
    newY = Math.max(radius, Math.min(this.level.height - radius, newY));
    
    // Update position
    const moved = Math.abs(newX - this.player.x) > 0.1 || Math.abs(newY - this.player.y) > 0.1;
    this.player.x = newX;
    this.player.y = newY;
    
    // Update direction if moving
    if (moved) {
      const dx = newX - this.player.lastSafePos.x;
      const dy = newY - this.player.lastSafePos.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0.1) {
        this.player.direction.x = dx / len;
        this.player.direction.y = dy / len;
      }
      this.player.lastSafePos = { x: newX, y: newY };
    }
    
    // Footstep sounds
    if (moved) {
      this.player.footstepTimer -= dt;
      if (this.player.footstepTimer <= 0) {
        this.audio.playFootstep(sneaking);
        this.player.footstepTimer = sneaking ? 0.6 : 0.35;
        
        // Footstep particles
        if (!sneaking && Math.random() < 0.3) {
          this._spawnParticles(this.player.x, this.player.y, '#4ade80', 3, 0.5);
        }
      }
    }
    
    // Stealth mechanics
    if (sneaking) {
      this.player.stealth = Math.min(this.player.maxStealth, this.player.stealth + dt * 0.5);
    } else if (moved) {
      this.player.stealth = Math.max(0, this.player.stealth - dt * 0.3);
    } else {
      this.player.stealth = Math.min(this.player.maxStealth, this.player.stealth + dt * 0.2);
    }
    
    // Interact with exit
    if (this.input.isInteractPressed() && this.exit.active) {
      const dx = this.player.x - this.exit.x;
      const dy = this.player.y - this.exit.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.player.radius + this.exit.radius + 20) {
        this.exit.interactionTimer += dt;
        this.exit.progress = Math.min(1, this.exit.interactionTimer / 2.0);
        if (this.exit.progress >= 1) {
          this._levelComplete();
        }
      } else {
        this.exit.interactionTimer = 0;
        this.exit.progress = 0;
      }
    } else {
      this.exit.interactionTimer = 0;
      this.exit.progress = 0;
    }
  }
  
  _updateGuards(dt) {
    for (const guard of this.guards) {
      this._updateGuard(guard, dt);
    }
  }
  
  _updateGuard(guard, dt) {
    // Footstep sounds for guards (when close)
    const dxToPlayer = this.player.x - guard.x;
    const dyToPlayer = this.player.y - guard.y;
    const distToPlayer = Math.sqrt(dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer);
    
    if (distToPlayer < 300) {
      guard.footstepTimer -= dt;
      if (guard.footstepTimer <= 0) {
        // Muffled guard footsteps
        this.audio.playFootstep(true);
        guard.footstepTimer = 0.5 + Math.random() * 0.3;
      }
    }
    
    // Check if player is in vision cone
    const inVision = this._checkVision(guard);
    const inRange = distToPlayer < guard.viewDistance;
    const canSeePlayer = inVision && inRange;
    
    // Check cover - raycast from guard to player
    let blockedByCover = false;
    if (canSeePlayer) {
      for (const cover of this.level.covers) {
        if (this._lineIntersectsCircle(guard.x, guard.y, this.player.x, this.player.y, cover.x, cover.y, cover.radius + 5)) {
          blockedByCover = true;
          break;
        }
      }
      // Also check walls
      for (const wall of this.level.walls) {
        if (this._lineIntersectsRect(guard.x, guard.y, this.player.x, this.player.y, wall)) {
          blockedByCover = true;
          break;
        }
      }
    }
    
    const actuallySeesPlayer = canSeePlayer && !blockedByCover;
    
    // Detection logic
    if (actuallySeesPlayer) {
      // Calculate detection rate based on distance, stealth, alert level
      const distanceFactor = 1 - Math.min(1, distToPlayer / guard.viewDistance);
      const stealthFactor = 1 - this.player.stealth;
      const alertFactor = 0.5 + guard.alertLevel * 0.3;
      const baseRate = 0.8 * distanceFactor * stealthFactor * alertFactor;
      
      guard.detectionAccumulator += baseRate * dt;
      guard.seenPlayer = true;
      guard.lastKnownPlayerPos = { x: this.player.x, y: this.player.y };
      
      // Alert level escalation
      if (guard.detectionAccumulator > 1.0) {
        guard.alertLevel = Math.min(3, guard.alertLevel + 1);
        guard.detectionAccumulator = 0;
        
        if (guard.alertLevel === 1) {
          this.audio.playAlert(1);
          this._showMessage('GUARD SUSPICIOUS', 1500);
        } else if (guard.alertLevel === 2) {
          this.audio.playAlert(2);
          this._showMessage('GUARD INVESTIGATING', 1500);
          guard.investigationTarget = { ...guard.lastKnownPlayerPos };
        } else if (guard.alertLevel === 3) {
          this.audio.playDetected();
          this._showMessage('DETECTED!', 1000);
        }
      }
    } else {
      // Detection cooldown
      guard.detectionAccumulator = Math.max(0, guard.detectionAccumulator - dt * 0.3);
      
      // Alert level de-escalation
      if (guard.alertLevel > 0) {
        guard.alertTimer += dt;
        const deescalateTime = [0, 8, 15, 30][guard.alertLevel];
        if (guard.alertTimer > deescalateTime) {
          guard.alertLevel = Math.max(0, guard.alertLevel - 1);
          guard.alertTimer = 0;
          if (guard.alertLevel === 0) {
            guard.investigationTarget = null;
            guard.returnTarget = { x: guard.patrolPoints[0].x, y: guard.patrolPoints[0].y };
          }
        }
      }
    }
    
    // Movement behavior based on alert level
    if (guard.alertLevel === 0) {
      // Normal patrol
      this._patrolGuard(guard, dt);
    } else if (guard.alertLevel === 1) {
      // Suspicious - pause and look around
      guard.patrolProgress = 0;
    } else if (guard.alertLevel === 2) {
      // Investigating - move to last known position
      if (guard.investigationTarget) {
        this._moveGuardToTarget(guard, guard.investigationTarget, dt, guard.speed * 1.2);
        const dx = guard.x - guard.investigationTarget.x;
        const dy = guard.y - guard.investigationTarget.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
          guard.investigationTarget = null;
          guard.alertTimer = 0; // Start de-escalation timer
        }
      }
    } else if (guard.alertLevel === 3) {
      // Alerted - chase player
      this._moveGuardToTarget(guard, this.player, dt, guard.speed * 1.5);
      
      // Check catch
      if (distToPlayer < guard.radius + this.player.radius + 5) {
        this._gameOver();
      }
    }
    
    // Update guard direction
    if (guard.patrolPoints && guard.patrolPoints.length > 0) {
      const target = guard.patrolPoints[guard.currentPatrolIndex];
      const dx = target.x - guard.x;
      const dy = target.y - guard.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 1) {
        guard.direction.x = dx / len;
        guard.direction.y = dy / len;
      }
    }
  }
  
  _patrolGuard(guard, dt) {
    if (!guard.patrolPoints || guard.patrolPoints.length === 0) return;
    
    const target = guard.patrolPoints[guard.currentPatrolIndex];
    const dx = target.x - guard.x;
    const dy = target.y - guard.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 10) {
      // Reached patrol point
      guard.currentPatrolIndex = (guard.currentPatrolIndex + 1) % guard.patrolPoints.length;
      guard.patrolProgress = 0;
    } else {
      // Move towards target
      const moveX = (dx / dist) * guard.speed * dt;
      const moveY = (dy / dist) * guard.speed * dt;
      
      // Check wall collision for guard
      let newX = guard.x + moveX;
      let newY = guard.y + moveY;
      
      for (const wall of this.level.walls) {
        const wx1 = wall.x - guard.radius;
        const wy1 = wall.y - guard.radius;
        const wx2 = wall.x + wall.w + guard.radius;
        const wy2 = wall.y + wall.h + guard.radius;
        
        if (newX > wx1 && newX < wx2 && newY > wy1 && newY < wy2) {
          // Slide along wall
          if (guard.x > wx1 && guard.x < wx2) newX = guard.x;
          if (guard.y > wy1 && guard.y < wy2) newY = guard.y;
        }
      }
      
      guard.x = newX;
      guard.y = newY;
    }
  }
  
  _moveGuardToTarget(guard, target, dt, speed) {
    const dx = target.x - guard.x;
    const dy = target.y - guard.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 5) return;
    
    const moveX = (dx / dist) * speed * dt;
    const moveY = (dy / dist) * speed * dt;
    
    let newX = guard.x + moveX;
    let newY = guard.y + moveY;
    
    // Wall collision
    for (const wall of this.level.walls) {
      const wx1 = wall.x - guard.radius;
      const wy1 = wall.y - guard.radius;
      const wx2 = wall.x + wall.w + guard.radius;
      const wy2 = wall.y + wall.h + guard.radius;
      
      if (newX > wx1 && newX < wx2 && newY > wy1 && newY < wy2) {
        if (guard.x > wx1 && guard.x < wx2) newX = guard.x;
        if (guard.y > wy1 && guard.y < wy2) newY = guard.y;
      }
    }
    
    guard.x = newX;
    guard.y = newY;
  }
  
  _checkVision(guard) {
    const dx = this.player.x - guard.x;
    const dy = this.player.y - guard.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > guard.viewDistance) return false;
    
    const angleToPlayer = Math.atan2(dy, dx);
    const guardAngle = Math.atan2(guard.direction.y, guard.direction.x);
    let diff = angleToPlayer - guardAngle;
    
    // Normalize angle difference
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    return Math.abs(diff) < guard.fov / 2;
  }
  
  _lineIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - cx;
    const fy = y1 - cy;
    
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = (fx * fx + fy * fy) - r * r;
    
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return false;
    
    discriminant = Math.sqrt(discriminant);
    const t1 = (-b - discriminant) / (2 * a);
    const t2 = (-b + discriminant) / (2 * a);
    
    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
  }
  
  _lineIntersectsRect(x1, y1, x2, y2, rect) {
    // Check intersection with each edge of rectangle
    const edges = [
      { x1: rect.x, y1: rect.y, x2: rect.x + rect.w, y2: rect.y },
      { x1: rect.x + rect.w, y1: rect.y, x2: rect.x + rect.w, y2: rect.y + rect.h },
      { x1: rect.x + rect.w, y1: rect.y + rect.h, x2: rect.x, y2: rect.y + rect.h },
      { x1: rect.x, y1: rect.y + rect.h, x2: rect.x, y2: rect.y }
    ];
    
    for (const edge of edges) {
      if (this._linesIntersect(x1, y1, x2, y2, edge.x1, edge.y1, edge.x2, edge.y2)) {
        return true;
      }
    }
    return false;
  }
  
  _linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return false;
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }
  
  _updateExit(dt) {
    // Exit becomes active when all guards are calm (alert level 0)
    const allCalm = this.guards.every(g => g.alertLevel === 0);
    this.exit.active = allCalm;
    
    // Visual pulse when active
    if (this.exit.active) {
      // Already handled in renderer
    }
  }
  
  _updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 20 * dt; // gravity
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  _spawnParticles(x, y, color, count, life) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 40;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        size: 2 + Math.random() * 3,
        color,
        life,
        maxLife: life
      });
    }
  }
  
  _checkConditions() {
    // Check if player reached exit
    if (this.exit.active && this.exit.progress >= 1) {
      this._levelComplete();
    }
  }
  
  _levelComplete() {
    this.state = 'levelComplete';
    this.audio.playLevelComplete();
    this.audio.playDoorOpen();
    this._spawnParticles(this.exit.x, this.exit.y, '#4ade80', 30, 2);
    this.levelCompleteEl.classList.add('show');
    
    if (this.levelManager.isLastLevel()) {
      this.nextLevelBtn.textContent = 'MISSION COMPLETE';
    }
  }
  
  _gameOver() {
    this.state = 'gameOver';
    this.audio.playGameOver();
    this.audio.stopMusic();
    this._spawnParticles(this.player.x, this.player.y, '#ef4444', 40, 2);
    this.gameOverEl.classList.add('show');
  }
  
  _updateUI() {
    // Alert level - max of all guards
    const maxAlert = Math.max(...this.guards.map(g => g.alertLevel));
    const alertPct = (maxAlert / 3) * 100;
    this.uiAlert.style.width = alertPct + '%';
    this.uiAlert.className = 'bar' + (maxAlert >= 2 ? ' danger' : maxAlert >= 1 ? ' warn' : '');
    
    // Stealth
    const stealthPct = this.player.stealth * 100;
    this.uiStealth.style.width = stealthPct + '%';
    this.uiStealth.className = 'bar' + (this.player.stealth < 0.3 ? ' danger' : this.player.stealth < 0.6 ? ' warn' : '');
  }
  
  _showMessage(text, duration) {
    this.msgEl.textContent = text;
    this.msgEl.classList.add('show');
    if (duration > 0) {
      setTimeout(() => this.msgEl.classList.remove('show'), duration);
    }
  }
  
  render() {
    const ctx = this.ctx;
    const dpr = this.renderer.dpr;
    const cw = this.canvas.width / dpr;
    const ch = this.canvas.height / dpr;
    
    // Clear
    this.renderer.clear();
    
    // Draw floor
    this.renderer.drawFloor({ x: 0, y: 0, w: this.level.width, h: this.level.height });
    
    // Draw walls
    for (const wall of this.level.walls) {
      this.renderer.drawWall(wall.x, wall.y, wall.w, wall.h);
    }
    
    // Draw covers
    for (const cover of this.level.covers) {
      this.renderer.drawCover(cover.x, cover.y, cover.radius);
    }
    
    // Draw exit
    this.renderer.drawExit(this.exit.x, this.exit.y, this.exit.radius, this.exit.active, this.exit.progress);
    
    // Draw guards
    for (const guard of this.guards) {
      this.renderer.drawGuard(
        guard.x, guard.y, guard.radius,
        guard.direction, guard.fov, guard.alertLevel,
        guard.patrolPoints, guard.currentPatrolIndex
      );
    }
    
    // Draw player
    this.renderer.drawPlayer(
      this.player.x, this.player.y, this.player.radius,
      this.player.direction, this.input.isSneaking(),
      this.player.stealth, maxAlert >= 3
    );
    
    // Draw particles
    this.renderer.drawParticles(this.particles);
    
    // Screen effects
    const maxAlert = Math.max(...this.guards.map(g => g.alertLevel));
    if (maxAlert >= 2) {
      this.renderer.drawScreenEffect('alert', (maxAlert - 1) / 2);
    }
  }
}

// Helper to get max alert level
function maxAlert(guards) {
  return Math.max(...guards.map(g => g.alertLevel));
}