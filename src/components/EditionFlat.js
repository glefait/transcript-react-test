"use client";
import React from "react";
import { useState, useContext } from 'react';
import { TranscriptContext } from '@/components/TranscriptContext';


export function TranscriptionEditedWord({ uuid, firstPosition }) {
    const {transcription, setTranscription} = useContext(TranscriptContext);

    const part = transcription[uuid];
     return (
        <span className={"" + (firstPosition ? " firstWord" : "") } key={uuid} x-data-uuid={uuid} >
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

    console.log("---->" + firstPosition);
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
    return (
       <p className="transcriptionLine"
          role="textbox" tabIndex={0}>
            <span className="moveLine uxOnly">^</span>
            <span className="showJson uxOnly">json</span>
            <span className="moveFirstWord uxOnly">..</span>
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