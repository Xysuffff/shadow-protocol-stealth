// Shadow Protocol - Renderer
// Handles all drawing operations

export class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.dpr = 1;
    this.camera = { x: 0, y: 0, zoom: 1 };
    
    // Pre-rendered patterns
    this.patterns = {};
    this._createPatterns();
  }
  
  resize(width, height, dpr) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  
  setCamera(x, y, zoom = 1) {
    this.camera.x = x;
    this.camera.y = y;
    this.camera.zoom = zoom;
  }
  
  worldToScreen(wx, wy) {
    const cx = this.width / this.dpr / 2;
    const cy = this.height / this.dpr / 2;
    return {
      x: cx + (wx - this.camera.x) * this.camera.zoom,
      y: cy + (wy - this.camera.y) * this.camera.zoom
    };
  }
  
  clear(color = '#0a0c10') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width / this.dpr, this.height / this.dpr);
  }
  
  _createPatterns() {
    // Floor pattern
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 64;
    floorCanvas.height = 64;
    const fctx = floorCanvas.getContext('2d');
    fctx.fillStyle = '#0d1018';
    fctx.fillRect(0, 0, 64, 64);
    // Grid lines
    fctx.strokeStyle = '#1a1f2e';
    fctx.lineWidth = 1;
    for (let i = 0; i <= 64; i += 16) {
      fctx.beginPath();
      fctx.moveTo(i, 0); fctx.lineTo(i, 64);
      fctx.moveTo(0, i); fctx.lineTo(64, i);
      fctx.stroke();
    }
    // Subtle noise
    for (let i = 0; i < 200; i++) {
      fctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`;
      fctx.fillRect(Math.random() * 64, Math.random() * 64, 1, 1);
    }
    this.patterns.floor = this.ctx.createPattern(floorCanvas, 'repeat');
    
    // Wall pattern
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 64;
    wallCanvas.height = 64;
    const wctx = wallCanvas.getContext('2d');
    const wallGrad = wctx.createLinearGradient(0, 0, 64, 64);
    wallGrad.addColorStop(0, '#1e2430');
    wallGrad.addColorStop(0.5, '#2a3140');
    wallGrad.addColorStop(1, '#1a1f2a');
    wctx.fillStyle = wallGrad;
    wctx.fillRect(0, 0, 64, 64);
    // Brick lines
    wctx.strokeStyle = '#3a4155';
    wctx.lineWidth = 1;
    for (let y = 0; y < 64; y += 16) {
      for (let x = 0; x < 64; x += 32) {
        const ox = (y / 16) % 2 === 0 ? 0 : 16;
        wctx.beginPath();
        wctx.rect(x + ox, y, 32, 16);
        wctx.stroke();
      }
    }
    this.patterns.wall = this.ctx.createPattern(wallCanvas, 'repeat');
    
    // Cover pattern (crates, barrels)
    const coverCanvas = document.createElement('canvas');
    coverCanvas.width = 32;
    coverCanvas.height = 32;
    const cctx = coverCanvas.getContext('2d');
    const coverGrad = cctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    coverGrad.addColorStop(0, '#3d3428');
    coverGrad.addColorStop(1, '#251d15');
    cctx.fillStyle = coverGrad;
    cctx.beginPath();
    cctx.arc(16, 16, 14, 0, Math.PI * 2);
    cctx.fill();
    // Metal bands
    cctx.strokeStyle = '#4a3d2a';
    cctx.lineWidth = 2;
    cctx.beginPath();
    cctx.arc(16, 16, 14, 0, Math.PI * 2);
    cctx.stroke();
    cctx.beginPath();
    cctx.moveTo(4, 16); cctx.lineTo(28, 16);
    cctx.stroke();
    this.patterns.cover = this.ctx.createPattern(coverCanvas, 'repeat');
  }
  
  drawFloor(bounds) {
    this.ctx.save();
    this.ctx.fillStyle = this.patterns.floor;
    this.ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
    this.ctx.restore();
  }
  
  drawWall(x, y, w, h) {
    this.ctx.save();
    const screen = this.worldToScreen(x, y);
    const sw = w * this.camera.zoom;
    const sh = h * this.camera.zoom;
    this.ctx.fillStyle = this.patterns.wall;
    this.ctx.fillRect(screen.x, screen.y, sw, sh);
    // Top highlight
    this.ctx.fillStyle = 'rgba(255,255,255,0.05)';
    this.ctx.fillRect(screen.x, screen.y, sw, 2 * this.camera.zoom);
    // Left shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.fillRect(screen.x, screen.y, 2 * this.camera.zoom, sh);
    this.ctx.restore();
  }
  
  drawCover(x, y, radius) {
    this.ctx.save();
    const screen = this.worldToScreen(x, y);
    const sr = radius * this.camera.zoom;
    this.ctx.translate(screen.x, screen.y);
    // Shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
    this.ctx.beginPath();
    this.ctx.ellipse(sr * 0.3, sr * 0.5, sr * 0.8, sr * 0.3, 0, 0, Math.PI * 2);
    this.ctx.fill();
    // Body
    const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, sr);
    grad.addColorStop(0, '#3d3428');
    grad.addColorStop(0.7, '#2d251a');
    grad.addColorStop(1, '#1a1510');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, sr, 0, Math.PI * 2);
    this.ctx.fill();
    // Highlight
    this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    this.ctx.lineWidth = 2 * this.camera.zoom;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, sr * 0.9, -Math.PI/2, Math.PI/2);
    this.ctx.stroke();
    this.ctx.restore();
  }
  
  drawPlayer(x, y, radius, direction, sneaking, stealth, detected) {
    this.ctx.save();
    const screen = this.worldToScreen(x, y);
    this.ctx.translate(screen.x, screen.y);
    const sr = radius * this.camera.zoom;
    
    // Shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(sr * 0.25, sr * 0.4, sr * 0.7, sr * 0.25, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Body - color based on stealth level
    let bodyColor = '#4ade80';
    if (stealth < 0.3) bodyColor = '#f87171';
    else if (stealth < 0.6) bodyColor = '#fbbf24';
    
    if (detected) {
      bodyColor = '#ef4444';
      // Pulse effect
      const pulse = 1 + Math.sin(performance.now() / 80) * 0.1;
      this.ctx.scale(pulse, pulse);
    }
    
    const bodyGrad = this.ctx.createRadialGradient(0, -sr * 0.2, 0, 0, 0, sr);
    bodyGrad.addColorStop(0, bodyColor);
    bodyGrad.addColorStop(1, this._darkenColor(bodyColor, 0.4));
    this.ctx.fillStyle = bodyGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, sr, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Sneaking indicator
    if (sneaking) {
      this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      this.ctx.lineWidth = 2 * this.camera.zoom;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, sr * 1.3, 0, Math.PI * 2);
      this.ctx.stroke();
      // Inner ring
      this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      this.ctx.lineWidth = 1 * this.camera.zoom;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, sr * 1.6, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    // Direction indicator (eyes)
    const eyeDist = sr * 0.4;
    const eyeSize = sr * 0.15;
    this.ctx.fillStyle = '#0a0c10';
    this.ctx.beginPath();
    this.ctx.arc(direction.x * eyeDist, direction.y * eyeDist - sr * 0.15, eyeSize, 0, Math.PI * 2);
    this.ctx.arc(-direction.y * eyeDist * 0.5, direction.x * eyeDist * 0.5 - sr * 0.15, eyeSize * 0.7, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Stealth meter ring
    if (stealth < 1) {
      this.ctx.strokeStyle = bodyColor;
      this.ctx.lineWidth = 3 * this.camera.zoom;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, sr * 1.1, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * stealth);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  drawGuard(x, y, radius, direction, fov, alertLevel, patrolPoints, currentPatrolIndex) {
    this.ctx.save();
    const screen = this.worldToScreen(x, y);
    this.ctx.translate(screen.x, screen.y);
    const sr = radius * this.camera.zoom;
    
    // Patrol path (faint)
    if (patrolPoints && patrolPoints.length > 1) {
      this.ctx.strokeStyle = 'rgba(239,68,68,0.15)';
      this.ctx.lineWidth = 1 * this.camera.zoom;
      this.ctx.setLineDash([8, 8] * this.camera.zoom);
      this.ctx.beginPath();
      const first = this.worldToScreen(patrolPoints[0].x, patrolPoints[0].y);
      this.ctx.moveTo(first.x - screen.x, first.y - screen.y);
      for (let i = 1; i < patrolPoints.length; i++) {
        const p = this.worldToScreen(patrolPoints[i].x, patrolPoints[i].y);
        this.ctx.lineTo(p.x - screen.x, p.y - screen.y);
      }
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
    
    // Vision cone
    if (alertLevel < 3) {
      this._drawVisionCone(sr, direction, fov, alertLevel);
    } else {
      // Full circle when fully alerted
      this._drawVisionCone(sr, direction, Math.PI * 2, alertLevel);
    }
    
    // Shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.35)';
    this.ctx.beginPath();
    this.ctx.ellipse(sr * 0.25, sr * 0.4, sr * 0.7, sr * 0.25, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Body color based on alert level
    let bodyColor = '#f87171';
    if (alertLevel === 0) bodyColor = '#ef4444';
    else if (alertLevel === 1) bodyColor = '#fbbf24';
    else if (alertLevel === 2) bodyColor = '#fb923c';
    
    const bodyGrad = this.ctx.createRadialGradient(0, -sr * 0.2, 0, 0, 0, sr);
    bodyGrad.addColorStop(0, bodyColor);
    bodyGrad.addColorStop(1, this._darkenColor(bodyColor, 0.4));
    this.ctx.fillStyle = bodyGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, sr, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Helmet/visor
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.beginPath();
    this.ctx.arc(0, -sr * 0.1, sr * 0.7, Math.PI, 0);
    this.ctx.fill();
    
    // Visor glow
    const visorColor = alertLevel >= 2 ? '#ef4444' : (alertLevel === 1 ? '#fbbf24' : '#4ade80');
    this.ctx.fillStyle = visorColor;
    this.ctx.beginPath();
    this.ctx.arc(direction.x * sr * 0.3, direction.y * sr * 0.3 - sr * 0.1, sr * 0.25, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Alert indicator
    if (alertLevel > 0) {
      const symbols = ['!', '!!', '!!!'];
      this.ctx.font = `bold ${sr * 0.9}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(symbols[Math.min(alertLevel - 1, 2)], 0, -sr * 1.5);
    }
    
    this.ctx.restore();
  }
  
  _drawVisionCone(radius, direction, fov, alertLevel) {
    const coneLength = radius * 3.5;
    const angle = Math.atan2(direction.y, direction.x);
    const halfFov = fov / 2;
    
    // Cone gradient
    const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, coneLength);
    let baseAlpha = alertLevel === 0 ? 0.08 : (alertLevel === 1 ? 0.12 : 0.18);
    grad.addColorStop(0, `rgba(239,68,68,${baseAlpha * 2})`);
    grad.addColorStop(0.5, `rgba(239,68,68,${baseAlpha})`);
    grad.addColorStop(1, 'rgba(239,68,68,0)');
    
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.arc(0, 0, coneLength, angle - halfFov, angle + halfFov);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Cone edges
    this.ctx.strokeStyle = `rgba(239,68,68,${baseAlpha * 3})`;
    this.ctx.lineWidth = 1.5 * this.camera.zoom;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(Math.cos(angle - halfFov) * coneLength, Math.sin(angle - halfFov) * coneLength);
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(Math.cos(angle + halfFov) * coneLength, Math.sin(angle + halfFov) * coneLength);
    this.ctx.stroke();
    
    // Arc at end
    this.ctx.beginPath();
    this.ctx.arc(0, 0, coneLength, angle - halfFov, angle + halfFov);
    this.ctx.stroke();
  }
  
  drawExit(x, y, radius, active, progress) {
    this.ctx.save();
    const screen = this.worldToScreen(x, y);
    this.ctx.translate(screen.x, screen.y);
    const sr = radius * this.camera.zoom;
    
    // Base
    this.ctx.fillStyle = '#1a1f2a';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, sr * 1.2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Door frame
    this.ctx.strokeStyle = active ? '#4ade80' : '#6b7280';
    this.ctx.lineWidth = 3 * this.camera.zoom;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, sr, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Inner glow
    if (active) {
      const pulse = 1 + Math.sin(performance.now() / 300) * 0.2;
      const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, sr * pulse);
      grad.addColorStop(0, 'rgba(74,222,128,0.3)');
      grad.addColorStop(1, 'rgba(74,222,128,0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, sr * pulse, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Progress ring
    if (progress > 0) {
      this.ctx.strokeStyle = '#4ade80';
      this.ctx.lineWidth = 4 * this.camera.zoom;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, sr * 1.4, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * progress);
      this.ctx.stroke();
    }
    
    // Arrow icon
    this.ctx.fillStyle = active ? '#4ade80' : '#6b7280';
    this.ctx.font = `bold ${sr * 1.2}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('▲', 0, sr * 0.1);
    
    this.ctx.restore();
  }
  
  drawParticles(particles) {
    this.ctx.save();
    particles.forEach(p => {
      const screen = this.worldToScreen(p.x, p.y);
      const alpha = p.life / p.maxLife;
      this.ctx.globalAlpha = alpha * 0.8;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(screen.x, screen.y, p.size * this.camera.zoom, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }
  
  drawScreenEffect(type, intensity) {
    this.ctx.save();
    const w = this.width / this.dpr;
    const h = this.height / this.dpr;
    
    if (type === 'alert') {
      // Red vignette
      const grad = this.ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.7);
      grad.addColorStop(0, 'rgba(239,68,68,0)');
      grad.addColorStop(1, `rgba(239,68,68,${intensity * 0.3})`);
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);
    } else if (type === 'detected') {
      // Flash
      this.ctx.fillStyle = `rgba(255,255,255,${intensity * 0.5})`;
      this.ctx.fillRect(0, 0, w, h);
    }
    
    this.ctx.restore();
  }
  
  _darkenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 255) * (1 - amount));
    const g = Math.max(0, ((num >> 8) & 255) * (1 - amount));
    const b = Math.max(0, (num & 255) * (1 - amount));
    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
  }
}