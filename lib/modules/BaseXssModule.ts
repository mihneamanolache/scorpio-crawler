import ScorpioModule from "../ScorpioModule";
import type { Dialog, ElementHandle, Page } from "playwright";

/**
 * Interface to define the structure of XSS data collected during testing.
 */
interface IXssData {
    /* URL where the XSS payload was tested */
    url?:       string;   
    /* The XSS payload used for testing */
    payload?:   string;   
    /* The HTML element where the XSS payload was injected */
    element?:   string;   
}

/**
 * Base module for detecting Cross-Site Scripting (XSS) vulnerabilities.
 */
class BaseXssModule extends ScorpioModule {

    /**
     * Stores details about the XSS test (URL, payload, and element).
     */
    private _XssData: IXssData = {};

    /**
     * List of XSS payloads to be tested on input fields.
     */
    private _Payloads: Array<string> = [
        `<script>alert('${this.name}')</script>`,
        `<img src="x" onerror="alert('${this.name}')">`,
        `<svg onload="alert('${this.name}')"></svg>`,
        `<iframe src="javascript:alert('${this.name}')"></iframe>`,
    ];

    /**
     * Executes the XSS module to test for vulnerabilities.
     * 
     * @param page - The Playwright page object used for testing.
     *
     * @returns A promise that resolves to the module's result.
     */
    public async run(page: Page): Promise<void> {
        page.on('dialog', (dialog): Promise<void> => this.handleDialog(dialog));
        try {
            const inputs: Array<ElementHandle> = await page.$$('input');
            for (const input of inputs) {
                if (this.result.positive) {
                    break;
                }
                const isElementVisible: boolean = await input.isVisible();
                if (!isElementVisible) {
                    this.logger('Input element is not visible');
                    continue;
                }
                for (const payload of this._Payloads) {
                    this._XssData.element = await input.evaluate((el: HTMLInputElement): string => el.outerHTML);
                    this._XssData.url = page.url();
                    this._XssData.payload = payload;
                    await input.fill(payload, { force: true });
                    await page.keyboard.press('Enter');
                    await page.waitForTimeout(1000);
                    this.result.result = this._XssData;
                    if (page.url() !== this._XssData.url) {
                        await page.goBack();
                    }
                }
            }
        } catch (e: unknown) {
            this.logger('Error running: %O', e);
        } finally {
            page.off('dialog', (dialog): Promise<void> => this.handleDialog(dialog));
            if (this.result.positive) {
                this.critical('Found positive XSS results: %s', JSON.stringify(this._XssData));
            }
        }
    }

    /**
     * Handles dialog events triggered by the browser during testing.
     * 
     * @param dialog - The dialog object triggered by the page.
     */
    private async handleDialog(dialog: Dialog): Promise<void> {
        const message: string = dialog.message();
        if (message.includes(this.name)) {
            this.result.positive = true;
        }
        await dialog.dismiss();
    }
}

/**
 * Factory function to create an instance of the XSS module.
 * 
 * @returns A new instance of the BaseXssModule.
 */
export default function(): ScorpioModule {
    return new BaseXssModule();
}
