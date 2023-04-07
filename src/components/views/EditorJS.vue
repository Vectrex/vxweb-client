<script setup>
  import EditorJS from "@editorjs/editorjs"
  import Header from "@editorjs/header"
  import Paragraph from "@editorjs/paragraph"
  import List from "@editorjs/list"
</script>

<template>
    <div id="editor-js-holder" style="border: solid 1px #f00; width: 100%;"/>
    <button type="button" @click="save">Save</button>
    <pre>{{ json }}</pre>
</template>

<script>
export default {
    name: "EditorJS",
    data() {
        return {
            value: null,
            editor: null
        };
    },
    computed: {
      json() { return JSON.stringify(this.value) }
    },
    mounted () {
        this.editor = new EditorJS({
            holder: "editor-js-holder",
            autofocus: true,
            initialBlock: "paragraph",
            tools: {
                header: {
                    class: Header,
                    shortcut: "CMD+SHIFT+H"
                },
                list: {
                    class: List
                },
                paragraph: {
                    class: Paragraph,
                    config: {
                        placeholder: "."
                    }
                }
            },
            onReady () {
                console.log("ready");
            },
            onChange () {
                console.log("change");
            }
        });
    },
    methods: {
        save () {
            this.editor.save().then(savedData => {
                this.value = savedData;
            });
        },
    }
}
</script>
