import { POST, GET } from "../../api/hooks/peptech-commerce-tick/route"
import { commerceTick } from "../commerce/worker"

jest.mock("../commerce/worker", () => ({
  commerceTick: jest.fn().mockResolvedValue(undefined),
}))

describe("peptech-commerce-tick route", () => {
  const originalSecret = process.env.COMMERCE_CRON_SECRET

  beforeEach(() => {
    process.env.COMMERCE_CRON_SECRET = "test_cron_secret_12345"
  })

  afterAll(() => {
    process.env.COMMERCE_CRON_SECRET = originalSecret
  })

  it("rejects unauthorized POST without valid secret", async () => {
    const req: any = {
      headers: {},
      query: {},
    }
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await POST(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Unauthorized" })
    )
  })

  it("accepts authorized GET with header x-cron-secret", async () => {
    const req: any = {
      headers: { "x-cron-secret": "test_cron_secret_12345" },
      query: {},
      scope: {
        resolve: jest.fn(),
      },
    }
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await GET(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: expect.any(String) })
    )
  })

  it("accepts authorized POST with secret query parameter", async () => {
    const req: any = {
      headers: {},
      query: { secret: "test_cron_secret_12345" },
      scope: {
        resolve: jest.fn(),
      },
    }
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await POST(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: expect.any(String) })
    )
  })

  it("accepts authorized POST with Bearer authorization header", async () => {
    const req: any = {
      headers: { authorization: "Bearer test_cron_secret_12345" },
      query: {},
      scope: {
        resolve: jest.fn(),
      },
    }
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }

    await POST(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: expect.any(String) })
    )
  })
})
