import React from 'react';

interface VirtualKeyboardProps {
  activeKey: string | null;      // Last key pressed by the user
  expectedKey: string | null;    // Next key the user should press
}

// Keyboard key definition matrix
const KEYBOARD_ROWS = [
  [
    { code: 'Backquote', label: '`', shiftLabel: '~', size: 'w-8 md:w-9' },
    { code: 'Digit1', label: '1', shiftLabel: '!', size: 'w-8 md:w-9' },
    { code: 'Digit2', label: '2', shiftLabel: '@', size: 'w-8 md:w-9' },
    { code: 'Digit3', label: '3', shiftLabel: '#', size: 'w-8 md:w-9' },
    { code: 'Digit4', label: '4', shiftLabel: '$', size: 'w-8 md:w-9' },
    { code: 'Digit5', label: '5', shiftLabel: '%', size: 'w-8 md:w-9' },
    { code: 'Digit6', label: '6', shiftLabel: '^', size: 'w-8 md:w-9' },
    { code: 'Digit7', label: '7', shiftLabel: '&', size: 'w-8 md:w-9' },
    { code: 'Digit8', label: '8', shiftLabel: '*', size: 'w-8 md:w-9' },
    { code: 'Digit9', label: '9', shiftLabel: '(', size: 'w-8 md:w-9' },
    { code: 'Digit0', label: '0', shiftLabel: ')', size: 'w-8 md:w-9' },
    { code: 'Minus', label: '-', shiftLabel: '_', size: 'w-8 md:w-9' },
    { code: 'Equal', label: '=', shiftLabel: '+', size: 'w-8 md:w-9' },
    { code: 'Backspace', label: 'Backspace', size: 'w-16 md:w-18 flex-grow' }
  ],
  [
    { code: 'Tab', label: 'Tab', size: 'w-11 md:w-12' },
    { code: 'KeyQ', label: 'q', shiftLabel: 'Q', size: 'w-8 md:w-9' },
    { code: 'KeyW', label: 'w', shiftLabel: 'W', size: 'w-8 md:w-9' },
    { code: 'KeyE', label: 'e', shiftLabel: 'E', size: 'w-8 md:w-9' },
    { code: 'KeyR', label: 'r', shiftLabel: 'R', size: 'w-8 md:w-9' },
    { code: 'KeyT', label: 't', shiftLabel: 'T', size: 'w-8 md:w-9' },
    { code: 'KeyY', label: 'y', shiftLabel: 'Y', size: 'w-8 md:w-9' },
    { code: 'KeyU', label: 'u', shiftLabel: 'U', size: 'w-8 md:w-9' },
    { code: 'KeyI', label: 'i', shiftLabel: 'I', size: 'w-8 md:w-9' },
    { code: 'KeyO', label: 'o', shiftLabel: 'O', size: 'w-8 md:w-9' },
    { code: 'KeyP', label: 'p', shiftLabel: 'P', size: 'w-8 md:w-9' },
    { code: 'BracketLeft', label: '[', shiftLabel: '{', size: 'w-8 md:w-9' },
    { code: 'BracketRight', label: ']', shiftLabel: '}', size: 'w-8 md:w-9' },
    { code: 'Backslash', label: '\\', shiftLabel: '|', size: 'w-8 md:w-9 flex-grow' }
  ],
  [
    { code: 'CapsLock', label: 'Caps', size: 'w-13 md:w-14' },
    { code: 'KeyA', label: 'a', shiftLabel: 'A', size: 'w-8 md:w-9' },
    { code: 'KeyS', label: 's', shiftLabel: 'S', size: 'w-8 md:w-9' },
    { code: 'KeyD', label: 'd', shiftLabel: 'D', size: 'w-8 md:w-9' },
    { code: 'KeyF', label: 'f', shiftLabel: 'F', size: 'w-8 md:w-9' },
    { code: 'KeyG', label: 'g', shiftLabel: 'G', size: 'w-8 md:w-9' },
    { code: 'KeyH', label: 'h', shiftLabel: 'H', size: 'w-8 md:w-9' },
    { code: 'KeyJ', label: 'j', shiftLabel: 'J', size: 'w-8 md:w-9' },
    { code: 'KeyK', label: 'k', shiftLabel: 'K', size: 'w-8 md:w-9' },
    { code: 'KeyL', label: 'l', shiftLabel: 'L', size: 'w-8 md:w-9' },
    { code: 'Semicolon', label: ';', shiftLabel: ':', size: 'w-8 md:w-9' },
    { code: 'Quote', label: "'", shiftLabel: '"', size: 'w-8 md:w-9' },
    { code: 'Enter', label: 'Enter', size: 'w-16 md:w-18 flex-grow' }
  ],
  [
    { code: 'ShiftLeft', label: 'Shift', size: 'w-16 md:w-18' },
    { code: 'KeyZ', label: 'z', shiftLabel: 'Z', size: 'w-8 md:w-9' },
    { code: 'KeyX', label: 'x', shiftLabel: 'X', size: 'w-8 md:w-9' },
    { code: 'KeyC', label: 'c', shiftLabel: 'C', size: 'w-8 md:w-9' },
    { code: 'KeyV', label: 'v', shiftLabel: 'V', size: 'w-8 md:w-9' },
    { code: 'KeyB', label: 'b', shiftLabel: 'B', size: 'w-8 md:w-9' },
    { code: 'KeyN', label: 'n', shiftLabel: 'N', size: 'w-8 md:w-9' },
    { code: 'KeyM', label: 'm', shiftLabel: 'M', size: 'w-8 md:w-9' },
    { code: 'Comma', label: ',', shiftLabel: '<', size: 'w-8 md:w-9' },
    { code: 'Period', label: '.', shiftLabel: '>', size: 'w-8 md:w-9' },
    { code: 'Slash', label: '/', shiftLabel: '?', size: 'w-8 md:w-9' },
    { code: 'ShiftRight', label: 'Shift', size: 'w-20 md:w-22 flex-grow' }
  ],
  [
    { code: 'Space', label: ' ', size: 'w-full max-w-[360px] md:max-w-[400px]' }
  ]
];

