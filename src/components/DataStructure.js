import {v4 as uuidv4} from "uuid";

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


export function moveLine(uuid, transcription) {
    let updates = {}
    if (transcription[uuid].prevLine !== null) {
        // TBC: it should happen only on the first line ? Or if second line, move all above at once ?
        // TBC: if any, line jump over empty block(s)
        const currentParentUUID = transcription[uuid].parent;
        const newParentUUID = transcription[transcription[uuid].prevLine].parent;
        if (currentParentUUID === newParentUUID) {
            console.log("we allow only to move the first line, ignored");
            return true;
        }
        updates = {
            [currentParentUUID]: {
                ...transcription[currentParentUUID],
                children: transcription[currentParentUUID].children.slice(1)
            },
            [newParentUUID]: {
                ...transcription[newParentUUID],
                children: transcription[newParentUUID].children.concat([uuid])
            },
            [uuid]: {
                ...transcription[uuid],
                parent: newParentUUID
            }
        }
    }else{
         const newCreatedBlock = {
            kind: "block",
            prevBlock: null,
            nextBlock: transcription[uuid].parent,
            user: {
                name: "unknown",
                uuid: uuidv4()
            },
            children: [uuid],
            parent: transcription[transcription[uuid].parent].parent
        }
        const newCreatedBlockUUID =  uuidv4();
        const updatedRoot = {
            kind: "transcription",
            children: [newCreatedBlockUUID].concat(transcription[newCreatedBlock.parent].children)
        }
        const currentParentUUID = transcription[uuid].parent;
        const updatedParent = {
            ...transcription[currentParentUUID],
            children: transcription[currentParentUUID].children.slice(1)
        }
        updates = {
            [newCreatedBlock.parent]: updatedRoot,
            [newCreatedBlockUUID]: newCreatedBlock,
            [currentParentUUID]: updatedParent,
            [uuid]: {
                ...transcription[uuid],
                parent: newCreatedBlockUUID
            },
        }
    }
    return updates;
}


export function moveFirstWordAbove(uuid, transcription) {
    // get the first word
    const currentFirstWordUUID = transcription[uuid].children[0];
    // remove it from the current children
    const currentLineUpdatedChildren = transcription[uuid].children.slice(1);
    // TBC: if new line has no child, should we remove it (and remove the block if needed ?)
    let updates = {}
    // search for the line above, on the very first line, create a new line
    if (transcription[uuid].prevLine !== null) {
        const previousLineUUID = transcription[uuid].prevLine;
        const previousLineUpdatedChildren = transcription[previousLineUUID].children.concat([currentFirstWordUUID])
        updates = {
            [previousLineUUID]: {
                ...transcription[previousLineUUID],
                children: previousLineUpdatedChildren
            },
            [uuid]: {
                ...transcription[uuid],
                children: currentLineUpdatedChildren
            }
        }
    } else {
        // create a new line + block with unknown user (to be updated with default value ?)
        const newCreatedLine = {
            kind: "line",
            children: [currentFirstWordUUID],
            prevLine: null,
            nextLine: uuid,
            parent: uuidv4()
        }
        const newCreatedLineUUID = uuidv4();
        const newCreatedBlock = {
            kind: "block",
            prevBlock: null,
            nextBlock: transcription[uuid].parent,
            user: {
                name: "unknown",
                uuid: uuidv4()
            },
            children: [newCreatedLineUUID],
            parent: transcription[transcription[uuid].parent].parent
        }
        const newCreatedBlockUUID = newCreatedLine.parent;
        // update root
        const updatedRoot = {
            kind: "transcription",
            children: [newCreatedBlockUUID].concat(transcription[newCreatedBlock.parent].children)
        }
        updates = {
            [newCreatedBlock.parent]: updatedRoot,
            [newCreatedBlockUUID]: newCreatedBlock,
            [newCreatedLineUUID]: newCreatedLine,
            [uuid]: {
                ...transcription[uuid],
                prevLine: newCreatedLineUUID,
                children: currentLineUpdatedChildren
            },
        }
    }
    return updates;
}