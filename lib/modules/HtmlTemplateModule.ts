import type { Page } from "playwright";
import ScorpioModule from "../ScorpioModule";

/**
 * Base module for identifying HTML template fingerprinting.
 *
 * NOTE: NOT YET FULLY IMPLEMENTED AND TESTED! DO NOT USE IN PRODUCTION!
 */
class HtmlTemplateModule extends ScorpioModule {
    /**
     * Fetches the HTML, removes all comments, text, and attributes, and returns the MD5 fingerprint.
     * 
     * @param page - The Playwright page object used for testing.
     * 
     * @returns A promise that resolves once the module completes testing.
     */
    public async run(page: Page): Promise<void> {
        try {
            const tagsOnlyHtml: string = await page.evaluate((): string => {
                const traverse: (node: Node) => string = (node: Node): string => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element: Element = node as Element;
                        const children: string = Array.from(element.childNodes)
                            .map(traverse)
                            .filter(Boolean)
                            .sort()
                            .join("");
                        return `<${element.tagName}>${children}</${element.tagName}>`;
                    }
                    return ""; 
                };

                return traverse(document.documentElement); 
            });
            const fingerprint: number | bigint = Bun.hash(tagsOnlyHtml);
            this.logger("HTML Fingerprint: %s", fingerprint);
            this.result.result = fingerprint;
        } catch (e: unknown) {
            this.logger("Error running: %O", e);
        }
    }
}

/**
 * Factory function to create an instance of the HTML template fingerprinting module.
 * 
 * @returns A new instance of the HtmlTemplateModule.
 */
export default function (): ScorpioModule {
    return new HtmlTemplateModule();
}
