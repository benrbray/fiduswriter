import {marks, nodes} from "prosemirror-schema-basic"
import {Schema, DOMSerializer} from "prosemirror-model"

let collaborator = {
    inline: true,
    group: "inline",
    attrs: {
        name: {
            default: ''
        },
        id: {
            default: 0
        }
    },
    parseDOM: [{
        tag: 'span.collaborator',
        getAttrs(dom) {
            return {
                username: dom.dataset.name,
                id: parseInt(dom.dataset.id)
            }
        }
    }],
    toDOM(node) {
        return ["span", {
            class: 'collaborator',
            'data-name': node.attrs.name,
            'data-id': node.attrs.id
        }, node.attrs.name]
    }
}

let doc = {
    content: 'block+',
    toDOM(node) {
        return ["div", 0]
    }
}

export const commentSchema = new Schema({
    nodes: {
        doc,
        paragraph: nodes.paragraph,
        text: nodes.text,
        collaborator
    },
    marks: {}
})

export let getCommentHTML = content => {
    let pmNode = commentSchema.nodeFromJSON({type: 'doc', content}),
        serializer = DOMSerializer.fromSchema(commentSchema)
    return serializer.serializeNode(pmNode).innerHTML
}