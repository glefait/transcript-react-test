"use client";
import React from "react";
import { useState, useContext } from 'react';
import { TranscriptContext } from '@/components/TranscriptContext';
import {v4 as uuidv4} from 'uuid';



export function TranscriptionEditedWord({ uuid, firstPosition }) {
    const {transcription, setTranscription} = useContext(TranscriptContext);

    const inputChangeHandler = (event) => {
        //this.setState({input: event.target.value});
        console.log("input uuid " + event);
    }

    const changeChangeHandler = (event) => {
        //this.setState({input: event.target.value});
        console.log("change uuid " + event);
    }

    const blurChangeHandler = (event) => {
        //this.setState({input: event.target.value});
        console.log("blur: uuid " + event);
    }

    const part = transcription[uuid];
     return (
        <span className={"" + (firstPosition ? " firstWord" : "") } key={uuid} x-data-uuid={uuid}
              onInput={inputChangeHandler} onChange={changeChangeHandler} onBlur={blurChangeHandler}  >
            { part.content }
        </span>
    );
}
export function TranscriptionSubWord({ uuid }) {
    const {transcription, setTranscription} = useContext(TranscriptContext);

    const subword = transcription[uuid];
    return (
         <span className={"p" + (100 * subword.p.toFixed(1))} key={uuid} x-data-p={subword.p} x-data-ms-start={subword.ms_start} x-data-ms-end={subword.ms_end}>
            {subword.content}
        </span>
    );
}
export function TranscriptionWord({ uuid, firstPosition }) {
    const {transcription, setTranscription} = useContext(TranscriptContext);

    const subwords = transcription[uuid].children.map(childrenUUID => {
        return <TranscriptionSubWord uuid={childrenUUID} firstPosition={firstPosition} key={childrenUUID} />
    })
    return (
         <span className={"word" + (firstPosition ? " firstWord" : "")} key={uuid}>
            {subwords}
        </span>
    );
}

export function TranscriptionLine({uuid}) {
    const {transcription, setTranscription} = useContext(TranscriptContext);
    //const [stateLine, setStateLine] = useState(line);

    const parts = transcription[uuid].children.map((childrenUUID, index) => {
        if(transcription[childrenUUID].kind == 'edition') {
            return <TranscriptionEditedWord uuid={childrenUUID} firstPosition={index==0} key={childrenUUID} />
        } else {
            return <TranscriptionWord uuid={childrenUUID} firstPosition={index==0} key={childrenUUID} />
        }
    })
    const onMoveLineAbove = (e) => {
        e.stopPropagation();
        console.log("moveLineAbove:" + uuid);
        let updates = {}
        if (transcription[uuid].prevLine !== null) {
            // TBC: it should happen only on the first line ? Or if second line, move all above at once ?
            // TBC: if any, line jump over empty block(s)
            const currentParentUUID = transcription[uuid].parent;
            const newParentUUID = transcription[transcription[uuid].prevLine].parent;
            console.log(currentParentUUID + " === " + newParentUUID + " => " + currentParentUUID === newParentUUID);
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
        const newTranscription = {
            ...transcription,
            ...updates
        }
        setTranscription(newTranscription)
    }
    const onMoveFirstWordAbove = (e) => {
        e.stopPropagation();
        console.log("onMoveFirstWordAbove:" + uuid);
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
        const newTranscription = {
            ...transcription,
            ...updates
        }
        setTranscription(newTranscription)

    }
    const onGetLineJSON = (e) => {
        e.stopPropagation();
        console.log(JSON.stringify(transcription));
    }
    return (
       <p className="transcriptionLine"
          role="textbox" tabIndex={0}>
            <span className="moveLine uxOnly" onClick={onMoveLineAbove}>^</span>
            <span className="showJson uxOnly" onClick={onGetLineJSON}>json</span>
            <span className="moveFirstWord uxOnly" onClick={onMoveFirstWordAbove}>..</span>
            <span className="editableLine" contentEditable={true} spellCheck="false">
                {parts}
            </span>
        </p>
    );
}
export function TranscriptionSpeech({ children_uuids }) {
    const { transcription, setTranscription } = useContext(TranscriptContext);
    const onBlur = () => {
        console.log("TranscriptionSpeech:onBlur");
    }
    // console.log("my object: %o", speech_lines)
    let i = 0;
    const lines = children_uuids.map((lineUUID) => {
        i += 1;
        // @ts-ignore
        return <TranscriptionLine onBlur={onBlur} uuid={lineUUID} key={i} />
    })
    return (
        <div className="basis-5/6">{lines}</div>
    );
}
export function TranscriptionRow({ uuid  }){
    const { transcription, setTranscription } = useContext(TranscriptContext);
    const current_speech = transcription[uuid];

    return (
        <div className="transcriptionRow flex flex-row">
            <div className="basis-1/6">{current_speech.user.name}</div>
            <TranscriptionSpeech children_uuids={current_speech.children} />
        </div>
    );
}

export function TranscriptionSeparator(){
    return (
        <div className="transcriptionSeparator flex flex-row"></div>
    );
}
export function TranscriptionEdition({ uuid }) {
    const { transcription, setTranscription } = useContext(TranscriptContext);

    const listItems = transcription[uuid].children.flatMap(blockUUID => {
        const row = transcription[blockUUID];
        const t = [<TranscriptionRow uuid={blockUUID} key={blockUUID}/>, <TranscriptionSeparator key={"sep_" + blockUUID} />];
        return t;
    });
    return (
        <div className="transcriptionEdition">
            {listItems}
        </div>
    );
}