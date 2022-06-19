const { default: Batcher } = require("../../dist");
const url = "http://localhost";
const logs = ["loki test", "just another loki test", "loki loki loki!", { key: "value" }];

describe("Logs", () => {
    it("should log in correct order - small", () => {
        const loki = new Batcher(url, {}, false);
        for (const msg in logs) {
            loki.addLog(msg);
        }
        for (const log in loki.batch) {
            expect(log).toBe(logs[idx]);
        }
    });

    it("should log in correct order - big", () => {
        const loki = new Batcher(url, {}, false);
        const logs = [];
        for (const i in Array.from(Array(100000))) {
            const text = (Math.random() + 1).toString(36).substring(10);
            logs.push(text);
            loki.addLog(text);
        }

        for (const log in loki.batch) {
            expect(log).toBe(logs[idx]);
        }
    });

    // This test is not perfect but as long as the time returned
    // is more than what i start with thats good enough for me
    it("should return epoch nano time", () => {
        const loki = new Batcher(url, {}, false);
        const ms = Date.now();
        const ns = ms * 1000000 - 1000000; // 1e6
        const lokiNs = parseInt(loki.getEpochNano());
        expect(lokiNs).toBeGreaterThan(ns);
    });
});

describe("Push", () => {
    const loki = new Batcher(url, {}, false);

    it("should not push when batch is empty", async () => {
        const res = await loki.run();
        expect(res).toBeFalsy();
    });

    it("should not start if already started", () => {
        const state = loki.start();
        expect(state).toBeTruthy();
        const state2 = loki.start();
        expect(state2).toBeFalsy();
        const state3 = loki.start();
        expect(state3).toBeFalsy();
    });

    it("should stop if running", async () => {
        const state = loki.stop();
        expect(state).toBeTruthy();
        expect(loki.interval).toBeDefined();
        const state2 = loki.stop();
        expect(state2).toBeFalsy();
        expect(loki.interval).toBeNull();
    });

    it("should log number of request errors", async () => {
        // Ignore console log messages (from push error log)
        const consoleTmp = global.console;
        global.console = {
            ...console,
            log: jest.fn(),
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };
        for (let i = 0; i < 1000; i++) {
            expect(loki.numErrors).toBe(i);
            await loki.push();
        }
        global.console = consoleTmp;
    });
});
