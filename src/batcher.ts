import BigInt from "big-integer";
import fetch from "axios";
const loadNs = process.hrtime.bigint();
const loadMs = Date.now();

export interface BatcherOptions {
    pushInterval?: number;
    numErrors?: number;
    metadata?: {
        [key: string]: string | number | boolean;
    };
}

export class Batcher {
    private batch = new Map<string, string>();
    private readonly url;
    private readonly options;
    private readonly timerInterval: number;
    private interval: NodeJS.Timer | null = null;
    private numErrors = 0;

    constructor(url: string, options: BatcherOptions = {}) {
        this.url = url;
        this.options = options;
        this.timerInterval = options.pushInterval ?? 1000;
        this.start();
    }

    public start() {
        if (this.interval) return;
        this.interval = setInterval(() => this.run(), this.timerInterval).unref();
    }

    private async run() {
        if (this.batch.size === 0) return;
        await this.push();
    }

    public stop() {
        if (!this.interval) return;
        clearInterval(this.interval);
        this.interval = null;
    }

    public addLog(message: string) {
        this.batch.set(this.getEpochNano(), message);
    }

    public log = this.addLog;

    public getEpochNano() {
        return BigInt(loadMs)
            .times(1e6)
            .add(process.hrtime.bigint() - loadNs)
            .toString();
    }

    public async push() {
        const json = {
            streams: [
                {
                    stream: {
                        ...(this.options.metadata ?? {}),
                    },
                    values: [...this.batch],
                },
            ],
        };
        try {
            await fetch(this.url, {
                method: "post",
                data: JSON.stringify(json),
                headers: { "Content-Type": "application/json" },
            });
            this.batch.clear();
        } catch (e: any) {
            console.log(e);
            if (this.numErrors > 1) {
                // clamp, 1-60
                const waitTime = Math.round(Math.max(1, Math.min((this.numErrors - 1) * 5, 60)));
                console.warn(`Loki requst failed ${this.numErrors} times, waiting ${waitTime} seconds before retrying.`);
                this.stop();
                setTimeout(() => this.start(), waitTime * 1000);
            }
            this.numErrors++;
        }
    }
}
