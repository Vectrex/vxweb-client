<script setup>
  import { Editor, EditorContent } from '@tiptap/vue-3'
  import Document from '@tiptap/extension-document'
  import Text from '@tiptap/extension-text'
  import Bold from '@tiptap/extension-bold'
  import Italic from '@tiptap/extension-italic'
  import ListItem from '@tiptap/extension-list-item'
  import BulletList from '@tiptap/extension-bullet-list'
  import OrderedList from '@tiptap/extension-ordered-list'
  import Paragraph from '@tiptap/extension-paragraph'
  import HardBreak from '@tiptap/extension-hard-break'
  import History from '@tiptap/extension-history'
  import Link from '@tiptap/extension-link'
  import { ArrowUturnLeftIcon, ArrowUturnRightIcon, CodeBracketSquareIcon, LinkIcon } from '@heroicons/vue/24/solid'
  import { onBeforeUnmount, ref, watch } from "vue"

  const props = defineProps({ modelValue: String })
  const emit = defineEmits(['update:modelValue'])
  const showSrc = ref(false)
  const editor = new Editor({
    extensions: [
      Document,
      Text,
      Paragraph,
      HardBreak,
      History,
      BulletList,
      OrderedList,
      ListItem,
      Bold,
      Italic,
      Link.configure({
        openOnClick: false,
      })
    ],
    content: props.modelValue,
    onUpdate: () => emit('update:modelValue', editor.getHTML())
  })
  const buttonClass = (isActive = null) => 'icon-link' + (isActive && editor.isActive(isActive) ? ' bg-slate-400' : '')
  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href
    if (previousUrl) {
      editor.chain().focus().unsetLink().run()
    }
    else {
      const url = window.prompt('URL', previousUrl)
      if (url && url.trim()) {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }
    }
  }

  watch (() => props.modelValue, v => { if(editor.getHTML() !== v) { editor.commands.setContent(v, false) }})
  onBeforeUnmount(() => editor.destroy())
</script>

<template>
  <div>
    <div class="flex items-center justify-start rounded-t p-1 bg-slate-200">
      <div class="flex space-x-1 px-1 border-r px-1 border-slate-500">
        <button @click="editor.commands.undo()" :class="buttonClass()"><arrow-uturn-left-icon class="h-5 w-5" /></button>
        <button @click="editor.commands.redo()" :class="buttonClass()"><arrow-uturn-right-icon class="h-5 w-5" /></button>
      </div>
      <div class="flex space-x-1 px-1 border-r border-slate-500">
        <button @click="editor.chain().focus().toggleBold().run()" :class="buttonClass('bold')"><strong class="block h-5">Ab</strong></button>
        <button @click="editor.chain().focus().toggleItalic().run()" :class="buttonClass('italic')"><em class="block h-5">Ab</em></button>
        <button @click="editor.commands.toggleBulletList()" :class="buttonClass()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5"><path fill="none" d="M0 0h24v24H0z"/><path d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" fill="currentColor"/></svg>
        </button>
        <button @click="editor.commands.toggleOrderedList()" :class="buttonClass()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5"><path fill="none" d="M0 0h24v24H0z"/><path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zM3 14v-2.5h2V11H3v-1h3v2.5H4v.5h2v1H3zm2 5.5H3v-1h2V18H3v-1h3v4H3v-1h2v-.5zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" fill="currentColor"/></svg>
        </button>
        <button @click="toggleLink" :class="buttonClass('link')">
            <link-icon class="w-5 h-5" />
        </button>
      </div>
      <div class="flex space-x-1 px-1">
        <button @click="showSrc = !showSrc" :class="['icon-link', showSrc ? 'bg-slate-400' : '']"><code-bracket-square-icon class="h-5 w-5" /></button>
      </div>
    </div>
    <editor-content :editor="editor" class="prose w-full max-w-none"/>
    <textarea class="form-textarea w-full text-sm my-2" @blur="emit('update:modelValue', $event.target.value)" :value="modelValue" v-if="showSrc" />
  </div>
</template>