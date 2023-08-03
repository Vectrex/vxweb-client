<script setup>
  import { ref, computed, nextTick } from "vue"

  const props = defineProps({
    buttons: {
      type: [Object, Array],
      default: { label: 'Ok', value: 'ok' },
      validator: p => (Array.isArray(p) && p.length <= 2 && p.filter(v => v['label'] !== 'undefined' && v['value'] !== 'undefined').length === p.length) || (p.label !== undefined && p.value !== undefined)
    },
    headerClass: {
      type: String,
      default: "text-vxvue-alt-900 bg-vxvue-alt-400"
    },
    buttonClass: {
      type: String,
      default: "button"
    }
  })

  const title = ref('')
  const message = ref('')
  const show = ref(false)
  const resolve = ref(null)
  const reject = ref(null)
  const buttonArray = computed (() => Array.isArray(props.buttons) ? props.buttons : [props.buttons])
  const buttons = ref(null)

  const open = (t, m) => {
    title.value = t;
    message.value = m;
    show.value = true;
    nextTick(() => buttons.value.firstElementChild.focus());
    return new Promise((res, rej) => {
      resolve.value = res;
      reject.value = rej;
    });
  }
  const handleClick = (value) => {
    show.value = false;
    resolve.value(value);
  }

  defineExpose({ open })
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm" aria-hidden="true" v-if="show" />
  <transition name="appear">
    <div class="fixed z-50 inset-0 overflow-y-auto" v-if="show">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div v-if="show">
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div class="inline-block align-bottom bg-white rounded text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full lg:max-w-lg">
            <h3 class="text-lg text-center font-medium pt-4 sm:py-6 py-4" :class="headerClass" v-if="title">
              <slot name="title" :title="title">{{ title }}</slot>
            </h3>
            <div class="mt-4 sm:mt-5 px-4 sm:px-6 pb-4 sm:pb-6">
              <div class="flex flex-row items-center">
                <div class="flex-shrink-0">
                  <slot name="icon"></slot>
                </div>
                <p class="text-center flex-grow">
                  <slot :message="message">{{ message }}</slot>
                </p>
              </div>
              <div class="mt-5 sm:mt-6 flex justify-center space-x-2" ref="buttons">
                <button :class="[buttonClass, button['class']]" @click.prevent="handleClick(button.value)" v-for="button in buttonArray">{{ button.label }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
