/**
 * Interface representing the result of a security module's execution.
 */
export interface IModuleResult {
    /** Name of the module that was executed */
    name:       string;
    /** Indicates whether the module found a vulnerability or issue. */
    positive:   boolean;
    /** The result data collected by the module during execution. */
    result:     unknown;
}
