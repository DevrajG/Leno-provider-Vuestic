<template>
  <div
    class="wizard"
    :class="computedLayout"
    v-orientation-handler="{ layout: wizardLayout,  breakPoint: orientationBreakPoint }"
  >

    <div
      v-if="computedLayout === 'vertical'"
      class="indicator-container indicator-container-vertical"
    >
      <rich-vertical-indicator
        v-if="wizardType === 'rich'"
        :steps="steps"
        :currentStep="currentStep"
        :completed="wizardCompleted"
      ></rich-vertical-indicator>
      <simple-vertical-indicator
        v-if="wizardType === 'simple'"
        :steps="steps"
        :currentStep="currentStep"
        :completed="wizardCompleted"
      ></simple-vertical-indicator>
    </div>

    <div class="wizard-body">
      <div
        v-if="computedLayout === 'horizontal'"
        class="indicator-container indicator-container-horizontal"
      >
        <simple-horizontal-indicator
          v-if="wizardType === 'simple'"
          :steps="steps"
          :currentStep="currentStep"
          :completed="wizardCompleted"
        ></simple-horizontal-indicator>
        <rich-horizontal-indicator
          v-if="wizardType === 'rich'"
          :steps="steps"
          :currentStep="currentStep"
          :completed="wizardCompleted"
        ></rich-horizontal-indicator>
      </div>
      <div
        class="wizard-body-step"
        v-for="(step, index) in steps"
        v-show="isStepShown(step)"
        :key="index"
      >
        <slot :name="step.slot" class="step-content"></slot>
      </div>

      <div class="wizard-body-step" v-show="wizardCompleted">
        <slot :name="wizardCompletedSlotName" class="step-content"></slot>
      </div>

      <div class="wizard-body-actions" v-if="!wizardCompleted">
        <div class="btn-container" v-if="backEnabled">
          <button
            class="btn btn-secondary wizard-back pull-left"
            @click.prevent="goBack()"
          >Back</button>
        </div>

        <div class="btn-container" v-if="!isLastStep()">
          <vue-ladda
            :loading="nextBtn.loading"
            :key="nextBtn.dataStyle"
            :data-style="nextBtn.dataStyle"
            class="btn btn-primary wizard-next pull-right"
            @click.prevent="goNext()"
          >Next</vue-ladda>
        </div>

        <div class="btn-container" v-if="currentStep == steps.length - 1">
          <!-- <button  class="btn btn-primary wizard-next pull-right final-step" @click.prevent="goNext()">
            {{lastStepLabel}}
          </button>-->
          <vue-ladda
            :loading="nextBtn.loading"
            :key="nextBtn.dataStyle"
            :data-style="nextBtn.dataStyle"
            class="btn btn-primary wizard-next pull-right final-step"
            @click.prevent="goNext()"
          >{{lastStepLabel}}</vue-ladda>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import SimpleHorizontalIndicator from './indicators/SimpleHorizontalIndicator.vue'
  import RichHorizontalIndicator from './indicators/RichHorizontalIndicator.vue'
  import RichVerticalIndicator from './indicators/RichVerticalIndicator.vue'
  import SimpleVerticalIndicator from './indicators/SimpleVerticalIndicator.vue'
  import WizardOrientationHandler from './WizardOrientationHandler'
  import VueLadda from 'vue-ladda'

  export default {
    name: 'vuestic-wizard',
    props: {
      steps: {},
      wizardType: {
        type: String,
        default: 'simple'
      },
      wizardLayout: {
        type: String,
        default: 'horizontal'
      },
      lastStepLabel: {default: 'Signup'},
      onNext: {},
      onBack: {}
    },
    data () {
      return {
        currentStep: 0,
        wizardCompleted: false,
        wizardCompletedSlotName: 'wizardCompleted',
        orientationBreakPoint: 767, // TODO: into config,
        computedLayout: this.wizardLayout,
        nextBtn: {
          loading: false,
          dataStyle: 'zoom-in',
          progress: 0
        },
      }
    },
    components: {
      SimpleHorizontalIndicator,
      RichHorizontalIndicator,
      RichVerticalIndicator,
      SimpleVerticalIndicator,
      VueLadda
    },
    directives: {
      orientationHandler: WizardOrientationHandler
    },
    computed: {
      currentSlot () {
        let slotName = this.steps[this.currentStep].slot
        if (this.wizardCompleted) {
          slotName = this.wizardCompletedSlotName
        }
        return slotName
      },
      backEnabled () {
        return this.currentStep !== 0
      }
    },
    created () {
      this.$on('wizardLayoutChange', this.updateLayout)
    },
    methods: {
      updateLayout (layout) {
        this.computedLayout = layout
      },
      goNext () {
        this.currentStepOnNext()
        const validPromise = this.isCurrentStepValid()
        if(Promise.resolve(validPromise) === validPromise) {
          validPromise.then(res => {
            if(res == true && !this.isLastStep()) {
              this.currentStep++
            }
          })
        }
        else {
          if (this.isCurrentStepValid()) {
            if (!this.isLastStep()) {
              this.currentStep++
            }
          }
        }
      },
      goBack () {
        this.currentStepOnBack()
        if (this.currentStep > 0) {
          this.currentStep--
        }
      },
      completeWizard () {
        this.wizardCompleted = true
        this.$emit('wizardComplete')
        this.goNext()
      },
      isLastStep () {
        return this.currentStep === this.steps.length - 1
      },
      currentStepOnNext () {
        let step = this.steps[this.currentStep]
        if (step.onNext) {
          step.onNext()
        }
      },
      currentStepOnBack () {
        let step = this.steps[this.currentStep]
        if (step.onBack) {
          step.onBack()
        }
      },
      isCurrentStepValid () {
        return this.steps[this.currentStep].isValid()
      },
      isStepShown (step) {
        return step.slot === this.currentSlot && !this.wizardCompleted
      },
      resetWizard () {
        this.currentStep = 0
        this.wizardCompleted = false
        this.$emit('wizardReset')
      },
    }
  }