// Touch-typing finger configuration mapping
const getFingerForKey = (key: string | null): string => {
  if (!key) return '';
  const k = key.toLowerCase();

  // Spacebar (default to right thumb)
  if (k === ' ' || k === 'space') return 'R1';

  // Left Pinky (L5)
  if (['`', '~', '1', '!', 'q', 'a', 'z', 'capslock', 'shift', 'tab', 'control'].includes(k)) return 'L5';
  
  // Left Ring (L4)
  if (['2', '@', 'w', 's', 'x'].includes(k)) return 'L4';
  
  // Left Middle (L3)
  if (['3', '#', 'e', 'd', 'c'].includes(k)) return 'L3';
  
  // Left Index (L2)
  if (['4', '$', '5', '%', 'r', 't', 'f', 'g', 'v', 'b'].includes(k)) return 'L2';
  
  // Right Index (R2)
  if (['6', '^', '7', '&', 'y', 'u', 'h', 'j', 'n', 'm'].includes(k)) return 'R2';
  
  // Right Middle (R3)
  if (['8', '*', 'i', 'k', ','].includes(k)) return 'R3';
  
  // Right Ring (R4)
  if (['9', '(', 'o', 'l', '.'].includes(k)) return 'R4';
  
  // Right Pinky (R5)
  if (['0', ')', '-', '_', '=', '+', 'p', '[', '{', ']', '}', '\\', '|', ';', ':', "'", '"', '/', '?', 'enter', 'backspace'].includes(k)) return 'R5';

  return '';
};

