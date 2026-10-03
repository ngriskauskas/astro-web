import { http, HttpResponse } from "msw";
import { API_URL } from "../mocks";
import { override } from "./setup";

export interface Sent {
  body: unknown;
  id?: string;
}

type Method = "put" | "post" | "delete";

// These can be called before or after the page is rendered.

// Records what the app sends to one endpoint. It answers nothing itself, so the
// request goes on to the scenario's handler and gets the usual response.
export const capture = (method: Method, path: string) => {
  const sent: Sent[] = [];
  override(
    http[method](`${API_URL}${path}`, async ({ request, params }) => {
      const text = await request.clone().text();
      sent.push({ body: text ? JSON.parse(text) : null, id: params.id as string | undefined });
    }),
  );
  return sent;
};

// Makes one endpoint reject, the way the backend reports a failure.
export const reject = (method: Method, path: string, error = "Request failed") =>
  override(
    http[method](`${API_URL}${path}`, () => HttpResponse.json({ error }, { status: 422 })),
  );

// Holds responses from one endpoint until release() is called, then lets the usual
// handler answer. With `once`, only the first request is held, which makes it arrive
// after the ones that follow it.
export const hold = (method: Method, path: string, { once = false } = {}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  override(
    http[method](
      `${API_URL}${path}`,
      async () => {
        await gate;
      },
      { once },
    ),
  );
  return { release };
};
