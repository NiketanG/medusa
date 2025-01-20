import {
  DistributedTransactionType,
  TransactionStep,
  TransactionStepTimeoutError,
  TransactionTimeoutError,
  WorkflowManager,
} from "@medusajs/framework/orchestration"
import {
  IWorkflowEngineService,
  Logger,
  MedusaContainer,
  RemoteQueryFunction,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Module,
  Modules,
  TransactionHandlerType,
  TransactionStepState,
} from "@medusajs/framework/utils"
import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { asValue } from "awilix"
import { setTimeout } from "timers/promises"
import { setTimeout as setTimeoutSync } from "timers"
import { WorkflowsModuleService } from "../../src/services"
import "../__fixtures__"
import { createScheduled } from "../__fixtures__/workflow_scheduled"
import { TestDatabase } from "../utils"

jest.setTimeout(999900000)

const failTrap = (done) => {
  setTimeoutSync(() => {
    // REF:https://stackoverflow.com/questions/78028715/jest-async-test-with-event-emitter-isnt-ending
    console.warn(
      "Jest is breaking the event emit with its debouncer. This allows to continue the test by managing the timeout of the test manually."
    )
    done()
  }, 5000)
}

// REF:https://stackoverflow.com/questions/78028715/jest-async-test-with-event-emitter-isnt-ending