// Sub-component to render interactive vector hands
const HandVisualizer: React.FC<{ hand: 'left' | 'right'; activeFinger: string }> = ({ hand, activeFinger }) => {
  const isLeft = hand === 'left';
  const prefix = isLeft ? 'L' : 'R';
  
  // Hand finger mapping (joint knuckles & tips positions)
  const fingers = [
    { id: '5', name: 'Pinky', knuckle: isLeft ? { x: 20, y: 60 } : { x: 100, y: 60 }, tip: isLeft ? { x: 15, y: 30 } : { x: 105, y: 30 } },
    { id: '4', name: 'Ring', knuckle: isLeft ? { x: 40, y: 50 } : { x: 80, y: 50 }, tip: isLeft ? { x: 38, y: 15 } : { x: 82, y: 15 } },
    { id: '3', name: 'Middle', knuckle: isLeft ? { x: 60, y: 48 } : { x: 60, y: 48 }, tip: isLeft ? { x: 60, y: 10 } : { x: 60, y: 10 } },
    { id: '2', name: 'Index', knuckle: isLeft ? { x: 80, y: 53 } : { x: 40, y: 53 }, tip: isLeft ? { x: 82, y: 18 } : { x: 38, y: 18 } },
    { id: '1', name: 'Thumb', knuckle: isLeft ? { x: 90, y: 75 } : { x: 30, y: 75 }, tip: isLeft ? { x: 110, y: 60 } : { x: 10, y: 60 } },
  ];

  return (
    <div className="flex flex-col items-center gap-1.5 bg-[#0f1422] border border-gray-800 p-2 md:p-2.5 rounded-2xl shadow-xl w-full max-w-[105px] md:max-w-[115px]">
      <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-wider">
        {isLeft ? 'Left Hand' : 'Right Hand'}
      </span>
      <svg width="85" height="75" viewBox="0 0 120 110" className="overflow-visible">
        {/* Palm shape */}
        <path
          d={isLeft 
            ? "M 35 105 Q 15 80 20 60 L 40 50 L 60 48 L 80 53 L 90 75 Q 95 95 65 105 Z"
            : "M 85 105 Q 105 80 100 60 L 80 50 L 60 48 L 40 53 L 30 75 Q 25 95 55 105 Z"
          }
          fill="none"
          stroke="currentColor"
          className="text-gray-800/80"
          strokeWidth="2.5"
        />

        {/* Fingers */}
        {fingers.map((f) => {
          const fingerCode = `${prefix}${f.id}`;
          const isActive = activeFinger === fingerCode;

          return (
            <g key={f.id} className="transition-all duration-200">
              {/* Finger Bone Line */}
              <line
                x1={f.knuckle.x}
                y1={f.knuckle.y}
                x2={f.tip.x}
                y2={f.tip.y}
                stroke="currentColor"
                strokeWidth={isActive ? "5" : "2.5"}
                className={isActive ? "text-purple-500 filter drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]" : "text-gray-800"}
              />
              {/* Joint node */}
              <circle
                cx={f.knuckle.x}
                cy={f.knuckle.y}
                r="3"
                className={isActive ? "fill-purple-400" : "fill-gray-700"}
              />
              {/* Fingertip dot */}
              <circle
                cx={f.tip.x}
                cy={f.tip.y}
                r={isActive ? "6.5" : "4.5"}
                className={`${isActive ? "fill-purple-500 stroke-purple-300 stroke-2 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "fill-gray-750 stroke-gray-800"} transition-all duration-200`}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ activeKey, expectedKey }) => {
  // Normalize string comparisons for keys
  const isKeyActive = (keyLabel: string, shiftLabel?: string) => {
    if (!activeKey) return false;

    // Direct match or standard case insensitivity
    if (activeKey.toLowerCase() === keyLabel.toLowerCase()) return true;
    if (shiftLabel && activeKey === shiftLabel) return true;

    // Spacing
    if (activeKey === ' ' && keyLabel === ' ') return true;

    // Special modifier handling
    if (activeKey === 'Backspace' && keyLabel === 'Backspace') return true;
    if (activeKey === 'Enter' && keyLabel === 'Enter') return true;
    if (activeKey === 'Tab' && keyLabel === 'Tab') return true;
    if (activeKey === 'CapsLock' && keyLabel === 'Caps') return true;
    if (activeKey.startsWith('Shift') && keyLabel === 'Shift') return true;

    return false;
  };

  const isKeyExpected = (keyLabel: string, shiftLabel?: string) => {
    if (!expectedKey) return false;

    // Normalized expected char matching
    if (expectedKey === ' ' && keyLabel === ' ') return true;
    if (expectedKey === '\n' && keyLabel === 'Enter') return true;
    
    if (expectedKey === keyLabel) return true;
    if (shiftLabel && expectedKey === shiftLabel) return true;
    
    // Fallback case-insensitive
    if (expectedKey.toLowerCase() === keyLabel.toLowerCase() && keyLabel.length === 1) return true;

    return false;
  };

  // Helper to render key legend realistically (Double-shot PBT keycaps aesthetic)
  const renderKeyContent = (key: { label: string; shiftLabel?: string }, active: boolean) => {
    if (key.shiftLabel) {
      return (
        <div className="w-full h-full flex flex-col justify-between p-1.5 text-left">
          <span className={`text-[8px] font-black leading-none ${active ? 'text-purple-200' : 'text-gray-500'}`}>
            {key.shiftLabel}
          </span>
          <span className="text-[9px] md:text-[10px] font-black leading-none text-right uppercase">
            {key.label}
          </span>
        </div>
      );
    }
    
    if (key.label === ' ') {
      // Spacebar gets a modern glowing accent line in the middle
      return (
        <div className={`w-16 h-[2px] rounded-full transition-all duration-150 ${active ? 'bg-white' : 'bg-gray-700/80'}`} />
      );
    }

    const isModifier = ['backspace', 'tab', 'caps', 'enter', 'shift'].includes(key.label.toLowerCase());

    if (isModifier) {
      let symbol = '';
      let labelText = key.label;

      if (key.label.toLowerCase() === 'backspace') {
        symbol = '⌫';
        labelText = 'Back';
      } else if (key.label.toLowerCase() === 'enter') {
        symbol = '↵';
        labelText = 'Enter';
      } else if (key.label.toLowerCase() === 'shift') {
        symbol = '⇧';
        labelText = 'Shift';
      } else if (key.label.toLowerCase() === 'tab') {
        symbol = '⇥';
        labelText = 'Tab';
      } else if (key.label.toLowerCase() === 'caps') {
        symbol = '⇪';
        labelText = 'Caps';
      }

      return (
        <div className="w-full h-full flex items-center justify-between px-2 text-[8px] md:text-[9px] font-extrabold uppercase tracking-wide">
          <span className="text-[10px] md:text-[11px] opacity-80">{symbol}</span>
          <span className="text-[7px] md:text-[8px] opacity-60 font-black tracking-normal">{labelText}</span>
        </div>
      );
    }

    if (key.label === 'f' || key.label === 'j') {
      return (
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <span className="leading-none uppercase font-black tracking-wider text-[8.5px] md:text-[10px]">
            {key.label}
          </span>
          <div className={`w-4 h-[2px] rounded-full ${active ? 'bg-purple-200' : 'bg-gray-500'}`} />
        </div>
      );
    }

    return (
      <span className="leading-none uppercase font-black tracking-wider text-[8.5px] md:text-[10px]">
        {key.label}
      </span>
    );
  };

  const activeFinger = getFingerForKey(expectedKey);

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full">
      {/* Keyboard Case / Baseplate */}
      <div className="bg-[#0b0f19] border border-gray-800 p-2.5 md:p-3.5 rounded-2xl w-full shadow-2xl flex flex-col gap-1.5 relative overflow-hidden">
        {/* Subtle grid baseplate lining */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 md:gap-1.2 w-full relative z-10">
            {row.map((key) => {
              const active = isKeyActive(key.label, key.shiftLabel);
              const expected = isKeyExpected(key.label, key.shiftLabel);

              // 3D tactile button classes
              let keyClass = `h-8.5 md:h-10 rounded-lg flex flex-col items-center justify-center select-none ${key.size} transition-all duration-75 cursor-default `;

              if (active) {
                // Key pressed down: moves down, bottom border vanishes, shadow inner
                keyClass += 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white translate-y-[3px] border-b-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]';
              } else if (expected) {
                // Neon glow pulsing keycap
                keyClass += 'bg-purple-950/20 text-purple-300 border border-purple-500/60 border-b-[3.5px] border-purple-900 shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-pulse';
              } else {
                // Standard tactile double-shot keycaps
                keyClass += 'bg-[#121826] border border-gray-800/80 border-b-[3.5px] border-gray-950 text-gray-400 font-extrabold hover:bg-[#161e30] hover:text-gray-200';
              }

              return (
                <div key={key.code || key.label} className={keyClass}>
                  {renderKeyContent(key, active)}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Hand Visualizer Guide */}
      <div className="flex justify-center gap-8">
        <HandVisualizer hand="left" activeFinger={activeFinger} />
        <HandVisualizer hand="right" activeFinger={activeFinger} />
      </div>
    </div>
  );
};
