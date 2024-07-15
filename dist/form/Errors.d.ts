import React from 'react';
declare class Errors {
    state: Record<string, string[]>;
    setState: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    constructor([state, setState]: [
        Record<string, string[]>,
        React.Dispatch<React.SetStateAction<Record<string, string[]>>>
    ]);
    set(errorsOrField: string | Record<string, string[]>, fieldMessages?: any): void;
    get(field: string): string | undefined;
    getAll(field: string): string[] | undefined;
    has(field: string): boolean;
    any(): boolean;
    all(): Record<string, string[]>;
    flatten(): string[];
    clear(fieldOrFields?: string | string[]): void;
}
export default Errors;