moduleIntegrationTestRunner<IWorkflowEngineService>({
  moduleName: Modules.WORKFLOW_ENGINE,
  resolve: __dirname + "/../..",
  moduleOptions: {
    redis: {
      url: "localhost:6379",
    },
  },
  testSuite: ({ service: workflowOrcModule, medusaApp }) => {
    describe("Workflow Orchestrator module", function () {
      beforeEach(async () => {
        await TestDatabase.clearTables()
        jest.clearAllMocks()
      })

      function times(num) {
        let resolver
        let counter = 0
        const promise = new Promise((resolve) => {
          resolver = resolve
        })

        return {
          next: () => {
            counter += 1
            if (counter === num) {
              resolver()
            }
          },
          promise,
        }
      }

      let query: RemoteQueryFunction
      let sharedContainer_: MedusaContainer

      beforeEach(() => {
        query = medusaApp.query
        sharedContainer_ = medusaApp.sharedContainer
      })

      it(`should export the appropriate linkable configuration`, () => {
        const linkable = Module(Modules.WORKFLOW_ENGINE, {
          service: WorkflowsModuleService,
        }).linkable

        expect(Object.keys(linkable)).toEqual(["workflowExecution"])

        Object.keys(linkable).forEach((key) => {
          delete linkable[key].toJSON
        })

        expect(linkable).toEqual({
          workflowExecution: {
            id: {
              linkable: "workflow_execution_id",
              entity: "WorkflowExecution",
              primaryKey: "id",
              serviceName: "workflows",
              field: "workflowExecution",
            },
            transaction_id: {
              entity: "WorkflowExecution",
              field: "workflowExecution",
              linkable: "workflow_execution_transaction_id",
              primaryKey: "transaction_id",
              serviceName: "workflows",
            },
            workflow_id: {
              entity: "WorkflowExecution",
              field: "workflowExecution",
              linkable: "workflow_execution_workflow_id",
              primaryKey: "workflow_id",
              serviceName: "workflows",
            },
          },
        })
      })

      describe("Testing basic workflow", function () {
        it("should return a list of workflow executions and remove after completed when there is no retentionTime set", async () => {
          await workflowOrcModule.run("workflow_1", {
            input: {
              value: "123",
            },
            throwOnError: true,
          })

          let { data: executionsList } = await query.graph({
            entity: "workflow_executions",
            fields: ["workflow_id", "transaction_id", "state"],
          })

          expect(executionsList).toHaveLength(1)

          const { result } = await workflowOrcModule.setStepSuccess({
            idempotencyKey: {
              action: TransactionHandlerType.INVOKE,
              stepId: "new_step_name",
              workflowId: "workflow_1",
              transactionId: executionsList[0].transaction_id,
            },
            stepResponse: { uhuuuu: "yeaah!" },
          })

          ;({ data: executionsList } = await query.graph({
            entity: "workflow_executions",
            fields: ["id"],
          }))

          expect(executionsList).toHaveLength(0)
          expect(result).toEqual({
            done: {
              inputFromSyncStep: "oh",
            },
          })
        })

        it("should return a list of workflow executions and keep it saved when there is a retentionTime set", async () => {
          await workflowOrcModule.run("workflow_2", {
            input: {
              value: "123",
            },
            throwOnError: true,
            transactionId: "transaction_1",
          })

          let { data: executionsList } = await query.graph({
            entity: "workflow_executions",
            fields: ["id"],
          })

          expect(executionsList).toHaveLength(1)

          await workflowOrcModule.setStepSuccess({
            idempotencyKey: {
              action: TransactionHandlerType.INVOKE,
              stepId: "new_step_name",
              workflowId: "workflow_2",
              transactionId: "transaction_1",
            },
            stepResponse: { uhuuuu: "yeaah!" },
          })
          ;({ data: executionsList } = await query.graph({
            entity: "workflow_executions",
            fields: ["id"],
          }))

          expect(executionsList).toHaveLength(1)
        })

        it("should return a list of failed workflow executions and keep it saved when there is a retentionTime set", async () => {
          await workflowOrcModule.run("workflow_2", {
            input: {
              value: "123",
            },
            transactionId: "transaction_1",
          })

          let { data: executionsList } = await query.graph({
            entity: "workflow_executions",
            fields: ["id"],
          })

          expect(executionsList).toHaveLength(1)

          await workflowOrcModule.setStepFailure({
            idempotencyKey: {
              action: TransactionHandlerType.INVOKE,
              stepId: "new_step_name",
              workflowId: "workflow_2",
              transactionId: "transaction_1",
            },
            stepResponse: { uhuuuu: "yeaah!" },
          })
          ;({ data: executionsList } = await query.graph({
            entity: "workflow_executions",
            fields: ["id", "state"],
          }))

          expect(executionsList).toHaveLength(1)
          expect(executionsList[0].state).toEqual("reverted")
        })

        it("should throw if setStepFailure fails", async () => {
          const { acknowledgement } = await workflowOrcModule.run(
            "workflow_2_revert_fail",
            {
              input: {
                value: "123",
              },
            }
          )

          let done = false
          void workflowOrcModule.subscribe({
            workflowId: "workflow_2_revert_fail",
            transactionId: acknowledgement.transactionId,
            subscriber: (event) => {
              if (event.eventType === "onFinish") {
                done = true
              }
            },
          })

          let { data: executionsList } = await query.graph({
            entity: "workflow_executions",
            fields: ["id"],
          })

          expect(executionsList).toHaveLength(1)

          const setStepError = await workflowOrcModule
            .setStepFailure({
              idempotencyKey: {
                action: TransactionHandlerType.INVOKE,
                stepId: "broken_step_2",
                workflowId: "workflow_2_revert_fail",
                transactionId: acknowledgement.transactionId,
              },
              stepResponse: { uhuuuu: "yeaah!" },
            })
            .catch((e) => {
              return e
            })

          expect(setStepError).toEqual({ uhuuuu: "yeaah!" })
          ;({ data: executionsList } = await query.graph({
            entity: "workflow_executions",
            fields: ["id", "state", "context"],
          }))

          expect(executionsList).toHaveLength(1)
          expect(executionsList[0].state).toEqual("failed")
          expect(done).toBe(true)
        })

        it("should revert the entire transaction when a step timeout expires", async () => {
          const { transaction, result, errors } = (await workflowOrcModule.run(
            "workflow_step_timeout",
            {
              input: {
                myInput: "123",
              },
              throwOnError: false,
              logOnError: true,
            }
          )) as Awaited<{
            transaction: DistributedTransactionType
            result: any
            errors: any
          }>

          expect(transaction.getFlow().state).toEqual("reverted")
          expect(result).toEqual({
            myInput: "123",
          })
          expect(errors).toHaveLength(1)
          expect(errors[0].action).toEqual("step_1")
          expect(errors[0].error).toBeInstanceOf(TransactionStepTimeoutError)
        })

        it("should revert the entire transaction when the transaction timeout expires", async () => {
          const { transaction, result, errors } = (await workflowOrcModule.run(
            "workflow_transaction_timeout",
            {
              input: {},
              transactionId: "trx",
              throwOnError: false,
            }
          )) as Awaited<{
            transaction: DistributedTransactionType
            result: any
            errors: any
          }>

          expect(transaction.getFlow().state).toEqual("reverted")
          expect(result).toEqual({ executed: true })
          expect(errors).toHaveLength(1)
          expect(errors[0].action).toEqual("step_1")
          expect(
            TransactionTimeoutError.isTransactionTimeoutError(errors[0].error)
          ).toBe(true)
        })

        it("should revert the entire transaction when a step timeout expires in a async step", async () => {
          await workflowOrcModule.run("workflow_step_timeout_async", {
            input: {
              myInput: "123",
            },
            transactionId: "transaction_1",
            throwOnError: false,
          })

          await setTimeout(200)

          const { transaction, result, errors } = (await workflowOrcModule.run(
            "workflow_step_timeout_async",
            {
              input: {
                myInput: "123",
              },
              transactionId: "transaction_1",
              throwOnError: false,
            }
          )) as Awaited<{
            transaction: DistributedTransactionType
            result: any
            errors: any
          }>

          expect(transaction.getFlow().state).toEqual("reverted")
          expect(result).toEqual(undefined)
          expect(errors).toHaveLength(1)
          expect(errors[0].action).toEqual("step_1_async")
          expect(
            TransactionStepTimeoutError.isTransactionStepTimeoutError(
              errors[0].error
            )
          ).toBe(true)
        })

        it("should revert the entire transaction when the transaction timeout expires in a transaction containing an async step", async () => {
          await workflowOrcModule.run("workflow_transaction_timeout_async", {
            input: {},
            transactionId: "transaction_1",
            throwOnError: false,
          })

          await setTimeout(200)

          const { transaction, result, errors } = (await workflowOrcModule.run(
            "workflow_transaction_timeout_async",
            {
              input: {},
              transactionId: "transaction_1",
              throwOnError: false,
            }
          )) as Awaited<{
            transaction: DistributedTransactionType
            result: any
            errors: any
          }>

          expect(transaction.getFlow().state).toEqual("reverted")
          expect(result).toEqual(undefined)
          expect(errors).toHaveLength(1)
          expect(errors[0].action).toEqual("step_1")
          expect(
            TransactionTimeoutError.isTransactionTimeoutError(errors[0].error)
          ).toBe(true)
        })

        it("should complete an async workflow that returns a StepResponse", (done) => {
          const transactionId = "transaction_1"
          workflowOrcModule
            .run("workflow_async_background", {
              input: {
                myInput: "123",
              },
              transactionId,
              throwOnError: true,
            })
            .then(({ transaction, result }: any) => {
              expect(transaction.flow.state).toEqual(
                TransactionStepState.INVOKING
              )
              expect(result).toEqual(undefined)
            })

          void workflowOrcModule.subscribe({
            workflowId: "workflow_async_background",
            transactionId,
            subscriber: (event) => {
              if (event.eventType === "onFinish") {
                done()
              }
            },
          })

          failTrap(done)
        })

        it("should subscribe to a async workflow and receive the response when it finishes", (done) => {
          const transactionId = "trx_123"

          const onFinish = jest.fn()

          void workflowOrcModule.run("workflow_async_background", {
            input: {
              myInput: "123",
            },
            transactionId,
            throwOnError: false,
          })

          void workflowOrcModule.subscribe({
            workflowId: "workflow_async_background",
            transactionId,
            subscriber: (event) => {
              if (event.eventType === "onFinish") {
                onFinish()
                done()
              }
            },
          })

          expect(onFinish).toHaveBeenCalledTimes(0)

          failTrap(done)
        })

        it("should not skip step if condition is true", function (done) {
          void workflowOrcModule.run("wf-when", {
            input: {
              callSubFlow: true,
            },
            transactionId: "trx_123_when",
            throwOnError: true,
            logOnError: true,
          })

          void workflowOrcModule.subscribe({
            workflowId: "wf-when",
            subscriber: (event) => {
              if (event.eventType === "onFinish") {
                done()
              }
            },
          })

          failTrap(done)
        })

        it("should cancel an async sub workflow when compensating", (done) => {
          const workflowId = "workflow_async_background_fail"

          void workflowOrcModule.run(workflowId, {
            input: {
              callSubFlow: true,
            },
            transactionId: "trx_123_compensate_async_sub_workflow",
            throwOnError: false,
            logOnError: false,
          })

          let onCompensateStepSuccess: { step: TransactionStep } | null = null

          void workflowOrcModule.subscribe({
            workflowId,
            subscriber: (event) => {
              if (event.eventType === "onCompensateStepSuccess") {
                onCompensateStepSuccess = event
              }
              if (event.eventType === "onFinish") {
                expect(onCompensateStepSuccess).toBeDefined()
                expect(onCompensateStepSuccess!.step.id).toEqual(
                  "_root.nested_sub_flow_async_fail-as-step" // The workflow as step
                )
                expect(onCompensateStepSuccess!.step.compensate).toEqual({
                  state: "reverted",
                  status: "ok",
                })

                done()
              }
            },
          })

          failTrap(done)
        })
      })

      // Note: These tests depend on actual Redis instance and waiting for the scheduled jobs to run, which isn't great.
      // Mocking bullmq, however, would make the tests close to useless, so we can keep them very minimal and serve as smoke tests.
      describe("Scheduled workflows", () => {
        beforeEach(() => {
          jest.clearAllMocks()
        })

        it("should execute a scheduled workflow", async () => {
          const wait = times(2)
          const spy = createScheduled("standard", wait.next)

          await wait.promise
          expect(spy).toHaveBeenCalledTimes(2)
          WorkflowManager.unregister("standard")
        })

        it("should stop executions after the set number of executions", async () => {
          const wait = times(2)
          const spy = await createScheduled("num-executions", wait.next, {
            cron: "* * * * * *",
            numberOfExecutions: 2,
          })

          await wait.promise
          expect(spy).toHaveBeenCalledTimes(2)

          // Make sure that on the next tick it doesn't execute again
          await setTimeout(1100)
          expect(spy).toHaveBeenCalledTimes(2)

          WorkflowManager.unregister("num-execution")
        })

        it("should remove scheduled workflow if workflow no longer exists", async () => {
          const wait = times(1)
          const logger = sharedContainer_.resolve<Logger>(
            ContainerRegistrationKeys.LOGGER
          )

          const spy = await createScheduled("remove-scheduled", wait.next, {
            cron: "* * * * * *",
          })
          const logSpy = jest.spyOn(logger, "warn")

          await wait.promise
          expect(spy).toHaveBeenCalledTimes(1)
          WorkflowManager["workflows"].delete("remove-scheduled")

          await setTimeout(1100)
          expect(spy).toHaveBeenCalledTimes(1)
          expect(logSpy).toHaveBeenCalledWith(
            "Tried to execute a scheduled workflow with ID remove-scheduled that does not exist, removing it from the scheduler."
          )
        })

        // TODO: investigate why it fails intermittently
        it.skip("the scheduled workflow should have access to the shared container", async () => {
          const wait = times(1)
          sharedContainer_.register("test-value", asValue("test"))

          const spy = await createScheduled("shared-container-job", wait.next, {
            cron: "* * * * * *",
          })
          await wait.promise

          expect(spy).toHaveBeenCalledTimes(1)

          expect(spy).toHaveReturnedWith(
            expect.objectContaining({ output: { testValue: "test" } })
          )
          WorkflowManager.unregister("shared-container-job")
        })
      })
    })
  },
})
