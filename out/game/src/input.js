// Shadow Protocol - Input Handling

export class Input {
  constructor() {
    this.keys = new Set();
    this.keysPressed = new Set();
    this.keysReleased = new Set();
    this.mouse = { x: 0, y: 0, down: false, justDown: false, justUp: false };
    
    this._bindEvents();
  }
  
  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (!this.keys.has(key)) {
        this.keysPressed.add(key);
      }
      this.keys.add(key);
      
      // Prevent default for game keys
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift',' ','e','escape'].includes(key)) {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      this.keys.delete(key);
      this.keysReleased.add(key);
    });
    
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    
    window.addEventListener('mousedown', (e) => {
      this.mouse.down = true;
      this.mouse.justDown = true;
    });
    
    window.addEventListener('mouseup', (e) => {
      this.mouse.down = false;
      this.mouse.justUp = true;
    });
    
    // Prevent context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  
  isDown(key) {
    return this.keys.has(key.toLowerCase());
  }
  
  wasPressed(key) {
    return this.keysPressed.has(key.toLowerCase());
  }
  
  wasReleased(key) {
    return this.keysReleased.has(key.toLowerCase());
  }
  
  getMouse() {
    return { ...this.mouse };
  }
  
  clear() {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouse.justDown = false;
    this.mouse.justUp = false;
  }
  
  // Game-specific helpers
  getMoveVector() {
    let x = 0, y = 0;
    if (this.isDown('w') || this.isDown('arrowup')) y -= 1;
    if (this.isDown('s') || this.isDown('arrowdown')) y += 1;
    if (this.isDown('a') || this.isDown('arrowleft')) x -= 1;
    if (this.isDown('d') || this.isDown('arrowright')) x += 1;
    
    // Normalize diagonal
    if (x !== 0 && y !== 0) {
      const inv = 1 / Math.sqrt(2);
      x *= inv;
      y *= inv;
    }
    return { x, y };
  }
  
  isSneaking() {
    return this.isDown('shift');
  }
  
  isInteractPressed() {
    return this.wasPressed('e') || this.wasPressed(' ');
  }
  
  isPausePressed() {
    return this.wasPressed('escape');
  }
}