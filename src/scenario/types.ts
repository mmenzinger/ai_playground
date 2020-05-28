export interface IScenario extends HTMLElement{
    onCall: (functionName: string, args: any[]) => Promise<any>;
    getSettings: () => any;
    getFile: () => string;
    getAutorun: () => boolean;
}

export class ScenarioError extends Error{}; 