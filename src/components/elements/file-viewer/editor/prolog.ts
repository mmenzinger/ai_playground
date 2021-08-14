import monaco from 'monaco-editor';

// fix for monaco language keywords, see https://github.com/microsoft/monaco-editor/issues/1423
interface MonarchLanguageConfiguration
    extends monaco.languages.IMonarchLanguage {
    keywords: string[];
}

export const prologTokensProvider: MonarchLanguageConfiguration = {
    keywords: [
        'dynamic',
        'is',
        'call',
        'catch',
        'fail',
        'false',
        'throw',
        'true',
        'subsumes_term',
        'unify_with_occurs_check',
        'abolish',
        'asserta',
        'assertz',
        'retract',
        'retractall',
    ],
    tokenizer: {
        root: [
            //[/[a-z][a-zA-Z0-9]*/, 'type'],
            [/%.*/, 'comment'],
            { include: 'common' },
        ],
        common: [
            [
                /[a-z_$][\w$]*/,
                {
                    cases: {
                        '@keywords': 'keyword',
                        '@default': 'type',
                    },
                },
            ],
            [/[A-Z]\w*/, 'string'],
            [/\\\+/, 'keyword'],
            [/"[^"]*"/, 'string'],
        ],
    },
};