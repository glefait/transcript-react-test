const fs = require('fs');
const data = JSON.parse(fs.readFileSync(__dirname + '/../public/data/transcript-example.json'));

let flatData = {};
rootNode = {
    "kind": "transcription",
    "children": data.content.flatMap(block => {
        block_node =  {
            "kind": "block",
            "children": block.speech.lines.flatMap(line => {
                line_node = {
                    "kind": "line",
                    "children": line.parts.flatMap(part => {
                        part_node = {
                            "kind": part.kind
                        }
                        if (part.kind == "edition") {
                            part_node["content"] = part.content;
                        } else {
                            // word
                            part_node["children"] = part.subwords.flatMap(subword => {
                                subword_node = {
                                    "kind": "subword",
                                    "content": subword.content,
                                    "ms_start": subword.ms_start,
                                    "ms_end": subword.ms_end,
                                    "p": subword.p
                                }
                                flatData[subword.uuid] = subword_node;
                                return subword.uuid;
                            });
                        }
                        flatData[part.uuid] = part_node;
                        return part.uuid;
                    })
                }
                flatData[line.uuid] = line_node;
                return line.uuid;
            }),
            "user": block.speech.user
        };
        flatData[block.uuid] = block_node;
        return block.uuid;
    }),
}
flatData[data["uuid"]] = rootNode;

fs.writeFileSync(__dirname + '/../public/data/transcript-example-flat.json',
    JSON.stringify(flatData, null,space=4));