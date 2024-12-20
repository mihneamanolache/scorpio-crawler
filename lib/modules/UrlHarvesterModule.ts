import type { Page } from "playwright";
import ScorpioModule from "../ScorpioModule";

/**
 * Module for harvesting URLs from a webpage.
 */
class UrlHarvester extends ScorpioModule {

    /**
     * Executes the URL harvesting module.
     * 
     * @param page - The Playwright page object representing the current page.
     * 
     * @returns A promise that resolves once the harvesting is complete.
     */
    public async run(page: Page): Promise<void> {
        try {
            const url: URL = new URL(page.url());
            /**
             * Extract all anchor (`<a>`) elements from the page and generate their full URLs.
             */
            const urls: Array<string> = await page.evaluate((): Array<string> => {
                const links: Array<HTMLAnchorElement> = Array.from(document.querySelectorAll('a'));
                return links.map((link): string => {
                    if (link.href.startsWith('/')) {
                        return window.location.origin + link.href;
                    }
                    return link.href;
                });
            });
            const inbound_urls: Array<string> = urls.filter((u): boolean => u.startsWith(url.origin) || u.startsWith("/"));
            const outbound_urls: Array<string> = urls.filter((u): boolean => !u.startsWith(url.origin) && !u.startsWith('/'));
            this.logger('Found %d inbound URLs and %d outbound URLs', inbound_urls.length, outbound_urls.length);
            this.result.result = {
                inbound_urls,
                outbound_urls
            };
        } catch (e: unknown) {
            this.logger('Error running: %O', e);
        }
    }
}

/**
 * Factory function to create an instance of the URL Harvester module.
 * 
 * @returns A new instance of the UrlHarvester module.
 */
export default function(): ScorpioModule {
    return new UrlHarvester();
}

