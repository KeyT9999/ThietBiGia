/**
 * Pure TypeScript ISO/IEC 18004 QR Code Matrix Generator (Byte Mode, EC Level L, Versions 2–5).
 * Zero external dependencies — renders crisp vector/canvas QR codes onto 3D WebGL Press Passes.
 */

const VERSION_SPECS: Record<
  number,
  { size: number; dataCodewords: number; ecCodewords: number; align: number[] }
> = {
  2: { size: 25, dataCodewords: 34, ecCodewords: 10, align: [6, 18] },
  3: { size: 29, dataCodewords: 55, ecCodewords: 15, align: [6, 22] },
  4: { size: 33, dataCodewords: 80, ecCodewords: 20, align: [6, 26] },
  5: { size: 37, dataCodewords: 108, ecCodewords: 26, align: [6, 30] },
};

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function reedSolomonEncode(data: number[], ecCount: number): number[] {
  // Build generator polynomial (x - a^0)(x - a^1)...(x - a^(ecCount-1))
  let gen = [1];
  for (let i = 0; i < ecCount; i++) {
    const next = new Array(gen.length + 1).fill(0);
    const factor = GF_EXP[i];
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];
      next[j + 1] ^= gfMul(gen[j], factor);
    }
    gen = next;
  }

  const rem = new Array(ecCount).fill(0);
  for (const byte of data) {
    const lead = byte ^ rem[0];
    rem.shift();
    rem.push(0);
    if (lead !== 0) {
      for (let j = 0; j < ecCount; j++) {
        rem[j] ^= gfMul(gen[j + 1], lead);
      }
    }
  }
  return rem;
}

function computeFormatBits(ecLevelBits: number, mask: number): number {
  const data = (ecLevelBits << 3) | mask;
  let rem = data << 10;
  for (let i = 14; i >= 10; i--) {
    if ((rem >> i) & 1) {
      rem ^= 0x537 << (i - 10);
    }
  }
  return ((data << 10) | rem) ^ 0x5412;
}

export function generateQrMatrix(text: string): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text));

  let version = 4;
  for (const v of [2, 3, 4, 5]) {
    if (bytes.length + 2 <= VERSION_SPECS[v].dataCodewords) {
      version = v;
      break;
    }
  }
  const spec = VERSION_SPECS[version];
  const size = spec.size;

  // Build bit stream: Byte mode (0100) + 8-bit length + payload + terminator + pad bytes
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  pushBits(0b0100, 4);
  const clipped = bytes.slice(0, spec.dataCodewords - 2);
  pushBits(clipped.length, 8);
  for (const b of clipped) pushBits(b, 8);

  const maxDataBits = spec.dataCodewords * 8;
  const term = Math.min(4, maxDataBits - bits.length);
  pushBits(0, term);
  while (bits.length % 8 !== 0) bits.push(0);

  const dataWords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i + b];
    dataWords.push(byte);
  }
  let padToggle = true;
  while (dataWords.length < spec.dataCodewords) {
    dataWords.push(padToggle ? 0xec : 0x11);
    padToggle = !padToggle;
  }

  const ecWords = reedSolomonEncode(dataWords, spec.ecCodewords);
  const allWords = [...dataWords, ...ecWords];
  const fullBits: number[] = [];
  for (const w of allWords) {
    for (let i = 7; i >= 0; i--) fullBits.push((w >> i) & 1);
  }

  const modules: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false)
  );
  const isFunc: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false)
  );

  const setFunctionModule = (x: number, y: number, dark: boolean) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    modules[y][x] = dark;
    isFunc[y][x] = true;
  };

  // Finder patterns + separators
  const drawFinder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const xx = cx + dx;
        const yy = cy + dy;
        if (xx >= 0 && yy >= 0 && xx < size && yy < size) {
          setFunctionModule(xx, yy, dist !== 2 && dist !== 4);
        }
      }
    }
  };
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  // Timing patterns
  for (let i = 0; i < size; i++) {
    if (!isFunc[6][i]) setFunctionModule(i, 6, i % 2 === 0);
    if (!isFunc[i][6]) setFunctionModule(6, i, i % 2 === 0);
  }

  // Alignment patterns
  for (const ay of spec.align) {
    for (const ax of spec.align) {
      if (
        (ax === 6 && ay === 6) ||
        (ax === 6 && ay === size - 7) ||
        (ax === size - 7 && ay === 6)
      ) {
        continue;
      }
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          setFunctionModule(
            ax + dx,
            ay + dy,
            Math.max(Math.abs(dx), Math.abs(dy)) !== 1
          );
        }
      }
    }
  }

  // Reserve format info & dark module
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      setFunctionModule(8, i, false);
      setFunctionModule(i, 8, false);
    }
  }
  for (let i = 0; i < 8; i++) {
    setFunctionModule(size - 1 - i, 8, false);
    setFunctionModule(8, size - 1 - i, false);
  }
  setFunctionModule(8, size - 8, true);

  // Zig-zag data placement
  let bitIdx = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunc[y][x]) {
          const dark = bitIdx < fullBits.length ? fullBits[bitIdx] === 1 : false;
          bitIdx++;
          // Apply Mask 0: (x + y) % 2 === 0
          modules[y][x] = (x + y) % 2 === 0 ? !dark : dark;
        }
      }
    }
  }

  // Write Format Bits per ISO/IEC 18004 Figure 25 (b14 = MSB, b0 = LSB)
  const fmt = computeFormatBits(0b01, 0);
  // Copy 1: Top-left finder perimeter
  for (let i = 0; i <= 5; i++) setFunctionModule(8, i, ((fmt >> i) & 1) === 1);
  setFunctionModule(8, 7, ((fmt >> 6) & 1) === 1);
  setFunctionModule(8, 8, ((fmt >> 7) & 1) === 1);
  setFunctionModule(7, 8, ((fmt >> 8) & 1) === 1);
  for (let i = 9; i < 15; i++) {
    setFunctionModule(14 - i, 8, ((fmt >> i) & 1) === 1);
  }
  // Copy 2: Top-right horizontal (b0..b7) + Bottom-left vertical (b8..b14)
  for (let i = 0; i < 8; i++) {
    setFunctionModule(size - 1 - i, 8, ((fmt >> i) & 1) === 1);
  }
  for (let i = 8; i < 15; i++) {
    setFunctionModule(8, size - 15 + i, ((fmt >> i) & 1) === 1);
  }
  setFunctionModule(8, size - 8, true);

  return modules;
}
