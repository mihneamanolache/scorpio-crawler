# Scorpio Penetration Testing Framework

> This project is still in development and is not yet ready for production use.

Scorpio is a modular penetration testing framework designed to automate common security testing tasks. With a focus on flexibility and extensibility, Scorpio provides tools for detecting vulnerabilities such as cross-site scripting (XSS), SSL/TLS misconfigurations, URL harvesting, and more.

## ⚠️  Disclaimer
Scorpio is intended for educational purposes only. The author is not responsible for any misuse or damage caused by this software. Please use responsibly and only on systems you have permission to test.

## Features
- Modular Design: Easily extend Scorpio by creating custom modules.
- Playwright Integration: Leverages the power of Playwright for browser automation and interaction.
- Logging: Includes detailed logging for debugging and reporting.
- Predefined Modules:
    - XSS Detection: Tests input fields for cross-site scripting vulnerabilities.
    - SSL Certificate Analysis: Extracts and analyzes SSL/TLS certificate details.
    - URL Harvester: Collects inbound and outbound links from a webpage.

## Usage

To execute all modules against a target URL:

```ts
import Scorpio from './src/Scorpio';

const scorpio: Scorpio = new Scorpio();

(async () => {
    await scorpio.attack('https://example.com');
})();

console.log(scopio.results);
```

## Modules

Scorpio modules are designed to be easily extendable. Scopripo come packaged with a few predefined modules, but you can create your own by extending the `Module` class.

### Predefined Modules
- `BaseXssModule`: Tests input fields for cross-site scripting vulnerabilities.
- `SslCertificateModule`: Extracts and analyzes SSL/TLS certificate details.
- `UrlHarvesterModule`: Collects inbound and outbound links from a webpage.

### Custom Modules
To create a custom module, extend the ScorpioModule class:
```ts
import ScorpioModule from './src/ScorpioModule';
import { Page } from 'playwright';

class CustomModule extends ScorpioModule {
  async run(page: Page): Promise<void> {
    // Your custom logic here.
  }
}

export default function(): ScorpioModule {
  return new CustomModule();
}
```

Then import and add your module to Scorpio:
```ts
import Scorpio from './src/Scorpio';
import CustomModule from './CustomModule';

const scorpio: Scorpio = new Scorpio();
scorpio.use(CustomModule);
```

