<script setup>
  import DateInput from "@/components/vx-vue/date-input.vue"
  import { ref, computed, useAttrs, watch, nextTick } from "vue"
  import { onClickOutside } from "@vueuse/core"

  const props = defineProps({
    modelValue: Date,
    validFrom: Date,
    validUntil: Date,
    dayNames: { type: Array, default: (() => "S M T W T F S".split(" ")) },
    locale: { type: String, default: 'default' },
    startOfWeekIndex: { type: Number, default: 0, validator: value => value === 0 || value === 1 },
    hasInput: { type: Boolean, default: true }
  })
  const emit = defineEmits(['update:modelValue', 'month-change'])
  const today = (() => { let d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate())})()

  const sheetDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))
  const selectedDate = ref(null)
  const expanded = ref(!props.hasInput)
  const alignHoriz = ref('left-0')
  const alignVert = ref('top-0')
  const input = ref(null)
  const calendar = ref(null)
  const inputProps = computed(() => { let attrs = Object.assign({}, useAttrs()); delete attrs['class']; return attrs })
  const calendarProps = computed(() => props.hasInput ? { 'class': ['absolute', expanded.value ? 'block' : 'hidden'] } : {})
  const days = computed(() => {
    const
      dates = [],
      y = sheetDate.value.getFullYear(),
      m = sheetDate.value.getMonth(),
      nextMonth = new Date(y, m + 1, 0),
      precedingDays = (new Date(y, m, 0)).getDay() + 1 - props.startOfWeekIndex,
      trailingDays = (6 + props.startOfWeekIndex - nextMonth.getDay()) % 7
    for (let i = -precedingDays, j = nextMonth.getDate() + trailingDays; i < j; ++i) {
      dates.push(new Date(y, m, i + 1))
    }
    return dates
  })
  const localizedDayNames = computed(() => !props.startOfWeekIndex ? props.dayNames.slice() : props.dayNames.slice(1).concat(props.dayNames[0]))
  watch(() => props.modelValue, v => {
    if (v) {
      selectedDate.value = new Date(v.getFullYear(), v.getMonth(), v.getDate())
      sheetDate.value = new Date(selectedDate.value.getTime())
    }
    else {
      selectedDate.value = null
      sheetDate.value = new Date(today.getTime())
    }
    sheetDate.value.setDate(1)
  }, { immediate: true })
  watch(expanded, v => {
    if (v && props.hasInput) {
      nextTick(() => {
        const inputDim = input.value.$el.getBoundingClientRect()
        const calDim = calendar.value.getBoundingClientRect()
        alignHoriz.value = inputDim.left + calDim.width > window.innerWidth ? 'right-0' : 'left-0'
        alignVert.value = inputDim.bottom + calDim.height > window.innerHeight ? 'bottom-0 -translate-y-12' : 'top-0 translate-y-12'
      })
    }
  })
  onClickOutside(calendar, () => expanded.value = false)
  const previousMonth = () => {
    sheetDate.value = new Date(sheetDate.value.getFullYear(), sheetDate.value.getMonth() - 1, 1)
    emit("month-change", sheetDate.value)
  }
  const nextMonth = () => {
    sheetDate.value = new Date(sheetDate.value.getFullYear(), sheetDate.value.getMonth() + 1, 1)
    emit("month-change", sheetDate.value)
  }
  const selectDate = (day) => {
    selectedDate.value = day
    emit('update:modelValue', day)
    expanded.value = !props.hasInput
  }
  const handleInput = (date) => {
    selectedDate.value = date
    emit('update:modelValue', date)
  }
</script>

<template>
  <div :class="['relative', $attrs['class']]">

    <date-input
        v-if="hasInput"
        :modelValue="selectedDate"
        @toggle-datepicker="expanded = true"
        @update:modelValue="handleInput"
        v-bind="inputProps"
        ref="input"
        class="w-full"
        :locale="locale"
    />

    <div class="bg-white z-10 shadow-md" v-bind="calendarProps" ref="calendar" :class="[alignHoriz, alignVert]">
      <div class="flex flex-row items-center bg-vxvue-700 text-white py-2 px-3">
        <button type="button" @click.stop="previousMonth" class="flex-shrink-0 hover:text-vxvue-50 text-vxvue-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex-grow text-center">{{ sheetDate.toLocaleString(locale, { month: 'long'}) }} {{ sheetDate.getFullYear() }}</div>
        <button type="button" @click.stop="nextMonth" class="flex-shrink-0 hover:text-vxvue-50 text-vxvue-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-7 gap-0.5 p-0.5">

        <div v-for="weekday in localizedDayNames" class="text-center bg-gray-200 py-2">{{ weekday }}</div>

        <div v-for="day in days" class="text-center"
             :class="day.getMonth() - sheetDate.getMonth() === 0 ? 'text-vxvue-700' : 'text-gray-400'">
          <button
              type="button"
              :class="[
                {
                  'bg-vxvue-700 text-white': selectedDate && day.getTime() === selectedDate.getTime(),
                  'bg-gray-200': day.getTime() === today.getTime(),
                  'text-red-400': (validFrom && validFrom > day) || (validUntil && validUntil < day)
                }, 'py-2 px-3 rounded-sm'
              ]"
              :disabled="(validFrom && validFrom > day) || (validUntil && validUntil < day)"
              @click.stop="(validFrom && validFrom > day) || (validUntil && validUntil < day) ? null : selectDate(day)"
          >{{ day.getDate() }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>