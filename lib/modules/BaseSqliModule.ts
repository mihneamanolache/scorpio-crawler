import type { ElementHandle, Page } from "playwright";
import ScorpioModule from "../ScorpioModule";


/**
 * Base module for detecting SQL Injection vulnerabilities.
 *
 * NOTE: NOT YET IMPLEMENTED!
 *
 * TODO: 
 *   - [ ] Identify the type of the input field
 *   - [ ] Test the input field with different payloads
 *   - [ ] Check if the payload is reflected in the response
 *   - [ ] Intercept POST requests and re-run with different payloads
 *   - [ ] Add more this._Payloads
 *   - [ ] Import and use module in `Scorpio.ts` once implemented
 */
class BaseSqliModule extends ScorpioModule{
    /**
     * Stores details about the SQL injection test (payloads and results).
     */
    private _SqliData: unknown = {};

    /**
     * List of SQL injection payloads to test input fields.
     */
    private _Payloads: Array<string> = [
        `1' OR '1' = '1`,
    ];

    /**
     * Executes the SQL injection module to test for vulnerabilities.
     * 
     * @param page - The Playwright page object used for testing.
     * 
     * @returns A promise that resolves once the module completes testing.
     */
    public async run(page: Page): Promise<void> {
        try {
            const inputs: Array<ElementHandle> = await page.$$('input');
            for (const input of inputs) {
                if (this.result.positive) {
                    break;
                }
                const isElementVisible: boolean = await input.isVisible();
                if (!isElementVisible) {
                    this.logger('Input element is not visible');
                }
                for (const payload of this._Payloads) {
                    this.logger('Testing payload: %s', payload);
                }
            }
        } catch (e: unknown) {
            this.logger('Error running: %O', e);
        } 
    }
}

/**
 * Factory function to create an instance of the SQL Injection module.
 * 
 * @returns A new instance of the BaseSqliModule.
 */
export default function(): ScorpioModule {
    return new BaseSqliModule();
}
