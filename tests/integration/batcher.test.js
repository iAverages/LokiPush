const axios = require("axios").default;
const Batcher = require("../../dist").default;
const url = "http://loki:3100/loki/api/v1/push";
const fetchUrl = "http://loki:3100/loki/api/v1/query?query=%7Bsource%3D%22lokijs%22%7D&direction=forward";
// TODO: Add test for logging objects - { key: "value" }
const logs = ["loki test", "just another loki test", "loki loki loki!"];

jest.setTimeout(10000);

describe("Logs", () => {
    it("should log to loki", async () => {
        const loki = new Batcher(url, {}, false);
        for (const log of logs) {
            loki.addLog(log);
        }
        await loki.push();

        const res = await axios.get(fetchUrl);
        if (res.data.status !== "success" && res.data.data.result[0].values < 1) {
            fail();
        }
        const lokiLogs = res.data.data.result[0].values;
        for (let i = 0; i < lokiLogs.length; i++) {
            const log = logs[i];
            const lokiLog = lokiLogs[i][1];
            expect(log).toBe(lokiLog);
        }
    });
});
