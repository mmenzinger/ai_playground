import { LazyElement } from '@element/lazy-element';
import { ProjectSettings } from '@store/types';
import { html, TemplateResult } from 'lit-element';
import projectStore from '@store/project-store';
import db from '@localdb';

export abstract class Scenario extends LazyElement {
    static get properties() {
        return {
            ...super.properties,
            settings: { type: Object },
        }
    }

    settings: ProjectSettings;

    abstract async onCall(functionName: string, args: any[]): Promise<any>;
    abstract getSettings(): ProjectSettings;
    abstract getFile(): string;
    abstract getAutorun(): boolean;

    async saveSettings(){
        const id = projectStore.activeProject?.id;
        if(id){
            await db.saveProjectSettings(id, this.settings);
        }
    }
}