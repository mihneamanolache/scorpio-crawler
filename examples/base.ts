import HtmlTemplateModule from "../lib/modules/HtmlTemplateModule";
import Scorpio from "../lib/Scorpio";

const scorpio: Scorpio = new Scorpio();
scorpio.use(HtmlTemplateModule());

void (async (): Promise<void> => {
    try {
        /* NOTE: I'm running OWASP Juice Shop on localhost:80 (docker run --rm -p 80:3000 bkimminich/juice-shop) */
        await scorpio.attack("http://localhost");
    } catch {
        /**/
    }
})();
