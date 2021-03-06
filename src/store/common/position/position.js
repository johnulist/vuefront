import {isUndefined, isEmpty, isString, isNull} from 'lodash'
import Vue from 'vue'
export const state = () => ({
  positions: {},
  modules: {},
  path: '',
  params: {
    url: ''
  }
})

export const mutations = {
  setPosition(state, {name, route, status}) {
    if(isUndefined(state.positions[route])) {
      Vue.set(state.positions, route, {})
    }
    Vue.set(state.positions[route], name, status)
  },
  setModule(state, {name, route, list}) {
    if(isUndefined(state.modules[route])) {
      Vue.set(state.modules, route, {})
    }
    Vue.set(state.modules[route], name, list)

  },
  setRoute(state, payload) {
    let path = payload.path
    if(payload.matched.length > 0) {
      path = payload.matched[0].path
      for (const key in payload.params) {
        path = path.replace(`:${key}`, payload.params[key])
      }
    }
    state.path = path
  },
  setParams(state, payload) {
    state.params = payload
  }
}

export const getters = {
  modules(state, rootGetters) {
    return (name) => {
      if(isUndefined(state.modules[rootGetters.currentRoute])) {
        return null
      }
      if(isUndefined(state.modules[rootGetters.currentRoute][name])) {
        return null
      }
      return state.modules[rootGetters.currentRoute][name]
    }
  },
  position(state, rootGetters) {
    return (name) => {
      if(isUndefined(state.positions[rootGetters.currentRoute])) {
        return null
      }
      if(isUndefined(state.positions[rootGetters.currentRoute][name])) {
        return null
      }
      return state.positions[rootGetters.currentRoute][name]
    }
  },
  currentRoute(state) {
    let currentRoute = state.path !== '' ? state.path : '/'
    if (!isEmpty(state.params.url)) {
      currentRoute = state.params.url
    }

    currentRoute = currentRoute.replace('/amp', '')

    currentRoute = currentRoute !== '' ? currentRoute : '/'

    return currentRoute
  },
  error(state) {
    return state.error
  },
}

export const actions = {
  loadModules({commit, getters}, {position}) {
    let result = []

    if(!isNull(getters.modules(position))) {
      return
    }

    for (const route in this.app.$vuefront.layouts) {
      const layout = this.app.$vuefront.layouts[route]
      let regexRoute = route.replace('*', '.*')
      regexRoute = regexRoute.replace('//', '\\//')
      const regex = new RegExp('^' + regexRoute + '$', 'i')

      if (regex.test(getters.currentRoute) && !isUndefined(layout[position])) {
        for (const key in layout[position]) {
          if (isString(layout[position][key])) {
            if(!isUndefined(this.app.$vuefront.extensions[layout[position][key]])) {
              result = [
                ...result,
                {
                  component: layout[position][key],
                  props: {},
                },
              ]
              }
            } else {
              if(!isUndefined(this.app.$vuefront.extensions[layout[position][key][0]])) {
                result = [
                  ...result,
                  {
                    component: layout[position][key][0],
                    props: layout[position][key][1],
                  },
                ]
              }
          }
        }
      }
    }

    commit('setModule', {name: position, list: result, route: getters.currentRoute})
  }
}
