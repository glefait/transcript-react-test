export function addSomeReferencesInFlatDataStructure(data) {
    // - block => prev / next
    // - line => prev / next, parent
    let rootUUID = null;
    for(const [key, value] of Object.entries(data)) {
        if (value.kind == 'transcription') {
            rootUUID = key;
            break;
        }
    }
    // ordered blocks
    const nbBlockChildren = data[rootUUID].children.length;
    for (let i=0; i<nbBlockChildren; i += 1){
        const currentChildUUID = data[rootUUID].children[i];
        data[currentChildUUID].parent = rootUUID;
        data[currentChildUUID].prevBlock = (i > 0) ? data[rootUUID].children[i - 1] : null;
        data[currentChildUUID].nextBlock = (i < nbBlockChildren - 1) ? data[rootUUID].children[i + 1] : null;
    }
    // ordered lines, cross block
    let prevLine = null;
    for (let i=0; i<nbBlockChildren; i += 1){
        const currentBlockUUID = data[rootUUID].children[i];
        const lineUUIDs = data[currentBlockUUID].children;
         for (let j=0; j<lineUUIDs.length; j += 1){
            data[lineUUIDs[j]].parent = currentBlockUUID;
            data[lineUUIDs[j]].prevLine = prevLine;
            prevLine = lineUUIDs[j];
         }
    }
    let nextLine = null;
    for (let i=nbBlockChildren-1; i>=0; i -= 1) {
        const currentBlockUUID = data[rootUUID].children[i];
        const lineUUIDs = data[currentBlockUUID].children;
        for (let j = lineUUIDs.length - 1; j >= 0; j -= 1) {
            data[lineUUIDs[j]].nextLine = nextLine;
            nextLine = lineUUIDs[j];
        }
    }

    return data;
}