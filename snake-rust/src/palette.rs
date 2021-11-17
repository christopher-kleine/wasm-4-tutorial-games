use crate::wasm4;

pub fn set_draw_color<T: Into<u16>>(idx: T) {
    unsafe { *wasm4::DRAW_COLORS = idx.into() }
}

pub fn set_palette(palette: [u32; 4]) {
    unsafe {
        *wasm4::PALETTE = palette;
    }
}
