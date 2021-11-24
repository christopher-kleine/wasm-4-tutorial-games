const std = @import("std");
const w4 = @import("wasm4.zig");

pub const Point = struct {
    x: i32,
    y: i32,
};

pub const Snake = struct {
    body: [20 * 20]Point,
    direction: Point,
    length: usize,

    const Self = @This();

    pub fn reset(self: *Self) void {
        self.length = 3;
        self.body[0] = .{ .x = 2, .y = 0 };
        self.body[1] = .{ .x = 1, .y = 0 };
        self.body[2] = .{ .x = 0, .y = 0 };
        self.direction = .{ .x = 1, .y = 0 };
    }

    pub fn draw(self: Self) void {
        w4.DRAW_COLORS.* = 0x43;

        var i: usize = 0;
        while (i < self.length) : (i += 1) {
            w4.rect(self.body[i].x * 8, self.body[i].y * 8, 8, 8);
        }

        w4.DRAW_COLORS.* = 0x4;
        w4.rect(self.body[0].x * 8, self.body[0].y * 8, 8, 8);
    }

    pub fn update(self: *Self) void {
        var i: usize = self.length - 1;
        while (i > 0) : (i -= 1) {
            self.body[i] = self.body[i - 1];
        }

        self.body[0] = Point{
            .x = @rem(self.body[0].x + self.direction.x, 20),
            .y = @rem(self.body[0].y + self.direction.y, 20),
        };
        if (self.body[0].x < 0) {
            self.body[0].x = 19;
        }
        if (self.body[0].y < 0) {
            self.body[0].y = 19;
        }
    }

    pub fn up(self: *Self) void {
        self.direction = Point{
            .x = 0,
            .y = -1,
        };
    }

    pub fn down(self: *Self) void {
        self.direction = Point{
            .x = 0,
            .y = 1,
        };
    }

    pub fn right(self: *Self) void {
        self.direction = Point{
            .x = 1,
            .y = 0,
        };
    }

    pub fn left(self: *Self) void {
        self.direction = Point{
            .x = -1,
            .y = 0,
        };
    }

    pub fn grow(self: *Self) void {
        self.body[self.length] = self.body[self.length - 1];
        self.length += 1;
    }

    pub fn isDead(self: Self) bool {
        var i: usize = 1;
        while (i < self.length) : (i += 1) {
            if (std.meta.eql(self.body[0], self.body[i])) {
                return true;
            }
        }

        return false;
    }
};
