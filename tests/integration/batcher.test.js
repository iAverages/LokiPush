const { default: Batcher } = require("../../dist");
const url = "http://loki:3100/loki/api/v1/push";
const logs = ["loki test", "just another loki test", "loki loki loki!", { key: "value" }];

describe("Logs", () => {
    it("should log to loki", async () => {
        const loki = new Batcher(url, {}, false);
        for (const log of logs) {
            loki.addLog(log);
        }
        await loki.push();
    });
});
