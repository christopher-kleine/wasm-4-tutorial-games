const std = @import("std");

const w4 = @import("wasm4.zig");
const Point = @import("snake.zig").Point;
const Snake = @import("snake.zig").Snake;

var prng: std.rand.DefaultPrng = undefined;
var random: std.rand.Random = undefined;

const fruit_sprite = [16]u8{ 0x00, 0xa0, 0x02, 0x00, 0x0e, 0xf0, 0x36, 0x5c, 0xd6, 0x57, 0xd5, 0x57, 0x35, 0x5c, 0x0f, 0xf0 };
var snake: Snake = undefined;
var frame_count: u32 = 0;
var prev_state: u8 = 0;
var fruit: Point = .{ .x = 10, .y = 10 };

export fn start() void {
    prng = std.rand.DefaultPrng.init(0);
    random = prng.random();

    snake.reset();

    w4.PALETTE.* = .{
        0xfbf7f3,
        0xe5b083,
        0x426e5d,
        0x20283d,
    };
}

fn input() void {
    const just_pressed: u8 = w4.GAMEPAD1.* & (w4.GAMEPAD1.* ^ prev_state);

    if (just_pressed & w4.BUTTON_DOWN != 0) {
        snake.down();
    }
    if (just_pressed & w4.BUTTON_UP != 0) {
        snake.up();
    }
    if (just_pressed & w4.BUTTON_LEFT != 0) {
        snake.left();
    }
    if (just_pressed & w4.BUTTON_RIGHT != 0) {
        snake.right();
    }

    prev_state = w4.GAMEPAD1.*;
}

export fn update() void {
    frame_count += 1;

    input();

    if (frame_count % 15 == 0) {
        snake.update();

        if (std.meta.eql(snake.body[0], fruit)) {
            snake.grow();

            fruit = Point{
                .x = random.intRangeLessThan(i32, 0, 20),
                .y = random.intRangeLessThan(i32, 0, 20),
            };
        }

        if (snake.isDead()) {
            snake.reset();
        }
    }

    snake.draw();

    w4.DRAW_COLORS.* = 0x4320;
    w4.blit(&fruit_sprite, fruit.x * 8, fruit.y * 8, 8, 8, w4.BLIT_2BPP);
}
