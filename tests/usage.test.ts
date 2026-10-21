import { describe, expect, mock, test } from "bun:test";

let failure: "throw" | "query" | null = null;
mock.module("@tanstack/react-router", () => ({ createFileRoute: () => (options: unknown) => options }));
mock.module("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: () => {
      if (failure === "throw") throw new Error("Missing server configuration");
      const query = {
        select: () => query,
        eq: () => query,
        maybeSingle: async () => ({ data: failure ? null : { count: 2 }, error: failure === "query" ? { message: "Unavailable" } : null }),
      };
      return query;
    },
  },
}));

const { Route } = await import("../src/routes/api/public/usage");
const handler = (Route as unknown as { server: { handlers: { GET: (args: { request: Request }) => Promise<Response> } } }).server.handlers.GET;
const request = () => new Request("http://localhost:8080/api/public/usage?deviceId=0cbe3c7d-609c-4761-a9c1-56f47963fde0", { headers: { origin: "http://localhost:8080" } });

describe("advisory usage availability", () => {
  for (const mode of ["throw", "query"] as const) {
    test(`${mode} failure does not crash or invent an allowance`, async () => {
      failure = mode;
      const response = await handler({ request: request() });
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ available: false });
      expect(response.headers.get("cache-control")).toBe("no-store");
    });
  }
  test("successful reads retain the real usage count", async () => {
    failure = null;
    const response = await handler({ request: request() });
    expect(response.status).toBe(200);
    expect((await response.json()).used).toBe(2);
  });
});