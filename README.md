# LokiPush

[![Build Status](<https://ci.danielraybone.com/app/rest/builds/buildType:(id:LokiPush_Build)/statusIcon>)](https://ci.danielraybone.com/buildConfiguration/LokiPush_Build?mode=branches&guest=1)

Simple module to push logs to loki.

## Usage

### Basic

```js
const Loki = require("lokipush"); // CommonJS

const loki = new Loki("https://ip:port/loki/api/v1/push");
loki.addLog("I will be pushed to loki!");
```

This will push a log to loki. Logs are queued for 1 second (can be changed) and sent in batches.
