import ScorpioModule from "../ScorpioModule";
import type { BrowserContext, CDPSession, Page } from "playwright";
import type { Protocol } from 'devtools-protocol';

/**
 * Module for analyzing SSL certificates of websites.
 */
class SslCertificateModule extends ScorpioModule {

    /**
     * Stores the SSL certificate details obtained during testing.
     */
    private _SslData: Protocol.Network.SecurityDetails | null = null;

    /**
     * Executes the SSL certificate analysis module.
     * 
     * @param page - The Playwright page object used for testing.
     * 
     * @returns A promise that resolves once the analysis is complete.
     */
    public async run(page: Page): Promise<void> {
        let client: CDPSession | null = null;

        /**
         * Event listener to capture SSL certificate details from network responses.
         * 
         * @param event - The response received event containing network details.
         */
        const fetchOnce: (event: Protocol.Network.ResponseReceivedEvent) => void = (event: Protocol.Network.ResponseReceivedEvent): void => {
            this.getCertificateDetails(event);
            if (this._SslData) {
                client?.off("Network.responseReceived", fetchOnce);
            }
        };

        try {
            const context: BrowserContext = page.context();
            client = await context.newCDPSession(page);
            await client.send("Network.enable");
            client.on("Network.responseReceived", fetchOnce);
            await page.goto(page.url());
        } catch (e: unknown) {
            this.logger("Error running: %O", e);
        } finally {
            if (client) {
                client.off("Network.responseReceived", fetchOnce);
                await client.detach();
            }
        }
        this.analyzeCertificate(this._SslData);
        this.result.result = this._SslData;
    }

    /**
     * Extracts SSL certificate details from a network response event.
     * 
     * @param event - The network response event containing security details.
     */
    private getCertificateDetails(event: Protocol.Network.ResponseReceivedEvent): void {
        if (this._SslData) {
            return;
        }
        if (event.response.securityDetails) {
            this.result.positive = true;
            this._SslData = event.response.securityDetails;
        }
    }

    /**
     * Analyzes the SSL certificate details and logs relevant information.
     * 
     * @param crt - The SSL certificate details to analyze.
     */
    private analyzeCertificate(crt: Protocol.Network.SecurityDetails | null): void {
        if (!crt) {
            this.warning("No SSL certificate found");
            return;
        }
        this.logger("Found SSL certificate: %O", JSON.stringify(this._SslData));
        const sans: Array<string> = crt.sanList;
        if (sans.length > 0) {
            this.logger("SSL Certificate has %d associated domains", sans.length);
            this.logger("Associated domains: %O", JSON.stringify(sans));
        }
        const organization: string = crt.subjectName;
        if (organization) {
            this.logger("Found organization: %s", organization);
        }
    }
}

/**
 * Factory function to create an instance of the SSL Certificate module.
 * 
 * @returns A new instance of the SslCertificateModule.
 */
export default function (): ScorpioModule {
    return new SslCertificateModule();
}
