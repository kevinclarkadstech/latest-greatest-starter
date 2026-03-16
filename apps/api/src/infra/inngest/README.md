# Inngest

Built on [`inngest`](https://www.inngest.com/docs/getting-started/nodejs-quick-start). Inngest lets you write durable background functions triggered by events — retries, delays, and step coordination are handled automatically.

## Serve endpoint

```
POST/PUT/GET http://localhost:3000/api/inngest
```

The `serve()` handler registers this route automatically. Inngest's dev server and cloud platform communicate with your API through it.

---

## Files

| File | Description |
|---|---|
| `client.ts` | Inngest client singleton — import this wherever you send events. |
| `functions.ts` | All Inngest functions — register new ones here and pass them to `serve()` in `app.ts`. |

---

## Adding a function

Define functions in `functions.ts` using `inngest.createFunction`:

```ts
import { inngest } from "./client";

export const myFunction = inngest.createFunction(
  { id: "my-function" },
  { event: "my/event.name" },
  async ({ event, step }) => {
    await step.sleep("wait", "5s");
    return { done: true };
  }
);
```

Then register it in `app.ts`:

```ts
import { myFunction } from "./infra/inngest/functions";

server.route(serve({ client: inngest, functions: [helloWorld, myFunction] }));
```

---

## Sending events

Import the client and call `inngest.send()` from any tRPC router, REST route, or background job:

```ts
import { inngest } from "../infra/inngest/client";

await inngest.send({
  name: "demo/hello.world",
  data: { email: "user@example.com" },
});
```

---

## Running locally

Start the API dev server, then in a separate terminal run the Inngest dev server:

```bash
npx inngest-cli@latest dev
```

Open [http://localhost:8288](http://localhost:8288) to inspect runs, replay events, and trigger test events manually.
