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


/**
 * some data may be deleted
 */
export function findDifferences(updates, currentUUID, currentContent, newChildrenUUIDs) {
    const existingChildrenUUIDs = currentContent.children;
    const currentSubWordUUIDsSet = new Set(newChildrenUUIDs);
    const contextSubWordUUIDsSet = new Set(existingChildrenUUIDs);
    // cannot do difference yet, need firefox 127 => 2024-06-11
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/difference
    // TODO: use difference between sets after GA on firefox. See also below
    for (const curUUID of contextSubWordUUIDsSet) {
        if (! currentSubWordUUIDsSet.has(curUUID)) {
            updates[curUUID] = undefined;
        }
    }
    let replaceChildren = newChildrenUUIDs.length != existingChildrenUUIDs.length;
    if (!replaceChildren) {
        for (let i=0; i<newChildrenUUIDs.length; i++) {
            if (newChildrenUUIDs[i] != existingChildrenUUIDs[i]) {
                replaceChildren = true;
                break;
            }
        }
    }
    if (replaceChildren) {
        updates[currentUUID] = {
            ...currentContent,
            "children": newChildrenUUIDs
        }
    }
    return updates;
}