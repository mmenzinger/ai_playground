export declare const pl: {
    create(): KnowledgeBase,
}

export type KnowledgeBase = {
    query(query: string): void,
    answers(max: number = 1000): Promise<any[]>,
    asserta(string: string): Promise<void>,
    assertz(string: string): Promise<void>,
    run(string: string): Promise<void>,
    consult(file: string): Promise<void>,
    isTrue(query: string): Promise<boolean>,
}