</script>

<style lang="scss" scoped>
$wizard-body-vl-step-h-padding: 7%;
$wizard-indicator-vl-width: 20rem;
$wizard-body-vl-min-height: 20rem;

$wizard-body-hl-step-h-padding: 15%;

$wizard-body-step-v-padding: 2.25rem;
$wizard-body-step-item-margin-bottom: $wizard-body-step-v-padding;

.wizard {
  position: relative;
  width: 100%;
  display: flex;

  &.horizontal {
    flex-direction: column;
  }

  &.vertical {
    flex-direction: row;
  }
}

.wizard-body {
  position: relative;
}
.wizard-body-step {
  > * {
    display: flex;
    flex-direction: column;
    align-items: center;

    > * {
      margin-bottom: $wizard-body-step-item-margin-bottom;
    }

    > *:last-child {
      margin-bottom: 0;
    }
  }
}

.wizard-body-actions {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  align-items: baseline;

  .btn-container {
    margin: $wizard-body-step-item-margin-bottom
      $wizard-body-step-item-margin-bottom/2 0
      $wizard-body-step-item-margin-bottom/2;
  }
}

.vertical {
  .wizard-body {
    min-height: $wizard-body-vl-min-height;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: $wizard-body-step-v-padding $wizard-body-vl-step-h-padding;
    width: 100%; // IE11 only
  }

  .indicator-container {
    flex-basis: $wizard-indicator-vl-width;
    max-width: $wizard-indicator-vl-width;
    flex-grow: 0;
    flex-shrink: 0;
    position: relative;
  }
}

.horizontal {
  .wizard-body {
    padding: $wizard-body-step-v-padding $wizard-body-hl-step-h-padding;
  }
}

.btn.btn-primary.ladda-button {
  padding: 1.1rem 3.9rem;
  border-radius: 1.875rem;
  font-size: 1rem;
}
</style>
