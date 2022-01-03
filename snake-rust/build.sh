#!/bin/bash

set -euo pipefail
set -x

cargo build --release
cp target/wasm32-unknown-unknown/release/*.wasm optimized.wasm

wasm-snip --snip-rust-fmt-code --snip-rust-panicking-code -o optimized.wasm optimized.wasm
wasm-opt -Oz --strip-producers --strip-debug --dce --zero-filled-memory optimized.wasm -o optimized.wasm

