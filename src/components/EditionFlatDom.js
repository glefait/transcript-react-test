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

export function TranscriptionLineDom({uuid}) {
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