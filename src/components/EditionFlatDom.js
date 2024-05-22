"use client";
import React from "react";
import { useState, useContext } from 'react';
import { TranscriptContext } from '@/components/TranscriptContext';



export function GenerateDomFromData(childrenUUIDs) {
    const {transcription, setTranscription} = useContext(TranscriptContext);
    let parts = [];
    childrenUUIDs.map((partUUID, index) => {
        const part = transcription[partUUID];
        if (part.kind == 'edition') {
            let editedNode = React.createElement('span', {
                "x-data-uuid": part.uuid,
                key: partUUID,
                className: "" + (index == 0 ? " firstWord" : "")
            }, part.content);
            parts.push(editedNode);
        } else {
            const subwords = part.children.map(subwordUUID  => {
                const subword = transcription[subwordUUID]
                 const current_subword = React.createElement('span', {
                    "x-data-p": subword.p,
                    key: subwordUUID,
                     className: "p" + (100 * subword.p.toFixed(1)),
                    "x-data-ms-start": subword.ms_start,
                    "x-data-ms-end": subword.ms_end
                 }, subword.content);
                 return current_subword;
            });
            let currentWord = React.createElement('span', {
                key: partUUID,
                className: "word" + (index == 0 ? " firstWord" : "")
            }, subwords);
            parts.push(currentWord);
        }
    });
    return parts;
}

export function TranscriptionLine({uuid}) {
    const {transcription, setTranscription} = useContext(TranscriptContext);

    const parts = GenerateDomFromData(transcription[uuid].children);
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