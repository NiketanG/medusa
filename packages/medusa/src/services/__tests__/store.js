import { IdMap, MockManager, MockRepository } from "medusa-test-utils"
import StoreService from "../store"

describe("StoreService", () => {
  describe("create", () => {
    const storeRepository = MockRepository({})
    const currencyRepository = MockRepository({
      findOne: () => Promise.resolve({ code: "usd" }),
    })

    const storeService = new StoreService({
      manager: MockManager,
      storeRepository,
      currencyRepository,
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("successfully creates store with default currency", async () => {
      await storeService.create()

      expect(storeRepository.create).toHaveBeenCalledTimes(1)
      expect(storeRepository.save).toHaveBeenCalledTimes(1)
      expect(currencyRepository.findOne).toHaveBeenCalledTimes(1)

      expect(storeRepository.save).toHaveBeenCalledWith({
        currencies: [{ code: "usd" }],
      })
    })
  })

  describe("retrieve", () => {
    const storeRepository = MockRepository({})

    const storeService = new StoreService({
      manager: MockManager,
      storeRepository,
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("successfully retrieve store", async () => {
      await storeService.retrieve()

      expect(storeRepository.findOne).toHaveBeenCalledTimes(1)
    })
  })

  describe("update", () => {
    const storeRepository = MockRepository({
      findOne: () =>
        Promise.resolve({ id: IdMap.getId("store"), name: "Medusa" }),
    })

    const currencyRepository = MockRepository({})

    const storeService = new StoreService({
      manager: MockManager,
      storeRepository,
      currencyRepository,
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("successfully updates store", async () => {
      await storeService.update({
        name: "Medusa Commerce",
      })

      expect(storeRepository.findOne).toHaveBeenCalledTimes(1)

      expect(storeRepository.save).toHaveBeenCalledTimes(1)
      expect(storeRepository.save).toHaveBeenCalledWith({
        id: IdMap.getId("store"),
        name: "Medusa Commerce",
      })
    })

    it("fails if currency not ok", async () => {
      await expect(
        storeService.update({
          currencies: ["1cd"],
        })
      ).rejects.toThrow("Invalid currency 1cd")

      expect(storeRepository.findOne).toHaveBeenCalledTimes(1)
    })
  })

  describe("addCurrency", () => {
    const storeRepository = MockRepository({
      findOne: () =>
        Promise.resolve({
          id: IdMap.getId("store"),
          name: "Medusa",
          currencies: [{ code: "dkk" }],
        }),
    })

    const currencyRepository = MockRepository({
      findOne: (query) => {
        if (query.where.code === "sek") {
          return Promise.resolve({ code: "sek" })
        }

        if (query.where.code === "dkk") {
          return Promise.resolve({ code: "dkk" })
        }
        return Promise.resolve()
      },
    })

    const storeService = new StoreService({
      manager: MockManager,
      storeRepository,
      currencyRepository,
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("successfully adds currency", async () => {
      await storeService.addCurrency("sek")

      expect(storeRepository.findOne).toHaveBeenCalledTimes(1)

      expect(storeRepository.save).toHaveBeenCalledTimes(1)
      expect(storeRepository.save).toHaveBeenCalledWith({
        id: IdMap.getId("store"),
        name: "Medusa",
        currencies: [{ code: "dkk" }, { code: "sek" }],
      })
    })

    it("fails if currency not ok", async () => {
      await expect(storeService.addCurrency("1cd")).rejects.toThrow(
        "Currency 1cd not found"
      )

      expect(storeRepository.findOne).toHaveBeenCalledTimes(1)
    })

    it("fails if currency already existis", async () => {
      await expect(storeService.addCurrency("dkk")).rejects.toThrow(
        "Currency already added"
      )

      expect(storeRepository.findOne).toHaveBeenCalledTimes(1)
    })
  })

  describe("removeCurrency", () => {
    const storeRepository = MockRepository({
      findOne: () =>
        Promise.resolve({
          id: IdMap.getId("store"),
          name: "Medusa",
          currencies: [{ code: "dkk" }],
        }),
    })

    const currencyRepository = MockRepository({
      findOne: (query) => {
        if (query.where.code === "sek") {
          return Promise.resolve({ code: "sek" })
        }

        if (query.where.code === "dkk") {
          return Promise.resolve({ code: "dkk" })
        }
        return Promise.resolve()
      },
    })

    const storeService = new StoreService({
      manager: MockManager,
      storeRepository,
      currencyRepository,
    })

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("successfully removes currency", async () => {
      await storeService.removeCurrency("dkk")

      expect(storeRepository.findOne).toHaveBeenCalledTimes(1)

      expect(storeRepository.save).toHaveBeenCalledTimes(1)
      expect(storeRepository.save).toHaveBeenCalledWith({
        id: IdMap.getId("store"),
        currencies: [],
        name: "Medusa",
      })
    })
  })
})
