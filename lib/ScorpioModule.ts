import type { Debugger } from "debug";
import debug from "debug";
import type { Page } from "playwright";
import type { IModuleResult } from "./Scorpio.types";

/**
 * Abstract base class for all Scorpio security modules.
 * 
 * This class provides common functionality such as logging, module result management, 
 * and module name retrieval. Each specific module must extend this class and implement 
 * the `run` method to perform its own security checks.
 */
export default abstract class ScorpioModule {

    /**
     * Logger instance for general logging.
     */
    protected logger: Debugger;

    /**
     * Logger instance for critical-level messages.
     */
    protected critical: Debugger;

    /**
     * Logger instance for warning-level messages.
     */
    protected warning: Debugger;

    /**
     * The result object containing the module's name, status, and findings.
     */
    private _result: IModuleResult;

    /**
     * Retrieves the module's result object.
     */
    get result(): IModuleResult {
        return this._result;
    }

    /**
     * Constructs the ScorpioModule instance.
     * Initializes loggers and sets up the default result structure.
     */
    public constructor() {
        this.logger = debug(`scorpio:${this.name}`);
        this.critical = this.logger.extend("critical");
        this.warning = this.logger.extend("warning");
        this._result = {
            name: this.name,
            positive: false,
            result: null
        };
    }

    /**
     * Retrieves the name of the module.
     * 
     * The module name is derived from the class name of the concrete implementation.
     */
    get name(): string {
        return this.constructor.name;
    }

    /**
     * Abstract method to execute the module.
     * 
     * Each module must implement this method to perform its specific security checks.
     * 
     * @param _page - The Playwright `Page` instance representing the target page.
     * 
     * @returns A promise that resolves once the module completes its execution.
     */
    abstract run(_page: Page): Promise<void>;
}
