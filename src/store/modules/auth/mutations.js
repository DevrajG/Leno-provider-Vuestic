/* ============
 * Mutations for the auth module
 * ============
 *
 * The mutations that are available on the
 * account module.
 */

import Vue from 'vue'
import {
  CHECK,
  REGISTER,
  LOGIN,
  LOGOUT,
  NOTIFICATION,
  PROCESSING,
  CLEAR,
  FORMDATA,
  PROVIDER,
  CHANGEISON,
  CHANGEPRICING,
  CHANGEPRICEISON,
  COMPLETE_SETUP_PROFILE,
  CHANGEDISCOUNT
} from './mutation-types'

/* eslint-disable no-param-reassign */
export default {
  [CHECK] (state) {
    let token = new URL(window.location.href).searchParams.get('id_token') || localStorage.getItem('id_token')
    let providerId = new URL(window.location.href).searchParams.get('provider_id')
    if (providerId) {
      state.provider.providerId = providerId
      state.provider.providerAccessToken = token
    }
    state.authenticated = !!token
    if (state.authenticated) {
      Vue.$http.defaults.headers.common.Authorization = `Bearer ${token}`
    }
  },

  [REGISTER] (state) {
    //
  },

  [LOGIN] (state, { providerAccessToken }) {
    state.authenticated = true
    localStorage.setItem('id_token', providerAccessToken)
    Vue.$http.defaults.headers.common.Authorization = `Bearer ${providerAccessToken}`
  },

  [LOGOUT] (state) {
    state.authenticated = false
    state.provider = null
    state.formData.locations = null
    state.formData.pricings = null
    state.isSetupProfile = false
    localStorage.removeItem('id_token')
    delete Vue.$http.defaults.headers.common.Authorization
  },

  [NOTIFICATION] (state, info) {
    state.notificationInfo = info
  },

  [CLEAR] (state) {
    state.notificationInfo.title = ''
    state.notificationInfo.message = ''
  },

  [PROCESSING] (state, value) {
    state.isProcessing = value
  },

  [PROVIDER] (state, payload) {
    state.provider = payload
  },

  [FORMDATA] (state, payload) {
    state.formData = {
      ...state.formData,
      [payload.key]: payload.value
    }
  },

  [CHANGEISON] (state, payload) {
    const { locations } = state.formData
    const locations1 = [...locations]
    const newLocations = locations1.map(ele => {
      if (ele.id === payload.id) {
        ele.isOn = payload.isOn
      }
      return ele
    })

    state.formData.locations = newLocations
  },

  [CHANGEPRICING] (state, payload) {
    state.formData.pricings[payload.key] = {
      ...state.formData.pricings[payload.key],
      options: payload.value
    }
  },

  [CHANGEPRICEISON] (state, payload) {
    state.formData.pricings.prices[payload.key].price_cents = payload.value !== null ? payload.value * 100 : null
  },

  [CHANGEDISCOUNT] (state, payload) {
    state.formData.pricings.discounts[payload.key] = payload.value !== null ? payload.value : null
  },

  [COMPLETE_SETUP_PROFILE] (state, payload) {
    state.isSetupProfile = payload
  }
}
