export interface IScenario {
    onCall: (functionName: string, args: any[]) => Promise<any>;
}