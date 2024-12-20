import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import debug, { type Debugger } from 'debug';
import BaseXssModule from "./modules/BaseXssModule";
import type ScorpioModule from "./ScorpioModule";
import type { IModuleResult } from "./Scorpio.types";
import SslCertificateModule from "./modules/SslCertificateModule";
import UrlHarvester from "./modules/UrlHarvesterModule";

/**
 * Main class for the Scorpio penetration testing framework.
 * 
 * The `Scorpio` class is responsible for managing and executing security modules
 * against a given target URL. It initializes and orchestrates various modules,
 * launches a Playwright browser instance, and collects the results of each module's execution.
 */
export default class Scorpio {

    /**
     * List of security modules to be executed during the attack.
     */
    protected modules: Array<ScorpioModule>;

    /**
     * Logger instance for debugging and logging events.
     */
    protected logger: Debugger = debug('scorpio');

    /**
     * Playwright `Page` object for browser interactions.
     */
    private _Page: Page | null = null;

    /**
     * Retrieves the results of all executed modules.
     */
    get results(): Array<IModuleResult> {
        return this.modules.map((module): IModuleResult => module.result);
    }

    /**
     * Initializes the Scorpio instance and loads default modules.
     */
    constructor() {
        this.modules = [
            BaseXssModule(),
            SslCertificateModule(),
            UrlHarvester()
        ];
    }

    /**
     * Adds a new module to the list of security modules.
     */
    public use(module: ScorpioModule): void {
        this.modules.push(module);
    }

    /**
     * Executes all loaded modules against the specified target URL.
     * 
     * @param url - The target URL to attack.
     * 
     * @returns A promise that resolves when the attack is complete.
     */
    public async attack(url: string): Promise<void> {
        this.logger('Attacking %s', url);
        try {
            await this.launch();
            if (!this._Page) {
                throw new Error('Page not available');
            }
            for (const module of this.modules) {
                await this._Page.goto(url, { waitUntil: 'networkidle' });
                await module.run(this._Page);
            }
        } catch (e: unknown) {
            this.logger('Error attacking: %O', e);
        } finally {
            await this.cleanup();
            this.logger('Attack completed');
            this.logger('Results: %O', JSON.stringify(this.results));
        }
    }

    /**
     * Launches a Playwright browser instance and creates a new page for testing.
     * 
     * @returns A promise that resolves when the browser is ready.
     */
    protected async launch(): Promise<void> {
        try {
            const browser: Browser = await chromium.launch({
                headless: true
            });
            const context: BrowserContext = await browser.newContext();
            this._Page = await context.newPage();
            this.logger('Scorpio launched!');
        } catch {
            process.exit(1); // Exit on launch failure.
        }
    }

    /**
     * Cleans up resources by closing the browser, page, and context.
     * 
     * @returns A promise that resolves when cleanup is complete.
     */
    protected async cleanup(): Promise<void> {
        if (this._Page) {
            const context: BrowserContext = this._Page.context();
            const browser: Browser | null = context.browser();
            try {
                await this._Page.unrouteAll();
                await this._Page.close();
                await context.close();
                await browser?.close();
            } catch (e: unknown) {
                this.logger('Error closing page: %O', e);
            }
        }
    }
}
