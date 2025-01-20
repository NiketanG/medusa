import { filterObjectByKeys } from "../filter-object-by-keys"

describe("filterObjectByKeys", function () {
  it("should return an object with only the filtered keys", function () {
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
      shipping_method: null,
    }

    let transformedObject = filterObjectByKeys(cart, [
      "id",
      "customer.id",
      "customer.groups.id",
      "customer.groups.name",
      "items.product",
    ])

    expect(transformedObject).toEqual({
      id: "cart_id",
      customer: {
        id: "cus_id",
        groups: [
          {
            id: "group_1",
            name: "test",
          },
          {
            id: "group_2",
            name: "test 2",
          },
        ],
      },
      items: [
        {
          product: {
            id: "product-1",
          },
        },
        {
          product: {
            id: "product-2",
          },
        },
      ],
    })

    transformedObject = filterObjectByKeys(cart, [
      "id",
      "customer.id",
      "customer.groups.id",
      "customer.groups.name",
    ])

    expect(transformedObject).toEqual({
      id: "cart_id",
      customer: {
        id: "cus_id",
        groups: [
          {
            id: "group_1",
            name: "test",
          },
          {
            id: "group_2",
            name: "test 2",
          },
        ],
      },
    })

    transformedObject = filterObjectByKeys(cart, [
      "id",
      "customer.id",
      "customer.groups.id",
    ])

    expect(transformedObject).toEqual({
      id: "cart_id",
      customer: {
        id: "cus_id",
        groups: [
          {
            id: "group_1",
          },
          {
            id: "group_2",
          },
        ],
      },
    })

    transformedObject = filterObjectByKeys(cart, ["id", "customer.id"])

    expect(transformedObject).toEqual({
      id: "cart_id",
      customer: {
        id: "cus_id",
      },
    })

    transformedObject = filterObjectByKeys(cart, ["id"])

    expect(transformedObject).toEqual({
      id: "cart_id",
    })

    transformedObject = filterObjectByKeys(cart, [])

    expect(transformedObject).toEqual({})

    transformedObject = filterObjectByKeys(cart, [
      "doesnotexist.doesnotexist",
      "shipping_method.city",
    ])

    expect(transformedObject).toEqual({
      shipping_method: null,
    })
  })
})
