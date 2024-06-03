"use client";
import React from "react";
import { useState, useContext } from 'react';
import { DomManualManagementContext } from '@/components/DomManualManagementContext';
import { TranscriptContext } from '@/components/TranscriptContext';
import {v4 as uuidv4} from 'uuid';
import {TranscriptionLineDom} from "@/components/EditionFlatDom";
import {findDifferences, moveLine, moveFirstWordAbove} from '@/components/DataStructure';

import { TranscriptFlatRootContext } from '@/components/TranscriptFlatRootContext';


export function TranscriptionEditedWord({ uuid, firstPosition }) {
    const {transcription, setTranscription} = useContext(TranscriptContext);

    const inputChangeHandler = (event) => {
        event.stopPropagation();
        //this.setState({input: event.target.value});
        console.log("inputChangeHandler uuid " + event);
    }

    const changeChangeHandler = (event) => {
        event.stopPropagation();
        //this.setState({input: event.target.value});
        console.log("change uuid " + event);
    }

    const blurChangeHandler = (event) => {
        event.stopPropagation();
        //this.setState({input: event.target.value});
        console.log("blur: uuid " + event);
    }

    const part = transcription[uuid];
     return (
        <span className={"" + (firstPosition ? " firstWord" : "") } key={uuid} x-data-uuid={uuid}
              contentEditable={true}
              onInput={inputChangeHandler} onChange={changeChangeHandler} onBlur={blurChangeHandler}
        >
            { part.content }
        </span>
    );
}
export function TranscriptionSubWord({ uuid }) {
    const {transcription, setTranscription} = useContext(TranscriptContext);
    const inputChangeHandler = (event) => {
        //this.setState({input: event.target.value});
        console.log("inputChangeHandler uuid " + event);
    }

    const changeChangeHandler = (event) => {
        //this.setState({input: event.target.value});
        console.log("change uuid " + event);
    }

    const blurChangeHandler = (event) => {
        //this.setState({input: event.target.value});
        console.log("blur: uuid " + event);
    }
    const subword = transcription[uuid];
    return (
         <span className={"p" + (100 * subword.p.toFixed(1))} key={uuid}
               x-data-uuid={uuid}
               x-data-p={subword.p}
               x-data-ms-start={subword.ms_start} x-data-ms-end={subword.ms_end}
              contentEditable={true}
              onInput={inputChangeHandler} onChange={changeChangeHandler} onBlur={blurChangeHandler}
         >
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
         <span className={"word" + (firstPosition ? " firstWord" : "")}
               key={uuid}
               x-data-uuid={uuid}
         >
            {subwords}
        </span>
    );
}

export function TranscriptionLine({uuid}) {
    const {transcription, setTranscription} = useContext(TranscriptContext);
    // const rootUUID = useContext(TranscriptFlatRootContext);
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
        const updates = moveLine(uuid, transcription);
        const newTranscription = {
            ...transcription,
            ...updates
        }
        setTranscription(newTranscription);
    }
    const onMoveFirstWordAbove = (e) => {
        e.stopPropagation();
        console.log("onMoveFirstWordAbove:" + uuid);
        const updates = moveFirstWordAbove(uuid, transcription);
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

    const onInput = (e) => {
        //e.stopPropagation();
        console.log("input event from line" + e);
    }
    const onBlur = (e) => {
        //e.stopPropagation();
        console.log("onBlur event from line" + e);
    }
    const onFocus = (e) => {
        //e.stopPropagation();
        console.log("onFocus event from line" + e);
    }

    const inputChangeHandler = (event) => {
        //this.setState({input: event.target.value});
        console.log("TranscriptionLine > inputChangeHandler.");
        const currentCaret = window.getSelection();
        console.log("Cursor is " + currentCaret.focusNode.parentElement.getAttribute("x-data-uuid")
            + ", pos = " + currentCaret.getRangeAt(0).startOffset);
        const htmlAfterModifications = Array.from(event.currentTarget.children);
        console.log(htmlAfterModifications);
        console.log(event.currentTarget);
        let topChildren = [];
        let updates = {};
        for (let i=0; i<htmlAfterModifications.length; i++) {
            const currentEltUUID = htmlAfterModifications[i].getAttribute("x-data-uuid");
            topChildren.push(currentEltUUID);
            if (htmlAfterModifications[i].childElementCount == 0) {
                if (htmlAfterModifications[i].innerText != transcription[currentEltUUID].content) {
                    updates[currentEltUUID] = {
                        ...transcription[currentEltUUID],
                        "content": htmlAfterModifications[i].innerText
                    }
                }
            } else {
                let wordChildren = [];
                for (let j=0; j<htmlAfterModifications[i].childElementCount; j++) {
                    const subword = htmlAfterModifications[i].children[j];
                    const subwordUUID = subword.getAttribute("x-data-uuid");
                    wordChildren.push(subwordUUID);
                    if (subword.innerText != transcription[subwordUUID]) {
                        updates[subwordUUID] = {
                            ...transcription[subwordUUID],
                            "content": subword.innerText
                        }
                    }
                }
                updates = findDifferences(updates, currentEltUUID, transcription[currentEltUUID], wordChildren);
            }
        }
        updates = findDifferences(updates, uuid, transcription[uuid], topChildren);
        console.log(updates);
        const newTranscription = {
            ...transcription,
            ...updates
        }
        setTranscription(newTranscription)


    }

    const changeChangeHandler = (event) => {
        //this.setState({input: event.target.value});
        console.log("change uuid " + event);
    }

    return (
       <p className="transcriptionLine"
          role="textbox" tabIndex={0}>
            <span className="moveLine uxOnly" onClick={onMoveLineAbove}>^</span>
            <span className="showJson uxOnly" onClick={onGetLineJSON}>json</span>
            <span className="moveFirstWord uxOnly" onClick={onMoveFirstWordAbove}>..</span>
            <span className="editableLine" contentEditable={true} spellCheck="false"
                  x-data-uuid={uuid}
                  onBlur={inputChangeHandler}
                  onFocus={onFocus}
                  //onInput={inputChangeHandler}
                  onChange={changeChangeHandler}
            >
                {parts}
            </span>
        </p>
    );
}
export function TranscriptionSpeech({ children_uuids }) {
    const { transcription, setTranscription } = useContext(TranscriptContext);
    const domManualManagement = useContext(DomManualManagementContext);
    const onBlur = () => {
        console.log("TranscriptionSpeech:onBlur");
    }
    // console.log("my object: %o", speech_lines)
    let i = 0;
    const lines = children_uuids.map((lineUUID) => {
        i += 1;
        // @ts-ignore
        if (domManualManagement) {
            return <TranscriptionLineDom onBlur={onBlur} uuid={lineUUID} key={lineUUID}/>
        } else {
            return <TranscriptionLine onBlur={onBlur} uuid={lineUUID} key={lineUUID}/>
        }
    })
    return (
        <div className="basis-5/6">{lines}</div>
    );
}

export function TranscriptionSpeaker({uuid}) {
    const { transcription, setTranscription } = useContext(TranscriptContext);
    const current_speech = transcription[uuid];
    return (
        <div className="basis-1/6">{current_speech.user.name}</div>
    );
}

export function TranscriptionRow({ uuid  }){
    const { transcription, setTranscription } = useContext(TranscriptContext);
    const current_speech = transcription[uuid];

    return (
        <div className="transcriptionRow flex flex-row">
            <TranscriptionSpeaker uuid={uuid} />
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