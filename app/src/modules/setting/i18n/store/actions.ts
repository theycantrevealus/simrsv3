import * as types from './types'
import Corei18nService from '@/modules/setting/i18n/service'
import { deepen, parsedT } from '@/util/object'

export default {
  fetchi18nDetail({ commit }, paramData) {
    commit(types.TOGGLE_LOADING_ACTIVE)
    Corei18nService.i18nDetail(paramData).then((response: any) => {
      const data = response.data
      const components = data.components
      const ab = {}
      const Objectidentifier: any = {}
      components.map((e) => {
        const b = e.component
        if (!Objectidentifier[b]) {
          Objectidentifier[b] = {}
        }

        Objectidentifier[b] = e

        if (!ab[b]) {
          ab[b] = {}
        }

        ab[b] = {}
      })

      const parsedData = parsedT(deepen(ab))
      // TODO : Still wrong key identifier. Fix it on utils
      data.componentTree = { root: parsedData }
      data.componentIden = Objectidentifier

      commit(types.I18N_SET, data)
      commit(types.I18N_LIST, data)
      commit(types.TOGGLE_LOADING_UNACTIVE)
    })
  },
}
