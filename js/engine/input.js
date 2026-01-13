// Handles keyboard and pointer input. Returns state used by movement system.
export function createInput(canvas) {
  const keys = {};
  const pointer = {
    active: false,
    x: 0,
    y: 0,
  };
  window.addEventListener('keydown', e => {
    keys[e.code] = true;
  });
  window.addEventListener('keyup', e => {
    keys[e.code] = false;
  });
  // Pointer for mobile joystick (simple virtual joystick). We'll use entire canvas as joystick area for now.
  const updatePointer = (x, y, active) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (x - rect.left) / rect.width;
    pointer.y = (y - rect.top) / rect.height;
    pointer.active = active;
  };
  canvas.addEventListener('pointerdown', e => {
    updatePointer(e.clientX, e.clientY, true);
  });
  canvas.addEventListener('pointermove', e => {
    if (pointer.active) {
      updatePointer(e.clientX, e.clientY, true);
    }
  });
  canvas.addEventListener('pointerup', e => {
    updatePointer(e.clientX, e.clientY, false);
  });
  return {
    isDown(code) {
      return !!keys[code];
    },
    pointer,
  };
}
