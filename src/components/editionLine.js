import React from "react";

export function GenerateDomFromData(data) {
    let parts = [];
    let i = 0;
    data.parts.map(part => {
        if (part.kind == 'edition') {
            let editedNode = React.createElement('span', {
                "x-data-uuid": part.uuid,
                key: i,
                className: "" + (i == 0 ? " firstWord" : "")
            }, part.content);
            parts.push(editedNode);
        } else {
            let j = 0;
            const subwords = part.subwords.map(subword  => {
                 const current_subword = React.createElement('span', {
                    "x-data-p": subword.p,
                    key: j,
                     className: "p" + (100 * subword.p.toFixed(1)),
                    "x-data-ms-start": subword.ms_start,
                    "x-data-ms-end": subword.ms_end
                 }, subword.content);
                 j += 1;
                 return current_subword;
            });
            let currentWord = React.createElement('span', {
                key: i,
                className: "word" + (i == 0 ? " firstWord" : "")
            }, subwords);
            parts.push(currentWord);
        }
        i += 1;
    });
    return parts;
}

export function ReverseDataFromDom(lineNode) {
    // 1. remove ux blocks
    let interestingPart = Array.from(lineNode.children)
        .filter(n => ! n.classList.contains('uxOnly'));

    // 2. for each part, either its an edition or a word containing subwords
    // TODO: can added text goes in another
    let reversedData = {"parts": []}
    for (let i=0; i<interestingPart.length; i++) {
        if (interestingPart[i].childElementCount == 0){
            // edited value -> get uuid
            let edition_node = {
                "kind": "edition",
                "content": interestingPart[i].innerText,
                "uuid": interestingPart[i].getAttribute('x-data-uuid')
            }
            reversedData.parts.push(edition_node);
        } else {
            // word containing syllabes
            let word_node = {
                "kind": "word",
                "subwords": []
            }
            for (let j=0; j<interestingPart[i].childElementCount; j++){
                let subword = {
                    "content": interestingPart[i].children[j].innerText,
                    "ms_start": parseInt(interestingPart[i].children[j].getAttribute('x-data-ms-start')),
                    "ms_end": parseInt(interestingPart[i].children[j].getAttribute('x-data-ms-end')),
                    "p": parseFloat(interestingPart[i].children[j].getAttribute('x-data-p'))
                }
                word_node.subwords.push(subword);
            }
            reversedData.parts.push(word_node);
        }
    }
    return reversedData;
}
