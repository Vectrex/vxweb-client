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
  import Image from '@tiptap/extension-image'
  import {
    ArrowUturnLeftIcon,
    ArrowUturnRightIcon,
    CodeBracketSquareIcon,
    LinkIcon,
    PhotoIcon,
    XMarkIcon,
    TrashIcon,
    CheckIcon
  } from '@heroicons/vue/24/solid'
  import Modal from "@/components/vx-vue/modal.vue"
  import tiptapFiles from "@/components/misc/tiptap-files.vue"
  import { onBeforeUnmount, ref, watch } from "vue"

  const props = defineProps({ modelValue: String, fileManagerDisable: Boolean })
  const emit = defineEmits(['update:modelValue', 'openFileManager'])
  const showSrc = ref(false)
  const showModal = ref(false)
  const onlyImages = ref(false)
  const linkData = ref({})
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
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: null
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'object-cover'
        }
      })
    ],
    content: props.modelValue,
    onUpdate: () => emit('update:modelValue', editor.getHTML())
  })
  const buttonClass = (isActive = null) => 'icon-link' + (isActive && editor.isActive(isActive) ? ' bg-slate-400' : '')
  const pickLink = () => {
    onlyImages.value = false
    showModal.value = true
    linkData.value.href = editor.getAttributes('link').href
    linkData.value.target = editor.getAttributes('link').target === '_blank'
  }
  const pickImage = () => {
    onlyImages.value = true
    showModal.value = true
  }
  const handlePick = fileObj => {
    if (onlyImages.value) {
      editor.commands.setImage({ src: fileObj.url })
      showModal.value = false
    }
    else {
      linkData.value.href = fileObj.url
    }
  }
  const confirmLink = () => {
    if(!linkData.value.href) {
      editor.chain().focus().unsetLink().run()
    }
    else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkData.value.href, target: linkData.value.target ? '_blank' : null }).run()
    }
    showModal.value = false
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
      </div>
      <div class="flex space-x-1 px-1 border-r border-slate-500">
        <button @click="pickLink" :class="buttonClass('link')">
            <link-icon class="w-5 h-5" />
        </button>
        <button @click="pickImage" :class="buttonClass('image')" v-if="!fileManagerDisable">
          <photo-icon class="w-5 h-5" />
        </button>
      </div>
      <div class="flex space-x-1 px-1">
        <button @click="showSrc = !showSrc" :class="['icon-link', showSrc ? 'bg-slate-400' : '']"><code-bracket-square-icon class="h-5 w-5" /></button>
      </div>
    </div>
    <editor-content :editor="editor" class="prose w-full max-w-none"/>
    <textarea class="form-textarea w-full text-sm my-2" @blur="emit('update:modelValue', $event.target.value)" :value="modelValue" v-if="showSrc" />

    <modal :show="showModal">
      <template #title>
        <div class="fixed flex w-full justify-between items-center bg-vxvue-500 h-16 px-4">
          <span class="text-xl font-bold text-white">{{ onlyImages ? 'Bilddatei selektieren...' : 'Zieladresse eingeben oder Datei wählen...' }}</span>
          <a href="#" @click.prevent="showModal = false"><x-mark-icon class="w-5 h-5 text-white"/></a>
        </div>
      </template>
      <template #default>
        <div class="space-y-4">
          <div class="pt-16 px-4 flex space-x-2 items-center" v-if="!onlyImages">
            <input class="form-input flex-grow" v-model.trim="linkData.href" />
            <button class="icon-link" @click="linkData.href = ''"><trash-icon class="h-5 w-5" /></button>
            <input type="checkbox" class="form-checkbox" id="set-target" v-model="linkData.target" /><label for="set-target">in eigenem Tab öffnen</label>
            <button class="icon-link" @click="confirmLink"><check-icon class="h-5 w-5" /></button>
          </div>
          <div class="px-4">
            <tiptap-files :only-images="onlyImages" @pick-file="handlePick" />
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>