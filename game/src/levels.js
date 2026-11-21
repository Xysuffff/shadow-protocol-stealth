// Shadow Protocol - Level Definitions

export const LEVELS = [
  // Level 1: Tutorial - Simple layout with one guard
  {
    name: 'SECTOR 01: ENTRY POINT',
    width: 800,
    height: 600,
    playerStart: { x: 100, y: 300 },
    exit: { x: 700, y: 300, radius: 32 },
    walls: [
      { x: 0, y: 0, w: 800, h: 20 },
      { x: 0, y: 580, w: 800, h: 20 },
      { x: 0, y: 0, w: 20, h: 600 },
      { x: 780, y: 0, w: 20, h: 600 },
      // Central corridor walls
      { x: 200, y: 100, w: 400, h: 20 },
      { x: 200, y: 480, w: 400, h: 20 },
    ],
    covers: [
      { x: 300, y: 200, radius: 24 },
      { x: 500, y: 200, radius: 24 },
      { x: 300, y: 400, radius: 24 },
      { x: 500, y: 400, radius: 24 },
      { x: 400, y: 300, radius: 20 },
    ],
    guards: [
      {
        x: 400, y: 200,
        patrolPoints: [
          { x: 300, y: 200 },
          { x: 500, y: 200 }
        ],
        speed: 40,
        fov: Math.PI / 3,
        viewDistance: 200
      }
    ]
  },
  
  // Level 2: Two guards, crossing patrols
  {
    name: 'SECTOR 02: SURVEILLANCE',
    width: 900,
    height: 700,
    playerStart: { x: 80, y: 350 },
    exit: { x: 820, y: 350, radius: 32 },
    walls: [
      { x: 0, y: 0, w: 900, h: 20 },
      { x: 0, y: 680, w: 900, h: 20 },
      { x: 0, y: 0, w: 20, h: 700 },
      { x: 880, y: 0, w: 20, h: 700 },
      // Maze-like structure
      { x: 180, y: 100, w: 20, h: 300 },
      { x: 350, y: 300, w: 20, h: 300 },
      { x: 520, y: 100, w: 20, h: 300 },
      { x: 690, y: 300, w: 20, h: 300 },
      { x: 180, y: 100, w: 200, h: 20 },
      { x: 350, y: 300, w: 200, h: 20 },
      { x: 520, y: 400, w: 200, h: 20 },
      { x: 690, y: 600, w: 200, h: 20 },
    ],
    covers: [
      { x: 150, y: 200, radius: 20 },
      { x: 150, y: 500, radius: 20 },
      { x: 300, y: 500, radius: 20 },
      { x: 450, y: 200, radius: 20 },
      { x: 450, y: 600, radius: 20 },
      { x: 600, y: 200, radius: 20 },
      { x: 750, y: 500, radius: 20 },
    ],
    guards: [
      {
        x: 280, y: 200,
        patrolPoints: [
          { x: 200, y: 200 },
          { x: 350, y: 200 },
          { x: 350, y: 350 },
          { x: 200, y: 350 }
        ],
        speed: 45,
        fov: Math.PI / 2.5,
        viewDistance: 220
      },
      {
        x: 600, y: 500,
        patrolPoints: [
          { x: 520, y: 500 },
          { x: 680, y: 500 },
          { x: 680, y: 650 },
          { x: 520, y: 650 }
        ],
        speed: 50,
        fov: Math.PI / 2.5,
        viewDistance: 220
      }
    ]
  },
  
  // Level 3: Three guards, complex layout
  {
    name: 'SECTOR 03: INFILTRATION',
    width: 1000,
    height: 800,
    playerStart: { x: 80, y: 720 },
    exit: { x: 920, y: 80, radius: 32 },
    walls: [
      { x: 0, y: 0, w: 1000, h: 20 },
      { x: 0, y: 780, w: 1000, h: 20 },
      { x: 0, y: 0, w: 20, h: 800 },
      { x: 980, y: 0, w: 20, h: 800 },
      // Complex multi-room layout
      { x: 200, y: 180, w: 20, h: 400 },
      { x: 400, y: 400, w: 20, h: 200 },
      { x: 600, y: 200, w: 20, h: 400 },
      { x: 800, y: 180, w: 20, h: 400 },
      { x: 200, y: 180, w: 420, h: 20 },
      { x: 200, y: 580, w: 420, h: 20 },
      { x: 580, y: 200, w: 220, h: 20 },
      { x: 580, y: 600, w: 220, h: 20 },
      { x: 800, y: 180, w: 180, h: 20 },
      { x: 800, y: 580, w: 180, h: 20 },
    ],
    covers: [
      { x: 150, y: 300, radius: 22 },
      { x: 150, y: 500, radius: 22 },
      { x: 300, y: 300, radius: 22 },
      { x: 300, y: 500, radius: 22 },
      { x: 500, y: 300, radius: 22 },
      { x: 500, y: 500, radius: 22 },
      { x: 700, y: 300, radius: 22 },
      { x: 700, y: 500, radius: 22 },
      { x: 900, y: 300, radius: 22 },
      { x: 900, y: 500, radius: 22 },
    ],
    guards: [
      {
        x: 300, y: 300,
        patrolPoints: [
          { x: 250, y: 300 },
          { x: 350, y: 300 },
          { x: 350, y: 500 },
          { x: 250, y: 500 }
        ],
        speed: 50,
        fov: Math.PI / 2.2,
        viewDistance: 240
      },
      {
        x: 700, y: 500,
        patrolPoints: [
          { x: 620, y: 500 },
          { x: 780, y: 500 },
          { x: 780, y: 300 },
          { x: 620, y: 300 }
        ],
        speed: 55,
        fov: Math.PI / 2.2,
        viewDistance: 240
      },
      {
        x: 900, y: 400,
        patrolPoints: [
          { x: 850, y: 250 },
          { x: 950, y: 250 },
          { x: 950, y: 550 },
          { x: 850, y: 550 }
        ],
        speed: 45,
        fov: Math.PI / 2,
        viewDistance: 260
      }
    ]
  },
  
  // Level 4: Four guards, high security
  {
    name: 'SECTOR 04: HIGH SECURITY',
    width: 1100,
    height: 850,
    playerStart: { x: 80, y: 425 },
    exit: { x: 1020, y: 425, radius: 32 },
    walls: [
      { x: 0, y: 0, w: 1100, h: 20 },
      { x: 0, y: 830, w: 1100, h: 20 },
      { x: 0, y: 0, w: 20, h: 850 },
      { x: 1080, y: 0, w: 20, h: 850 },
      // Multiple chambers
      { x: 220, y: 150, w: 20, h: 300 },
      { x: 440, y: 400, w: 20, h: 300 },
      { x: 660, y: 150, w: 20, h: 300 },
      { x: 880, y: 400, w: 20, h: 300 },
      { x: 220, y: 150, w: 240, h: 20 },
      { x: 440, y: 400, w: 240, h: 20 },
      { x: 660, y: 450, w: 240, h: 20 },
      { x: 880, y: 700, w: 220, h: 20 },
    ],
    covers: [
      { x: 150, y: 200, radius: 24 },
      { x: 150, y: 400, radius: 24 },
      { x: 150, y: 600, radius: 24 },
      { x: 350, y: 500, radius: 24 },
      { x: 350, y: 700, radius: 24 },
      { x: 550, y: 200, radius: 24 },
      { x: 550, y: 400, radius: 24 },
      { x: 550, y: 600, radius: 24 },
      { x: 750, y: 500, radius: 24 },
      { x: 750, y: 700, radius: 24 },
      { x: 950, y: 200, radius: 24 },
      { x: 950, y: 400, radius: 24 },
      { x: 950, y: 600, radius: 24 },
    ],
    guards: [
      {
        x: 350, y: 200,
        patrolPoints: [
          { x: 250, y: 200 },
          { x: 400, y: 200 },
          { x: 400, y: 400 },
          { x: 250, y: 400 }
        ],
        speed: 55,
        fov: Math.PI / 2,
        viewDistance: 260
      },
      {
        x: 550, y: 600,
        patrolPoints: [
          { x: 460, y: 500 },
          { x: 640, y: 500 },
          { x: 640, y: 700 },
          { x: 460, y: 700 }
        ],
        speed: 60,
        fov: Math.PI / 2,
        viewDistance: 260
      },
      {
        x: 750, y: 200,
        patrolPoints: [
          { x: 680, y: 200 },
          { x: 820, y: 200 },
          { x: 820, y: 400 },
          { x: 680, y: 400 }
        ],
        speed: 55,
        fov: Math.PI / 2,
        viewDistance: 260
      },
      {
        x: 950, y: 500,
        patrolPoints: [
          { x: 900, y: 450 },
          { x: 1000, y: 450 },
          { x: 1000, y: 650 },
          { x: 900, y: 650 }
        ],
        speed: 65,
        fov: Math.PI / 1.8,
        viewDistance: 280
      }
    ]
  },
  
  // Level 5: Final sector - Maximum security
  {
    name: 'SECTOR 05: THE VAULT',
    width: 1200,
    height: 900,
    playerStart: { x: 80, y: 450 },
    exit: { x: 1120, y: 450, radius: 36 },
    walls: [
      { x: 0, y: 0, w: 1200, h: 20 },
      { x: 0, y: 880, w: 1200, h: 20 },
      { x: 0, y: 0, w: 20, h: 900 },
      { x: 1180, y: 0, w: 20, h: 900 },
      // Vault-like layout with inner chambers
      { x: 250, y: 150, w: 20, h: 300 },
      { x: 470, y: 450, w: 20, h: 300 },
      { x: 690, y: 150, w: 20, h: 300 },
      { x: 910, y: 450, w: 20, h: 300 },
      { x: 250, y: 150, w: 240, h: 20 },
      { x: 470, y: 450, w: 240, h: 20 },
      { x: 690, y: 450, w: 240, h: 20 },
      { x: 910, y: 750, w: 280, h: 20 },
      // Inner walls
      { x: 350, y: 300, w: 20, h: 150 },
      { x: 570, y: 400, w: 20, h: 150 },
      { x: 790, y: 300, w: 20, h: 150 },
    ],
    covers: [
      { x: 150, y: 200, radius: 26 },
      { x: 150, y: 400, radius: 26 },
      { x: 150, y: 600, radius: 26 },
      { x: 350, y: 200, radius: 26 },
      { x: 350, y: 400, radius: 26 },
      { x: 350, y: 600, radius: 26 },
      { x: 550, y: 200, radius: 26 },
      { x: 550, y: 400, radius: 26 },
      { x: 550, y: 600, radius: 26 },
      { x: 750, y: 200, radius: 26 },
      { x: 750, y: 400, radius: 26 },
      { x: 750, y: 600, radius: 26 },
      { x: 950, y: 300, radius: 26 },
      { x: 950, y: 500, radius: 26 },
      { x: 950, y: 700, radius: 26 },
      { x: 1100, y: 450, radius: 26 },
    ],
    guards: [
      {
        x: 350, y: 200,
        patrolPoints: [
          { x: 280, y: 200 },
          { x: 420, y: 200 },
          { x: 420, y: 400 },
          { x: 280, y: 400 }
        ],
        speed: 65,
        fov: Math.PI / 1.8,
        viewDistance: 300
      },
      {
        x: 550, y: 600,
        patrolPoints: [
          { x: 480, y: 550 },
          { x: 620, y: 550 },
          { x: 620, y: 700 },
          { x: 480, y: 700 }
        ],
        speed: 70,
        fov: Math.PI / 1.8,
        viewDistance: 300
      },
      {
        x: 750, y: 300,
        patrolPoints: [
          { x: 700, y: 250 },
          { x: 800, y: 250 },
          { x: 800, y: 450 },
          { x: 700, y: 450 }
        ],
        speed: 65,
        fov: Math.PI / 1.8,
        viewDistance: 300
      },
      {
        x: 950, y: 500,
        patrolPoints: [
          { x: 900, y: 450 },
          { x: 1000, y: 450 },
          { x: 1000, y: 700 },
          { x: 900, y: 700 }
        ],
        speed: 75,
        fov: Math.PI / 1.6,
        viewDistance: 320
      },
      {
        x: 1100, y: 450,
        patrolPoints: [
          { x: 1040, y: 450 },
          { x: 1140, y: 450 },
          { x: 1140, y: 300 },
          { x: 1040, y: 300 },
          { x: 1040, y: 600 },
          { x: 1140, y: 600 }
        ],
        speed: 80,
        fov: Math.PI / 1.5,
        viewDistance: 350
      }
    ]
  }
];

export class LevelManager {
  constructor() {
    this.currentLevel = 0;
    this.totalLevels = LEVELS.length;
  }
  
  getCurrentLevel() {
    return LEVELS[this.currentLevel];
  }
  
  nextLevel() {
    this.currentLevel = Math.min(this.currentLevel + 1, this.totalLevels - 1);
    return this.getCurrentLevel();
  }
  
  reset() {
    this.currentLevel = 0;
  }
  
  getLevelIndex() {
    return this.currentLevel;
  }
  
  getTotalLevels() {
    return this.totalLevels;
  }
  
  isLastLevel() {
    return this.currentLevel >= this.totalLevels - 1;
  }
}