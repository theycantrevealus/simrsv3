import api from '@/util/api'

class PurchaseOrderService {
  getItemList(parsedData) {
    return api({ requiresAuth: true })
      .get(`${process.env.VUE_APP_APIGATEWAY}v1/inventory/purchase_order`, {
        params: {
          lazyEvent: JSON.stringify(parsedData)
        },
      })
      .then((response: any) => {
        return Promise.resolve(response)
      })
  }

  async getItemDetail(id) {
    return await api({ requiresAuth: true })
      .get(`${process.env.VUE_APP_APIGATEWAY}v1/inventory/purchase_order/${id}`)
      .then((response: any) => {
        return Promise.resolve(response)
      })
  }
}

export default new PurchaseOrderService()
