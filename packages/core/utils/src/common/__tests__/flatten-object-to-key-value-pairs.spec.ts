import { flattenObjectToKeyValuePairs } from "../flatten-object-to-key-value-pairs"

describe("flattenObjectToKeyValuePairs", function () {
  it("should return only the properties path of the properties that are set to true", function () {
    const cart = {
      id: "cart_id",
      customer: {
        id: "cus_id",
        groups: [
          { id: "group_1", name: "test" },
          { id: "group_2", name: "test 2" },
        ],
      },
      items: [
        {
          product_id: "product-1",
          product: { id: "product-1" },
        },
        {
          product_id: "product-2",
          product: { id: "product-2" },
        },
      ],
    }

    const keyValueParis = flattenObjectToKeyValuePairs(cart)
    expect(keyValueParis).toEqual({
      id: "cart_id",
      "customer.id": "cus_id",
      "customer.groups.id": ["group_1", "group_2"],
      "customer.groups.name": ["test", "test 2"],
      "items.product_id": ["product-1", "product-2"],
      "items.product.id": ["product-1", "product-2"],
    })
  })
})
