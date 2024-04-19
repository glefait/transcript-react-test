"use client";
import React from "react";
import { useState } from 'react';
import { GenerateDomFromData, ReverseDataFromDom } from '@/components/editionLine.js';


export function TranscriptionLine({line}){
    const [stateLine, setStateLine] = useState(line);
    const onFocus = () => { console.log("TranscriptionLine:onFocus"); }

    const reverse = function(node) {
        const reversedLine = ReverseDataFromDom(node);
        if(JSON.stringify(reversedLine) != JSON.stringify(stateLine)){
            console.log("updated TranscriptionLine");
            setStateLine(reversedLine);
        }
    }
    const onBlur = (e) => {
        e.stopPropagation();
        reverse(e.currentTarget);
    }

    const onMoveLineAbove = (e) => {
        e.stopPropagation();
        console.log("moveLineAbove:");
    }
    const onMoveFirstWordAbove = (e) => {
        e.stopPropagation();
        // 1. rebuild the structure first
        reverse(e.target.parentNode);
        // 2. split it between first word that should be moved above and the remaining words that should stay here
        let firstWordOfCurrentLine = stateLine.parts.slice(0,1);
        let currentLineWithoutFirstWord = stateLine.parts.slice(1);
        console.log("first word:", firstWordOfCurrentLine);
        console.log("remaining line:", currentLineWithoutFirstWord);
    }
    const onGetLineJSON = (e) => {
        e.stopPropagation();
        console.log(JSON.stringify(stateLine));
    }
    const parts = GenerateDomFromData(stateLine);
    return (
        <p className="transcriptionLine"
           onFocus={onFocus}
           onBlur={onBlur}
           contentEditable suppressContentEditableWarning
           spellCheck="false" // why not
           role="textbox" tabIndex={0}>
            <span onClick={onMoveLineAbove} className="moveLine uxOnly">^</span>
            <span onClick={onGetLineJSON} className="showJson uxOnly">json</span>
            <span onClick={onMoveFirstWordAbove} className="moveFirstWord uxOnly">..</span>
            {parts}
        </p>
    );
}

export function TranscriptionSpeech({speech_lines}) {
    const onBlur = () => {
        console.log("TranscriptionSpeech:onBlur");
    }
    // console.log("my object: %o", speech_lines)
    let i = 0;
    const lines = speech_lines.map((line) => {
        i += 1;
        // @ts-ignore
        return <TranscriptionLine onBlur={onBlur} line={line} key={i} />
    })
    return (
        <div className="basis-5/6">{lines}</div>
    );
}
export function TranscriptionUser({user}){
    return (
        <div className="basis-1/6">{user.name}</div>
    );
}

export function TranscriptionRow({ current_speech }){
    return (
        <div className="transcriptionRow flex flex-row">
            <TranscriptionUser user={current_speech.user} />
            <TranscriptionSpeech speech_lines={current_speech.lines}/>
        </div>
    );
}
export function TranscriptionSeparator(){
    return (
        <div className="transcriptionSeparator flex flex-row"></div>
    );
}
export function TranscriptionEdition({ transcription }) {
    let i =0;
    const listItems = transcription.flatMap(row => {
        if (! row.hasOwnProperty("speech")){
            return [];
        }
        let current_speech = row.speech;
        const t = [<TranscriptionRow current_speech={ current_speech } key={i}/>, <TranscriptionSeparator key={i} />];
        i += 1;
        return t;
    });
    return (
        <div className="transcriptionEdition">
            {listItems}
        </div>
    );
}