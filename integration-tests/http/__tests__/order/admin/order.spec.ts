import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { ModuleRegistrationName } from "@medusajs/utils"
import {
  adminHeaders,
  createAdminUser,
} from "../../../../helpers/create-admin-user"
import { setupTaxStructure } from "../../../../modules/__tests__/fixtures"
import { createOrderSeeder } from "../../fixtures/order"

jest.setTimeout(300000)

medusaIntegrationTestRunner({
  testSuite: ({ dbConnection, getContainer, api }) => {
    let order, seeder, inventoryItemOverride3, productOverride3

    beforeEach(async () => {
      const container = getContainer()

      await setupTaxStructure(container.resolve(ModuleRegistrationName.TAX))
      await createAdminUser(dbConnection, adminHeaders, container)
    })

    describe("POST /orders/:id", () => {
      beforeEach(async () => {
        seeder = await createOrderSeeder({
          api,
          container: getContainer(),
        })
        order = seeder.order

        order = (
          await api.get(`/admin/orders/${order.id}?fields=+email`, adminHeaders)
        ).data.order
      })

      it("should update shipping address on an order (by creating a new Address record)", async () => {
        const addressBefore = order.shipping_address

        const response = await api.post(
          `/admin/orders/${order.id}`,
          {
            shipping_address: {
              city: "New New York",
              address_1: "New Main street 123",
            },
          },
          adminHeaders
        )

        expect(response.data.order.shipping_address.id).not.toEqual(
          addressBefore.id
        ) // new addres created
        expect(response.data.order.shipping_address).toEqual(
          expect.objectContaining({
            customer_id: addressBefore.customer_id,
            company: addressBefore.company,
            first_name: addressBefore.first_name,
            last_name: addressBefore.last_name,
            address_1: "New Main street 123",
            address_2: addressBefore.address_2,
            city: "New New York",
            country_code: addressBefore.country_code,
            province: addressBefore.province,
            postal_code: addressBefore.postal_code,
            phone: addressBefore.phone,
          })
        )

        const orderChangesResult = (
          await api.get(`/admin/orders/${order.id}/changes`, adminHeaders)
        ).data.order_changes

        expect(orderChangesResult.length).toEqual(1)
        expect(orderChangesResult[0]).toEqual(
          expect.objectContaining({
            version: 1,
            change_type: "update_order",
            status: "confirmed",
            created_by: expect.any(String),
            confirmed_by: expect.any(String),
            confirmed_at: expect.any(String),
            actions: expect.arrayContaining([
              expect.objectContaining({
                version: 1,
                applied: true,
                action: "UPDATE_ORDER_PROPERTIES",
                details: expect.objectContaining({
                  type: "shipping_address",
                  old: expect.objectContaining({
                    address_1: addressBefore.address_1,
                    city: addressBefore.city,
                    country_code: addressBefore.country_code,
                    province: addressBefore.province,
                    postal_code: addressBefore.postal_code,
                    phone: addressBefore.phone,
                    company: addressBefore.company,
                    first_name: addressBefore.first_name,
                    last_name: addressBefore.last_name,
                    address_2: addressBefore.address_2,
                  }),
                  new: expect.objectContaining({
                    address_1: "New Main street 123",
                    city: "New New York",
                    country_code: addressBefore.country_code,
                    province: addressBefore.province,
                    postal_code: addressBefore.postal_code,
                    phone: addressBefore.phone,
                    company: addressBefore.company,
                    first_name: addressBefore.first_name,
                    last_name: addressBefore.last_name,
                    address_2: addressBefore.address_2,
                  }),
                }),
              }),
            ]),
          })
        )
      })

      it("should fail to update shipping address if country code has been changed", async () => {
        const response = await api
          .post(
            `/admin/orders/${order.id}`,
            {
              shipping_address: {
                country_code: "HR",
              },
            },
            adminHeaders
          )
          .catch((e) => e)

        expect(response.response.status).toBe(400)
        expect(response.response.data.message).toBe(
          "Country code cannot be changed"
        )

        const orderChangesResult = (
          await api.get(`/admin/orders/${order.id}/changes`, adminHeaders)
        ).data.order_changes

        expect(orderChangesResult.length).toEqual(0)
      })

      it("should update billing address on an order (by creating a new Address record)", async () => {
        const addressBefore = order.billing_address

        const response = await api.post(
          `/admin/orders/${order.id}`,
          {
            billing_address: {
              city: "New New York",
              address_1: "New Main street 123",
            },
          },
          adminHeaders
        )

        expect(response.data.order.billing_address.id).not.toEqual(
          addressBefore.id
        ) // new addres created
        expect(response.data.order.billing_address).toEqual(
          expect.objectContaining({
            customer_id: addressBefore.customer_id,
            company: addressBefore.company,
            first_name: addressBefore.first_name,
            last_name: addressBefore.last_name,
            address_1: "New Main street 123",
            address_2: addressBefore.address_2,
            city: "New New York",
            country_code: addressBefore.country_code,
            province: addressBefore.province,
            postal_code: addressBefore.postal_code,
            phone: addressBefore.phone,
          })
        )

        const orderChangesResult = (
          await api.get(`/admin/orders/${order.id}/changes`, adminHeaders)
        ).data.order_changes

        expect(orderChangesResult.length).toEqual(1)
        expect(orderChangesResult[0]).toEqual(
          expect.objectContaining({
            version: 1,
            change_type: "update_order",
            status: "confirmed",
            created_by: expect.any(String),
            confirmed_by: expect.any(String),
            confirmed_at: expect.any(String),
            actions: expect.arrayContaining([
              expect.objectContaining({
                version: 1,
                applied: true,
                action: "UPDATE_ORDER_PROPERTIES",
                details: expect.objectContaining({
                  type: "billing_address",
                  old: expect.objectContaining({
                    address_1: addressBefore.address_1,
                    city: addressBefore.city,
                    country_code: addressBefore.country_code,
                    province: addressBefore.province,
                    postal_code: addressBefore.postal_code,
                    phone: addressBefore.phone,
                  }),
                  new: expect.objectContaining({
                    address_1: "New Main street 123",
                    city: "New New York",
                    country_code: addressBefore.country_code,
                    province: addressBefore.province,
                    postal_code: addressBefore.postal_code,
                    phone: addressBefore.phone,
                  }),
                }),
              }),
            ]),
          })
        )
      })

      it("should fail to update billing address if country code has been changed", async () => {
        const response = await api
          .post(
            `/admin/orders/${order.id}`,
            {
              billing_address: {
                country_code: "HR",
              },
            },
            adminHeaders
          )
          .catch((e) => e)

        expect(response.response.status).toBe(400)
        expect(response.response.data.message).toBe(
          "Country code cannot be changed"
        )

        const orderChangesResult = (
          await api.get(`/admin/orders/${order.id}/changes`, adminHeaders)
        ).data.order_changes

        expect(orderChangesResult.length).toEqual(0)
      })

      it("should update orders email and shipping address and create 2 change records", async () => {
        const response = await api.post(
          `/admin/orders/${order.id}?fields=+email,*shipping_address`,
          {
            email: "new-email@example.com",
            shipping_address: {
              address_1: "New Main street 123",
            },
          },
          adminHeaders
        )

        expect(response.data.order.email).toBe("new-email@example.com")
        expect(response.data.order.shipping_address.id).not.toEqual(
          order.shipping_address.id
        )
        expect(response.data.order.shipping_address).toEqual(
          expect.objectContaining({
            address_1: "New Main street 123",
          })
        )

        const orderChangesResult = (
          await api.get(`/admin/orders/${order.id}/changes`, adminHeaders)
        ).data.order_changes

        expect(orderChangesResult.length).toEqual(2)
        expect(orderChangesResult).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              version: 1,
              change_type: "update_order",
              status: "confirmed",
              confirmed_at: expect.any(String),
              created_by: expect.any(String),
              confirmed_by: expect.any(String),
              actions: expect.arrayContaining([
                expect.objectContaining({
                  version: 1,
                  applied: true,
                  action: "UPDATE_ORDER_PROPERTIES",
                  details: expect.objectContaining({
                    type: "shipping_address",
                    old: expect.objectContaining({
                      address_1: order.shipping_address.address_1,
                      city: order.shipping_address.city,
                    }),
                    new: expect.objectContaining({
                      address_1: "New Main street 123",
                    }),
                  }),
                }),
              ]),
            }),
            expect.objectContaining({
              version: 1,
              change_type: "update_order",
              status: "confirmed",
              confirmed_at: expect.any(String),
              created_by: expect.any(String),
              confirmed_by: expect.any(String),
              actions: expect.arrayContaining([
                expect.objectContaining({
                  version: 1,
                  applied: true,
                  action: "UPDATE_ORDER_PROPERTIES",
                  details: expect.objectContaining({
                    type: "email",
                    old: order.email,
                    new: "new-email@example.com",
                  }),
                }),
              ]),
            }),
          ])
        )
      })

      it("should fail to update email if it is invalid", async () => {
        const response = await api
          .post(
            `/admin/orders/${order.id}`,
            {
              email: "invalid-email",
            },
            adminHeaders
          )
          .catch((e) => e)

        expect(response.response.status).toBe(400)
        expect(response.response.data.message).toBe("The email is not valid")

        const orderChangesResult = (
          await api.get(`/admin/orders/${order.id}/changes`, adminHeaders)
        ).data.order_changes

        expect(orderChangesResult.length).toEqual(0)
      })
    })

    describe("POST /orders/:id/cancel", () => {
      beforeEach(async () => {
        seeder = await createOrderSeeder({
          api,
          container: getContainer(),
        })
        order = seeder.order

        order = (await api.get(`/admin/orders/${order.id}`, adminHeaders)).data
          .order
      })

      it("should successfully cancel an order and its authorized but not captured payments", async () => {
        const response = await api.post(
          `/admin/orders/${order.id}/cancel`,
          {},
          adminHeaders
        )

        expect(response.status).toBe(200)
        expect(response.data.order).toEqual(
          expect.objectContaining({
            id: order.id,
            status: "canceled",

            summary: expect.objectContaining({
              credit_line_total: 106,
              current_order_total: 0,
              accounting_total: 0,
            }),

            payment_collections: [
              expect.objectContaining({
                status: "canceled",
                captured_amount: 0,
                refunded_amount: 0,
                amount: 106,
                payments: [
                  expect.objectContaining({
                    canceled_at: expect.any(String),
                    refunds: [],
                    captures: [],
                  }),
                ],
              }),
            ],
          })
        )
      })

      it("should successfully cancel an order with a captured payment", async () => {
        const payment = order.payment_collections[0].payments[0]

        const paymentResponse = await api.post(
          `/admin/payments/${payment.id}/capture`,
          undefined,
          adminHeaders
        )

        expect(paymentResponse.data.payment).toEqual(
          expect.objectContaining({
            id: payment.id,
            captured_at: expect.any(String),
            captures: [
              expect.objectContaining({
                id: expect.any(String),
                amount: 106,
              }),
            ],
            refunds: [],
            amount: 106,
          })
        )

        const response = await api.post(
          `/admin/orders/${order.id}/cancel`,
          {},
          adminHeaders
        )

        expect(response.status).toBe(200)
        expect(response.data.order).toEqual(
          expect.objectContaining({
            id: order.id,
            status: "canceled",

            summary: expect.objectContaining({
              credit_line_total: 106,
              current_order_total: 0,
              accounting_total: 0,
            }),

            payment_collections: [
              expect.objectContaining({
                status: "canceled",
                captured_amount: 106,
                refunded_amount: 106,
                amount: 106,
                payments: [
                  expect.objectContaining({
                    canceled_at: null,
                    refunds: [
                      expect.objectContaining({
                        id: expect.any(String),
                        amount: 106,
                        created_by: expect.any(String),
                      }),
                    ],
                    captures: [
                      expect.objectContaining({
                        id: expect.any(String),
                        amount: 106,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        )
      })

      it("should successfully cancel an order with a partially captured payment", async () => {
        const payment = order.payment_collections[0].payments[0]

        const paymentResponse = await api.post(
          `/admin/payments/${payment.id}/capture`,
          { amount: 50 },
          adminHeaders
        )

        expect(paymentResponse.data.payment).toEqual(
          expect.objectContaining({
            id: payment.id,
            captured_at: null,
            captures: [
              expect.objectContaining({
                id: expect.any(String),
                amount: 50,
              }),
            ],
            refunds: [],
            amount: 106,
          })
        )

        const response = await api
          .post(`/admin/orders/${order.id}/cancel`, {}, adminHeaders)
          .catch((e) => e)

        expect(response.status).toBe(200)
        expect(response.data.order).toEqual(
          expect.objectContaining({
            id: order.id,
            status: "canceled",

            summary: expect.objectContaining({
              credit_line_total: 106,
              current_order_total: 0,
              accounting_total: 0,
            }),

            payment_collections: [
              expect.objectContaining({
                status: "canceled",
                captured_amount: 50,
                refunded_amount: 50,
                amount: 106,
                payments: [
                  expect.objectContaining({
                    refunds: [
                      expect.objectContaining({
                        id: expect.any(String),
                        amount: 50,
                        created_by: expect.any(String),
                      }),
                    ],
                    captures: [
                      expect.objectContaining({
                        id: expect.any(String),
                        amount: 50,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        )
      })
    })

    describe("POST /orders/:id/fulfillments", () => {
      beforeEach(async () => {
        const stockChannelOverride = (
          await api.post(
            `/admin/stock-locations`,
            { name: "test location" },
            adminHeaders
          )
        ).data.stock_location

        const inventoryItemOverride = (
          await api.post(
            `/admin/inventory-items`,
            { sku: "test-variant", requires_shipping: true },
            adminHeaders
          )
        ).data.inventory_item

        const productOverride = (
          await api.post(
            "/admin/products",
            {
              title: `Test fixture`,
              options: [
                { title: "size", values: ["large", "small"] },
                { title: "color", values: ["green"] },
              ],
              variants: [
                {
                  title: "Test variant",
                  sku: "test-variant",
                  inventory_items: [
                    {
                      inventory_item_id: inventoryItemOverride.id,
                      required_quantity: 1,
                    },
                  ],
                  prices: [
                    {
                      currency_code: "usd",
                      amount: 100,
                    },
                  ],
                  options: {
                    size: "large",
                    color: "green",
                  },
                },
              ],
            },
            adminHeaders
          )
        ).data.product

        const inventoryItemOverride2 = (
          await api.post(
            `/admin/inventory-items`,
            { sku: "test-variant-2", requires_shipping: false },
            adminHeaders
          )
        ).data.inventory_item

        inventoryItemOverride3 = (
          await api.post(
            `/admin/inventory-items`,
            { sku: "test-variant-3", requires_shipping: false },
            adminHeaders
          )
        ).data.inventory_item

        await api.post(
          `/admin/inventory-items/${inventoryItemOverride2.id}/location-levels`,
          {
            location_id: stockChannelOverride.id,
            stocked_quantity: 10,
          },
          adminHeaders
        )

        await api.post(
          `/admin/inventory-items/${inventoryItemOverride3.id}/location-levels`,
          {
            location_id: stockChannelOverride.id,
            stocked_quantity: 10,
          },
          adminHeaders
        )

        const productOverride2 = (
          await api.post(
            "/admin/products",
            {
              title: `Test fixture 2`,
              options: [
                { title: "size", values: ["large", "small"] },
                { title: "color", values: ["green"] },
              ],
              variants: [
                {
                  title: "Test variant 2",
                  sku: "test-variant-2",
                  inventory_items: [
                    {
                      inventory_item_id: inventoryItemOverride2.id,
                      required_quantity: 1,
                    },
                  ],
                  prices: [
                    {
                      currency_code: "usd",
                      amount: 100,
                    },
                  ],
                  options: {
                    size: "large",
                    color: "green",
                  },
                },
              ],
            },
            adminHeaders
          )
        ).data.product

        productOverride3 = (
          await api.post(
            "/admin/products",
            {
              title: `Test fixture 3`,
              options: [
                { title: "size", values: ["large", "small"] },
                { title: "color", values: ["green"] },
              ],
              variants: [
                {
                  title: "Test variant 3",
                  sku: "test-variant-3",
                  inventory_items: [
                    {
                      inventory_item_id: inventoryItemOverride3.id,
                      required_quantity: 1,
                    },
                  ],
                  prices: [
                    {
                      currency_code: "usd",
                      amount: 100,
                    },
                  ],
                  options: {
                    size: "small",
                    color: "green",
                  },
                },
              ],
            },
            adminHeaders
          )
        ).data.product

        seeder = await createOrderSeeder({
          api,
          container: getContainer(),
          productOverride,
          additionalProducts: [
            { variant_id: productOverride2.variants[0].id, quantity: 1 },
            { variant_id: productOverride3.variants[0].id, quantity: 3 },
          ],
          stockChannelOverride,
          inventoryItemOverride,
        })
        order = seeder.order
        order = (await api.get(`/admin/orders/${order.id}`, adminHeaders)).data
          .order
      })

      it("should find the order querying it by number", async () => {
        const userEmail = "tony@stark-industries.com"

        const response = (
          await api.get(`/admin/orders/?q=non-existing`, adminHeaders)
        ).data

        expect(response.orders).toHaveLength(0)

        const response2 = (
          await api.get(`/admin/orders/?fields=+email&q=@stark`, adminHeaders)
        ).data

        expect(response2.orders).toHaveLength(1)
        expect(response2.orders[0].email).toEqual(userEmail)
      })

      it("should update stock levels correctly when creating partial fulfillment on an order", async () => {
        const orderItemId = order.items.find(
          (i) => i.variant_id === productOverride3.variants[0].id
        ).id

        let iitem = (
          await api.get(
            `/admin/inventory-items/${inventoryItemOverride3.id}?fields=stocked_quantity,reserved_quantity`,
            adminHeaders
          )
        ).data.inventory_item

        expect(iitem.stocked_quantity).toBe(10)
        expect(iitem.reserved_quantity).toBe(3)

        await api.post(
          `/admin/orders/${order.id}/fulfillments`,
          {
            location_id: seeder.stockLocation.id,
            items: [{ id: orderItemId, quantity: 1 }],
          },
          adminHeaders
        )

        iitem = (
          await api.get(
            `/admin/inventory-items/${inventoryItemOverride3.id}?fields=stocked_quantity,reserved_quantity`,
            adminHeaders
          )
        ).data.inventory_item

        expect(iitem.stocked_quantity).toBe(9)
        expect(iitem.reserved_quantity).toBe(2)

        await api.post(
          `/admin/orders/${order.id}/fulfillments`,
          {
            location_id: seeder.stockLocation.id,
            items: [{ id: orderItemId, quantity: 1 }],
          },
          adminHeaders
        )

        iitem = (
          await api.get(
            `/admin/inventory-items/${inventoryItemOverride3.id}?fields=stocked_quantity,reserved_quantity`,
            adminHeaders
          )
        ).data.inventory_item

        expect(iitem.stocked_quantity).toBe(8)
        expect(iitem.reserved_quantity).toBe(1)

        const {
          data: { order: fulfillableOrder },
        } = await api.post(
          `/admin/orders/${order.id}/fulfillments?fields=fulfillments.id`,
          {
            location_id: seeder.stockLocation.id,
            items: [{ id: orderItemId, quantity: 1 }],
          },
          adminHeaders
        )

        expect(fulfillableOrder.fulfillments).toHaveLength(3)

        iitem = (
          await api.get(
            `/admin/inventory-items/${inventoryItemOverride3.id}?fields=stocked_quantity,reserved_quantity`,
            adminHeaders
          )
        ).data.inventory_item

        expect(iitem.stocked_quantity).toBe(7)
        expect(iitem.reserved_quantity).toBe(0)
      })

      it("should throw if trying to fulfillment more items than it is reserved", async () => {
        const orderItemId = order.items.find(
          (i) => i.variant_id === productOverride3.variants[0].id
        ).id

        const res = await api
          .post(
            `/admin/orders/${order.id}/fulfillments`,
            {
              location_id: seeder.stockLocation.id,
              items: [{ id: orderItemId, quantity: 5 }],
            },
            adminHeaders
          )
          .catch((e) => e)

        expect(res.response.status).toBe(400)
        expect(res.response.data.message).toBe(
          `Quantity to fulfill exceeds the reserved quantity for the item: ${orderItemId}`
        )
      })

      it("should only create fulfillments grouped by shipping requirement", async () => {
        const {
          response: { data },
        } = await api
          .post(
            `/admin/orders/${order.id}/fulfillments`,
            {
              location_id: seeder.stockLocation.id,
              items: [
                {
                  id: order.items[0].id,
                  quantity: 1,
                },
                {
                  id: order.items[1].id,
                  quantity: 1,
                },
              ],
            },
            adminHeaders
          )
          .catch((e) => e)

        expect(data).toEqual({
          type: "invalid_data",
          message: `Fulfillment can only be created entirely with items with shipping or items without shipping. Split this request into 2 fulfillments.`,
        })

        const {
          data: { order: fulfillableOrder },
        } = await api.post(
          `/admin/orders/${order.id}/fulfillments?fields=+fulfillments.id,fulfillments.requires_shipping`,
          {
            location_id: seeder.stockLocation.id,
            items: [{ id: order.items[0].id, quantity: 1 }],
          },
          adminHeaders
        )

        expect(fulfillableOrder.fulfillments).toHaveLength(1)

        const {
          data: { order: fulfillableOrder2 },
        } = await api.post(
          `/admin/orders/${order.id}/fulfillments?fields=+fulfillments.id,fulfillments.requires_shipping`,
          {
            location_id: seeder.stockLocation.id,
            items: [{ id: order.items[1].id, quantity: 1 }],
          },
          adminHeaders
        )

        expect(fulfillableOrder2.fulfillments).toHaveLength(2)
      })
    })

    describe("POST /orders/:id/fulfillments/:id/mark-as-delivered", () => {
      beforeEach(async () => {
        seeder = await createOrderSeeder({ api, container: getContainer() })
        order = seeder.order
        order = (await api.get(`/admin/orders/${order.id}`, adminHeaders)).data
          .order
      })

      it("should mark fulfillable item as delivered", async () => {
        let fulfillableItem = order.items.find(
          (item) => item.detail.fulfilled_quantity < item.detail.quantity
        )

        await api.post(
          `/admin/orders/${order.id}/fulfillments`,
          {
            location_id: seeder.stockLocation.id,
            items: [
              {
                id: fulfillableItem.id,
                quantity: 1,
              },
            ],
          },
          adminHeaders
        )

        order = (await api.get(`/admin/orders/${order.id}`, adminHeaders)).data
          .order

        expect(order.items[0].detail).toEqual(
          expect.objectContaining({
            fulfilled_quantity: 1,
            delivered_quantity: 0,
          })
        )

        await api.post(
          `/admin/orders/${order.id}/fulfillments/${order.fulfillments[0].id}/mark-as-delivered`,
          {},
          adminHeaders
        )

        order = (await api.get(`/admin/orders/${order.id}`, adminHeaders)).data
          .order

        expect(order.items[0].detail).toEqual(
          expect.objectContaining({
            fulfilled_quantity: 1,
            delivered_quantity: 1,
          })
        )

        const { response } = await api
          .post(
            `/admin/orders/${order.id}/fulfillments/${order.fulfillments[0].id}/mark-as-delivered`,
            {},
            adminHeaders
          )
          .catch((e) => e)

        expect(response.data).toEqual({
          type: "not_allowed",
          message: "Fulfillment has already been marked delivered",
        })
      })
    })
  },
})
