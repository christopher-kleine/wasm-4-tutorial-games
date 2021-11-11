import * as w4 from "./wasm4";

export function start (): void {
	store<u32>(w4.PALETTE, 0xfbf7f3, 0 * sizeof<u32>());
	store<u32>(w4.PALETTE, 0xe5b083, 1 * sizeof<u32>());
	store<u32>(w4.PALETTE, 0x426e5d, 2 * sizeof<u32>());
	store<u32>(w4.PALETTE, 0x20283d, 3 * sizeof<u32>());
}

export function update (): void {
}
