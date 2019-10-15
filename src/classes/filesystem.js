import Dexie from 'dexie/dist/dexie';

export const FileType = {
    FOLDER: 0,
    TEXT: 1,
    JS: 2,
    JSON: 3,
};

const fileSystems = {};
export function FileSystem(name = 'default_fs') {
    if (!fileSystems[name]) {
        let db = new Dexie(name);
        db.version(1).stores({
            files: "++id,parent,name,type,modified"
        });

        fileSystems[name] = Object.freeze({
            createFile: async (name, parent, type, content) => {
                return db.files.put({
                    name: name,
                    parent: parent,
                    type: type,
                    content: content,
                    modified: 0
                });
            },

            readFile: async (id) => {
                return db.files.get(id);
            },

            writeFile: async (id, content) => {

            }
        });
    }
    return fileSystems[name];
};

export default FileSystem;